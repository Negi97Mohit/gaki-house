/**
 * SceneGraph — Converts the main-thread SceneCollection model into
 * the serialized form the compositor worker needs.
 *
 * The bridge calls this to produce a snapshot every time the store changes,
 * then sends it to the worker via postMessage.
 */

import type { CompositorScene, CompositorSource, GridLayout } from '@/types/compositor';
import type {
  SerializedScene,
  SerializedSource,
  SerializedTransform,
  SerializedFilter,
  SerializedGridLayout,
  SerializedGridCell,
} from './types';

/** Convert a CompositorScene → worker-safe SerializedScene */
export function serializeScene(scene: CompositorScene): SerializedScene {
  return {
    id: scene.id,
    sources: scene.sources.map(serializeSource),
    gridLayout: scene.gridLayout ? serializeGridLayout(scene.gridLayout) : null,
  };
}

/** Convert a CompositorSource → worker-safe SerializedSource */
function serializeSource(source: CompositorSource): SerializedSource {
  const serialized: SerializedSource = {
    id: source.id,
    type: source.type,
    visible: source.visible,
    opacity: source.opacity,
    blendMode: source.blendMode,
    isBehindUser: source.isBehindUser,
    transform: serializeTransform(source),
    filters: source.filters
      .filter((f) => f.enabled)
      .map(
        (f): SerializedFilter => ({
          id: f.id,
          type: f.type,
          enabled: f.enabled,
          settings: { ...f.settings },
        })
      ),
    hasFrame: false, // Set by the bridge when a frame is available
    children: source.children.map(serializeSource),
  };

  // Type-specific serialization
  if (source.type === 'text' && source.settings) {
    serialized.textRender = {
      content: source.settings.content ?? '',
      fontFamily: source.settings.fontFamily ?? 'Inter',
      fontSize: source.settings.fontSize ?? 24,
      fontWeight: source.settings.fontWeight ?? 'normal',
      fontStyle: source.settings.fontStyle ?? 'normal',
      color: source.settings.color ?? '#ffffff',
      backgroundColor: source.settings.backgroundColor ?? 'transparent',
      textAlign: source.settings.textAlign ?? 'left',
      outline: source.settings.outline,
      shadow: source.settings.shadow,
    };
  }

  if (source.type === 'color' && source.settings) {
    serialized.color = source.settings.color ?? '#000000';
  }

  return serialized;
}

function serializeTransform(source: CompositorSource): SerializedTransform {
  const t = source.transform;
  return {
    x: t.position.x,
    y: t.position.y,
    width: t.size.width,
    height: t.size.height,
    rotation: t.rotation,
    cropTop: t.crop.top,
    cropRight: t.crop.right,
    cropBottom: t.crop.bottom,
    cropLeft: t.crop.left,
  };
}

function serializeGridLayout(layout: GridLayout): SerializedGridLayout {
  return {
    columns: layout.columns,
    rows: layout.rows,
    gap: layout.gap,
    cells: layout.cells.map(
      (cell): SerializedGridCell => ({
        id: cell.id,
        row: cell.row,
        col: cell.col,
        rowSpan: cell.rowSpan,
        colSpan: cell.colSpan,
        sourceId: cell.sourceId,
        backgroundColor: cell.backgroundColor,
        padding: cell.padding,
        borderRadius: cell.borderRadius,
      })
    ),
  };
}
