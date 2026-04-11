// YouTube Live Stream Discovery
// Primary: YouTube's internal browsing API (no quota, no API key needed)
// Enrichment: YouTube Data API v3 (for viewer counts, channel details)
// Cache: localStorage with TTL for resilience
import { StreamChannel, PlatformType } from "../data/mockData";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";
const INNERTUBE_SEARCH_URL = "https://www.youtube.com/youtubei/v1/search?prettyPrint=false";
const CACHE_KEY = "yt_live_streams_cache";
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

interface YouTubeVideoItem {
    id: string;
    liveStreamingDetails?: {
        concurrentViewers?: string;
    };
    snippet?: {
        categoryId?: string;
        tags?: string[];
    };
}

interface YouTubeChannelItem {
    id: string;
    statistics?: {
        subscriberCount?: string;
    };
    snippet?: {
        thumbnails?: {
            default?: { url: string };
        };
        description?: string;
    };
}

// Maps YouTube category IDs to our categories
const YOUTUBE_CATEGORY_MAP: Record<string, { name: string; slug: string }> = {
    "1": { name: "Film & Animation", slug: "art" },
    "2": { name: "Autos & Vehicles", slug: "irl" },
    "10": { name: "Music", slug: "music" },
    "15": { name: "Pets & Animals", slug: "irl" },
    "17": { name: "Sports", slug: "sports" },
    "20": { name: "Gaming", slug: "gta-v" },
    "22": { name: "People & Blogs", slug: "just-chatting" },
    "23": { name: "Comedy", slug: "comedy" },
    "24": { name: "Entertainment", slug: "just-chatting" },
    "25": { name: "News & Politics", slug: "podcasts" },
    "26": { name: "Howto & Style", slug: "cooking" },
    "27": { name: "Education", slug: "education" },
    "28": { name: "Science & Technology", slug: "programming" },
};

// Diverse search queries targetting different live content verticals
const LIVE_SEARCH_QUERIES = [
    "live",
    "live stream gaming",
    "live music concert",
    "live news today",
    "live sports stream",
];

// ──────────────────────────────────────────────────────────
// Innertube (internal YouTube API) — zero quota, no API key
// ──────────────────────────────────────────────────────────

interface InnertubeStreamResult {
    videoId: string;
    title: string;
    channelName: string;
    channelId: string;
    channelThumbnail: string;
    thumbnail: string;
    viewers: number;
}

function getUserRegionCode(): string {
    try {
        const locale = navigator.language || "en-US";
        const parts = locale.split("-");
        return parts.length > 1 ? parts[1].toUpperCase() : "US";
    } catch {
        return "US";
    }
}

function getUserLanguage(): string {
    try {
        return (navigator.language || "en").split("-")[0];
    } catch {
        return "en";
    }
}

/** Search YouTube for live streams using the internal Innertube API via our proxy */
async function innertubeSearchLive(query: string, region: string, lang: string): Promise<InnertubeStreamResult[]> {
    // Call our server-side proxy to bypass CORS
    const proxyUrl = `/api/youtube-live?q=${encodeURIComponent(query)}&region=${region}&lang=${lang}`;
    
    const res = await fetch(proxyUrl);

    if (!res.ok) {
        console.warn(`[YouTubeService][Innertube Proxy] Search "${query}" returned ${res.status}`);
        return [];
    }

    const data = await res.json();
    return data.streams || [];
}

/** Parses the deeply nested Innertube response */
function parseInnertubeResponse(data: any): InnertubeStreamResult[] {
    const results: InnertubeStreamResult[] = [];
    try {
        const contents =
            data?.contents?.twoColumnSearchResultsRenderer?.primaryContents
                ?.sectionListRenderer?.contents || [];

        for (const section of contents) {
            const items = section?.itemSectionRenderer?.contents || [];
            for (const item of items) {
                const r = item?.videoRenderer;
                if (!r) continue;

                // Verify it's live
                const isLive =
                    r.badges?.some(
                        (b: any) =>
                            b?.metadataBadgeRenderer?.style === "BADGE_STYLE_TYPE_LIVE_NOW" ||
                            b?.metadataBadgeRenderer?.label?.toLowerCase()?.includes("live")
                    ) ||
                    r.thumbnailOverlays?.some(
                        (o: any) => o?.thumbnailOverlayTimeStatusRenderer?.style === "LIVE"
                    );
                if (!isLive) continue;

                // Parse viewer count
                let viewers = 0;
                const viewText =
                    r.viewCountText?.simpleText ||
                    r.viewCountText?.runs?.map((x: any) => x.text).join("") ||
                    r.shortViewCountText?.simpleText || "";
                // Try "1,234 watching" format
                const plainMatch = viewText.replace(/,/g, "").match(/(\d+)/);
                if (plainMatch) viewers = parseInt(plainMatch[1], 10);
                // Try "1.2K watching" format
                const kMatch = viewText.match(/([\d.]+)\s*K/i);
                if (kMatch) viewers = Math.round(parseFloat(kMatch[1]) * 1000);
                const mMatch = viewText.match(/([\d.]+)\s*M/i);
                if (mMatch) viewers = Math.round(parseFloat(mMatch[1]) * 1000000);

                // Thumbnails
                const thumbs = r.thumbnail?.thumbnails || [];
                const thumbnail = thumbs[thumbs.length - 1]?.url || thumbs[0]?.url || "";

                const chThumbs =
                    r.channelThumbnailSupportedRenderers?.channelThumbnailWithLinkRenderer
                        ?.thumbnail?.thumbnails || [];
                const channelThumbnail = chThumbs[chThumbs.length - 1]?.url || chThumbs[0]?.url || "";

                const title = r.title?.runs?.map((x: any) => x.text).join("") || "";
                const channelName = r.ownerText?.runs?.[0]?.text || r.shortBylineText?.runs?.[0]?.text || "";
                const channelId =
                    r.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId ||
                    r.shortBylineText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "";

                if (r.videoId && title) {
                    results.push({ videoId: r.videoId, title, channelName, channelId, channelThumbnail, thumbnail, viewers });
                }
            }
        }
    } catch (e) {
        console.error("[YouTubeService][Innertube] Parse error:", e);
    }
    return results;
}

// ──────────────────────────────────────────────────────────
// localStorage cache
// ──────────────────────────────────────────────────────────

interface CacheEntry { streams: StreamChannel[]; timestamp: number; }

function getCachedStreams(): StreamChannel[] | null {
    try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const entry: CacheEntry = JSON.parse(raw);
        if (Date.now() - entry.timestamp > CACHE_DURATION) {
            localStorage.removeItem(CACHE_KEY);
            return null;
        }
        console.log(`[YouTubeService] Using cached data (${entry.streams.length} streams, age: ${Math.round((Date.now() - entry.timestamp) / 1000)}s)`);
        return entry.streams;
    } catch { return null; }
}

function setCachedStreams(streams: StreamChannel[]): void {
    try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({ streams, timestamp: Date.now() }));
    } catch { /* ignore */ }
}

// ──────────────────────────────────────────────────────────
// Main export
// ──────────────────────────────────────────────────────────

export async function fetchYouTubeLiveStreams(maxResults = 12): Promise<StreamChannel[]> {
    const regionCode = getUserRegionCode();
    const lang = getUserLanguage();
    console.log(`[YouTubeService] Fetching live streams (region=${regionCode}, lang=${lang})...`);

    try {
        // ──────────────────────────────────────────────────────────
        // Step 1: Discover live streams via Innertube (zero quota)
        // Run multiple diverse queries in parallel
        // ──────────────────────────────────────────────────────────
        const searchPromises = LIVE_SEARCH_QUERIES.map((q) =>
            innertubeSearchLive(q, regionCode, lang).catch((err) => {
                console.warn(`[YouTubeService] Innertube "${q}" failed:`, err);
                return [] as InnertubeStreamResult[];
            })
        );
        const searchResults = await Promise.all(searchPromises);

        // Merge + deduplicate
        const seen = new Set<string>();
        const allStreams: InnertubeStreamResult[] = [];
        searchResults.forEach((results, i) => {
            console.log(`[YouTubeService]   "${LIVE_SEARCH_QUERIES[i]}": ${results.length} live streams`);
            for (const s of results) {
                if (!seen.has(s.videoId)) {
                    seen.add(s.videoId);
                    allStreams.push(s);
                }
            }
        });

        console.log(`[YouTubeService] Total unique live streams found: ${allStreams.length}`);

        if (allStreams.length === 0) {
            console.warn("[YouTubeService] Innertube returned 0 live streams. Using cache...");
            return getCachedStreams() || [];
        }

        // Sort by viewers descending, take top N
        allStreams.sort((a, b) => b.viewers - a.viewers);
        const topStreams = allStreams.slice(0, maxResults);

        // ──────────────────────────────────────────────────────────
        // Step 2 (optional): Enrich with Data API for categories/tags
        // Only if we have an API key and quota
        // ──────────────────────────────────────────────────────────
        const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
        let videoMap = new Map<string, YouTubeVideoItem>();
        let channelMap = new Map<string, YouTubeChannelItem>();

        if (apiKey) {
            try {
                // Videos: get categories + precise viewer counts
                const videoIds = topStreams.map((s) => s.videoId).join(",");
                const videoUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
                videoUrl.searchParams.set("part", "liveStreamingDetails,snippet");
                videoUrl.searchParams.set("id", videoIds);
                videoUrl.searchParams.set("key", apiKey);

                const videoRes = await fetch(videoUrl.toString());
                if (videoRes.ok) {
                    const videoData = await videoRes.json();
                    (videoData.items || []).forEach((v: YouTubeVideoItem) => videoMap.set(v.id, v));
                } else if (videoRes.status === 403) {
                    console.warn("[YouTubeService] Data API quota exceeded — skipping enrichment.");
                }

                // Channels: get subscriber counts + avatars
                const channelIds = [...new Set(topStreams.map((s) => s.channelId).filter(Boolean))].join(",");
                if (channelIds) {
                    const channelUrl = new URL(`${YOUTUBE_API_BASE}/channels`);
                    channelUrl.searchParams.set("part", "snippet,statistics");
                    channelUrl.searchParams.set("id", channelIds);
                    channelUrl.searchParams.set("key", apiKey);

                    const channelRes = await fetch(channelUrl.toString());
                    if (channelRes.ok) {
                        const channelData = await channelRes.json();
                        (channelData.items || []).forEach((c: YouTubeChannelItem) => channelMap.set(c.id, c));
                    }
                }
            } catch (enrichErr) {
                console.warn("[YouTubeService] Data API enrichment failed (non-fatal):", enrichErr);
            }
        }

        // ──────────────────────────────────────────────────────────
        // Step 3: Build StreamChannel objects
        // ──────────────────────────────────────────────────────────
        const streams: StreamChannel[] = topStreams.map((s, idx) => {
            const videoDetails = videoMap.get(s.videoId);
            const channelDetails = channelMap.get(s.channelId);
            const categoryId = videoDetails?.snippet?.categoryId || "24";
            const category = YOUTUBE_CATEGORY_MAP[categoryId] || { name: "Entertainment", slug: "just-chatting" };

            // Prefer Data API viewer count (more precise), fall back to Innertube
            const viewers = videoDetails?.liveStreamingDetails?.concurrentViewers
                ? parseInt(videoDetails.liveStreamingDetails.concurrentViewers, 10)
                : s.viewers;

            const followers = parseInt(channelDetails?.statistics?.subscriberCount || "0", 10);
            const avatar =
                channelDetails?.snippet?.thumbnails?.default?.url ||
                s.channelThumbnail ||
                `https://api.dicebear.com/9.x/adventurer/svg?seed=yt-${idx}`;

            const tags = (videoDetails?.snippet?.tags || []).slice(0, 3);

            return {
                id: `yt-live-${s.videoId}`,
                username: `yt-${s.channelId}`,
                displayName: s.channelName,
                avatar,
                title: s.title,
                category: category.name,
                categorySlug: category.slug,
                viewers,
                thumbnail: s.thumbnail.replace(/hqdefault/, "maxresdefault"),
                isLive: true,
                tags: tags.length > 0 ? tags : ["live"],
                isVerified: followers > 100000,
                followers: followers || undefined,
                bio: channelDetails?.snippet?.description?.slice(0, 120) || undefined,
                streamUrl: `https://www.youtube.com/watch?v=${s.videoId}`,
                platform: "youtube" as PlatformType,
            };
        });

        // Cache results
        setCachedStreams(streams);
        console.log(`[YouTubeService] ✅ Returning ${streams.length} live streams.`);
        return streams;
    } catch (err) {
        console.error("[YouTubeService] Failed:", err);
        return getCachedStreams() || [];
    }
}

// ──────────────────────────────────────────────────────────
// YouTube Stream Key (OAuth, for going live)
// ──────────────────────────────────────────────────────────
export async function fetchYouTubeStreamKey(accessToken: string): Promise<string | null> {
    try {
        const res = await fetch(`${YOUTUBE_API_BASE}/liveStreams?part=snippet,cdn&mine=true`, {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) {
            console.error("[YouTubeService] Failed to fetch live streams info:", res.status);
            return null;
        }
        const data = await res.json();
        return data.items?.[0]?.cdn?.ingestionInfo?.streamName || null;
    } catch (e) {
        console.error("[YouTubeService] Error fetching stream key:", e);
        return null;
    }
}
