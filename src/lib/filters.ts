// src/lib/filters.ts
import filtersData from "@/data/filters.json";

export interface FilterPreset {
  id: string;
  name: string;
  style: string;
}

export const FILTER_PRESETS: FilterPreset[] = filtersData as FilterPreset[];
