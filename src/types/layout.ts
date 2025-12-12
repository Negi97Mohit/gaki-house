// src/types/layout.ts
import React from "react";

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
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
}

export const DEFAULT_LAYOUT_STATE: LayoutState = {
  mode: "pip",
  cameraShape: "rectangle",
  splitRatio: 0.5,
  pipPosition: { x: 75, y: 75 }, // bottom-right corner by default
  pipSize: { width: 20, height: 20 },
  pipRotation: 0,
  pipBorder: { color: "#FFFFFF", width: 0 },
  pipShadow: { blur: 0, color: "rgba(0,0,0,0.5)" },
};

// --- ADDED FOR REFRACTOR ---
export interface CanvasLayoutTemplate {
  id: string;
  name: string;
  description: string;
  sections: Array<{
    id: string;
    name: string;
    description?: string;
    style: React.CSSProperties;
  }>;
}
