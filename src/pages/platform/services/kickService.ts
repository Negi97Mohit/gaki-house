// Kick API Service
import { StreamChannel, PlatformType } from "../data/mockData";

// NOTE: We do NOT hardcode any channels here.
// Live streams are fetched dynamically from Kick's "Just Chatting" category via Electron.

interface KickLivestreamResponse {
    data: {
        id: number;
        slug: string;
        session_title: string;
        thumbnail: {
            url: string;
        };
        viewer_count: number;
        tags: string[];
        categories: {
            name: string;
            slug: string;
        }[];
        is_live: boolean;
        user_id: number;
        user: {
            username: string;
            profile_pic: string;
            bio: string;
        };
    }[];
}

export async function fetchKickLiveStreams(): Promise<StreamChannel[]> {
    const electron = (window as any).electron;

    // 1. ELECTRON MODE: Use hidden browser window to fetch dynamic list
    if (electron && electron.kickFetch) {
        // Fetch from a general category to get a purely dynamic list of who is live RIGHT NOW.
        // No hardcoded "top streamers" list.
        const URL = "https://kick.com/api/v1/subcategories/just-chatting/livestreams";

        try {
            const result = await electron.kickFetch(URL);

            if (result.ok && result.data) {
                const data: KickLivestreamResponse = result.data;
                const streams = mapKickResponse(data);
                return streams;
            } else {
                console.warn("[KickService] Browser fetch failed:", result.error);
                return [];
            }
        } catch (e) {
            console.error("[KickService] Electron fetch error:", e);
            return [];
        }
    }

    // 2. WEB MODE: Use server-side proxy to bypass Cloudflare
    // Vite dev proxy: /api/kick -> https://kick.com/api/v1 (configured in vite.config.ts)
    // Netlify deploy: /api/kick -> kick-proxy function (configured in netlify.toml)
    console.log("[KickService] Using server-side proxy for Kick streams (web mode).");

    const proxyUrl = `/api/kick/subcategories/just-chatting/livestreams`;

    try {
        const res = await fetch(proxyUrl);
        if (!res.ok) {
            console.warn("[KickService] Proxy returned error:", res.status);
            return [];
        }

        const data: KickLivestreamResponse = await res.json();
        return mapKickResponse(data);
    } catch (e) {
        console.error("[KickService] Proxy fetch error:", e);
        return [];
    }
}


function mapKickResponse(data: KickLivestreamResponse): StreamChannel[] {
    if (!data || !data.data) return [];

    return data.data.map((stream: any) => {
        const user = stream.user || {};

        return {
            id: `kick-${stream.id}`,
            username: stream.slug,
            displayName: user.username || stream.slug,
            avatar: user.profile_pic || `https://api.dicebear.com/9.x/adventurer/svg?seed=kick-${stream.slug}`,
            title: stream.session_title,
            category: stream.categories?.[0]?.name || "Just Chatting",
            categorySlug: stream.categories?.[0]?.slug || "just-chatting",
            viewers: stream.viewer_count,
            thumbnail: stream.thumbnail?.url || "",
            isLive: stream.is_live,
            tags: stream.tags || ["live"],
            isVerified: true, // Assuming if they are in the top list they are verified/relevant
            followers: 0,
            bio: user.bio || "",
            streamUrl: `https://kick.com/${stream.slug}`,
            platform: "kick" as PlatformType,
        };
    });
}
