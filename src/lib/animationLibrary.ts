// src/lib/animationLibrary.ts
import { AnimationPreset, AnimationCategory } from "@/types/animation";
import animationLibraryData from "@/data/animationLibrary.json";

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

// Cast the imported JSON data to the strict AnimationPreset[] type
export const ANIMATION_LIBRARY: AnimationPreset[] =
  animationLibraryData as unknown as AnimationPreset[];
