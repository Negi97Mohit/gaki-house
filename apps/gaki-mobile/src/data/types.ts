// Proxy file: routes shared types to the monorepo core while keeping mobile-specific types intact

export type { CanvasPreset, CanvasPresetTextOverlay as CanvasTextOverlay } from "@gaki/core/types/canvasPreset";
export type { CaptionStyle } from "@gaki/core/types/caption";
export type { AnimationPreset } from "@gaki/core/types/animation";

export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface CaptionPreset {
  id: string;
  name: string;
  style: import("@gaki/core/types/caption").CaptionStyle;
  preview?: string;
  category?: string;
}

export type CinematicEffect = string;

export interface CinematicPreset {
  id: CinematicEffect;
  name: string;
  description: string;
  color: string;
  category: string;
  preview?: string;
  combines?: string[];
  transform?: {
    duration?: number;
    property?: string;
    loop?: boolean;
    keyframes?: { rotate?: number; scale?: number; x?: number; y?: number }[];
    easing?: string;
  };
  hardwareConstraint?: {
    capability: "pan" | "zoom" | "focusMode" | "tilt" | "exposureMode";
    value: string | number;
  };
  style?: {
    color?: string;
  };
}

export interface InteractiveFilter {
  id: string;
  name: string;
  description?: string;
  preview?: string;
  style?: {
    filter?: string;
  }
}
