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
 * Constant definition for the Gradient Slider layout
 * Updated: Removed images, added gradients, designed for white background.
 */
export const SLIDER_TEMPLATE: CanvasLayoutTemplate = {
  id: "slider-layout",
  name: "Gradient Slider",
  description: "Clean slider with gradient backgrounds",
  sections: [
    {
      id: "slide-1",
      name: "Deep Purple",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "slide-2",
      name: "Sunset Orange",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "slide-3",
      name: "Ocean Blue",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "slide-4",
      name: "Lush Green",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "slide-5",
      name: "Midnight",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(to top, #30cfd0 0%, #330867 100%)",
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

    if (!list.find((t) => t.id === "expanding-cards")) {
      list.push(EXPANDING_CARDS_TEMPLATE);
    }
    if (!list.find((t) => t.id === "slider-layout")) {
      list.push(SLIDER_TEMPLATE);
    }

    const record = list.reduce((acc, template) => {
      acc[template.id] = template;
      return acc;
    }, {} as Record<string, CanvasLayoutTemplate>);

    templateCache = { list, record };
    return templateCache;
  } catch (error) {
    console.error("Error loading layout templates:", error);
    const list = [EXPANDING_CARDS_TEMPLATE, SLIDER_TEMPLATE];
    const record = {
      "expanding-cards": EXPANDING_CARDS_TEMPLATE,
      "slider-layout": SLIDER_TEMPLATE,
    };
    return { list, record };
  }
}
