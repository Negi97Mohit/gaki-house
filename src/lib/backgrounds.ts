// src/lib/backgrounds.ts
import backgroundsData from "@/data/backgrounds.json";

export interface BackgroundOption {
  id: string;
  name: string;
  type: "image" | "blur";
  thumbnailUrl: string;
  imageUrl?: string;
}

export const BACKGROUND_PRESETS: BackgroundOption[] =
  backgroundsData.presets as BackgroundOption[];

export const ASPECT_RATIOS = (backgroundsData as any).aspectRatios || backgroundsData.ratios || [
  { id: "16:9", name: "16:9 (Widescreen)", value: 16 / 9 },
  { id: "9:16", name: "9:16 (Vertical)", value: 9 / 16 },
  { id: "4:3", name: "4:3 (Standard)", value: 4 / 3 },
  { id: "1:1", name: "1:1 (Square)", value: 1 },
  { id: "21:9", name: "21:9 (Ultrawide)", value: 21 / 9 },
  { id: "custom", name: "Custom", value: 0 },
];
