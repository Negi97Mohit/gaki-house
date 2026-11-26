/**
 * Critical flow tests for apps/api-signaling/signaling-server.js:
 * - Client connect/disconnect
 * - Matchmaking & room join/leave
 * - Message relay (send-message, webrtc-offer, webrtc-answer, ice-candidate)
 *
 * Uses in-memory mocked Socket.IO server & sockets (no real network or open ports).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

const socketsMap = new Map();
let connectionHandler = null;

function createMockSocket(id) {
  const handlers = new Map();
  const emitted = [];
  const toEmitted = [];
  const rooms = new Set();

  const socket = {
    id,
    emitted,
    toEmitted,
    rooms,
    on: vi.fn((event, cb) => {
      handlers.set(event, cb);
    }),
    emit: vi.fn((event, payload) => {
      emitted.push({ event, payload });
    }),
    join: vi.fn((roomId) => {
      rooms.add(roomId);
    }),
    leave: vi.fn((roomId) => {
      rooms.delete(roomId);
    }),
    to: vi.fn((targetId) => ({
      emit: vi.fn((event, payload) => {
        toEmitted.push({ targetId, event, payload });
        const target = socketsMap.get(targetId);
        if (target) {
          target.emitted.push({ event, payload });
        }
      }),
    })),
    trigger(event, payload) {
      const cb = handlers.get(event);
      if (cb) cb(payload);
    },
  };

  socketsMap.set(id, socket);
  return socket;
}

vi.mock("express", () => {
  const app = { use: vi.fn(), get: vi.fn() };
  return { default: vi.fn(() => app) };
});

vi.mock("cors", () => ({ default: vi.fn(() => (_req, _res, next) => next?.()) }));

vi.mock("http", () => ({
  createServer: vi.fn(() => ({ listen: vi.fn() })),
}));

vi.mock("socket.io", () => {
  class MockServer {
    constructor() {
      this.sockets = { sockets: socketsMap };
    }
    on(event, cb) {
      if (event === "connection") {
        connectionHandler = cb;
      }
    }
  }
  return { Server: MockServer };
});

// Load signaling server after mocks are installed
await import("../signaling-server.js");

describe("api-signaling critical flows", () => {
  beforeEach(() => {
    socketsMap.clear();
  });

  it("connects two clients, matches them into a room, and relays messages", () => {
    const s1 = createMockSocket("user-1");
    const s2 = createMockSocket("user-2");

    connectionHandler(s1);
    connectionHandler(s2);

    // First client enters queue
    s1.trigger("request-match");
    expect(s1.emitted).toContainEqual({
      event: "match-status",
      payload: { status: "searching" },
    });

    // Second client matches with first
    s2.trigger("request-match");
    const matchEvent = s2.emitted.find((e) => e.event === "match-found");
    expect(matchEvent).toBeDefined();
    const { roomId } = matchEvent.payload;

    expect(s1.join).toHaveBeenCalledWith(roomId);
    expect(s2.join).toHaveBeenCalledWith(roomId);
    expect(s1.emitted).toContainEqual({
      event: "match-found",
      payload: { roomId, partnerId: "user-2", isInitiator: false },
    });

    // Message relay: user-2 -> user-1
    s2.trigger("send-message", { message: "hello!", roomId });
    expect(s1.emitted).toContainEqual(
      expect.objectContaining({
        event: "receive-message",
        payload: expect.objectContaining({
          message: "hello!",
          senderId: "user-2",
        }),
      }),
    );

    // WebRTC offer relay: user-2 -> user-1
    s2.trigger("webrtc-offer", { offer: { type: "offer" }, roomId });
    expect(s1.emitted).toContainEqual({
      event: "webrtc-offer",
      payload: { offer: { type: "offer" }, senderId: "user-2" },
    });

    // Clean up room via leave-room
    s1.trigger("leave-room");
    expect(s1.emitted).toContainEqual({ event: "room-left", payload: undefined });
    expect(s2.emitted).toContainEqual({
      event: "partner-disconnected",
      payload: { reason: "left" },
    });
  });

  it("notifies partner and cleans up room on client disconnect", () => {
    const s1 = createMockSocket("user-a");
    const s2 = createMockSocket("user-b");

    connectionHandler(s1);
    connectionHandler(s2);

    s1.trigger("request-match");
    s2.trigger("request-match");

    const { roomId } = s2.emitted.find((e) => e.event === "match-found").payload;

    // user-a disconnects unexpectedly
    s1.trigger("disconnect");

    expect(s2.emitted).toContainEqual({
      event: "partner-disconnected",
      payload: { reason: "disconnected" },
    });
    expect(s2.leave).toHaveBeenCalledWith(roomId);
  });

  it("removes waiting client from queue when they disconnect before matching", () => {
    const s1 = createMockSocket("queued-1");
    const s2 = createMockSocket("queued-2");

    connectionHandler(s1);
    connectionHandler(s2);

    s1.trigger("request-match");
    s1.trigger("disconnect");
    socketsMap.delete("queued-1");

    // s2 should now wait in queue instead of matching disconnected s1
    s2.trigger("request-match");
    expect(s2.emitted).toContainEqual({
      event: "match-status",
      payload: { status: "searching" },
    });

    s2.trigger("disconnect");
  });
});
