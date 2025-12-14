import React, { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  CanvasLayoutState,
  CanvasSectionState,
  FileOverlayState,
  TextOverlayState,
  CanvasSectionCameraState,
} from "@/types/caption";
import { getLayoutTemplates, CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { AssetResult } from "./AssetLibrary";
import { Loader2 } from "lucide-react";

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

// --- NEW DYNAMIC / AWWWARDS LAYOUTS ---
import { VogueParallaxLayout } from "./layouts/dynamic/VogueParallaxLayout";
import { LiquidLensLayout } from "./layouts/dynamic/LiquidLensLayout";
import { OrigamiFoldLayout } from "./layouts/dynamic/OrigamiFoldLayout";
import { BrutalistGlitchLayout } from "./layouts/dynamic/BrutalistGlitchLayout";
import { HadidRibbonLayout } from "./layouts/dynamic/HadidRibbonLayout";
import { VortexTunnelLayout } from "./layouts/dynamic/VortexTunnelLayout";
import { GravityMasonryLayout } from "./layouts/dynamic/GravityMasonryLayout";
import { ParticleDissolveLayout } from "./layouts/dynamic/ParticleDissolveLayout";
import { GlassPrismLayout } from "./layouts/dynamic/GlassPrismLayout";
// Note: Ensure HybridGridContainer is used inside the layouts or imported if needed globally

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

export const CanvasGridLayout: React.FC<CanvasGridLayoutProps> = (props) => {
  const { layout, onSectionDelete, onSectionContentChange, onLayoutUpdate } =
    props;

  const containerRef = useRef<HTMLDivElement>(null);

  const [templates, setTemplates] = useState<Record<
    string,
    CanvasLayoutTemplate
  > | null>(null);

  useEffect(() => {
    getLayoutTemplates()
      .then(({ record }) => {
        setTemplates(record);
      })
      .catch((err) => {
        console.error("Failed to load layout templates", err);
      });
  }, []);

  if (!templates) {
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

  // --- Layout Type Detection ---
  const tId = layout.templateId;
  const isExpandingCards = tId === "expanding-cards";
  const isSlider = tId === "slider-layout";
  const isVerticalSlider = tId === "vertical-slider";
  const isSplitLanding = tId === "split-landing-page";
  const isPortfolioScroll = tId === "portfolio-scroll";
  const isSimonPortfolio = tId === "simon-portfolio";

  // Dynamic 3D Styles Detection
  const isVogue = tId === "vogue-parallax";
  const isLiquid = tId === "liquid-lens";
  const isOrigami = tId === "origami-fold";
  const isBrutalist = tId === "brutalist-glitch";
  const isHadid = tId === "hadid-ribbon";
  const isVortex = tId === "vortex-tunnel";
  const isGravity = tId === "gravity-masonry";
  const isParticle = tId === "particle-dissolve";
  const isGlass = tId === "glass-prism";

  // Combine props to pass down to layouts
  const commonProps = {
    ...props,
    template,
    onSectionDelete: handleSectionDelete,
    containerRef,
  };

  // Determine container classes based on layout type
  // (3D layouts often need black backgrounds or specific overflow settings)
  const is3DLayout =
    isVogue ||
    isLiquid ||
    isOrigami ||
    isBrutalist ||
    isHadid ||
    isVortex ||
    isGravity ||
    isParticle ||
    isGlass;

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
        // 3D Layout Defaults (usually dark/immersive)
        is3DLayout && "bg-black"
      )}
    >
      {/* --- Phase 2: Editorial --- */}
      {isVogue ? (
        <VogueParallaxLayout sections={layout.sections} {...commonProps} />
      ) : isLiquid ? (
        <LiquidLensLayout sections={layout.sections} {...commonProps} />
      ) : isOrigami ? (
        <OrigamiFoldLayout sections={layout.sections} {...commonProps} />
      ) : isBrutalist ? (
        <BrutalistGlitchLayout sections={layout.sections} {...commonProps} />
      ) : /* --- Phase 3: Fluid & Parametric --- */
      isHadid ? (
        <HadidRibbonLayout sections={layout.sections} {...commonProps} />
      ) : isVortex ? (
        <VortexTunnelLayout sections={layout.sections} {...commonProps} />
      ) : /* --- Phase 4: Physics --- */
      isGravity ? (
        <GravityMasonryLayout sections={layout.sections} {...commonProps} />
      ) : isParticle ? (
        <ParticleDissolveLayout sections={layout.sections} {...commonProps} />
      ) : /* --- Phase 5: Avant-Garde --- */
      isGlass ? (
        <GlassPrismLayout sections={layout.sections} {...commonProps} />
      ) : /* --- Standard Layouts (Fallback) --- */
      isExpandingCards ? (
        <ExpandingCardsLayout {...commonProps} />
      ) : isSlider ? (
        <SliderLayout {...commonProps} />
      ) : isVerticalSlider ? (
        <VerticalSliderLayout {...commonProps} />
      ) : isSplitLanding ? (
        <SplitLandingLayout {...commonProps} />
      ) : isPortfolioScroll ? (
        <PortfolioScrollLayout {...commonProps} />
      ) : isSimonPortfolio ? (
        <SimonPortfolioLayout {...commonProps} />
      ) : tId === "performance-flow" ? (
        <PerformanceFlowLayout {...commonProps} />
      ) : tId === "magnetism-layout" ? (
        <MagnetismGridLayout {...commonProps} onLayoutUpdate={onLayoutUpdate} />
      ) : tId === "case-study" ? (
        <CaseStudyLayout {...commonProps} />
      ) : (
        <StandardGridLayout {...commonProps} />
      )}
    </div>
  );
};
