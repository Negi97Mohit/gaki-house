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
    // In development, we use the proxy at /api/kick
    // In production, this would fail without a backend proxy
    const API_BASE = "/api/kick";

    try {
        const promises = KICK_CHANNELS_TO_POLL.map(async (slug) => {
            try {
                const res = await fetch(`${API_BASE}/channels/${slug}`);
                if (!res.ok) return null;

                const data: KickChannelResponse = await res.json();

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
                    isVerified: true, // Most top channels are verified
                    followers: 0, // Not always available in this endpoint response easily
                    bio: data.user.bio,
                    streamUrl: `https://kick.com/${data.slug}`,
                    platform: "kick" as PlatformType,
                };
            } catch (e) {
                // Individual channel fetch failure (e.g. 404 if channel doesn't exist)
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
