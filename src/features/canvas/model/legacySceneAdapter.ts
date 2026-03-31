/**
 * Legacy Scene Adapter — Bidirectional conversion between the legacy
 * SceneState/overlay model and the new CompositorScene model.
 *
 * This adapter enables:
 *   1. Existing UI components to keep working with SceneState
 *   2. The new compositor to receive CompositorScene updates
 *   3. Imported scenes (OBS/Streamlabs) to render via existing UI
 *
 * Conversion:
 *   SceneState → CompositorScene (for the compositor worker)
 *   CompositorScene → partial SceneState (for UI hydration after import)
 *
 * The adapter maps the flat overlay arrays to hierarchical compositor sources:
 *   - activeOverlays[] → CompositorSource[] (type: 'generated')
 *   - textOverlays[]   → CompositorSource[] (type: 'text')
 *   - fileOverlays[]   → CompositorSource[] (type: 'media' | 'image')
 *   - browserOverlays[] → CompositorSource[] (type: 'browser')
 *   - Camera (always present if video is on) → CompositorSource (type: 'camera')
 *   - Screen share → CompositorSource (type: 'screen_capture')
 *   - Canvas background → CompositorSource (type: 'color')
 *
 * → See src/types/caption.ts for SceneState
 * → See src/types/compositor.ts for CompositorScene
 */

import type {
  SceneState,
  GeneratedOverlay,
  TextOverlayState,
  FileOverlayState,
  BrowserOverlayState,
  CanvasLayoutState,
  CanvasSectionState,
} from '@/types/caption';
import type {
  CompositorScene,
  CompositorSource,
  SceneTransition,
  GridLayout,
  GridCell,
} from '@/types/compositor';
import { DEFAULT_TRANSFORM, DEFAULT_AUDIO, DEFAULT_TRANSITION } from '@/types/compositor';

// ─── Canvas Base Resolution ──────────────────────────────────────────────────

const CANVAS_W = 1920;
const CANVAS_H = 1080;

// ─── SceneState → CompositorScene ────────────────────────────────────────────

/**
 * Convert a legacy SceneState into a CompositorScene.
 * This is the primary path for feeding existing scene data into the new compositor.
 */
export function legacySceneToCompositorScene(
  scene: SceneState
): CompositorScene {
  const sources: CompositorSource[] = [];

  // 1. Canvas background (lowest z-order)
  if (scene.blankCanvasColor && scene.blankCanvasColor !== '#000000') {
    sources.push(createColorSource(
      'background',
      'Canvas Background',
      scene.blankCanvasColor
    ));
  }

  // 2. Background image/effect
  if (scene.backgroundEffect === 'image' && scene.backgroundImageUrl) {
    sources.push(createImageLayerSource(
      'bg-image',
      'Background Image',
      scene.backgroundImageUrl
    ));
  }

  // 3. Camera source (if video is on)
  if (scene.isVideoOn) {
    const cameraSrc = createCameraLayerSource(scene);
    sources.push(cameraSrc);
  }

  // 4. Screen share source
  if (scene.screenShareMode !== 'off') {
    sources.push(createScreenCaptureLayerSource(scene));
  }

  // 5. File overlays → media/image sources
  for (const file of scene.fileOverlays) {
    sources.push(fileOverlayToSource(file));
  }

  // 6. Browser overlays → browser sources
  for (const browser of scene.browserOverlays) {
    sources.push(browserOverlayToSource(browser));
  }

  // 7. AI-generated overlays → generated sources
  for (const overlay of scene.activeOverlays) {
    sources.push(generatedOverlayToSource(overlay));
  }

  // 8. Text overlays → text sources
  for (const text of scene.textOverlays) {
    sources.push(textOverlayToSource(text));
  }

  // Convert grid layout if present
  const gridLayout = scene.canvasLayout
    ? legacyLayoutToGridLayout(scene.canvasLayout)
    : null;

  return {
    id: scene.id,
    name: scene.name,
    sources,
    transition: { ...DEFAULT_TRANSITION },
    gridLayout,
  };
}

// ─── Individual Overlay → CompositorSource Converters ─────────────────────────

function createColorSource(
  id: string,
  name: string,
  color: string
): CompositorSource {
  return {
    id,
    name,
    type: 'color',
    settings: { color, width: CANVAS_W, height: CANVAS_H },
    transform: {
      ...DEFAULT_TRANSFORM,
      size: { width: CANVAS_W, height: CANVAS_H },
    },
    filters: [],
    visible: true,
    locked: true,
    audio: { ...DEFAULT_AUDIO },
    children: [],
    opacity: 1,
    blendMode: 'source-over' as GlobalCompositeOperation,
    isBehindUser: false,
  };
}

function createImageLayerSource(
  id: string,
  name: string,
  url: string
): CompositorSource {
  return {
    id,
    name,
    type: 'image',
    settings: { url },
    transform: {
      ...DEFAULT_TRANSFORM,
      size: { width: CANVAS_W, height: CANVAS_H },
    },
    filters: [],
    visible: true,
    locked: true,
    audio: { ...DEFAULT_AUDIO },
    children: [],
    opacity: 1,
    blendMode: 'source-over' as GlobalCompositeOperation,
    isBehindUser: false,
  };
}

function createCameraLayerSource(scene: SceneState): CompositorSource {
  // Convert layout mode to position within the canvas
  let position = { x: 0, y: 0 };
  let size = { width: CANVAS_W, height: CANVAS_H };

  if (scene.layoutMode === 'pip') {
    // PiP: camera is positioned via pipPosition (percentage) + pipSize (percentage)
    position = {
      x: Math.round((scene.pipPosition.x / 100) * CANVAS_W),
      y: Math.round((scene.pipPosition.y / 100) * CANVAS_H),
    };
    size = {
      width: Math.round((scene.pipSize.width / 100) * CANVAS_W),
      height: Math.round((scene.pipSize.height / 100) * CANVAS_H),
    };
  } else if (scene.layoutMode === 'split-horizontal') {
    size = {
      width: Math.round(CANVAS_W * scene.splitRatio),
      height: CANVAS_H,
    };
  } else if (scene.layoutMode === 'split-vertical') {
    size = {
      width: CANVAS_W,
      height: Math.round(CANVAS_H * scene.splitRatio),
    };
  }
  // 'solo' = full canvas, which is the default

  return {
    id: `camera-${scene.id}`,
    name: 'Camera',
    type: 'camera',
    settings: {
      deviceId: scene.selectedVideoDevice ?? '',
      resolution: { width: CANVAS_W, height: CANVAS_H },
    },
    transform: {
      ...DEFAULT_TRANSFORM,
      position,
      size,
    },
    filters: buildCameraFilters(scene),
    visible: true,
    locked: false,
    audio: {
      ...DEFAULT_AUDIO,
      muted: !scene.isAudioOn,
    },
    children: [],
    opacity: 1,
    blendMode: 'source-over' as GlobalCompositeOperation,
    isBehindUser: false,
  };
}

function buildCameraFilters(scene: SceneState) {
  const filters: CompositorSource['filters'] = [];

  if (scene.videoFilter && scene.videoFilter !== 'none') {
    filters.push({
      id: `filter-css-${scene.id}`,
      name: 'Video Filter',
      type: 'css_filter',
      enabled: true,
      settings: { filterName: scene.videoFilter },
    });
  }

  if (scene.isNeonEdgeEnabled) {
    filters.push({
      id: `filter-neon-${scene.id}`,
      name: 'Neon Edge',
      type: 'webgl_shader',
      enabled: true,
      settings: {
        shaderName: 'neon_edge',
        intensity: scene.neonIntensity,
        color: scene.neonColor,
      },
    });
  }

  return filters;
}

function createScreenCaptureLayerSource(scene: SceneState): CompositorSource {
  let position = { x: 0, y: 0 };
  let size = { width: CANVAS_W, height: CANVAS_H };

  // In split modes, screen share takes the opposite side from the camera
  if (scene.layoutMode === 'split-horizontal') {
    const cameraWidth = Math.round(CANVAS_W * scene.splitRatio);
    position = { x: cameraWidth, y: 0 };
    size = { width: CANVAS_W - cameraWidth, height: CANVAS_H };
  } else if (scene.layoutMode === 'split-vertical') {
    const cameraHeight = Math.round(CANVAS_H * scene.splitRatio);
    position = { x: 0, y: cameraHeight };
    size = { width: CANVAS_W, height: CANVAS_H - cameraHeight };
  }

  return {
    id: `screen-${scene.id}`,
    name: 'Screen Share',
    type: 'screen_capture',
    settings: {
      sourceId: scene.selectedScreenSourceId,
    },
    transform: {
      ...DEFAULT_TRANSFORM,
      position,
      size,
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

function generatedOverlayToSource(overlay: GeneratedOverlay): CompositorSource {
  const layout = overlay.layout;
  return {
    id: overlay.id,
    name: overlay.name || 'AI Overlay',
    type: 'generated',
    settings: {
      htmlContent: overlay.htmlContent,
      sandboxed: true,
    },
    transform: {
      ...DEFAULT_TRANSFORM,
      position: {
        x: Math.round((layout.position.x / 100) * CANVAS_W),
        y: Math.round((layout.position.y / 100) * CANVAS_H),
      },
      size: {
        width: Math.round((layout.size.width / 100) * CANVAS_W),
        height: Math.round((layout.size.height / 100) * CANVAS_H),
      },
    },
    filters: [],
    visible: true,
    locked: false,
    audio: { ...DEFAULT_AUDIO },
    children: [],
    opacity: 1,
    blendMode: 'source-over' as GlobalCompositeOperation,
    isBehindUser: layout.isBehindUser ?? false,
  };
}

function textOverlayToSource(text: TextOverlayState): CompositorSource {
  const layout = text.layout;
  return {
    id: text.id,
    name: `Text: ${text.content.slice(0, 20)}`,
    type: 'text',
    settings: {
      content: text.content,
      fontFamily: text.style.fontFamily,
      fontSize: text.style.fontSize,
      fontWeight: text.style.bold ? 'bold' : 'normal',
      fontStyle: text.style.italic ? 'italic' : 'normal',
      color: text.style.color,
      backgroundColor: text.style.backgroundColor,
      textAlign: text.style.textAlign ?? 'center',
      verticalAlign: 'middle',
      outline: text.style.outline
        ? { color: text.style.borderColor, size: text.style.borderWidth }
        : undefined,
      shadow: text.style.shadow
        ? { color: 'rgba(0,0,0,0.5)', offsetX: 2, offsetY: 2, blur: 4 }
        : undefined,
    },
    transform: {
      ...DEFAULT_TRANSFORM,
      position: {
        x: Math.round((layout.position.x / 100) * CANVAS_W),
        y: Math.round((layout.position.y / 100) * CANVAS_H),
      },
      size: {
        width: Math.round((layout.size.width / 100) * CANVAS_W),
        height: Math.round((layout.size.height / 100) * CANVAS_H),
      },
      rotation: layout.rotation ?? 0,
    },
    filters: [],
    visible: true,
    locked: false,
    audio: { ...DEFAULT_AUDIO },
    children: [],
    opacity: 1,
    blendMode: 'source-over' as GlobalCompositeOperation,
    isBehindUser: layout.isBehindUser ?? false,
  };
}

function fileOverlayToSource(file: FileOverlayState): CompositorSource {
  const layout = file.layout;
  const isImage = file.fileType === 'image';
  const isVideo = file.fileType === 'video';

  return {
    id: file.id,
    name: file.fileName || 'File',
    type: isImage ? 'image' : 'media',
    settings: isImage
      ? { url: file.fileUrl }
      : { url: file.fileUrl, autoPlay: true, loop: isVideo },
    transform: {
      ...DEFAULT_TRANSFORM,
      position: {
        x: Math.round((layout.position.x / 100) * CANVAS_W),
        y: Math.round((layout.position.y / 100) * CANVAS_H),
      },
      size: {
        width: Math.round((layout.size.width / 100) * CANVAS_W),
        height: Math.round((layout.size.height / 100) * CANVAS_H),
      },
      rotation: layout.rotation ?? 0,
    },
    filters: [],
    visible: true,
    locked: false,
    audio: { ...DEFAULT_AUDIO },
    children: [],
    opacity: 1,
    blendMode: 'source-over' as GlobalCompositeOperation,
    isBehindUser: layout.isBehindUser ?? false,
  };
}

function browserOverlayToSource(browser: BrowserOverlayState): CompositorSource {
  const layout = browser.layout;
  return {
    id: browser.id,
    name: 'Browser',
    type: 'browser',
    settings: {
      url: browser.url,
      width: 1920,
      height: 1080,
    },
    transform: {
      ...DEFAULT_TRANSFORM,
      position: {
        x: Math.round((layout.position.x / 100) * CANVAS_W),
        y: Math.round((layout.position.y / 100) * CANVAS_H),
      },
      size: {
        width: Math.round((layout.size.width / 100) * CANVAS_W),
        height: Math.round((layout.size.height / 100) * CANVAS_H),
      },
      rotation: layout.rotation ?? 0,
    },
    filters: [],
    visible: true,
    locked: false,
    audio: { ...DEFAULT_AUDIO },
    children: [],
    opacity: 1,
    blendMode: 'source-over' as GlobalCompositeOperation,
    isBehindUser: layout.isBehindUser ?? false,
  };
}

// ─── Canvas Layout → GridLayout Converter ────────────────────────────────────

function legacyLayoutToGridLayout(layout: CanvasLayoutState): GridLayout | null {
  if (!layout.sections || layout.sections.length <= 1) return null;

  const sectionCount = layout.sections.length;

  // Determine rows/columns from template IDs
  let columns = 1;
  let rows = 1;
  const templateId = layout.templateId ?? '';

  if (templateId.includes('halves') || templateId.includes('horizontal') || templateId.includes('side')) {
    columns = 2;
    rows = 1;
  } else if (templateId.includes('vertical') || templateId.includes('stack')) {
    columns = 1;
    rows = 2;
  } else if (templateId.includes('quadrant') || templateId.includes('grid-4')) {
    columns = 2;
    rows = 2;
  } else if (templateId.includes('thirds')) {
    columns = 3;
    rows = 1;
  } else if (sectionCount === 3) {
    columns = 3;
    rows = 1;
  } else if (sectionCount === 4) {
    columns = 2;
    rows = 2;
  } else if (sectionCount >= 6) {
    columns = 3;
    rows = 2;
  } else {
    columns = sectionCount;
    rows = 1;
  }

  const cells: GridCell[] = layout.sections.map((section, i) => {
    const row = Math.floor(i / columns);
    const col = i % columns;
    return {
      id: section.id,
      row,
      col,
      rowSpan: 1,
      colSpan: 1,
      sourceId: null, // Will be assigned when sources are registered
    };
  });

  return {
    id: `grid-${layout.templateId ?? 'auto'}`,
    name: layout.templateId ?? 'Custom Grid',
    columns,
    rows,
    gap: 4,
    cells,
  };
}
