// src/types/textDesign.ts

export interface TextDesignPreset {
  id: string;
  name: string;
  category: string;
  thumbnail: string; // CSS gradient or color for preview

  // REPLACED 'style' WITH 'layers'
  layers: TextDesignLayer[];

  // Animation properties
  animation?: {
    type: string; // e.g., "bounce-in", "fade-up", "fire", "snow", "confetti"
    duration: number;
    delay?: number;
    infinite?: boolean;
  };
  
  // CSS animation keyframes (for custom animations)
  animationCSS?: string;
}

// 1. DEFINE THE LAYER TYPES
// (Based on your examples)

export type TextLayer = {
  type: "text";
  fontFamily: string;
  fontSize: number;
  color?: string;
  gradient?: string; // For gradients
  letterSpacing?: string;
};

type StrokeLayer = {
  type: "stroke";
  color: string;
  width: number;
  fontFamily?: string;
};

type GlowLayer = {
  type: "glow" | "outer-glow";
  color: string;
  blur: number;
  spread?: number;
};

type ShadowLayer = {
  type: "shadow" | "inner-shadow";
  color: string;
  blur: number;
  offsetX: number;
  offsetY: number;
};

type ExtrudeLayer = {
  type: "extrude";
  depth: number;
  angle: number;
  color: string;
};

type TextureLayer = {
  type: "texture";
  src: string;
  blendMode: "overlay" | "multiply" | "screen" | "normal";
  opacity: number;
};

type OffsetLayer = {
  type: "offset-layer"; // For VHS/chromatic aberration
  color: string;
  offsetX: number;
  offsetY: number;
};

type GlossLayer = {
  type: "gloss"; // For chrome/metal
  strength: number;
};

// --- NEW LAYER TYPES ---

type InnerCoreLayer = {
  type: "inner-core";
  color: string;
  intensity: number;
};

type AmbientBloomLayer = {
  type: "ambient-bloom";
  color: string;
  opacity: number;
};

type SpecularHighlightLayer = {
  type: "specular-highlight";
  strength: number;
};

type RefractionLayer = {
  type: "refraction";
  intensity: number;
};

type SpeedlinesLayer = {
  type: "speedlines";
  opacity: number;
};

type HalftoneLayer = {
  type: "halftone";
  opacity: number;
};

type FogLayer = {
  type: "fog";
  opacity: number;
};

type PuffLayer = {
  type: "3d-puff" | "jelly-3d" | "puff";
  depth?: number;
  strength?: number;
};

type GrainLayer = { type: "grain"; opacity: number };
type ScanlinesLayer = { type: "scanlines"; opacity: number };
type DustLayer = { type: "dust"; opacity: number };
type DripLayer = { type: "drip"; length: number };
type SplatterLayer = { type: "splatter"; opacity: number };
type SparkleLayer = { type: "sparkle"; density: number };

type ShiftLayer = {
  type: "prism-shift" | "rgb-shift";
  strength: number;
};

type EffectLayer = {
  type:
    | "dot-grid"
    | "bloom"
    | "gold-foil"
    | "emboss"
    | "rimlight"
    | "diamond-facets"
    | "chrome";
  size?: number;
  strength?: number;
  texture?: string;
  color?: string;
};

// --- END NEW LAYER TYPES ---

// This is the new union type for all possible layers
export type TextDesignLayer =
  | TextLayer
  | StrokeLayer
  | GlowLayer
  | ShadowLayer
  | ExtrudeLayer
  | TextureLayer
  | OffsetLayer
  | GlossLayer
  | InnerCoreLayer
  | AmbientBloomLayer
  | SpecularHighlightLayer
  | RefractionLayer
  | SpeedlinesLayer
  | HalftoneLayer
  | FogLayer
  | PuffLayer
  | GrainLayer
  | ScanlinesLayer
  | DustLayer
  | DripLayer
  | SplatterLayer
  | SparkleLayer
  | ShiftLayer
  | EffectLayer;

// 2. UPDATE THE PRESET DEFINITION

export type TextDesignCategory =
  | "all"
  | "headlines"
  | "modern"
  | "elegant"
  | "fun"
  | "effects"
  | "retro"
  | "vintage"
  | "tech"
  | "soft"
  // (add new categories from your examples)
  | "futuristic"
  | "casual"
  | "urban";
