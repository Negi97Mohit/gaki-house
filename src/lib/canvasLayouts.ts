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

// --- EXISTING DYNAMIC TEMPLATE ---
export const PERFORMANCE_FLOW_TEMPLATE: CanvasLayoutTemplate = {
  id: "performance-flow",
  name: "Performance Flow",
  description: "A cinematic horizontal scroll layout.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "flow-1", name: "Featured 1", style: { background: "#1a1a1a" } },
    { id: "flow-2", name: "Featured 2", style: { background: "#1a1a1a" } },
    { id: "flow-3", name: "Featured 3", style: { background: "#1a1a1a" } },
  ],
};

// --- NEW AWWWARDS TEMPLATES ---

export const VOGUE_PARALLAX_TEMPLATE: CanvasLayoutTemplate = {
  id: "vogue-parallax",
  name: "Vogue Editorial",
  description: "High-fashion parallax with sticky typography.",
  category: "dynamic" as LayoutCategory,
  sections: [
    {
      id: "vogue-1",
      name: "Cover",
      style: { background: "linear-gradient(to bottom, #ffffff, #f7f7f7)" },
    },
    {
      id: "vogue-2",
      name: "Editorial",
      style: { background: "linear-gradient(to bottom, #f7f7f7, #eaeaea)" },
    },
    {
      id: "vogue-3",
      name: "Details",
      style: {
        background: "linear-gradient(to top, #fff1eb 0%, #ace0f9 100%)",
      },
    },
    {
      id: "vogue-4",
      name: "Backstage",
      style: {
        background: "linear-gradient(120deg, #fdfbfb 0%, #ebedee 100%)",
      },
    },
  ],
};

export const LIQUID_LENS_TEMPLATE: CanvasLayoutTemplate = {
  id: "liquid-lens",
  name: "Liquid Lens",
  description: "Interactive liquid distortion on a clean surface.",
  category: "dynamic" as LayoutCategory,
  sections: [
    {
      id: "liq-1",
      name: "Fluid 1",
      style: {
        background: "linear-gradient(120deg, #a1c4fd 0%, #c2e9fb 100%)",
      },
    },
    {
      id: "liq-2",
      name: "Fluid 2",
      style: {
        background: "linear-gradient(120deg, #d4fc79 0%, #96e6a1 100%)",
      },
    },
    {
      id: "liq-3",
      name: "Fluid 3",
      style: {
        background: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
      },
    },
  ],
};

export const ORIGAMI_FOLD_TEMPLATE: CanvasLayoutTemplate = {
  id: "origami-fold",
  name: "Origami Fold",
  description: "3D structural folding animation on scroll.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "fold-1", name: "Fold 1", style: { background: "#111" } },
    { id: "fold-2", name: "Fold 2", style: { background: "#111" } },
    { id: "fold-3", name: "Fold 3", style: { background: "#111" } },
    { id: "fold-4", name: "Fold 4", style: { background: "#111" } },
  ],
};

export const BRUTALIST_GLITCH_TEMPLATE: CanvasLayoutTemplate = {
  id: "brutalist-glitch",
  name: "Brutalist Glitch",
  description: "Aggressive digital noise and RGB splitting.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "glitch-1", name: "Err_01", style: { background: "#000" } },
    { id: "glitch-2", name: "Err_02", style: { background: "#000" } },
    { id: "glitch-3", name: "Err_03", style: { background: "#000" } },
  ],
};

export const HADID_RIBBON_TEMPLATE: CanvasLayoutTemplate = {
  id: "hadid-ribbon",
  name: "Hadid Ribbon",
  description: "Parametric 3D spline curve layout.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "node-1", name: "Node 1", style: { background: "#080808" } },
    { id: "node-2", name: "Node 2", style: { background: "#080808" } },
    { id: "node-3", name: "Node 3", style: { background: "#080808" } },
    { id: "node-4", name: "Node 4", style: { background: "#080808" } },
    { id: "node-5", name: "Node 5", style: { background: "#080808" } },
  ],
};

export const VORTEX_TUNNEL_TEMPLATE: CanvasLayoutTemplate = {
  id: "vortex-tunnel",
  name: "Vortex Tunnel",
  description: "Infinite cylindrical scroll flight.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "sec-1", name: "Sector 1", style: { background: "#000" } },
    { id: "sec-2", name: "Sector 2", style: { background: "#000" } },
    { id: "sec-3", name: "Sector 3", style: { background: "#000" } },
    { id: "sec-4", name: "Sector 4", style: { background: "#000" } },
    { id: "sec-5", name: "Sector 5", style: { background: "#000" } },
  ],
};

export const GRAVITY_MASONRY_TEMPLATE: CanvasLayoutTemplate = {
  id: "gravity-masonry",
  name: "Gravity Sim",
  description: "Physics-based falling grid items.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "phys-1", name: "Object 1", style: { background: "#1a1a1a" } },
    { id: "phys-2", name: "Object 2", style: { background: "#1a1a1a" } },
    { id: "phys-3", name: "Object 3", style: { background: "#1a1a1a" } },
    { id: "phys-4", name: "Object 4", style: { background: "#1a1a1a" } },
  ],
};

export const PARTICLE_DISSOLVE_TEMPLATE: CanvasLayoutTemplate = {
  id: "particle-dissolve",
  name: "Particle Dissolve",
  description: "Images disperse into thousands of points.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "part-1", name: "Atom 1", style: { background: "#000" } },
    { id: "part-2", name: "Atom 2", style: { background: "#000" } },
    { id: "part-3", name: "Atom 3", style: { background: "#000" } },
  ],
};

export const GLASS_PRISM_TEMPLATE: CanvasLayoutTemplate = {
  id: "glass-prism",
  name: "Glass Prism",
  description: "Refractive glass blocks with HDR lighting.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "glass-1", name: "Prism 1", style: { background: "#f0f0f0" } },
    { id: "glass-2", name: "Prism 2", style: { background: "#f0f0f0" } },
    { id: "glass-3", name: "Prism 3", style: { background: "#f0f0f0" } },
  ],
};

export type { CanvasLayoutTemplate };

// IDs that should be marked as dynamic
const DYNAMIC_LAYOUT_IDS = new Set([
  "carousel-3-cards",
  "carousel-5-cards",
  "performance-flow",
  "magnetism-layout",
  // New IDs
  "vogue-parallax",
  "liquid-lens",
  "origami-fold",
  "brutalist-glitch",
  "hadid-ribbon",
  "vortex-tunnel",
  "gravity-masonry",
  "particle-dissolve",
  "glass-prism",
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
        list = parsed.map((layout: CanvasLayoutTemplate) => ({
          ...layout,
          category: DYNAMIC_LAYOUT_IDS.has(layout.id)
            ? ("dynamic" as LayoutCategory)
            : layout.category || ("static" as LayoutCategory),
        }));
      } catch (e) {
        console.warn("Failed to parse layouts.json, using defaults");
      }
    }

    // Register all templates including new ones
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
      // --- REGISTER NEW TEMPLATES HERE ---
      VOGUE_PARALLAX_TEMPLATE,
      LIQUID_LENS_TEMPLATE,
      ORIGAMI_FOLD_TEMPLATE,
      BRUTALIST_GLITCH_TEMPLATE,
      HADID_RIBBON_TEMPLATE,
      VORTEX_TUNNEL_TEMPLATE,
      GRAVITY_MASONRY_TEMPLATE,
      PARTICLE_DISSOLVE_TEMPLATE,
      GLASS_PRISM_TEMPLATE,
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
    // Fallback list
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
      VOGUE_PARALLAX_TEMPLATE,
      LIQUID_LENS_TEMPLATE,
      ORIGAMI_FOLD_TEMPLATE,
      BRUTALIST_GLITCH_TEMPLATE,
      HADID_RIBBON_TEMPLATE,
      VORTEX_TUNNEL_TEMPLATE,
      GRAVITY_MASONRY_TEMPLATE,
      PARTICLE_DISSOLVE_TEMPLATE,
      GLASS_PRISM_TEMPLATE,
    ];

    const record = defaults.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {} as Record<string, CanvasLayoutTemplate>);

    return { list: defaults, record };
  }
}
