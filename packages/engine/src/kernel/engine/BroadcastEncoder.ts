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
}

export class BroadcastEncoder {
  private mediaRecorder: MediaRecorder | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    console.log("[BroadcastEncoder] instance created");
  }

  start(stream: MediaStream, config: BroadcastEncoderConfig) {
    console.log("[BroadcastEncoder] start() called");
    this.stream = stream;

    // We rely on window.electron being injected via preload
    const electron = (window as any).electron;
    if (!electron) {
      console.error("[BroadcastEncoder] Electron unavailable, streaming won't work in web-only mode yet");
      return;
    }

    electron.stream.onStatus(config.onStatus);

    const mimeType = this.getSupportedMimeType();
    console.log(`[BroadcastEncoder] Using codec: ${mimeType}`);

    this.mediaRecorder = new MediaRecorder(this.stream, {
      mimeType,
      videoBitsPerSecond: 4000000, // 4Mbps default
    });

    this.mediaRecorder.ondataavailable = async (e) => {
      console.log(`[BroadcastEncoder] chunk size: ${e.data.size}`);
      if (e.data.size > 0 && electron.stream) {
        const buffer = await e.data.arrayBuffer();
        electron.stream.sendData(buffer);
      }
    };

    // Begin chunking immediately
    this.mediaRecorder.start(1000);

    // Bootstrap endpoints
    config.targets.forEach((dest) => {
      console.log(`[BroadcastEncoder] Emitting start for destination: ${dest.id}`);
      electron.stream.start({
        id: dest.id,
        rtmpUrl: dest.url,
        key: dest.key,
        mimeType,
      });
    });
  }

  stop(specificId?: string) {
    console.log(`[BroadcastEncoder] stop() called (destination: ${specificId || 'ALL'})`);
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
    console.log("[BroadcastEncoder] Encoding pipeline halted");
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
