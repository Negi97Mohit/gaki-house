// src/components/video-canvas/HybridDraggable.tsx

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";
import { usePointerInteraction } from "@/hooks/usePointerInteraction";
import { useTransformMatrix } from "@/hooks/useTransformMatrix";
import {
  applyGPUTransform,
  createIframeBlocker,
  removeIframeBlocker,
  optimizeForDrag,
  restoreAfterDrag,
  percentToPixels,
  pixelsToPercent,
  clamp,
} from "@/lib/transformUtils";
import {
  useSnapGuides,
  OverlayElement,
  GuideLine,
} from "@/hooks/useSnapGuides";

export interface LayoutUpdate {
  position?: { x: number; y: number }; // Percentage
  size?: { width: number; height: number }; // Percentage
  rotation?: number;
}

export interface HybridDraggableProps {
  id: string;
  position: { x: number; y: number }; // Percentage (0-100)
  size: { width: number; height: number }; // Percentage (0-100)
  rotation?: number; // Degrees
  zIndex: number;
  containerSize: { width: number; height: number }; // Pixels

  // Interaction callbacks
  onCommit: (id: string, layout: LayoutUpdate) => void;
  onSelect?: (id: string) => void;
  onClick?: (id: string) => void;
  onDoubleClick?: (id: string, e: React.MouseEvent) => void;

  // Snapping
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;

  // Configuration
  minWidth?: number;
  minHeight?: number;
  lockAspectRatio?: boolean;
  enableResizing?: boolean;
  enableRotation?: boolean;
  enableDragging?: boolean;

  // Styling
  children: React.ReactNode;
  className?: string;
  dragHandleSelector?: string;
  cancelSelector?: string;
  isSelected?: boolean;
}

type InteractionMode = "idle" | "dragging" | "resizing" | "rotating";
type ResizeHandle = "nw" | "ne" | "sw" | "se" | "n" | "s" | "e" | "w";

export const HybridDraggable: React.FC<HybridDraggableProps> = ({
  id,
  position,
  size,
  rotation = 0,
  zIndex,
  containerSize,
  onCommit,
  onSelect,
  onClick,
  onDoubleClick,
  allOverlays = [],
  onSnapGuidesChange,
  minWidth = 50,
  minHeight = 50,
  lockAspectRatio = false,
  enableResizing = true,
  enableRotation = true,
  enableDragging = true,
  children,
  className,
  dragHandleSelector,
  cancelSelector,
  isSelected = false,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  const iframeBlockerRef = useRef<HTMLElement | null>(null);

  const [mode, setMode] = useState<InteractionMode>("idle");
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle | null>(null);

  // Local state for smooth visual updates (pixels) - ONLY updated at end of interaction or prop change
  const [localTransform, setLocalTransform] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation,
  });

  // Mutable ref for high-frequency updates during interaction
  const currentTransformRef = useRef({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    rotation,
  });

  // Track interaction start position & click detection
  const startStateRef = useRef({
    pointerX: 0,
    pointerY: 0,
    elementX: 0,
    elementY: 0,
    elementWidth: 0,
    elementHeight: 0,
    rotation: 0,
    hasMoved: false,
    startTime: 0,
  });

  const lastClickTimeRef = useRef(0);

  const { createTransformCSS } = useTransformMatrix();
  const { calculateSnap } = useSnapGuides({
    containerSize,
    allElements: allOverlays,
    currentElementId: id,
    snapThreshold: 3,
  });

  // Sync props to local state and ref when not interacting
  useEffect(() => {
    if (
      mode === "idle" &&
      containerSize.width > 0 &&
      containerSize.height > 0
    ) {
      const pixels = percentToPixels(position, containerSize);
      const newTransform = {
        x: pixels.x,
        y: pixels.y,
        width: (size.width / 100) * containerSize.width,
        height: (size.height / 100) * containerSize.height,
        rotation,
      };
      setLocalTransform(newTransform);
      currentTransformRef.current = newTransform;
    }
  }, [position, size, rotation, containerSize, mode]);

  // --- Drag Handlers ---

  const handleDragStart = useCallback(
    (e: PointerEvent) => {
      if (!elementRef.current || !enableDragging) return;

      e.stopPropagation();

      if (cancelSelector) {
        const target = e.target as HTMLElement;
        if (target.closest(cancelSelector)) return;
      }

      if (dragHandleSelector) {
        const target = e.target as HTMLElement;
        if (!target.closest(dragHandleSelector)) return;
      }

      // Sync ref with current state just in case
      currentTransformRef.current = { ...localTransform };

      startStateRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        elementX: currentTransformRef.current.x,
        elementY: currentTransformRef.current.y,
        elementWidth: currentTransformRef.current.width,
        elementHeight: currentTransformRef.current.height,
        rotation: currentTransformRef.current.rotation,
        hasMoved: false,
        startTime: Date.now(),
      };

      onSelect?.(id);
      optimizeForDrag(elementRef.current);

      if (elementRef.current.querySelector("iframe")) {
        iframeBlockerRef.current = createIframeBlocker(elementRef.current);
      }
    },
    [
      id,
      onSelect,
      localTransform,
      cancelSelector,
      dragHandleSelector,
      enableDragging,
    ]
  );

  const handleDragMove = useCallback(
    (e: PointerEvent) => {
      if (!elementRef.current || !enableDragging) return;

      const deltaX = e.clientX - startStateRef.current.pointerX;
      const deltaY = e.clientY - startStateRef.current.pointerY;

      if (
        !startStateRef.current.hasMoved &&
        Math.abs(deltaX) < 3 &&
        Math.abs(deltaY) < 3
      ) {
        return;
      }

      if (!startStateRef.current.hasMoved) {
        startStateRef.current.hasMoved = true;
        setMode("dragging");
      }

      let newX = startStateRef.current.elementX + deltaX;
      let newY = startStateRef.current.elementY + deltaY;

      // Convert to % for snapping
      const xPercent = (newX / containerSize.width) * 100;
      const yPercent = (newY / containerSize.height) * 100;
      const widthPercent =
        (currentTransformRef.current.width / containerSize.width) * 100;
      const heightPercent =
        (currentTransformRef.current.height / containerSize.height) * 100;

      // Calculate snap
      const snapResult = calculateSnap(
        { x: xPercent, y: yPercent },
        { width: widthPercent, height: heightPercent }
      );

      onSnapGuidesChange?.(snapResult.guides);

      // Apply snap
      const snappedPixels = percentToPixels(
        snapResult.snappedPosition,
        containerSize
      );
      newX = snappedPixels.x;
      newY = snappedPixels.y;

      // Clamp bounds (relaxed)
      newX = clamp(
        newX,
        -currentTransformRef.current.width + 20,
        containerSize.width - 20
      );
      newY = clamp(
        newY,
        -currentTransformRef.current.height + 20,
        containerSize.height - 20
      );

      // Update ref
      currentTransformRef.current.x = newX;
      currentTransformRef.current.y = newY;

      // Direct DOM update
      applyGPUTransform(elementRef.current, {
        x: newX,
        y: newY,
        rotation: currentTransformRef.current.rotation,
      });
    },
    [containerSize, calculateSnap, onSnapGuidesChange, enableDragging]
  );

  const handleDragEnd = useCallback(
    (e: PointerEvent) => {
      if (!elementRef.current) return;

      const wasDragging = startStateRef.current.hasMoved;

      setMode("idle");
      restoreAfterDrag(elementRef.current);
      if (iframeBlockerRef.current) {
        removeIframeBlocker(iframeBlockerRef.current);
        iframeBlockerRef.current = null;
      }
      onSnapGuidesChange?.([]);

      if (wasDragging) {
        // Sync local state
        setLocalTransform({ ...currentTransformRef.current });

        const percent = pixelsToPercent(
          {
            x: currentTransformRef.current.x,
            y: currentTransformRef.current.y,
          },
          containerSize
        );
        onCommit(id, {
          position: {
            x: clamp(percent.x, -90, 190),
            y: clamp(percent.y, -90, 190),
          },
        });
      } else {
        // Click logic
        const now = Date.now();
        const timeDiff = now - lastClickTimeRef.current;

        if (timeDiff < 300) {
          onDoubleClick?.(id, e as unknown as React.MouseEvent);
          lastClickTimeRef.current = 0;
        } else {
          onClick?.(id);
          lastClickTimeRef.current = now;
        }
      }
    },
    [id, containerSize, onCommit, onSnapGuidesChange, onClick, onDoubleClick]
  );

  const dragBind = usePointerInteraction({
    onStart: handleDragStart,
    onMove: handleDragMove,
    onEnd: handleDragEnd,
  });

  // --- Resize Handlers ---

  const handleResizeStart = useCallback(
    (e: React.PointerEvent, handle: ResizeHandle) => {
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      if (!elementRef.current) return;

      setMode("resizing");
      setResizeHandle(handle);
      onSelect?.(id);

      // Sync ref
      currentTransformRef.current = { ...localTransform };

      startStateRef.current = {
        pointerX: e.clientX,
        pointerY: e.clientY,
        elementX: currentTransformRef.current.x,
        elementY: currentTransformRef.current.y,
        elementWidth: currentTransformRef.current.width,
        elementHeight: currentTransformRef.current.height,
        rotation: currentTransformRef.current.rotation,
        hasMoved: true,
        startTime: Date.now(),
      };

      optimizeForDrag(elementRef.current);
    },
    [id, onSelect, localTransform]
  );

  const handleResizeMove = useCallback(
    (e: PointerEvent | React.PointerEvent) => {
      if (!elementRef.current || mode !== "resizing" || !resizeHandle) return;

      const deltaX = e.clientX - startStateRef.current.pointerX;
      const deltaY = e.clientY - startStateRef.current.pointerY;

      let newWidth = startStateRef.current.elementWidth;
      let newHeight = startStateRef.current.elementHeight;
      let newX = startStateRef.current.elementX;
      let newY = startStateRef.current.elementY;

      switch (resizeHandle) {
        case "se":
          newWidth = Math.max(
            minWidth,
            startStateRef.current.elementWidth + deltaX
          );
          newHeight = Math.max(
            minHeight,
            startStateRef.current.elementHeight + deltaY
          );
          break;
        case "nw":
          newWidth = Math.max(
            minWidth,
            startStateRef.current.elementWidth - deltaX
          );
          newHeight = Math.max(
            minHeight,
            startStateRef.current.elementHeight - deltaY
          );
          newX =
            startStateRef.current.elementX +
            (startStateRef.current.elementWidth - newWidth);
          newY =
            startStateRef.current.elementY +
            (startStateRef.current.elementHeight - newHeight);
          break;
        case "ne":
          newWidth = Math.max(
            minWidth,
            startStateRef.current.elementWidth + deltaX
          );
          newHeight = Math.max(
            minHeight,
            startStateRef.current.elementHeight - deltaY
          );
          newY =
            startStateRef.current.elementY +
            (startStateRef.current.elementHeight - newHeight);
          break;
        case "sw":
          newWidth = Math.max(
            minWidth,
            startStateRef.current.elementWidth - deltaX
          );
          newHeight = Math.max(
            minHeight,
            startStateRef.current.elementHeight + deltaY
          );
          newX =
            startStateRef.current.elementX +
            (startStateRef.current.elementWidth - newWidth);
          break;
        // Edge handles - resize width OR height only
        case "e":
          newWidth = Math.max(
            minWidth,
            startStateRef.current.elementWidth + deltaX
          );
          break;
        case "w":
          newWidth = Math.max(
            minWidth,
            startStateRef.current.elementWidth - deltaX
          );
          newX =
            startStateRef.current.elementX +
            (startStateRef.current.elementWidth - newWidth);
          break;
        case "n":
          newHeight = Math.max(
            minHeight,
            startStateRef.current.elementHeight - deltaY
          );
          newY =
            startStateRef.current.elementY +
            (startStateRef.current.elementHeight - newHeight);
          break;
        case "s":
          newHeight = Math.max(
            minHeight,
            startStateRef.current.elementHeight + deltaY
          );
          break;
      }

      if (lockAspectRatio) {
        const aspectRatio =
          startStateRef.current.elementWidth /
          startStateRef.current.elementHeight;
        // Only apply aspect ratio lock to corner handles, not edge handles
        const isCornerHandle = resizeHandle.length === 2;
        if (isCornerHandle) {
          newHeight = newWidth / aspectRatio;
          if (resizeHandle.includes("n")) {
            newY =
              startStateRef.current.elementY +
              (startStateRef.current.elementHeight - newHeight);
          }
        }
      }

      // Update ref
      currentTransformRef.current = {
        ...currentTransformRef.current,
        x: newX,
        y: newY,
        width: newWidth,
        height: newHeight,
      };

      // Direct DOM update
      elementRef.current.style.width = `${newWidth}px`;
      elementRef.current.style.height = `${newHeight}px`;
      applyGPUTransform(elementRef.current, {
        x: newX,
        y: newY,
        rotation: currentTransformRef.current.rotation,
      });
    },
    [mode, resizeHandle, minWidth, minHeight, lockAspectRatio]
  );

  const handleResizeEnd = useCallback(
    (e: PointerEvent | React.PointerEvent) => {
      const target = e.target as HTMLElement;
      target?.releasePointerCapture?.(e.pointerId);
      if (!elementRef.current) return;
      setMode("idle");
      setResizeHandle(null);
      restoreAfterDrag(elementRef.current);

      // Sync local state
      setLocalTransform({ ...currentTransformRef.current });

      const posPercent = pixelsToPercent(
        { x: currentTransformRef.current.x, y: currentTransformRef.current.y },
        containerSize
      );
      const sizePercent = {
        width: (currentTransformRef.current.width / containerSize.width) * 100,
        height:
          (currentTransformRef.current.height / containerSize.height) * 100,
      };

      onCommit(id, { position: posPercent, size: sizePercent });
    },
    [id, containerSize, onCommit]
  );

  const resizeBind = usePointerInteraction({
    onMove: handleResizeMove,
    onEnd: handleResizeEnd,
  });

  const liveRotationRef = useRef(rotation);

  const handleRotationStart = useCallback(
    (e: React.PointerEvent) => {
      e.stopPropagation();
      if (!elementRef.current) return;
      setMode("rotating");
      onSelect?.(id);

      // Sync ref
      currentTransformRef.current = { ...localTransform };

      const rect = elementRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const startAngle =
        Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
      const initialRotation = currentTransformRef.current.rotation;
      liveRotationRef.current = initialRotation;

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const currentAngle =
          Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
          (180 / Math.PI);
        const angleDiff = currentAngle - startAngle;
        const newRotation = initialRotation + angleDiff;

        liveRotationRef.current = newRotation;

        // Update ref
        currentTransformRef.current.rotation = newRotation;

        // Direct DOM update
        if (elementRef.current) {
          applyGPUTransform(elementRef.current, {
            x: currentTransformRef.current.x,
            y: currentTransformRef.current.y,
            rotation: newRotation,
          });
        }
      };

      const handleMouseUp = () => {
        setMode("idle");
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);

        // Sync local state
        setLocalTransform((prev) => ({
          ...prev,
          rotation: liveRotationRef.current,
        }));

        onCommit(id, { rotation: liveRotationRef.current });
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [id, onSelect, localTransform, onCommit]
  );

  return (
    <div
      ref={elementRef}
      {...dragBind()}
      onClick={(e) => e.stopPropagation()}
      className={cn(
        "absolute pointer-events-auto select-none touch-none",
        className,
        mode !== "idle" && "cursor-grabbing",
        mode === "dragging" && "shadow-2xl opacity-90 scale-[1.01]",
        isSelected && "ring-2 ring-primary"
      )}
      style={{
        width: `${localTransform.width}px`,
        height: `${localTransform.height}px`,
        zIndex: mode !== "idle" ? 9999 : zIndex,
        transform: createTransformCSS({
          x: localTransform.x,
          y: localTransform.y,
          rotation: localTransform.rotation,
        }),
        transformOrigin: "center center",
      }}
    >
      {/* Content wrapper - fills entire resize box */}
      <div className="w-full h-full overflow-visible">
        {children}
      </div>

      {/* Resize handles - positioned on the corners, not outside */}
      {isSelected && enableResizing && (
        <>
          <div
            className="absolute bottom-0 right-0 w-4 h-4 bg-white border-2 border-primary rounded-sm cursor-nwse-resize z-50 shadow-sm translate-x-1/2 translate-y-1/2"
            onPointerDown={(e) => handleResizeStart(e, "se")}
            onPointerMove={(e) => handleResizeMove(e)}
            onPointerUp={(e) => handleResizeEnd(e)}
          />
          <div
            className="absolute top-0 left-0 w-4 h-4 bg-white border-2 border-primary rounded-sm cursor-nwse-resize z-50 shadow-sm -translate-x-1/2 -translate-y-1/2"
            onPointerDown={(e) => handleResizeStart(e, "nw")}
            onPointerMove={(e) => handleResizeMove(e)}
            onPointerUp={(e) => handleResizeEnd(e)}
          />
          <div
            className="absolute top-0 right-0 w-4 h-4 bg-white border-2 border-primary rounded-sm cursor-nesw-resize z-50 shadow-sm translate-x-1/2 -translate-y-1/2"
            onPointerDown={(e) => handleResizeStart(e, "ne")}
            onPointerMove={(e) => handleResizeMove(e)}
            onPointerUp={(e) => handleResizeEnd(e)}
          />
          <div
            className="absolute bottom-0 left-0 w-4 h-4 bg-white border-2 border-primary rounded-sm cursor-nesw-resize z-50 shadow-sm -translate-x-1/2 translate-y-1/2"
            onPointerDown={(e) => handleResizeStart(e, "sw")}
            onPointerMove={(e) => handleResizeMove(e)}
            onPointerUp={(e) => handleResizeEnd(e)}
          />
          {/* Edge handles for more intuitive resizing */}
          <div
            className="absolute top-1/2 left-0 w-2 h-8 bg-white/80 border border-primary rounded-sm cursor-ew-resize z-50 -translate-x-1/2 -translate-y-1/2"
            onPointerDown={(e) => handleResizeStart(e, "w")}
            onPointerMove={(e) => handleResizeMove(e)}
            onPointerUp={(e) => handleResizeEnd(e)}
          />
          <div
            className="absolute top-1/2 right-0 w-2 h-8 bg-white/80 border border-primary rounded-sm cursor-ew-resize z-50 translate-x-1/2 -translate-y-1/2"
            onPointerDown={(e) => handleResizeStart(e, "e")}
            onPointerMove={(e) => handleResizeMove(e)}
            onPointerUp={(e) => handleResizeEnd(e)}
          />
          <div
            className="absolute top-0 left-1/2 w-8 h-2 bg-white/80 border border-primary rounded-sm cursor-ns-resize z-50 -translate-x-1/2 -translate-y-1/2"
            onPointerDown={(e) => handleResizeStart(e, "n")}
            onPointerMove={(e) => handleResizeMove(e)}
            onPointerUp={(e) => handleResizeEnd(e)}
          />
          <div
            className="absolute bottom-0 left-1/2 w-8 h-2 bg-white/80 border border-primary rounded-sm cursor-ns-resize z-50 -translate-x-1/2 translate-y-1/2"
            onPointerDown={(e) => handleResizeStart(e, "s")}
            onPointerMove={(e) => handleResizeMove(e)}
            onPointerUp={(e) => handleResizeEnd(e)}
          />
        </>
      )}

      {isSelected && enableRotation && (
        <div
          className="absolute -bottom-7 left-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-primary rounded-full cursor-alias z-50 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
          onPointerDown={handleRotationStart}
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-primary"
          >
            <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
          </svg>
        </div>
      )}
    </div>
  );
};
