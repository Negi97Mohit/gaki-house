// src/components/DraggableBrowser.tsx

import React, { useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import {
  X,
  Globe,
  ArrowRight,
  ArrowLeft,
  RefreshCw,
  RotateCcw,
} from "lucide-react";
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
  sceneSize: { width: number; height: number };
  onSetDynamicLayout: (
    target: { id: string; type: "browser" },
    mode: "split-vertical" | "split-horizontal"
  ) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  viewport: { scale: number; x: number; y: number };
}

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

export const DraggableBrowser: React.FC<DraggableBrowserProps> = ({
  overlay,
  onLayoutChange,
  onUrlChange,
  onRemove,
  sceneSize,
  onSetDynamicLayout,
  isSelected,
  onSelect,
  onInternalDragStart,
  onInternalDragStop,
  viewport,
}) => {
  const [inputUrl, setInputUrl] = useState(overlay.url);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const rndRef = useRef<Rnd | null>(null); // ADDED: Ref for Rnd

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
    sceneSize.width > 0
      ? (sceneSize.width * overlay.layout.size.width) / 100
      : 400;
  const heightPx =
    sceneSize.height > 0
      ? (sceneSize.height * overlay.layout.size.height) / 100
      : 300;

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
      setIsDragging(false);
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
  // --- End useCallback wrappers ---
  // --- ADDED: Rotation handler ---
  const handleRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    console.log(`[DraggableBrowser ${overlay.id}] handleRotationStart FIRED`); // DEBUG
    e.stopPropagation();
    const selfElement = rndRef.current?.getSelfElement();
    if (!selfElement) return;

    const box = selfElement.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    const startAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialRotation = overlay.layout.rotation || 0;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      console.log(`[DraggableBrowser ${overlay.id}] handleMouseMove`); // DEBUG
      const currentAngle =
        Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
        (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      onLayoutChange(overlay.id, { rotation: initialRotation + angleDiff });
    };

    const handleMouseUp = () => {
      console.log(`[DraggableBrowser ${overlay.id}] handleMouseUp`); // DEBUG
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      onInternalDragStop(); // ADDED
    };

    onInternalDragStart(); // ADDED
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
      disableDragging={sceneSize.width <= 0 || sceneSize.height <= 0}
      enableResizing={sceneSize.width > 0 && sceneSize.height > 0}
      cancel="input, button:not(.drag-handle), iframe, .rotate-handle"
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
        // transform: `rotate(${overlay.layout.rotation}deg)`,
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
          {isDragging && (
            <div className="absolute inset-0 z-10 bg-transparent" />
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(overlay.id);
          }}
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
