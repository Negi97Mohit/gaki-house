// src/lib/canvasLayouts.ts
import { CanvasLayoutTemplate } from "@/types/layout";
import { EXPANDING_CARDS_TEMPLATE } from "./layouts/ExpandingCards";
import { SLIDER_TEMPLATE } from "./layouts/GradientSlider";
import { VERTICAL_SLIDER_TEMPLATE } from "./layouts/DoubleVerticalSlider";
import { SPLIT_LANDING_PAGE_TEMPLATE } from "./layouts/SplitLandingPage"; // Import new layout

export type { CanvasLayoutTemplate };

let templateCache: {
  list: CanvasLayoutTemplate[];
  record: Record<string, CanvasLayoutTemplate>;
} | null = null;

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

    // Register all templates
    const defaults = [
      EXPANDING_CARDS_TEMPLATE,
      SLIDER_TEMPLATE,
      VERTICAL_SLIDER_TEMPLATE,
      SPLIT_LANDING_PAGE_TEMPLATE, // Add to defaults
    ];

    defaults.forEach((t) => {
      if (!list.find((existing) => existing.id === t.id)) {
        list.push(t);
      }
    });

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
      SPLIT_LANDING_PAGE_TEMPLATE,
    ];
    const record = {
      "expanding-cards": EXPANDING_CARDS_TEMPLATE,
      "slider-layout": SLIDER_TEMPLATE,
      "vertical-slider": VERTICAL_SLIDER_TEMPLATE,
      "split-landing-page": SPLIT_LANDING_PAGE_TEMPLATE,
    };
    return { list, record };
  }
}
