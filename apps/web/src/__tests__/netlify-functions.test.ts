/**
 * Unit tests for hardened Netlify functions:
 * - deepgram-token.ts (origin allowlist, rate limit, Firebase auth, 10s TTL + usage:write)
 * - twitch-token.ts (origin allowlist, rate limit, token caching)
 * - kick-proxy.ts (strict origin allowlist / no wildcard CORS, path allowlist, rate limit)
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { HandlerEvent, HandlerContext } from "@netlify/functions";

const fetchMock = vi.fn();
vi.mock("node-fetch", () => ({
  default: (...args: unknown[]) => fetchMock(...args),
}));

import { handler as deepgramHandler } from "../../netlify/functions/deepgram-token";
import {
  handler as twitchHandler,
  _resetTwitchTokenCacheForTests,
} from "../../netlify/functions/twitch-token";
import { handler as kickHandler } from "../../netlify/functions/kick-proxy";
import { handler as geminiHandler } from "../../netlify/functions/gemini-proxy";
import { _resetRateLimitForTests } from "../../netlify/functions/_security";

const dummyContext = {} as HandlerContext;

function makeEvent(overrides: Partial<HandlerEvent> = {}): HandlerEvent {
  return {
    rawUrl: "http://localhost:8888/.netlify/functions/test",
    rawQuery: "",
    path: "/.netlify/functions/test",
    httpMethod: "GET",
    headers: {
      origin: "http://localhost:5173",
      "x-nf-client-connection-ip": "1.2.3.4",
    },
    multiValueHeaders: {},
    queryStringParameters: {},
    multiValueQueryStringParameters: {},
    body: null,
    isBase64Encoded: false,
    ...overrides,
  };
}

describe("hardened netlify functions", () => {
  const envBackup = { ...process.env };

  beforeEach(() => {
    _resetRateLimitForTests();
    _resetTwitchTokenCacheForTests();
    fetchMock.mockReset();
    process.env.DEEPGRAM_API_KEY = "dg-master";
    process.env.FIREBASE_WEB_API_KEY = "fb-api-key";
    process.env.TWITCH_CLIENT_ID = "tw-id";
    process.env.TWITCH_CLIENT_SECRET = "tw-secret";
  });

  afterEach(() => {
    process.env = { ...envBackup };
  });

  it("rejects disallowed origins with 403 and never returns wildcard CORS", async () => {
    const res = await kickHandler(
      makeEvent({
        headers: { origin: "https://evil.example" },
        queryStringParameters: { path: "/channels/test" },
      }),
      dummyContext,
    );
    expect(res?.statusCode).toBe(403);
    expect(res?.headers?.["Access-Control-Allow-Origin"]).toBeUndefined();
  });

  it("kick-proxy sets exact allowed origin (not *) and blocks disallowed paths", async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      text: async () => JSON.stringify({ slug: "test" }),
    });

    const okRes = await kickHandler(
      makeEvent({ queryStringParameters: { path: "/channels/test" } }),
      dummyContext,
    );
    expect(okRes?.statusCode).toBe(200);
    expect(okRes?.headers?.["Access-Control-Allow-Origin"]).toBe(
      "http://localhost:5173",
    );

    const badPathRes = await kickHandler(
      makeEvent({ queryStringParameters: { path: "/admin/secrets" } }),
      dummyContext,
    );
    expect(badPathRes?.statusCode).toBe(403);
  });

  it("deepgram-token requires signed-in Firebase user and requests 10s TTL + usage:write", async () => {
    const unauthRes = await deepgramHandler(makeEvent(), dummyContext);
    expect(unauthRes?.statusCode).toBe(401);

    // 1st fetch: Firebase accounts:lookup; 2nd fetch: Deepgram /projects/self/keys
    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ localId: "user-123" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ key: "temp-dg-key" }),
      });

    const okRes = await deepgramHandler(
      makeEvent({
        headers: {
          origin: "http://localhost:5173",
          authorization: "Bearer valid-firebase-jwt",
          "x-nf-client-connection-ip": "9.9.9.9",
        },
      }),
      dummyContext,
    );

    expect(okRes?.statusCode).toBe(200);
    expect(JSON.parse(okRes!.body!)).toEqual({ key: "temp-dg-key" });

    const dgCall = fetchMock.mock.calls[1];
    const dgBody = JSON.parse(dgCall[1].body);
    expect(dgBody.time_to_live_in_seconds).toBe(10);
    expect(dgBody.scopes).toEqual(["usage:write"]);
  });

  it("rate-limits excessive requests per IP with 429", async () => {
    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: "tw-tok", expires_in: 3600 }),
    });

    // Limit for twitch-token is 30/min
    for (let i = 0; i < 30; i++) {
      const r = await twitchHandler(makeEvent(), dummyContext);
      expect(r?.statusCode).toBe(200);
    }

    const blocked = await twitchHandler(makeEvent(), dummyContext);
    expect(blocked?.statusCode).toBe(429);
    expect(blocked?.headers?.["Retry-After"]).toBeDefined();
  });

  it("gemini-proxy requires POST, allowed origin, and Firebase auth", async () => {
    process.env.GEMINI_API_KEY = "gem-secret";

    const unauthRes = await geminiHandler(
      makeEvent({ httpMethod: "POST", body: JSON.stringify({ prompt: "hi" }) }),
      dummyContext,
    );
    expect(unauthRes?.statusCode).toBe(401);

    fetchMock
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ users: [{ localId: "user-gem" }] }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ candidates: [{ content: { parts: [{ text: "ok" }] } }] }),
      });

    const okRes = await geminiHandler(
      makeEvent({
        httpMethod: "POST",
        headers: {
          origin: "http://localhost:5173",
          authorization: "Bearer valid-firebase-jwt",
          "x-nf-client-connection-ip": "8.8.8.8",
        },
        body: JSON.stringify({ prompt: "hello", systemPrompt: "sys" }),
      }),
      dummyContext,
    );
    expect(okRes?.statusCode).toBe(200);
    expect(fetchMock.mock.calls[1][0]).toContain("key=gem-secret");
  });
});
