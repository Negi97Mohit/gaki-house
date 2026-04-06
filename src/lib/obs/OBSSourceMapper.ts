// Single responsibility: map OBS source items to the app's supported overlay types.
import { v4 as uuidv4 } from "uuid";
import {
  SceneState,
  TextOverlayState,
  FileOverlayState,
  BrowserOverlayState,
  GeneratedLayout,
  FileType,
} from "@/types/caption";
import { OBSScene, OBSSceneItem, OBSSceneCollection } from "./OBSParser";
import { mapObsTransformToLayout } from "./CoordinateMapper";

// ─── OBS source IDs this mapper handles ──────────────────────────────────────

const TEXT_SOURCE_IDS = new Set([
  "text_gdiplus",
  "text_gdiplus_v2",
  "text_ft2_source",
  "text_ft2_source_v2",
]);

const IMAGE_SOURCE_IDS = new Set(["image_source"]);

const VIDEO_SOURCE_IDS = new Set(["ffmpeg_source", "vlc_source"]);

const BROWSER_SOURCE_IDS = new Set(["browser_source"]);

// OBS source IDs that are intentionally skipped (hardware / capture / audio)
const KNOWN_SKIP_IDS = new Set([
  "scene",
  "dshow_input",
  "v4l2_source",
  "av_capture_input",
  "av_capture_input_v2",
  "monitor_capture",
  "window_capture",
  "display_capture",
  "xshm_input",
  "wasapi_input_capture",
  "wasapi_output_capture",
  "coreaudio_input_capture",
  "coreaudio_output_capture",
  "audio_line",
  "pulse_input_capture",
  "pulse_output_capture",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Route a local file path through the app's localhost asset server. */
function toLocalAssetUrl(filePath: string): string {
  if (!filePath) return "";
  return `http://localhost:3000/stream?path=${encodeURIComponent(filePath)}`;
}

/** Create a synthetic File object for OBS-imported assets (content-less, URL-backed). */
function syntheticFile(filePath: string, mimeType: string): File {
  const name = filePath.replace(/\\/g, "/").split("/").pop() ?? "unknown";
  return new File([], name, { type: mimeType });
}

/** Build a default CaptionStyle for imported text sources. */
function defaultTextCaptionStyle() {
  return {
    fontFamily: "Inter",
    fontSize: 24,
    color: "#FFFFFF",
    backgroundColor: "transparent",
    position: { x: 50, y: 50 },
    shape: "rectangular" as const,
    animation: "none" as const,
    outline: false,
    shadow: false,
    bold: false,
    italic: false,
    underline: false,
    rotation: 0,
    border: false,
    borderColor: "#000000",
    borderWidth: 0,
    textAlign: "left" as const,
  };
}

/** Default SceneState values — mirrors createDefaultScene() in useSceneManager.ts */
function createDefaultSceneBase(name: string, id: string): SceneState {
  return {
    id,
    name,
    canvasLayout: null,
    textOverlays: [],
    browserOverlays: [],
    fileOverlays: [],
    activeOverlays: [],
    selectedVideoDevice: undefined,
    selectedAudioDevice: undefined,
    isAudioOn: false,
    isVideoOn: false,
    captionsEnabled: true,
    screenShareMode: "off",
    isAiModeEnabled: false,
    aiButtonPosition: { x: 20, y: 20 },
    layoutMode: "solo",
    cameraShape: "rectangle",
    splitRatio: 0.5,
    pipPosition: { x: 75, y: 75 },
    pipSize: { width: 20, height: 20 },
    pipRotation: 0,
    pipBorder: { color: "#FFFFFF", width: 0 },
    pipShadow: { blur: 0, color: "rgba(0,0,0,0.5)" },
    videoFilter: "none",
    backgroundEffect: "none",
    backgroundImageUrl: null,
    blankCanvasColor: "#000000",
    captionStyle: {
      fontFamily: "Inter",
      fontSize: 24,
      color: "#FFFFFF",
      backgroundColor: "rgba(0,0,0,0.5)",
      position: { x: 50, y: 90 },
      shape: "rounded",
      animation: "fade",
      outline: false,
      shadow: true,
      bold: false,
      italic: false,
      underline: false,
      rotation: 0,
      border: false,
      borderColor: "#000000",
      borderWidth: 2,
      textAlign: "center",
    },
    dynamicStyle: "none",
    activeInteractiveFilter: "none",
    filterIntensity: 0.5,
    filterColor: "#22d3ee",
    filterTarget: "both",
    isAutoFramingEnabled: false,
    zoomSensitivity: 0.5,
    trackingSpeed: 0.5,
    isBeautifyEnabled: false,
    isLowLightEnabled: false,
    isNeonEdgeEnabled: false,
    neonIntensity: 0.8,
    neonColor: "#00ff00",
    cameraBackground: "none",
    customBackgroundUrl: null,
    cameraAspectRatio: "16:9",
    canvasAspectRatio: "16:9",
    customAspectRatio: "",
    isFaceTrackingEnabled: false,
  };
}

// ─── Per-item mapping ─────────────────────────────────────────────────────────

interface MappedOverlays {
  textOverlays: TextOverlayState[];
  fileOverlays: FileOverlayState[];
  browserOverlays: BrowserOverlayState[];
}

function mapItem(
  item: OBSSceneItem,
  layout: GeneratedLayout
): MappedOverlays | null {
  const id = item.sourceTypeId;

  if (TEXT_SOURCE_IDS.has(id)) {
    const content: string =
      item.settings?.text ?? item.settings?.content ?? "";
    const color: string = item.settings?.color
      ? `#${(item.settings.color >>> 0).toString(16).padStart(8, "0").slice(2)}`
      : "#FFFFFF";

    const overlay: TextOverlayState = {
      id: uuidv4(),
      content,
      style: { ...defaultTextCaptionStyle(), color },
      layout,
    };
    console.log(`[OBSSourceMapper] Mapped text source "${item.name}"`);
    return { textOverlays: [overlay], fileOverlays: [], browserOverlays: [] };
  }

  if (IMAGE_SOURCE_IDS.has(id)) {
    const filePath: string = item.settings?.file ?? "";
    if (!filePath) {
      console.warn(
        `[OBSSourceMapper] image_source "${item.name}": no file path in settings`
      );
      return null;
    }
    const fileUrl = toLocalAssetUrl(filePath);
    const overlay: FileOverlayState = {
      id: uuidv4(),
      file: syntheticFile(filePath, "image/*"),
      fileName: filePath.replace(/\\/g, "/").split("/").pop() ?? "image",
      fileType: "image" as FileType,
      fileUrl,
      layout,
    };
    console.log(`[OBSSourceMapper] Mapped image source "${item.name}" → ${fileUrl}`);
    return { textOverlays: [], fileOverlays: [overlay], browserOverlays: [] };
  }

  if (VIDEO_SOURCE_IDS.has(id)) {
    const filePath: string =
      item.settings?.local_file ?? item.settings?.playlist?.[0]?.value ?? "";
    if (!filePath) {
      console.warn(
        `[OBSSourceMapper] video source "${item.name}": no file path in settings`
      );
      return null;
    }
    const fileUrl = toLocalAssetUrl(filePath);
    const overlay: FileOverlayState = {
      id: uuidv4(),
      file: syntheticFile(filePath, "video/*"),
      fileName: filePath.replace(/\\/g, "/").split("/").pop() ?? "video",
      fileType: "video" as FileType,
      fileUrl,
      layout,
    };
    console.log(`[OBSSourceMapper] Mapped video source "${item.name}" → ${fileUrl}`);
    return { textOverlays: [], fileOverlays: [overlay], browserOverlays: [] };
  }

  if (BROWSER_SOURCE_IDS.has(id)) {
    const url: string = item.settings?.url ?? "";
    if (!url) {
      console.warn(
        `[OBSSourceMapper] browser_source "${item.name}": no URL in settings`
      );
      return null;
    }
    const overlay: BrowserOverlayState = { id: uuidv4(), url, layout };
    console.log(`[OBSSourceMapper] Mapped browser source "${item.name}" → ${url}`);
    return { textOverlays: [], fileOverlays: [], browserOverlays: [overlay] };
  }

  if (KNOWN_SKIP_IDS.has(id)) {
    console.warn(
      `[OBSSourceMapper] Unsupported source type (known skip): ${id} — "${item.name}"`
    );
  } else {
    console.warn(
      `[OBSSourceMapper] Unsupported source type: ${id} — "${item.name}"`
    );
  }
  return null;
}

// ─── Scene-level mapping ──────────────────────────────────────────────────────

/**
 * Convert a single OBSScene into a fully-formed SceneState ready for importScenes().
 */
export function mapOBSSceneToSceneState(
  obsScene: OBSScene,
  collection: OBSSceneCollection
): SceneState {
  console.log(`[OBSSourceMapper] Mapping scene "${obsScene.name}"`);

  const scene = createDefaultSceneBase(obsScene.name, uuidv4());

  for (const item of obsScene.items) {
    if (!item.visible) {
      console.log(`[OBSSourceMapper] Skipping hidden item "${item.name}"`);
      continue;
    }

    const layout = mapObsTransformToLayout(
      item,
      collection.baseWidth,
      collection.baseHeight
    );
    const mapped = mapItem(item, layout);

    if (!mapped) continue;

    scene.textOverlays = [...scene.textOverlays, ...mapped.textOverlays];
    scene.fileOverlays = [...scene.fileOverlays, ...mapped.fileOverlays];
    scene.browserOverlays = [...scene.browserOverlays, ...mapped.browserOverlays];
  }

  console.log(
    `[OBSSourceMapper] Scene "${obsScene.name}" → ${scene.textOverlays.length} text, ${scene.fileOverlays.length} file, ${scene.browserOverlays.length} browser overlays`
  );

  return scene;
}

/**
 * Convert an entire OBSSceneCollection into an array of SceneState objects.
 */
export function mapOBSCollectionToScenes(
  collection: OBSSceneCollection
): SceneState[] {
  console.log(
    `[OBSSourceMapper] mapOBSCollectionToScenes: ${collection.scenes.length} scene(s)`
  );
  return collection.scenes.map((s) => mapOBSSceneToSceneState(s, collection));
}
