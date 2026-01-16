import { io, Socket } from "socket.io-client";
import { notify } from "@/shared/lib/notify";
import { useStreamStore } from "@/stores/stream.store";
import { useMediaStore } from "@/stores/media.store";

const SERVER_URL = "http://localhost:3000";

interface ElectronWindow extends Window {
  electron?: {
    getDesktopSources: (options: any) => Promise<any[]>;
    stream: {
      start: (config: any) => void;
      sendData: (chunk: ArrayBuffer) => void;
      stop: (config?: any) => void;
      onStatus: (callback: (data: any) => void) => void;
    };
  };
}

class StreamService {
  private static instance: StreamService;

  // Persistent State
  private socket: Socket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private activeStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioDestination: MediaStreamAudioDestinationNode | null = null;

  // Refs to source streams for cleanup
  private sourceStream: MediaStream | null = null;
  private micStream: MediaStream | null = null;

  // State flags
  private isPipelineActive = false;
  private countdownInterval: NodeJS.Timeout | null = null;

  // Connection Management
  private verifyingTimers = new Map<string, NodeJS.Timeout>();
  private retryCounts = new Map<string, number>();
  private MAX_RETRIES = 3;
  private isIntentionalStop = false; // Track if user explicitly stopped the stream

  private constructor() {
    // Singleton
  }

  public static getInstance(): StreamService {
    if (!StreamService.instance) {
      StreamService.instance = new StreamService();
    }
    return StreamService.instance;
  }

  // --- 1. MEDIA PIPELINE LOGIC ---

  public async startPipeline(): Promise<MediaStream> {
    if (this.activeStream && this.activeStream.active) {
      return this.activeStream;
    }

    console.log("[StreamService] Starting Pipeline...");

    // 1. Get Visual Source (Screen/Window)
    this.sourceStream = await this.getSourceStream();

    // 2. Get Mic Audio
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
    } catch (e) {
      console.warn("[StreamService] Mic access denied or not found", e);
    }

    // 3. Audio Mixing
    this.audioContext = new AudioContext();
    this.audioDestination = this.audioContext.createMediaStreamDestination();
    this.mixAudioSources();

    // 4. Combine
    const videoTracks = this.sourceStream.getVideoTracks();
    const audioTracks = this.audioDestination.stream.getAudioTracks();

    this.activeStream = new MediaStream([...videoTracks, ...audioTracks]);
    this.isPipelineActive = true;

    // Handle Source Ending (e.g. user stops sharing)
    videoTracks[0].onended = () => {
      console.log("[StreamService] Source track ended. Stopping pipeline.");
      this.stopStreaming();
    };

    return this.activeStream;
  }

  private async getSourceStream(): Promise<MediaStream> {
    const isElectron = !!(window as ElectronWindow).electron;

    if (isElectron) {
      try {
        const currentMode = useMediaStore.getState().screenShareMode;
        const electron = (window as ElectronWindow).electron!;
        const sources = await electron.getDesktopSources({
          types: ["window", "screen"],
        });

        let selectedSource: any = null;

        if (currentMode === "off") {
          selectedSource = sources.find((s: any) => s.id.startsWith("screen"));
        } else {
          selectedSource = sources.find(
            (s: any) =>
              s.name.includes("caption-cam") || s.name.includes("GAKI")
          );
        }

        if (!selectedSource) {
          selectedSource = sources.find((s: any) => s.id.startsWith("screen"));
        }

        if (selectedSource) {
          return await navigator.mediaDevices.getUserMedia({
            audio: {
              // @ts-ignore
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: selectedSource.id,
              },
            },
            video: {
              // @ts-ignore
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: selectedSource.id,
                minWidth: 1280,
                maxWidth: 1920,
                minHeight: 720,
                maxHeight: 1080,
                frameRate: { ideal: 30, max: 60 },
              },
            },
          } as any);
        }
      } catch (e) {
        console.error("[StreamService] Electron Capture Failed", e);
      }
    }

    return await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080 },
      audio: true,
    });
  }

  private mixAudioSources() {
    if (!this.audioContext || !this.audioDestination) return;

    if (this.micStream && this.micStream.getAudioTracks().length > 0) {
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      const gain = this.audioContext.createGain();
      gain.gain.value = 1.0;
      source.connect(gain);
      gain.connect(this.audioDestination);
    }

    if (this.sourceStream && this.sourceStream.getAudioTracks().length > 0) {
      const source = this.audioContext.createMediaStreamSource(
        this.sourceStream
      );
      const gain = this.audioContext.createGain();
      gain.gain.value = 0.8;
      source.connect(gain);
      gain.connect(this.audioDestination);
    }
  }

  // --- 2. STREAMING LOGIC ---

  public async startStreaming(targets: any[]) {
    try {
      // Reset the intentional stop flag when starting a new stream
      this.isIntentionalStop = false;

      useStreamStore.getState().setConnecting(true);
      useStreamStore.getState().setStreamStatus("Initializing...");

      // Reset Retries
      targets.forEach((t) => this.retryCounts.set(t.id, 0));

      await this.startPipeline();
      const mimeType = this.setupMediaRecorder();

      const isElectron = !!(window as ElectronWindow).electron;
      if (isElectron) {
        this.connectElectron(targets, mimeType);
      } else {
        await this.connectWeb(targets);
      }
    } catch (err: any) {
      console.error("[StreamService] Start Failed:", err);
      notify.error(`Start failed: ${err.message}`);
      this.stopStreaming();
    }
  }

  private setupMediaRecorder(): string {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      return this.mediaRecorder.mimeType;
    }

    if (!this.activeStream) throw new Error("No active stream for recorder");

    const mimeType = this.getSupportedMimeType();
    console.log(`[StreamService] Using codec: ${mimeType}`);

    this.mediaRecorder = new MediaRecorder(this.activeStream, {
      mimeType,
      videoBitsPerSecond: 4000000, // 4Mbps
    });

    const isElectron = !!(window as ElectronWindow).electron;

    this.mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        if (isElectron) {
          const buffer = await e.data.arrayBuffer();
          (window as ElectronWindow).electron?.stream.sendData(buffer);
        } else if (this.socket && this.socket.connected) {
          this.socket.emit("binary-stream", e.data);
        }
      }
    };

    this.mediaRecorder.start(1000);
    return mimeType;
  }

  private connectElectron(targets: any[], mimeType: string) {
    const electron = (window as ElectronWindow).electron!;

    electron.stream.onStatus((data: any) => {
      this.handleStreamStatus(data);
    });

    targets.forEach((dest) => {
      this.emitStartCommand(dest, mimeType);
    });
  }

  private emitStartCommand(dest: any, mimeType: string) {
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

  private async connectWeb(targets: any[]) {
    if (!this.socket) {
      this.socket = io(SERVER_URL);
      this.socket.on("stream-status", (data: any) =>
        this.handleStreamStatus(data)
      );
    }

    if (!this.socket.connected) {
      await new Promise<void>((resolve) =>
        this.socket!.once("connect", () => resolve())
      );
    }

    targets.forEach((dest) => {
      useStreamStore.getState().setDestinationStatus(dest.id, "starting");
      this.emitStartCommand(dest, "video/webm");
    });
  }

  // --- 3. STATUS HANDLING ---

  private handleStreamStatus(data: any) {
    const { id, status, error } =
      typeof data === "string" ? { status: data } : data;
    const store = useStreamStore.getState();

    console.log(
      `[StreamService] Status Update [${id}]: ${status}`,
      error || ""
    );

    if (!id) return;

    if (status === "error") {
      this.handleConnectionError(id, error);
      return;
    }

    if (status === "started") {
      this.startVerification(id);
    } else if (status === "stopped") {
      store.setDestinationStatus(id, "idle");
    }
  }

  private startVerification(id: string) {
    // Immediate UI update
    useStreamStore.getState().setDestinationStatus(id, "starting");
    useStreamStore.getState().setStreamStatus("Verifying Connection...");

    if (this.verifyingTimers.has(id)) {
      clearTimeout(this.verifyingTimers.get(id)!);
    }

    const timer = setTimeout(() => {
      // FIX: Get FRESH state inside the timeout callback
      const store = useStreamStore.getState();

      const currentDest = store.destinations.find((d) => d.id === id);

      // If we are still starting (didn't error out or stop)
      if (currentDest && currentDest.status === "starting") {
        console.log(`[StreamService] Verification passed for ${id}`);

        // Update status in store
        store.setDestinationStatus(id, "connected");
        this.retryCounts.set(id, 0);

        // FIX: Get FRESH state AGAIN to verify "allConnected" against the update we just made
        const updatedStore = useStreamStore.getState();

        const allConnected = updatedStore.destinations
          .filter((d) => d.enabled)
          .every((d) => d.status === "connected" || d.status === "live");

        if (
          allConnected &&
          !updatedStore.isBroadcasting &&
          !this.countdownInterval
        ) {
          this.startCountdown();
        }
      }
    }, 3000);

    this.verifyingTimers.set(id, timer);
  }

  private handleConnectionError(id: string, errorMsg: string) {
    const store = useStreamStore.getState();

    // 1. ABORT COUNTDOWN / VERIFICATION
    if (this.verifyingTimers.has(id)) {
      clearTimeout(this.verifyingTimers.get(id)!);
      this.verifyingTimers.delete(id);
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
      store.setCountdown(null);
    }

    // Skip retry logic if this was an intentional stop
    if (this.isIntentionalStop) {
      console.log(`[StreamService] Skipping retry for ${id} - intentional stop`);
      store.setDestinationStatus(id, "idle");
      return;
    }

    // 2. CHECK RETRY LOGIC
    const currentRetries = this.retryCounts.get(id) || 0;

    if (currentRetries < this.MAX_RETRIES) {
      const nextRetry = currentRetries + 1;
      this.retryCounts.set(id, nextRetry);

      const retryDelay = 2000 * nextRetry;

      console.log(
        `[StreamService] Retry ${nextRetry}/${this.MAX_RETRIES} for ${id} in ${retryDelay}ms`
      );
      store.setDestinationStatus(id, "error", `Retrying (${nextRetry})...`);
      store.setStreamStatus(`Connection Failed. Retrying...`);

      const dest = store.destinations.find((d) => d.id === id);
      if (dest) {
        setTimeout(() => {
          console.log(`[StreamService] Retrying connection for ${id}`);
          const mimeType = this.mediaRecorder?.mimeType || "video/webm";
          this.emitStartCommand(dest, mimeType);
        }, retryDelay);
      }
    } else {
      // 3. FINAL FAILURE -> TRIGGER FATAL ERROR DIALOG
      console.error(`[StreamService] Max retries exceeded for ${id}`);
      store.setDestinationStatus(id, "error", errorMsg);
      store.setStreamStatus("Connection Failed");
      store.setConnecting(false);
      store.setBroadcasting(false);

      // TRIGGER THE DIALOG
      if (store.setFatalError) {
        store.setFatalError(errorMsg);
      } else {
        // Fallback if setFatalError isn't in store yet
        notify.error("Critical Stream Error: " + errorMsg);
      }
    }
  }

  private startCountdown() {
    console.log("[StreamService] All targets verified. Starting Countdown...");
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
          if (d.status === "connected") {
            store.setDestinationStatus(d.id, "live");
          }
        });
      }
    }, 1000);
  }

  public stopStreaming(specificId?: string) {
    console.log("[StreamService] Stop Streaming:", specificId || "ALL");

    // Set flag to prevent retry logic from triggering
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
      if (isElectron)
        (window as ElectronWindow).electron?.stream.stop({ id: specificId });
      else this.socket?.emit("stop-stream", { id: specificId });
      useStreamStore.getState().setDestinationStatus(specificId, "idle");
    } else {
      if (isElectron) (window as ElectronWindow).electron?.stream.stop();
      else this.socket?.emit("stop-stream");

      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }

      this.cleanupPipeline();

      const store = useStreamStore.getState();
      store.setBroadcasting(false);
      store.setConnecting(false);
      store.setStreamStatus("Idle");
      store.destinations.forEach((d) =>
        store.setDestinationStatus(d.id, "idle")
      );
    }

    // Reset the flag after a short delay to allow for any pending status updates
    setTimeout(() => {
      this.isIntentionalStop = false;
    }, 1000);
  }

  private cleanupPipeline() {
    this.activeStream?.getTracks().forEach((t) => t.stop());
    this.sourceStream?.getTracks().forEach((t) => t.stop());
    this.micStream?.getTracks().forEach((t) => t.stop());
    this.audioContext?.close();

    this.activeStream = null;
    this.sourceStream = null;
    this.micStream = null;
    this.audioContext = null;
    this.audioDestination = null;
    this.isPipelineActive = false;
  }

  // --- Utils ---
  private getSupportedMimeType(): string {
    const types = [
      "video/webm; codecs=h264",
      "video/webm; codecs=vp9",
      "video/webm; codecs=vp8",
      "video/webm",
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm";
  }
}

export const streamService = StreamService.getInstance();
