// src/types/caption.ts

import type { TextDesignLayer } from "./textDesign";

export type CaptionShape =
  | "rectangular"
  | "rounded"
  | "pill"
  | "speech-bubble"
  | "banner";
export type CaptionAnimation =
  | "fade"
  | "bounce"
  | "karaoke"
  | "none"
  | "slide-up";

export interface CaptionStyle {
  fontFamily: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  position: { x: number; y: number };
  shape: CaptionShape;
  animation: CaptionAnimation;
  outline: boolean;
  shadow: boolean;
  gradient?: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  textShadow?: string;
  width?: number; // ADD THIS LINE (percentage)
  rotation: number;
  border: boolean;
  borderColor: string;
  borderWidth: number;
  letterSpacing?: string;
  padding?: string;
  layers?: TextDesignLayer[] | null;
  textAlign?: "left" | "center" | "right" | "justify";
}

export type GeneratedLayout = {
  position: { x: number; y: number };
  size: { width: number; height: number };
  zIndex: number;
  rotation: number;
  // Control whether overlay should render above or below video elements
  layerOrder?: "above-video" | "below-video" | "auto";
};
export interface GeneratedOverlay {
  id: string;
  name: string;
  htmlContent: string;
  layout: GeneratedLayout;
  preview?: string;
  ambientEffect?: AmbientEffect;
}

export type AmbientEffect =
  | "none"
  | "snow"
  | "rain"
  | "fire"
  | "fire-border"
  | "fire-border-continuous"
  | "sparkles"
  | "neon-pulse"
  | "bokeh"
  | "dust";

// --- SINGLE ACTION COMMANDS ---

export interface GenerateUICommand {
  tool: "generate_ui_component";
  name: string;
  componentCode: string;
  layout: GeneratedLayout;
}

export type SingleActionCommand =
  | GenerateUICommand
  | UpdateUICommand
  | DeleteUICommand
  | ApplyVideoEffectCommand
  | ApplyLiveCaptionStyleCommand;

export type ChainedAction = Omit<SingleActionCommand, "tool"> & {
  tool: SingleActionCommand["tool"];
};

export interface UpdateUICommand {
  tool: "update_ui_component";
  targetId: string;
  layout?: Partial<GeneratedLayout>;
  componentCode?: string;
}

export interface DeleteUICommand {
  tool: "delete_ui_component";
  targetId: string;
}

export interface ApplyVideoEffectCommand {
  tool: "apply_video_effect";
  filter: string;
}

export interface ApplyLiveCaptionStyleCommand {
  tool: "apply_live_caption_style";
  style: React.CSSProperties;
}

// --- Other types remain the same ---
export type LayoutMode = "solo" | "split-vertical" | "split-horizontal" | "pip"; // 1. Add 'solo'
export type CameraShape = "rectangle" | "circle" | "rounded";

export interface LayoutState {
  mode: LayoutMode;
  cameraShape: CameraShape;
  splitRatio: number;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  pipRotation: number; // ADDED
  customMaskUrl?: string;
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
}

export const DEFAULT_LAYOUT_STATE: LayoutState = {
  mode: "solo",
  cameraShape: "rectangle",
  splitRatio: 0.5,
  pipPosition: { x: 75, y: 75 },
  pipSize: { width: 20, height: 20 },
  pipRotation: 0,
  pipBorder: { color: "#FFFFFF", width: 0 },
  pipShadow: { blur: 0, color: "rgba(0,0,0,0.5)" },
};

export type AIDecisionType = "live" | "static";
export type AIDecisionChoice = "SHOW" | "HIDE";

export interface AIDecision {
  id?: string;
  decision: AIDecisionChoice;
  type: AIDecisionType;
  duration: number | "permanent";
  formattedText: string;
  captionIntent?: "title" | "question" | "list" | "stat" | "quote";
}

export interface CaptionTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
  style: CaptionStyle;
}

export type GraphType = "bar" | "line" | "pie";
export interface GraphDataPoint {
  label: string;
  value: number;
}
export interface GraphConfig {
  title: string;
  xAxisLabel?: string;
  yAxisLabel?: string;
}
export interface GraphObject {
  id: string;
  type: "graph";
  graphType: GraphType;
  data: GraphDataPoint[];
  position: { x: number; y: number };
  size: { width: number; height: number };
  config: GraphConfig;
}

export interface MemoryRecord {
  id: string;
  userCommand: string;
  aiActions: SingleActionCommand[];
  timestamp: number;
}

export interface DynamicStyleProps {
  text: string;
  fullTranscript: string;
  interimTranscript: string;
  baseStyle: React.CSSProperties;
}

export interface CaptionStyleDef {
  id: string;
  name: string;
  component: React.FC<DynamicStyleProps>;
  tags?: string[];
  description?: string;
}

export type FileType = "image" | "video" | "pdf" | "audio" | "text" | "unknown";

export interface FileOverlayState {
  id: string;
  file: File;
  fileName: string;
  fileType: FileType;
  fileUrl: string;
  layout: GeneratedLayout;
}

export interface BrowserOverlayState {
  id: string;
  url: string;
  layout: GeneratedLayout;
}

export interface TextOverlayState {
  id: string;
  content: string; // The actual text
  style: CaptionStyle; // Re-use the existing style definition
  layout: GeneratedLayout; // Re-use the existing layout definition
}

export type TransitionType =
  | "none"
  | "dissolve"
  | "slide"
  | "circle_wipe"
  | "color_wipe"
  | "line_wipe";

export type TransitionEasing =
  | "ease-in"
  | "ease-out"
  | "ease-in-out"
  | "linear";
export type TransitionBlendMode = "normal" | "multiply" | "screen" | "overlay";

export interface SceneTransition {
  id: string; // Unique ID for the transition
  fromSceneId: string;
  toSceneId: string;
  type: TransitionType;
  durationMs: number;
  animationIn: TransitionEasing;
  animationOut: TransitionEasing;
  overlayEnabled: boolean;
  blendMode?: TransitionBlendMode;
}

// --- ADDED: State for a camera in a grid section ---
export interface CanvasSectionCameraState {
  videoFilter: string;
  isNeonEdgeEnabled: boolean;
  neonIntensity: number;
  neonColor: string;
  cameraBackground: "none" | "blur" | "image";
  customBackgroundUrl?: string | null;
  isFaceTrackingEnabled: boolean;
  cameraAspectRatio: string;
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  isAutoFramingEnabled: boolean;
  isBeautifyEnabled: boolean;
  isLowLightEnabled: boolean;
  zoomSensitivity: number;
  trackingSpeed: number;
  customAspectRatio: string;
  activeInteractiveFilter?:
  | "none"
  | "neon-edge"
  | "hologram"
  | "pixel"
  | "comic"
  | "ascii"
  | "thermal"
  | "mirror"
  | "kaleidoscope"
  | "oil-paint"
  | "sketch"
  | "prism"
  | "vhs"
  | "infrared"
  | "xray"
  | "cyberpunk"
  | "dominator"
  | "inspector"
  | "manga"
  | "phantom"
  | "matrix"
  | "sepia"
  | "ocean"
  | "sunset"
  | "gothic"
  | "mint"
  | "golden"
  | "lavender"
  | "ghibliSoft"
  | "ghibliWarm"
  | "arcane"
  | "watercolor"
  | "oilPaint"
  | "samuraiInk"
  | "ukiyoe"
  | "comicBold"
  | "pixarSoft"
  | "neonHorror"
  | "frostBlue"
  | "emerald"
  | "demonSlayer"
  | "bleach"
  | "mechaBlue"
  | "toxicGreen"
  | "roseGold"
  | "dreamscape"
  | "bloodMoon"
  | "noirBlue"
  | "pastelCute"
  | "glitchPurple"
  | "fireDragon"
  | "victorianDaguerreotype"
  | "romanFreco"
  | "spartanBronze"
  | "egyptianPapyrus"
  | "medievalIllumination"
  | "xenomorphic"
  | "cosmicVoid"
  | "abyssalDepth"
  | "radioactiveDecay"
  | "renaissanceOil"
  | "byzantineMosaic"
  | "artDeco"
  | "cavePainting"
  | "steampunkBrass"
  | "dystopianGrey"
  | "thermalImaging"
  | "xrayVision"
  | "noirDetective"
  | "sovietPropaganda"
  | "aztecSun"
  | "norseIce"
  | "bioluminescent"
  | "volcanicMagma"
  | "holographicGlitch"
  | "jadeDynasty"
  | "spectralHaunting"
  | "edoPeriod"
  | "cyberneticAugment"
  | "desertMirage"
  | "crystalline";
  filterIntensity?: number;
  filterColor?: string;
  filterTarget?: "both" | "background" | "person";
  selectedDeviceId?: string;
  // --- NEW: Canvas Design Support ---
  canvasDesignId?: string;
  layoutMode?: "solo" | "pip";
  pipPosition?: { x: number; y: number };
  pipSize?: { width: number; height: number };
  sectionBackgroundColor?: string;
  sectionBackgroundImage?: string;
  textOverlays?: TextOverlayState[];
}

// --- CANVAS LAYOUT TYPES ---

// The content for a single grid section
export type CanvasSectionContent =
  | { type: "color"; color?: string }
  | { type: "image"; src?: string }
  | { type: "file"; fileId?: string }
  | { type: "text"; textId?: string }
  | { type: "screen" }
  | { type: "empty" }
  // +++ MODIFIED: Camera type now holds its own settings +++
  | {
    type: "camera";
    settings: CanvasSectionCameraState;
  };
// The state for a single grid section
export interface CanvasSectionState {
  id: string; // e.g., 'main', 'sidebar', 'corner'
  content: CanvasSectionContent;
  savedCameraSettings?: CanvasSectionCameraState;
  defaultContent?: CanvasSectionContent;
}

export interface CustomSectionStyle {
  [sectionId: string]: React.CSSProperties;
}

// The overall layout state for the canvas
export interface CanvasLayoutState {
  templateId: string; // e.g., 'two-halves', 'main-and-corner'
  sections: CanvasSectionState[];
  sectionOrder?: string[];
  customSectionStyles?: CustomSectionStyle; // Store custom resized dimensions
}

// --- SCENE STATE ---
export interface SceneState {
  id: string;
  name: string;

  // Canvas layout grid (null = traditional single canvas)
  canvasLayout: CanvasLayoutState | null;

  // All canvas-specific state
  textOverlays: TextOverlayState[];
  browserOverlays: BrowserOverlayState[];
  fileOverlays: FileOverlayState[];
  activeOverlays: GeneratedOverlay[]; // AI-generated overlays
  // Device & Media State
  selectedVideoDevice: string | undefined;
  selectedAudioDevice: string | undefined;
  isAudioOn: boolean;
  isVideoOn: boolean;
  captionsEnabled: boolean;
  screenShareMode: "off" | "screen" | "canvas";
  isAiModeEnabled: boolean;
  aiButtonPosition: { x: number; y: number };

  // Layout & Effects for this scene
  layoutMode: LayoutMode;
  cameraShape: CameraShape;
  splitRatio: number;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  pipRotation: number; // ADDED
  customMaskUrl?: string;
  // --- ADDED ---
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  // --- END ADDED ---
  videoFilter: string;
  backgroundEffect: "none" | "blur" | "image";
  backgroundImageUrl: string | null;
  blankCanvasColor: string;
  // Caption Style for this scene
  captionStyle: CaptionStyle;
  dynamicStyle: string;

  // Other camera effects
  isAutoFramingEnabled: boolean;
  zoomSensitivity: number;
  trackingSpeed: number;
  isBeautifyEnabled: boolean;
  isLowLightEnabled: boolean;
  isNeonEdgeEnabled: boolean;
  neonIntensity: number;
  neonColor: string;

  // Camera Background Controls
  cameraBackground: "none" | "blur" | "image";
  customBackgroundUrl: string | null;
  activeSequenceId?: string | null;
  cameraAspectRatio: string;
  selectedDeviceId?: string;
  canvasAspectRatio: string;
  customAspectRatio: string;
  isFaceTrackingEnabled: boolean;

  // Interactive Filters
  activeInteractiveFilter:
  | "none"
  | "neon-edge"
  | "hologram"
  | "pixel"
  | "comic"
  | "ascii"
  | "thermal"
  | "mirror"
  | "kaleidoscope"
  | "oil-paint"
  | "sketch"
  | "prism"
  | "vhs"
  | "infrared"
  | "xray"
  | "dominator"
  | "inspector"
  | "classic"
  | "cyberpunk"
  | "manga"
  | "phantom"
  | "matrix"
  | "sepia"
  | "ocean"
  | "sunset"
  | "gothic"
  | "mint"
  | "golden"
  | "lavender"
  | "ghibliSoft"
  | "ghibliWarm"
  | "arcane"
  | "watercolor"
  | "oilPaint"
  | "samuraiInk"
  | "ukiyoe"
  | "comicBold"
  | "pixarSoft"
  | "neonHorror"
  | "frostBlue"
  | "emerald"
  | "demonSlayer"
  | "bleach"
  | "mechaBlue"
  | "toxicGreen"
  | "roseGold"
  | "dreamscape"
  | "bloodMoon"
  | "noirBlue"
  | "pastelCute"
  | "glitchPurple"
  | "fireDragon"
  | "victorianDaguerreotype"
  | "romanFreco"
  | "spartanBronze"
  | "egyptianPapyrus"
  | "medievalIllumination"
  | "xenomorphic"
  | "cosmicVoid"
  | "abyssalDepth"
  | "radioactiveDecay"
  | "renaissanceOil"
  | "byzantineMosaic"
  | "artDeco"
  | "cavePainting"
  | "steampunkBrass"
  | "dystopianGrey"
  | "thermalImaging"
  | "xrayVision"
  | "noirDetective"
  | "sovietPropaganda"
  | "aztecSun"
  | "norseIce"
  | "bioluminescent"
  | "volcanicMagma"
  | "holographicGlitch"
  | "jadeDynasty"
  | "spectralHaunting"
  | "edoPeriod"
  | "cyberneticAugment"
  | "desertMirage"
  | "crystalline";
  filterIntensity: number;
  filterColor: string;
  filterTarget: "both" | "background" | "person";
}

// +++ ADDED: Default state for a new grid camera section +++
export const DEFAULT_CAMERA_STATE: CanvasSectionCameraState = {
  videoFilter: "none",
  isNeonEdgeEnabled: false,
  neonIntensity: 20,
  neonColor: "#00FFFF", // Default to cyan hex
  selectedDeviceId: undefined,
  cameraBackground: "none",
  customBackgroundUrl: null,
  isFaceTrackingEnabled: false,
  cameraAspectRatio: "16:9",
  pipBorder: { color: "#FFFFFF", width: 0 },
  pipShadow: { blur: 0, color: "rgba(0,0,0,0.5)" },
  isAutoFramingEnabled: false,
  isBeautifyEnabled: false,
  isLowLightEnabled: false,
  zoomSensitivity: 4.0,
  trackingSpeed: 0.08,
  customAspectRatio: "",
};
