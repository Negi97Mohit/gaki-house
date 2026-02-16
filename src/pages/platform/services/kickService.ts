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

    // 2. WEB MODE: We cannot fetch dynamic kick data securely from a browser tab due to Cloudflare.
    // We return a single "status" card to inform the developer/user.
    console.warn("[KickService] Kick live streams require the Electron Desktop App to function.");

    return [{
        id: "kick-web-notice",
        username: "system",
        displayName: "Electron Required",
        avatar: "https://api.dicebear.com/9.x/initials/svg?seed=KR",
        title: "Kick Live Streams are only available in the Electron App (Cloudflare Protection)",
        category: "System",
        categorySlug: "system",
        viewers: 0,
        thumbnail: "https://placehold.co/600x400/53FC18/000000?text=Open+App+For+Kick",
        isLive: true,
        tags: ["System"],
        isVerified: true,
        followers: 0,
        bio: "Please run 'npm run electron:dev' to see real Kick streams.",
        streamUrl: "https://kick.com",
        platform: "kick" as PlatformType
    }];
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
