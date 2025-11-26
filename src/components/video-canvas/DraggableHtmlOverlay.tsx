import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { useTheme } from "next-themes";
import { X, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneratedOverlay } from "@/types/caption";
import { generatePreview } from "@/lib/preview";
import { DynamicLayoutPicker } from "@/components/DynamicLayoutPicker";
import { HtmlOverlayRenderer } from "./HtmlOverlayRenderer";
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
}) => {
  const { theme } = useTheme();
  const elementRef = useRef<HTMLDivElement>(null);
  const [isResizing, setIsResizing] = useState(false);

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

  const widthPx = (containerSize.width * overlay.layout.size.width) / 100;
  const heightPx = (containerSize.height * overlay.layout.size.height) / 100;
  const xPx = (containerSize.width * overlay.layout.position.x) / 100;
  const yPx = (containerSize.height * overlay.layout.position.y) / 100;

  return (
    <Rnd
      size={{ width: widthPx, height: heightPx }}
      position={{ x: xPx, y: yPx }}
      onDragStop={(e, d) => {
        let newX = (d.x / containerSize.width) * 100;
        let newY = (d.y / containerSize.height) * 100;

        // Boundary Enforcement
        newX = Math.max(0, Math.min(newX, 100 - overlay.layout.size.width));
        newY = Math.max(0, Math.min(newY, 100 - overlay.layout.size.height));

        onLayoutChange(overlay.id, "position", { x: newX, y: newY });
      }}
      onResizeStart={() => setIsResizing(true)}
      onResizeStop={(e, direction, ref, delta, pos) => {
        setIsResizing(false);
        let newWidthPercent =
          (parseInt(ref.style.width, 10) / containerSize.width) * 100;
        let newHeightPercent =
          (parseInt(ref.style.height, 10) / containerSize.height) * 100;
        let newX = (pos.x / containerSize.width) * 100;
        let newY = (pos.y / containerSize.height) * 100;

        // Boundary Enforcement
        newWidthPercent = Math.min(newWidthPercent, 100 - newX);
        newHeightPercent = Math.min(newHeightPercent, 100 - newY);

        onLayoutChange(overlay.id, "position", { x: newX, y: newY });
        onLayoutChange(overlay.id, "size", {
          width: newWidthPercent,
          height: newHeightPercent,
        });
      }}
      bounds="parent"
      minWidth={50}
      minHeight={50}
      enableResizing={!isFullscreen}
      disableDragging={isFullscreen}
      className="group pointer-events-auto"
      style={{ zIndex: overlay.layout.zIndex }}
    >
      <div
        ref={elementRef}
        className={cn(
          "w-full h-full relative border-2 border-dashed border-transparent transition-colors",
          !isFullscreen && "group-hover:border-primary",
          isFullscreen && "pointer-events-none"
        )}
        style={{
          transform: `rotate(${
            isResizing ? 0 : overlay.layout.rotation || 0
          }deg)`,
          transition: isResizing ? "none" : "transform 0.1s ease-in-out",
        }}
      >
        <div
          className={cn(
            "w-full h-full overflow-hidden",
            isFullscreen && "pointer-events-none"
          )}
        >
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
    </Rnd>
  );
};
