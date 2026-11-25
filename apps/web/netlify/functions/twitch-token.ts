// Netlify function: vend a Twitch app-access token to the browser.
// TWITCH_CLIENT_SECRET stays server-side only (no VITE_ prefix).
// The browser never sees the secret; it only receives a short-lived bearer token.
import type { Handler, HandlerEvent } from "@netlify/functions";
import fetch from "node-fetch";

const TWITCH_AUTH_URL = "https://id.twitch.tv/oauth2/token";

// Cache in function memory (reused across warm invocations, cleared on cold start)
let cachedToken: { token: string; expiresAt: number } | null = null;

const handler: Handler = async (_event: HandlerEvent) => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Twitch credentials not configured" }),
    };
  }

  // Return cached token if still valid (5-minute buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300_000) {
    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
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
        "Content-Type": "application/json",
        // Allow browser caching for most of the token's lifetime
        "Cache-Control": `public, max-age=${Math.max(0, data.expires_in - 300)}`,
      },
      body: JSON.stringify({ access_token: cachedToken.token, client_id: clientId }),
    };
  } catch (err: any) {
    console.error("[twitch-token] Error:", err);
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Network error reaching Twitch auth" }),
    };
  }
};

export { handler };
