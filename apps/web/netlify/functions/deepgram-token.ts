// Netlify function: vend a short-lived Deepgram temporary API key.
// DEEPGRAM_API_KEY stays server-side only (no VITE_ prefix).
// Requires an allowed origin, per-IP rate limit, and signed-in Firebase user.
import type { Handler, HandlerEvent } from "@netlify/functions";
import fetch from "node-fetch";
import { checkOrigin, checkRateLimit, verifyFirebaseAuth } from "./_security";

const DEEPGRAM_API = "https://api.deepgram.com/v1";

const handler: Handler = async (event: HandlerEvent) => {
  const originCheck = checkOrigin(event);
  if (!originCheck.allowed) return originCheck.response;
  const corsHeaders = originCheck.headers;

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  const rateLimited = checkRateLimit(event, corsHeaders, { maxRequests: 20, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const authResult = await verifyFirebaseAuth(event, corsHeaders);
  if ("response" in authResult) return authResult.response;

  const masterKey = process.env.DEEPGRAM_API_KEY;
  if (!masterKey) {
    return {
      statusCode: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Deepgram credentials not configured" }),
    };
  }

  try {
    // Shortest practical TTL (10s) and minimal scope (usage:write only)
    const res = await fetch(`${DEEPGRAM_API}/projects/self/keys`, {
      method: "POST",
      headers: {
        Authorization: `Token ${masterKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        comment: `web-stt-${authResult.uid}`,
        scopes: ["usage:write"],
        time_to_live_in_seconds: 10,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[deepgram-token] API error:", res.status, text);
      return {
        statusCode: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Failed to create Deepgram temporary key" }),
      };
    }

    const data = (await res.json()) as { key: string };

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify({ key: data.key }),
    };
  } catch (err) {
    console.error("[deepgram-token] Error:", err);
    return {
      statusCode: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to reach Deepgram API" }),
    };
  }
};

export { handler };
