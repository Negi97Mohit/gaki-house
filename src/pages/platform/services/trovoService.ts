// Trovo API — fetch live streams
import { StreamChannel, PlatformType } from "../data/mockData";

// Note: Trovo requires a Client-ID for API access.
// Get one at https://developer.trovo.live/
// Using Vite proxy to bypass CORS if needed, though Trovo API usually supports CORS
const TROVO_API_BASE = "https://open-api.trovo.live/openplatform";

// Category slug mapping
const TROVO_CATEGORY_MAP: Record<string, { name: string; slug: string }> = {
    "100": { name: "Just Chatting", slug: "just-chatting" },
    "101": { name: "Call of Duty: Mobile", slug: "cod-mobile" },
    "102": { name: "League of Legends", slug: "league-of-legends" },
    "103": { name: "PUBG Mobile", slug: "pubg-mobile" },
    "104": { name: "Fortnite", slug: "fortnite" },
    "105": { name: "Free Fire", slug: "free-fire" },
    "106": { name: "Grand Theft Auto V", slug: "gta-v" },
    "107": { name: "Valorant", slug: "valorant" },
    "108": { name: "Minecraft", slug: "minecraft" },
    "109": { name: "Apex Legends", slug: "apex-legends" },
    "110": { name: "Among Us", slug: "among-us" },
};

interface TrovoChannel {
    channel_id: string; // e.g. "1001"
    channel_url: string; // e.g. "https://trovo.live/trovo"
    username: string;
    display_name: string; // Deprecated but sometimes present
    nickname: string;     // Use this for display name
    is_live: boolean;
    current_viewers: number;
    followers: number;
    profile_pic: string;
    description: string;
    category_id: string;
    category_name: string;
    thumbnail: string;
    title: string;
    audi_type: string; // "CHANNEL_AUDIENCE_TYPE_ALL"
    sub_lv: string;
}

export async function fetchTrovoLiveStreams(
    maxResults = 12
): Promise<StreamChannel[]> {
    const clientId = import.meta.env.VITE_TROVO_CLIENT_ID;
    if (!clientId) {
        console.warn("[TrovoService] No Client ID configured (VITE_TROVO_CLIENT_ID). Skipping.");
        return [];
    }

    try {
        const res = await fetch(`${TROVO_API_BASE}/gettopchannels`, {
            method: "POST",
            headers: {
                "Client-ID": clientId,
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                limit: maxResults,
                category_id: 0, // 0 = all categories
            }),
        });

        if (!res.ok) {
            console.error("[TrovoService] API error:", res.status);
            return [];
        }

        const json = await res.json();
        const channels: TrovoChannel[] = json.data?.list || [];

        console.log(`[TrovoService] Found ${channels.length} top channels.`);

        if (channels.length === 0) return [];

        return channels
            .filter((c) => c.is_live) // Ensure only live channels
            .map((channel, idx): StreamChannel => {
                const category = TROVO_CATEGORY_MAP[channel.category_id] || {
                    name: channel.category_name || "Gaming",
                    slug: "gaming",
                };

                return {
                    id: `trovo-${channel.channel_id}`,
                    username: channel.username,
                    displayName: channel.nickname || channel.username,
                    avatar: channel.profile_pic || `https://api.dicebear.com/9.x/adventurer/svg?seed=trovo-${idx}`,
                    title: channel.title,
                    category: category.name,
                    categorySlug: category.slug,
                    viewers: channel.current_viewers,
                    thumbnail: channel.thumbnail || "",
                    isLive: true,
                    tags: [category.name],
                    isVerified: channel.sub_lv !== "0", // Rough verification check
                    followers: channel.followers || undefined,
                    bio: channel.description?.slice(0, 120) || undefined,
                    streamUrl: channel.channel_url,
                    platform: "trovo" as PlatformType,
                };
            });
    } catch (err) {
        console.error("[TrovoService] Failed to fetch live streams:", err);
        return [];
    }
}
