/// <reference lib="webworker" />
// Single responsibility: OffscreenCanvas compositor running on a dedicated thread.
// Receives typed commands from BroadcastBus via postMessage.
// RULE: No DOM access, no React, no Electron IPC — pure Canvas 2D API only.

import type { SceneGraph, SceneGraphLayer } from "../engine/SceneGraph";

export type {}; // ensures this file is treated as a module, not a script

// ─── State ────────────────────────────────────────────────────────────────────

let ctx: OffscreenCanvasRenderingContext2D | null = null;
// Stored on TRANSITION_INIT so TRANSITION_FRAME only sends a lightweight alpha value.
let pendingFrom: SceneGraph | null = null;
let pendingTo: SceneGraph | null = null;

// ─── Message handler ──────────────────────────────────────────────────────────

self.onmessage = (event: MessageEvent) => {
  const data = event.data as {
    type: string;
    offscreen?: OffscreenCanvas;
    graph?: SceneGraph;
    from?: SceneGraph;
    to?: SceneGraph;
    alpha?: number;
    width?: number;
    height?: number;
  };

  switch (data.type) {
    case "INIT": {
      if (!data.offscreen) {
        console.error("[canvas.worker] INIT: no OffscreenCanvas in message");
        return;
      }
      ctx = data.offscreen.getContext("2d");
      if (!ctx) {
        console.error("[canvas.worker] INIT: getContext('2d') returned null");
        return;
      }
      console.log(
        "[canvas.worker] INIT: OffscreenCanvas acquired",
        data.offscreen.width,
        "×",
        data.offscreen.height
      );
      break;
    }

    case "RENDER": {
      if (!ctx) {
        console.warn("[canvas.worker] RENDER: ctx not ready");
        return;
      }
      if (!data.graph) return;
      // Reset any pending transition state
      pendingFrom = null;
      pendingTo = null;
      clearCanvas(ctx);
      renderScene(ctx, data.graph, 1.0);
      console.log(
        "[canvas.worker] RENDER sceneId:",
        data.graph.sceneId,
        "layers:",
        data.graph.layers.length
      );
      break;
    }

    case "RESIZE": {
      if (!ctx || data.width === undefined || data.height === undefined) return;
      ctx.canvas.width = data.width;
      ctx.canvas.height = data.height;
      console.log(`[canvas.worker] RESIZE: ${data.width}×${data.height}`);
      // If we have a pending render state, we might want to re-render,
      // but for Phase C we'll let the main thread re-trigger a RENDER if necessary, 
      // or we just let it clear on the next render command.
      break;
    }

    case "TRANSITION_INIT": {
      // Store both graphs once — TRANSITION_FRAME messages only send alpha.
      pendingFrom = data.from ?? null;
      pendingTo = data.to ?? null;
      console.log("[canvas.worker] TRANSITION_INIT received");
      break;
    }

    case "TRANSITION_FRAME": {
      if (!ctx || !pendingFrom || !pendingTo) return;
      const alpha = data.alpha ?? 0;
      // Cross-dissolve: clear → paint "from" at (1-alpha) → paint "to" at alpha
      clearCanvas(ctx);
      renderScene(ctx, pendingFrom, 1 - alpha);
      renderScene(ctx, pendingTo, alpha);
      break;
    }

    case "DESTROY": {
      ctx = null;
      pendingFrom = null;
      pendingTo = null;
      console.log("[canvas.worker] DESTROY: context released");
      self.close();
      break;
    }

    default:
      console.warn("[canvas.worker] Unknown message type:", data.type);
  }
};

// ─── Rendering helpers ────────────────────────────────────────────────────────

function clearCanvas(ctx: OffscreenCanvasRenderingContext2D): void {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
}

/**
 * Paint a single SceneGraph onto the OffscreenCanvas at the given opacity.
 * Phase C: renders background + text layers. Image/video/browser layers are
 * composited by the video pipeline in Phase D (they require ImageBitmap or
 * VideoFrame from the main thread).
 */
function renderScene(
  ctx: OffscreenCanvasRenderingContext2D,
  graph: SceneGraph,
  alpha: number
): void {
  const { width, height } = ctx.canvas;

  ctx.save();
  ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

  // Background
  ctx.fillStyle = graph.blankCanvasColor ?? "#000000";
  ctx.fillRect(0, 0, width, height);

  // Layers (pre-sorted by zIndex in buildSceneGraph)
  for (const layer of graph.layers) {
    renderLayer(ctx, layer, width, height);
  }

  ctx.restore();
}

function renderLayer(
  ctx: OffscreenCanvasRenderingContext2D,
  layer: SceneGraphLayer,
  canvasWidth: number,
  canvasHeight: number
): void {
  // Convert % coords to px
  const x = (layer.position.x / 100) * canvasWidth;
  const y = (layer.position.y / 100) * canvasHeight;
  const w = (layer.size.width / 100) * canvasWidth;
  const h = (layer.size.height / 100) * canvasHeight;

  ctx.save();
  // Rotate around centre of element
  ctx.translate(x + w / 2, y + h / 2);
  ctx.rotate((layer.rotation * Math.PI) / 180);
  ctx.translate(-(w / 2), -(h / 2));

  switch (layer.type) {
    case "text": {
      const weight = layer.bold ? "bold " : "";
      const style = layer.italic ? "italic " : "";
      ctx.font = `${style}${weight}${layer.fontSize}px ${layer.fontFamily}`;
      ctx.fillStyle = layer.color;
      ctx.textBaseline = "top";
      if (layer.underline) {
        // Canvas has no native underline — draw a rect below the text
        const metrics = ctx.measureText(layer.content);
        ctx.fillRect(0, layer.fontSize + 2, metrics.width, 1);
      }
      ctx.fillText(layer.content, 0, 0);
      break;
    }
    case "image":
    case "video":
    case "browser":
      // Phase D: these require ImageBitmap / VideoFrame from the capture pipeline.
      // For now draw a labelled placeholder rect so the layout is visible.
      ctx.strokeStyle = "rgba(255,255,255,0.3)";
      ctx.lineWidth = 1;
      ctx.strokeRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.font = "12px Inter, sans-serif";
      ctx.fillText(`[${layer.type}]`, 4, 14);
      break;
  }

  ctx.restore();
}
