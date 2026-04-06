// Single responsibility: typed command bus that owns the canvas.worker.ts instance
// and exposes a clean API to the rest of the app (render, transition, destroy).
//
// IPC constraint: window.electron.stream.* is used by Phase D for FFmpeg.
// This class does NOT interact with Electron IPC — it is a pure browser Worker bridge.

import { SceneGraph } from "./SceneGraph";
import { TransitionEngine } from "./TransitionEngine";

// ─── Typed commands ───────────────────────────────────────────────────────────

export type BroadcastCommand =
  | { type: "INIT"; offscreen: OffscreenCanvas }
  | { type: "RENDER"; graph: SceneGraph }
  | { type: "RESIZE"; width: number; height: number }
  | { type: "TRANSITION_INIT"; from: SceneGraph; to: SceneGraph }
  | { type: "TRANSITION_FRAME"; alpha: number }
  | { type: "DESTROY" };

// ─── Bus ──────────────────────────────────────────────────────────────────────

export class BroadcastBus {
  public static activeInstance: BroadcastBus | null = null;

  private readonly worker: Worker;
  private readonly transitionEngine: TransitionEngine;
  private isDestroyed = false;
  private canvasStream: MediaStream | null = null;
  private mirrorAnimationFrame: number | null = null;
  private readonly rawCanvas: HTMLCanvasElement; // the proxy canvas

  /**
   * @param canvas The raw HTMLCanvasElement whose control is transferred to the
   *               worker. transferControlToOffscreen() is called exactly once here.
   *
   * NOTE: Because VideoCanvas is re-keyed on scene change, this class is
   * re-instantiated on each scene switch (Phase C known limitation; reuse will
   * be addressed in a future cleanup pass by lifting the kernel to CanvasContainer).
   */
  constructor(canvas: HTMLCanvasElement) {
    console.log("[BroadcastBus] constructor — transferring canvas to worker");

    BroadcastBus.activeInstance = this;
    this.rawCanvas = canvas;
    const offscreen = canvas.transferControlToOffscreen();

    // Phase D: The Double Canvas Mirror Workaround
    // Chromium Bug 754408: captureStream() on an HTMLCanvasElement that has been
    // transferred to an OffscreenCanvas does not emit video frames.
    // Workaround: We create a hidden main-thread 1920x1080 canvas, capture its
    // stream, and continuously drawImage() from the proxy canvas onto it.
    this.startMirrorLoop();

    // Use new URL() syntax — NOT the ?worker shorthand — for Vite compatibility.
    this.worker = new Worker(
      new URL("../../kernel/workers/canvas.worker.ts", import.meta.url),
      { type: "module" }
    );

    this.worker.onerror = (e) => {
      console.error("[BroadcastBus] Worker error:", e.message, e);
    };

    // Transfer the OffscreenCanvas in the Transferable list so ownership
    // moves to the worker thread (zero-copy).
    this.worker.postMessage({ type: "INIT", offscreen }, [offscreen]);

    this.transitionEngine = new TransitionEngine();
    console.log("[BroadcastBus] worker started");
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  /**
   * Send a new scene graph snapshot for immediate rendering.
   */
  render(graph: SceneGraph): void {
    if (this.isDestroyed) return;
    this.worker.postMessage({ type: "RENDER", graph });
  }

  /**
   * Instruct the worker to resize its OffscreenCanvas context.
   */
  resize(width: number, height: number): void {
    if (this.isDestroyed) return;
    this.worker.postMessage({ type: "RESIZE", width, height });
  }

  /**
   * Animate a cross-dissolve between two scene graphs.
   * Sends TRANSITION_INIT once (heavy), then lightweight TRANSITION_FRAME per tick.
   */
  transition(from: SceneGraph, to: SceneGraph, durationMs: number): void {
    if (this.isDestroyed) return;

    // Ship both graphs to the worker once — avoid re-sending on each frame.
    this.worker.postMessage({ type: "TRANSITION_INIT", from, to });

    this.transitionEngine.crossDissolve(
      { type: "cross_dissolve", durationMs },
      (alpha) => {
        if (!this.isDestroyed) {
          this.worker.postMessage({ type: "TRANSITION_FRAME", alpha });
        }
      },
      () => {
        // Transition complete — render final "to" state at full opacity.
        if (!this.isDestroyed) {
          this.render(to);
        }
      }
    );
  }

  /**
   * Continuous loop that mirrors the proxy canvas to a hidden capture canvas.
   */
  private startMirrorLoop(): void {
    const hiddenCanvas = document.createElement("canvas");
    hiddenCanvas.width = 1920;
    hiddenCanvas.height = 1080;
    const ctx = hiddenCanvas.getContext("2d", { alpha: false });
    
    if (!ctx) {
      console.error("[BroadcastBus] Failed to get hidden canvas context");
      return;
    }

    this.canvasStream = hiddenCanvas.captureStream(30);

    const loop = () => {
      if (this.isDestroyed) return;
      
      try {
        // The rawCanvas acts as a proxy to the OffscreenCanvas worker.
        ctx.drawImage(this.rawCanvas, 0, 0, 1920, 1080);
      } catch (e) {
        // In rare cases where the context gets detached or isn't painted yet
      }

      this.mirrorAnimationFrame = requestAnimationFrame(loop);
    };

    loop();
  }

  /**
   * Return the raw video stream captured from the kernel canvas.
   * Captured natively before the offscreen handoff.
   */
  getStream(): MediaStream | null {
    if (!this.canvasStream) {
      console.warn("[BroadcastBus] getStream called but stream was not captured");
    }
    return this.canvasStream;
  }

  /**
   * Low-level escape hatch for commands not covered by typed helpers.
   */
  dispatch(command: BroadcastCommand): void {
    if (this.isDestroyed) return;
    this.worker.postMessage(command);
  }

  destroy(): void {
    if (this.isDestroyed) return;
    this.isDestroyed = true;
    console.log("[BroadcastBus] destroy called");

    if (this.mirrorAnimationFrame) {
      cancelAnimationFrame(this.mirrorAnimationFrame);
      this.mirrorAnimationFrame = null;
    }

    if (this.canvasStream) {
      this.canvasStream.getTracks().forEach(t => t.stop());
      this.canvasStream = null;
    }

    if (BroadcastBus.activeInstance === this) {
      BroadcastBus.activeInstance = null;
    }

    this.transitionEngine.destroy();
    this.worker.postMessage({ type: "DESTROY" });
    // Allow the worker to process DESTROY before terminate
    setTimeout(() => this.worker.terminate(), 50);
  }
}
