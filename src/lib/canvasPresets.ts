import { CanvasPreset } from "@/types/canvasPreset";
import standardPresets from "@/data/canvasPresets.json";
import dynamicPresets from "@/data/dynamic/dynamicPresets.json";
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

// Helper to remove duplicates by ID
const deduplicate = (items: CanvasPreset[]) => {
  const seen = new Set();
  return items.filter((item) => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

// Merge standard and dynamic presets, prioritizing dynamic ones if IDs clash
export const CANVAS_PRESETS: CanvasPreset[] = deduplicate([
  ...(dynamicPresets as unknown as CanvasPreset[]),
  ...(standardPresets as unknown as CanvasPreset[]),
]);

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
