// src/lib/animationLibrary.ts
import { AnimationPreset, AnimationCategory } from "@gaki/core/types/animation";

export const ANIMATION_CATEGORIES: AnimationCategory[] = [
  "All",
  "Reveal",
  "Morph",
  "Glitch",
  "Data",
  "Kinetic",
  "Social",
  "UI",
];

// Deprecated: Data is now fetched via useAnimationLibrary hook
export const ANIMATION_LIBRARY: AnimationPreset[] = [];
