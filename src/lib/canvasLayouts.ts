// src/lib/canvasLayouts.ts
import React from "react";

export interface CanvasLayoutTemplate {
  id: string;
  name: string;
  description: string;
  // icon: React.ReactNode; // --- DELETE THIS LINE ---
  sections: Array<{
    id: string;
    name: string;
    style: React.CSSProperties;
  }>;
}

/**
 * In-memory cache for layout templates
 */
let templateCache: {
  list: CanvasLayoutTemplate[];
  record: Record<string, CanvasLayoutTemplate>;
} | null = null;

/**
 * Fetches layout templates from the public JSON file.
 * Caches results in memory to avoid redundant fetches.
 */
export async function getLayoutTemplates(): Promise<{
  list: CanvasLayoutTemplate[];
  record: Record<string, CanvasLayoutTemplate>;
}> {
  if (templateCache) {
    return templateCache;
  }

  try {
    const response = await fetch("/layouts.json");
    if (!response.ok) {
      throw new Error(`Failed to fetch layouts: ${response.statusText}`);
    }
    const list: CanvasLayoutTemplate[] = await response.json();

    const record = list.reduce((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {} as Record<string, CanvasLayoutTemplate>);

    templateCache = { list, record };
    return templateCache;
  } catch (error) {
    console.error("Error loading layout templates:", error);
    // Return an empty state on error
    return { list: [], record: {} };
  }
}
