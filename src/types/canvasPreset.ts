// src/types/canvasPreset.ts
import { CanvasLayoutState } from "../types/caption";

export interface CanvasPresetBackground {
  blankCanvasColor: string; // Can be solid color or gradient
  backgroundEffect: "none" | "blur";
}

export interface CanvasPresetPip {
  layoutMode:
    | "pip"
    | "split-vertical"
    | "split-horizontal"
    | "solo" // <-- ADDED solo
    | "grid-3x3"
    | "overlay-full"
    | "corner-floating"
    | "diagonal-split";
  cameraShape: "rectangle" | "circle" | "rounded" | "hexagon" | "organic-blob";
  pipPosition?: { x: number; y: number };
  pipSize?: { width: number; height: number };
  splitRatio?: number;
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  responsive?: {
    // (No functional change, just formatting)
    mobile?: {
      layoutMode?: string;
      pipPosition?: { x: number; y: number };
      pipSize?: { width: number; height: number };
    };
    tablet?: {
      layoutMode?: string;
      pipPosition?: { x: number; y: number };
      pipSize?: { width: number; height: number };
    };
  };
}

export interface CanvasPresetTextOverlay {
  id: string;
  content: string;
  style: {
    fontFamily: string;
    fontSize: number;
    color: string;
    backgroundColor: string;
    textShadow?: string;
    textAlign: "left" | "center" | "right";
    fontWeight?: string;
    border?: string;
    backdropFilter?: string;
    borderRadius?: string;
  };
  layout: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    rotation: number;
    layerOrder?: "above-video" | "below-video" | "auto";
  };
  responsive?: {
    mobile?: {
      style?: Partial<CanvasPresetTextOverlay["style"]>;
      layout?: Partial<CanvasPresetTextOverlay["layout"]>;
    };
    tablet?: {
      style?: Partial<CanvasPresetTextOverlay["style"]>;
      layout?: Partial<CanvasPresetTextOverlay["layout"]>;
    };
  };
}

export interface CanvasPresetEffects {
  videoFilter?: string;
  isBeautifyEnabled?: boolean;
  isNeonEdgeEnabled?: boolean;
  neonColor?: "cyan" | "magenta" | "green";
  neonIntensity?: number;
}

export interface CanvasPreset {
  id: string;
  name: string;
  styleTags: string[];
  background: CanvasPresetBackground;
  pip: CanvasPresetPip;
  textOverlays: CanvasPresetTextOverlay[];
  effects: CanvasPresetEffects;
  canvasAspectRatio?: string;
  canvasLayout: CanvasLayoutState | null;
}
