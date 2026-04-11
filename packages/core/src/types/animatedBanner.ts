// src/types/animatedBanner.ts

export interface ParticleSettings {
  count: number;
  speed: number;
  noise: number;
  size: number;
  color: string;
  colorVariant?: string;
}

export interface ShaderEffect {
  name: string;
  uniforms?: Record<string, unknown>;
}

export interface MotionSystem {
  timelines?: string[];
  shaders?: string[];
  particles?: boolean;
  objects3D?: string[];
  postprocessing?: string[];
}

export interface AnimatedBannerDesign {
  id: string;
  name: string;
  description: string;
  preview: string;
  layout: "horizontal" | "vertical" | "compact" | "card" | "frame";
  theme:
    | "cosmic"
    | "cyber"
    | "organic"
    | "ethereal"
    | "vtuber"
    | "esports"
    | "cinematic";
  technologiesUsed: string[];
  motionSystem: MotionSystem;
  animatedBehaviors: string[];
  layers: {
    foreground?: string;
    midground?: string;
    background: string;
  };
  shaderEffects: ShaderEffect[];
  particleSettings?: ParticleSettings;
  colorVariants: string[];
  recommendedUseCases: string[];
  showAvatar: boolean;
  showTagline: boolean;
  maxLinks: number;
}
