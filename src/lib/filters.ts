// src/lib/filters.ts
export interface FilterPreset {
  id: string;
  name: string;
  style: string;
}

/**
 * @deprecated Use useFilters hook instead.
 */
export const FILTER_PRESETS: FilterPreset[] = [];
