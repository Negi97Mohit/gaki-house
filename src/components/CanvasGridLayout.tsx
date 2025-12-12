// src/components/CanvasGridLayout.tsx
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
import { GridSectionToolbar } from "./GridSectionToolbar";
import { AssetResult } from "./AssetLibrary";
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react";
import { GridSectionRenderer } from "./GridSectionRenderer";
import { useGridResizing } from "@/hooks/useGridResizing";

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

export const CanvasGridLayout: React.FC<CanvasGridLayoutProps> = ({
  layout,
  cameraStream,
  screenStream,
  fileOverlays,
  textOverlays,
  blankCanvasColor,
  backgroundImageUrl,
  onSectionContentChange,
  onSectionDelete,
  onGridAssetSelect,
  layoutMode,
  cameraShape,
  pipSize,
  pipBorder,
  pipShadow,
  onSectionCameraSettingsChange,
  backgroundEffect,
  onLayoutUpdate,
  onSetSectionDefault,
  activeSequenceId,
  onUserPositionChange,
  videoDevices = [],
}) => {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const [activeCardId, setActiveCardId] = useState<string>("card-1");
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

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

  // Detect layout changes for carousel animation
  const prevLayoutRef = useRef(layout);
  useEffect(() => {
    const isCarousel = layout.templateId?.includes("carousel");
    if (
      isCarousel &&
      prevLayoutRef.current &&
      prevLayoutRef.current.templateId === layout.templateId
    ) {
      let changedCount = 0;
      layout.sections.forEach((sec, idx) => {
        const prevSec = prevLayoutRef.current.sections[idx];
        if (
          prevSec &&
          JSON.stringify(sec.content) !== JSON.stringify(prevSec.content)
        ) {
          changedCount++;
        }
      });

      if (changedCount >= layout.sections.length - 1 && changedCount > 0) {
        setIsTransitioning(true);
        setTimeout(() => setIsTransitioning(false), 500);
      }
    }
    prevLayoutRef.current = layout;
  }, [layout]);

  const template =
    templates && (templates[layout.templateId] || templates.default);

  const isExpandingCards = layout.templateId === "expanding-cards";
  const isSlider = layout.templateId === "slider-layout";

  const { resizing, handleResizeStart, getResizeEdges } = useGridResizing({
    layout,
    onLayoutUpdate,
    template,
    containerRef,
  });

  if (!templates || !template) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
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

  const handlePrevSlide = () => {
    setActiveSlideIndex((prev) =>
      prev === 0 ? template.sections.length - 1 : prev - 1
    );
  };

  const handleNextSlide = () => {
    setActiveSlideIndex((prev) => (prev + 1) % template.sections.length);
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden transition-all duration-500 ease-in-out",
        isExpandingCards &&
          "flex items-center justify-center px-4 gap-4 bg-white",
        // Slider Mode: Background is explicitly white as requested
        isSlider && "flex items-center justify-center bg-white"
      )}
    >
      {/* Removed the blurred background div and overlay div to ensure 
         a clean white background. 
      */}

      {/* === Middle Content / Main Container === */}
      <div
        className={cn(
          "relative w-full h-full",
          // In Slider mode, this is the centered box with shadow
          // The background of this box is handled by the sections (gradients)
          isSlider &&
            "w-[70vw] h-[70vh] shadow-2xl rounded-xl z-10 overflow-hidden bg-white relative"
        )}
      >
        {template.sections.map((templateSection, index) => {
          const section =
            layout.sections.find((s) => s.id === templateSection.id) ||
            ({
              id: templateSection.id,
              content: { type: "empty" },
            } as CanvasSectionState);

          const sectionStyle =
            layout.customSectionStyles?.[templateSection.id] ||
            templateSection.style;
          const edges = getResizeEdges(templateSection.id);
          const orderIndex = layout.sectionOrder?.indexOf(section.id);
          const displayOrder =
            orderIndex !== undefined && orderIndex > -1
              ? orderIndex + 1
              : undefined;
          const isCarousel = layout.templateId?.includes("carousel");

          const isActiveCard = activeCardId === section.id;
          const isSlideActive = index === activeSlideIndex;

          return (
            <div
              key={templateSection.id}
              className={cn(
                // Base classes
                "overflow-hidden border border-border/20",
                "group transition-all duration-500 ease-in-out",

                // Standard Layout
                !isExpandingCards && !isSlider && "absolute",
                !isExpandingCards &&
                  !isSlider &&
                  "hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20",

                // Carousel Logic
                isCarousel && "transition-all duration-500 ease-in-out",
                isCarousel && isTransitioning && "opacity-70 scale-[0.98]",
                isCarousel && !isTransitioning && "opacity-100 scale-100",

                // Expanding Cards
                isExpandingCards &&
                  "relative rounded-[24px] cursor-pointer shadow-md h-[90%]",
                isExpandingCards && (isActiveCard ? "flex-[5]" : "flex-[0.5]"),
                isExpandingCards &&
                  !isActiveCard &&
                  "opacity-90 hover:opacity-100",

                // Slider Logic
                isSlider &&
                  "absolute inset-0 w-full h-full border-none transition-opacity duration-500 ease-in-out",
                isSlider &&
                  (isSlideActive ? "opacity-100 z-10" : "opacity-0 z-0"),

                // Active Sequence
                section.id === activeSequenceId &&
                  "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] z-10"
              )}
              style={
                isExpandingCards
                  ? {
                      background: templateSection.style.background,
                      overflow: "hidden",
                      position: "relative",
                      width: undefined,
                      height: undefined,
                    }
                  : isSlider
                  ? {
                      // Apply the gradient background from the template
                      background: templateSection.style.background,
                      overflow: "hidden",
                    }
                  : { ...sectionStyle, overflow: "hidden" }
              }
              onMouseEnter={() => setHoveredSectionId(templateSection.id)}
              onMouseLeave={() => setHoveredSectionId(null)}
              onClick={() => isExpandingCards && setActiveCardId(section.id)}
            >
              {/* Title Overlay for Expanding Cards */}
              {isExpandingCards && (
                <div
                  className={cn(
                    "absolute bottom-6 left-6 z-20 transition-opacity duration-300 delay-200 pointer-events-none",
                    isActiveCard ? "opacity-100" : "opacity-0"
                  )}
                >
                  <h3 className="text-xl font-bold text-white drop-shadow-md bg-black/10 px-3 py-1 rounded backdrop-blur-sm">
                    {templateSection.name}
                  </h3>
                </div>
              )}

              <div className="relative w-full h-full">
                <GridSectionRenderer
                  section={section}
                  cameraStream={cameraStream}
                  screenStream={screenStream}
                  fileOverlays={fileOverlays}
                  textOverlays={textOverlays}
                  blankCanvasColor={blankCanvasColor}
                  backgroundImageUrl={backgroundImageUrl}
                  onSectionContentChange={onSectionContentChange}
                  onGridAssetSelect={onGridAssetSelect}
                  onSectionCameraSettingsChange={onSectionCameraSettingsChange}
                  videoDevices={videoDevices}
                  activeSequenceId={activeSequenceId}
                  onUserPositionChange={onUserPositionChange}
                  cameraShape={cameraShape}
                  backgroundEffect={backgroundEffect}
                />

                {/* Resize handles (Standard only) */}
                {!isExpandingCards && !isSlider && edges.right && (
                  <div
                    className={cn(
                      "absolute top-0 right-0 w-1 h-full cursor-ew-resize z-50",
                      "hover:w-2 hover:bg-primary/40 transition-all",
                      resizing?.sectionId === templateSection.id &&
                        "bg-primary/60 w-2"
                    )}
                    onMouseDown={(e) =>
                      handleResizeStart(templateSection.id, "right", e)
                    }
                  />
                )}
                {!isExpandingCards && !isSlider && edges.bottom && (
                  <div
                    className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize z-50 hover:h-2 hover:bg-primary/40"
                    onMouseDown={(e) =>
                      handleResizeStart(templateSection.id, "bottom", e)
                    }
                  />
                )}
                {!isExpandingCards && !isSlider && edges.left && (
                  <div
                    className="absolute top-0 left-0 w-1 h-full cursor-ew-resize z-50 hover:w-2 hover:bg-primary/40"
                    onMouseDown={(e) =>
                      handleResizeStart(templateSection.id, "left", e)
                    }
                  />
                )}
                {!isExpandingCards && !isSlider && edges.top && (
                  <div
                    className="absolute top-0 left-0 w-full h-1 cursor-ns-resize z-50 hover:h-2 hover:bg-primary/40"
                    onMouseDown={(e) =>
                      handleResizeStart(templateSection.id, "top", e)
                    }
                  />
                )}

                {/* Section toolbar */}
                {section.content.type !== "empty" && (
                  <GridSectionToolbar
                    section={section}
                    onDelete={() => handleSectionDelete(section.id)}
                    onGridAssetSelect={onGridAssetSelect}
                    isVisible={hoveredSectionId === templateSection.id}
                    onColorChange={
                      section.content.type === "color"
                        ? (color) =>
                            onSectionContentChange(section.id, {
                              type: "color",
                              color,
                            })
                        : undefined
                    }
                    onImageChange={
                      section.content.type === "image"
                        ? (url) =>
                            onSectionContentChange(section.id, {
                              type: "image",
                              src: url,
                            })
                        : undefined
                    }
                    availableFiles={fileOverlays.map((f) => ({
                      id: f.id,
                      name: f.fileName,
                    }))}
                    availableTexts={textOverlays.map((t) => ({
                      id: t.id,
                      content: t.content,
                    }))}
                    onFileSelect={(fileId) =>
                      onSectionContentChange(section.id, {
                        type: "file",
                        fileId,
                      })
                    }
                    onTextSelect={(textId) =>
                      onSectionContentChange(section.id, {
                        type: "text",
                        textId,
                      })
                    }
                    orderIndex={displayOrder}
                    onToggleOrder={() => {
                      if (onLayoutUpdate) {
                        const currentOrder = layout.sectionOrder || [];
                        const isIncluded = currentOrder.includes(section.id);

                        onLayoutUpdate({
                          ...layout,
                          sectionOrder: isIncluded
                            ? currentOrder.filter((id) => id !== section.id)
                            : [...currentOrder, section.id],
                        });
                      }
                    }}
                    onSetDefault={() => onSetSectionDefault?.(section.id)}
                    onSectionContentChange={onSectionContentChange}
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Slider Navigation Buttons */}
        {isSlider && (
          <>
            <button
              className="absolute left-[30px] top-1/2 -translate-y-1/2 z-50 bg-transparent text-white border border-white p-4 hover:bg-white hover:text-black transition-colors cursor-pointer rounded-sm"
              onClick={handlePrevSlide}
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <button
              className="absolute right-[30px] top-1/2 -translate-y-1/2 z-50 bg-transparent text-white border border-white p-4 hover:bg-white hover:text-black transition-colors cursor-pointer rounded-sm"
              onClick={handleNextSlide}
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
