// Netlify function: vend a Twitch app-access token to the browser.
// TWITCH_CLIENT_SECRET stays server-side only (no VITE_ prefix).
// Protected by strict origin allowlist and per-IP rate limiting.
import type { Handler, HandlerEvent } from "@netlify/functions";
import fetch from "node-fetch";
import { checkOrigin, checkRateLimit } from "./_security";

const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/token";

let cachedToken: { token: string; expiresAt: number } | null = null;

export function _resetTwitchTokenCacheForTests() {
  cachedToken = null;
}

const handler: Handler = async (event: HandlerEvent) => {
  const originCheck = checkOrigin(event);
  if (!originCheck.allowed) return originCheck.response;
  const corsHeaders = originCheck.headers;

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const rateLimited = checkRateLimit(event, corsHeaders, { maxRequests: 30, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Twitch credentials not configured" }),
    };
  }

  if (cachedToken && Date.now() < cachedToken.expiresAt - 300_000) {
    return {
      statusCode: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ access_token: cachedToken.token, client_id: clientId }),
    };
  }

  try {
    const res = await fetch(TWITCH_AUTH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }).toString(),
    });

    if (!res.ok) {
      console.error("[twitch-token] Auth error:", res.status);
      return {
        statusCode: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to obtain Twitch token" }),
      };
    }

    const data = (await res.json()) as { access_token: string; expires_in: number };
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
      body: JSON.stringify({ access_token: data.access_token, client_id: clientId }),
    };
  } catch (err) {
    console.error("[twitch-token] Error:", err);
    return {
      statusCode: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to contact Twitch auth" }),
    };
  }
};

export { handler };
