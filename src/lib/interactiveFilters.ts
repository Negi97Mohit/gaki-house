// src/lib/interactiveFilters.ts
import interactiveFiltersData from "@/data/interactiveFilters.json";

export interface InteractiveFilterPreset {
  id: string;
  name: string;
  thumbnailUrl: string;
}

export const INTERACTIVE_FILTER_PRESETS: InteractiveFilterPreset[] =
  interactiveFiltersData as InteractiveFilterPreset[];
