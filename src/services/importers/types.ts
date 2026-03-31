/**
 * Scene Collection Importer/Exporter — Shared Types
 *
 * Common interfaces used by the OBS and Streamlabs importers, and the
 * scene collection exporter.
 *
 * → See obsImporter.ts for OBS JSON parsing
 * → See streamlabsImporter.ts for .overlay/.zip parsing
 * → See sceneExporter.ts for export
 */

import type { SceneCollection, CompositorScene, CompositorSource } from '@/types/compositor';

// ─── Import Result ───────────────────────────────────────────────────────────

/** Status of a single imported item */
export type ImportItemStatus = 'success' | 'warning' | 'error' | 'skipped';

export interface ImportItemResult {
  name: string;
  type: 'scene' | 'source' | 'filter' | 'transition' | 'asset';
  status: ImportItemStatus;
  message?: string;
}

/** Overall import result */
export interface ImportResult {
  success: boolean;
  /** The imported scene collection (or null if import failed) */
  collection: SceneCollection | null;
  /** Per-item results for UI progress display */
  items: ImportItemResult[];
  /** List of missing asset file paths that need resolution */
  missingAssets: MissingAsset[];
  /** Warnings that don't block import */
  warnings: string[];
  /** Fatal errors that prevented import */
  errors: string[];
  /** Original format detected */
  format: 'obs' | 'streamlabs' | 'unknown';
}

/** A missing asset that needs user resolution */
export interface MissingAsset {
  /** Original path from the scene collection */
  originalPath: string;
  /** What type of asset it is */
  assetType: 'image' | 'video' | 'audio' | 'stinger' | 'other';
  /** Which source references this asset */
  referencedBy: string[];
  /** User-provided replacement path (filled in by resolution dialog) */
  resolvedPath?: string;
}

// ─── OBS Format Types ────────────────────────────────────────────────────────

/** OBS Scene Collection JSON root structure */
export interface OBSSceneCollection {
  name?: string;
  current_scene?: string;
  current_program_scene?: string;
  scene_order?: Array<{ name: string }>;
  sources: OBSSource[];
  transitions?: OBSTransition[];
  transition_duration?: number;
  groups?: OBSGroup[];
  modules?: Record<string, any>;
}

/** OBS source entry in the sources array */
export interface OBSSource {
  id: string;                     // OBS source type ID (e.g., 'image_source', 'dshow_input')
  name: string;
  versioned_id?: string;
  uuid?: string;
  prev_ver?: number;
  flags?: number;
  volume?: number;
  muted?: boolean;
  balance?: number;
  sync?: number;                  // Audio sync offset (nanoseconds)
  monitoring_type?: number;
  push_to_talk?: boolean;
  push_to_mute?: boolean;
  deinterlace_mode?: number;
  deinterlace_field_order?: number;
  /** Type-specific settings */
  settings: Record<string, any>;
  /** Filter chain */
  filters?: OBSFilter[];
  /** Hotkeys */
  hotkeys?: Record<string, any>;
  /** Grouping / mixing */
  mixers?: number;
}

/** OBS group structure (referenced by group sources) */
export interface OBSGroup {
  name: string;
  items: OBSSceneItem[];
}

/** OBS scene item (source placement within a scene) */
export interface OBSSceneItem {
  name: string;
  /** Source name (reference) */
  source_name?: string;
  id?: number;
  /** Transform (position, crop, scale) */
  pos: { x: number; y: number };
  rot: number;
  scale: { x: number; y: number };
  bounds: { x: number; y: number };
  bounds_type: number;
  bounds_align: number;
  crop_top: number;
  crop_bottom: number;
  crop_left: number;
  crop_right: number;
  alignment: number;
  visible: boolean;
  locked: boolean;
  blend_type?: string;
  /** Source UUID reference */
  source_uuid?: string;
  /** Private settings */
  private_settings?: Record<string, any>;
  /** Scene item ID */
  scene_item_id?: number;
  /** Group items (for group type) */
  group_items?: OBSSceneItem[];
}

/** OBS filter entry */
export interface OBSFilter {
  id: string;                     // Filter type ID (e.g., 'color_filter_v2')
  name: string;
  versioned_id?: string;
  enabled: boolean;
  settings: Record<string, any>;
}

/** OBS transition entry */
export interface OBSTransition {
  id: string;
  name: string;
  settings?: Record<string, any>;
}

// ─── Streamlabs Format Types ─────────────────────────────────────────────────

/** Streamlabs .overlay package manifest */
export interface StreamlabsManifest {
  name?: string;
  version?: string;
  description?: string;
  author?: string;
  /** Scene definitions within the overlay */
  scenes?: StreamlabsScene[];
  /** Asset categories */
  categories?: StreamlabsCategory[];
  /** Direct overlay/widget references */
  overlays?: StreamlabsOverlayDef[];
}

export interface StreamlabsScene {
  name: string;
  sources: StreamlabsSceneSource[];
}

export interface StreamlabsSceneSource {
  name: string;
  type: string;
  settings: Record<string, any>;
  transform?: {
    x: number;
    y: number;
    width: number;
    height: number;
    rotation?: number;
  };
  visible?: boolean;
}

export interface StreamlabsCategory {
  type: 'screens' | 'overlays' | 'alerts' | 'transitions' | 'stingers';
  files: string[];
}

export interface StreamlabsOverlayDef {
  name: string;
  type: string;
  url?: string;
  filePath?: string;
  settings?: Record<string, any>;
}

// ─── OBS Source Type Mapping ─────────────────────────────────────────────────

import type { SourceType } from '@/types/compositor';

/** Maps OBS source type IDs to GAKI source types */
export const OBS_SOURCE_TYPE_MAP: Record<string, SourceType> = {
  // Video capture
  'dshow_input': 'camera',
  'v4l2_input': 'camera',
  'av_capture_input': 'camera',
  'decklink-input': 'camera',

  // Display / monitor capture
  'monitor_capture': 'screen_capture',
  'display_capture': 'screen_capture',
  'xshm_input': 'screen_capture',
  'pipewire-screen-capture-source': 'screen_capture',

  // Window capture
  'window_capture': 'window_capture',
  'xcomposite_input': 'window_capture',

  // Image
  'image_source': 'image',
  'slideshow': 'image',

  // Media / video file
  'ffmpeg_source': 'media',
  'vlc_source': 'media',

  // Browser source
  'browser_source': 'browser',

  // Text
  'text_gdiplus': 'text',
  'text_gdiplus_v2': 'text',
  'text_gdiplus_v3': 'text',
  'text_ft2_source': 'text',
  'text_ft2_source_v2': 'text',

  // Color
  'color_source': 'color',
  'color_source_v2': 'color',
  'color_source_v3': 'color',

  // Scene (nested)
  'scene': 'scene',

  // Group
  'group': 'group',
};

/** OBS filter type ID → GAKI FilterType mapping */
export const OBS_FILTER_TYPE_MAP: Record<string, string> = {
  'color_filter': 'color_correction',
  'color_filter_v2': 'color_correction',
  'chroma_key_filter': 'chroma_key',
  'chroma_key_filter_v2': 'chroma_key',
  'color_key_filter': 'chroma_key',
  'color_key_filter_v2': 'chroma_key',
  'lut_filter': 'lut',
  'sharpness_filter': 'sharpen',
  'sharpness_filter_v2': 'sharpen',
  'scroll_filter': 'scroll',
  'crop_filter': 'crop_pad',
  'mask_filter': 'crop_pad',
  'gpu_delay': 'webgl_shader',
  'noise_gate_filter': 'css_filter',
  'noise_suppress_filter': 'css_filter',
  'noise_suppress_filter_v2': 'css_filter',
};

/** OBS bounds_type enum → BoundsType string */
export const OBS_BOUNDS_TYPE_MAP: Record<number, string> = {
  0: 'none',
  1: 'stretch',
  2: 'scale_inner',
  3: 'scale_outer',
  4: 'scale_to_width',
  5: 'scale_to_height',
  6: 'max_only',
};
