/**
 * Critical flow tests for @gaki/handoff-sdk:
 * - Main handoff happy path: pushStreamTo -> OFFER received -> claimStream ->
 *   ACCEPTED received -> relinquishStream -> signal cleaned up
 * - Takeover happy path: pullStreamFrom -> TAKEOVER sent & claimStream called
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

type SnapshotCallback = (snap: {
  exists: () => boolean;
  data: () => unknown;
}) => Promise<void> | void;

const snapshotCallbacks = new Map<string, SnapshotCallback>();
const setDocMock = vi.fn(async () => {});
const deleteDocMock = vi.fn(async () => {});

vi.mock("firebase/firestore", () => ({
  doc: vi.fn((_db: unknown, path: string) => ({ path })),
  setDoc: (...args: unknown[]) => setDocMock(...(args as [])),
  deleteDoc: (...args: unknown[]) => deleteDocMock(...(args as [])),
  serverTimestamp: vi.fn(() => "SERVER_TIMESTAMP"),
  onSnapshot: vi.fn((ref: { path: string }, cb: SnapshotCallback) => {
    snapshotCallbacks.set(ref.path, cb);
    return () => snapshotCallbacks.delete(ref.path);
  }),
}));

const connectMock = vi.fn(async () => {});
const disconnectMock = vi.fn();

vi.mock("livekit-client", () => {
  class MockRoom {
    localParticipant = {
      trackPublications: new Map(),
    };
    on = vi.fn();
    connect = connectMock;
    disconnect = disconnectMock;
  }
  return {
    Room: MockRoom,
    RoomEvent: { ConnectionStateChanged: "connectionStateChanged" },
  };
});

import { HandoffCoordinator } from "../media/HandoffCoordinator";
import { StreamManager } from "../media/StreamManager";
import { handoffStore } from "../syncStore";

describe("handoff-sdk happy path", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.useFakeTimers();
    snapshotCallbacks.clear();
    setDocMock.mockClear();
    deleteDocMock.mockClear();
    connectMock.mockClear();
    disconnectMock.mockClear();

    handoffStore.setState({
      activeDevice: "",
      isRelinquishing: false,
    });

    globalThis.fetch = vi.fn(async () => ({
      json: async () => ({ token: "mock-livekit-jwt" }),
    })) as unknown as typeof fetch;
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
    vi.useRealTimers();
  });

  it("completes full push handoff: OFFER -> claimStream -> ACCEPTED -> relinquishStream", async () => {
    const db = {} as never;
    const desktopMgr = new StreamManager(
      "desktop-1",
      "https://handoff.test",
      async () => "firebase-jwt",
    );
    const mobileMgr = new StreamManager(
      "mobile-1",
      "https://handoff.test",
      async () => "firebase-jwt",
    );

    const desktopCoord = new HandoffCoordinator(db, "user-1", "desktop-1", desktopMgr);
    const mobileCoord = new HandoffCoordinator(db, "user-1", "mobile-1", mobileMgr);

    desktopCoord.listenForSignals();
    mobileCoord.listenForSignals();

    // 1. Desktop pushes stream to mobile
    await desktopCoord.pushStreamTo("mobile-1");
    expect(setDocMock).toHaveBeenCalledWith(
      { path: "users/user-1/handoff_signals/mobile-1" },
      expect.objectContaining({
        sourceDeviceId: "desktop-1",
        targetDeviceId: "mobile-1",
        action: "OFFER",
        status: "PENDING",
      }),
    );

    // 2. Mobile receives PENDING OFFER -> claims stream & sends ACCEPTED to desktop
    const mobileCb = snapshotCallbacks.get("users/user-1/handoff_signals/mobile-1");
    expect(mobileCb).toBeDefined();
    await mobileCb!({
      exists: () => true,
      data: () => ({
        sourceDeviceId: "desktop-1",
        targetDeviceId: "mobile-1",
        action: "OFFER",
        status: "PENDING",
      }),
    });

    expect(connectMock).toHaveBeenCalledWith(
      expect.any(String),
      "mock-livekit-jwt",
    );
    expect(handoffStore.getState().activeDevice).toBe("mobile-1");
    expect(setDocMock).toHaveBeenCalledWith(
      { path: "users/user-1/handoff_signals/desktop-1" },
      { status: "ACCEPTED" },
      { merge: true },
    );

    // 3. Desktop receives ACCEPTED -> relinquishes stream & cleans up signal
    const desktopCb = snapshotCallbacks.get("users/user-1/handoff_signals/desktop-1");
    await desktopCb!({
      exists: () => true,
      data: () => ({
        sourceDeviceId: "mobile-1",
        targetDeviceId: "desktop-1",
        action: "OFFER",
        status: "ACCEPTED",
      }),
    });

    expect(handoffStore.getState().isRelinquishing).toBe(true);
    expect(deleteDocMock).toHaveBeenCalledWith({
      path: "users/user-1/handoff_signals/desktop-1",
    });

    // Advance past 2500ms handoff overlap window -> room disconnects
    vi.advanceTimersByTime(2500);
    expect(disconnectMock).toHaveBeenCalledTimes(1);
    expect(handoffStore.getState().isRelinquishing).toBe(false);

    desktopCoord.disconnect();
    mobileCoord.disconnect();
  });

  it("supports pullStreamFrom takeover flow", async () => {
    const db = {} as never;
    const mobileMgr = new StreamManager(
      "mobile-1",
      "https://handoff.test",
      async () => "firebase-jwt",
    );
    const mobileCoord = new HandoffCoordinator(db, "user-1", "mobile-1", mobileMgr);

    await mobileCoord.pullStreamFrom("desktop-1");

    expect(setDocMock).toHaveBeenCalledWith(
      { path: "users/user-1/handoff_signals/desktop-1" },
      expect.objectContaining({
        sourceDeviceId: "mobile-1",
        targetDeviceId: "desktop-1",
        action: "TAKEOVER",
        status: "PENDING",
      }),
    );
    expect(connectMock).toHaveBeenCalledTimes(1);
    expect(handoffStore.getState().activeDevice).toBe("mobile-1");
  });
});
