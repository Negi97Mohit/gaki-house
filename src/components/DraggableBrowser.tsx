// src/components/DraggableBrowser.tsx

import React, { useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { X, Globe, ArrowRight, ArrowLeft, RefreshCw } from "lucide-react";
import { DynamicLayoutPicker } from "./DynamicLayoutPicker";

export interface BrowserOverlayState {
  id: string;
  url: string;
  layout: {
    position: { x: number; y: number };
    size: { width: number; height: number };
    zIndex: number;
    rotation: number;
  };
}

interface DraggableBrowserProps {
  overlay: BrowserOverlayState;
  onLayoutChange: (
    id: string,
    layout: Partial<BrowserOverlayState["layout"]>
  ) => void;
  onUrlChange: (id: string, url: string) => void;
  onRemove: (id: string) => void;
  containerSize: { width: number; height: number };
  onSetDynamicLayout: (
    target: { id: string; type: "browser" },
    mode: "split-vertical" | "split-horizontal"
  ) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  viewport: { scale: number; x: number; y: number };
  canvasContainerRef: React.RefObject<HTMLDivElement>;
}

// --- REFACTOR: Helper now converts top-left pixel to top-left percentage ---
const calculatePercentagePosition = (
  pixelX: number,
  pixelY: number,
  containerSize: { width: number; height: number }
): { x: number; y: number } | null => {
  if (
    !containerSize.width ||
    !containerSize.height ||
    containerSize.width <= 0 ||
    containerSize.height <= 0
  ) {
    console.warn(
      "Missing or invalid containerSize in calculatePercentagePosition",
      { containerSize }
    );
    return null;
  }

  const percentageX = (pixelX / containerSize.width) * 100;
  const percentageY = (pixelY / containerSize.height) * 100;
  return { x: percentageX, y: percentageY };
};
// --- END REFACTOR ---

export const DraggableBrowser: React.FC<DraggableBrowserProps> = ({
  overlay,
  onLayoutChange,
  onUrlChange,
  onRemove,
  containerSize,
  onSetDynamicLayout,
  isSelected,
  onSelect,
  onInternalDragStart,
  onInternalDragStop,
  viewport,
  canvasContainerRef,
}) => {
  const [inputUrl, setInputUrl] = useState(overlay.url);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedUrl = inputUrl.startsWith("http")
      ? inputUrl
      : `https://${inputUrl}`;
    onUrlChange(overlay.id, formattedUrl);
  };

  const handleGoBack = () => {
    iframeRef.current?.contentWindow?.history.back();
  };

  const handleRefresh = () => {
    iframeRef.current?.contentWindow?.location.reload();
  };

  const widthPx =
    containerSize.width > 0
      ? (containerSize.width * overlay.layout.size.width) / 100
      : 400;
  const heightPx =
    containerSize.height > 0
      ? (containerSize.height * overlay.layout.size.height) / 100
      : 300;

  // --- REFACTOR: Calculate top-left pixel position ---
  const xPx =
    containerSize.width > 0
      ? (containerSize.width * overlay.layout.position.x) / 100
      : 0;
  const yPx =
    containerSize.height > 0
      ? (containerSize.height * overlay.layout.position.y) / 100
      : 0;
  // --- END REFACTOR ---

  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      onInternalDragStop();
      setIsDragging(false);
      if (containerSize.width <= 0 || containerSize.height <= 0) return;

      // --- REFACTOR: Use new top-left helper ---
      const newPositionPercent = calculatePercentagePosition(
        d.x,
        d.y,
        containerSize
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

      // --- REFACTOR: Use new top-left helper ---
      const newPositionPercent = calculatePercentagePosition(
        pos.x,
        pos.y,
        containerSize
      );
      let newWidthPercent = (newWidthPx / containerSize.width) * 100;
      let newHeightPercent = (newHeightPx / containerSize.height) * 100;

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
    [onInternalDragStop, containerSize, onLayoutChange, overlay.id]
  );
  // --- End useCallback wrappers ---

  return (
    <Rnd
      scale={1}
      size={{ width: widthPx, height: heightPx }}
      position={{ x: xPx, y: yPx }}
      disableDragging={containerSize.width <= 0 || containerSize.height <= 0}
      enableResizing={containerSize.width > 0 && containerSize.height > 0}
      cancel="input, button:not(.drag-handle), iframe"
      onDragStart={(e) => {
        if (
          !(e.target as HTMLElement).closest("input, button:not(.drag-handle)")
        ) {
          onInternalDragStart();
          onSelect(overlay.id);
          setIsDragging(true);
        }
      }}
      onDragStop={handleDragStop}
      minWidth={250}
      minHeight={200}
      onResizeStop={handleResizeStop}
      bounds="parent"
      className={cn(
        "group pointer-events-auto bg-card rounded-lg flex flex-col transition-all duration-200",
        isSelected
          ? "shadow-lg border-2 border-primary"
          : "shadow-none border-2 border-transparent group-hover:border-primary/50"
      )}
      style={{
        zIndex: overlay.layout.zIndex,
        transform: `rotate(${overlay.layout.rotation}deg)`,
      }}
    >
      <DynamicLayoutPicker
        onSelectLayout={(mode) =>
          onSetDynamicLayout(
            { id: overlay.id, type: "browser" },
            mode as "split-horizontal" | "split-vertical"
          )
        }
      />
      {/* Add drag-handle class */}
      <div
        onMouseDown={() => onSelect(overlay.id)}
        className="drag-handle flex-shrink-0 h-10 bg-secondary flex items-center p-2 gap-2 cursor-move rounded-t-lg"
      >
        <button
          onClick={handleGoBack}
          className="p-1 hover:bg-primary/20 rounded-sm"
          title="Back"
        >
          <ArrowLeft className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={handleRefresh}
          className="p-1 hover:bg-primary/20 rounded-sm"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4 text-muted-foreground" />
        </button>
        <Globe className="w-4 h-4 text-muted-foreground" />
        <form onSubmit={handleSubmitUrl} className="flex-1">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            className="w-full bg-background rounded-sm px-2 py-0.5 text-[clamp(0.7rem,1.5vw,0.9rem)]"
            onMouseDown={(e) => {
              e.stopPropagation();
              onSelect(overlay.id);
            }}
            placeholder="Enter URL..."
          />
        </form>
        <button
          onClick={handleSubmitUrl}
          className="p-1 hover:bg-primary/20 rounded-sm"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-grow w-full h-full border-none relative">
        <iframe
          ref={iframeRef}
          src={overlay.url}
          className="w-full h-full"
          sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
          title={`browser-overlay-${overlay.id}`}
          style={{ pointerEvents: isDragging ? "none" : "auto" }}
        />
        {isDragging && <div className="absolute inset-0 z-10 bg-transparent" />}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove(overlay.id);
        }}
        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
        style={{ zIndex: "var(--z-draggable-element-active)" }}
      >
        <X className="w-4 h-4" />
      </button>
    </Rnd>
  );
};
