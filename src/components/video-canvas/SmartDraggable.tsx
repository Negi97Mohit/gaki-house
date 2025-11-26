// src/components/video-canvas/SmartDraggable.tsx
import React, { useState, useEffect, useRef } from "react";
import { Rnd, DraggableEventHandler, RndResizeCallback } from "react-rnd";
import { cn } from "@/lib/utils";
import {
  useSnapGuides,
  OverlayElement,
  GuideLine,
} from "@/hooks/useSnapGuides";

interface SmartDraggableProps {
  id: string;
  // Initial positions in Percentage (0-100)
  position: { x: number; y: number };
  size: { width: number; height: number };
  // Container dimensions in Pixels
  containerSize: { width: number; height: number };

  minWidth?: number;
  minHeight?: number;
  lockAspectRatio?: boolean | number;
  zIndex: number;
  rotation?: number;
  isSelected?: boolean;
  scale?: number;

  // Callbacks
  onChange: (
    id: string,
    layout: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    }
  ) => void;
  onSelect?: (id: string) => void;
  onDragStart?: () => void;
  onDragStop?: () => void;

  // Snapping
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;

  children: React.ReactNode;
  className?: string;
  dragHandleClassName?: string;
  enableResizing?: boolean | object;
  bounds?: string;
  cancel?: string;
}

// Helper to prevent unnecessary updates
const areGuidesEqual = (a: GuideLine[], b: GuideLine[]) => {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (
      a[i].axis !== b[i].axis ||
      a[i].type !== b[i].type ||
      Math.abs(a[i].position - b[i].position) > 0.01
    ) {
      return false;
    }
  }
  return true;
};

export const SmartDraggable: React.FC<SmartDraggableProps> = ({
  id,
  position,
  size,
  containerSize,
  minWidth = 50,
  minHeight = 50,
  lockAspectRatio = false,
  zIndex,
  rotation = 0,
  isSelected = false,
  scale = 1,
  onChange,
  onSelect,
  onDragStart,
  onDragStop,
  allOverlays = [],
  onSnapGuidesChange,
  children,
  className,
  dragHandleClassName,
  enableResizing = true,
  bounds = "parent",
  cancel,
}) => {
  // Local state for smooth 60fps updates
  const [localState, setLocalState] = useState({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  // Track interaction state
  const [isInteracting, setIsInteracting] = useState(false);
  const isDraggingRef = useRef(false);
  const isResizingRef = useRef(false);

  // Store last emitted guides to prevent render spam
  const lastGuidesRef = useRef<GuideLine[]>([]);

  // Initialize Snap Guides hook
  const { calculateSnap } = useSnapGuides({
    containerSize,
    allElements: allOverlays,
    currentElementId: id,
    snapThreshold: 3,
  });

  // Sync local state with props ONLY when not interacting
  useEffect(() => {
    if (
      !isDraggingRef.current &&
      !isResizingRef.current &&
      containerSize.width > 0 &&
      containerSize.height > 0
    ) {
      setLocalState({
        x: (position.x / 100) * containerSize.width,
        y: (position.y / 100) * containerSize.height,
        width: (size.width / 100) * containerSize.width,
        height: (size.height / 100) * containerSize.height,
      });
    }
  }, [position, size, containerSize]);

  // --- Handlers ---

  const handleDragStart: DraggableEventHandler = (e, d) => {
    isDraggingRef.current = true;
    setIsInteracting(true);
    onSelect?.(id);
    onDragStart?.();
  };

  const handleDrag: DraggableEventHandler = (e, d) => {
    // Calculate percentages for snapping logic
    const currentXPercent = (d.x / containerSize.width) * 100;
    const currentYPercent = (d.y / containerSize.height) * 100;
    const widthPercent = (localState.width / containerSize.width) * 100;
    const heightPercent = (localState.height / containerSize.height) * 100;

    // Calculate snap guides (visual only during drag)
    const snapResult = calculateSnap(
      { x: currentXPercent, y: currentYPercent },
      { width: widthPercent, height: heightPercent }
    );

    // OPTIMIZATION: Only update parent if guides have visually changed
    // This prevents 60fps re-renders of the entire App when dragging in empty space
    if (onSnapGuidesChange) {
      if (!areGuidesEqual(snapResult.guides, lastGuidesRef.current)) {
        lastGuidesRef.current = snapResult.guides;
        onSnapGuidesChange(snapResult.guides);
      }
    }

    // Update local state for smooth dragging
    setLocalState((prev) => ({ ...prev, x: d.x, y: d.y }));
  };

  const handleDragStop: DraggableEventHandler = (e, d) => {
    isDraggingRef.current = false;
    setIsInteracting(false);

    // Clean up guides on stop
    if (onSnapGuidesChange) {
      onSnapGuidesChange([]);
      lastGuidesRef.current = [];
    }

    onDragStop?.();

    // Calculate final position percentages
    let xPercent = (d.x / containerSize.width) * 100;
    let yPercent = (d.y / containerSize.height) * 100;
    const wPercent = (localState.width / containerSize.width) * 100;
    const hPercent = (localState.height / containerSize.height) * 100;

    // Apply snapping to the final commit
    const snapResult = calculateSnap(
      { x: xPercent, y: yPercent },
      { width: wPercent, height: hPercent }
    );

    xPercent = snapResult.snappedPosition.x;
    yPercent = snapResult.snappedPosition.y;

    // Bounds check (0-100)
    xPercent = Math.max(0, Math.min(xPercent, 100 - wPercent));
    yPercent = Math.max(0, Math.min(yPercent, 100 - hPercent));

    // Commit to global state
    onChange(id, { position: { x: xPercent, y: yPercent } });
  };

  const handleResizeStart: RndResizeCallback = () => {
    isResizingRef.current = true;
    setIsInteracting(true);
    onSelect?.(id);
    onDragStart?.();
  };

  const handleResize: RndResizeCallback = (e, dir, ref, delta, position) => {
    setLocalState({
      x: position.x,
      y: position.y,
      width: parseInt(ref.style.width, 10),
      height: parseInt(ref.style.height, 10),
    });
  };

  const handleResizeStop: RndResizeCallback = (
    e,
    dir,
    ref,
    delta,
    position
  ) => {
    isResizingRef.current = false;
    setIsInteracting(false);
    onDragStop?.();

    const wPx = parseInt(ref.style.width, 10);
    const hPx = parseInt(ref.style.height, 10);

    let xPercent = (position.x / containerSize.width) * 100;
    let yPercent = (position.y / containerSize.height) * 100;
    let wPercent = (wPx / containerSize.width) * 100;
    let hPercent = (hPx / containerSize.height) * 100;

    // Bounds check
    wPercent = Math.min(wPercent, 100 - xPercent);
    hPercent = Math.min(hPercent, 100 - yPercent);

    onChange(id, {
      position: { x: xPercent, y: yPercent },
      size: { width: wPercent, height: hPercent },
    });
  };

  if (containerSize.width === 0) return null;

  return (
    <Rnd
      size={{ width: localState.width, height: localState.height }}
      position={{ x: localState.x, y: localState.y }}
      scale={scale}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      minWidth={minWidth}
      minHeight={minHeight}
      lockAspectRatio={lockAspectRatio}
      bounds={bounds}
      dragHandleClassName={dragHandleClassName}
      cancel={cancel}
      enableResizing={enableResizing}
      className={cn(
        "pointer-events-auto group",
        className,
        isInteracting ? "cursor-grabbing" : "cursor-grab"
      )}
      style={{
        // Boost Z-Index while dragging so it floats above everything
        zIndex: isInteracting ? 9999 : zIndex,
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>
    </Rnd>
  );
};
