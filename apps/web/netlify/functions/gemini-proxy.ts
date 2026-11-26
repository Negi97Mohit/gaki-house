// Netlify function: server-side proxy for Google Gemini API.
// GEMINI_API_KEY stays server-side only (no VITE_ prefix).
// Protected by strict origin allowlist, per-IP rate limiting, and signed-in Firebase user verification.
import type { Handler, HandlerEvent } from "@netlify/functions";
import fetch from "node-fetch";
import { checkOrigin, checkRateLimit, verifyFirebaseAuth } from "./_security";

const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent";

const handler: Handler = async (event: HandlerEvent) => {
  const originCheck = checkOrigin(event);
  if (!originCheck.allowed) return originCheck.response;
  const corsHeaders = originCheck.headers;

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: corsHeaders, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: corsHeaders, body: "Method Not Allowed" };
  }

  const rateLimited = checkRateLimit(event, corsHeaders, { maxRequests: 20, windowMs: 60_000 });
  if (rateLimited) return rateLimited;

  const authResult = await verifyFirebaseAuth(event, corsHeaders);
  if ("response" in authResult) return authResult.response;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      statusCode: 503,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Gemini credentials not configured" }),
    };
  }

  let payload: { prompt?: string; systemPrompt?: string };
  try {
    payload = JSON.parse(event.body || "{}") as { prompt?: string; systemPrompt?: string };
  } catch {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Invalid JSON body" }),
    };
  }

  if (!payload.prompt || typeof payload.prompt !== "string") {
    return {
      statusCode: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Missing 'prompt' string" }),
    };
  }

  try {
    const res = await fetch(`${GEMINI_API_URL}?key=${encodeURIComponent(apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              ...(payload.systemPrompt ? [{ text: payload.systemPrompt }] : []),
              { text: payload.prompt },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.8,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      return {
        statusCode: res.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({
          error: (errorData as { error?: { message?: string } }).error?.message || `Gemini API Error: ${res.status}`,
        }),
      };
    }

    const data = await res.json();
    return {
      statusCode: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "no-store",
      },
      body: JSON.stringify(data),
    };
  } catch (err) {
    console.error("[gemini-proxy] Error:", err);
    return {
      statusCode: 502,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Failed to reach Gemini API" }),
    };
  }
};

export { handler };
