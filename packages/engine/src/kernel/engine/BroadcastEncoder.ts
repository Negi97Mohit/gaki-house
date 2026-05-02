// KNOWN LIMITATION: BroadcastBus is recreated on scene switches because
// it is instantiated inside CanvasView which remounts per scene.
// This will cause a brief stream drop during transitions.
// Fix: move BroadcastBus instantiation up to CanvasContainer in a future refactor.
// Tracked: Phase D known issue — stream drop on scene switch

// Single responsibility: encode an active MediaStream and route chunks to Electron
// via the `window.electron.stream` API without creating new IPC endpoints.

export interface BroadcastEncoderConfig {
  targets: any[];
  onStatus: (data: any) => void;
  onProgress?: (data: any) => void;
}

export class BroadcastEncoder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    // Singleton encoder
  }

  start(stream: MediaStream, config: BroadcastEncoderConfig) {
    this.stream = stream;

    // We rely on window.electron being injected via preload
    const electron = (window as any).electron;
    if (!electron) {
      console.error("[BroadcastEncoder] Electron unavailable, streaming won't work in web-only mode yet");
      return;
    }

    // Register status/progress listeners BEFORE ffmpeg starts so no events are missed
    electron.stream.onStatus(config.onStatus);
    if (electron.stream.onProgress && config.onProgress) {
      electron.stream.onProgress(config.onProgress);
    }

    const mimeType = this.getSupportedMimeType();
    console.log(`[BroadcastEncoder] Selected mimeType: ${mimeType || "empty (fallback)"}`);

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      videoBitsPerSecond: 4000000,
    });

    let ffmpegStarted = false;
    let pendingChunks: ArrayBuffer[] = [];
    const targetIds = config.targets.map((t) => t.id);
    const readyTargets = new Set<string>();

    if (electron.stream.onFfmpegReady) {
      electron.stream.onFfmpegReady((data: { id: string }) => {
        console.log(`[BroadcastEncoder] Target ${data.id} is ffmpeg-ready.`);
        readyTargets.add(data.id);
        
        // If all targets have spawned and are ready for data, flush the buffers!
        const allReady = targetIds.every((id) => readyTargets.has(id));
        if (allReady && pendingChunks.length > 0) {
          console.log(`[BroadcastEncoder] All ${targetIds.length} targets ready. Flushing ${pendingChunks.length} chunks.`);
          pendingChunks.forEach((chunk) => electron.stream.sendData(chunk));
          pendingChunks = [];
        }
      });
    }

    this.mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size === 0 || !electron.stream) return;

      const buffer = await e.data.arrayBuffer();

      if (!ffmpegStarted) {
        ffmpegStarted = true;
        pendingChunks.push(buffer);
        console.log(`[BroadcastEncoder] First chunk received (${buffer.byteLength} bytes). Starting ${config.targets.length} target(s) via IPC...`);

        // Start ffmpeg now that we have the first WebM chunk (with the header)
        config.targets.forEach((dest) => {
          electron.stream.start({
            id: dest.id,
            rtmpUrl: dest.url,
            key: dest.key,
            mimeType,
            platform: dest.platform, // Used for platform-specific resolutions in FFmpeg
          });
        });

        // We no longer forcefully flush. We must wait for ffmpeg-ready signal to guarantee no WebM header chunks are lost.

      } else {
        const allReady = targetIds.every((id) => readyTargets.has(id));
        if (!allReady) {
          console.log(`[BroadcastEncoder] Buffering chunk (${buffer.byteLength} bytes), waiting for targets...`);
          pendingChunks.push(buffer);
        } else {
          electron.stream.sendData(buffer);
        }
      }
    };

    // Start chunking — first ondataavailable fires after 1000ms
    console.log("[BroadcastEncoder] Starting MediaRecorder...");
    this.mediaRecorder.start(1000);
  }

  stop(specificId?: string) {
    const electron = (window as any).electron;
    
    if (specificId && electron) {
      electron.stream.stop({ id: specificId });
      return;
    }

    // Stop everything
    if (electron) {
      electron.stream.stop();
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
      this.mediaRecorder.stop();
    }

    this.mediaRecorder = null;
    this.stream = null;
  }

  private getSupportedMimeType(): string {
    const types = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=h264,opus",
      "video/webm",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return "";
  }
}
