// Single responsibility: main-thread requestAnimationFrame loop that drives
// cross-dissolve timing and reports alpha values to BroadcastBus on each frame.

export type TransitionType = "cross_dissolve" | "none";

export interface TransitionConfig {
  type: TransitionType;
  durationMs: number;
}

export class TransitionEngine {
  private rafId: number | null = null;

  constructor() {
    console.log("[TransitionEngine] created");
  }

  /**
   * Run a cross-dissolve transition on the main-thread RAF loop.
   * @param config  Transition type and duration.
   * @param onFrame Called each frame with alpha ∈ [0, 1].
   * @param onComplete Called once when alpha reaches 1.
   */
  crossDissolve(
    config: TransitionConfig,
    onFrame: (alpha: number) => void,
    onComplete: () => void
  ): void {
    this.cancel();

    if (config.type === "none" || config.durationMs <= 0) {
      onFrame(1);
      onComplete();
      return;
    }

    const startTime = performance.now();
    const { durationMs } = config;

    const tick = (now: number) => {
      const elapsed = now - startTime;
      const alpha = Math.min(elapsed / durationMs, 1);
      onFrame(alpha);

      if (alpha < 1) {
        this.rafId = requestAnimationFrame(tick);
      } else {
        this.rafId = null;
        console.log("[TransitionEngine] crossDissolve complete");
        onComplete();
      }
    };

    this.rafId = requestAnimationFrame(tick);
    console.log(`[TransitionEngine] crossDissolve started — ${durationMs}ms`);
  }

  cancel(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      console.log("[TransitionEngine] cancelled");
    }
  }

  destroy(): void {
    this.cancel();
    console.log("[TransitionEngine] destroyed");
  }
}
