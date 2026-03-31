/**
 * GAKI Studio — Compositor Type System
 *
 * Clean-break replacement for the legacy SceneState/overlay model.
 * Designed for OBS/Streamlabs import/export compatibility.
 *
 * Key concepts:
 *   SceneCollection → Scene[] → Source[] (hierarchical, ordered by z-index)
 *   Each Source has a SourceType, type-specific Settings, a Transform, and a Filter chain.
 */

// ─── Source Types ────────────────────────────────────────────────────────────

/** Maps 1:1 with OBS source type identifiers where possible */
export type SourceType =
  | 'camera'           // Video capture device (OBS: dshow_input / v4l2_input)
  | 'screen_capture'   // Display / monitor capture (OBS: monitor_capture)
  | 'window_capture'   // Individual window capture (OBS: window_capture)
  | 'image'            // Static image file (OBS: image_source)
  | 'media'            // Video / audio file (OBS: ffmpeg_source)
  | 'browser'          // Browser source — URL rendered in hidden webview (OBS: browser_source)
  | 'text'             // Text with font styling (OBS: text_gdiplus / text_ft2_source)
  | 'color'            // Solid color fill (OBS: color_source)
  | 'group'            // Source group / folder (OBS: group)
  | 'scene'            // Nested scene reference (OBS: scene)
  | 'generated'        // AI-generated HTML overlay (GAKI-specific)
  | 'caption'          // Live caption overlay (GAKI-specific)
  | 'excalidraw'       // Drawing canvas overlay (GAKI-specific)
  | 'graph';           // Chart / graph overlay (GAKI-specific)

// ─── Source Settings (type-specific) ─────────────────────────────────────────

export interface CameraSourceSettings {
  deviceId: string;
  deviceName?: string;
  resolution?: { width: number; height: number };
  fps?: number;
}

export interface ScreenCaptureSettings {
  sourceId?: string;     // Electron desktopCapturer source ID
  sourceName?: string;
  captureAudio?: boolean;
}

export interface WindowCaptureSettings {
  windowId?: string;
  windowName?: string;
}

export interface ImageSourceSettings {
  url: string;            // File path or data URL or HTTP URL
  unloadWhenHidden?: boolean;
}

export interface MediaSourceSettings {
  url: string;            // File path or URL
  loop?: boolean;
  autoPlay?: boolean;
  volume?: number;        // 0..1
  speed?: number;         // playback rate
  startTime?: number;     // ms
  endTime?: number;       // ms
}

export interface BrowserSourceSettings {
  url: string;
  width?: number;         // Render width (default: 1920)
  height?: number;        // Render height (default: 1080)
  css?: string;           // Custom CSS injection
  refreshOnActive?: boolean;
  fps?: number;           // Render FPS (default: 30)
}

export interface TextSourceSettings {
  content: string;
  fontFamily: string;
  fontSize: number;       // px
  fontWeight: 'normal' | 'bold' | number;
  fontStyle: 'normal' | 'italic';
  color: string;          // CSS color
  backgroundColor: string;
  textAlign: 'left' | 'center' | 'right';
  verticalAlign: 'top' | 'middle' | 'bottom';
  outline?: { color: string; size: number };
  shadow?: { color: string; offsetX: number; offsetY: number; blur: number };
  padding?: number;
  wordWrap?: boolean;
  lineHeight?: number;
}

export interface ColorSourceSettings {
  color: string;          // CSS color (hex, rgba, etc.)
  width: number;
  height: number;
}

export interface GroupSourceSettings {
  // Groups just contain children — no extra settings
}

export interface SceneRefSettings {
  sceneId: string;        // Reference to another scene by ID
}

export interface GeneratedOverlaySettings {
  htmlContent: string;    // Full HTML/CSS/JS
  prompt?: string;        // The AI prompt that generated it
  sandboxed?: boolean;    // Whether to sandbox the iframe
}

export interface CaptionSourceSettings {
  styleName: string;      // Animation style ID (e.g., 'karaoke', 'pop-up')
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  bold: boolean;
  italic: boolean;
  textShadow?: string;
  width: number;          // % of canvas width
}

export interface ExcalidrawSourceSettings {
  elements: any[];        // Excalidraw element data
  backgroundColor?: string;
}

export interface GraphSourceSettings {
  chartType: 'bar' | 'line' | 'pie' | 'area';
  data: any;              // Recharts-compatible data
  config?: Record<string, any>;
}

/** Discriminated union of all source settings */
export type SourceSettings =
  | { type: 'camera'; settings: CameraSourceSettings }
  | { type: 'screen_capture'; settings: ScreenCaptureSettings }
  | { type: 'window_capture'; settings: WindowCaptureSettings }
  | { type: 'image'; settings: ImageSourceSettings }
  | { type: 'media'; settings: MediaSourceSettings }
  | { type: 'browser'; settings: BrowserSourceSettings }
  | { type: 'text'; settings: TextSourceSettings }
  | { type: 'color'; settings: ColorSourceSettings }
  | { type: 'group'; settings: GroupSourceSettings }
  | { type: 'scene'; settings: SceneRefSettings }
  | { type: 'generated'; settings: GeneratedOverlaySettings }
  | { type: 'caption'; settings: CaptionSourceSettings }
  | { type: 'excalidraw'; settings: ExcalidrawSourceSettings }
  | { type: 'graph'; settings: GraphSourceSettings };

// ─── Source Transform ────────────────────────────────────────────────────────

/** OBS-compatible alignment flags (bitmask) */
export enum Alignment {
  Center      = 0,
  Left        = 1 << 0,
  Right       = 1 << 1,
  Top         = 1 << 2,
  Bottom      = 1 << 3,
  TopLeft     = Top | Left,
  TopRight    = Top | Right,
  BottomLeft  = Bottom | Left,
  BottomRight = Bottom | Right,
}

/** How a source is scaled to fit its bounding box */
export type BoundsType = 'none' | 'stretch' | 'scale_inner' | 'scale_outer' | 'scale_to_width' | 'scale_to_height' | 'max_only';

export interface SourceTransform {
  /** Position in canvas pixels (top-left of the aligned bounding box) */
  position: { x: number; y: number };
  /** Rendered size in canvas pixels */
  size: { width: number; height: number };
  /** Rotation in degrees */
  rotation: number;
  /** Crop in pixels from each edge of the SOURCE (not the canvas) */
  crop: { top: number; right: number; bottom: number; left: number };
  /** Alignment anchor point */
  alignment: Alignment;
  /** Bounding box scaling mode */
  boundsType: BoundsType;
  /** Bounding box size (only used when boundsType !== 'none') */
  bounds: { width: number; height: number };
}

// ─── Source Filters ──────────────────────────────────────────────────────────

export type FilterType =
  | 'color_correction'
  | 'chroma_key'
  | 'lut'
  | 'sharpen'
  | 'blur'
  | 'scroll'
  | 'crop_pad'
  | 'webgl_shader'      // Custom GLSL shader
  | 'css_filter';       // CSS filter string (legacy compat)

export interface SourceFilter {
  id: string;
  name: string;
  type: FilterType;
  enabled: boolean;
  settings: Record<string, any>;
}

// ─── Source Audio ─────────────────────────────────────────────────────────────

export interface SourceAudioConfig {
  volume: number;         // 0..1 (linear)
  muted: boolean;
  monitorType: 'none' | 'monitor_only' | 'monitor_and_output';
  syncOffset: number;     // ms
  /** Audio tracks this source outputs to (1-6) */
  tracks: number[];
}

// ─── Compositor Source ───────────────────────────────────────────────────────

export interface CompositorSource {
  id: string;
  name: string;
  type: SourceType;
  /** Type-specific configuration */
  settings: Record<string, any>;
  /** Position, scale, rotation, crop */
  transform: SourceTransform;
  /** Ordered filter chain */
  filters: SourceFilter[];
  /** Whether this source is visible */
  visible: boolean;
  /** Whether this source is locked (can't drag/resize) */
  locked: boolean;
  /** Per-source audio configuration */
  audio: SourceAudioConfig;
  /** Child sources (for groups) */
  children: CompositorSource[];
  /** Opacity 0..1 */
  opacity: number;
  /** CSS blend mode for compositing */
  blendMode: GlobalCompositeOperation;
  /** Whether this source renders behind the user (depth compositing) */
  isBehindUser: boolean;
}

// ─── Transitions ─────────────────────────────────────────────────────────────

export type TransitionType =
  | 'cut'
  | 'fade'
  | 'slide_left'
  | 'slide_right'
  | 'slide_up'
  | 'slide_down'
  | 'wipe_left'
  | 'wipe_right'
  | 'zoom'
  | 'blur'
  | 'stinger';          // Video-based transition

export interface SceneTransition {
  type: TransitionType;
  /** Duration in milliseconds */
  duration: number;
  /** CSS easing function */
  easing: string;
  /** For stinger transitions: path to video file */
  stingerUrl?: string;
  /** For stinger transitions: at what % of the video does the scene cut */
  stingerCutPoint?: number;
}

// ─── Scene ───────────────────────────────────────────────────────────────────

export interface CompositorScene {
  id: string;
  name: string;
  /** Ordered sources (first = bottom, last = top) */
  sources: CompositorSource[];
  /** Transition used when switching TO this scene */
  transition: SceneTransition;
  /** Optional grid layout overlay (for grid section panels) */
  gridLayout: GridLayout | null;
}

// ─── Grid Layout (for Grid Section Panels) ───────────────────────────────────

export interface GridLayout {
  id: string;
  name: string;
  /** Grid template definition */
  columns: number;
  rows: number;
  /** Gap between cells in pixels */
  gap: number;
  /** Individual cell definitions */
  cells: GridCell[];
  /** Template identifier from layout presets */
  templateId?: string;
}

export interface GridCell {
  id: string;
  /** Grid position (0-indexed) */
  row: number;
  col: number;
  /** Grid span */
  rowSpan: number;
  colSpan: number;
  /** What source (by ID) is assigned to this cell, or null for empty */
  sourceId: string | null;
  /** Cell-specific overrides */
  backgroundColor?: string;
  padding?: number;
  borderRadius?: number;
}

// ─── Scene Collection ────────────────────────────────────────────────────────

export interface SceneCollection {
  id: string;
  name: string;
  /** All scenes in this collection */
  scenes: CompositorScene[];
  /** Currently active scene ID */
  activeSceneId: string;
  /** Canvas output resolution */
  canvasResolution: { width: number; height: number };
  /** Global audio mixer state */
  audioMixer: AudioMixerState;
  /** Default transition for scene switches */
  defaultTransition: SceneTransition;
  /** Metadata */
  createdAt: string;
  updatedAt: string;
  /** Original format if imported (for export fidelity) */
  importedFrom?: 'obs' | 'streamlabs' | null;
}

// ─── Audio Mixer ─────────────────────────────────────────────────────────────

export interface AudioMixerState {
  masterVolume: number;   // 0..1
  masterMuted: boolean;
  /** Per-source audio levels (runtime — not persisted) */
  levels: Record<string, AudioLevel>;
}

export interface AudioLevel {
  peak: number;           // 0..1 (for metering UI)
  rms: number;            // 0..1
}

// ─── Stream Health ───────────────────────────────────────────────────────────

export interface StreamHealth {
  fps: number;
  targetFps: number;
  bitrate: number;        // kbps
  targetBitrate: number;  // kbps
  droppedFrames: number;
  totalFrames: number;
  cpuUsage: number;       // 0..100
  uptime: number;         // seconds
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

// ─── Compositor Output Config ────────────────────────────────────────────────

export interface OutputConfig {
  /** Output resolution (defaults to canvasResolution) */
  resolution: { width: number; height: number };
  /** Target frame rate */
  fps: number;
  /** Video bitrate in kbps */
  videoBitrate: number;
  /** Video encoder preference */
  encoder: 'x264' | 'nvenc' | 'amf' | 'qsv' | 'videotoolbox' | 'auto';
  /** Encoder preset (speed vs quality) */
  preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium';
  /** Keyframe interval in seconds */
  keyframeInterval: number;
  /** Audio bitrate in kbps */
  audioBitrate: number;
  /** Audio sample rate */
  audioSampleRate: 44100 | 48000;
}

// ─── Factory Defaults ────────────────────────────────────────────────────────

export const DEFAULT_TRANSFORM: SourceTransform = {
  position: { x: 0, y: 0 },
  size: { width: 1920, height: 1080 },
  rotation: 0,
  crop: { top: 0, right: 0, bottom: 0, left: 0 },
  alignment: Alignment.TopLeft,
  boundsType: 'none',
  bounds: { width: 0, height: 0 },
};

export const DEFAULT_AUDIO: SourceAudioConfig = {
  volume: 1.0,
  muted: false,
  monitorType: 'none',
  syncOffset: 0,
  tracks: [1],
};

export const DEFAULT_TRANSITION: SceneTransition = {
  type: 'fade',
  duration: 300,
  easing: 'ease-in-out',
};

export const DEFAULT_OUTPUT_CONFIG: OutputConfig = {
  resolution: { width: 1920, height: 1080 },
  fps: 30,
  videoBitrate: 4500,
  encoder: 'auto',
  preset: 'veryfast',
  keyframeInterval: 2,
  audioBitrate: 160,
  audioSampleRate: 48000,
};

export const DEFAULT_GRID_LAYOUT: GridLayout = {
  id: 'default',
  name: 'Single',
  columns: 1,
  rows: 1,
  gap: 0,
  cells: [{
    id: 'cell-0-0',
    row: 0,
    col: 0,
    rowSpan: 1,
    colSpan: 1,
    sourceId: null,
  }],
};
