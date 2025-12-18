// src/components/DraggableFileViewer.tsx
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { FileOverlayState } from "@/types/caption";
import { X, File as FileIcon, Loader2, Layers } from "lucide-react";
import { HybridDraggable } from "@/components/video-canvas/HybridDraggable";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";

interface DraggableFileViewerProps {
  overlay: FileOverlayState;
  onLayoutChange: (
    id: string,
    layout: Partial<FileOverlayState["layout"]>
  ) => void;
  onRemove: (id: string) => void;
  sceneSize: { width: number; height: number };
  isSelected: boolean;
  onSetDynamicLayout: (
    target: { id: string; type: "file" },
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => void;
  onSelect: (id: string) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  viewport: { scale: number; x: number; y: number };
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;
}

// FileRenderer (kept inline for simplicity, or import if separate)
export const FileRenderer: React.FC<{
  overlay: FileOverlayState;
  onAspectRatioDetermined?: (ratio: number) => void;
}> = ({ overlay, onAspectRatioDetermined }) => {
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (overlay.fileType === "text") {
      overlay.file
        .text()
        .then((text) => {
          if (isMounted) setTextContent(text);
        })
        .catch(console.error);
    }
    return () => {
      isMounted = false;
    };
  }, [overlay.file, overlay.fileType]);

  switch (overlay.fileType) {
    case "image":
      return (
        <img
          src={overlay.fileUrl}
          alt={overlay.fileName}
          className="w-full h-full select-none"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              onAspectRatioDetermined?.(img.naturalWidth / img.naturalHeight);
            }
          }}
        />
      );
    case "video":
      return (
        <div className="w-full h-full relative bg-black flex items-center justify-center">
          <video src={overlay.fileUrl} controls className="w-full h-full" />
        </div>
      );
    case "audio":
      return (
        <div className="p-4">
          <audio src={overlay.fileUrl} controls className="w-full" />
        </div>
      );
    case "pdf":
      return (
        <iframe
          src={overlay.fileUrl}
          title={overlay.fileName}
          className="w-full h-full border-none"
        />
      );
    case "text":
      return (
        <pre className="w-full h-full p-4 text-xs whitespace-pre-wrap overflow-auto">
          {textContent}
        </pre>
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
          <FileIcon className="w-16 h-16" />
          <p className="mt-2 text-sm text-center break-all">
            {overlay.fileName}
          </p>
        </div>
      );
  }
};

export const DraggableFileViewer: React.FC<DraggableFileViewerProps> = ({
  overlay,
  onLayoutChange,
  onRemove,
  sceneSize,
  isSelected,
  onSetDynamicLayout,
  onSelect,
  onInternalDragStart,
  onInternalDragStop,
  allOverlays,
  onSnapGuidesChange,
}) => {
  // Rotation now handled by HybridDraggable

  const handleAspectRatioDetermined = (ratio: number) => {
    // Check if current aspect ratio differs significantly
    const currentRatio =
      ((overlay.layout.size.width / 100) * sceneSize.width) /
      ((overlay.layout.size.height / 100) * sceneSize.height);

    if (Math.abs(currentRatio - ratio) > 0.01) {
      // Calculate new height to match aspect ratio, keeping width constant
      // ratio = width / height  =>  height = width / ratio
      const currentWidthPx = (overlay.layout.size.width / 100) * sceneSize.width;
      const newHeightPx = currentWidthPx / ratio;
      const newHeightPercent = (newHeightPx / sceneSize.height) * 100;

      onLayoutChange(overlay.id, {
        size: {
          width: overlay.layout.size.width,
          height: newHeightPercent,
        },
      });
    }
  };

  return (
    <HybridDraggable
      id={overlay.id}
      position={overlay.layout.position}
      size={overlay.layout.size}
      rotation={overlay.layout.rotation}
      zIndex={overlay.layout.zIndex}
      containerSize={sceneSize}
      isSelected={isSelected}
      minWidth={50} // Reduced min width to allow smaller logos
      minHeight={50}
      onSelect={onSelect}
      onCommit={(id, layout) => {
        onLayoutChange(id, {
          ...(layout.position && { position: layout.position }),
          ...(layout.size && { size: layout.size }),
          ...(layout.rotation !== undefined && { rotation: layout.rotation }),
        });
        onInternalDragStop();
      }}
      allOverlays={allOverlays}
      onSnapGuidesChange={onSnapGuidesChange}
      enableResizing={true}
      enableRotation={true}
      lockAspectRatio={overlay.fileType === "image"}
      cancelSelector="audio, video, iframe"
      className={cn(
        "group transition-all duration-200",
        overlay.fileType === "image" ? "bg-transparent" : "bg-card",
        isSelected
          ? "shadow-lg border-2 border-primary"
          : "shadow-none border-2 border-transparent group-hover:border-primary/50"
      )}
    >
      <div className="w-full h-full flex flex-col relative">

        <div
          className={cn(
            "flex-grow w-full h-full relative overflow-hidden rounded-lg",
            overlay.fileType !== "image" && "bg-background/50"
          )}
        >
          <FileRenderer
            overlay={overlay}
            onAspectRatioDetermined={handleAspectRatioDetermined}
          />
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(overlay.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="close-button absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-50 pointer-events-auto shadow-sm"
          style={{ transform: `rotate(-${overlay.layout.rotation || 0}deg)` }}
        >
          <X className="w-4 h-4" />
        </button>

        {isSelected && (
          <div
            className="absolute top-2 left-2 z-50 flex gap-1 pointer-events-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLayoutChange(overlay.id, { isBehindUser: !overlay.layout.isBehindUser });
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "p-1.5 rounded-full shadow-md border border-border/50 backdrop-blur-sm transition-colors cursor-pointer",
                overlay.layout.isBehindUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground"
              )}
              title={overlay.layout.isBehindUser ? "Behind User" : "In Front"}
            >
              <Layers className="w-3 h-3" />
            </button>
          </div>
        )}

      </div>
    </HybridDraggable>
  );
};
