/**
 * Internal compositor types — used within the Web Worker render pipeline.
 * These are serializable (no DOM refs, no class instances) so they can
 * cross the Worker boundary via postMessage / structured clone.
 */

// ─── Worker Messages ─────────────────────────────────────────────────────────

/** Messages sent from the main thread TO the compositor worker */
export type CompositorCommand =
  | { type: 'init'; canvas: OffscreenCanvas; resolution: { width: number; height: number } }
  | { type: 'updateScene'; scene: SerializedScene }
  | { type: 'updateSource'; sourceId: string; frame: ImageBitmap; sourceType: string }
  | { type: 'removeSourceFrame'; sourceId: string }
  | { type: 'transition'; from: SerializedScene; to: SerializedScene; transition: SerializedTransition }
  | { type: 'setOutputConfig'; config: SerializedOutputConfig }
  | { type: 'setGridLayout'; layout: SerializedGridLayout | null }
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'destroy' }
  | { type: 'requestPreviewFrame' };

/** Messages sent from the compositor worker TO the main thread */
export type CompositorEvent =
  | { type: 'ready' }
  | { type: 'frame'; bitmap: ImageBitmap; timestamp: number }
  | { type: 'fps'; value: number }
  | { type: 'error'; message: string }
  | { type: 'destroyed' };

// ─── Serialized Data (Worker-safe) ───────────────────────────────────────────

/**
 * A scene stripped down to what the GPU compositor needs.
 * No React refs, no callbacks, no DOM elements.
 */
export interface SerializedScene {
  id: string;
  sources: SerializedSource[];
  gridLayout: SerializedGridLayout | null;
}

export interface SerializedSource {
  id: string;
  type: string;
  visible: boolean;
  opacity: number;
  blendMode: string;
  isBehindUser: boolean;
  transform: SerializedTransform;
  filters: SerializedFilter[];
  /** For text sources: pre-rendered text info */
  textRender?: {
    content: string;
    fontFamily: string;
    fontSize: number;
    fontWeight: string;
    fontStyle: string;
    color: string;
    backgroundColor: string;
    textAlign: string;
    outline?: { color: string; size: number };
    shadow?: { color: string; offsetX: number; offsetY: number; blur: number };
  };
  /** For color sources: fill color */
  color?: string;
  /** For image sources: already loaded as ImageBitmap and sent via updateSource */
  hasFrame: boolean;
  /** Children (for groups) */
  children: SerializedSource[];
}

export interface SerializedTransform {
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  cropTop: number;
  cropRight: number;
  cropBottom: number;
  cropLeft: number;
}

export interface SerializedFilter {
  id: string;
  type: string;
  enabled: boolean;
  settings: Record<string, any>;
}

export interface SerializedTransition {
  type: string;
  duration: number;
  easing: string;
  /** For stinger: stinger video frames are sent as ImageBitmaps */
  isStinger: boolean;
}

export interface SerializedOutputConfig {
  width: number;
  height: number;
  fps: number;
}

export interface SerializedGridLayout {
  columns: number;
  rows: number;
  gap: number;
  cells: SerializedGridCell[];
}

export interface SerializedGridCell {
  id: string;
  row: number;
  col: number;
  rowSpan: number;
  colSpan: number;
  sourceId: string | null;
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

// ─── Render State (internal to worker) ───────────────────────────────────────

/** Per-source GPU state */
export interface SourceGPUState {
  /** The WebGL texture holding the current frame */
  texture: WebGLTexture | null;
  /** Whether the texture has valid data */
  hasData: boolean;
  /** Last frame timestamp */
  lastUpdate: number;
  /** Texture dimensions */
  width: number;
  height: number;
}

/** Framebuffer Object for filter passes / transition rendering */
export interface FBOState {
  framebuffer: WebGLFramebuffer;
  texture: WebGLTexture;
  width: number;
  height: number;
}

/** Shader program info */
export interface ShaderProgramInfo {
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation | null>;
  attributes: Record<string, number>;
}
