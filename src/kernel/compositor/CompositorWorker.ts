/**
 * CompositorWorker — Web Worker that owns the OffscreenCanvas and runs
 * the GPU render loop. This is the heart of the new compositor.
 *
 * Communication:
 *   Main thread → Worker:  CompositorCommand messages
 *   Worker → Main thread:  CompositorEvent messages
 *
 * Lifecycle:
 *   1. Main thread creates OffscreenCanvas and transfers ownership
 *   2. Worker initializes WebGL 2 context
 *   3. Main thread pushes scene graph and source frames via postMessage
 *   4. Worker runs a requestAnimationFrame loop, compositing all sources
 *   5. Worker sends preview frames back as ImageBitmaps (transfer)
 *   6. The OffscreenCanvas also has captureStream() for output
 *
 * → See docs/electron/compositor.md for the full architecture
 */

import { SourceRenderer } from './SourceRenderer';
import { TransitionRenderer } from './TransitionRenderer';
import type {
  CompositorCommand,
  CompositorEvent,
  SerializedScene,
  SerializedTransition,
  SerializedOutputConfig,
} from './types';

// ─── Worker State ────────────────────────────────────────────────────────────

let canvas: OffscreenCanvas | null = null;
let gl: WebGL2RenderingContext | null = null;
let sourceRenderer: SourceRenderer | null = null;
let transitionRenderer: TransitionRenderer | null = null;

let currentScene: SerializedScene | null = null;
let running = false;
let rafId: number | null = null;
let targetFps = 30;
let outputWidth = 1920;
let outputHeight = 1080;

// FPS tracking
let frameCount = 0;
let fpsTimestamp = 0;

// Frame pacing
let lastFrameTime = 0;

// Preview requests
let previewRequested = false;

// ─── Message Handler ─────────────────────────────────────────────────────────

self.onmessage = (e: MessageEvent<CompositorCommand>) => {
  const msg = e.data;

  switch (msg.type) {
    case 'init':
      handleInit(msg.canvas, msg.resolution);
      break;

    case 'updateScene':
      currentScene = msg.scene;
      break;

    case 'updateSource':
      if (sourceRenderer && msg.frame) {
        sourceRenderer.updateSourceFrame(msg.sourceId, msg.frame);
        // Mark the source as having a frame in the current scene
        if (currentScene) {
          markSourceHasFrame(currentScene.sources, msg.sourceId);
        }
      }
      break;

    case 'removeSourceFrame':
      sourceRenderer?.removeSource(msg.sourceId);
      break;

    case 'transition':
      handleTransition(msg.from, msg.to, msg.transition);
      break;

    case 'setOutputConfig':
      handleOutputConfig(msg.config);
      break;

    case 'start':
      startRenderLoop();
      break;

    case 'stop':
      stopRenderLoop();
      break;

    case 'requestPreviewFrame':
      previewRequested = true;
      break;

    case 'destroy':
      handleDestroy();
      break;

    default:
      console.warn('[CompositorWorker] Unknown message type:', (msg as any).type);
  }
};

// ─── Initialization ──────────────────────────────────────────────────────────

function handleInit(
  offscreen: OffscreenCanvas,
  resolution: { width: number; height: number }
) {
  canvas = offscreen;
  outputWidth = resolution.width;
  outputHeight = resolution.height;
  canvas.width = outputWidth;
  canvas.height = outputHeight;

  gl = canvas.getContext('webgl2', {
    alpha: false,
    antialias: false,
    premultipliedAlpha: false,
    preserveDrawingBuffer: true, // Needed for captureStream
  });

  if (!gl) {
    postEvent({ type: 'error', message: 'Failed to get WebGL2 context' });
    return;
  }

  // Initial state
  gl.viewport(0, 0, outputWidth, outputHeight);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  sourceRenderer = new SourceRenderer(gl);
  transitionRenderer = new TransitionRenderer(gl);

  postEvent({ type: 'ready' });
}

// ─── Output Config ───────────────────────────────────────────────────────────

function handleOutputConfig(config: SerializedOutputConfig) {
  targetFps = config.fps;
  if (canvas && (canvas.width !== config.width || canvas.height !== config.height)) {
    canvas.width = config.width;
    canvas.height = config.height;
    outputWidth = config.width;
    outputHeight = config.height;
    gl?.viewport(0, 0, outputWidth, outputHeight);
  }
}

// ─── Transitions ─────────────────────────────────────────────────────────────

function handleTransition(
  from: SerializedScene,
  to: SerializedScene,
  transition: SerializedTransition
) {
  if (!gl || !sourceRenderer || !transitionRenderer) return;

  // Render "from" scene to FBO
  const fromFBO = transitionRenderer.getFromFBO(outputWidth, outputHeight);
  gl.bindFramebuffer(gl.FRAMEBUFFER, fromFBO.framebuffer);
  gl.viewport(0, 0, outputWidth, outputHeight);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  sourceRenderer.renderScene(from.sources, outputWidth, outputHeight, from.gridLayout);

  // Render "to" scene to FBO
  const toFBO = transitionRenderer.getToFBO(outputWidth, outputHeight);
  gl.bindFramebuffer(gl.FRAMEBUFFER, toFBO.framebuffer);
  gl.viewport(0, 0, outputWidth, outputHeight);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);
  sourceRenderer.renderScene(to.sources, outputWidth, outputHeight, to.gridLayout);

  // Reset to default framebuffer
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, outputWidth, outputHeight);

  // Update current scene to the target (for when transition completes)
  currentScene = to;

  // Start the transition
  transitionRenderer.start(transition.type, transition.duration, 'ease-in-out', () => {
    // Transition complete — scene already set
  });
}

// ─── Render Loop ─────────────────────────────────────────────────────────────

function startRenderLoop() {
  if (running) return;
  running = true;
  fpsTimestamp = performance.now();
  frameCount = 0;
  lastFrameTime = 0;
  rafId = requestAnimationFrame(renderFrame);
}

function stopRenderLoop() {
  running = false;
  if (rafId !== null) {
    cancelAnimationFrame(rafId);
    rafId = null;
  }
}

function renderFrame(timestamp: number) {
  if (!running) return;

  // Frame pacing
  const interval = 1000 / targetFps;
  const delta = timestamp - lastFrameTime;
  if (delta < interval * 0.9) {
    // Too soon — skip this frame
    rafId = requestAnimationFrame(renderFrame);
    return;
  }
  lastFrameTime = timestamp;

  if (!gl || !sourceRenderer) {
    rafId = requestAnimationFrame(renderFrame);
    return;
  }

  // Clear the canvas
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  gl.viewport(0, 0, outputWidth, outputHeight);
  gl.clearColor(0, 0, 0, 1);
  gl.clear(gl.COLOR_BUFFER_BIT);

  // If transitioning, render the transition
  if (transitionRenderer?.active) {
    transitionRenderer.render();
  } else if (currentScene) {
    // Normal render: composite all sources in the current scene
    sourceRenderer.renderScene(
      currentScene.sources,
      outputWidth,
      outputHeight,
      currentScene.gridLayout
    );
  }

  // FPS tracking
  frameCount++;
  const fpsElapsed = timestamp - fpsTimestamp;
  if (fpsElapsed >= 1000) {
    const fps = Math.round((frameCount * 1000) / fpsElapsed);
    postEvent({ type: 'fps', value: fps });
    frameCount = 0;
    fpsTimestamp = timestamp;
  }

  // Send preview frame if requested
  if (previewRequested && canvas) {
    previewRequested = false;
    try {
      const bitmap = canvas.transferToImageBitmap();
      postEvent({ type: 'frame', bitmap, timestamp }, [bitmap]);
    } catch {
      // transferToImageBitmap may fail if canvas is 0×0
    }
  }

  rafId = requestAnimationFrame(renderFrame);
}

// ─── Cleanup ─────────────────────────────────────────────────────────────────

function handleDestroy() {
  stopRenderLoop();
  sourceRenderer?.destroy();
  transitionRenderer?.destroy();
  sourceRenderer = null;
  transitionRenderer = null;
  gl = null;
  canvas = null;
  postEvent({ type: 'destroyed' });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function postEvent(event: CompositorEvent, transfer?: Transferable[]) {
  // @ts-expect-error — Worker postMessage typing
  self.postMessage(event, transfer ?? []);
}

function markSourceHasFrame(sources: any[], sourceId: string) {
  for (const s of sources) {
    if (s.id === sourceId) {
      s.hasFrame = true;
      return;
    }
    if (s.children?.length) markSourceHasFrame(s.children, sourceId);
  }
}
