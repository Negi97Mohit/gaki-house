import { v4 as uuidv4 } from "uuid";
import type { SceneState } from "@gaki/core/types/caption";

export interface UseSceneManagerProps {
  // recording prop removed
}

export const generateSceneId = () => `scene-${uuidv4()}`;
export const generateSubsceneId = () => `subscene-${uuidv4()}`;
export const generateTransitionId = () => `transition-${uuidv4()}`;

export const createDefaultScene = (name: string): SceneState => ({
  id: uuidv4(),
  name,
  canvasLayout: null,
  textOverlays: [],
  browserOverlays: [],
  fileOverlays: [],
  activeOverlays: [],
  emptyGridPanels: [],

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
  activeSequenceId: null,
  cameraAspectRatio: "16:9",
  canvasAspectRatio: "16:9",
  customAspectRatio: "",
  isFaceTrackingEnabled: false,
});
