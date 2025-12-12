// src/lib/canvasLayouts.ts
import { CanvasLayoutTemplate } from "@/types/layout";
import { EXPANDING_CARDS_TEMPLATE } from "./layouts/ExpandingCards";
import { SLIDER_TEMPLATE } from "./layouts/GradientSlider";
import { VERTICAL_SLIDER_TEMPLATE } from "./layouts/DoubleVerticalSlider";

// Re-export the interface for compatibility
export type { CanvasLayoutTemplate };

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

    if (response.ok) {
      try {
        list = await response.json();
      } catch (e) {
        console.warn("Failed to parse layouts.json, using defaults");
      }
    }

    // Ensure templates are in the list
    if (!list.find((t) => t.id === "expanding-cards")) {
      list.push(EXPANDING_CARDS_TEMPLATE);
    }
    if (!list.find((t) => t.id === "slider-layout")) {
      list.push(SLIDER_TEMPLATE);
    }
    if (!list.find((t) => t.id === "vertical-slider")) {
      list.push(VERTICAL_SLIDER_TEMPLATE);
    }

    const record = list.reduce((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {} as Record<string, CanvasLayoutTemplate>);

    templateCache = { list, record };
    return templateCache;
  } catch (error) {
    console.error("Error loading layout templates:", error);
    const list = [
      EXPANDING_CARDS_TEMPLATE,
      SLIDER_TEMPLATE,
      VERTICAL_SLIDER_TEMPLATE,
    ];
    const record = {
      "expanding-cards": EXPANDING_CARDS_TEMPLATE,
      "slider-layout": SLIDER_TEMPLATE,
      "vertical-slider": VERTICAL_SLIDER_TEMPLATE,
    };
    return { list, record };
  }
}
