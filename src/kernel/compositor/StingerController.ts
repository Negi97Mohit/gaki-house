export class StingerController {
  private video: HTMLVideoElement;
  private rafId: number | null = null;
  private onFrame: (bitmap: ImageBitmap) => void;

  constructor(onFrame: (bitmap: ImageBitmap) => void) {
    this.video = document.createElement("video");
    this.video.style.display = "none";
    this.video.crossOrigin = "anonymous";
    this.video.muted = true; // Stingers shouldn't emit DOM audio, logic might feed it to AudioMixerEngine later
    this.video.playsInline = true;
    this.onFrame = onFrame;
  }

  /**
   * Preload the stinger video using local-asset:// protocol to avoid 
   * indexedDB streaming overhead for large files.
   */
  preload(url: string) {
    if (!url) return;
    
    // Transform absolute disk paths to local-asset:// protocol
    let finalUrl = url;
    if (url.includes(":\\") || url.startsWith("/")) {
       finalUrl = "local-asset://" + encodeURIComponent(url);
    }
    
    if (this.video.src !== finalUrl) {
      this.video.src = finalUrl;
      this.video.load();
    }
  }

  /**
   * Play the stinger and start capturing frames to send to the worker.
   */
  play() {
    this.video.currentTime = 0;
    this.video.play().catch(err => console.error("Stinger playback failed", err));
    this.startCaptureLoop();

    // Stop capturing when the video ends natively
    this.video.onended = () => {
      this.stopCaptureLoop();
    };
  }

  private startCaptureLoop() {
    if (this.rafId !== null) return;

    // Use requestVideoFrameCallback if available for precise frame capturing,
    // otherwise fallback to requestAnimationFrame.
    const loop = () => {
      if (this.video.readyState >= 2 && !this.video.paused && !this.video.ended) {
        createImageBitmap(this.video)
          .then(bitmap => this.onFrame(bitmap))
          .catch(() => {});
      }
      
      if (!this.video.ended && !this.video.paused) {
        if ('requestVideoFrameCallback' in this.video) {
           (this.video as any).requestVideoFrameCallback(loop);
        } else {
           this.rafId = requestAnimationFrame(loop);
        }
      } else {
        this.stopCaptureLoop();
      }
    };

    if ('requestVideoFrameCallback' in this.video) {
        (this.video as any).requestVideoFrameCallback(loop);
    } else {
        this.rafId = requestAnimationFrame(loop);
    }
  }

  private stopCaptureLoop() {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  destroy() {
    this.stopCaptureLoop();
    this.video.src = "";
    this.video.load();
    this.video.onended = null;
  }
}
