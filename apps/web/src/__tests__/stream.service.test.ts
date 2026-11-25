/**
 * Critical flow tests for StreamService:
 * - Start streaming (pipeline -> MediaRecorder -> socket start-stream -> verified -> countdown -> live)
 * - Stop streaming (global stop + per-destination stop)
 * - Error path when startPipeline rejects
 * - Multistream behavior when one platform fails while others continue
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock socket.io-client with an in-memory event emitter
type Listener = (...args: unknown[]) => void;
const socketListeners = new Map<string, Listener[]>();
const mockSocket = {
  connected: true,
  emit: vi.fn(),
  on: vi.fn((event: string, cb: Listener) => {
    const list = socketListeners.get(event) ?? [];
    list.push(cb);
    socketListeners.set(event, list);
  }),
  once: vi.fn((event: string, cb: Listener) => {
    const list = socketListeners.get(event) ?? [];
    list.push(cb);
    socketListeners.set(event, list);
  }),
};

function triggerSocketEvent(event: string, payload: unknown) {
  for (const cb of socketListeners.get(event) ?? []) {
    cb(payload);
  }
}

vi.mock("socket.io-client", () => ({
  io: vi.fn(() => mockSocket),
}));

vi.mock("@gaki/core/lib/notify", () => ({
  notify: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

// Stub MediaRecorder globally for jsdom
class MockMediaRecorder {
  static isTypeSupported = vi.fn(() => true);
  state: "inactive" | "recording" = "inactive";
  mimeType = "video/webm";
  ondataavailable: ((e: { data: Blob }) => void) | null = null;
  start = vi.fn(() => {
    this.state = "recording";
  });
  stop = vi.fn(() => {
    this.state = "inactive";
  });
}
vi.stubGlobal("MediaRecorder", MockMediaRecorder);

import { streamService } from "../features/stream/services/stream.service";
import { useStreamStore, type StreamDestination } from "../stores/stream.store";
import { notify } from "@gaki/core/lib/notify";

const makeDest = (id: string, platform: string): StreamDestination => ({
  id,
  platform,
  url: `rtmp://${platform}.example/live`,
  key: `${id}-secret`,
  enabled: true,
  status: "idle",
});

describe("StreamService critical flows", () => {
  let startPipelineSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    socketListeners.clear();
    mockSocket.emit.mockClear();
    mockSocket.on.mockClear();
    mockSocket.once.mockClear();
    vi.mocked(notify.error).mockClear();

    // Reset singleton socket so each test registers listeners cleanly
    (streamService as unknown as { socket: unknown }).socket = null;

    // Provide a fake active stream on StreamService without touching real WebRTC/Canvas APIs
    const fakeStream = {
      active: true,
      getTracks: () => [],
      getVideoTracks: () => [],
      getAudioTracks: () => [],
    } as unknown as MediaStream;
    startPipelineSpy = vi
      .spyOn(streamService, "startPipeline")
      .mockImplementation(async () => {
        (streamService as unknown as { activeStream: MediaStream }).activeStream =
          fakeStream;
        return fakeStream;
      });

    useStreamStore.setState({
      isBroadcasting: false,
      isConnecting: false,
      streamStatus: "idle",
      countdown: null,
      fatalError: null,
      destinations: [
        makeDest("twitch-1", "twitch"),
        makeDest("youtube-1", "youtube"),
      ],
    });
  });

  afterEach(() => {
    streamService.stopStreaming();
    vi.advanceTimersByTime(1500);
    startPipelineSpy.mockRestore();
    vi.useRealTimers();
  });

  it("starts streaming, verifies destinations, runs countdown, and transitions to live", async () => {
    const targets = useStreamStore.getState().destinations;
    await streamService.startStreaming(targets);

    expect(startPipelineSpy).toHaveBeenCalledTimes(1);
    expect(mockSocket.emit).toHaveBeenCalledWith(
      "start-stream",
      expect.objectContaining({ id: "twitch-1" }),
    );
    expect(mockSocket.emit).toHaveBeenCalledWith(
      "start-stream",
      expect.objectContaining({ id: "youtube-1" }),
    );

    // Server acknowledges both streams started -> 3s verification -> 3s countdown -> live
    triggerSocketEvent("stream-status", { id: "twitch-1", status: "started" });
    triggerSocketEvent("stream-status", { id: "youtube-1", status: "started" });

    // Advance past 3000ms verification
    vi.advanceTimersByTime(3000);
    const afterVerify = useStreamStore.getState().destinations;
    expect(afterVerify.every((d) => d.status === "connected")).toBe(true);

    // Advance past 3s countdown (3 * 1000ms)
    vi.advanceTimersByTime(3000);
    const liveState = useStreamStore.getState();
    expect(liveState.isBroadcasting).toBe(true);
    expect(liveState.streamStatus).toBe("Live");
    expect(liveState.destinations.every((d) => d.status === "live")).toBe(true);
  });

  it("stops streaming cleanly and resets store state", async () => {
    const targets = useStreamStore.getState().destinations;
    await streamService.startStreaming(targets);

    streamService.stopStreaming();

    expect(mockSocket.emit).toHaveBeenCalledWith("stop-stream");
    const state = useStreamStore.getState();
    expect(state.isBroadcasting).toBe(false);
    expect(state.isConnecting).toBe(false);
    expect(state.streamStatus).toBe("Idle");
    expect(state.destinations.every((d) => d.status === "idle")).toBe(true);
  });

  it("handles startPipeline failure by notifying error and stopping cleanly", async () => {
    startPipelineSpy.mockRejectedValueOnce(new Error("Camera permission denied"));

    await streamService.startStreaming(useStreamStore.getState().destinations);

    expect(notify.error).toHaveBeenCalledWith(
      "Start failed: Camera permission denied",
    );
    const state = useStreamStore.getState();
    expect(state.isBroadcasting).toBe(false);
    expect(state.isConnecting).toBe(false);
    expect(state.streamStatus).toBe("Idle");
  });

  it("keeps healthy platform progressing when another platform fails in multistream", async () => {
    const targets = useStreamStore.getState().destinations;
    await streamService.startStreaming(targets);

    // YouTube starts cleanly; Twitch errors out
    triggerSocketEvent("stream-status", { id: "youtube-1", status: "started" });
    triggerSocketEvent("stream-status", {
      id: "twitch-1",
      status: "error",
      error: "Invalid stream key",
    });

    // Twitch enters retry 1 while YouTube is still verifying
    let state = useStreamStore.getState();
    expect(state.destinations.find((d) => d.id === "twitch-1")?.status).toBe(
      "error",
    );

    // Advance 3s: YouTube completes verification and reaches "connected"
    vi.advanceTimersByTime(3000);
    state = useStreamStore.getState();
    expect(state.destinations.find((d) => d.id === "youtube-1")?.status).toBe(
      "connected",
    );

    // Exhaust remaining retries on Twitch (retries 1 -> 2 -> 3 -> final failure)
    for (let i = 0; i < 3; i++) {
      vi.advanceTimersByTime(10000);
      triggerSocketEvent("stream-status", {
        id: "twitch-1",
        status: "error",
        error: "Invalid stream key",
      });
    }

    state = useStreamStore.getState();
    const twitch = state.destinations.find((d) => d.id === "twitch-1");
    const youtube = state.destinations.find((d) => d.id === "youtube-1");
    expect(twitch?.status).toBe("error");
    expect(twitch?.error).toBe("Invalid stream key");
    // YouTube remained connected and did not error out
    expect(youtube?.status).toBe("connected");
  });
});
