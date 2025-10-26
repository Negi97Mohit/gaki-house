// src/components/DraggableFileViewer.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { FileOverlayState, FileType } from "@/types/caption";
import { X, File as FileIcon, Loader2 } from "lucide-react";
import { DynamicLayoutPicker } from "./DynamicLayoutPicker";

interface DraggableFileViewerProps {
  overlay: FileOverlayState;
  onLayoutChange: (
    id: string,
    layout: Partial<FileOverlayState["layout"]>
  ) => void;
  onRemove: (id: string) => void;
  containerSize: { width: number; height: number };
  isSelected: boolean;
  onSetDynamicLayout: (
    target: { id: string; type: "file" },
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => void;
  onSelect: (id: string) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  viewport: { scale: number; x: number; y: number };
  canvasContainerRef: React.RefObject<HTMLDivElement>;
}

// FileRenderer Component (remains the same)
export const FileRenderer: React.FC<{ overlay: FileOverlayState }> = ({
  overlay,
}) => {
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    if (overlay.fileType === "text") {
      overlay.file.text().then(setTextContent).catch(console.error);
    }
  }, [overlay.file, overlay.fileType]);

  switch (overlay.fileType) {
    case "image":
      return (
        <img
          src={overlay.fileUrl}
          alt={overlay.fileName}
          className="w-full h-full object-contain"
        />
      );
    case "video":
      const videoRef = useRef<HTMLVideoElement>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [bufferedPercent, setBufferedPercent] = useState(0);

      useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleProgress = () => {
          if (video.duration > 0 && video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const percent = (bufferedEnd / video.duration) * 100;
            setBufferedPercent(Math.round(percent));
          }
        };
        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("progress", handleProgress);
        if (video.readyState >= 3) setIsLoading(false);
        return () => {
          video.removeEventListener("waiting", handleWaiting);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("progress", handleProgress);
        };
      }, []);

      return (
        <div className="w-full h-full relative bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={overlay.fileUrl}
            controls
            className="w-full h-full"
          />
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 pointer-events-none text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm mt-2 font-mono">{bufferedPercent}%</p>
            </div>
          )}
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

// Helper function moved outside the component
const calculatePercentagePosition = (
  pixelX: number,
  pixelY: number,
  elementWidthPx: number,
  elementHeightPx: number,
  viewport: { scale: number; x: number; y: number },
  containerSize: { width: number; height: number }
): { x: number; y: number } | null => {
  // Return null if invalid
  // Safety check (returns null now)
  if (
    !viewport ||
    !containerSize.width ||
    !containerSize.height ||
    containerSize.width <= 0 || // Explicit check for zero/negative
    containerSize.height <= 0
  ) {
    console.warn(
      // Use warn instead of error for this expected initial state
      "Missing or invalid viewport/containerSize in calculatePercentagePosition",
      { viewport, containerSize }
    );
    return null; // Indicate failure
  }

  // With the `scale` prop on Rnd, pixelX/pixelY are already unscaled.
  // We just need to find the center and convert to percentage.
  const centerXOriginal = pixelX + elementWidthPx / 2;
  const centerYOriginal = pixelY + elementHeightPx / 2;
  const percentageX = (centerXOriginal / containerSize.width) * 100;
  const percentageY = (centerYOriginal / containerSize.height) * 100;
  return { x: percentageX, y: percentageY };
};

export const DraggableFileViewer: React.FC<DraggableFileViewerProps> = ({
  overlay,
  onLayoutChange,
  onRemove,
  containerSize,
  isSelected,
  onSetDynamicLayout,
  onSelect,
  onInternalDragStart,
  onInternalDragStop,
  viewport,
  canvasContainerRef,
}) => {
  // Calculate initial pixel dimensions safely
  const widthPx =
    containerSize.width > 0
      ? (containerSize.width * overlay.layout.size.width) / 100
      : 300; // Default width if container size unknown
  const heightPx =
    containerSize.height > 0
      ? (containerSize.height * overlay.layout.size.height) / 100
      : 200; // Default height

  // Calculate initial pixel position safely (default to center)
  // Calculate initial pixel position in scene coordinates
  const xPx =
    containerSize.width > 0
      ? (containerSize.width * overlay.layout.position.x) / 100 - widthPx / 2
      : 0;
  const yPx =
    containerSize.height > 0
      ? (containerSize.height * overlay.layout.position.y) / 100 - heightPx / 2
      : 0;

  // --- Wrap Rnd callbacks in useCallback ---
  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      onInternalDragStop();
      if (containerSize.width <= 0 || containerSize.height <= 0) return;

      const currentWidthPx =
        (containerSize.width * overlay.layout.size.width) / 100;
      const currentHeightPx =
        (containerSize.height * overlay.layout.size.height) / 100;

      const newPositionPercent = calculatePercentagePosition(
        d.x,
        d.y,
        currentWidthPx,
        currentHeightPx,
        viewport,
        containerSize
      );

      if (newPositionPercent) {
        onLayoutChange(overlay.id, {
          position: newPositionPercent,
        });
      }
    },
    [
      onInternalDragStop,
      viewport,
      containerSize,
      onLayoutChange,
      overlay.id,
      overlay.layout.size,
    ]
  );

  const handleResizeStop = useCallback(
    (
      e: any,
      dir: any,
      ref: HTMLElement,
      delta: any,
      pos: { x: number; y: number }
    ) => {
      onInternalDragStop();
      if (containerSize.width <= 0 || containerSize.height <= 0) return;

      const newWidthPx = parseInt(ref.style.width, 10);
      const newHeightPx = parseInt(ref.style.height, 10);

      const newPositionPercent = calculatePercentagePosition(
        pos.x,
        pos.y,
        newWidthPx,
        newHeightPx,
        viewport,
        containerSize
      );

      if (newPositionPercent) {
        onLayoutChange(overlay.id, {
          position: newPositionPercent,
          size: {
            width: (newWidthPx / containerSize.width) * 100,
            height: (newHeightPx / containerSize.height) * 100,
          },
        });
      }
    },
    [onInternalDragStop, viewport, containerSize, onLayoutChange, overlay.id]
  );
  // --- End useCallback wrappers ---

  return (
    <Rnd
      scale={1}
      size={{ width: widthPx, height: heightPx }}
      position={{ x: xPx, y: yPx }}
      minWidth={200}
      minHeight={150}
      // Disable dragging/resizing if container isn't ready
      disableDragging={containerSize.width <= 0 || containerSize.height <= 0}
      enableResizing={containerSize.width > 0 && containerSize.height > 0}
      cancel="input, button:not(.drag-handle), iframe"
      onDragStart={() => {
        onInternalDragStart();
        onSelect(overlay.id);
      }}
      onDragStop={handleDragStop} // Use useCallback version
      onResizeStop={handleResizeStop} // Use useCallback version
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={cn(
        "group pointer-events-auto rounded-lg flex flex-col transition-all duration-200",
        overlay.fileType === "image" ? "bg-transparent" : "bg-card",
        isSelected
          ? "shadow-lg border-2 border-primary"
          : "shadow-none border-2 border-transparent group-hover:border-primary/50"
      )}
      style={{
        zIndex: overlay.layout.zIndex,
        transform: `rotate(${overlay.layout.rotation}deg)`,
      }}
    >
      {/* Content area allows dragging */}
      <div
        className={cn(
          "flex-grow w-full h-full relative overflow-auto rounded-lg",
          overlay.fileType !== "image" && "bg-background/50"
        )}
        onMouseDown={() => {
          onSelect(overlay.id);
        }}
      >
        <FileRenderer overlay={overlay} />
      </div>
      <DynamicLayoutPicker
        onSelectLayout={(mode) =>
          onSetDynamicLayout({ id: overlay.id, type: "file" }, mode)
        }
      />

      <button
        onClick={() => onRemove(overlay.id)}
        title="Remove file"
        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-50 hover:scale-110"
      >
        <X className="w-4 h-4" />
      </button>
    </Rnd>
  );
};
