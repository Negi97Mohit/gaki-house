// Single responsibility: define the immutable, serializable render-state snapshot
// sent to canvas.worker.ts via postMessage (structured clone algorithm).
// RULE: No class instances, no functions, no React refs — plain objects only.

import {
  SceneState,
  TextOverlayState,
  FileOverlayState,
  BrowserOverlayState,
} from "@gaki/core/types/caption";

// ─── Layer types ──────────────────────────────────────────────────────────────

export interface SceneGraphTextLayer {
  readonly type: "text";
  readonly id: string;
  readonly content: string;
  readonly position: { readonly x: number; readonly y: number }; // 0-100 %
  readonly size: { readonly width: number; readonly height: number }; // 0-100 %
  readonly zIndex: number;
  readonly rotation: number;
  readonly color: string;
  readonly fontFamily: string;
  readonly fontSize: number;
  readonly bold: boolean;
  readonly italic: boolean;
  readonly underline: boolean;
}

export interface SceneGraphFileLayer {
  readonly type: "image" | "video";
  readonly id: string;
  readonly url: string; // localhost asset-server URL — no File objects
  readonly position: { readonly x: number; readonly y: number };
  readonly size: { readonly width: number; readonly height: number };
  readonly zIndex: number;
  readonly rotation: number;
}

export interface SceneGraphBrowserLayer {
  readonly type: "browser";
  readonly id: string;
  readonly url: string;
  readonly position: { readonly x: number; readonly y: number };
  readonly size: { readonly width: number; readonly height: number };
  readonly zIndex: number;
  readonly rotation: number;
}

export type SceneGraphLayer =
  | SceneGraphTextLayer
  | SceneGraphFileLayer
  | SceneGraphBrowserLayer;

// ─── Root snapshot ────────────────────────────────────────────────────────────

export interface SceneGraph {
  readonly sceneId: string;
  readonly backgroundEffect: "none" | "blur" | "image";
  readonly backgroundImageUrl: string | null;
  readonly blankCanvasColor: string;
  /** Layers pre-sorted ascending by zIndex */
  readonly layers: readonly SceneGraphLayer[];
  /** Wall-clock timestamp for debugging / perf traces */
  readonly timestamp: number;
}

// ─── Factory ──────────────────────────────────────────────────────────────────

function textLayer(t: TextOverlayState): SceneGraphTextLayer {
  return {
    type: "text",
    id: t.id,
    content: t.content,
    position: { x: t.layout.position.x, y: t.layout.position.y },
    size: { width: t.layout.size.width, height: t.layout.size.height },
    zIndex: t.layout.zIndex,
    rotation: t.layout.rotation,
    color: t.style.color,
    fontFamily: t.style.fontFamily,
    fontSize: t.style.fontSize,
    bold: t.style.bold,
    italic: t.style.italic,
    underline: t.style.underline,
  };
}

function fileLayer(f: FileOverlayState): SceneGraphFileLayer {
  return {
    type: f.fileType === "video" ? "video" : "image",
    id: f.id,
    url: f.fileUrl,
    position: { x: f.layout.position.x, y: f.layout.position.y },
    size: { width: f.layout.size.width, height: f.layout.size.height },
    zIndex: f.layout.zIndex,
    rotation: f.layout.rotation,
  };
}

function browserLayer(b: BrowserOverlayState): SceneGraphBrowserLayer {
  return {
    type: "browser",
    id: b.id,
    url: b.url,
    position: { x: b.layout.position.x, y: b.layout.position.y },
    size: { width: b.layout.size.width, height: b.layout.size.height },
    zIndex: b.layout.zIndex,
    rotation: b.layout.rotation,
  };
}

/**
 * Build a serializable, immutable SceneGraph snapshot from a live SceneState.
 * Safe to pass to postMessage — no non-clonable values.
 */
export function buildSceneGraph(scene: SceneState): SceneGraph {
  const layers: SceneGraphLayer[] = [
    ...scene.textOverlays.map(textLayer),
    ...scene.fileOverlays.map(fileLayer),
    ...(scene.browserOverlays as BrowserOverlayState[]).map(browserLayer),
  ].sort((a, b) => a.zIndex - b.zIndex);

  return {
    sceneId: scene.id,
    backgroundEffect: scene.backgroundEffect,
    backgroundImageUrl: scene.backgroundImageUrl,
    blankCanvasColor: scene.blankCanvasColor,
    layers,
    timestamp: Date.now(),
  };
}
