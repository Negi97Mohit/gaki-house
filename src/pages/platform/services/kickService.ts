// Kick API Service (Development Proxy)
import { StreamChannel, PlatformType } from "../data/mockData";

// List of popular/interesting Kick channels to poll
// (Kick doesn't have a public search API without auth, so we poll likely live channels)
const KICK_CHANNELS_TO_POLL = [
    "xqc", "adinross", "trainwreckstv", "roshtein", "n3on",
    "iceposeidon", "destiny", "fousey", "amouranth", "hikaru",
    "westcol", "ac7ionman", "buddha"
];

interface KickChannelResponse {
    id: number;
    user_id: number;
    slug: string;
    is_banned: boolean;
    playback_url: string; // hls url
    user: {
        username: string;
        profile_pic: string;
        bio: string;
    };
    livestream: {
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
    } | null;
}

export async function fetchKickLiveStreams(): Promise<StreamChannel[]> {
    const electron = (window as any).electron;
    // If no electron proxy, we can't fetch from client side due to CORS.
    if (!electron || !electron.proxy) {
        console.warn("[KickService] Electron proxy not available. Using mock data.");
        return [
            {
                id: "kick-mock-1",
                username: "xqc",
                displayName: "xQc",
                avatar: "https://api.dicebear.com/9.x/adventurer/svg?seed=kick-xqc",
                title: "Mock Stream: Gaming Warlord (Electron Required for Real Data)",
                category: "Just Chatting",
                categorySlug: "just-chatting",
                viewers: 15000,
                thumbnail: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1000",
                isLive: true,
                tags: ["mock", "dev"],
                isVerified: true,
                followers: 0,
                bio: "Mock Bio",
                streamUrl: "https://kick.com/xqc",
                platform: "kick" as PlatformType
            }
        ];
    }

    try {
        const promises = KICK_CHANNELS_TO_POLL.map(async (slug) => {
            try {
                // Use the proxy to fetch from Kick's internal API
                const url = `https://kick.com/api/v1/channels/${slug}`;
                const result = await electron.proxy.request(url, {
                    method: "GET",
                    headers: {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "application/json",
                    }
                });

                if (!result.ok) return null;
                const data: KickChannelResponse = result.data;

                // Filter out offline channels
                if (!data.livestream || !data.livestream.is_live) return null;

                const stream = data.livestream;

                return {
                    id: `kick-${stream.id}`,
                    username: data.slug,
                    displayName: data.user.username,
                    avatar: data.user.profile_pic || `https://api.dicebear.com/9.x/adventurer/svg?seed=kick-${data.slug}`,
                    title: stream.session_title,
                    category: stream.categories?.[0]?.name || "Just Chatting",
                    categorySlug: stream.categories?.[0]?.slug || "just-chatting",
                    viewers: stream.viewer_count,
                    thumbnail: stream.thumbnail?.url || "",
                    isLive: true,
                    tags: stream.tags || ["live"],
                    isVerified: true,
                    followers: 0,
                    bio: data.user.bio,
                    streamUrl: `https://kick.com/${data.slug}`,
                    platform: "kick" as PlatformType,
                };
            } catch (e) {
                // Individual channel fetch failure
                return null;
            }
        });

        const results = await Promise.all(promises);
        return results.filter((ch): ch is StreamChannel => ch !== null);

    } catch (err) {
        console.error("[KickService] Failed to fetch live streams via proxy:", err);
        return [];
    }
}
