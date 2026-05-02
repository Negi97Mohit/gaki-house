// Proxy file: routes shared types to the monorepo core while keeping mobile-specific types intact

export type { Position, Size, CanvasTextOverlay, CanvasPreset } from "@gaki/core/types/canvasPreset";
export type { CaptionPreset } from "@gaki/core/types/caption";
export type { AnimationPreset } from "@gaki/core/types/animation";

export type CinematicEffect = string;

export interface CinematicPreset {
  id: CinematicEffect;
  name: string;
  description: string;
  color: string;
  category: string;
  preview?: string;
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
