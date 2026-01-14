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
      console.log(
        "[StreamService] Pipeline already active, returning existing stream."
      );
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

        // Smart Selection Logic
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

    // Fallback Web
    return await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080 },
      audio: true,
    });
  }

  private mixAudioSources() {
    if (!this.audioContext || !this.audioDestination) return;

    // Mic
    if (this.micStream && this.micStream.getAudioTracks().length > 0) {
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      const gain = this.audioContext.createGain();
      gain.gain.value = 1.0;
      source.connect(gain);
      gain.connect(this.audioDestination);
    }

    // System Audio
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
      useStreamStore.getState().setConnecting(true);
      useStreamStore.getState().setStreamStatus("Initializing...");

      // Ensure Pipeline
      await this.startPipeline();

      // Setup Recorder
      const mimeType = this.setupMediaRecorder();

      // Connect
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
        // Send to Electron Main
        if (isElectron) {
          const buffer = await e.data.arrayBuffer();
          (window as ElectronWindow).electron?.stream.sendData(buffer);
        }
        // Send to Web Socket
        else if (this.socket && this.socket.connected) {
          this.socket.emit("binary-stream", e.data);
        }

        // Handle Local Recording if active
        // (You can wire up local recorder hooks here via events if needed)
      }
    };

    this.mediaRecorder.start(1000); // 1s chunks
    return mimeType;
  }

  private connectElectron(targets: any[], mimeType: string) {
    console.log("[StreamService] Connecting Electron...");
    const electron = (window as ElectronWindow).electron!;

    electron.stream.onStatus((data: any) => {
      console.log("[StreamService] Status:", data);
      this.handleStreamStatus(data);
    });

    targets.forEach((dest) => {
      useStreamStore.getState().setDestinationStatus(dest.id, "starting");
      electron.stream.start({
        id: dest.id,
        rtmpUrl: dest.url,
        key: dest.key,
        mimeType,
      });
    });
  }

  private async connectWeb(targets: any[]) {
    console.log("[StreamService] Connecting Web Socket...");
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
      this.socket!.emit("start-stream", {
        id: dest.id,
        rtmpUrl: dest.url,
        key: dest.key,
      });
    });
  }

  private handleStreamStatus(data: any) {
    const { id, status, error } =
      typeof data === "string" ? { status: data } : data;
    const store = useStreamStore.getState();

    if (id)
      store.setDestinationStatus(
        id,
        status === "started" ? "connected" : status,
        error
      );

    if (status === "started") {
      // Handle Countdown / Live transition
      if (!store.isBroadcasting && !this.countdownInterval) {
        this.startCountdown();
      } else if (store.isBroadcasting && id) {
        store.setDestinationStatus(id, "live");
      }
    }
  }

  private startCountdown() {
    console.log("[StreamService] Starting Countdown...");
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

        // Mark all connected as live
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

    // Clear countdown
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
      useStreamStore.getState().setCountdown(null);
    }

    const isElectron = !!(window as ElectronWindow).electron;

    if (specificId) {
      // Stop One
      if (isElectron)
        (window as ElectronWindow).electron?.stream.stop({ id: specificId });
      else this.socket?.emit("stop-stream", { id: specificId });
      useStreamStore.getState().setDestinationStatus(specificId, "idle");
    } else {
      // Stop All
      if (isElectron) (window as ElectronWindow).electron?.stream.stop();
      else this.socket?.emit("stop-stream");

      // Stop Recorder
      if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
        this.mediaRecorder.stop();
      }

      // Cleanup Pipeline?
      // NOTE: We generally keep the pipeline alive if the user might restart soon,
      // but for full stop, we clean up.
      this.cleanupPipeline();

      const store = useStreamStore.getState();
      store.setBroadcasting(false);
      store.setConnecting(false);
      store.setStreamStatus("Idle");
      store.destinations.forEach((d) =>
        store.setDestinationStatus(d.id, "idle")
      );
    }
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
