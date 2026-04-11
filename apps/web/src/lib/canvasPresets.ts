import { CanvasPreset } from "@caption-cam/core/types/canvasPreset";
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

// Deprecated static data - replaced by useCanvasPresets hook
export const CANVAS_PRESETS: CanvasPreset[] = [];

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
  // Deprecated use of static array
  return [];
}

export function getPresetById(id: string): CanvasPreset | undefined {
  // Deprecated use of static array
  return undefined;
}
