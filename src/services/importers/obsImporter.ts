/**
 * OBS Scene Collection Importer
 *
 * Parses OBS Studio JSON scene collection files and converts them to
 * GAKI's CompositorScene format for rendering in the WebGL compositor.
 *
 * Handles:
 *   - Scene and source parsing with type-specific settings extraction
 *   - OBS coordinate system → GAKI absolute pixel transforms
 *   - Filter chain reconstruction (color correction, chroma key, etc.)
 *   - Source group hierarchy
 *   - Missing asset detection and resolution
 *
 * OBS scene collection JSON structure:
 *   { current_scene, scene_order, sources[], transitions[] }
 *   Where each scene is also a "source" of type "scene" containing scene_items[].
 *
 * → See src/services/importers/types.ts for OBS format type definitions
 * → See docs/electron/obs-compositor.md for architecture and source type mapping
 */

import type {
  SceneCollection,
  CompositorScene,
  CompositorSource,
  SourceFilter,
  SourceTransform,
  SceneTransition,
  SourceType,
  BoundsType,
} from '@/types/compositor';
import {
  DEFAULT_TRANSFORM,
  DEFAULT_AUDIO,
  DEFAULT_TRANSITION,
  Alignment,
} from '@/types/compositor';
import type {
  OBSSceneCollection,
  OBSSource,
  OBSSceneItem,
  OBSFilter,
  ImportResult,
  ImportItemResult,
  MissingAsset,
} from './types';
import {
  OBS_SOURCE_TYPE_MAP,
  OBS_FILTER_TYPE_MAP,
  OBS_BOUNDS_TYPE_MAP,
} from './types';

// ─── Main Import Function ────────────────────────────────────────────────────

/**
 * Import an OBS Studio scene collection from its JSON representation.
 *
 * @param json — The raw JSON string from the OBS .json file
 * @param options — Import configuration
 * @returns ImportResult with the converted SceneCollection
 */
export function importOBSSceneCollection(
  json: string,
  options: {
    /** Base canvas resolution to normalize transforms against */
    canvasWidth?: number;
    canvasHeight?: number;
    /** Collection name override */
    name?: string;
  } = {}
): ImportResult {
  const {
    canvasWidth = 1920,
    canvasHeight = 1080,
    name,
  } = options;

  const items: ImportItemResult[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const missingAssets: MissingAsset[] = [];

  // Parse JSON
  let obsData: OBSSceneCollection;
  try {
    obsData = JSON.parse(json);
  } catch (e: any) {
    return {
      success: false,
      collection: null,
      items: [],
      missingAssets: [],
      warnings: [],
      errors: [`Failed to parse JSON: ${e.message}`],
      format: 'obs',
    };
  }

  if (!obsData.sources || !Array.isArray(obsData.sources)) {
    return {
      success: false,
      collection: null,
      items: [],
      missingAssets: [],
      warnings: [],
      errors: ['Invalid OBS scene collection: no "sources" array found'],
      format: 'obs',
    };
  }

  // Build a source lookup map (name → OBSSource)
  const sourceMap = new Map<string, OBSSource>();
  for (const source of obsData.sources) {
    sourceMap.set(source.name, source);
  }

  // Identify scene sources (OBS scenes are sources with id="scene")
  const sceneSources = obsData.sources.filter(
    (s) => s.id === 'scene'
  );

  // Determine scene order
  const sceneOrder = obsData.scene_order
    ? obsData.scene_order.map((s) => s.name)
    : sceneSources.map((s) => s.name);

  // Convert each OBS scene into a CompositorScene
  const scenes: CompositorScene[] = [];

  for (const sceneName of sceneOrder) {
    const sceneSource = sceneSources.find((s) => s.name === sceneName);
    if (!sceneSource) {
      warnings.push(`Scene "${sceneName}" referenced in scene_order but not found in sources`);
      continue;
    }

    const sceneItems: OBSSceneItem[] = sceneSource.settings?.items ?? [];
    const compositorSources: CompositorSource[] = [];

    for (const item of sceneItems) {
      const sourceName = item.source_name ?? item.name;
      const obsSource = sourceMap.get(sourceName);

      if (!obsSource) {
        items.push({
          name: sourceName,
          type: 'source',
          status: 'warning',
          message: `Source "${sourceName}" not found in source definitions`,
        });
        warnings.push(`Source "${sourceName}" in scene "${sceneName}" has no definition`);
        continue;
      }

      const result = convertOBSSource(
        obsSource,
        item,
        sourceMap,
        canvasWidth,
        canvasHeight,
        missingAssets
      );

      if (result) {
        compositorSources.push(result);
        items.push({
          name: sourceName,
          type: 'source',
          status: 'success',
          message: `${obsSource.id} → ${result.type}`,
        });
      } else {
        items.push({
          name: sourceName,
          type: 'source',
          status: 'skipped',
          message: `Unsupported source type: ${obsSource.id}`,
        });
      }
    }

    scenes.push({
      id: generateId(),
      name: sceneName,
      sources: compositorSources,
      transition: { ...DEFAULT_TRANSITION },
      gridLayout: null,
    });

    items.push({
      name: sceneName,
      type: 'scene',
      status: 'success',
      message: `${compositorSources.length} sources`,
    });
  }

  // Determine active scene
  const activeSceneName = obsData.current_scene ?? obsData.current_program_scene ?? sceneOrder[0];
  const activeScene = scenes.find((s) => s.name === activeSceneName) ?? scenes[0];

  const collection: SceneCollection = {
    id: generateId(),
    name: name ?? obsData.name ?? 'Imported OBS Collection',
    scenes,
    activeSceneId: activeScene?.id ?? '',
    canvasResolution: { width: canvasWidth, height: canvasHeight },
    audioMixer: {
      masterVolume: 1.0,
      masterMuted: false,
      levels: {},
    },
    defaultTransition: { ...DEFAULT_TRANSITION },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    importedFrom: 'obs',
  };

  return {
    success: scenes.length > 0,
    collection,
    items,
    missingAssets,
    warnings,
    errors,
    format: 'obs',
  };
}

// ─── Source Conversion ────────────────────────────────────────────────────────

function convertOBSSource(
  obsSource: OBSSource,
  sceneItem: OBSSceneItem,
  sourceMap: Map<string, OBSSource>,
  canvasWidth: number,
  canvasHeight: number,
  missingAssets: MissingAsset[]
): CompositorSource | null {
  // Map OBS source type to GAKI source type, fallback to generic browser source
  const sourceType = OBS_SOURCE_TYPE_MAP[obsSource.id] || 'browser';

  // Convert transform
  const transform = convertOBSTransform(sceneItem, canvasWidth, canvasHeight);

  // Convert settings
  const settings = convertOBSSettings(obsSource, sourceType, missingAssets);

  // Convert filters
  const filters = convertOBSFilters(obsSource.filters ?? []);

  // Convert audio
  const audio = {
    volume: obsSource.volume ?? 1.0,
    muted: obsSource.muted ?? false,
    monitorType: (['none', 'monitor_only', 'monitor_and_output'] as const)[
      obsSource.monitoring_type ?? 0
    ] ?? 'none',
    syncOffset: (obsSource.sync ?? 0) / 1_000_000, // OBS uses nanoseconds → ms
    tracks: [1],
  };

  // Handle group sources (recurse on children)
  let children: CompositorSource[] = [];
  if (sourceType === 'group' && sceneItem.group_items) {
    for (const childItem of sceneItem.group_items) {
      const childSourceName = childItem.source_name ?? childItem.name;
      const childSource = sourceMap.get(childSourceName);
      if (childSource) {
        const converted = convertOBSSource(
          childSource,
          childItem,
          sourceMap,
          canvasWidth,
          canvasHeight,
          missingAssets
        );
        if (converted) children.push(converted);
      }
    }
  }

  return {
    id: generateId(),
    name: obsSource.name,
    type: sourceType,
    settings,
    transform,
    filters,
    visible: sceneItem.visible ?? true,
    locked: sceneItem.locked ?? false,
    audio,
    children,
    opacity: 1,
    blendMode: mapBlendType(sceneItem.blend_type) as GlobalCompositeOperation,
    isBehindUser: false,
  };
}

// ─── Transform Conversion ────────────────────────────────────────────────────

function convertOBSTransform(
  item: OBSSceneItem,
  _canvasWidth: number,
  _canvasHeight: number
): SourceTransform {
  // OBS uses absolute pixel coordinates already — no conversion needed
  // Scale is applied to the source's native resolution
  const pos = item.pos ?? { x: 0, y: 0 };
  const scale = item.scale ?? { x: 1, y: 1 };
  const bounds = item.bounds ?? { x: 0, y: 0 };
  const boundsType = (OBS_BOUNDS_TYPE_MAP[item.bounds_type ?? 0] ?? 'none') as BoundsType;

  return {
    position: { x: Math.round(pos.x), y: Math.round(pos.y) },
    // Size is calculated from bounds when bounds_type is not 'none',
    // otherwise from the source's native resolution × scale
    size: boundsType !== 'none'
      ? { width: Math.round(bounds.x), height: Math.round(bounds.y) }
      : { width: Math.round(1920 * scale.x), height: Math.round(1080 * scale.y) },
    rotation: item.rot ?? 0,
    crop: {
      top: item.crop_top ?? 0,
      right: item.crop_right ?? 0,
      bottom: item.crop_bottom ?? 0,
      left: item.crop_left ?? 0,
    },
    alignment: item.alignment ?? Alignment.TopLeft,
    boundsType,
    bounds: { width: Math.round(bounds.x), height: Math.round(bounds.y) },
  };
}

// ─── Settings Conversion ─────────────────────────────────────────────────────

function convertOBSSettings(
  obsSource: OBSSource,
  sourceType: SourceType,
  missingAssets: MissingAsset[]
): Record<string, any> {
  const s = obsSource.settings;

  switch (sourceType) {
    case 'camera':
      return {
        deviceId: s.video_device_id ?? s.device ?? '',
        deviceName: s.device_name ?? obsSource.name,
        resolution: s.resolution ? parseResolution(s.resolution) : undefined,
        fps: s.fps ?? undefined,
      };

    case 'screen_capture':
      return {
        sourceId: s.monitor ?? s.display ?? undefined,
        sourceName: s.monitor_name ?? undefined,
        captureAudio: s.capture_audio ?? false,
      };

    case 'window_capture':
      return {
        windowId: s.window ?? undefined,
        windowName: s.window_name ?? obsSource.name,
      };

    case 'image': {
      const filePath = s.file ?? '';
      if (filePath) {
        checkMissingAsset(filePath, 'image', obsSource.name, missingAssets);
      }
      return {
        url: filePath,
        unloadWhenHidden: s.unload ?? true,
      };
    }

    case 'media': {
      const localFile = s.local_file ?? s.input ?? '';
      if (localFile) {
        checkMissingAsset(localFile, 'video', obsSource.name, missingAssets);
      }
      return {
        url: localFile || (s.input ?? ''),
        loop: s.looping ?? false,
        autoPlay: !s.close_when_inactive,
        volume: 1.0,
        speed: s.speed_percent ? s.speed_percent / 100 : 1.0,
      };
    }

    case 'browser':
      return {
        url: s.url ?? 'about:blank',
        width: s.width ?? 1920,
        height: s.height ?? 1080,
        css: s.css ?? undefined,
        refreshOnActive: s.restart_when_active ?? false,
        fps: s.fps ?? 30,
      };

    case 'text':
      return {
        content: s.text ?? '',
        fontFamily: s.font?.face ?? 'Arial',
        fontSize: s.font?.size ?? 48,
        fontWeight: (s.font?.flags ?? 0) & 1 ? 'bold' : 'normal',
        fontStyle: (s.font?.flags ?? 0) & 2 ? 'italic' : 'normal',
        color: obsColorToCSS(s.color ?? 0xFFFFFFFF),
        backgroundColor: s.bk_color
          ? obsColorToCSS(s.bk_color)
          : 'transparent',
        textAlign: mapOBSTextAlign(s.align),
        verticalAlign: mapOBSVerticalAlign(s.valign),
        outline: s.outline
          ? { color: obsColorToCSS(s.outline_color ?? 0xFF000000), size: s.outline_size ?? 2 }
          : undefined,
        wordWrap: s.word_wrap ?? true,
      };

    case 'color':
      return {
        color: obsColorToCSS(s.color ?? 0xFF000000),
        width: s.width ?? 1920,
        height: s.height ?? 1080,
      };

    case 'group':
      return {};

    case 'scene':
      return {
        sceneId: '', // Will be resolved after all scenes are created
        sceneName: obsSource.name,
      };

    default:
      return { ...s };
  }
}

// ─── Filter Conversion ───────────────────────────────────────────────────────

function convertOBSFilters(obsFilters: OBSFilter[]): SourceFilter[] {
  return obsFilters
    .map((f) => {
      const filterType = OBS_FILTER_TYPE_MAP[f.id];
      if (!filterType) return null;

      return {
        id: generateId(),
        name: f.name,
        type: filterType as SourceFilter['type'],
        enabled: f.enabled ?? true,
        settings: convertFilterSettings(f.id, f.settings),
      };
    })
    .filter((f): f is SourceFilter => f !== null);
}

function convertFilterSettings(
  obsFilterId: string,
  settings: Record<string, any>
): Record<string, any> {
  switch (obsFilterId) {
    case 'color_filter':
    case 'color_filter_v2':
      return {
        brightness: settings.brightness ?? 0,
        contrast: settings.contrast ?? 0,
        saturation: settings.saturation ?? 0,
        gamma: settings.gamma ?? 0,
        hueShift: settings.hue_shift ?? 0,
        opacity: settings.opacity ?? 100,
      };

    case 'chroma_key_filter':
    case 'chroma_key_filter_v2':
      return {
        keyColor: settings.key_color_type ?? 'green',
        similarity: settings.similarity ?? 400,
        smoothness: settings.smoothness ?? 80,
        spill: settings.spill ?? 100,
      };

    case 'color_key_filter':
    case 'color_key_filter_v2':
      return {
        keyColor: obsColorToCSS(settings.key_color ?? 0xFF00FF00),
        similarity: settings.similarity ?? 80,
        smoothness: settings.smoothness ?? 50,
      };

    default:
      return { ...settings };
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _idCounter = 0;
function generateId(): string {
  _idCounter++;
  return `obs-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}-${_idCounter}`;
}

/**
 * Converts OBS ABGR color (32-bit integer) to CSS rgba string.
 * OBS stores colors as 0xAABBGGRR (ABGR little-endian).
 */
function obsColorToCSS(color: number): string {
  const r = color & 0xFF;
  const g = (color >> 8) & 0xFF;
  const b = (color >> 16) & 0xFF;
  const a = ((color >> 24) & 0xFF) / 255;
  return `rgba(${r},${g},${b},${a.toFixed(2)})`;
}

function parseResolution(res: string): { width: number; height: number } | undefined {
  const match = res.match(/(\d+)x(\d+)/);
  if (!match) return undefined;
  return { width: parseInt(match[1]), height: parseInt(match[2]) };
}

function mapOBSTextAlign(align: string | undefined): 'left' | 'center' | 'right' {
  switch (align) {
    case 'left': return 'left';
    case 'right': return 'right';
    case 'center': return 'center';
    default: return 'left';
  }
}

function mapOBSVerticalAlign(valign: string | undefined): 'top' | 'middle' | 'bottom' {
  switch (valign) {
    case 'top': return 'top';
    case 'center': return 'middle';
    case 'bottom': return 'bottom';
    default: return 'top';
  }
}

function mapBlendType(blendType: string | undefined): string {
  switch (blendType) {
    case 'additive': return 'lighter';
    case 'multiply': return 'multiply';
    case 'screen': return 'screen';
    default: return 'source-over';
  }
}

function checkMissingAsset(
  filePath: string,
  type: MissingAsset['assetType'],
  sourceName: string,
  missingAssets: MissingAsset[]
): void {
  // In the browser context, all file paths are potentially missing
  // since we can't access the filesystem from the renderer
  const existing = missingAssets.find((a) => a.originalPath === filePath);
  if (existing) {
    if (!existing.referencedBy.includes(sourceName)) {
      existing.referencedBy.push(sourceName);
    }
  } else {
    missingAssets.push({
      originalPath: filePath,
      assetType: type,
      referencedBy: [sourceName],
    });
  }
}
