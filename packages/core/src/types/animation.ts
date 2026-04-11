// src/types/animation.ts

export type AnimationCategory =
  | "All"
  | "Reveal"
  | "Morph"
  | "Glitch"
  | "Data"
  | "Kinetic"
  | "Social"
  | "UI"
  | "User";

export interface AnimationPreset {
  id: string;
  name: string;
  category: AnimationCategory;
  thumbnail?: string;
  isCustom?: boolean;

  defaultContent: {
    [key: string]: string;
  };

  baseStyle: {
    fontFamily: string;
    fontSize: number;
    color: string;
    accentColor?: string;
    backgroundColor?: string;
    alignment: "left" | "center" | "right";

    // --- NEW STYLING PROPERTIES ---
    textShadow?: string; // e.g., "0 0 10px #ff00de" for neon
    backgroundBlur?: number; // px value for glassmorphism
    backgroundOpacity?: number; // 0-1
    gradient?: string; // CSS gradient string
  };

  animationConfig: {
    duration: number;
    delay?: number;
    intensity?: number;
    direction?: "up" | "down" | "left" | "right";
    easing?: "smooth" | "bouncy" | "elastic" | "linear";
    loop?: boolean;
    loopDelay?: number;
  };
}
