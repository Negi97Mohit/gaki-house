// src/components/DraggableTextOverlay.tsx
import React, { useState, useRef, useCallback, useEffect } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { TextOverlayState } from "@/types/caption";
import { X, RotateCcw, GripVertical } from "lucide-react";
import { TextEditingToolbar } from "./TextEditingToolbar";
import { MultiLayerTextRenderer } from "./MultiLayerTextRenderer";
import { useSnapGuides, OverlayElement, GuideLine } from "@/hooks/useSnapGuides";

// Helper: Convert top-left pixel to top-left percentage
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
    return null;
  }
  const percentageX = (pixelX / containerSize.width) * 100;
  const percentageY = (pixelY / containerSize.height) * 100;
  return { x: percentageX, y: percentageY };
};

interface DraggableTextOverlayProps {
  overlay: TextOverlayState;
  onLayoutChange: (
    id: string,
    layout: Partial<TextOverlayState["layout"]>
  ) => void;
  onStyleChange: (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => void;
  onContentChange: (id: string, content: string) => void;
  onRemove: (id: string) => void;
  sceneSize: { width: number; height: number };
  containerRef: React.RefObject<HTMLElement>;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  isSpacePressed: boolean;
  allOverlays?: OverlayElement[]; // NEW: For snapping
  onSnapGuidesChange?: (guides: GuideLine[]) => void; // NEW: Update active guides
}

export const DraggableTextOverlay: React.FC<DraggableTextOverlayProps> = ({
  overlay,
  onLayoutChange,
  onStyleChange,
  onContentChange,
  onRemove,
  sceneSize,
  containerRef,
  isSelected,
  onSelect,
  onInternalDragStart,
  onInternalDragStop,
  isSpacePressed,
  allOverlays = [],
  onSnapGuidesChange,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const rndRef = useRef<Rnd | null>(null);
  const [rotationAngle, setRotationAngle] = useState<number | null>(null);
  // Initialize snap guides hook
  const { calculateSnap } = useSnapGuides({
    containerSize: sceneSize,
    allElements: allOverlays,
    currentElementId: overlay.id,
    snapThreshold: 3, // 3% threshold (~15-30px) - more forgiving
  });

  const widthPx =
    sceneSize.width > 0
      ? (sceneSize.width * overlay.layout.size.width) / 100
      : 200;
  const heightPx =
    sceneSize.height > 0
      ? (sceneSize.height * overlay.layout.size.height) / 100
      : 100;

  const xPx =
    sceneSize.width > 0
      ? (sceneSize.width * overlay.layout.position.x) / 100
      : 0;
  const yPx =
    sceneSize.height > 0
      ? (sceneSize.height * overlay.layout.position.y) / 100
      : 0;

  const handleDrag = useCallback(
    (e: any, d: { x: number; y: number }) => {
      // Calculate snapping during drag for visual feedback
      if (sceneSize.width <= 0 || sceneSize.height <= 0) return;

      const currentWidthPercent = overlay.layout.size.width;
      const currentHeightPercent = overlay.layout.size.height;

      // Convert pixel position to percentage
      const positionPercent = {
        x: (d.x / sceneSize.width) * 100,
        y: (d.y / sceneSize.height) * 100,
      };

      // Calculate snap
      const snapResult = calculateSnap(positionPercent, {
        width: currentWidthPercent,
        height: currentHeightPercent,
      });

      // Update guide lines
      if (onSnapGuidesChange) {
        onSnapGuidesChange(snapResult.guides);
      }
    },
    [sceneSize, overlay.layout.size, calculateSnap, onSnapGuidesChange]
  );

  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      onInternalDragStop();
      setIsDragging(false);

      // Clear guide lines when drag stops
      if (onSnapGuidesChange) {
        onSnapGuidesChange([]);
      }

      if (sceneSize.width <= 0 || sceneSize.height <= 0 || !rndRef.current)
        return;

      const currentElement = rndRef.current.getSelfElement();
      if (!currentElement) return;
      const currentWidthPx = currentElement.offsetWidth;
      const currentHeightPx = currentElement.offsetHeight;

      // Convert pixel position to percentage
      const positionPercent = {
        x: (d.x / sceneSize.width) * 100,
        y: (d.y / sceneSize.height) * 100,
      };

      const currentSizePercent = {
        width: (currentWidthPx / sceneSize.width) * 100,
        height: (currentHeightPx / sceneSize.height) * 100,
      };

      // Apply snapping
      const snapResult = calculateSnap(positionPercent, currentSizePercent);

      // Clamp position to stay within bounds
      const clampedX = Math.max(
        0,
        Math.min(snapResult.snappedPosition.x, 100 - currentSizePercent.width)
      );
      const clampedY = Math.max(
        0,
        Math.min(snapResult.snappedPosition.y, 100 - currentSizePercent.height)
      );

      onLayoutChange(overlay.id, {
        position: { x: clampedX, y: clampedY }
      });
    },
    [onInternalDragStop, sceneSize, onLayoutChange, overlay.id, calculateSnap, onSnapGuidesChange]
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
      setIsDragging(false);
      setIsResizing(false);
      if (sceneSize.width <= 0 || sceneSize.height <= 0) return;

      const newWidthPx = parseInt(ref.style.width, 10);
      const newHeightPx = parseInt(ref.style.height, 10);

      const newPositionPercent = calculatePercentagePosition(
        pos.x,
        pos.y,
        sceneSize
      );
      let newWidthPercent = (newWidthPx / sceneSize.width) * 100;
      let newHeightPercent = (newHeightPx / sceneSize.height) * 100;

      // Boundary Enforcement
      if (newPositionPercent) {
        newWidthPercent = Math.min(newWidthPercent, 100 - newPositionPercent.x);
        newHeightPercent = Math.min(
          newHeightPercent,
          100 - newPositionPercent.y
        );
      }

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

  const handleRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
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
      const currentAngle =
        Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
        (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      let newRotation = initialRotation + angleDiff;

      // Snap to 15° increments unless Shift is held
      if (!moveEvent.shiftKey) {
        const snapInterval = 15;
        newRotation = Math.round(newRotation / snapInterval) * snapInterval;
      }

      // Normalize to 0-360
      newRotation = ((newRotation % 360) + 360) % 360;

      setRotationAngle(Math.round(newRotation));
      onLayoutChange(overlay.id, { rotation: newRotation });
    };

    const handleMouseUp = () => {
      setRotationAngle(null);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpacePressed) return;
    setIsEditing(true);
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditing(false);
    const newContent = e.currentTarget.innerHTML;
    if (newContent !== overlay.content) {
      onContentChange(overlay.id, newContent);
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.textContent === "Edit Text...") {
      e.currentTarget.innerHTML = "";
      onContentChange(overlay.id, "");
    }
  };

  const getToolbarPosition = () => {
    if (!rndRef.current || !sceneSize.width) {
      return { x: 0, y: 0 };
    }
    const selfElement = rndRef.current.getSelfElement();
    if (!selfElement) return { x: 0, y: 0 };

    const rect = selfElement.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top;

    return { x, y };
  };

  return (
    <>
      <Rnd
        ref={rndRef}
        scale={1}
        size={{ width: widthPx, height: heightPx }}
        position={{ x: xPx, y: yPx }}
        minWidth={80}
        minHeight={40}
        disableDragging={
          isSpacePressed ||
          isEditing ||
          sceneSize.width <= 0 ||
          sceneSize.height <= 0
        }
        enableResizing={
          !isSpacePressed &&
            !isEditing &&
            sceneSize.width > 0 &&
            sceneSize.height > 0
            ? {
              top: true,
              right: true,
              bottom: true,
              left: true,
              topRight: false, // Disabled to prevent overlap with close button
              bottomRight: true,
              bottomLeft: true,
              topLeft: true,
            }
            : false
        }
        onDragStart={() => {
          onInternalDragStart();
          onSelect(overlay.id);
          setIsDragging(true);
        }}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStart={() => {
          setIsDragging(true);
          setIsResizing(true);
        }}
        onResizeStop={handleResizeStop}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(overlay.id);
        }}
        onDoubleClick={handleDoubleClick}
        bounds="parent"
        className={cn(
          "group pointer-events-auto will-change-transform transition-colors duration-200"
        )}
        style={{
          zIndex: overlay.layout.zIndex,
        }}
        dragHandleClassName="drag-handle"
        cancel="button, textarea, .rotate-handle, .close-button"
      >
        <div
          className={cn(
            "w-full h-full relative drag-handle",
            (isDragging || isResizing) && "opacity-50",
            isSelected
              ? "border-2 border-primary border-dashed"
              : "border-2 border-transparent hover:border-primary/50 border-dashed"
          )}
          style={{
            transform: `rotate(${overlay.layout.rotation || 0}deg)`,
            transformOrigin: "center center",
            cursor: isEditing ? "text" : "move",
          }}
        >
          {isSelected && !isEditing && (
            <div
              className="absolute top-1 left-1/2 -translate-x-1/2 text-primary/60 pointer-events-none"
              style={{ zIndex: "var(--z-draggable-element-hover)" }}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          {isEditing ? (
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className={cn(
                "w-full h-full overflow-y-auto outline-none focus:ring-2 focus:ring-primary/50 rounded",
                overlay.style.layers && "opacity-50" // Dim if editing a complex style
              )}
              style={{
                fontFamily: overlay.style.fontFamily,
                fontSize: `${overlay.style.fontSize}px`,
                color: overlay.style.color,
                backgroundColor: overlay.style.backgroundColor || "transparent",
                fontWeight: overlay.style.bold ? "bold" : "normal",
                fontStyle: overlay.style.italic ? "italic" : "normal",
                textDecoration: overlay.style.underline ? "underline" : "none",
                border: overlay.style.border
                  ? `${overlay.style.borderWidth}px solid ${overlay.style.borderColor}`
                  : "none",
                textShadow:
                  overlay.style.textShadow ||
                  (overlay.style.shadow ? "0 2px 4px rgba(0,0,0,0.5)" : "none"),
                WebkitTextStroke: overlay.style.outline
                  ? "1px currentColor"
                  : "none",
                letterSpacing: overlay.style.letterSpacing || "normal",
                padding: overlay.style.padding || "0.5em",
                textAlign: (overlay.style as any).textAlign || "left",
                listStylePosition: "inside",
                ...(overlay.style.gradient && {
                  background: overlay.style.gradient,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }),
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              dangerouslySetInnerHTML={{ __html: overlay.content }}
            />
          ) : (
            // --- NON-EDITING MODE (conditionally render new or old) ---
            <div className="w-full h-full rounded cursor-move">
              {overlay.style.layers ? (
                // --- 2. USE NEW RENDERER ---
                <MultiLayerTextRenderer
                  text={overlay.content || "Double-click to edit"}
                  layers={overlay.style.layers}
                />
              ) : (
                // --- 3. FALLBACK TO OLD RENDERER ---
                <div
                  className="w-full h-full whitespace-pre-wrap break-words p-2"
                  style={{
                    fontFamily: overlay.style.fontFamily,
                    fontSize: `${overlay.style.fontSize}px`,
                    color: overlay.style.color,
                    backgroundColor:
                      overlay.style.backgroundColor || "transparent",
                    fontWeight: overlay.style.bold ? "bold" : "normal",
                    fontStyle: overlay.style.italic ? "italic" : "normal",
                    textDecoration: overlay.style.underline
                      ? "underline"
                      : "none",
                    border: overlay.style.border
                      ? `${overlay.style.borderWidth}px solid ${overlay.style.borderColor}`
                      : "none",
                    textShadow:
                      overlay.style.textShadow ||
                      (overlay.style.shadow
                        ? "0 2px 4px rgba(0,0,0,0.5)"
                        : "none"),
                    WebkitTextStroke: overlay.style.outline
                      ? "1px currentColor"
                      : "none",
                    letterSpacing: overlay.style.letterSpacing || "normal",
                    padding: overlay.style.padding || "0",
                    minWidth: "50px",
                    textAlign: (overlay.style as any).textAlign || "left",
                    listStylePosition: "inside",
                    ...(overlay.style.gradient && {
                      background: overlay.style.gradient,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }),
                  }}
                  dangerouslySetInnerHTML={{
                    __html: overlay.content || "Double-click to edit",
                  }}
                />
              )}
            </div>
          )}

          {isSelected && !isEditing && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(overlay.id);
                }}
                title="Remove Text"
                className="close-button absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all hover:scale-110 pointer-events-auto cursor-pointer"
                style={{
                  transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
                  zIndex: 99999,
                }}
              >
                <X className="w-4 h-4 pointer-events-none" />
              </button>
              {/* Live Angle Display */}
              {rotationAngle !== null && (
                <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 bg-black/90 text-white px-2 py-1 rounded text-xs font-medium pointer-events-none">
                  {rotationAngle}°
                </div>
              )}
              {/* Rotation Handle */}
              <div
                onMouseDown={handleRotationStart}
                className="rotate-handle absolute -bottom-3 -left-3 flex items-center justify-center cursor-alias"
                style={{
                  width: "40px", // 🔥 Bigger hit-area
                  height: "40px",
                  transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
                  zIndex: "var(--z-draggable-element-active)",
                  backgroundColor: "transparent", // Keep it invisible
                }}
              >
                <div
                  className="bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                  style={{
                    width: "24px", // Visible icon size stays the same
                    height: "24px",
                  }}
                >
                  <RotateCcw className="w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </>
          )}
        </div>
      </Rnd>

      {isSelected && !isEditing && (
        <div
          className="pointer-events-auto"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            zIndex: "var(--z-text-toolbar, 9999)",
          }}
        >
          <TextEditingToolbar
            overlay={overlay}
            onStyleChange={onStyleChange}
            position={getToolbarPosition()}
            containerRef={containerRef}
          />
        </div>
      )}
    </>
  );
};
