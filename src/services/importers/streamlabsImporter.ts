/**
 * Streamlabs Desktop Overlay Package Importer
 *
 * Parses Streamlabs .overlay (ZIP) packages and standalone JSON scene
 * collection files and converts them to GAKI's SceneCollection format.
 *
 * Streamlabs overlay packages are ZIP archives containing:
 *   - manifest.json or overlay.json (scene definitions)
 *   - assets/ (images, stingers, alert sounds)
 *   - Individual overlay HTML/CSS files
 *
 * The importer:
 *   1. Detects format (ZIP vs plain JSON)
 *   2. Extracts assets and stores them in the vault
 *   3. Parses scene/source definitions
 *   4. Maps Streamlabs widget types to GAKI source types
 *   5. Returns a SceneCollection ready for the compositor
 *
 * → See src/services/importers/types.ts for Streamlabs format types
 * → See docs/electron/obs-compositor.md for architecture
 */

import type {
  SceneCollection,
  CompositorScene,
  CompositorSource,
  SourceType,
} from '@/types/compositor';
import {
  DEFAULT_TRANSFORM,
  DEFAULT_AUDIO,
  DEFAULT_TRANSITION,
  Alignment,
} from '@/types/compositor';
import type {
  StreamlabsManifest,
  StreamlabsScene,
  StreamlabsSceneSource,
  StreamlabsCategory,
  StreamlabsOverlayDef,
  ImportResult,
  ImportItemResult,
  MissingAsset,
  OBSSceneCollection,
} from './types';
import { importOBSSceneCollection } from './obsImporter';

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Import a Streamlabs scene collection from either a JSON string or
 * extracted ZIP contents.
 *
 * @param data — JSON string (for .json files) or extracted file map (for .overlay/.zip)
 * @param options — Import configuration
 */
export function importStreamlabsCollection(
  data: string | Map<string, string>,
  options: {
    canvasWidth?: number;
    canvasHeight?: number;
    name?: string;
  } = {}
): ImportResult {
  const { canvasWidth = 1920, canvasHeight = 1080, name } = options;

  const items: ImportItemResult[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];
  const missingAssets: MissingAsset[] = [];

  let manifest: StreamlabsManifest | null = null;
  let extractedAssets: Map<string, string> = new Map();

  // ── Determine input format ──

  if (typeof data === 'string') {
    // Plain JSON file
    try {
      const parsed = JSON.parse(data);

      // Streamlabs exports might use the OBS format internally
      if (parsed.sources && Array.isArray(parsed.sources)) {
        // This is actually an OBS-format JSON — delegate to OBS importer
        return importOBSSceneCollection(data, {
          canvasWidth,
          canvasHeight,
          name: name ?? parsed.name ?? 'Imported Streamlabs Collection',
        });
      }

      manifest = parsed as StreamlabsManifest;
    } catch (e: any) {
      return {
        success: false,
        collection: null,
        items: [],
        missingAssets: [],
        warnings: [],
        errors: [`Failed to parse JSON: ${e.message}`],
        format: 'streamlabs',
      };
    }
  } else {
    // Extracted ZIP contents (Map<filename, content>)
    extractedAssets = data;

    // Find the manifest
    const manifestFiles = ['manifest.json', 'overlay.json', 'scenes.json', 'collection.json'];
    for (const key of data.keys()) {
      const basename = key.split('/').pop()?.toLowerCase() ?? '';
      if (manifestFiles.includes(basename)) {
        try {
          manifest = JSON.parse(data.get(key)!) as StreamlabsManifest;
          break;
        } catch (e) {
          warnings.push(`Failed to parse ${key}: ${e}`);
        }
      }
    }

    if (!manifest) {
      // Try to find any .json that looks like a scene collection
      for (const [key, value] of data.entries()) {
        if (key.endsWith('.json')) {
          try {
            const parsed = JSON.parse(value);
            if (parsed.sources || parsed.scenes || parsed.overlays) {
              manifest = parsed;
              break;
            }
          } catch (e) {
            // Skip non-JSON files
          }
        }
      }
    }

    if (!manifest) {
      return {
        success: false,
        collection: null,
        items: [],
        missingAssets: [],
        warnings,
        errors: ['No manifest.json or overlay.json found in the overlay package'],
        format: 'streamlabs',
      };
    }
  }

  // ── Parse scenes ──

  const scenes: CompositorScene[] = [];

  if (manifest.scenes && manifest.scenes.length > 0) {
    for (const slScene of manifest.scenes) {
      const sources = convertStreamlabsSources(
        slScene.sources,
        canvasWidth,
        canvasHeight,
        items,
        missingAssets
      );

      scenes.push({
        id: generateId(),
        name: slScene.name,
        sources,
        transition: { ...DEFAULT_TRANSITION },
        gridLayout: null,
      });

      items.push({
        name: slScene.name,
        type: 'scene',
        status: 'success',
        message: `${sources.length} sources`,
      });
    }
  }

  // If no scenes but has overlays, create a single scene from overlays
  if (scenes.length === 0 && manifest.overlays && manifest.overlays.length > 0) {
    const sources = convertOverlayDefsToSources(
      manifest.overlays,
      canvasWidth,
      canvasHeight,
      items,
      missingAssets
    );

    scenes.push({
      id: generateId(),
      name: name ?? 'Imported Overlays',
      sources,
      transition: { ...DEFAULT_TRANSITION },
      gridLayout: null,
    });

    items.push({
      name: 'Overlays',
      type: 'scene',
      status: 'success',
      message: `${sources.length} overlay sources`,
    });
  }

  // If still no scenes, create an empty one
  if (scenes.length === 0) {
    scenes.push({
      id: generateId(),
      name: 'Scene 1',
      sources: [],
      transition: { ...DEFAULT_TRANSITION },
      gridLayout: null,
    });
    warnings.push('No scene data found in the overlay package — created empty scene');
  }

  // ── Track extracted asset files ──

  if (extractedAssets.size > 0) {
    for (const [assetPath] of extractedAssets) {
      if (isAssetFile(assetPath)) {
        items.push({
          name: assetPath.split('/').pop() ?? assetPath,
          type: 'asset',
          status: 'success',
          message: `Extracted from package`,
        });
      }
    }
  }

  // ── Build collection ──

  const collection: SceneCollection = {
    id: generateId(),
    name: name ?? manifest.name ?? 'Imported Streamlabs Collection',
    scenes,
    activeSceneId: scenes[0]?.id ?? '',
    canvasResolution: { width: canvasWidth, height: canvasHeight },
    audioMixer: {
      masterVolume: 1.0,
      masterMuted: false,
      levels: {},
    },
    defaultTransition: { ...DEFAULT_TRANSITION },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    importedFrom: 'streamlabs',
  };

  return {
    success: scenes.length > 0,
    collection,
    items,
    missingAssets,
    warnings,
    errors,
    format: 'streamlabs',
  };
}

// ─── Source Conversion ────────────────────────────────────────────────────────

/** Streamlabs type → GAKI source type */
const SL_TYPE_MAP: Record<string, SourceType> = {
  'webcam': 'camera',
  'video_capture_device': 'camera',
  'dshow_input': 'camera',
  'display_capture': 'screen_capture',
  'monitor_capture': 'screen_capture',
  'window_capture': 'window_capture',
  'image_source': 'image',
  'ffmpeg_source': 'media',
  'browser_source': 'browser',
  'text_gdiplus': 'text',
  'text_gdiplus_v2': 'text',
  'text_ft2_source': 'text',
  'color_source': 'color',
  'color_source_v3': 'color',

  // Streamlabs-specific widget types → browser sources
  'widget_alerts': 'browser',
  'widget_event_list': 'browser',
  'widget_chat': 'browser',
  'widget_donation_goal': 'browser',
  'widget_viewer_count': 'browser',
  'widget_tip_jar': 'browser',
  'widget_spin_wheel': 'browser',
  'widget_credits': 'browser',
  'widget_poll': 'browser',
  'widget_chat_highlight': 'browser',
  'streamlabel': 'text',
};

function convertStreamlabsSources(
  sources: StreamlabsSceneSource[],
  canvasWidth: number,
  canvasHeight: number,
  items: ImportItemResult[],
  missingAssets: MissingAsset[]
): CompositorSource[] {
  return sources
    .map((slSource) => {
      // Map Streamlabs source type to GAKI source type, fallback to generic browser source
      const type = SL_TYPE_MAP[slSource.type] || 'browser';

      const transform = convertSLTransform(slSource, canvasWidth, canvasHeight);
      const settings = convertSLSettings(slSource, type, missingAssets);

      items.push({
        name: slSource.name,
        type: 'source',
        status: 'success',
        message: `${slSource.type} → ${type}`,
      });

      return {
        id: generateId(),
        name: slSource.name,
        type,
        settings,
        transform,
        filters: [],
        visible: slSource.visible ?? true,
        locked: false as boolean,
        audio: { ...DEFAULT_AUDIO },
        children: [],
        opacity: 1,
        blendMode: 'source-over' as GlobalCompositeOperation,
        isBehindUser: false as boolean,
      } as CompositorSource;
    })
    .filter((s): s is CompositorSource => s !== null);
}

function convertSLTransform(
  source: StreamlabsSceneSource,
  canvasWidth: number,
  canvasHeight: number
): typeof DEFAULT_TRANSFORM {
  const t = source.transform;
  if (!t) return { ...DEFAULT_TRANSFORM };

  return {
    position: { x: Math.round(t.x ?? 0), y: Math.round(t.y ?? 0) },
    size: {
      width: Math.round(t.width ?? canvasWidth),
      height: Math.round(t.height ?? canvasHeight),
    },
    rotation: t.rotation ?? 0,
    crop: { top: 0, right: 0, bottom: 0, left: 0 },
    alignment: Alignment.TopLeft,
    boundsType: 'none',
    bounds: { width: 0, height: 0 },
  };
}

function convertSLSettings(
  source: StreamlabsSceneSource,
  type: SourceType,
  missingAssets: MissingAsset[]
): Record<string, any> {
  const s = source.settings;

  switch (type) {
    case 'camera':
      return { deviceId: s.video_device_id ?? '', deviceName: source.name };

    case 'screen_capture':
      return { sourceId: s.monitor ?? undefined };

    case 'image': {
      const url = s.file ?? s.url ?? '';
      if (url) checkMissingAsset(url, 'image', source.name, missingAssets);
      return { url };
    }

    case 'media': {
      const url = s.local_file ?? s.url ?? '';
      if (url) checkMissingAsset(url, 'video', source.name, missingAssets);
      return { url, loop: s.looping ?? false, autoPlay: true };
    }

    case 'browser':
      return {
        url: s.url ?? 'about:blank',
        width: s.width ?? 1920,
        height: s.height ?? 1080,
        css: s.css ?? undefined,
      };

    case 'text':
      return {
        content: s.text ?? source.name,
        fontFamily: s.font?.face ?? 'Arial',
        fontSize: s.font?.size ?? 48,
        fontWeight: 'normal',
        fontStyle: 'normal',
        color: s.color ? `#${(s.color >>> 0).toString(16).padStart(8, '0').slice(6)}` : '#ffffff',
        backgroundColor: 'transparent',
        textAlign: 'left',
        verticalAlign: 'top',
      };

    case 'color':
      return {
        color: s.color ? `#${(s.color >>> 0).toString(16).padStart(8, '0').slice(6)}` : '#000000',
        width: s.width ?? 1920,
        height: s.height ?? 1080,
      };

    default:
      return { ...s };
  }
}

// ─── Overlay definitions (from manifest) → Sources ───────────────────────────

function convertOverlayDefsToSources(
  overlays: StreamlabsOverlayDef[],
  canvasWidth: number,
  canvasHeight: number,
  items: ImportItemResult[],
  missingAssets: MissingAsset[]
): CompositorSource[] {
  return overlays.map((overlay) => {
    const isWidget = overlay.type.startsWith('widget_');
    const type: SourceType = isWidget ? 'browser' : 'image';

    const settings = isWidget
      ? { url: overlay.url ?? overlay.filePath ?? 'about:blank', width: canvasWidth, height: canvasHeight }
      : { url: overlay.filePath ?? overlay.url ?? '' };

    items.push({
      name: overlay.name,
      type: 'source',
      status: 'success',
      message: `${overlay.type} → ${type}`,
    });

    return {
      id: generateId(),
      name: overlay.name,
      type,
      settings,
      transform: {
        ...DEFAULT_TRANSFORM,
        size: { width: canvasWidth, height: canvasHeight },
      },
      filters: [],
      visible: true,
      locked: false,
      audio: { ...DEFAULT_AUDIO },
      children: [],
      opacity: 1,
      blendMode: 'source-over' as GlobalCompositeOperation,
      isBehindUser: false,
    } as CompositorSource;
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

let _idCounter = 0;
function generateId(): string {
  _idCounter++;
  return `sl-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}-${_idCounter}`;
}

function isAssetFile(path: string): boolean {
  const ext = path.split('.').pop()?.toLowerCase() ?? '';
  return ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'mp4', 'webm', 'mp3', 'ogg', 'wav'].includes(ext);
}

function checkMissingAsset(
  filePath: string,
  type: MissingAsset['assetType'],
  sourceName: string,
  missingAssets: MissingAsset[]
): void {
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
