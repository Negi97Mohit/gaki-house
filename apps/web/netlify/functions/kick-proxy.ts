// netlify/functions/kick-proxy.ts
// Server-side proxy for Kick API to bypass Cloudflare protection in web mode.
import type { Handler, HandlerEvent } from "@netlify/functions";
import fetch from "node-fetch";

const KICK_API_BASE = "https://kick.com/api/v1";

// Allowlisted Kick API paths (prevents open proxy abuse)
const ALLOWED_PATHS = [
    "/subcategories/just-chatting/livestreams",
    "/subcategories/gaming/livestreams",
    "/subcategories/irl/livestreams",
    "/subcategories/music/livestreams",
    "/subcategories/creative/livestreams",
];

const handler: Handler = async (event: HandlerEvent) => {
    // Only allow GET
    if (event.httpMethod !== "GET") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    const path = event.queryStringParameters?.path;

    if (!path) {
        return { statusCode: 400, body: JSON.stringify({ error: "Missing 'path' query parameter" }) };
    }

    // Security: only allow known Kick API paths
    const isAllowed = ALLOWED_PATHS.some((p) => path.startsWith(p)) || /^\/channels\/[\w-]+$/.test(path);
    if (!isAllowed) {
        return { statusCode: 403, body: JSON.stringify({ error: "Path not allowed" }) };
    }

    const targetUrl = `${KICK_API_BASE}${path}`;

    try {
        const response = await fetch(targetUrl, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                Accept: "application/json",
                "Accept-Language": "en-US,en;q=0.9",
                Referer: "https://kick.com/",
                Origin: "https://kick.com",
            },
        });

        if (!response.ok) {
            return {
                statusCode: response.status,
                body: JSON.stringify({ error: `Kick API returned ${response.status}` }),
                headers: { "Content-Type": "application/json" },
            };
        }

        const data = await response.text();

        return {
            statusCode: 200,
            body: data,
            headers: {
                "Content-Type": "application/json",
                "Cache-Control": "public, max-age=60", // Cache for 60s to reduce load
                "Access-Control-Allow-Origin": "*",
            },
        };
    } catch (error: any) {
        console.error("[kick-proxy] Error:", error);
        return {
            statusCode: 502,
            body: JSON.stringify({ error: "Failed to reach Kick API", details: error.message }),
            headers: { "Content-Type": "application/json" },
        };
    }
};

export { handler };
