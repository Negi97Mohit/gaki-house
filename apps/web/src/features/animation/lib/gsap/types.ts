import type gsap from "gsap";

export type GSAPAnimationType =
  | "cinematic-reveal"
  | "kinetic-type"
  | "morph-glitch"
  | "elastic-bounce"
  | "stagger-wave"
  | "split-text"
  | "perspective-flip"
  | "liquid-fill"
  | "neon-flicker"
  | "typewriter"
  | "scramble"
  | "magnetic-pull"
  | "particle-burst"
  | "rubber-band"
  | "shatter"
  | "ink-reveal"
  | "spotlight"
  | "parallax-depth"
  | "whip-pan"
  | "zoom-punch"
  // New effect-based animations
  | "fire-effect"
  | "water-effect"
  | "snow-effect"
  | "confetti-effect"
  | "graffiti-effect"
  | "neon-particles-effect"
  | "electric-effect"
  | "glitch-blocks-effect"
  | "rainbow-burst-effect"
  | "pulse-rings-effect"
  | "bounce-balls-effect"
  | "shake-debris-effect"
  | "glow-orbs-effect"
  | "float-bubbles-effect"
  | "flame-sparks-effect"
  | "ice-crystals-effect";

export interface GSAPAnimationConfig {
  type: GSAPAnimationType;
  duration?: number;
  delay?: number;
  stagger?: number;
  ease?: string;
  loop?: boolean;
  loopDelay?: number;
  intensity?: number;
  direction?: "up" | "down" | "left" | "right" | "center";
  color?: string;
  fontFamily?: string;
  fontSize?: number;
}

export interface GSAPPreset {
  id: string;
  name: string;
  category:
    | "reveal"
    | "kinetic"
    | "glitch"
    | "stylized"
    | "3d"
    | "text"
    | "effects";
  description: string;
  config: GSAPAnimationConfig;
  preview?: string;
  particleEffect?: string; // Links to EffectType from particleEffects.ts
}

// ANIMATION DEFINITIONS

