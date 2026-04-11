import { AppLogger } from "./BroadcastLogger";

export class EngineWatchdog {
  private lastTick: number = Date.now();
  private intervalId: any = null;
  private isFailed: boolean = false;
  private frameCount: number = 0;
  private memoryUsage: number = 0;

  start() {
    this.lastTick = Date.now();
    this.isFailed = false;
    AppLogger.log("EngineWatchdog", "info", "Starting engine watchdog...");
    
    if (this.intervalId) clearInterval(this.intervalId);
    
    // Run health check roughly twice a second to report UI metrics
    this.intervalId = setInterval(() => {
      this.checkHealth();
    }, 500);
  }

  reportFrameTick() {
    this.lastTick = Date.now();
    this.frameCount++;
  }

  private checkHealth() {
    const now = Date.now();
    const timeSinceLastTick = now - this.lastTick;

    // UI tracking (checkHealth runs twice a second, so x2 = 1 second of frames)
    const currentFps = this.frameCount * 2;
    this.frameCount = 0;

    const mem = (performance as any).memory;
    this.memoryUsage = mem ? (mem.usedJSHeapSize / (1024 * 1024)) : 0;

    const event = new CustomEvent("broadcast-telemetry", {
      detail: { fps: currentFps, memoryMb: this.memoryUsage, isFailed: this.isFailed }
    });
    window.dispatchEvent(event);

    // Watchdog Trigger Threshold
    if (timeSinceLastTick >= 2000 && !this.isFailed) {
      this.triggerRecovery();
    }
  }

  private triggerRecovery() {
    this.isFailed = true;
    AppLogger.log("EngineWatchdog", "error", "Engine failed! No frames received for 2000ms. Triggering recovery sequence.");

    // Sequence 2: Stop Broadcast via Electron
    if ((window as any).electron?.stream) {
        (window as any).electron.stream.stop();
        AppLogger.log("EngineWatchdog", "warn", "Stream violently halted to prevent garbage data.");
    }
    
    // Sequence 3: Emit Broadcast-Engine-Failure CustomEvent for the UI
    window.dispatchEvent(new CustomEvent("broadcast-engine-failure"));
    
    // DO NOT RESTART AUTOMATICALLY
  }

  stop() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
  }
}
