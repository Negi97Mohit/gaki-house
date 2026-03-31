/**
 * Source Factory — Creates default CompositorSource instances for each SourceType.
 *
 * Used by:
 *   - UI components when adding a new source (grid section panel, toolbar, etc.)
 *   - Scene collection importers when reconstructing sources
 *   - The legacy scene adapter when converting overlays to compositor sources
 *
 * Every factory function returns a fully-initialized CompositorSource with
 * sensible defaults for transform, audio, filters, and type-specific settings.
 *
 * → See src/types/compositor.ts for type definitions
 * → See src/stores/sceneCollection.store.ts for store integration
 */

import type {
  CompositorSource,
  SourceType,
  SourceTransform,
  SourceAudioConfig,
  CameraSourceSettings,
  ScreenCaptureSettings,
  WindowCaptureSettings,
  ImageSourceSettings,
  MediaSourceSettings,
  BrowserSourceSettings,
  TextSourceSettings,
  ColorSourceSettings,
  GroupSourceSettings,
  SceneRefSettings,
  GeneratedOverlaySettings,
  CaptionSourceSettings,
  ExcalidrawSourceSettings,
  GraphSourceSettings,
} from '@/types/compositor';
import {
  DEFAULT_TRANSFORM,
  DEFAULT_AUDIO,
  Alignment,
} from '@/types/compositor';

// ─── ID Generation ───────────────────────────────────────────────────────────

let idCounter = 0;
function generateSourceId(prefix: string = 'src'): string {
  idCounter++;
  const ts = Date.now().toString(36);
  const r = Math.random().toString(36).slice(2, 6);
  return `${prefix}-${ts}-${r}-${idCounter}`;
}

// ─── Base Builder ────────────────────────────────────────────────────────────

function createBaseSource(
  type: SourceType,
  name: string,
  settings: Record<string, any>,
  transformOverrides?: Partial<SourceTransform>
): CompositorSource {
  return {
    id: generateSourceId(type),
    name,
    type,
    settings,
    transform: {
      ...DEFAULT_TRANSFORM,
      ...transformOverrides,
    },
    filters: [],
    visible: true,
    locked: false,
    audio: { ...DEFAULT_AUDIO },
    children: [],
    opacity: 1,
    blendMode: 'source-over' as GlobalCompositeOperation,
    isBehindUser: false,
  };
}

// ─── Factory Functions ───────────────────────────────────────────────────────

/** Camera source — video capture device */
export function createCameraSource(
  name: string = 'Camera',
  deviceId: string = '',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: CameraSourceSettings = {
    deviceId,
    resolution: { width: 1920, height: 1080 },
    fps: 30,
  };
  return {
    ...createBaseSource('camera', name, settings),
    ...overrides,
  };
}

/** Screen capture source — monitor/display capture */
export function createScreenCaptureSource(
  name: string = 'Screen Capture',
  sourceId?: string,
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: ScreenCaptureSettings = {
    sourceId,
    captureAudio: false,
  };
  return {
    ...createBaseSource('screen_capture', name, settings),
    ...overrides,
  };
}

/** Window capture source — individual window */
export function createWindowCaptureSource(
  name: string = 'Window Capture',
  windowId?: string,
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: WindowCaptureSettings = {
    windowId,
  };
  return {
    ...createBaseSource('window_capture', name, settings),
    ...overrides,
  };
}

/** Image source — static image file */
export function createImageSource(
  name: string = 'Image',
  url: string = '',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: ImageSourceSettings = {
    url,
    unloadWhenHidden: true,
  };
  return {
    ...createBaseSource('image', name, settings, {
      size: { width: 640, height: 480 },
    }),
    ...overrides,
  };
}

/** Media source — video/audio file */
export function createMediaSource(
  name: string = 'Media',
  url: string = '',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: MediaSourceSettings = {
    url,
    loop: false,
    autoPlay: true,
    volume: 1.0,
    speed: 1.0,
  };
  return {
    ...createBaseSource('media', name, settings),
    ...overrides,
  };
}

/** Browser source — embedded web URL */
export function createBrowserSource(
  name: string = 'Browser',
  url: string = 'about:blank',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: BrowserSourceSettings = {
    url,
    width: 1920,
    height: 1080,
    fps: 30,
    refreshOnActive: false,
  };
  return {
    ...createBaseSource('browser', name, settings),
    audio: { ...DEFAULT_AUDIO, muted: true },
    ...overrides,
  };
}

/** Text source — styled text overlay */
export function createTextSource(
  name: string = 'Text',
  content: string = 'New Text',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: TextSourceSettings = {
    content,
    fontFamily: 'Inter',
    fontSize: 48,
    fontWeight: 'bold',
    fontStyle: 'normal',
    color: '#ffffff',
    backgroundColor: 'transparent',
    textAlign: 'center',
    verticalAlign: 'middle',
    wordWrap: true,
  };
  return {
    ...createBaseSource('text', name, settings, {
      size: { width: 600, height: 120 },
      position: { x: 660, y: 480 }, // Center(ish)
    }),
    ...overrides,
  };
}

/** Color source — solid color fill */
export function createColorSource(
  name: string = 'Color',
  color: string = '#000000',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: ColorSourceSettings = {
    color,
    width: 1920,
    height: 1080,
  };
  return {
    ...createBaseSource('color', name, settings),
    ...overrides,
  };
}

/** Group source — container for child sources */
export function createGroupSource(
  name: string = 'Group',
  children: CompositorSource[] = [],
  overrides?: Partial<CompositorSource>
): CompositorSource {
  return {
    ...createBaseSource('group', name, {}),
    children,
    ...overrides,
  };
}

/** Scene reference source — nested scene */
export function createSceneRefSource(
  name: string = 'Scene',
  sceneId: string,
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: SceneRefSettings = { sceneId };
  return {
    ...createBaseSource('scene', name, settings),
    ...overrides,
  };
}

/** AI-generated HTML overlay source (GAKI-specific) */
export function createGeneratedOverlaySource(
  name: string = 'AI Overlay',
  htmlContent: string = '<div>AI Generated</div>',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: GeneratedOverlaySettings = {
    htmlContent,
    sandboxed: true,
  };
  return {
    ...createBaseSource('generated', name, settings),
    ...overrides,
  };
}

/** Live caption overlay source (GAKI-specific) */
export function createCaptionSource(
  name: string = 'Captions',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: CaptionSourceSettings = {
    styleName: 'fade',
    fontFamily: 'Inter',
    fontSize: 24,
    color: '#ffffff',
    backgroundColor: 'rgba(0,0,0,0.5)',
    bold: false,
    italic: false,
    width: 80, // % of canvas
  };
  return {
    ...createBaseSource('caption', name, settings, {
      position: { x: 192, y: 900 }, // Near bottom center
      size: { width: 1536, height: 120 },
    }),
    ...overrides,
  };
}

/** Excalidraw drawing overlay source (GAKI-specific) */
export function createExcalidrawSource(
  name: string = 'Drawing',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: ExcalidrawSourceSettings = {
    elements: [],
  };
  return {
    ...createBaseSource('excalidraw', name, settings),
    ...overrides,
  };
}

/** Chart / graph overlay source (GAKI-specific) */
export function createGraphSource(
  name: string = 'Graph',
  overrides?: Partial<CompositorSource>
): CompositorSource {
  const settings: GraphSourceSettings = {
    chartType: 'bar',
    data: [],
  };
  return {
    ...createBaseSource('graph', name, settings, {
      size: { width: 600, height: 400 },
      position: { x: 660, y: 340 },
    }),
    ...overrides,
  };
}

// ─── Generic Factory (by type) ───────────────────────────────────────────────

/** Create a source of any type by specifying the SourceType string */
export function createSourceByType(
  type: SourceType,
  name?: string,
  settings?: Record<string, any>,
  overrides?: Partial<CompositorSource>
): CompositorSource {
  switch (type) {
    case 'camera':
      return createCameraSource(name, settings?.deviceId, overrides);
    case 'screen_capture':
      return createScreenCaptureSource(name, settings?.sourceId, overrides);
    case 'window_capture':
      return createWindowCaptureSource(name, settings?.windowId, overrides);
    case 'image':
      return createImageSource(name, settings?.url, overrides);
    case 'media':
      return createMediaSource(name, settings?.url, overrides);
    case 'browser':
      return createBrowserSource(name, settings?.url, overrides);
    case 'text':
      return createTextSource(name, settings?.content, overrides);
    case 'color':
      return createColorSource(name, settings?.color, overrides);
    case 'group':
      return createGroupSource(name, [], overrides);
    case 'scene':
      return createSceneRefSource(name ?? 'Scene', settings?.sceneId ?? '', overrides);
    case 'generated':
      return createGeneratedOverlaySource(name, settings?.htmlContent, overrides);
    case 'caption':
      return createCaptionSource(name, overrides);
    case 'excalidraw':
      return createExcalidrawSource(name, overrides);
    case 'graph':
      return createGraphSource(name, overrides);
    default:
      return createBaseSource(type, name ?? 'Unknown', settings ?? {});
  }
}
