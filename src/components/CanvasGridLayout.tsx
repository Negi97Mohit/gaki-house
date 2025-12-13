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
import { StandardGridLayout } from "./layouts/StandardGridLayout";
import { ExpandingCardsLayout } from "./layouts/ExpandingCardsLayout";
import { SliderLayout } from "./layouts/SliderLayout";
import { VerticalSliderLayout } from "./layouts/VerticalSliderLayout";
import { SplitLandingLayout } from "./layouts/SplitLandingLayout";
import { CaseStudyLayout } from "./layouts/CaseStudyLayout";
import { PortfolioScrollLayout } from "./layouts/PortfolioScrollLayout";
import { SimonPortfolioLayout } from "./layouts/SimonPortfolioLayout";
import { PhotoyoshiLayout } from "./layouts/PhotoyoshiLayout";

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

  const prevLayoutRef = useRef(layout);
  useEffect(() => {
    // Basic transition logic remains same
  }, [layout]);

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

  const isExpandingCards = layout.templateId === "expanding-cards";
  const isSlider = layout.templateId === "slider-layout";
  const isVerticalSlider = layout.templateId === "vertical-slider";
  const isSplitLanding = layout.templateId === "split-landing-page";
  const isPortfolioScroll = layout.templateId === "portfolio-scroll";
  const isSimonPortfolio = layout.templateId === "simon-portfolio";
  const isPhotoyoshi = layout.templateId === "photoyoshi";

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
        isExpandingCards && "bg-white",
        isSlider && "flex items-center justify-center bg-white",
        isVerticalSlider &&
          "relative w-full h-[100vh] overflow-hidden bg-background",
        isSplitLanding && "relative w-full h-full bg-[#333]",
        isPortfolioScroll && "bg-white",
        isSimonPortfolio && "bg-white",
        isPhotoyoshi && "bg-[#f5f0e8]"
      )}
    >
      {isExpandingCards ? (
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
      ) : isPhotoyoshi ? (
        <PhotoyoshiLayout {...commonProps} />
      ) : layout.templateId === "case-study" ? (
        <CaseStudyLayout {...commonProps} />
      ) : (
        <StandardGridLayout {...commonProps} />
      )}
    </div>
  );
};
