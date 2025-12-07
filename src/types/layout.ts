// src/types/layout.ts
export type LayoutMode =
  | "split-vertical"
  | "split-horizontal"
  | "pip"
  | "solo"
  | "corner-floating"
  | "diagonal-split"
  | "grid-3x3"
  | "overlay-full";
export type CameraShape = "rectangle" | "circle" | "rounded";

export interface LayoutState {
  mode: LayoutMode;
  cameraShape: CameraShape;
  splitRatio: number; // 0 to 1, represents divider position
  pipPosition: { x: number; y: number }; // percentage based
  pipSize: { width: number; height: number }; // percentage based
  pipRotation: number;
  customMaskUrl?: string;
  // --- ADDED ---
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  // --- END ADDED ---
}

export const DEFAULT_LAYOUT_STATE: LayoutState = {
  mode: "pip",
  cameraShape: "rectangle",
  splitRatio: 0.5,
  pipPosition: { x: 75, y: 75 }, // bottom-right corner by default
  pipSize: { width: 20, height: 20 },
  pipRotation: 0,
  // --- ADDED ---
  pipBorder: { color: "#FFFFFF", width: 0 },
  pipShadow: { blur: 0, color: "rgba(0,0,0,0.5)" },
  // --- END ADDED ---
};
