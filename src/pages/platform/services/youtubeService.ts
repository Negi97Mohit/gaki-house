// YouTube Data API v3 — fetch live streams
import { StreamChannel, PlatformType } from "../data/mockData";

const YOUTUBE_API_BASE = "https://www.googleapis.com/youtube/v3";

interface YouTubeSearchItem {
    id: { videoId: string };
    snippet: {
        channelId: string;
        channelTitle: string;
        title: string;
        description: string;
        thumbnails: {
            high?: { url: string };
            medium?: { url: string };
            default?: { url: string };
        };
        liveBroadcastContent: string;
    };
}

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

export async function fetchYouTubeLiveStreams(
    maxResults = 12
): Promise<StreamChannel[]> {
    const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
    if (!apiKey) {
        console.warn("[YouTubeService] No API key configured (VITE_YOUTUBE_API_KEY). Using mock data.");
        return [];
    }

    try {
        // Strategy: Try eventType=live first. If it returns 0 (known API billing issue),
        // fall back to searching "live stream" and filtering by liveBroadcastContent.

        // Attempt 1: Direct live search (works if billing is enabled)
        let items: YouTubeSearchItem[] = await searchYouTube(apiKey, {
            eventType: "live",
            order: "viewCount",
            maxResults,
        });

        // Attempt 2: Keyword search for live content (reliable fallback)
        if (items.length === 0) {
            console.log("[YouTubeService] eventType=live returned 0 results, trying keyword fallback...");
            const searchResults = await searchYouTube(apiKey, {
                q: "live stream",
                order: "viewCount",
                maxResults: maxResults * 3, // Fetch extra since we'll filter
            });
            // Filter to only currently live videos
            items = searchResults.filter(
                (item) => item.snippet.liveBroadcastContent === "live"
            );
            console.log(`[YouTubeService] Keyword fallback found ${items.length} live streams out of ${searchResults.length} results.`);
        }

        // Attempt 3: If still nothing, get popular videos (so the app never shows empty YouTube)
        if (items.length === 0) {
            console.log("[YouTubeService] No live streams found at all. Fetching popular videos as fallback.");
            return await fetchPopularYouTubeVideos(apiKey, maxResults);
        }

        items = items.slice(0, maxResults);
        console.log(`[YouTubeService] Processing ${items.length} live streams.`);

        // Get viewer counts + categories from video details
        const videoIds = items.map((i) => i.id.videoId).join(",");
        const videoUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
        videoUrl.searchParams.set("part", "liveStreamingDetails,snippet");
        videoUrl.searchParams.set("id", videoIds);
        videoUrl.searchParams.set("key", apiKey);

        const videoRes = await fetch(videoUrl.toString());
        const videoData = videoRes.ok ? await videoRes.json() : { items: [] };
        const videoMap = new Map<string, YouTubeVideoItem>();
        (videoData.items || []).forEach((v: YouTubeVideoItem) => videoMap.set(v.id, v));

        // Get channel avatars + subscriber counts
        const channelIds = [...new Set(items.map((i) => i.snippet.channelId))].join(",");
        const channelUrl = new URL(`${YOUTUBE_API_BASE}/channels`);
        channelUrl.searchParams.set("part", "snippet,statistics");
        channelUrl.searchParams.set("id", channelIds);
        channelUrl.searchParams.set("key", apiKey);

        const channelRes = await fetch(channelUrl.toString());
        const channelData = channelRes.ok ? await channelRes.json() : { items: [] };
        const channelMap = new Map<string, YouTubeChannelItem>();
        (channelData.items || []).forEach((c: YouTubeChannelItem) => channelMap.set(c.id, c));

        return items.map((item, idx): StreamChannel => {
            const videoDetails = videoMap.get(item.id.videoId);
            const channelDetails = channelMap.get(item.snippet.channelId);
            const categoryId = videoDetails?.snippet?.categoryId || "24";
            const category = YOUTUBE_CATEGORY_MAP[categoryId] || { name: "Entertainment", slug: "just-chatting" };
            const viewers = parseInt(videoDetails?.liveStreamingDetails?.concurrentViewers || "0", 10);
            const followers = parseInt(channelDetails?.statistics?.subscriberCount || "0", 10);
            const avatar = channelDetails?.snippet?.thumbnails?.default?.url || `https://api.dicebear.com/9.x/adventurer/svg?seed=yt-${idx}`;
            const thumbnail =
                item.snippet.thumbnails.high?.url ||
                item.snippet.thumbnails.medium?.url ||
                item.snippet.thumbnails.default?.url ||
                "";

            const tags = (videoDetails?.snippet?.tags || []).slice(0, 3);

            return {
                id: `yt-live-${item.id.videoId}`,
                username: `yt-${item.snippet.channelId}`,
                displayName: item.snippet.channelTitle,
                avatar,
                title: item.snippet.title,
                category: category.name,
                categorySlug: category.slug,
                viewers,
                thumbnail: thumbnail.replace(/hqdefault/, "maxresdefault"),
                isLive: true,
                tags: tags.length > 0 ? tags : ["live"],
                isVerified: followers > 100000,
                followers: followers || undefined,
                bio: channelDetails?.snippet?.description?.slice(0, 120) || undefined,
                streamUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
                platform: "youtube" as PlatformType,
            };
        });
    } catch (err) {
        console.error("[YouTubeService] Failed to fetch live streams:", err);
        return [];
    }
}

// Helper: YouTube search with configurable params
async function searchYouTube(
    apiKey: string,
    params: Record<string, string | number>
): Promise<YouTubeSearchItem[]> {
    const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
    searchUrl.searchParams.set("part", "snippet");
    searchUrl.searchParams.set("type", "video");
    searchUrl.searchParams.set("key", apiKey);
    for (const [key, val] of Object.entries(params)) {
        searchUrl.searchParams.set(key, String(val));
    }

    const res = await fetch(searchUrl.toString());
    if (!res.ok) {
        console.error("[YouTubeService] Search API error:", res.status);
        return [];
    }
    const data = await res.json();
    return data.items || [];
}

// Fallback: Fetch popular YouTube videos when no live streams are found
async function fetchPopularYouTubeVideos(
    apiKey: string,
    maxResults: number
): Promise<StreamChannel[]> {
    const url = new URL(`${YOUTUBE_API_BASE}/videos`);
    url.searchParams.set("part", "snippet,statistics");
    url.searchParams.set("chart", "mostPopular");
    url.searchParams.set("maxResults", String(maxResults));
    url.searchParams.set("key", apiKey);

    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data = await res.json();

    return (data.items || []).map((item: any, idx: number): StreamChannel => {
        const categoryId = item.snippet?.categoryId || "24";
        const category = YOUTUBE_CATEGORY_MAP[categoryId] || { name: "Entertainment", slug: "just-chatting" };
        const viewers = parseInt(item.statistics?.viewCount || "0", 10);

        return {
            id: `yt-pop-${item.id}`,
            username: `yt-${item.snippet.channelId}`,
            displayName: item.snippet.channelTitle,
            avatar: `https://api.dicebear.com/9.x/adventurer/svg?seed=yt-${idx}`,
            title: item.snippet.title,
            category: category.name,
            categorySlug: category.slug,
            viewers,
            thumbnail: item.snippet.thumbnails?.maxres?.url || item.snippet.thumbnails?.high?.url || "",
            isLive: false,
            tags: (item.snippet.tags || []).slice(0, 3),
            isVerified: viewers > 1000000,
            followers: undefined,
            bio: item.snippet.description?.slice(0, 120) || undefined,
            streamUrl: `https://www.youtube.com/watch?v=${item.id}`,
            platform: "youtube" as PlatformType,
        };
    });
}

// NEW: Fetch YouTube Stream Key (Requires OAuth)
export async function fetchYouTubeStreamKey(accessToken: string): Promise<string | null> {
    // Note: This requires 'https://www.googleapis.com/auth/youtube.readonly' or 'youtube' scope
    // and the user must have a channel and live streaming enabled.
    try {
        const res = await fetch(`${YOUTUBE_API_BASE}/liveStreams?part=snippet,cdn&mine=true`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!res.ok) {
            console.error("[YouTubeService] Failed to fetch live streams info:", res.status);
            return null;
        }

        const data = await res.json();
        // Return the first stream key found
        const key = data.items?.[0]?.cdn?.ingestionInfo?.streamName;
        return key || null;
    } catch (e) {
        console.error("[YouTubeService] Error fetching stream key:", e);
        return null;
    }
}
