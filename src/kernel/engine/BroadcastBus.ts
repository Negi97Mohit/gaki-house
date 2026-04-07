// Single responsibility: typed command bus that owns the canvas.worker.ts instance
// and exposes a clean API to the rest of the app (render, transition, destroy).
//
// IPC constraint: window.electron.stream.* is used by Phase D for FFmpeg.
// This class does NOT interact with Electron IPC — it is a pure browser Worker bridge.

import { SceneGraph } from "./SceneGraph";
import { TransitionEngine } from "./TransitionEngine";
import { EngineWatchdog } from "./EngineWatchdog";
import { AppStateSync } from "./StateSynchronizer";
import type { ObsOverlayState } from "@/types/caption";

// ─── Typed commands ───────────────────────────────────────────────────────────

export type BroadcastCommand =
  | { type: "INIT"; offscreen: OffscreenCanvas }
  | { type: "RENDER"; graph: SceneGraph }
  | { type: "RESIZE"; width: number; height: number }
  | { type: "TRANSITION_INIT"; from: SceneGraph; to: SceneGraph }
  | { type: "TRANSITION_FRAME"; alpha: number }
  | { type: "CAMERA_FRAME"; bitmap: ImageBitmap }
  | { type: "SCREEN_FRAME"; bitmap: ImageBitmap }
  | {
      type: "OVERLAY_FRAMES";
      frames: Array<{
        id: string;
        bitmap: ImageBitmap;
        x: number;
        y: number;
        w: number;
        h: number;
      }>;
    }
  | { type: "STINGER_START"; payload: { bitmap: ImageBitmap } }
  | { type: "STINGER_STOP" }
  // ─── OBS asset editor sync (Feature 9) ────────────────────────────────────
  | { type: "UPDATE_ASSET"; asset: ObsOverlayState }
  | { type: "REORDER_ASSETS"; orderedIds: string[] }
  | { type: "REMOVE_ASSET"; id: string }
  | { type: "BATCH_UPDATE"; overlays: ObsOverlayState[] }
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
  public readonly watchdog: EngineWatchdog;

  private cameraFeedAnimationFrame: number | null = null;
  private cameraSourceCanvas: HTMLCanvasElement | null = null;
  
  private screenFeedAnimationFrame: number | null = null;
  private screenSourceVideo: HTMLVideoElement | null = null;
  private assetUpdateRaf: number | null = null;
  private pendingAssetUpdates = new Map<string, ObsOverlayState>();

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

    this.watchdog = new EngineWatchdog();
    this.watchdog.start();

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

  public startCameraFeed(sourceCanvas: HTMLCanvasElement) {
    if (this.cameraSourceCanvas === sourceCanvas) return;
    this.stopCameraFeed();
    this.cameraSourceCanvas = sourceCanvas;
    console.log("[BroadcastBus] startCameraFeed: Linking camera canvas to worker via rAF");

    const loop = async () => {
      if (this.isDestroyed || !this.cameraSourceCanvas) return;
      
      try {
        if (this.cameraSourceCanvas.width > 0 && this.cameraSourceCanvas.height > 0) {
          const bitmap = await createImageBitmap(this.cameraSourceCanvas);
          this.worker.postMessage({ type: "CAMERA_FRAME", bitmap }, [bitmap]);
        }
      } catch (e) {
        // Ignored, might occur if canvas context is lost
      }
      this.cameraFeedAnimationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  public stopCameraFeed() {
    if (this.cameraFeedAnimationFrame) {
      cancelAnimationFrame(this.cameraFeedAnimationFrame);
      this.cameraFeedAnimationFrame = null;
    }
    this.cameraSourceCanvas = null;
  }

  // F2 Stinger Support
  public triggerStingerPlayback?: () => boolean;

  public sendStingerFrame(bitmap: ImageBitmap) {
    if (!this.worker) {
      bitmap.close();
      return;
    }
    this.worker.postMessage(
      {
        type: "STINGER_START",
        payload: { bitmap }
      },
      [bitmap] // transfer ownership directly
    );
  }

  public clearStinger() {
    if (this.worker) {
      this.worker.postMessage({ type: "STINGER_STOP" });
    }
  }

  public startScreenFeed(sourceVideo: HTMLVideoElement) {
    if (this.screenSourceVideo === sourceVideo) return;
    
    // Targeted fix for Strict Mode double-invoke: cancel rAF directly without triggering the warning log
    if (this.screenFeedAnimationFrame !== null) {
      cancelAnimationFrame(this.screenFeedAnimationFrame);
      this.screenFeedAnimationFrame = null;
      console.log("[BroadcastBus] startScreenFeed: cancelled previous screen rAF before restart");
    }
    
    this.screenSourceVideo = sourceVideo;
    console.log("[BroadcastBus] startScreenFeed: Linking screen video to worker via rAF");

    const loop = async () => {
      if (this.isDestroyed || !this.screenSourceVideo) return;
      
      try {
        if (this.screenSourceVideo.videoWidth > 0 && this.screenSourceVideo.videoHeight > 0) {
          const bitmap = await createImageBitmap(this.screenSourceVideo);
          this.worker.postMessage({ type: "SCREEN_FRAME", bitmap }, [bitmap]);
        }
      } catch (e) {
        // Ignored, might occur if video isn't ready
      }
      this.screenFeedAnimationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  public stopScreenFeed() {
    if (!this.screenSourceVideo && !this.screenFeedAnimationFrame) {
      console.warn("[BroadcastBus] stopScreenFeed called but no screen feed is running.");
      return;
    }
    if (this.screenFeedAnimationFrame) {
      cancelAnimationFrame(this.screenFeedAnimationFrame);
      this.screenFeedAnimationFrame = null;
    }
    this.screenSourceVideo = null;
    console.log("[BroadcastBus] stopScreenFeed: Screen feed stopped");
  }

  // ─── F3: Overlay Feeds ────────────────────────────────────────────────────────

  private overlayFeedAnimationFrame: number | null = null;
  private overlaySources: Array<{ id: string, source: HTMLImageElement | HTMLVideoElement, x: number, y: number, w: number, h: number, isVideo: boolean }> = [];

  public startOverlayFeeds(items: Array<{ id: string, type: 'image'|'video', source: HTMLImageElement | HTMLVideoElement, x: number, y: number, w: number, h: number }>) {
    this.stopOverlayFeeds();
    
    this.overlaySources = items.map(item => ({
      ...item,
      isVideo: item.type === 'video'
    }));

    if (this.overlaySources.length === 0) return;

    console.log(`[BroadcastBus] startOverlayFeeds: Linking ${items.length} overlays to worker via rAF`);

    const loop = async () => {
      if (this.isDestroyed || this.overlaySources.length === 0) return;

      const frames = [];
      for (const item of this.overlaySources) {
        try {
          const w = item.isVideo ? (item.source as HTMLVideoElement).videoWidth : (item.source as HTMLImageElement).naturalWidth;
          const h = item.isVideo ? (item.source as HTMLVideoElement).videoHeight : (item.source as HTMLImageElement).naturalHeight;
          if (w > 0 && h > 0) {
            const bitmap = await createImageBitmap(item.source);
            frames.push({ id: item.id, bitmap, x: item.x, y: item.y, w: item.w, h: item.h });
          }
        } catch (e) {
          // Ignored (e.g. video not ready yet)
        }
      }

      if (frames.length > 0) {
        // Send batch of overlay frames to worker. Transfer bitmaps.
        const bitmaps = frames.map(f => f.bitmap);
        this.worker.postMessage({ type: "OVERLAY_FRAMES", frames }, bitmaps);
      }

      this.overlayFeedAnimationFrame = requestAnimationFrame(loop);
    };
    loop();
  }

  public stopOverlayFeeds() {
    if (this.overlayFeedAnimationFrame) {
      cancelAnimationFrame(this.overlayFeedAnimationFrame);
      this.overlayFeedAnimationFrame = null;
    }
    this.overlaySources = [];
  }

  /**
   * Throttled single-asset update: at most one UPDATE_ASSET per animation frame.
   * Drops intermediate updates per asset id (keeps latest).
   */
  public dispatchAssetUpdateThrottled(asset: ObsOverlayState) {
    if (this.isDestroyed) return;
    this.pendingAssetUpdates.set(asset.id, asset);
    if (this.assetUpdateRaf !== null) return;

    this.assetUpdateRaf = requestAnimationFrame(() => {
      this.assetUpdateRaf = null;
      if (this.isDestroyed) return;
      const updates = Array.from(this.pendingAssetUpdates.values());
      this.pendingAssetUpdates.clear();
      for (const a of updates) {
        this.worker.postMessage({ type: "UPDATE_ASSET", asset: a } satisfies BroadcastCommand);
      }
    });
  }

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
        this.watchdog.reportFrameTick();
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
    this.stopCameraFeed();
    this.stopScreenFeed();
    this.stopOverlayFeeds();
    console.log("[BroadcastBus] destroy called");

    if (this.assetUpdateRaf !== null) {
      cancelAnimationFrame(this.assetUpdateRaf);
      this.assetUpdateRaf = null;
    }
    this.pendingAssetUpdates.clear();

    if (this.mirrorAnimationFrame) {
      cancelAnimationFrame(this.mirrorAnimationFrame);
      this.mirrorAnimationFrame = null;
    }

    if (this.canvasStream) {
      this.canvasStream.getTracks().forEach(t => t.stop());
      this.canvasStream = null;
    }

    this.watchdog.stop();

    if (BroadcastBus.activeInstance === this) {
      BroadcastBus.activeInstance = null;
    }

    this.transitionEngine.destroy();
    this.worker.postMessage({ type: "DESTROY" });
    // Allow the worker to process DESTROY before terminate
    setTimeout(() => this.worker.terminate(), 50);
  }
}
