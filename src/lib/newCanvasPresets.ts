// src/lib/newCanvasPresets.ts
import { CanvasPreset } from "@/types/canvasPreset";
import newCanvasPresetsData from "@/data/newCanvasPresets.json";

export const NEW_CANVAS_PRESETS: CanvasPreset[] =
  newCanvasPresetsData as unknown as CanvasPreset[];
