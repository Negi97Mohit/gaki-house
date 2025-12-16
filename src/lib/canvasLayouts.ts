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

export const ZAHA_PARAMETRIC_TEMPLATE: CanvasLayoutTemplate = {
  id: "zaha-parametric",
  name: "Zaha Parametric",
  description: "Abstract curved 3D geometries and flow.",
  category: "dynamic" as LayoutCategory,
  sections: [{ id: "zaha-1", name: "Main", style: { background: "#000" } }],
};

export const WINTOUR_EDITORIAL_TEMPLATE: CanvasLayoutTemplate = {
  id: "wintour-editorial",
  name: "Wintour Editorial",
  description: "High-impact typography and scroll snapping.",
  category: "dynamic" as LayoutCategory,
  sections: [{ id: "win-1", name: "Cover", style: { background: "#fff" } }],
};

export const SISTINE_DEPTH_TEMPLATE: CanvasLayoutTemplate = {
  id: "sistine-depth",
  name: "Sistine Depth",
  description: "Deep parallax and layered floating elements.",
  category: "dynamic" as LayoutCategory,
  sections: [{ id: "sis-1", name: "Layer 1", style: { background: "#1a1512" } }],
};

export const VITRUVIAN_MOTION_TEMPLATE: CanvasLayoutTemplate = {
  id: "vitruvian-motion",
  name: "Vitruvian Motion",
  description: "Technical sketching and geometry animations.",
  category: "dynamic" as LayoutCategory,
  sections: [{ id: "vit-1", name: "Canvas", style: { background: "#f5f1eb" } }],
};

export const LIQUID_CHROME_TEMPLATE: CanvasLayoutTemplate = {
  id: "liquid-chrome",
  name: "Liquid Chrome",
  description: "Metallic liquid distortion effect.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "chrome-1", name: "Chrome", style: { background: "#e0e0e0" } }
  ],
};

// --- NEW INNOVATIVE DYNAMIC LAYOUTS ---

export const AURORA_BOREALIS_TEMPLATE: CanvasLayoutTemplate = {
  id: "aurora-borealis",
  name: "Aurora Borealis",
  description: "Northern lights with flowing particle waves.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "aurora-1", name: "Aurora 1", style: { background: "#050a14" } },
    { id: "aurora-2", name: "Aurora 2", style: { background: "#050a14" } },
    { id: "aurora-3", name: "Aurora 3", style: { background: "#050a14" } },
  ],
};

export const MORPHING_BLOB_TEMPLATE: CanvasLayoutTemplate = {
  id: "morphing-blob",
  name: "Morphing Blob",
  description: "Organic blob shapes with gooey physics.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "blob-1", name: "Blob 1", style: { background: "#fef3f2" } },
    { id: "blob-2", name: "Blob 2", style: { background: "#fef3f2" } },
    { id: "blob-3", name: "Blob 3", style: { background: "#fef3f2" } },
  ],
};

export const NEON_PULSE_CITY_TEMPLATE: CanvasLayoutTemplate = {
  id: "neon-pulse-city",
  name: "Neon Pulse City",
  description: "Cyberpunk grid with pulsing neon effects.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "neon-1", name: "Node 01", style: { background: "#0a0a14" } },
    { id: "neon-2", name: "Node 02", style: { background: "#0a0a14" } },
    { id: "neon-3", name: "Node 03", style: { background: "#0a0a14" } },
  ],
};

export const ORIGAMI_UNFOLD_TEMPLATE: CanvasLayoutTemplate = {
  id: "origami-unfold",
  name: "Origami Unfold",
  description: "3D paper folding animation effects.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "fold-1", name: "Fold 1", style: { background: "#FDFAF6" } },
    { id: "fold-2", name: "Fold 2", style: { background: "#FFF5F5" } },
  ],
};

export const LIQUID_MIRROR_TEMPLATE: CanvasLayoutTemplate = {
  id: "liquid-mirror",
  name: "Liquid Mirror",
  description: "Interactive water ripple distortion.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "mirror-1", name: "Reflection 1", style: { background: "#1a365d" } },
    { id: "mirror-2", name: "Reflection 2", style: { background: "#1a365d" } },
    { id: "mirror-3", name: "Reflection 3", style: { background: "#1a365d" } },
  ],
};

export const PARTICLE_UNIVERSE_TEMPLATE: CanvasLayoutTemplate = {
  id: "particle-universe",
  name: "Particle Universe",
  description: "Interactive particle system with gravity.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "star-1", name: "Star System 1", style: { background: "#050514" } },
    { id: "star-2", name: "Star System 2", style: { background: "#050514" } },
    { id: "star-3", name: "Star System 3", style: { background: "#050514" } },
  ],
};

export const GLITCH_MATRIX_TEMPLATE: CanvasLayoutTemplate = {
  id: "glitch-matrix",
  name: "Glitch Matrix",
  description: "Digital rain with glitch distortion.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "matrix-1", name: "Node 001", style: { background: "#000000" } },
    { id: "matrix-2", name: "Node 002", style: { background: "#000000" } },
    { id: "matrix-3", name: "Node 003", style: { background: "#000000" } },
  ],
};

export const HOLOGRAPHIC_PRISM_TEMPLATE: CanvasLayoutTemplate = {
  id: "holographic-prism",
  name: "Holographic Prism",
  description: "Rainbow light refraction effects.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "prism-1", name: "Spectrum 1", style: { background: "#0a0a0f" } },
    { id: "prism-2", name: "Spectrum 2", style: { background: "#0a0a0f" } },
    { id: "prism-3", name: "Spectrum 3", style: { background: "#0a0a0f" } },
  ],
};

export const ELASTIC_MORPH_CARDS_TEMPLATE: CanvasLayoutTemplate = {
  id: "elastic-morph-cards",
  name: "Elastic Morph Cards",
  description: "Rubber-band physics card interactions.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "elastic-1", name: "Card 1", style: { background: "#FF6B6B" } },
    { id: "elastic-2", name: "Card 2", style: { background: "#4ECDC4" } },
    { id: "elastic-3", name: "Card 3", style: { background: "#45B7D1" } },
  ],
};

export const CINEMATIC_PARALLAX_TEMPLATE: CanvasLayoutTemplate = {
  id: "cinematic-parallax",
  name: "Cinematic Parallax",
  description: "Film-style depth of field parallax.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "scene-1", name: "Scene 01", style: { background: "#0a0a0f" } },
    { id: "scene-2", name: "Scene 02", style: { background: "#0a0a0f" } },
  ],
};

// --- PHASE 4: ARTISTIC VISION LAYOUTS ---

export const TEMPORAL_FRACTURE_TEMPLATE: CanvasLayoutTemplate = {
  id: "temporal-fracture",
  name: "Temporal Fracture",
  description: "Nolan-inspired time-fragmented grid.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "frag-1", name: "Fragment 1", style: { background: "#0a0c12" } },
    { id: "frag-2", name: "Fragment 2", style: { background: "#0a0c12" } },
    { id: "frag-3", name: "Fragment 3", style: { background: "#0a0c12" } },
  ],
};

export const PARAMETRIC_FLOW_TEMPLATE: CanvasLayoutTemplate = {
  id: "parametric-flow",
  name: "Parametric Flow",
  description: "Hadid-inspired curved panel system.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "curve-1", name: "Curve A", style: { background: "#fafafa" } },
    { id: "curve-2", name: "Curve B", style: { background: "#fafafa" } },
    { id: "curve-3", name: "Curve C", style: { background: "#fafafa" } },
  ],
};

export const EDITORIAL_GRID_SHIFT_TEMPLATE: CanvasLayoutTemplate = {
  id: "editorial-grid-shift",
  name: "Editorial Grid Shift",
  description: "Magazine grid that shifts clockwise on click.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "edit-1", name: "Featured", style: { background: "#ffffff" } },
    { id: "edit-2", name: "Panel 2", style: { background: "#ffffff" } },
    { id: "edit-3", name: "Panel 3", style: { background: "#ffffff" } },
  ],
};

export const FIBONACCI_CASCADE_TEMPLATE: CanvasLayoutTemplate = {
  id: "fibonacci-cascade",
  name: "Fibonacci Cascade",
  description: "Da Vinci-inspired golden ratio layout.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "fib-1", name: "Sequence 1", style: { background: "#faf8f5" } },
    { id: "fib-2", name: "Sequence 2", style: { background: "#faf8f5" } },
    { id: "fib-3", name: "Sequence 3", style: { background: "#faf8f5" } },
  ],
};

export const DEPTH_CHOREOGRAPHY_TEMPLATE: CanvasLayoutTemplate = {
  id: "depth-choreography",
  name: "Depth Choreography",
  description: "Cinematic depth of field layers.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "depth-1", name: "Layer 1", style: { background: "#0a0a0f" } },
    { id: "depth-2", name: "Layer 2", style: { background: "#0a0a0f" } },
  ],
};

export const CRYSTALLINE_TESSELLATION_TEMPLATE: CanvasLayoutTemplate = {
  id: "crystalline-tessellation",
  name: "Crystalline Tessellation",
  description: "Hadid-inspired geometric fracturing.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "crystal-1", name: "Facet 1", style: { background: "#fafafc" } },
    { id: "crystal-2", name: "Facet 2", style: { background: "#fafafc" } },
    { id: "crystal-3", name: "Facet 3", style: { background: "#fafafc" } },
  ],
};

export const HAUTE_COUTURE_STACKS_TEMPLATE: CanvasLayoutTemplate = {
  id: "haute-couture-stacks",
  name: "Haute Couture Stacks",
  description: "Fashion runway card reveals.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "look-1", name: "Look 01", style: { background: "#f8f8f6" } },
    { id: "look-2", name: "Look 02", style: { background: "#f8f8f6" } },
    { id: "look-3", name: "Look 03", style: { background: "#f8f8f6" } },
  ],
};

export const CHIAROSCURO_CANVAS_TEMPLATE: CanvasLayoutTemplate = {
  id: "chiaroscuro-canvas",
  name: "Chiaroscuro Canvas",
  description: "Michelangelo-inspired dramatic lighting.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "study-1", name: "Study 1", style: { background: "#0a0806" } },
    { id: "study-2", name: "Study 2", style: { background: "#0a0806" } },
  ],
};

export const INTERSTELLAR_DOCK_TEMPLATE: CanvasLayoutTemplate = {
  id: "interstellar-dock",
  name: "Interstellar Dock",
  description: "3D rotating spacecraft modules.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "module-1", name: "Module 001", style: { background: "#05050f" } },
    { id: "module-2", name: "Module 002", style: { background: "#05050f" } },
    { id: "module-3", name: "Module 003", style: { background: "#05050f" } },
  ],
};

export const VOID_EMERGENCE_TEMPLATE: CanvasLayoutTemplate = {
  id: "void-emergence",
  name: "Void Emergence",
  description: "Physics-based panel emergence.",
  category: "dynamic" as LayoutCategory,
  sections: [
    { id: "entity-1", name: "Entity 01", style: { background: "#08050f" } },
    { id: "entity-2", name: "Entity 02", style: { background: "#08050f" } },
    { id: "entity-3", name: "Entity 03", style: { background: "#08050f" } },
  ],
};

export type { CanvasLayoutTemplate };

// IDs that should be marked as dynamic
const DYNAMIC_LAYOUT_IDS = new Set([
  "carousel-3-cards",
  "carousel-5-cards",
  "performance-flow",
  "magnetism-layout",
  // Phase 2 IDs
  "vogue-parallax",
  "liquid-lens",
  "brutalist-glitch",
  "hadid-ribbon",
  "zaha-parametric",
  "wintour-editorial",
  "sistine-depth",
  "vitruvian-motion",
  "liquid-chrome",
  // Phase 3 - New Innovative Layouts
  "aurora-borealis",
  "morphing-blob",
  "neon-pulse-city",
  "origami-unfold",
  "liquid-mirror",
  "particle-universe",
  "glitch-matrix",
  "holographic-prism",
  "elastic-morph-cards",
  "cinematic-parallax",
  // Phase 4 - Artistic Vision Layouts
  "temporal-fracture",
  "parametric-flow",
  "editorial-grid-shift",
  "fibonacci-cascade",
  "depth-choreography",
  "crystalline-tessellation",
  "haute-couture-stacks",
  "chiaroscuro-canvas",
  "interstellar-dock",
  "void-emergence",
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
      BRUTALIST_GLITCH_TEMPLATE,
      HADID_RIBBON_TEMPLATE,
      ZAHA_PARAMETRIC_TEMPLATE,
      WINTOUR_EDITORIAL_TEMPLATE,
      SISTINE_DEPTH_TEMPLATE,
      VITRUVIAN_MOTION_TEMPLATE,
      LIQUID_CHROME_TEMPLATE,
      // New Innovative Layouts
      AURORA_BOREALIS_TEMPLATE,
      MORPHING_BLOB_TEMPLATE,
      NEON_PULSE_CITY_TEMPLATE,
      ORIGAMI_UNFOLD_TEMPLATE,
      LIQUID_MIRROR_TEMPLATE,
      PARTICLE_UNIVERSE_TEMPLATE,
      GLITCH_MATRIX_TEMPLATE,
      HOLOGRAPHIC_PRISM_TEMPLATE,
      ELASTIC_MORPH_CARDS_TEMPLATE,
      CINEMATIC_PARALLAX_TEMPLATE,
      // Phase 4 - Artistic Vision Layouts
      TEMPORAL_FRACTURE_TEMPLATE,
      PARAMETRIC_FLOW_TEMPLATE,
      EDITORIAL_GRID_SHIFT_TEMPLATE,
      FIBONACCI_CASCADE_TEMPLATE,
      DEPTH_CHOREOGRAPHY_TEMPLATE,
      CRYSTALLINE_TESSELLATION_TEMPLATE,
      HAUTE_COUTURE_STACKS_TEMPLATE,
      CHIAROSCURO_CANVAS_TEMPLATE,
      INTERSTELLAR_DOCK_TEMPLATE,
      VOID_EMERGENCE_TEMPLATE,
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
      BRUTALIST_GLITCH_TEMPLATE,
      HADID_RIBBON_TEMPLATE,
      ZAHA_PARAMETRIC_TEMPLATE,
      WINTOUR_EDITORIAL_TEMPLATE,
      SISTINE_DEPTH_TEMPLATE,
      VITRUVIAN_MOTION_TEMPLATE,
      LIQUID_CHROME_TEMPLATE,
      // New Innovative Layouts
      AURORA_BOREALIS_TEMPLATE,
      MORPHING_BLOB_TEMPLATE,
      NEON_PULSE_CITY_TEMPLATE,
      ORIGAMI_UNFOLD_TEMPLATE,
      LIQUID_MIRROR_TEMPLATE,
      PARTICLE_UNIVERSE_TEMPLATE,
      GLITCH_MATRIX_TEMPLATE,
      HOLOGRAPHIC_PRISM_TEMPLATE,
      ELASTIC_MORPH_CARDS_TEMPLATE,
      CINEMATIC_PARALLAX_TEMPLATE,
      // Phase 4 - Artistic Vision Layouts
      TEMPORAL_FRACTURE_TEMPLATE,
      PARAMETRIC_FLOW_TEMPLATE,
      EDITORIAL_GRID_SHIFT_TEMPLATE,
      FIBONACCI_CASCADE_TEMPLATE,
      DEPTH_CHOREOGRAPHY_TEMPLATE,
      CRYSTALLINE_TESSELLATION_TEMPLATE,
      HAUTE_COUTURE_STACKS_TEMPLATE,
      CHIAROSCURO_CANVAS_TEMPLATE,
      INTERSTELLAR_DOCK_TEMPLATE,
      VOID_EMERGENCE_TEMPLATE,
    ];

    const record = defaults.reduce((acc, t) => {
      acc[t.id] = t;
      return acc;
    }, {} as Record<string, CanvasLayoutTemplate>);

    return { list: defaults, record };
  }
}
