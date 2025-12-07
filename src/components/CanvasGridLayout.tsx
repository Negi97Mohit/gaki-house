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
import { Loader2 } from "lucide-react";
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

  // Detect layout changes for carousel animation - ONLY on rotation
  const prevLayoutRef = useRef(layout);
  useEffect(() => {
    const isCarousel = layout.templateId?.includes("carousel");
    if (
      isCarousel &&
      prevLayoutRef.current &&
      prevLayoutRef.current.templateId === layout.templateId
    ) {
      // Check if ALL sections changed content simultaneously (rotation)
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

  // Use the custom hook for resizing
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

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {template.sections.map((templateSection) => {
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

        // Determine current order index
        const orderIndex = layout.sectionOrder?.indexOf(section.id);
        const displayOrder =
          orderIndex !== undefined && orderIndex > -1
            ? orderIndex + 1
            : undefined;

        const isCarousel = layout.templateId?.includes("carousel");

        return (
          <div
            key={templateSection.id}
            className={cn(
              "absolute border border-border/20",
              "hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20",
              "group",
              // Carousel animation - subtle cross-fade
              isCarousel && "transition-all duration-500 ease-in-out",
              isCarousel && isTransitioning && "opacity-70 scale-[0.98]",
              isCarousel && !isTransitioning && "opacity-100 scale-100",
              // Ensure this line is active
              section.id === activeSequenceId &&
              "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] z-10"
            )}
            style={{
              ...sectionStyle,
              overflow: "hidden",
            }}
            onMouseEnter={() => setHoveredSectionId(templateSection.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
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

              {/* Resize handles */}
              {edges.right && (
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
              {edges.bottom && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 w-full h-1 cursor-ns-resize z-50",
                    "hover:h-2 hover:bg-primary/40 transition-all",
                    resizing?.sectionId === templateSection.id &&
                    "bg-primary/60 h-2"
                  )}
                  onMouseDown={(e) =>
                    handleResizeStart(templateSection.id, "bottom", e)
                  }
                />
              )}
              {edges.left && (
                <div
                  className={cn(
                    "absolute top-0 left-0 w-1 h-full cursor-ew-resize z-50",
                    "hover:w-2 hover:bg-primary/40 transition-all",
                    resizing?.sectionId === templateSection.id &&
                    "bg-primary/60 w-2"
                  )}
                  onMouseDown={(e) =>
                    handleResizeStart(templateSection.id, "left", e)
                  }
                />
              )}
              {edges.top && (
                <div
                  className={cn(
                    "absolute top-0 left-0 w-full h-1 cursor-ns-resize z-50",
                    "hover:h-2 hover:bg-primary/40 transition-all",
                    resizing?.sectionId === templateSection.id &&
                    "bg-primary/60 h-2"
                  )}
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
                    onSectionContentChange(section.id, { type: "file", fileId })
                  }
                  onTextSelect={(textId) =>
                    onSectionContentChange(section.id, { type: "text", textId })
                  }
                  // UPDATED: Pass order prop and handler using onLayoutUpdate
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
    </div>
  );
};
