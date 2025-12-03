// src/lib/canvasPresets.ts
import { CanvasPreset } from "@/types/canvasPreset";
import canvasPresetsData from "@/data/canvasPresets.json";
import {
  LayoutGrid,
  Crown,
  Zap,
  Minus,
  Cpu,
  Film,
  Shirt,
  Clock,
  Users,
} from "lucide-react";

// Directly cast the JSON data to the type
export const CANVAS_PRESETS: CanvasPreset[] =
  canvasPresetsData as unknown as CanvasPreset[];

export const CANVAS_PRESET_CATEGORIES = [
  { id: "all", name: "All Designs", icon: "LayoutGrid" },
  { id: "magazine", name: "Magazine", icon: "Crown" },
  { id: "modern", name: "Modern", icon: "Zap" },
  { id: "minimal", name: "Minimal", icon: "Minus" },
  { id: "tech", name: "Tech / Cyber", icon: "Cpu" },
  { id: "cinematic", name: "Cinematic", icon: "Film" },
  { id: "fashion", name: "Fashion", icon: "Shirt" },
  { id: "retro", name: "Retro", icon: "Clock" },
  { id: "community", name: "Community", icon: "Users" },
];

export function getPresetsByCategory(category: string): CanvasPreset[] {
  if (category === "all") return CANVAS_PRESETS;
  return CANVAS_PRESETS.filter((preset) => preset.styleTags.includes(category));
}

export function getPresetById(id: string): CanvasPreset | undefined {
  return CANVAS_PRESETS.find((preset) => preset.id === id);
}
