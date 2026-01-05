import React, { lazy } from "react";

// Helper for lazy loading
const lazyLayout = (importPath: () => Promise<{ [key: string]: any }>, name: string) => {
    return lazy(async () => {
        const module = await importPath();
        return { default: module[name] };
    });
};

// --- Standard Layouts ---
export const StandardGridLayout = lazy(() => import("../layouts/StandardGridLayout").then(m => ({ default: m.StandardGridLayout })));
export const ExpandingCardsLayout = lazy(() => import("../layouts/ExpandingCardsLayout").then(m => ({ default: m.ExpandingCardsLayout })));
export const SliderLayout = lazy(() => import("../layouts/SliderLayout").then(m => ({ default: m.SliderLayout })));
export const VerticalSliderLayout = lazy(() => import("../layouts/VerticalSliderLayout").then(m => ({ default: m.VerticalSliderLayout })));
export const SplitLandingLayout = lazy(() => import("../layouts/SplitLandingLayout").then(m => ({ default: m.SplitLandingLayout })));
export const CaseStudyLayout = lazy(() => import("../layouts/CaseStudyLayout").then(m => ({ default: m.CaseStudyLayout })));
export const PortfolioScrollLayout = lazy(() => import("../layouts/PortfolioScrollLayout").then(m => ({ default: m.PortfolioScrollLayout })));
export const SimonPortfolioLayout = lazy(() => import("../layouts/SimonPortfolioLayout").then(m => ({ default: m.SimonPortfolioLayout })));
export const PerformanceFlowLayout = lazy(() => import("../layouts/PerformanceFlowLayout").then(m => ({ default: m.PerformanceFlowLayout })));
export const MagnetismGridLayout = lazy(() => import("../layouts/MagnetismGridLayout").then(m => ({ default: m.MagnetismGridLayout })));

// --- Dynamic Layouts ---
export const VogueParallaxLayout = lazy(() => import("../layouts/dynamic/VogueParallaxLayout").then(m => ({ default: m.VogueParallaxLayout })));
export const LiquidLensLayout = lazy(() => import("../layouts/dynamic/LiquidLensLayout").then(m => ({ default: m.LiquidLensLayout })));
export const KineticTypographyLayout = lazy(() => import("../layouts/dynamic/KineticTypographyLayout").then(m => ({ default: m.KineticTypographyLayout })));
export const KineticStencilLayout = lazy(() => import("../layouts/dynamic/KineticStencilLayout").then(m => ({ default: m.KineticStencilLayout })));
export const DiagonalRushLayout = lazy(() => import("../layouts/dynamic/DiagonalRushLayout").then(m => ({ default: m.DiagonalRushLayout })));
export const ScrollZoomLayout = lazy(() => import("../layouts/dynamic/ScrollZoomLayout").then(m => ({ default: m.ScrollZoomLayout })));
export const InfiniteGridLayout = lazy(() => import("../layouts/dynamic/InfiniteGridLayout").then(m => ({ default: m.InfiniteGridLayout })));
export const StickySplitLayout = lazy(() => import("../layouts/dynamic/StickySplitLayout").then(m => ({ default: m.StickySplitLayout })));
export const LayeredParallaxLayout = lazy(() => import("../layouts/dynamic/LayeredParallaxLayout").then(m => ({ default: m.LayeredParallaxLayout })));
export const HorizontalScrollLayout = lazy(() => import("../layouts/dynamic/HorizontalScrollLayout").then(m => ({ default: m.HorizontalScrollLayout })));
export const CircularGalleryLayout = lazy(() => import("../layouts/dynamic/CircularGalleryLayout").then(m => ({ default: m.CircularGalleryLayout })));
export const SnapSectionsLayout = lazy(() => import("../layouts/dynamic/SnapSectionsLayout").then(m => ({ default: m.SnapSectionsLayout })));

// --- Architect Layouts ---
export const ZahaParametricLayout = lazy(() => import("../layouts/dynamic/ZahaParametricLayout").then(m => ({ default: m.ZahaParametricLayout })));
export const WintourEditorialLayout = lazy(() => import("../layouts/dynamic/WintourEditorialLayout").then(m => ({ default: m.WintourEditorialLayout })));
export const VitruvianMotionLayout = lazy(() => import("../layouts/dynamic/VitruvianMotionLayout").then(m => ({ default: m.VitruvianMotionLayout })));
export const LiquidChromeLayout = lazy(() => import("../layouts/dynamic/LiquidChromeLayout").then(m => ({ default: m.LiquidChromeLayout })));

// --- Innovative Layouts ---
export const AuroraBorealisLayout = lazy(() => import("../layouts/dynamic/AuroraBorealisLayout").then(m => ({ default: m.AuroraBorealisLayout })));
export const MorphingBlobLayout = lazy(() => import("../layouts/dynamic/MorphingBlobLayout").then(m => ({ default: m.MorphingBlobLayout })));
export const NeonPulseCityLayout = lazy(() => import("../layouts/dynamic/NeonPulseCityLayout").then(m => ({ default: m.NeonPulseCityLayout })));
export const OrigamiUnfoldLayout = lazy(() => import("../layouts/dynamic/OrigamiUnfoldLayout").then(m => ({ default: m.OrigamiUnfoldLayout })));
export const LiquidMirrorLayout = lazy(() => import("../layouts/dynamic/LiquidMirrorLayout").then(m => ({ default: m.LiquidMirrorLayout })));
export const ParticleUniverseLayout = lazy(() => import("../layouts/dynamic/ParticleUniverseLayout").then(m => ({ default: m.ParticleUniverseLayout })));
export const GlitchMatrixLayout = lazy(() => import("../layouts/dynamic/GlitchMatrixLayout").then(m => ({ default: m.GlitchMatrixLayout })));
export const HolographicPrismLayout = lazy(() => import("../layouts/dynamic/HolographicPrismLayout").then(m => ({ default: m.HolographicPrismLayout })));
export const ElasticMorphCardsLayout = lazy(() => import("../layouts/dynamic/ElasticMorphCardsLayout").then(m => ({ default: m.ElasticMorphCardsLayout })));
export const CinematicParallaxLayout = lazy(() => import("../layouts/dynamic/CinematicParallaxLayout").then(m => ({ default: m.CinematicParallaxLayout })));

// --- Artistic Vision Layouts ---
export const TemporalFractureLayout = lazy(() => import("../layouts/dynamic/TemporalFractureLayout").then(m => ({ default: m.TemporalFractureLayout })));
export const ParametricFlowLayout = lazy(() => import("../layouts/dynamic/ParametricFlowLayout").then(m => ({ default: m.ParametricFlowLayout })));
export const EditorialGridShiftLayout = lazy(() => import("../layouts/dynamic/EditorialGridShiftLayout").then(m => ({ default: m.EditorialGridShiftLayout })));
export const FibonacciCascadeLayout = lazy(() => import("../layouts/dynamic/FibonacciCascadeLayout").then(m => ({ default: m.FibonacciCascadeLayout })));
export const DepthChoreographyLayout = lazy(() => import("../layouts/dynamic/DepthChoreographyLayout").then(m => ({ default: m.DepthChoreographyLayout })));
export const CrystallineTessellationLayout = lazy(() => import("../layouts/dynamic/CrystallineTessellationLayout").then(m => ({ default: m.CrystallineTessellationLayout })));
export const HauteCoutureStacksLayout = lazy(() => import("../layouts/dynamic/HauteCoutureStacksLayout").then(m => ({ default: m.HauteCoutureStacksLayout })));
export const ChiaroscuroCanvasLayout = lazy(() => import("../layouts/dynamic/ChiaroscuroCanvasLayout").then(m => ({ default: m.ChiaroscuroCanvasLayout })));
export const InterstellarDockLayout = lazy(() => import("../layouts/dynamic/InterstellarDockLayout").then(m => ({ default: m.InterstellarDockLayout })));
export const VoidEmergenceLayout = lazy(() => import("../layouts/dynamic/VoidEmergenceLayout").then(m => ({ default: m.VoidEmergenceLayout })));
export const SistineDepthLayout = lazy(() => import("../layouts/dynamic/SistineDepthLayout").then(m => ({ default: m.SistineDepthLayout })));

// --- Map ---
export const LAYOUT_COMPONENTS: Record<string, React.LazyExoticComponent<React.ComponentType<any>>> = {
    // Standard
    "standard-grid": StandardGridLayout,
    "expanding-cards": ExpandingCardsLayout,
    "slider-layout": SliderLayout,
    "vertical-slider": VerticalSliderLayout,
    "split-landing-page": SplitLandingLayout,
    "portfolio-scroll": PortfolioScrollLayout,
    "simon-portfolio": SimonPortfolioLayout,
    "performance-flow": PerformanceFlowLayout,
    "magnetism-layout": MagnetismGridLayout,
    "case-study": CaseStudyLayout,

    // Dynamic
    "vogue-parallax": VogueParallaxLayout,
    "liquid-lens": LiquidLensLayout,
    "kinetic-typography": KineticTypographyLayout,
    "kinetic-stencil": KineticStencilLayout,
    "diagonal-rush": DiagonalRushLayout,
    "scroll-zoom": ScrollZoomLayout,
    "infinite-grid": InfiniteGridLayout,
    "sticky-split": StickySplitLayout,
    "layered-parallax": LayeredParallaxLayout,
    "horizontal-scroll": HorizontalScrollLayout,
    "circular-gallery": CircularGalleryLayout,
    "snap-sections": SnapSectionsLayout,

    // Architect
    "zaha-parametric": ZahaParametricLayout,
    "wintour-editorial": WintourEditorialLayout,
    "vitruvian-motion": VitruvianMotionLayout,
    "liquid-chrome": LiquidChromeLayout,

    // Innovative
    "aurora-borealis": AuroraBorealisLayout,
    "morphing-blob": MorphingBlobLayout,
    "neon-pulse-city": NeonPulseCityLayout,
    "origami-unfold": OrigamiUnfoldLayout,
    "liquid-mirror": LiquidMirrorLayout,
    "particle-universe": ParticleUniverseLayout,
    "glitch-matrix": GlitchMatrixLayout,
    "holographic-prism": HolographicPrismLayout,
    "elastic-morph-cards": ElasticMorphCardsLayout,
    "cinematic-parallax": CinematicParallaxLayout,

    // Artistic
    "temporal-fracture": TemporalFractureLayout,
    "parametric-flow": ParametricFlowLayout,
    "editorial-grid-shift": EditorialGridShiftLayout,
    "fibonacci-cascade": FibonacciCascadeLayout,
    "depth-choreography": DepthChoreographyLayout,
    "crystalline-tessellation": CrystallineTessellationLayout,
    "haute-couture-stacks": HauteCoutureStacksLayout,
    "chiaroscuro-canvas": ChiaroscuroCanvasLayout,
    "interstellar-dock": InterstellarDockLayout,
    "void-emergence": VoidEmergenceLayout,
    "sistine-depth": SistineDepthLayout,
};
