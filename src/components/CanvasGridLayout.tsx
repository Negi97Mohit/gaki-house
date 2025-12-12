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
import {
  Loader2,
  ArrowLeft,
  ArrowRight,
  ArrowDown,
  ArrowUp,
} from "lucide-react";
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
  const isVerticalSlider = layout.templateId === "vertical-slider";

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

  // --- Layout Specific Logic ---

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

  // Vertical Slider Logic
  const leftSections = template.sections.filter((s) => s.id.includes("-left"));
  const rightSections = template.sections.filter((s) =>
    s.id.includes("-right")
  );
  const slideCount = leftSections.length;

  const handleVerticalUp = () => {
    setActiveSlideIndex((prev) => (prev >= slideCount - 1 ? 0 : prev + 1));
  };
  const handleVerticalDown = () => {
    setActiveSlideIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
  };

  // Helper to render sections consistently across modes
  const renderSectionContent = (
    templateSection: any,
    section: CanvasSectionState,
    isVertical: boolean = false
  ) => {
    const isHovered = hoveredSectionId === templateSection.id;
    const isEmpty = section.content.type === "empty";

    return (
      <>
        {/* Placeholder Text for Empty Sections */}
        {isEmpty && isVertical && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
            <h2 className="text-3xl font-bold text-white/50">
              {templateSection.name}
            </h2>
            <p className="text-white/40 text-sm mt-2">
              Click toolbar + to add content
            </p>
          </div>
        )}

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

        <div className="relative z-50">
          <GridSectionToolbar
            section={section}
            onDelete={() => handleSectionDelete(section.id)}
            onGridAssetSelect={onGridAssetSelect}
            // Show toolbar on hover OR if content is empty (so the 'Add' options are visible/accessible)
            isVisible={isHovered || (isEmpty && isVertical)}
            availableFiles={fileOverlays.map((f) => ({
              id: f.id,
              name: f.fileName,
            }))}
            availableTexts={textOverlays.map((t) => ({
              id: t.id,
              content: t.content,
            }))}
            onFileSelect={(fileId) =>
              onSectionContentChange(section.id, { type: "file", fileId })
            }
            onTextSelect={(textId) =>
              onSectionContentChange(section.id, { type: "text", textId })
            }
            onSectionContentChange={onSectionContentChange}
          />
        </div>
      </>
    );
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full h-full overflow-hidden transition-all duration-500 ease-in-out",
        isExpandingCards && "bg-white", // Removed flex from here, moved to inner wrapper
        isSlider && "flex items-center justify-center bg-white",
        // Vertical Slider Container
        isVerticalSlider &&
          "relative w-full h-[100vh] overflow-hidden bg-background"
      )}
    >
      {/* STANDARD & EXPANDING CARDS & HORIZONTAL SLIDER */}
      {!isVerticalSlider && (
        <div
          className={cn(
            "relative w-full h-full",
            // FIXED: Expanding cards needs flex layout on this specific wrapper
            isExpandingCards && "flex items-center justify-center px-4 gap-4",
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
            const isActiveCard = activeCardId === section.id;
            const isSlideActive = index === activeSlideIndex;

            return (
              <div
                key={templateSection.id}
                className={cn(
                  "overflow-hidden border border-border/20 group transition-all duration-500 ease-in-out",
                  !isExpandingCards && !isSlider && "absolute",
                  !isExpandingCards &&
                    !isSlider &&
                    "hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20",

                  // Expanding Cards Classes
                  isExpandingCards &&
                    "relative rounded-[24px] cursor-pointer shadow-md h-[90%]",
                  isExpandingCards &&
                    (isActiveCard ? "flex-[5]" : "flex-[0.5]"),
                  isExpandingCards &&
                    !isActiveCard &&
                    "opacity-90 hover:opacity-100",

                  // Slider Classes
                  isSlider &&
                    "absolute inset-0 w-full h-full border-none transition-opacity duration-500 ease-in-out",
                  isSlider &&
                    (isSlideActive ? "opacity-100 z-10" : "opacity-0 z-0")
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
                        background: templateSection.style.background,
                        overflow: "hidden",
                      }
                    : { ...sectionStyle, overflow: "hidden" }
                }
                onClick={() => isExpandingCards && setActiveCardId(section.id)}
                onMouseEnter={() => setHoveredSectionId(templateSection.id)}
                onMouseLeave={() => setHoveredSectionId(null)}
              >
                <div className="relative w-full h-full">
                  {/* Expanding cards specific title overlay */}
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

                  {renderSectionContent(templateSection, section)}

                  {!isExpandingCards && !isSlider && edges.right && (
                    <div
                      className="absolute top-0 right-0 w-1 h-full cursor-ew-resize z-50 hover:w-2 hover:bg-primary/40"
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
                </div>
              </div>
            );
          })}
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
      )}

      {/* DOUBLE VERTICAL SLIDER */}
      {isVerticalSlider && (
        <>
          {/* LEFT SLIDE STACK (Text Side) */}
          <div
            className="absolute left-0 top-0 w-[35%] h-full transition-transform duration-500 ease-in-out z-20"
            style={{
              top: `-${(slideCount - 1) * 100}vh`,
              transform: `translateY(${activeSlideIndex * 100}vh)`,
            }}
          >
            {[...leftSections].reverse().map((templateSection) => {
              const section =
                layout.sections.find((s) => s.id === templateSection.id) ||
                ({
                  id: templateSection.id,
                  content: { type: "empty" },
                } as CanvasSectionState);

              return (
                <div
                  key={templateSection.id}
                  className="h-[100vh] w-full relative"
                  style={{
                    backgroundColor: templateSection.style.backgroundColor,
                  }}
                  onMouseEnter={() => setHoveredSectionId(templateSection.id)}
                  onMouseLeave={() => setHoveredSectionId(null)}
                >
                  {renderSectionContent(templateSection, section, true)}
                </div>
              );
            })}
          </div>

          {/* RIGHT SLIDE STACK (Image Side) */}
          <div
            className="absolute left-[35%] top-0 w-[65%] h-full transition-transform duration-500 ease-in-out z-10"
            style={{
              transform: `translateY(-${activeSlideIndex * 100}vh)`,
            }}
          >
            {rightSections.map((templateSection) => {
              const section =
                layout.sections.find((s) => s.id === templateSection.id) ||
                ({
                  id: templateSection.id,
                  content: { type: "empty" },
                } as CanvasSectionState);

              return (
                <div
                  key={templateSection.id}
                  className="h-[100vh] w-full relative"
                  style={{
                    backgroundColor: templateSection.style.backgroundColor,
                  }}
                  onMouseEnter={() => setHoveredSectionId(templateSection.id)}
                  onMouseLeave={() => setHoveredSectionId(null)}
                >
                  {renderSectionContent(templateSection, section, true)}
                </div>
              );
            })}
          </div>

          {/* ACTION BUTTONS */}
          <div className="absolute top-1/2 left-[35%] -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col shadow-lg rounded-lg overflow-hidden bg-white">
            <button
              className="border-none text-[#aaa] cursor-pointer p-4 hover:text-[#222] focus:outline-none transition-colors border-b border-gray-100"
              onClick={handleVerticalDown}
            >
              <ArrowDown className="w-5 h-5" />
            </button>
            <button
              className="border-none text-[#aaa] cursor-pointer p-4 hover:text-[#222] focus:outline-none transition-colors"
              onClick={handleVerticalUp}
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};
