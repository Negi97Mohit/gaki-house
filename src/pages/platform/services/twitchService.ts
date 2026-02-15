// Twitch Helix API — fetch live streams
import { StreamChannel, PlatformType } from "../data/mockData";

const TWITCH_API_BASE = "https://api.twitch.tv/helix";
const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/token";

let cachedToken: { token: string; expiresAt: number } | null = null;

async function getTwitchAppToken(): Promise<string | null> {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET;
    if (!clientId || !clientSecret) return null;

    // Return cached token if still valid (with 5 min buffer)
    if (cachedToken && Date.now() < cachedToken.expiresAt - 300_000) {
        return cachedToken.token;
    }

    try {
        const res = await fetch(TWITCH_AUTH_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: "client_credentials",
            }),
        });

        if (!res.ok) {
            console.error("[TwitchService] Auth error:", res.status);
            return null;
        }

        const data = await res.json();
        cachedToken = {
            token: data.access_token,
            expiresAt: Date.now() + data.expires_in * 1000,
        };
        return cachedToken.token;
    } catch (err) {
        console.error("[TwitchService] Auth failed:", err);
        return null;
    }
}

// NEW: Fetch Stream Key for logged-in user
export async function fetchTwitchStreamKey(userToken: string): Promise<string | null> {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    if (!clientId) return null;

    try {
        const broadcasterId = await getUserIdFromToken(userToken, clientId);
        if (!broadcasterId) return null;

        const res = await fetch(`${TWITCH_API_BASE}/streams/key?broadcaster_id=${broadcasterId}`, {
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${userToken}`,
            },
        });

        if (!res.ok) {
            console.error("[TwitchService] Stream key fetch error:", res.status);
            return null;
        }

        const data = await res.json();
        return data.data?.[0]?.stream_key || null;
    } catch (e) {
        console.error("[TwitchService] Failed to fetch stream key:", e);
        return null;
    }
}

async function getUserIdFromToken(token: string, clientId: string): Promise<string | null> {
    try {
        const res = await fetch(`${TWITCH_API_BASE}/users`, {
            headers: {
                "Client-ID": clientId,
                Authorization: `Bearer ${token}`,
            },
        });
        const data = await res.json();
        return data.data?.[0]?.id || null;
    } catch {
        return null;
    }
}

interface TwitchStream {
    id: string;
    user_id: string;
    user_login: string;
    user_name: string;
    game_id: string;
    game_name: string;
    type: string;
    title: string;
    viewer_count: number;
    started_at: string;
    language: string;
    thumbnail_url: string;
    tag_ids: string[];
    tags: string[];
    is_mature: boolean;
}

interface TwitchUser {
    id: string;
    login: string;
    display_name: string;
    description: string;
    profile_image_url: string;
    offline_image_url: string;
    view_count: number;
    created_at: string;
}

// Maps Twitch game names to our category slugs
function mapTwitchCategory(gameName: string): { name: string; slug: string } {
    const lower = gameName.toLowerCase();
    if (lower.includes("just chatting")) return { name: "Just Chatting", slug: "just-chatting" };
    if (lower.includes("valorant")) return { name: "VALORANT", slug: "valorant" };
    if (lower.includes("league")) return { name: "League of Legends", slug: "league-of-legends" };
    if (lower.includes("fortnite")) return { name: "Fortnite", slug: "fortnite" };
    if (lower.includes("counter-strike") || lower.includes("cs")) return { name: "Counter-Strike 2", slug: "cs2" };
    if (lower.includes("minecraft")) return { name: "Minecraft", slug: "minecraft" };
    if (lower.includes("grand theft auto") || lower.includes("gta")) return { name: "Grand Theft Auto V", slug: "gta-v" };
    if (lower.includes("dota")) return { name: "Dota 2", slug: "dota-2" };
    if (lower.includes("music")) return { name: "Music", slug: "music" };
    if (lower.includes("art") || lower.includes("creative")) return { name: "Art", slug: "art" };
    if (lower.includes("sport")) return { name: "Sports", slug: "sports" };
    if (lower.includes("program") || lower.includes("software") || lower.includes("science")) return { name: "Programming", slug: "programming" };
    return { name: gameName || "Streaming", slug: "just-chatting" };
}

export async function fetchTwitchLiveStreams(
    maxResults = 12
): Promise<StreamChannel[]> {
    const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
    if (!clientId) {
        console.warn("[TwitchService] No Client ID configured (VITE_TWITCH_CLIENT_ID). Using mock data.");
        return [];
    }

    const token = await getTwitchAppToken();
    if (!token) return [];

    try {
        const headers = {
            "Client-ID": clientId,
            Authorization: `Bearer ${token}`,
        };

        // Step 1: Get top live streams
        const streamsUrl = new URL(`${TWITCH_API_BASE}/streams`);
        streamsUrl.searchParams.set("first", String(maxResults));
        streamsUrl.searchParams.set("type", "live");

        const streamsRes = await fetch(streamsUrl.toString(), { headers });
        if (!streamsRes.ok) {
            console.error("[TwitchService] Streams API error:", streamsRes.status);
            return [];
        }
        const streamsData = await streamsRes.json();
        const streams: TwitchStream[] = streamsData.data || [];
        if (streams.length === 0) return [];

        // Step 2: Get user details (avatar, description)
        const userIds = [...new Set(streams.map((s) => s.user_id))];
        const usersUrl = new URL(`${TWITCH_API_BASE}/users`);
        userIds.forEach((id) => usersUrl.searchParams.append("id", id));

        const usersRes = await fetch(usersUrl.toString(), { headers });
        const usersData = usersRes.ok ? await usersRes.json() : { data: [] };
        const userMap = new Map<string, TwitchUser>();
        (usersData.data || []).forEach((u: TwitchUser) => userMap.set(u.id, u));

        // Step 3: Map to StreamChannel
        return streams.map((stream): StreamChannel => {
            const user = userMap.get(stream.user_id);
            const category = mapTwitchCategory(stream.game_name);
            const thumbnail = stream.thumbnail_url
                .replace("{width}", "640")
                .replace("{height}", "360");

            return {
                id: `tw-live-${stream.id}`,
                username: `tw-${stream.user_login}`,
                displayName: stream.user_name,
                avatar: user?.profile_image_url || `https://api.dicebear.com/9.x/adventurer/svg?seed=tw-${stream.user_login}`,
                title: stream.title,
                category: category.name,
                categorySlug: category.slug,
                viewers: stream.viewer_count,
                thumbnail,
                isLive: true,
                tags: stream.tags?.slice(0, 3) || ["live"],
                isVerified: stream.viewer_count > 1000,
                bio: user?.description?.slice(0, 120) || undefined,
                streamUrl: `https://www.twitch.tv/${stream.user_login}`,
                platform: "twitch" as PlatformType,
            };
        });
    } catch (err) {
        console.error("[TwitchService] Failed to fetch live streams:", err);
        return [];
    }
}
