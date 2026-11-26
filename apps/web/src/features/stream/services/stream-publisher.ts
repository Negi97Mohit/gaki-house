import { io, Socket } from "socket.io-client";
import { notify } from "@gaki/core/lib/notify";
import { useStreamStore } from "@/stores/stream.store";
import { BroadcastBus } from "@gaki/engine/kernel/engine/BroadcastBus";
import { AudioMixerEngine } from "@gaki/engine/kernel/engine/AudioMixerEngine";
import { BroadcastEncoder } from "@gaki/engine/kernel/engine/BroadcastEncoder";
import type { ElectronWindow } from "./stream.types";

const SERVER_URL = "http://localhost:3000";

export interface StreamTarget {
  id: string;
  url: string;
  key: string;
}

export interface PublisherHooks {
  useKernelPipeline: boolean;
  startPipeline: () => Promise<MediaStream>;
  cleanupPipeline: () => void;
  getActiveStream: () => MediaStream | null;
  getSupportedMimeType: () => string;
  onKernelEngines: (mixer: AudioMixerEngine | null, encoder: BroadcastEncoder | null) => void;
}

/**
 * Manages multistream RTMP/WebSocket publishing, per-destination verification,
 * exponential-backoff retries, and the 3-second go-live countdown.
 */
export class StreamPublisher {
  public socket: Socket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private broadcastEncoder: BroadcastEncoder | null = null;
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private verifyingTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private retryCounts = new Map<string, number>();
  private MAX_RETRIES = 3;
  private isIntentionalStop = false;

  constructor(private hooks: PublisherHooks) {}

  public async startStreaming(targets: StreamTarget[]) {
    try {
      this.isIntentionalStop = false;
      useStreamStore.getState().setConnecting(true);
      useStreamStore.getState().setStreamStatus("Initializing...");
      targets.forEach((t) => this.retryCounts.set(t.id, 0));

      if (this.hooks.useKernelPipeline) {
        const kernel = BroadcastBus.activeInstance;
        if (!kernel) throw new Error("BroadcastBus active instance not found");
        const canvasStream = kernel.getStream();
        if (!canvasStream) {
          console.warn("[StreamService] Kernel getStream() returned null, stream might fail");
        }
        const audioMixerEngine = new AudioMixerEngine();
        const audioStream = await audioMixerEngine.start();
        const activeTracks: MediaStreamTrack[] = [
          ...(canvasStream ? canvasStream.getVideoTracks() : []),
          ...(audioStream ? audioStream.getAudioTracks() : []),
        ];
        const finalStream = new MediaStream(activeTracks);
        this.broadcastEncoder = new BroadcastEncoder();
        this.hooks.onKernelEngines(audioMixerEngine, this.broadcastEncoder);
        this.broadcastEncoder.start(finalStream, {
          targets,
          onStatus: (data: unknown) => this.handleStreamStatus(data),
          onProgress: (data: unknown) => this.handleStreamProgress(data),
        });
      } else {
        await this.hooks.startPipeline();
        const isElectron = !!(window as ElectronWindow).electron;
        if (isElectron) {
          const activeStream = this.hooks.getActiveStream();
          if (!activeStream) throw new Error("No active stream for recorder");
          this.broadcastEncoder = new BroadcastEncoder();
          this.hooks.onKernelEngines(null, this.broadcastEncoder);
          this.broadcastEncoder.start(activeStream, {
            targets,
            onStatus: (data: unknown) => this.handleStreamStatus(data),
            onProgress: (data: unknown) => this.handleStreamProgress(data),
          });
        } else {
          this.setupMediaRecorder();
          await this.connectWeb(targets);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("[StreamService] Start Failed:", err);
      notify.error(`Start failed: ${msg}`);
      this.stopStreaming();
    }
  }

  private setupMediaRecorder(): string {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      return this.mediaRecorder.mimeType;
    }
    const activeStream = this.hooks.getActiveStream();
    if (!activeStream) throw new Error("No active stream for recorder");

    const mimeType = this.hooks.getSupportedMimeType();
    this.mediaRecorder = new MediaRecorder(activeStream, {
      mimeType,
      videoBitsPerSecond: 4000000,
    });

    const isElectron = !!(window as ElectronWindow).electron;
    this.mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size <= 0) return;
      if (isElectron) {
        const buffer = await e.data.arrayBuffer();
        (window as ElectronWindow).electron?.stream.sendData(buffer);
      } else if (this.socket && this.socket.connected) {
        this.socket.emit("binary-stream", e.data);
      }
    };

    this.mediaRecorder.start(1000);
    return mimeType;
  }

  private emitStartCommand(dest: StreamTarget, mimeType: string) {
    const isElectron = !!(window as ElectronWindow).electron;
    useStreamStore.getState().setDestinationStatus(dest.id, "starting");

    if (isElectron) {
      (window as ElectronWindow).electron!.stream.start({
        id: dest.id,
        rtmpUrl: dest.url,
        key: dest.key,
        mimeType,
      });
    } else if (this.socket) {
      this.socket.emit("start-stream", {
        id: dest.id,
        rtmpUrl: dest.url,
        key: dest.key,
      });
    }
  }

  private async connectWeb(targets: StreamTarget[]) {
    if (!this.socket) {
      this.socket = io(SERVER_URL);
      this.socket.on("stream-status", (data: unknown) => this.handleStreamStatus(data));
    }
    if (!this.socket.connected) {
      await new Promise<void>((resolve) => this.socket!.once("connect", () => resolve()));
    }
    targets.forEach((dest) => {
      useStreamStore.getState().setDestinationStatus(dest.id, "starting");
      this.emitStartCommand(dest, "video/webm");
    });
  }

  private handleStreamStatus(data: unknown) {
    const { id, status, error } =
      typeof data === "string"
        ? { id: undefined, status: data, error: undefined }
        : (data as { id?: string; status?: string; error?: string });
    if (!id) return;

    if (status === "error") {
      this.handleConnectionError(id, error || "Unknown stream error");
    } else if (status === "started") {
      this.startVerification(id);
    } else if (status === "stopped") {
      useStreamStore.getState().setDestinationStatus(id, "idle");
    }
  }

  private handleStreamProgress(data: unknown) {
    const { id, fps, kbps } = data as { id?: string; fps?: number; kbps?: number };
    if (id && typeof fps === "number") {
      useStreamStore.getState().updateDestination(id, { fps, kbps });
    }
  }

  private startVerification(id: string) {
    useStreamStore.getState().setDestinationStatus(id, "starting");
    useStreamStore.getState().setStreamStatus("Verifying Connection...");

    if (this.verifyingTimers.has(id)) clearTimeout(this.verifyingTimers.get(id)!);
    const timer = setTimeout(() => {
      const store = useStreamStore.getState();
      const currentDest = store.destinations.find((d) => d.id === id);
      if (currentDest && currentDest.status === "starting") {
        store.setDestinationStatus(id, "connected");
        this.retryCounts.set(id, 0);
        const updatedStore = useStreamStore.getState();
        const allConnected = updatedStore.destinations
          .filter((d) => d.enabled)
          .every((d) => d.status === "connected" || d.status === "live");
        if (allConnected && !updatedStore.isBroadcasting && !this.countdownInterval) {
          this.startCountdown();
        }
      }
    }, 3000);
    this.verifyingTimers.set(id, timer);
  }

  private handleConnectionError(id: string, errorMsg: string) {
    const store = useStreamStore.getState();
    if (this.verifyingTimers.has(id)) {
      clearTimeout(this.verifyingTimers.get(id)!);
      this.verifyingTimers.delete(id);
    }
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
      store.setCountdown(null);
    }
    if (this.isIntentionalStop) {
      store.setDestinationStatus(id, "idle");
      return;
    }

    const currentRetries = this.retryCounts.get(id) || 0;
    if (currentRetries < this.MAX_RETRIES) {
      const nextRetry = currentRetries + 1;
      this.retryCounts.set(id, nextRetry);
      store.setDestinationStatus(id, "error", `Retrying (${nextRetry})...`);
      store.setStreamStatus("Connection Failed. Retrying...");
      const dest = store.destinations.find((d) => d.id === id);
      if (dest) {
        setTimeout(() => {
          this.emitStartCommand(dest, this.mediaRecorder?.mimeType || "video/webm");
        }, 2000 * nextRetry);
      }
    } else {
      console.error(`[StreamService] Max retries exceeded for ${id}`);
      store.setDestinationStatus(id, "error", errorMsg);
      store.setStreamStatus("Connection Failed");
      store.setConnecting(false);
      store.setBroadcasting(false);
      if (store.setFatalError) store.setFatalError(errorMsg);
      else notify.error("Critical Stream Error: " + errorMsg);
    }
  }

  private startCountdown() {
    const store = useStreamStore.getState();
    let count = 3;
    store.setCountdown(count);
    store.setStreamStatus("Starting...");

    this.countdownInterval = setInterval(() => {
      count--;
      store.setCountdown(count);
      if (count <= 0) {
        clearInterval(this.countdownInterval!);
        this.countdownInterval = null;
        store.setCountdown(null);
        store.setBroadcasting(true);
        store.setConnecting(false);
        store.setStreamStatus("Live");
        store.destinations.forEach((d) => {
          if (d.status === "connected") store.setDestinationStatus(d.id, "live");
        });
      }
    }, 1000);
  }

  public stopStreaming(specificId?: string) {
    this.isIntentionalStop = true;
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
      useStreamStore.getState().setCountdown(null);
    }
    this.verifyingTimers.forEach((t) => clearTimeout(t));
    this.verifyingTimers.clear();

    const isElectron = !!(window as ElectronWindow).electron;
    if (specificId) {
      if (this.hooks.useKernelPipeline || isElectron) this.broadcastEncoder?.stop(specificId);
      else this.socket?.emit("stop-stream", { id: specificId });
      useStreamStore.getState().setDestinationStatus(specificId, "idle");
    } else {
      if (this.hooks.useKernelPipeline || isElectron) {
        this.broadcastEncoder?.stop();
      } else {
        this.socket?.emit("stop-stream");
        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
          this.mediaRecorder.stop();
        }
      }
      this.hooks.cleanupPipeline();
      const store = useStreamStore.getState();
      store.setBroadcasting(false);
      store.setConnecting(false);
      store.setStreamStatus("Idle");
      store.destinations.forEach((d) => store.setDestinationStatus(d.id, "idle"));
    }

    setTimeout(() => {
      this.isIntentionalStop = false;
    }, 1000);
  }
}
