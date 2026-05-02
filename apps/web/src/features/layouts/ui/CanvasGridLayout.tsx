import React, { useState, useEffect, useRef, Suspense } from "react";
import { cn } from "@gaki/core/lib/utils";
import {
  CanvasLayoutState,
  CanvasSectionState,
  FileOverlayState,
  TextOverlayState,
  CanvasSectionCameraState,
} from "@gaki/core/types/caption";
import { CanvasLayoutTemplate } from "@gaki/core/types/layout";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { Loader2 } from "lucide-react";
import { useLayoutTemplates } from "@/features/layouts/hooks/useLayoutTemplates";
import { usePreviewMode } from "./layouts/dynamic/core/PreviewModeContext";

// Lazy Registry
import { LAYOUT_COMPONENTS } from "./registry/LayoutRegistry";

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
  const tId = layout.templateId;

  // 3D / WebGL layouts check for preview mode safety
  const isHeavyWebGL = [
    "liquid-chrome",
    "zaha-parametric",
    "liquid-lens",
    "morphing-blob",
    "particle-universe",
    "vitruvian-motion",
    "holographic-prism",
  ].includes(tId);

  const LayoutComponent = LAYOUT_COMPONENTS[tId] || LAYOUT_COMPONENTS["standard-grid"];

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden transition-all duration-500 ease-in-out",
        // Keep simplistic background logic or migrate to individual components
        tId === "expanding-cards" && "bg-white",
        tId === "slider-layout" && "flex items-center justify-center bg-white",
        tId === "vertical-slider" && "relative w-full h-[100vh] overflow-hidden bg-background",
        tId === "split-landing-page" && "relative w-full h-full bg-[#333]",
        (tId === "portfolio-scroll" || tId === "simon-portfolio") && "bg-white",
        tId === "kinetic-typography" && "bg-[#E5E5E5]"
      )}
    >
      {(() => {
        const isPreview = usePreviewMode();

        if (isPreview && isHeavyWebGL) {
          return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-900 border border-white/10 p-4 text-center">
              <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <span className="text-xl">✨</span>
              </div>
              <p className="text-xs font-medium text-white/70 tracking-wider uppercase">
                {template.name || "3D Layout"}
              </p>
              <p className="text-[10px] text-white/40 mt-1">
                3D Preview Disabled
              </p>
            </div>
          );
        }

        return (
          <Suspense fallback={
            <div className="w-full h-full flex items-center justify-center bg-muted/5">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground/50" />
            </div>
          }>
            <LayoutComponent
              // Pass all props directly, type casting if needed for specific layouts
              // The dynamic layouts all generally accept `sections` and other generic props
              sections={layout.sections}
              {...props}
            />
          </Suspense>
        );
      })()}
    </div>
  );
};

export const CanvasGridLayout: React.FC<CanvasGridLayoutProps> = (props) => {
  const { layout, onSectionDelete, onSectionContentChange } = props;

  const containerRef = useRef<HTMLDivElement>(null);

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

