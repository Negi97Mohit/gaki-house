// Single responsibility: parse a raw OBS scene-collection JSON into a typed, app-consumable structure.

// ─── Raw OBS JSON shapes ─────────────────────────────────────────────────────

interface OBSRawVec2 {
  x: number;
  y: number;
}

interface OBSRawSceneItem {
  name: string;
  pos: OBSRawVec2;
  bounds: OBSRawVec2;
  bounds_type: number;
  scale: OBSRawVec2;
  rot: number;
  visible?: boolean;
}

interface OBSRawSource {
  name: string;
  id: string;
  settings: Record<string, any>;
}

interface OBSRawCollection {
  scene_collection_name?: string;
  name?: string; // older export format
  sources?: OBSRawSource[];
  transitions?: Array<{
    id: string;
    name: string;
    settings: {
      path?: string;
      transition_point?: number;
    };
  }>;
}

// ─── Typed output shapes ──────────────────────────────────────────────────────

export interface OBSSceneItem {
  /** OBS source type id e.g. "image_source", "browser_source" */
  sourceTypeId: string;
  /** Display name of the source */
  name: string;
  /** Source-specific settings (file path, url, text, etc.) */
  settings: Record<string, any>;
  pos: OBSRawVec2;
  /** Rendered bounds size in OBS canvas pixels. Zero when bounds_type = 0. */
  bounds: OBSRawVec2;
  /** 0 = no bounds (use scale×native), >0 = explicit bounds apply */
  boundsType: number;
  scale: OBSRawVec2;
  /** Rotation in degrees */
  rot: number;
  visible: boolean;
}

export interface OBSScene {
  name: string;
  items: OBSSceneItem[];
}

export interface OBSSceneCollection {
  name: string;
  scenes: OBSScene[];
  /** OBS canvas width (typically 1920) */
  baseWidth: number;
  /** OBS canvas height (typically 1080) */
  baseHeight: number;
  stingerConfig?: {
    path: string;
    transitionPoint: number;
  };
}

// ─── Parser ───────────────────────────────────────────────────────────────────

const DEFAULT_BASE_WIDTH = 1920;
const DEFAULT_BASE_HEIGHT = 1080;

/**
 * Parse a raw OBS scene-collection JSON object into a typed OBSSceneCollection.
 * Throws a descriptive error if the JSON is not a recognisable OBS export.
 */
export function parseOBSCollection(json: unknown): OBSSceneCollection {
  console.log("[OBSParser] parseOBSCollection called");

  if (typeof json !== "object" || json === null) {
    throw new Error("[OBSParser] Invalid input: expected a JSON object");
  }

  const raw = json as OBSRawCollection;

  if (!Array.isArray(raw.sources) || raw.sources.length === 0) {
    throw new Error(
      "[OBSParser] Unrecognised OBS format: missing top-level 'sources' array"
    );
  }

  const collectionName =
    raw.scene_collection_name ?? raw.name ?? "Imported Collection";

  // Build a name→source lookup for non-scene sources
  const sourceMap = new Map<string, OBSRawSource>();
  for (const src of raw.sources) {
    if (src.id !== "scene") {
      sourceMap.set(src.name, src);
    }
  }

  console.log(
    `[OBSParser] Found ${sourceMap.size} non-scene sources in collection`
  );

  // Extract scenes (sources whose id is "scene")
  const rawScenes = raw.sources.filter((s) => s.id === "scene");

  if (rawScenes.length === 0) {
    throw new Error(
      "[OBSParser] No scenes found in OBS collection (no source with id='scene')"
    );
  }

  console.log(`[OBSParser] Found ${rawScenes.length} scene(s) to parse`);

  const scenes: OBSScene[] = rawScenes.map((rawScene) => {
    const rawItems: OBSRawSceneItem[] = Array.isArray(rawScene.settings?.items)
      ? rawScene.settings.items
      : [];

    const items: OBSSceneItem[] = [];

    for (const item of rawItems) {
      const sourceDef = sourceMap.get(item.name);
      if (!sourceDef) {
        console.warn(
          `[OBSParser] Scene "${rawScene.name}": source definition not found for item named "${item.name}" — skipping`
        );
        continue;
      }

      items.push({
        sourceTypeId: sourceDef.id,
        name: item.name,
        settings: sourceDef.settings ?? {},
        pos: item.pos ?? { x: 0, y: 0 },
        bounds: item.bounds ?? { x: 0, y: 0 },
        boundsType: item.bounds_type ?? 0,
        scale: item.scale ?? { x: 1, y: 1 },
        rot: item.rot ?? 0,
        visible: item.visible !== false,
      });
    }

    console.log(
      `[OBSParser] Scene "${rawScene.name}": parsed ${items.length} item(s)`
    );

    return { name: rawScene.name, items };
  });

  let stingerConfig;
  if (Array.isArray(raw.transitions)) {
    const stinger = raw.transitions.find((t) => t.id === "obs_stinger_transition");
    if (stinger?.settings?.path && stinger?.settings?.transition_point !== undefined) {
      stingerConfig = {
        path: stinger.settings.path,
        transitionPoint: stinger.settings.transition_point,
      };
      console.log(`[OBSParser] Found Stinger Transition: ${stingerConfig.path} (${stingerConfig.transitionPoint}ms)`);
    }
  }

  return {
    name: collectionName,
    scenes,
    baseWidth: DEFAULT_BASE_WIDTH,
    baseHeight: DEFAULT_BASE_HEIGHT,
    stingerConfig,
  };
}
