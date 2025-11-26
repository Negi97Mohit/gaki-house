// src/components/video-canvas/SmartDraggable.tsx
import React, { useState, useEffect, useRef, useCallback } from "react";
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

  const isDragging = useRef(false);
  const isResizing = useRef(false);

  // Initialize Snap Guides hook
  const { calculateSnap } = useSnapGuides({
    containerSize,
    allElements: allOverlays,
    currentElementId: id,
    snapThreshold: 3, // 3% threshold
  });

  // Sync local state with props ONLY when not interacting
  useEffect(() => {
    if (
      !isDragging.current &&
      !isResizing.current &&
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
    isDragging.current = true;
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

    if (onSnapGuidesChange) {
      onSnapGuidesChange(snapResult.guides);
    }

    // Update local state for smooth dragging
    setLocalState((prev) => ({ ...prev, x: d.x, y: d.y }));
  };

  const handleDragStop: DraggableEventHandler = (e, d) => {
    isDragging.current = false;
    if (onSnapGuidesChange) onSnapGuidesChange([]); // Clear guides
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
    isResizing.current = true;
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
    isResizing.current = false;
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
      className={cn("pointer-events-auto group", className)}
      style={{
        zIndex,
        // IMPORTANT: We apply rotation to the wrapper, not Rnd itself,
        // to keep resize handles axis-aligned and predictable.
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
