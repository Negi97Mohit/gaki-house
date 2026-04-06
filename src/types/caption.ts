// src/types/caption.ts

import type { TextDesignLayer, TextDesignPreset, TextLayer } from "./textDesign";

// Re-export for convenience
export type { TextDesignPreset, TextLayer };

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
  borderRadius?: number; // ADD THIS LINE
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
  isBehindUser?: boolean; // New prop for user segmentation depth
  is3D?: boolean;
  /** Raw OBS scale from import — used to recompute size after native dims are known */
  obsScale?: { x: number; y: number };
};
export interface GeneratedOverlay {
  id: string;
  name: string;
  htmlContent: string;
  layout: GeneratedLayout;
  preview?: string;
  ambientEffect?: AmbientEffect;
  metadata?: any;
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

export type FileType =
  | "image"
  | "video"
  | "pdf"
  | "audio"
  | "text"
  | "3d"
  | "unknown";

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
  // Basic Transitions
  | "none"
  | "hard_cut"
  | "cross_dissolve"
  | "fade_black"
  | "fade_white"
  | "j_cut"
  | "l_cut"
  | "match_cut"
  | "wipe"
  | "dip_color"
  | "cross_blur"
  // Dynamic & Motion-Based
  | "pan"
  | "whip_pan"
  | "zoom_in"
  | "zoom_out"
  | "spin"
  | "push"
  | "slide"
  | "object_block"
  | "speed_ramp"
  | "mirror"
  // Trendy & Effect-Driven
  | "glitch"
  | "light_leak"
  | "burn"
  | "pixelate"
  | "auto_mask"
  | "liquid"
  | "banding_h"
  | "banding_v"
  | "film_roll"
  | "reveal"
  | "bloom"
  | "iris_wipe"
  | "breaker";

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
  cameraShape?: CameraShape;
}

// --- CANVAS LAYOUT TYPES ---

// The content for a single grid section
export type CanvasSectionContent =
  | { type: "color"; color?: string }
  | { type: "image"; src?: string }
  | {
    type: "file";
    fileId?: string;
    url?: string;
    fileType?: FileType;
    name?: string;
  }
  | { type: "text"; textId?: string }
  | {
    type: "screen";
    sourceId?: string;
    displayMode?: "fit" | "fill" | "stretch" | "center" | "span";
  }
  | { type: "empty" }
  // +++ MODIFIED: Camera type now holds its own settings +++
  | {
    type: "camera";
    settings: CanvasSectionCameraState;
  };
// The state for a single grid section
export interface CanvasSectionState {
  id: string; // e.g., 'main', 'sidebar', 'corner'
  name?: string; // Optional display name for the section
  content: CanvasSectionContent;
  savedCameraSettings?: CanvasSectionCameraState;
  defaultContent?: CanvasSectionContent;
  style?: React.CSSProperties; // Added to match usage in layout templates
}

// Extended CSS properties for layout editor styling
export interface ExtendedCSSProperties extends React.CSSProperties {
  bold?: boolean;
  italic?: boolean;
}

export interface CustomSectionStyle {
  [sectionId: string]: ExtendedCSSProperties;
}

export interface SectionData {
  name?: string;
  description?: string;
  // Extended fields
  category?: string; // e.g. "Brand Identity" / "Project No."
  date?: string; // e.g. "2024"
  label?: string; // e.g. "01.12"
  creditsLabel?: string; // e.g. "Credits"
  creditsValue?: string; // e.g. "Designed by Users"
  location?: string; // e.g. "Paris, FR"
  // Simon portfolio fields
  year?: string;
  client?: string;
  // Global layout settings (for _global key)
  siteName?: string;
  tagline?: string;
  menuItems?: string[];
  [key: string]: any; // Allow additional custom fields
}

// The overall layout state for the canvas
export interface CanvasLayoutState {
  templateId: string; // e.g., 'two-halves', 'main-and-corner'
  sections: CanvasSectionState[];
  sectionOrder?: string[];
  customSectionStyles?: CustomSectionStyle; // Store custom resized dimensions
  customSectionData?: Record<string, SectionData>; // Store editable text
}

// --- SUBSCENE STATE ---
export interface SubSceneState {
  id: string;
  name: string;
  parentId: string;
  order: number;
  transitionToNext?: SceneTransition;
  // Full canvas preset reference for this subscene
  canvasPreset?: {
    id: string;
    name: string;
    blankCanvasColor: string;
    backgroundEffect: "none" | "blur" | "image";
    backgroundImageUrl?: string | null;
    layoutMode: LayoutMode;
    cameraShape: CameraShape;
    pipPosition: { x: number; y: number };
    pipSize: { width: number; height: number };
    pipBorder?: { color: string; width: number };
    pipShadow?: { blur: number; color: string };
    videoFilter: string;
    textOverlays: TextOverlayState[];
    canvasAspectRatio?: string;
    isBeautifyEnabled?: boolean;
    isNeonEdgeEnabled?: boolean;
    neonColor?: string;
    neonIntensity?: number;
  };
}

// --- SCENE STATE ---
export interface SceneState {
  id: string;
  name: string;
  // Subscene support
  subscenes?: SubSceneState[];
  activeSubsceneId?: string;
  isExpanded?: boolean;

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
  selectedScreenSourceId?: string; // ADDED
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

// --- SCENE AUDIO TRACK ---
export interface SceneAudioTrack {
  id: string;
  name: string;
  /** "file" = uploaded file, "url" = stream/URL */
  sourceType: "file" | "url";
  /** Object URL for uploaded files, or a remote URL/stream */
  sourceUrl: string;
  volume: number; // 0-100
  isMuted: boolean;
  isLooping: boolean;
  isPlaying: boolean;
  /** Current playback position in seconds */
  currentTime: number;
  /** Total duration in seconds (populated after load) */
  duration: number;
  /** Scene IDs this track is assigned to. Empty = all scenes */
  assignedSceneIds: string[];
  /** Smart ducking: auto-lower volume when mic input is detected */
  duckingEnabled: boolean;
  /** How much to reduce volume (0-100, percentage of original volume to keep) */
  duckingLevel: number;
}

// +++ ADDED: Default state for a new grid camera section +++
export const DEFAULT_CAMERA_STATE: CanvasSectionCameraState = {
  videoFilter: "none",
  isNeonEdgeEnabled: false,
  neonIntensity: 20,
  neonColor: "#00FFFF", // Default to cyan hex
  selectedDeviceId: undefined,
  cameraShape: "rectangle",
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
