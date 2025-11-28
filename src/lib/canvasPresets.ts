// src/lib/canvasPresets.ts
import { CanvasPreset } from "@/types/canvasPreset";
import { NEW_CANVAS_PRESETS } from "./newCanvasPresets";
import canvasPresetsData from "@/data/canvasPresets.json";

export const CANVAS_PRESETS: CanvasPreset[] = [
  ...(canvasPresetsData as unknown as CanvasPreset[]),
  ...NEW_CANVAS_PRESETS,
];

export const CANVAS_PRESET_CATEGORIES = [
  { id: "all", name: "All Designs", icon: "LayoutGrid" },
  { id: "community", name: "Community", icon: "Users" },
  { id: "luxury", name: "Luxury", icon: "Crown" },
  { id: "modern", name: "Modern", icon: "Zap" },
  { id: "minimal", name: "Minimal", icon: "Minus" },
  { id: "tech", name: "Tech", icon: "Cpu" },
  { id: "cinematic", name: "Cinematic", icon: "Film" },
  { id: "fashion", name: "Fashion", icon: "Shirt" },
  { id: "vintage", name: "Vintage", icon: "Clock" },
];
