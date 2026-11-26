import type { HandlerEvent, HandlerResponse } from "@netlify/functions";
import fetch from "node-fetch";

const DEFAULT_ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:8888",
  "http://localhost:8080",
  "http://127.0.0.1:5173",
  "http://127.0.0.1:8888",
];

function getAllowedOrigins(): Set<string> {
  const configured = (process.env.ALLOWED_ORIGINS || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean);
  const dynamicLocal = [process.env.VITE_WEB_PORT, process.env.NETLIFY_DEV_PORT]
    .filter(Boolean)
    .flatMap((p) => [`http://localhost:${p}`, `http://127.0.0.1:${p}`]);
  return new Set([...DEFAULT_ALLOWED_ORIGINS, ...dynamicLocal, ...configured]);
}

function extractOrigin(event: HandlerEvent): string | null {
  const origin = event.headers.origin || event.headers.Origin;
  if (origin) return origin.trim();

  const referer = event.headers.referer || event.headers.Referer;
  if (referer) {
    try {
      return new URL(referer).origin;
    } catch {
      return null;
    }
  }
  return null;
}

export function checkOrigin(
  event: HandlerEvent,
): { allowed: true; origin: string; headers: Record<string, string> } | { allowed: false; response: HandlerResponse } {
  const origin = extractOrigin(event);
  const allowlist = getAllowedOrigins();

  if (!origin || !allowlist.has(origin)) {
    return {
      allowed: false,
      response: {
        statusCode: 403,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Origin not allowed" }),
      },
    };
  }

  return {
    allowed: true,
    origin,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      Vary: "Origin",
    },
  };
}

// Per-IP sliding-window rate limiter (in-memory per warm function instance)
const ipHits = new Map<string, number[]>();

export function _resetRateLimitForTests() {
  ipHits.clear();
}

export function getClientIp(event: HandlerEvent): string {
  const direct =
    event.headers["x-nf-client-connection-ip"] ||
    event.headers["client-ip"] ||
    event.headers["x-forwarded-for"];
  if (!direct) return "unknown";
  return direct.split(",")[0].trim() || "unknown";
}

export function checkRateLimit(
  event: HandlerEvent,
  corsHeaders: Record<string, string>,
  { maxRequests = 20, windowMs = 60_000 } = {},
): HandlerResponse | null {
  const ip = getClientIp(event);
  const now = Date.now();
  const cutoff = now - windowMs;
  const recent = (ipHits.get(ip) || []).filter((ts) => ts > cutoff);

  if (recent.length >= maxRequests) {
    const oldest = recent[0];
    const retryAfterSec = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    ipHits.set(ip, recent);
    return {
      statusCode: 429,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Retry-After": String(retryAfterSec),
      },
      body: JSON.stringify({ error: "Rate limit exceeded" }),
    };
  }

  recent.push(now);
  ipHits.set(ip, recent);
  return null;
}

export async function verifyFirebaseAuth(
  event: HandlerEvent,
  corsHeaders: Record<string, string>,
): Promise<{ uid: string } | { response: HandlerResponse }> {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      response: {
        statusCode: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Authentication required" }),
      },
    };
  }

  const idToken = authHeader.slice("Bearer ".length).trim();
  const firebaseApiKey =
    process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY;

  if (!idToken || !firebaseApiKey) {
    return {
      response: {
        statusCode: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Authentication configuration missing" }),
      },
    };
  }

  try {
    const res = await fetch(
      `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(firebaseApiKey)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      },
    );

    if (!res.ok) {
      return {
        response: {
          statusCode: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid or expired auth token" }),
        },
      };
    }

    const data = (await res.json()) as { users?: Array<{ localId?: string }> };
    const uid = data.users?.[0]?.localId;
    if (!uid) {
      return {
        response: {
          statusCode: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          body: JSON.stringify({ error: "Invalid auth user" }),
        },
      };
    }

    return { uid };
  } catch {
    return {
      response: {
        statusCode: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        body: JSON.stringify({ error: "Token verification failed" }),
      },
    };
  }
}
