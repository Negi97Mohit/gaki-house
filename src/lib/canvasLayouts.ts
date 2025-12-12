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
 * Uses linear gradients for each card.
 * Includes top/left/width/height so the preview component renders them correctly as columns.
 */
export const EXPANDING_CARDS_TEMPLATE: CanvasLayoutTemplate = {
  id: "expanding-cards",
  name: "Expanding Cards",
  description: "Interactive timeline with 5 expanding panels",
  sections: [
    {
      id: "card-1",
      name: "Sunrise",
      style: {
        top: "0%",
        left: "0%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "card-2",
      name: "Lavender",
      style: {
        top: "0%",
        left: "20%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "card-3",
      name: "Ocean",
      style: {
        top: "0%",
        left: "40%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "card-4",
      name: "Peach",
      style: {
        top: "0%",
        left: "60%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "card-5",
      name: "Sky",
      style: {
        top: "0%",
        left: "80%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
        color: "#ffffff",
      },
    },
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
    const list = [EXPANDING_CARDS_TEMPLATE];
    const record = { "expanding-cards": EXPANDING_CARDS_TEMPLATE };
    return { list, record };
  }
}
