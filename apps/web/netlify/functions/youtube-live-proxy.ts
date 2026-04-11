// netlify/functions/youtube-live-proxy.ts
// Server-side proxy that fetches YouTube live streams WITHOUT using the Data API quota.
// Uses YouTube's internal browse/search endpoint (youtubei/v1) to find currently live streams.
import type { Handler, HandlerEvent } from "@netlify/functions";

const YOUTUBE_SEARCH_URL = "https://www.youtube.com/youtubei/v1/search";

// YouTube client context — pretends to be a regular web browser
const INNERTUBE_CONTEXT = {
    client: {
        clientName: "WEB",
        clientVersion: "2.20240101.00.00",
        hl: "en",
        gl: "US",
    },
};

interface LiveStreamResult {
    videoId: string;
    title: string;
    channelName: string;
    channelId: string;
    channelThumbnail: string;
    thumbnail: string;
    viewers: number;
    isLive: boolean;
}

// Parses the deeply nested YouTube response to extract live stream data
function parseSearchResponse(data: any): LiveStreamResult[] {
    const results: LiveStreamResult[] = [];

    try {
        // Navigate the nested YouTube response structure
        const contents =
            data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
                ?.sectionListRenderer?.contents || [];

        for (const section of contents) {
            const items = section?.itemSectionRenderer?.contents || [];
            for (const item of items) {
                const renderer =
                    item?.videoRenderer;
                if (!renderer) continue;

                // Check if this is a live stream
                const badges = renderer?.badges || [];
                const ownerBadges = renderer?.ownerBadges || [];
                const isLive =
                    badges.some(
                        (b: any) =>
                            b?.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW" ||
                            b?.metadataBadgeRenderer?.label?.toLowerCase()?.includes("live")
                    ) ||
                    renderer?.thumbnailOverlays?.some(
                        (o: any) =>
                            o?.thumbnailOverlayTimeStatusRenderer?.style === "LIVE"
                    );

                if (!isLive) continue;

                // Extract viewer count from viewCountText
                let viewers = 0;
                const viewText =
                    renderer?.viewCountText?.simpleText ||
                    renderer?.viewCountText?.runs?.map((r: any) => r.text).join("") ||
                    "";
                const viewMatch = viewText.replace(/,/g, "").match(/(\d+)/);
                if (viewMatch) {
                    viewers = parseInt(viewMatch[1], 10);
                }
                // Handle "1.2K watching" format
                if (viewText.toLowerCase().includes("k")) {
                    const kMatch = viewText.match(/([\d.]+)\s*k/i);
                    if (kMatch) viewers = Math.round(parseFloat(kMatch[1]) * 1000);
                }

                // Extract thumbnail - get highest quality
                const thumbnails = renderer?.thumbnail?.thumbnails || [];
                const thumbnail =
                    thumbnails[thumbnails.length - 1]?.url || thumbnails[0]?.url || "";

                // Extract channel thumbnail
                const channelThumbs =
                    renderer?.channelThumbnailSupportedRenderers
                        ?.channelThumbnailWithLinkRenderer?.thumbnail?.thumbnails || [];
                const channelThumbnail =
                    channelThumbs[channelThumbs.length - 1]?.url || channelThumbs[0]?.url || "";

                const title =
                    renderer?.title?.runs?.map((r: any) => r.text).join("") ||
                    renderer?.title?.simpleText ||
                    "";
                const channelName =
                    renderer?.ownerText?.runs?.[0]?.text ||
                    renderer?.shortBylineText?.runs?.[0]?.text ||
                    "";
                const channelId =
                    renderer?.ownerText?.runs?.[0]?.navigationEndpoint
                        ?.browseEndpoint?.browseId ||
                    renderer?.shortBylineText?.runs?.[0]?.navigationEndpoint
                        ?.browseEndpoint?.browseId ||
                    "";

                if (renderer?.videoId && title) {
                    results.push({
                        videoId: renderer.videoId,
                        title,
                        channelName,
                        channelId,
                        channelThumbnail,
                        thumbnail,
                        viewers,
                        isLive: true,
                    });
                }
            }
        }
    } catch (e) {
        console.error("[youtube-live-proxy] Parse error:", e);
    }

    return results;
}

const handler: Handler = async (event: HandlerEvent) => {
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    // Search queries to discover diverse live streams
    const queries = [
        "live",
        "live stream gaming",
        "live music",
        "live news",
        "live sports",
    ];

    const query = event.queryStringParameters?.q || queries[0];
    const region = event.queryStringParameters?.region || "US";
    const lang = event.queryStringParameters?.lang || "en";

    try {
        const body = JSON.stringify({
            context: {
                client: {
                    ...INNERTUBE_CONTEXT.client,
                    hl: lang,
                    gl: region,
                },
            },
            query,
            params: "EgJAAQ%3D%3D", // Filter: Live streams only
        });

        const response = await fetch(YOUTUBE_SEARCH_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Origin: "https://www.youtube.com",
                Referer: "https://www.youtube.com/",
            },
            body,
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[youtube-live-proxy] YouTube API error:", response.status, errText.slice(0, 200));
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `YouTube returned ${response.status}` }),
                headers: { "Content-Type": "application/json" },
            };
        }

        const data = await response.json();
        const streams = parseSearchResponse(data);

        return {
            statusCode: 200,
            body: JSON.stringify({ streams, count: streams.length, query }),
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=120", // Cache 2 minutes
                "Access-Control-Allow-Origin": "*",
            },
        };
    } catch (error: any) {
        console.error("[youtube-live-proxy] Error:", error);
        return {
            statusCode: 502,
            body: JSON.stringify({
                error: "Failed to reach YouTube",
                details: error.message,
            }),
            headers: { "Content-Type": "application/json" },
        };
    }
};

export { handler };
