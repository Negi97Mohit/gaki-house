// src/components/video-canvas/DraggableHtmlOverlay.tsx
import React, { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneratedOverlay } from "@/types/caption";
import { generatePreview } from "@/lib/preview";
import { DynamicLayoutPicker } from "@/components/DynamicLayoutPicker";
import { HtmlOverlayRenderer } from "./HtmlOverlayRenderer";
import { SmartDraggable } from "./SmartDraggable";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";

interface DraggableHtmlOverlayProps {
  overlay: GeneratedOverlay;
  onLayoutChange: (
    id: string,
    key: "position" | "size" | "rotation",
    value: any
  ) => void;
  onRemoveOverlay: (id: string) => void;
  onPreviewGenerated: (id: string, dataUrl: string) => void;
  onSetDynamicLayout: (
    target: { id: string; type: string },
    mode: "pip" | "reset" | "split-horizontal" | "split-vertical"
  ) => void;
  containerSize: { width: number; height: number };
  portalContainer?: HTMLElement | null;
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;
}

export const DraggableHtmlOverlay: React.FC<DraggableHtmlOverlayProps> = ({
  overlay,
  onLayoutChange,
  onRemoveOverlay,
  onPreviewGenerated,
  onSetDynamicLayout,
  containerSize,
  portalContainer,
  allOverlays,
  onSnapGuidesChange,
}) => {
  const { theme } = useTheme();
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (overlay.preview === "" && elementRef.current) {
      const timer = setTimeout(async () => {
        if (elementRef.current) {
          const previewDataUrl = await generatePreview(elementRef.current);
          if (previewDataUrl) {
            onPreviewGenerated(overlay.id, previewDataUrl);
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [overlay.id, overlay.preview, onPreviewGenerated]);

  const handleRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!elementRef.current) return;
    const box = elementRef.current.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const startAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialRotation = overlay.layout.rotation || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const currentAngle =
        Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
        (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      onLayoutChange(overlay.id, "rotation", initialRotation + angleDiff);
    };

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (!containerSize.width || !containerSize.height) return null;

  const isFullscreen =
    overlay.layout.size.width >= 99.5 && overlay.layout.size.height >= 99.5;

  return (
    <SmartDraggable
      id={overlay.id}
      position={overlay.layout.position}
      size={overlay.layout.size}
      rotation={overlay.layout.rotation}
      zIndex={overlay.layout.zIndex}
      containerSize={containerSize}
      allOverlays={allOverlays}
      onSnapGuidesChange={onSnapGuidesChange}
      enableResizing={!isFullscreen}
      className={cn(
        "group pointer-events-auto",
        isFullscreen && "pointer-events-none"
      )}
      onChange={(id, layout) => {
        if (layout.position) onLayoutChange(id, "position", layout.position);
        if (layout.size) onLayoutChange(id, "size", layout.size);
      }}
    >
      <div
        ref={elementRef}
        className={cn(
          "w-full h-full relative border-2 border-dashed border-transparent transition-colors",
          !isFullscreen && "group-hover:border-primary"
        )}
      >
        <div className={cn("w-full h-full overflow-hidden")}>
          <HtmlOverlayRenderer
            key={theme}
            htmlContent={overlay.htmlContent}
            theme={theme}
          />
        </div>

        <DynamicLayoutPicker
          onSelectLayout={(mode) =>
            onSetDynamicLayout({ id: overlay.id, type: "html" }, mode)
          }
          portalContainer={
            typeof portalContainer === "function" ? undefined : portalContainer
          }
        />

        {!isFullscreen && (
          <>
            <button
              onClick={() => onRemoveOverlay(overlay.id)}
              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all pointer-events-auto z-50"
              style={{
                transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
              }}
            >
              <X className="w-4 h-4" />
            </button>
            <div
              onMouseDown={handleRotationStart}
              className="absolute bottom-2 right-2 bg-primary text-primary-foreground rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:scale-125 transition-all pointer-events-auto cursor-alias"
              style={{
                transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
                zIndex: "var(--z-draggable-element-active)",
              }}
            >
              <RotateCcw className="w-4 h-4" />
            </div>
          </>
        )}
      </div>
    </SmartDraggable>
  );
};
