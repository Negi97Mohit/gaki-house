// src/components/DraggableFileViewer.tsx

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { FileOverlayState, FileType } from "@/types/caption";
import { X, File as FileIcon, Loader2, RotateCcw } from "lucide-react";
import { DynamicLayoutPicker } from "./DynamicLayoutPicker";

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
}

// FileRenderer Component (remains the same)
export const FileRenderer: React.FC<{ overlay: FileOverlayState }> = ({
  overlay,
}) => {
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (overlay.fileType === "text") {
      overlay.file
        .text()
        .then((text) => {
          if (isMounted) {
            setTextContent(text);
          }
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

// --- REFACTOR: Helper now converts top-left pixel to top-left percentage ---
const calculatePercentagePosition = (
  pixelX: number,
  pixelY: number,
  sceneSize: { width: number; height: number }
): { x: number; y: number } | null => {
  if (
    !sceneSize.width ||
    !sceneSize.height ||
    sceneSize.width <= 0 ||
    sceneSize.height <= 0
  ) {
    console.warn(
      "Missing or invalid sceneSize in calculatePercentagePosition",
      { sceneSize }
    );
    return null;
  }

  const percentageX = (pixelX / sceneSize.width) * 100;
  const percentageY = (pixelY / sceneSize.height) * 100;
  return { x: percentageX, y: percentageY };
};
// --- END REFACTOR ---

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
  viewport,
}) => {
  const rndRef = useRef<Rnd | null>(null); // ADDED: Ref for Rnd
  const widthPx =
    sceneSize.width > 0
      ? (sceneSize.width * overlay.layout.size.width) / 100
      : 300;
  const heightPx =
    sceneSize.height > 0
      ? (sceneSize.height * overlay.layout.size.height) / 100
      : 200;

  // --- REFACTOR: Calculate top-left pixel position ---
  const xPx =
    sceneSize.width > 0
      ? (sceneSize.width * overlay.layout.position.x) / 100
      : 0;
  const yPx =
    sceneSize.height > 0
      ? (sceneSize.height * overlay.layout.position.y) / 100
      : 0;
  // --- END REFACTOR ---

  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      onInternalDragStop();
      if (sceneSize.width <= 0 || sceneSize.height <= 0) return;

      // --- REFACTOR: Use new top-left helper ---
      const newPositionPercent = calculatePercentagePosition(
        d.x,
        d.y,
        sceneSize
      );
      // --- END REFACTOR ---

      if (newPositionPercent) {
        // Boundary Enforcement
        newPositionPercent.x = Math.max(
          0,
          Math.min(newPositionPercent.x, 100 - overlay.layout.size.width)
        );
        newPositionPercent.y = Math.max(
          0,
          Math.min(newPositionPercent.y, 100 - overlay.layout.size.height)
        );

        onLayoutChange(overlay.id, {
          position: newPositionPercent,
        });
      }
    },
    [
      onInternalDragStop,
      sceneSize,
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
      if (sceneSize.width <= 0 || sceneSize.height <= 0) return;

      const newWidthPx = parseInt(ref.style.width, 10);
      const newHeightPx = parseInt(ref.style.height, 10);

      // --- REFACTOR: Use new top-left helper ---
      const newPositionPercent = calculatePercentagePosition(
        pos.x,
        pos.y,
        sceneSize
      );
      let newWidthPercent = (newWidthPx / sceneSize.width) * 100;
      let newHeightPercent = (newHeightPx / sceneSize.height) * 100;

      if (newPositionPercent) {
        // Boundary Enforcement
        newWidthPercent = Math.min(newWidthPercent, 100 - newPositionPercent.x);
        newHeightPercent = Math.min(
          newHeightPercent,
          100 - newPositionPercent.y
        );
      }
      // --- END REFACTOR ---

      if (newPositionPercent) {
        onLayoutChange(overlay.id, {
          position: newPositionPercent,
          size: {
            width: newWidthPercent,
            height: newHeightPercent,
          },
        });
      }
    },
    [onInternalDragStop, sceneSize, onLayoutChange, overlay.id]
  );

  // --- ADDED: Rotation handler ---
  const handleRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log(
      `[DraggableFileViewer ${overlay.id}] handleRotationStart FIRED`
    ); // DEBUG
    const selfElement = rndRef.current?.getSelfElement();
    if (!selfElement) return;

    const box = selfElement.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const startAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialRotation = overlay.layout.rotation || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      console.log(`[DraggableFileViewer ${overlay.id}] handleMouseMove`); // DEBUG
      const currentAngle =
        Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
        (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      onLayoutChange(overlay.id, { rotation: initialRotation + angleDiff });
    };

    const handleMouseUp = () => {
      console.log(`[DraggableFileViewer ${overlay.id}] handleMouseUp`); // DEBUG
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      onInternalDragStop();
    };

    onInternalDragStart();
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };
  // --- END ADDED ---

  return (
    <Rnd
      ref={rndRef}
      scale={1}
      size={{ width: widthPx, height: heightPx }}
      position={{ x: xPx, y: yPx }}
      minWidth={200}
      minHeight={150}
      disableDragging={sceneSize.width <= 0 || sceneSize.height <= 0}
      enableResizing={sceneSize.width > 0 && sceneSize.height > 0}
      cancel="input, button:not(.drag-handle), iframe, .rotate-handle"
      onDragStart={() => {
        onInternalDragStart();
        onSelect(overlay.id);
      }}
      onDragStop={handleDragStop}
      onResizeStop={handleResizeStop}
      onClick={(e) => {
        e.stopPropagation();
      }}
      bounds="parent"
      className={cn(
        "group pointer-events-auto rounded-lg flex flex-col transition-all duration-200",
        overlay.fileType === "image" ? "bg-transparent" : "bg-card",
        isSelected
          ? "shadow-lg border-2 border-primary"
          : "shadow-none border-2 border-transparent group-hover:border-primary/50"
      )}
      style={{
        zIndex: overlay.layout.zIndex,
        // transform: `rotate(${overlay.layout.rotation || 0}deg)`, // MODIFIED
      }}
    >
      {/* ADDED: Inner wrapper for rotation */}
      <div
        className="w-full h-full flex flex-col rounded-lg relative" // Added flex/rounded/relative
        style={{
          transform: `rotate(${overlay.layout.rotation || 0}deg)`,
          transformOrigin: "center center",
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
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
          style={{
            zIndex: "var(--z-draggable-element-active)",
            transform: `rotate(-${overlay.layout.rotation || 0}deg)`, // Counter-rotate
          }}
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* --- ADDED: Rotation Handle --- */}
      <div
        onMouseDown={handleRotationStart}
        className={cn(
          "rotate-handle absolute -bottom-3 -left-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center transition-all hover:scale-110 cursor-alias",
          "opacity-0 group-hover:opacity-100",
          !isSelected && "hidden" // Only show on selected
        )}
        style={{
          transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
          zIndex: "var(--z-draggable-element-active)",
        }}
      >
        <RotateCcw className="w-4 h-4 pointer-events-none" />
      </div>
    </Rnd>
  );
};
