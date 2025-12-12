// src/lib/canvasLayouts.ts
import React from "react";

export interface CanvasLayoutTemplate {
  id: string;
  name: string;
  description: string;
  // icon: React.ReactNode;
  sections: Array<{
    id: string;
    name: string;
    style: React.CSSProperties;
  }>;
}

/**
 * Constant definition for the Expanding Cards layout
 */
export const EXPANDING_CARDS_TEMPLATE: CanvasLayoutTemplate = {
  id: "expanding-cards",
  name: "Expanding Cards",
  description: "Interactive timeline with 5 expanding panels",
  sections: [
    { id: "card-1", name: "Panel 1", style: {} },
    { id: "card-2", name: "Panel 2", style: {} },
    { id: "card-3", name: "Panel 3", style: {} },
    { id: "card-4", name: "Panel 4", style: {} },
    { id: "card-5", name: "Panel 5", style: {} },
  ],
};

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
    let list: CanvasLayoutTemplate[] = [];

    // If fetch is successful, parse the JSON
    if (response.ok) {
      try {
        list = await response.json();
      } catch (e) {
        console.warn("Failed to parse layouts.json, using defaults");
      }
    }

    // Ensure EXPANDING_CARDS_TEMPLATE is in the list
    if (!list.find((t) => t.id === "expanding-cards")) {
      list.push(EXPANDING_CARDS_TEMPLATE);
    }

    const record = list.reduce((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {} as Record<string, CanvasLayoutTemplate>);

    templateCache = { list, record };
    return templateCache;
  } catch (error) {
    console.error("Error loading layout templates:", error);
    // Return a safe default state with our hardcoded template
    const list = [EXPANDING_CARDS_TEMPLATE];
    const record = { "expanding-cards": EXPANDING_CARDS_TEMPLATE };
    return { list, record };
  }
}
