// src/lib/captionPresets.ts
import { CaptionTemplate } from "@/types/caption";
import captionPresetsData from "@/data/captionPresets.json";

export const CAPTION_PRESETS: CaptionTemplate[] =
  captionPresetsData as unknown as CaptionTemplate[];
