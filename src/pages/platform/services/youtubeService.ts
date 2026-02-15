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
        // Step 1: Search for live streams
        const searchUrl = new URL(`${YOUTUBE_API_BASE}/search`);
        searchUrl.searchParams.set("part", "snippet");
        searchUrl.searchParams.set("type", "video");
        searchUrl.searchParams.set("eventType", "live");
        searchUrl.searchParams.set("order", "viewCount");
        searchUrl.searchParams.set("maxResults", String(maxResults));
        searchUrl.searchParams.set("key", apiKey);

        const searchRes = await fetch(searchUrl.toString());
        if (!searchRes.ok) {
            const errorData = await searchRes.json().catch(() => ({}));
            console.error("[YouTubeService] Search API error:", searchRes.status, errorData);
            return [];
        }
        const searchData = await searchRes.json();
        const items: YouTubeSearchItem[] = searchData.items || [];
        if (items.length === 0) return [];

        // Step 2: Get viewer counts + categories from video details
        const videoIds = items.map((i) => i.id.videoId).join(",");
        const videoUrl = new URL(`${YOUTUBE_API_BASE}/videos`);
        videoUrl.searchParams.set("part", "liveStreamingDetails,snippet");
        videoUrl.searchParams.set("id", videoIds);
        videoUrl.searchParams.set("key", apiKey);

        const videoRes = await fetch(videoUrl.toString());
        const videoData = videoRes.ok ? await videoRes.json() : { items: [] };
        const videoMap = new Map<string, YouTubeVideoItem>();
        (videoData.items || []).forEach((v: YouTubeVideoItem) => videoMap.set(v.id, v));

        // Step 3: Get channel avatars + subscriber counts
        const channelIds = [...new Set(items.map((i) => i.snippet.channelId))].join(",");
        const channelUrl = new URL(`${YOUTUBE_API_BASE}/channels`);
        channelUrl.searchParams.set("part", "snippet,statistics");
        channelUrl.searchParams.set("id", channelIds);
        channelUrl.searchParams.set("key", apiKey);

        const channelRes = await fetch(channelUrl.toString());
        const channelData = channelRes.ok ? await channelRes.json() : { items: [] };
        const channelMap = new Map<string, YouTubeChannelItem>();
        (channelData.items || []).forEach((c: YouTubeChannelItem) => channelMap.set(c.id, c));

        // Step 4: Map to StreamChannel
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
