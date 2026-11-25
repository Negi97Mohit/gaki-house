// Netlify function: vend a short-lived Deepgram temporary API key.
// DEEPGRAM_API_KEY stays server-side only (no VITE_ prefix).
// The browser receives a temporary key scoped to a single connection with a 30-second TTL.
import type { Handler, HandlerEvent } from "@netlify/functions";
import fetch from "node-fetch";

const DEEPGRAM_API = "https://api.deepgram.com/v1";

const handler: Handler = async (_event: HandlerEvent) => {
  const masterKey = process.env.DEEPGRAM_API_KEY;

  if (!masterKey) {
    return {
      statusCode: 503,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Deepgram credentials not configured" }),
    };
  }

  try {
    // Create a temporary key with a 30-second TTL and speech:write scope only.
    // This key is single-use and expires immediately after the STT session closes.
    const res = await fetch(`${DEEPGRAM_API}/projects/self/keys`, {
      method: "POST",
      headers: {
        Authorization: `Token ${masterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: "web-stt-session",
        scopes: ["usage:write"],
        time_to_live_in_seconds: 30,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[deepgram-token] API error:", res.status, text);
      return {
        statusCode: res.status,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to create Deepgram temporary key" }),
      };
    }

    const data = (await res.json()) as { key: string };

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        // No browser caching — each session needs a fresh key
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ key: data.key }),
    };
  } catch (err: any) {
    console.error("[deepgram-token] Error:", err);
    return {
      statusCode: 502,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Network error reaching Deepgram API" }),
    };
  }
};

export { handler };
