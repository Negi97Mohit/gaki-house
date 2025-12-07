// src/types/canvasPreset.ts

import type { CanvasLayoutState } from "./caption";

export interface ResponsiveLayout {
  mobile?: {
    layout?: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    };
    style?: {
      fontFamily?: string;
      fontSize?: number;
      color?: string;
      backgroundColor?: string;
      textShadow?: string;
      textAlign?: "left" | "center" | "right";
      fontWeight?: number | string;
    };
    pipPosition?: { x: number; y: number };
    pipSize?: { width: number; height: number };
    layoutMode?: string;
  };
  tablet?: {
    layout?: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    };
    style?: {
      fontFamily?: string;
      fontSize?: number;
      color?: string;
      backgroundColor?: string;
      textShadow?: string;
      textAlign?: "left" | "center" | "right";
      fontWeight?: number | string;
    };
    pipPosition?: { x: number; y: number };
    pipSize?: { width: number; height: number };
    layoutMode?: string;
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
    textAlign: "left" | "center" | "right";
    fontWeight?: number | string;
    letterSpacing?: string;
    textTransform?: string;
    textShadow?: string;
    border?: string;
    backdropFilter?: string;
  };
  layout: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    rotation: number;
    layerOrder?: string;
  };
  responsive?: ResponsiveLayout;
}

export interface CanvasPreset {
  id: string;
  name: string;
  styleTags: string[];
  canvasAspectRatio: string;
  publicId?: string;
  background: {
    blankCanvasColor: string;
    backgroundEffect: string;
    backgroundImageUrl?: string;
  };
  pip: {
    layoutMode: string;
    cameraShape: string;
    pipPosition: { x: number; y: number };
    pipSize: { width: number; height: number };
    pipBorder?: { color: string; width: number };
    pipShadow?: { blur: number; color: string };
    splitRatio?: number;
    responsive?: ResponsiveLayout;
  };
  textOverlays: CanvasPresetTextOverlay[];
  effects: {
    videoFilter: string;
    interactiveFilter?: string;
    isBeautifyEnabled?: boolean;
    isNeonEdgeEnabled?: boolean;
    neonColor?: string;
    neonIntensity?: number;
  };
  canvasLayout?: CanvasLayoutState | null;
}

// Re-export from lib for convenience
export { CANVAS_PRESETS, CANVAS_PRESET_CATEGORIES, getPresetsByCategory, getPresetById } from "@/lib/canvasPresets";
