// Single responsibility: convert OBS absolute-pixel item transforms to app GeneratedLayout percentages.
import { GeneratedLayout } from "@/types/caption";
import { OBSSceneItem } from "./OBSParser";

/**
 * Map an OBS scene item's transform to the app's GeneratedLayout.
 * OBS: absolute pixels on a baseWidth×baseHeight canvas.
 * App: percentages (0-100) of canvas dimensions.
 *
 * Size resolution order:
 *   1. boundsType > 0 AND bounds non-zero  → use bounds
 *   2. Fallback → 30% × 20% (visible, safe)
 */
export function mapObsTransformToLayout(
  item: OBSSceneItem,
  baseWidth: number,
  baseHeight: number
): GeneratedLayout {
  console.log(
    `[CoordinateMapper] "${item.name}" pos(${item.pos.x},${item.pos.y}) bounds(${item.bounds.x},${item.bounds.y}) boundsType=${item.boundsType}`
  );

  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  const xPct = clamp((item.pos.x / baseWidth) * 100, 0, 100);
  const yPct = clamp((item.pos.y / baseHeight) * 100, 0, 100);

  let widthPct: number;
  let heightPct: number;

  if (item.boundsType > 0 && (item.bounds.x > 0 || item.bounds.y > 0)) {
    widthPct = clamp((item.bounds.x / baseWidth) * 100, 1, 100);
    heightPct = clamp((item.bounds.y / baseHeight) * 100, 1, 100);
  } else {
    console.warn(
      `[CoordinateMapper] "${item.name}": no usable bounds, using fallback 30×20%`
    );
    widthPct = 30;
    heightPct = 20;
  }

  return {
    position: { x: xPct, y: yPct },
    size: { width: widthPct, height: heightPct },
    zIndex: 10,
    rotation: item.rot,
  };
}
