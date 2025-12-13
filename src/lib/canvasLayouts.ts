// src/lib/canvasLayouts.ts
import { CanvasLayoutTemplate, LayoutCategory } from "@/types/layout";
import { EXPANDING_CARDS_TEMPLATE } from "./layouts/ExpandingCards";
import { SLIDER_TEMPLATE } from "./layouts/GradientSlider";
import { VERTICAL_SLIDER_TEMPLATE } from "./layouts/DoubleVerticalSlider";
import { SPLIT_LANDING_PAGE_TEMPLATE } from "./layouts/SplitLandingPage";
import { CASE_STUDY_TEMPLATE } from "./layouts/CaseStudy";
import { PORTFOLIO_SCROLL_TEMPLATE } from "./layouts/PortfolioScroll";
import { SIMON_PORTFOLIO_TEMPLATE } from "./layouts/SimonPortfolio";
import { MAGNETISM_GRID_TEMPLATE } from "./layouts/MagnetismGrid";


export const PERFORMANCE_FLOW_TEMPLATE: CanvasLayoutTemplate = {
  id: "performance-flow",
  name: "Performance Flow",
  description: "A cinematic horizontal scroll layout.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "flow-1", name: "Featured 1", style: { background: "#1a1a1a" } },
    { id: "flow-2", name: "Featured 2", style: { background: "#1a1a1a" } },
    { id: "flow-3", name: "Featured 3", style: { background: "#1a1a1a" } },
    { id: "flow-4", name: "Featured 4", style: { background: "#1a1a1a" } },
    { id: "flow-5", name: "Featured 5", style: { background: "#1a1a1a" } },
    { id: "flow-6", name: "Featured 6", style: { background: "#1a1a1a" } },
  ],
};

export type { CanvasLayoutTemplate };

// IDs of layouts that should be marked as dynamic (from layouts.json)
const DYNAMIC_LAYOUT_IDS = new Set([
  "carousel-3-cards",
  "carousel-5-cards",
  "carousel-5-cards",
  "performance-flow",
  "magnetism-layout",
]);

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
        const parsed = await response.json();
        // Add category to layouts from JSON based on DYNAMIC_LAYOUT_IDS
        list = parsed.map((layout: CanvasLayoutTemplate) => ({
          ...layout,
          category: DYNAMIC_LAYOUT_IDS.has(layout.id) ? 'dynamic' as LayoutCategory : (layout.category || 'static' as LayoutCategory),
        }));
      } catch (e) {
        console.warn("Failed to parse layouts.json, using defaults");
      }
    }

    // Register all templates (already have category defined)
    const defaults = [
      EXPANDING_CARDS_TEMPLATE,
      SLIDER_TEMPLATE,
      VERTICAL_SLIDER_TEMPLATE,
      SPLIT_LANDING_PAGE_TEMPLATE,
      CASE_STUDY_TEMPLATE,
      PORTFOLIO_SCROLL_TEMPLATE,
      SIMON_PORTFOLIO_TEMPLATE,
      PERFORMANCE_FLOW_TEMPLATE,
      MAGNETISM_GRID_TEMPLATE,
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
      CASE_STUDY_TEMPLATE,
      PORTFOLIO_SCROLL_TEMPLATE,
      SIMON_PORTFOLIO_TEMPLATE,
      PERFORMANCE_FLOW_TEMPLATE,
      MAGNETISM_GRID_TEMPLATE,
    ];
    const record = {
      "expanding-cards": EXPANDING_CARDS_TEMPLATE,
      "slider-layout": SLIDER_TEMPLATE,
      "vertical-slider": VERTICAL_SLIDER_TEMPLATE,
      "split-landing-page": SPLIT_LANDING_PAGE_TEMPLATE,
      "case-study": CASE_STUDY_TEMPLATE,
      "portfolio-scroll": PORTFOLIO_SCROLL_TEMPLATE,
      "simon-portfolio": SIMON_PORTFOLIO_TEMPLATE,
      "performance-flow": PERFORMANCE_FLOW_TEMPLATE,
      "magnetism-layout": MAGNETISM_GRID_TEMPLATE,
    };
    return { list, record };
  }
}
