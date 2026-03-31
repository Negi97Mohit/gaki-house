/**
 * CompositorBridge — Main-thread controller that manages the compositor
 * Web Worker and feeds it data from the React application.
 *
 * Architecture:
 *   React stores (sceneCollection.store) ──► CompositorBridge ──► CompositorWorker
 *                                            │
 *                                            ├── Serializes scenes via SceneGraph
 *                                            ├── Captures source frames (video/canvas)
 *                                            ├── Sends frame data as ImageBitmaps
 *                                            └── Receives preview frames back
 *
 * The bridge also manages the MediaStream output for streaming/recording.
 *
 * Usage:
 *   const bridge = new CompositorBridge();
 *   await bridge.initialize();
 *   bridge.start();
 *   // ... the compositor is now running ...
 *   const stream = bridge.getOutputStream(); // for FFmpeg
 *   bridge.destroy();
 *
 * → See docs/electron/compositor.md for the full architecture
 */

import { serializeScene } from './SceneGraph';
import type { CompositorEvent, CompositorCommand, SerializedTransition } from './types';
import type { CompositorScene, OutputConfig, SceneTransition, DEFAULT_OUTPUT_CONFIG } from '@/types/compositor';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface CompositorBridgeOptions {
  /** Output resolution (default: 1920×1080) */
  width?: number;
  height?: number;
  /** Target FPS (default: 30) */
  fps?: number;
  /** Callback when preview frame is available */
  onPreviewFrame?: (bitmap: ImageBitmap) => void;
  /** Callback with current FPS */
  onFps?: (fps: number) => void;
  /** Callback on compositor error */
  onError?: (error: string) => void;
  /** Callback when compositor is ready */
  onReady?: () => void;
}

// ─── Source Frame Capture ────────────────────────────────────────────────────

interface SourceCapture {
  sourceId: string;
  type: 'video' | 'canvas';
  element: HTMLVideoElement | HTMLCanvasElement;
  interval: number; // ms between captures
  timerId?: ReturnType<typeof setInterval>;
}

// ─── CompositorBridge Class ──────────────────────────────────────────────────

export class CompositorBridge {
  private worker: Worker | null = null;
  private outputCanvas: HTMLCanvasElement | null = null;
  private previewCanvas: HTMLCanvasElement | null = null;
  private previewCtx: CanvasRenderingContext2D | null = null;
  private options: CompositorBridgeOptions;
  private sourceCaptures: Map<string, SourceCapture> = new Map();
  private outputStream: MediaStream | null = null;
  private previewRAF: number | null = null;
  private isReady = false;
  private isRunning = false;

  constructor(options: CompositorBridgeOptions = {}) {
    this.options = {
      width: 1920,
      height: 1080,
      fps: 30,
      ...options,
    };
  }

  // ── Lifecycle ──

  /**
   * Initialize the compositor. Creates the worker, transfers an OffscreenCanvas to it,
   * and sets up the output pipeline.
   */
  async initialize(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Create the output canvas (hidden, used for captureStream)
        this.outputCanvas = document.createElement('canvas');
        this.outputCanvas.width = this.options.width!;
        this.outputCanvas.height = this.options.height!;
        this.outputCanvas.style.display = 'none';
        document.body.appendChild(this.outputCanvas);

        // Transfer OffscreenCanvas to worker
        const offscreen = this.outputCanvas.transferControlToOffscreen();

        // Create worker
        this.worker = new Worker(
          new URL('./CompositorWorker.ts', import.meta.url),
          { type: 'module' }
        );

        this.worker.onmessage = (e: MessageEvent<CompositorEvent>) => {
          this.handleWorkerMessage(e.data);
        };

        this.worker.onerror = (e) => {
          console.error('[CompositorBridge] Worker error:', e);
          this.options.onError?.(`Worker error: ${e.message}`);
        };

        // Wait for ready
        const onReady = () => {
          this.isReady = true;
          this.options.onReady?.();
          resolve();
        };

        // Store callback — will be called when we get the 'ready' event
        this._onReadyCallback = onReady;

        // Send init command
        this.sendCommand(
          {
            type: 'init',
            canvas: offscreen,
            resolution: { width: this.options.width!, height: this.options.height! },
          },
          [offscreen]
        );
      } catch (e: any) {
        reject(e);
      }
    });
  }

  private _onReadyCallback: (() => void) | null = null;

  /** Start the render loop */
  start(): void {
    if (!this.isReady) {
      console.warn('[CompositorBridge] Not ready yet');
      return;
    }
    this.sendCommand({ type: 'start' });
    this.isRunning = true;
    this.startPreviewLoop();
  }

  /** Stop the render loop (but keep the worker alive) */
  stop(): void {
    this.sendCommand({ type: 'stop' });
    this.isRunning = false;
    this.stopPreviewLoop();
  }

  /** Destroy everything — cleanup */
  destroy(): void {
    this.stop();
    this.stopAllCaptures();
    this.sendCommand({ type: 'destroy' });

    if (this.outputCanvas) {
      this.outputCanvas.remove();
      this.outputCanvas = null;
    }

    setTimeout(() => {
      this.worker?.terminate();
      this.worker = null;
    }, 100);

    this.isReady = false;
  }

  // ── Scene Management ──

  /** Push the current scene to the compositor */
  updateScene(scene: CompositorScene): void {
    const serialized = serializeScene(scene);
    this.sendCommand({ type: 'updateScene', scene: serialized });
  }

  /** Trigger a transition between two scenes */
  transition(
    from: CompositorScene,
    to: CompositorScene,
    transition: SceneTransition
  ): void {
    const serializedTransition: SerializedTransition = {
      type: transition.type,
      duration: transition.duration,
      easing: transition.easing,
      isStinger: transition.type === 'stinger',
    };

    this.sendCommand({
      type: 'transition',
      from: serializeScene(from),
      to: serializeScene(to),
      transition: serializedTransition,
    });
  }

  // ── Source Frame Feeding ──

  /**
   * Register a video element as a frame source.
   * The bridge will capture frames at the configured FPS and send them to the worker.
   */
  registerVideoSource(sourceId: string, videoElement: HTMLVideoElement): void {
    this.unregisterSource(sourceId);

    const capture: SourceCapture = {
      sourceId,
      type: 'video',
      element: videoElement,
      interval: Math.floor(1000 / (this.options.fps ?? 30)),
    };

    capture.timerId = setInterval(() => {
      this.captureVideoFrame(capture);
    }, capture.interval);

    this.sourceCaptures.set(sourceId, capture);
  }

  /**
   * Register a canvas element as a frame source (for screen share, generated HTML, etc).
   */
  registerCanvasSource(sourceId: string, canvasElement: HTMLCanvasElement): void {
    this.unregisterSource(sourceId);

    const capture: SourceCapture = {
      sourceId,
      type: 'canvas',
      element: canvasElement,
      interval: Math.floor(1000 / (this.options.fps ?? 30)),
    };

    capture.timerId = setInterval(() => {
      this.captureCanvasFrame(capture);
    }, capture.interval);

    this.sourceCaptures.set(sourceId, capture);
  }

  /** Register a static image as a source (one-time upload) */
  async registerImageSource(sourceId: string, imageUrl: string): Promise<void> {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const bitmap = await createImageBitmap(blob);
      this.sendCommand(
        { type: 'updateSource', sourceId, frame: bitmap, sourceType: 'image' },
        [bitmap]
      );
    } catch (e) {
      console.error('[CompositorBridge] Failed to load image:', imageUrl, e);
    }
  }

  /** Unregister a source (stop capturing) */
  unregisterSource(sourceId: string): void {
    const capture = this.sourceCaptures.get(sourceId);
    if (capture?.timerId) {
      clearInterval(capture.timerId);
    }
    this.sourceCaptures.delete(sourceId);
    this.sendCommand({ type: 'removeSourceFrame', sourceId });
  }

  // ── Output Stream ──

  /** Get the output MediaStream (for FFmpeg / recording) */
  getOutputStream(fps?: number): MediaStream {
    if (!this.outputCanvas) {
      throw new Error('Compositor not initialized');
    }

    if (!this.outputStream) {
      this.outputStream = this.outputCanvas.captureStream(fps ?? this.options.fps ?? 30);
    }
    return this.outputStream;
  }

  // ── Preview ──

  /** Set a preview canvas to display compositor output */
  setPreviewCanvas(canvas: HTMLCanvasElement): void {
    this.previewCanvas = canvas;
    this.previewCtx = canvas.getContext('2d');
  }

  // ── Output Config ──

  setOutputConfig(config: Partial<OutputConfig>): void {
    this.sendCommand({
      type: 'setOutputConfig',
      config: {
        width: config.resolution?.width ?? this.options.width!,
        height: config.resolution?.height ?? this.options.height!,
        fps: config.fps ?? this.options.fps!,
      },
    });
    if (config.fps) this.options.fps = config.fps;
    if (config.resolution) {
      this.options.width = config.resolution.width;
      this.options.height = config.resolution.height;
    }
  }

  // ── Private Methods ──

  private handleWorkerMessage(event: CompositorEvent): void {
    switch (event.type) {
      case 'ready':
        this._onReadyCallback?.();
        this._onReadyCallback = null;
        break;

      case 'frame':
        this.drawPreview(event.bitmap);
        this.options.onPreviewFrame?.(event.bitmap);
        break;

      case 'fps':
        this.options.onFps?.(event.value);
        break;

      case 'error':
        console.error('[CompositorBridge] Worker error:', event.message);
        this.options.onError?.(event.message);
        break;

      case 'destroyed':
        // Worker cleaned up
        break;
    }
  }

  private captureVideoFrame(capture: SourceCapture): void {
    const video = capture.element as HTMLVideoElement;
    if (video.readyState < 2 || video.paused) return; // HAVE_CURRENT_DATA or better

    try {
      const bitmap = (video as any).requestVideoFrameCallback
        ? null // Will use VideoFrame API in future
        : null;

      // Use createImageBitmap for video capture
      createImageBitmap(video).then((bmp) => {
        this.sendCommand(
          { type: 'updateSource', sourceId: capture.sourceId, frame: bmp, sourceType: 'camera' },
          [bmp]
        );
      }).catch(() => {
        // Video may not be ready
      });
    } catch {
      // Ignore frame capture errors
    }
  }

  private captureCanvasFrame(capture: SourceCapture): void {
    const canvas = capture.element as HTMLCanvasElement;
    try {
      createImageBitmap(canvas).then((bmp) => {
        this.sendCommand(
          { type: 'updateSource', sourceId: capture.sourceId, frame: bmp, sourceType: 'canvas' },
          [bmp]
        );
      }).catch(() => {});
    } catch {
      // Ignore
    }
  }

  private drawPreview(bitmap: ImageBitmap): void {
    if (!this.previewCanvas || !this.previewCtx) return;

    const ctx = this.previewCtx;
    const canvas = this.previewCanvas;

    // Scale to fit preview canvas
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(bitmap, 0, 0);
    bitmap.close();
  }

  private startPreviewLoop(): void {
    const loop = () => {
      if (!this.isRunning) return;
      // Request a preview frame at ~15fps (half of output, for performance)
      this.sendCommand({ type: 'requestPreviewFrame' });
      this.previewRAF = requestAnimationFrame(loop);
    };

    // Use a slower interval for preview (no need for full FPS)
    const previewInterval = setInterval(() => {
      if (!this.isRunning) {
        clearInterval(previewInterval);
        return;
      }
      this.sendCommand({ type: 'requestPreviewFrame' });
    }, 66); // ~15fps
  }

  private stopPreviewLoop(): void {
    if (this.previewRAF !== null) {
      cancelAnimationFrame(this.previewRAF);
      this.previewRAF = null;
    }
  }

  private stopAllCaptures(): void {
    for (const [, capture] of this.sourceCaptures) {
      if (capture.timerId) clearInterval(capture.timerId);
    }
    this.sourceCaptures.clear();
  }

  private sendCommand(command: CompositorCommand, transfer?: Transferable[]): void {
    this.worker?.postMessage(command, transfer ?? []);
  }
}
