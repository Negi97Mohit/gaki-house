import { StreamDestination } from "@/stores/stream.store";

// Use the exposed Electron API
const electron = (window as any).electron;

export interface AuthResult {
    success: boolean;
    token?: string;
    error?: string;
    user?: {
        id: string;
        username: string;
        avatar: string;
    };
    streamKey?: string;
}

// Persist tokens securely (or in simple storage for now)
const TOKEN_STORAGE_KEY = "stream_auth_tokens";

export const AuthService = {
    // Generic OAuth Handler
    async startOAuthFlow(platform: "twitch" | "youtube"): Promise<string | null> {
        if (!electron) {
            console.error("Electron API not available");
            return null;
        }

        let authUrl = "";

        if (platform === "twitch") {
            const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
            const redirectUri = "https://localhost:3000/auth/twitch/callback"; // Dummy local URL effectively
            // We use response_type=token for implicit grant which works well for desktop apps without backend
            // Scopes: channel:read:stream_key
            const scopes = "channel:read:stream_key user:read:email";
            authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${encodeURIComponent(scopes)}`;
        } else if (platform === "youtube") {
            const clientId = import.meta.env.VITE_YOUTUBE_CLIENT_ID; // Need to add this
            // For YouTube, it's more complex without a backend due to Client Secret requirements for some flows.
            // But we can use Implicit Flow or PKCE if configured in Google Console.
            // NOTE: User might need to provide their own credentials if we don't have a verified app.
            // For now, let's assume we might need to instruct user or use a flow that returns code to be exchanged.

            // FALLBACK: If we can't do full OAuth easily without a backend server to exchange codes, 
            // we might guide them to manual entry or use a "Function" to exchange.
            // Let's implement Twitch first as it's easier with Implicit Grant.
            return null;
        }

        try {
            // The main process will open a window and resolve with the callback URL
            const resultUrl = await electron.auth.start(authUrl);
            if (!resultUrl) return null;

            // Extract token from URL fragment
            const url = new URL(resultUrl);
            const hash = url.hash.substring(1);
            const params = new URLSearchParams(hash);
            return params.get("access_token");
        } catch (e) {
            console.error("Auth flow failed", e);
            return null;
        }
    },

    // Store tokens
    saveToken(platform: string, token: string) {
        const tokens = this.getTokens();
        tokens[platform] = token;
        localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(tokens));
    },

    getToken(platform: string): string | undefined {
        return this.getTokens()[platform];
    },

    getTokens(): Record<string, string> {
        try {
            return JSON.parse(localStorage.getItem(TOKEN_STORAGE_KEY) || "{}");
        } catch {
            return {};
        }
    }
};
