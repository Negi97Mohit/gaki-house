import { Scene, SceneSource, SourceType } from "../store/useSceneStore";

const mapObsTypeToInternal = (obsSourceId: string): SourceType => {
  const cameraTypes = [
    "dshow_input",
    "av_capture_input",
    "v4l2_input",
    "decklink_input",
  ];
  const screenTypes = [
    "monitor_capture",
    "window_capture",
    "game_capture",
    "xshm_input",
  ];

  if (cameraTypes.includes(obsSourceId)) return "camera";
  if (screenTypes.includes(obsSourceId)) return "screen";
  return "unsupported";
};

// NEW: The smart math translation
const calculatePercentageBounds = (
  item: any,
  baseWidth: number,
  baseHeight: number,
) => {
  // Extract OBS positioning (defaulting to 0 if missing)
  const x = item.pos?.x || 0;
  const y = item.pos?.y || 0;

  // OBS stores scaling separately from bounds, we need to calculate physical size
  const sourceWidth = item.bounds?.x || baseWidth;
  const sourceHeight = item.bounds?.y || baseHeight;
  const scaleX = item.scale?.x || 1;
  const scaleY = item.scale?.y || 1;

  const actualWidth = sourceWidth * scaleX;
  const actualHeight = sourceHeight * scaleY;

  // Convert absolute pixels to 0-100 percentages
  return {
    x: (x / baseWidth) * 100,
    y: (y / baseHeight) * 100,
    width: (actualWidth / baseWidth) * 100,
    height: (actualHeight / baseHeight) * 100,
  };
};

export const parseObsCollection = (jsonString: string): Scene[] => {
  try {
    const rawData = JSON.parse(jsonString);

    // Attempt to extract the base canvas resolution from the OBS JSON (default to 1080p)
    // Note: OBS JSON structure varies slightly by version, so we fallback gracefully
    const baseWidth = rawData.video?.base_cx || 1920;
    const baseHeight = rawData.video?.base_cy || 1080;

    const obsScenes =
      rawData.sources?.filter((s: any) => s.id === "scene") || [];

    const parsedScenes: Scene[] = obsScenes.map((obsScene: any) => {
      const items = obsScene.settings?.items || [];

      const sources: SceneSource[] = items.map((item: any) => ({
        id: `source-${item.id}-${Date.now()}`,
        name: item.name,
        type: mapObsTypeToInternal(item.name),
        // Pass the item through our math translator
        position: calculatePercentageBounds(item, baseWidth, baseHeight),
      }));

      return {
        id: `scene-${obsScene.uuid || Date.now()}`,
        name: obsScene.name,
        sources: sources,
      };
    });

    return parsedScenes;
  } catch (error) {
    console.error("Failed to parse OBS JSON:", error);
    throw new Error("Invalid OBS Scene Collection file.");
  }
};
