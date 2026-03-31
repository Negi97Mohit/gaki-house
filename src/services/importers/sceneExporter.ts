/**
 * Scene Collection Exporter
 *
 * Exports GAKI's SceneCollection → OBS-compatible JSON for portability.
 * Users can export their scenes and import them into OBS Studio or
 * other compatible applications.
 *
 * The exporter produces a valid OBS scene collection JSON with:
 *   - Source definitions with type-specific settings
 *   - Scene items with transforms and crops
 *   - Source filter chains
 *   - Audio mixer settings
 *
 * → See src/services/importers/obsImporter.ts for the reverse direction
 * → See docs/electron/obs-compositor.md for the source type mapping table
 */

import type {
  SceneCollection,
  CompositorScene,
  CompositorSource,
  SourceFilter,
  SourceTransform,
} from '@/types/compositor';
import type {
  OBSSceneCollection,
  OBSSource,
  OBSSceneItem,
  OBSFilter,
} from './types';
import { OBS_SOURCE_TYPE_MAP } from './types';

// ─── GAKI → OBS source type reverse map ─────────────────────────────────────

const GAKI_TO_OBS_TYPE: Record<string, string> = {
  'camera': 'dshow_input',
  'screen_capture': 'monitor_capture',
  'window_capture': 'window_capture',
  'image': 'image_source',
  'media': 'ffmpeg_source',
  'browser': 'browser_source',
  'text': 'text_gdiplus_v3',
  'color': 'color_source_v3',
  'group': 'group',
  'scene': 'scene',
  // GAKI-specific types → browser source (best approximation)
  'generated': 'browser_source',
  'caption': 'text_gdiplus_v3',
  'excalidraw': 'browser_source',
  'graph': 'browser_source',
};

// ─── GAKI → OBS filter type reverse map ──────────────────────────────────────

const GAKI_TO_OBS_FILTER: Record<string, string> = {
  'color_correction': 'color_filter_v2',
  'chroma_key': 'chroma_key_filter_v2',
  'lut': 'lut_filter',
  'sharpen': 'sharpness_filter_v2',
  'blur': 'scroll_filter',
  'scroll': 'scroll_filter',
  'crop_pad': 'crop_filter',
  'webgl_shader': 'color_filter_v2',
  'css_filter': 'color_filter_v2',
};

// ─── Main Export Function ────────────────────────────────────────────────────

/**
 * Export a GAKI SceneCollection to OBS-compatible JSON.
 */
export function exportToOBSJSON(collection: SceneCollection): string {
  const allSources: OBSSource[] = [];
  const sceneOrder: Array<{ name: string }> = [];

  // Track unique source names to avoid duplicates in the flat sources array
  const sourceNameSet = new Set<string>();

  for (const scene of collection.scenes) {
    sceneOrder.push({ name: scene.name });

    // Create the scene source (OBS treats scenes as sources)
    const sceneItems: OBSSceneItem[] = scene.sources.map((source, i) =>
      compositorSourceToSceneItem(source, i)
    );

    const sceneSource: OBSSource = {
      id: 'scene',
      name: scene.name,
      settings: { items: sceneItems },
      filters: [],
    };
    allSources.push(sceneSource);

    // Add each source as a top-level source definition
    const flatSources = flattenSources(scene.sources);
    for (const source of flatSources) {
      if (sourceNameSet.has(source.name)) continue;
      sourceNameSet.add(source.name);

      allSources.push(compositorSourceToOBSSource(source));
    }
  }

  const obsCollection: OBSSceneCollection = {
    name: collection.name,
    current_scene: collection.scenes.find((s) => s.id === collection.activeSceneId)?.name
      ?? collection.scenes[0]?.name ?? 'Scene 1',
    scene_order: sceneOrder,
    sources: allSources,
    transition_duration: collection.defaultTransition.duration,
  };

  return JSON.stringify(obsCollection, null, 2);
}

// ─── Source → OBS Source Conversion ──────────────────────────────────────────

function compositorSourceToOBSSource(source: CompositorSource): OBSSource {
  const obsType = GAKI_TO_OBS_TYPE[source.type] ?? 'browser_source';

  return {
    id: obsType,
    name: source.name,
    settings: settingsToOBS(source),
    filters: source.filters.map(filterToOBS),
    volume: source.audio?.volume ?? 1.0,
    muted: source.audio?.muted ?? false,
    monitoring_type: source.audio?.monitorType === 'monitor_only' ? 1
      : source.audio?.monitorType === 'monitor_and_output' ? 2
      : 0,
    sync: (source.audio?.syncOffset ?? 0) * 1_000_000, // ms → nanoseconds
  };
}

function compositorSourceToSceneItem(
  source: CompositorSource,
  index: number
): OBSSceneItem {
  const t = source.transform;

  return {
    name: source.name,
    source_name: source.name,
    id: index,
    pos: { x: t.position.x, y: t.position.y },
    rot: t.rotation,
    scale: { x: 1, y: 1 }, // We use bounds instead
    bounds: { x: t.size.width, y: t.size.height },
    bounds_type: t.boundsType === 'none' ? 0
      : t.boundsType === 'stretch' ? 1
      : t.boundsType === 'scale_inner' ? 2
      : t.boundsType === 'scale_outer' ? 3
      : 0,
    bounds_align: 0,
    crop_top: t.crop.top,
    crop_bottom: t.crop.bottom,
    crop_left: t.crop.left,
    crop_right: t.crop.right,
    alignment: t.alignment,
    visible: source.visible,
    locked: source.locked,
    blend_type: source.blendMode === 'lighter' ? 'additive'
      : source.blendMode === 'multiply' ? 'multiply'
      : source.blendMode === 'screen' ? 'screen'
      : 'normal',
    group_items: source.children.length > 0
      ? source.children.map((c, i) => compositorSourceToSceneItem(c, i))
      : undefined,
  };
}

// ─── Settings Conversion (GAKI → OBS) ───────────────────────────────────────

function settingsToOBS(source: CompositorSource): Record<string, any> {
  const s = source.settings;

  switch (source.type) {
    case 'camera':
      return {
        video_device_id: s.deviceId ?? '',
        device_name: s.deviceName ?? source.name,
      };

    case 'screen_capture':
      return {
        monitor: s.sourceId,
        capture_audio: s.captureAudio ?? false,
      };

    case 'window_capture':
      return {
        window: s.windowId,
        window_name: s.windowName ?? source.name,
      };

    case 'image':
      return {
        file: s.url ?? '',
        unload: s.unloadWhenHidden ?? true,
      };

    case 'media':
      return {
        local_file: s.url ?? '',
        looping: s.loop ?? false,
        close_when_inactive: !s.autoPlay,
      };

    case 'browser':
      return {
        url: s.url ?? 'about:blank',
        width: s.width ?? 1920,
        height: s.height ?? 1080,
        css: s.css ?? '',
        restart_when_active: s.refreshOnActive ?? false,
        fps: s.fps ?? 30,
      };

    case 'text':
      return {
        text: s.content ?? '',
        font: {
          face: s.fontFamily ?? 'Arial',
          size: s.fontSize ?? 48,
          flags: (s.fontWeight === 'bold' ? 1 : 0) | (s.fontStyle === 'italic' ? 2 : 0),
        },
        color: cssColorToOBS(s.color ?? '#ffffff'),
        bk_color: s.backgroundColor && s.backgroundColor !== 'transparent'
          ? cssColorToOBS(s.backgroundColor)
          : undefined,
        align: s.textAlign ?? 'left',
        valign: s.verticalAlign === 'middle' ? 'center' : s.verticalAlign ?? 'top',
        outline: !!s.outline,
        outline_color: s.outline ? cssColorToOBS(s.outline.color) : undefined,
        outline_size: s.outline?.size ?? 0,
        word_wrap: s.wordWrap ?? true,
      };

    case 'color':
      return {
        color: cssColorToOBS(s.color ?? '#000000'),
        width: s.width ?? 1920,
        height: s.height ?? 1080,
      };

    case 'generated':
    case 'caption':
    case 'excalidraw':
    case 'graph':
      // Export GAKI-specific types as browser sources with a data URI
      return {
        url: `data:text/html,<html><body>${encodeURIComponent(s.htmlContent ?? source.name)}</body></html>`,
        width: source.transform.size.width,
        height: source.transform.size.height,
      };

    default:
      return { ...s };
  }
}

// ─── Filter Conversion (GAKI → OBS) ─────────────────────────────────────────

function filterToOBS(filter: SourceFilter): OBSFilter {
  const obsType = GAKI_TO_OBS_FILTER[filter.type] ?? 'color_filter_v2';

  return {
    id: obsType,
    name: filter.name,
    enabled: filter.enabled,
    settings: { ...filter.settings },
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flattenSources(sources: CompositorSource[]): CompositorSource[] {
  const result: CompositorSource[] = [];
  for (const source of sources) {
    result.push(source);
    if (source.children.length > 0) {
      result.push(...flattenSources(source.children));
    }
  }
  return result;
}

/**
 * Converts CSS color to OBS ABGR format (32-bit integer).
 * OBS stores colors as 0xAABBGGRR (little-endian ABGR).
 */
function cssColorToOBS(color: string): number {
  // Handle hex colors
  if (color.startsWith('#')) {
    const hex = color.slice(1);
    if (hex.length === 3) {
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return (0xFF << 24) | (b << 16) | (g << 8) | r;
    }
    if (hex.length === 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return (0xFF << 24) | (b << 16) | (g << 8) | r;
    }
    if (hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      const a = parseInt(hex.slice(6, 8), 16);
      return (a << 24) | (b << 16) | (g << 8) | r;
    }
  }

  // Handle rgba()
  const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1]);
    const g = parseInt(rgbaMatch[2]);
    const b = parseInt(rgbaMatch[3]);
    const a = rgbaMatch[4] ? Math.round(parseFloat(rgbaMatch[4]) * 255) : 255;
    return (a << 24) | (b << 16) | (g << 8) | r;
  }

  // Fallback: white
  return 0xFFFFFFFF;
}
