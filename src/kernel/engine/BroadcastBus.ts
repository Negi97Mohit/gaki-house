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
  private readonly worker: Worker;
  private readonly transitionEngine: TransitionEngine;
  private isDestroyed = false;

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

    // transferControlToOffscreen can only be called once per canvas element.
    // The kernelRef guard in CanvasView.tsx prevents a second invocation.
    const offscreen = canvas.transferControlToOffscreen();

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
    this.transitionEngine.destroy();
    this.worker.postMessage({ type: "DESTROY" });
    // Allow the worker to process DESTROY before terminate
    setTimeout(() => this.worker.terminate(), 50);
  }
}
