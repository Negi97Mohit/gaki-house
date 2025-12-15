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

// --- DYNAMIC / AWWWARDS LAYOUTS ---
import { VogueParallaxLayout } from "./layouts/dynamic/VogueParallaxLayout";
import { LiquidLensLayout } from "./layouts/dynamic/LiquidLensLayout";
import { HadidRibbonLayout } from "./layouts/dynamic/HadidRibbonLayout";
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

  // Dynamic 3D/Motion Styles Detection
  const isVogue = tId === "vogue-parallax";
  const isLiquid = tId === "liquid-lens";
  const isHadid = tId === "hadid-ribbon";

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

  // Combine props to pass down to layouts
  const commonProps = {
    ...props,
    template,
    onSectionDelete: handleSectionDelete,
    containerRef,
  };

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
        <VogueParallaxLayout sections={layout.sections} {...commonProps} />
      ) : isLiquid ? (
        <LiquidLensLayout sections={layout.sections} {...commonProps} />
      ) : isHadid ? (
        <HadidRibbonLayout sections={layout.sections} {...commonProps} />
      ) : isKinetic ? (
        <KineticTypographyLayout sections={layout.sections} {...commonProps} />
      ) : isStencil ? (
        <KineticStencilLayout sections={layout.sections} {...commonProps} />
      ) : isDiagonal ? (
        <DiagonalRushLayout sections={layout.sections} {...commonProps} />
      ) : /* --- Phase 3: New Interactive Layouts --- */
      isScrollZoom ? (
        <ScrollZoomLayout sections={layout.sections} {...commonProps} />
      ) : isInfiniteGrid ? (
        <InfiniteGridLayout sections={layout.sections} {...commonProps} />
      ) : isStickySplit ? (
        <StickySplitLayout sections={layout.sections} {...commonProps} />
      ) : isLayeredParallax ? (
        <LayeredParallaxLayout sections={layout.sections} {...commonProps} />
      ) : isHorizontalScroll ? (
        <HorizontalScrollLayout sections={layout.sections} {...commonProps} />
      ) : isCircularGallery ? (
        <CircularGalleryLayout sections={layout.sections} {...commonProps} />
      ) : isSnapSections ? (
        <SnapSectionsLayout sections={layout.sections} {...commonProps} />
      ) : /* --- Phase 4: Standard Interactive --- */
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
