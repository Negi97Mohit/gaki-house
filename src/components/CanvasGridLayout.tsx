import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  CanvasLayoutState,
  CanvasSectionState,
  FileOverlayState,
  TextOverlayState,
  CanvasSectionCameraState,
} from "@/types/caption";
import { CanvasLayoutTemplate } from "@/types/layout";
import { AssetResult } from "./AssetLibrary";
import { Loader2 } from "lucide-react";
import { useLayoutTemplates } from "@/hooks/useLayoutTemplates";

// --- Existing Standard Layouts ---
import { StandardGridLayout } from "./layouts/StandardGridLayout";
import { ExpandingCardsLayout } from "./layouts/ExpandingCardsLayout";
import { SliderLayout } from "./layouts/SliderLayout";
import { VerticalSliderLayout } from "./layouts/VerticalSliderLayout";
import { SplitLandingLayout } from "./layouts/SplitLandingLayout";
import { CaseStudyLayout } from "./layouts/CaseStudyLayout";
import { PortfolioScrollLayout } from "./layouts/PortfolioScrollLayout";
import { SimonPortfolioLayout } from "./layouts/SimonPortfolioLayout";
import { PerformanceFlowLayout } from "./layouts/PerformanceFlowLayout";
import { MagnetismGridLayout } from "./layouts/MagnetismGridLayout";

// --- DYNAMIC / AWWWARDS LAYOUTS ---
import { VogueParallaxLayout } from "./layouts/dynamic/VogueParallaxLayout";
import { LiquidLensLayout } from "./layouts/dynamic/LiquidLensLayout";
import { KineticTypographyLayout } from "./layouts/dynamic/KineticTypographyLayout";
import { KineticStencilLayout } from "./layouts/dynamic/KineticStencilLayout";
import { DiagonalRushLayout } from "./layouts/dynamic/DiagonalRushLayout";
import { ScrollZoomLayout } from "./layouts/dynamic/ScrollZoomLayout";
import { InfiniteGridLayout } from "./layouts/dynamic/InfiniteGridLayout";
import { StickySplitLayout } from "./layouts/dynamic/StickySplitLayout";
import { LayeredParallaxLayout } from "./layouts/dynamic/LayeredParallaxLayout";
import { HorizontalScrollLayout } from "./layouts/dynamic/HorizontalScrollLayout";
import { CircularGalleryLayout } from "./layouts/dynamic/CircularGalleryLayout";
import { SnapSectionsLayout } from "./layouts/dynamic/SnapSectionsLayout";
// New Batch
import { ZahaParametricLayout } from "./layouts/dynamic/ZahaParametricLayout";
import { WintourEditorialLayout } from "./layouts/dynamic/WintourEditorialLayout";
import { VitruvianMotionLayout } from "./layouts/dynamic/VitruvianMotionLayout";
import { LiquidChromeLayout } from "./layouts/dynamic/LiquidChromeLayout";
// Phase 3 - New Innovative Layouts
import { AuroraBorealisLayout } from "./layouts/dynamic/AuroraBorealisLayout";
import { MorphingBlobLayout } from "./layouts/dynamic/MorphingBlobLayout";
import { NeonPulseCityLayout } from "./layouts/dynamic/NeonPulseCityLayout";
import { OrigamiUnfoldLayout } from "./layouts/dynamic/OrigamiUnfoldLayout";
import { LiquidMirrorLayout } from "./layouts/dynamic/LiquidMirrorLayout";
import { ParticleUniverseLayout } from "./layouts/dynamic/ParticleUniverseLayout";
import { GlitchMatrixLayout } from "./layouts/dynamic/GlitchMatrixLayout";
import { HolographicPrismLayout } from "./layouts/dynamic/HolographicPrismLayout";
import { ElasticMorphCardsLayout } from "./layouts/dynamic/ElasticMorphCardsLayout";
import { CinematicParallaxLayout } from "./layouts/dynamic/CinematicParallaxLayout";
// Phase 4 - Artistic Vision Layouts
import { TemporalFractureLayout } from "./layouts/dynamic/TemporalFractureLayout";
import { ParametricFlowLayout } from "./layouts/dynamic/ParametricFlowLayout";
import { EditorialGridShiftLayout } from "./layouts/dynamic/EditorialGridShiftLayout";
import { FibonacciCascadeLayout } from "./layouts/dynamic/FibonacciCascadeLayout";
import { DepthChoreographyLayout } from "./layouts/dynamic/DepthChoreographyLayout";
import { CrystallineTessellationLayout } from "./layouts/dynamic/CrystallineTessellationLayout";
import { HauteCoutureStacksLayout } from "./layouts/dynamic/HauteCoutureStacksLayout";
import { ChiaroscuroCanvasLayout } from "./layouts/dynamic/ChiaroscuroCanvasLayout";
import { InterstellarDockLayout } from "./layouts/dynamic/InterstellarDockLayout";
import { VoidEmergenceLayout } from "./layouts/dynamic/VoidEmergenceLayout";
// Added Sistine Import
import { SistineDepthLayout } from "./layouts/dynamic/SistineDepthLayout";

interface CanvasGridLayoutProps {
  layout: CanvasLayoutState;
  cameraStream: MediaStream | null;
  screenStream: MediaStream | null;
  fileOverlays: FileOverlayState[];
  textOverlays: TextOverlayState[];
  blankCanvasColor: string;
  backgroundImageUrl?: string;
  onSectionContentChange: (
    sectionId: string,
    content: CanvasSectionState["content"]
  ) => void;
  onSectionDelete?: (sectionId: string) => void;
  onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
  layoutMode: string;
  cameraShape: "rectangle" | "circle" | "rounded";
  pipSize: { width: number; height: number };
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  onSectionCameraSettingsChange: (
    sectionId: string,
    settings: Partial<CanvasSectionCameraState>
  ) => void;
  backgroundEffect: "none" | "blur" | "image";
  onSetSectionDefault?: (sectionId: string) => void;
  activeSequenceId?: string | null;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  videoDevices?: MediaDeviceInfo[];
}

export interface CanvasGridLayoutRendererProps extends CanvasGridLayoutProps {
  template: CanvasLayoutTemplate;
  containerRef: React.RefObject<HTMLDivElement>;
  onSectionDelete: (sectionId: string) => void;
}

export const CanvasGridLayoutRenderer: React.FC<CanvasGridLayoutRendererProps> = (
  props
) => {
  const { layout, template, containerRef } = props;

  // --- Layout Type Detection ---
  const tId = layout.templateId;
  const isExpandingCards = tId === "expanding-cards";
  const isSlider = tId === "slider-layout";
  const isVerticalSlider = tId === "vertical-slider";
  const isSplitLanding = tId === "split-landing-page";
  const isPortfolioScroll = tId === "portfolio-scroll";
  const isSimonPortfolio = tId === "simon-portfolio";

  // Dynamic 3D/Motion Styles Detection
  const isVogue = tId === "vogue-parallax";
  const isLiquid = tId === "liquid-lens";

  // New Kinetic Styles
  const isKinetic = tId === "kinetic-typography";
  const isStencil = tId === "kinetic-stencil";
  const isDiagonal = tId === "diagonal-rush";

  // Batch 2 Styles (Cleaned)
  const isScrollZoom = tId === "scroll-zoom";
  const isInfiniteGrid = tId === "infinite-grid";
  const isStickySplit = tId === "sticky-split";
  const isLayeredParallax = tId === "layered-parallax";
  const isHorizontalScroll = tId === "horizontal-scroll";
  const isCircularGallery = tId === "circular-gallery";
  const isSnapSections = tId === "snap-sections";

  // New Batch 3
  const isZaha = tId === "zaha-parametric";
  const isWintour = tId === "wintour-editorial";
  const isVitruvian = tId === "vitruvian-motion";
  const isLiquidChrome = tId === "liquid-chrome";

  // Phase 3 - New Innovative Layouts
  const isAuroraBorealis = tId === "aurora-borealis";
  const isMorphingBlob = tId === "morphing-blob";
  const isNeonPulseCity = tId === "neon-pulse-city";
  const isOrigamiUnfold = tId === "origami-unfold";
  const isLiquidMirror = tId === "liquid-mirror";
  const isParticleUniverse = tId === "particle-universe";
  const isGlitchMatrix = tId === "glitch-matrix";
  const isHolographicPrism = tId === "holographic-prism";
  const isElasticMorphCards = tId === "elastic-morph-cards";
  const isCinematicParallax = tId === "cinematic-parallax";

  // Phase 4 - Artistic Vision Layouts
  const isTemporalFracture = tId === "temporal-fracture";
  const isParametricFlow = tId === "parametric-flow";
  const isEditorialGridShift = tId === "editorial-grid-shift";
  const isFibonacciCascade = tId === "fibonacci-cascade";
  const isDepthChoreography = tId === "depth-choreography";
  const isCrystallineTessellation = tId === "crystalline-tessellation";
  const isHauteCoutureStacks = tId === "haute-couture-stacks";
  const isChiaroscuroCanvas = tId === "chiaroscuro-canvas";
  const isInterstellarDock = tId === "interstellar-dock";
  const isVoidEmergence = tId === "void-emergence";
  // Added Sistine Check
  const isSistine = tId === "sistine-depth";

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden transition-all duration-500 ease-in-out",
        // Standard Layout Backgrounds
        isExpandingCards && "bg-white",
        isSlider && "flex items-center justify-center bg-white",
        isVerticalSlider &&
        "relative w-full h-[100vh] overflow-hidden bg-background",
        isSplitLanding && "relative w-full h-full bg-[#333]",
        isPortfolioScroll && "bg-white",
        isSimonPortfolio && "bg-white",
        isKinetic && "bg-[#E5E5E5]"
      )}
    >
      {/* --- Phase 2: Editorial & Motion --- */}
      {isVogue ? (
        <VogueParallaxLayout sections={layout.sections} {...props} />
      ) : isLiquid ? (
        <LiquidLensLayout sections={layout.sections} {...props} />
      ) : isKinetic ? (
        <KineticTypographyLayout sections={layout.sections} {...props} />
      ) : isStencil ? (
        <KineticStencilLayout sections={layout.sections} {...props} />
      ) : isDiagonal ? (
        <DiagonalRushLayout sections={layout.sections} {...props} />
      ) : /* --- Phase 3: New Interactive Layouts --- */
        isScrollZoom ? (
          <ScrollZoomLayout sections={layout.sections} {...props} />
        ) : isInfiniteGrid ? (
          <InfiniteGridLayout sections={layout.sections} {...props} />
        ) : isStickySplit ? (
          <StickySplitLayout sections={layout.sections} {...props} />
        ) : isLayeredParallax ? (
          <LayeredParallaxLayout sections={layout.sections} {...props} />
        ) : isHorizontalScroll ? (
          <HorizontalScrollLayout sections={layout.sections} {...props} />
        ) : isCircularGallery ? (
          <CircularGalleryLayout sections={layout.sections} {...props} />
        ) : isSnapSections ? (
          <SnapSectionsLayout sections={layout.sections} {...props} />
        ) : /* --- Phase 5: New Architect Layouts --- */
          isZaha ? (
            <ZahaParametricLayout sections={layout.sections} {...props} />
          ) : isWintour ? (
            <WintourEditorialLayout sections={layout.sections} {...props} />
          ) : isVitruvian ? (
            <VitruvianMotionLayout sections={layout.sections} {...props} />
          ) : isLiquidChrome ? (
            <LiquidChromeLayout sections={layout.sections} {...props} />
          ) : /* --- Phase 6: New Innovative Layouts --- */
            isAuroraBorealis ? (
              <AuroraBorealisLayout sections={layout.sections} {...props} />
            ) : isMorphingBlob ? (
              <MorphingBlobLayout sections={layout.sections} {...props} />
            ) : isNeonPulseCity ? (
              <NeonPulseCityLayout sections={layout.sections} {...props} />
            ) : isOrigamiUnfold ? (
              <OrigamiUnfoldLayout sections={layout.sections} {...props} />
            ) : isLiquidMirror ? (
              <LiquidMirrorLayout sections={layout.sections} {...props} />
            ) : isParticleUniverse ? (
              <ParticleUniverseLayout sections={layout.sections} {...props} />
            ) : isGlitchMatrix ? (
              <GlitchMatrixLayout sections={layout.sections} {...props} />
            ) : isHolographicPrism ? (
              <HolographicPrismLayout sections={layout.sections} {...props} />
            ) : isElasticMorphCards ? (
              <ElasticMorphCardsLayout sections={layout.sections} {...props} />
            ) : isCinematicParallax ? (
              <CinematicParallaxLayout sections={layout.sections} {...props} />
            ) : /* --- Phase 4: Artistic Vision Layouts --- */
              isTemporalFracture ? (
                <TemporalFractureLayout sections={layout.sections} {...props} />
              ) : isParametricFlow ? (
                <ParametricFlowLayout sections={layout.sections} {...props} />
              ) : isEditorialGridShift ? (
                <EditorialGridShiftLayout sections={layout.sections} {...props} />
              ) : isFibonacciCascade ? (
                <FibonacciCascadeLayout sections={layout.sections} {...props} />
              ) : isDepthChoreography ? (
                <DepthChoreographyLayout sections={layout.sections} {...props} />
              ) : isCrystallineTessellation ? (
                <CrystallineTessellationLayout
                  sections={layout.sections}
                  {...props}
                />
              ) : isHauteCoutureStacks ? (
                <HauteCoutureStacksLayout sections={layout.sections} {...props} />
              ) : isChiaroscuroCanvas ? (
                <ChiaroscuroCanvasLayout sections={layout.sections} {...props} />
              ) : isInterstellarDock ? (
                <InterstellarDockLayout sections={layout.sections} {...props} />
              ) : isVoidEmergence ? (
                <VoidEmergenceLayout sections={layout.sections} {...props} />
              ) : isSistine ? (
                <SistineDepthLayout sections={layout.sections} {...props} />
              ) : /* --- Standard Interactive --- */
                isExpandingCards ? (
                  <ExpandingCardsLayout {...props} />
                ) : isSlider ? (
                  <SliderLayout {...props} />
                ) : isVerticalSlider ? (
                  <VerticalSliderLayout {...props} />
                ) : isSplitLanding ? (
                  <SplitLandingLayout {...props} />
                ) : isPortfolioScroll ? (
                  <PortfolioScrollLayout {...props} />
                ) : isSimonPortfolio ? (
                  <SimonPortfolioLayout {...props} />
                ) : tId === "performance-flow" ? (
                  <PerformanceFlowLayout {...props} />
                ) : tId === "magnetism-layout" ? (
                  <MagnetismGridLayout {...props} />
                ) : tId === "case-study" ? (
                  <CaseStudyLayout {...props} />
                ) : (
                  <StandardGridLayout {...props} />
                )}
    </div>
  );
};

export const CanvasGridLayout: React.FC<CanvasGridLayoutProps> = (props) => {
  const { layout, onSectionDelete, onSectionContentChange } = props;

  const containerRef = useRef<HTMLDivElement>(null);

  // Replaced local state/effect with hook
  const { templateRecord: templates, loading } = useLayoutTemplates();

  if (loading || !templates) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const template = templates[layout.templateId] || templates.default;

  if (!template) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <p>Layout template not found</p>
      </div>
    );
  }

  const handleSectionDelete = (sectionId: string) => {
    if (onSectionDelete) {
      onSectionDelete(sectionId);
    } else {
      onSectionContentChange(sectionId, { type: "empty" });
    }
  };

  return (
    <CanvasGridLayoutRenderer
      {...props}
      template={template}
      containerRef={containerRef}
      onSectionDelete={handleSectionDelete}
    />
  );
};
