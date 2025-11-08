// src/components/DraggableTextOverlay.tsx - ENHANCED VERSION (UPDATED)
import React, { useState, useRef, useCallback } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { TextOverlayState } from "@/types/caption";
import { X, RotateCcw, GripVertical } from "lucide-react";
import { TextEditingToolbar } from "./TextEditingToolbar";

const calculatePercentagePosition = (
  pixelX: number,
  pixelY: number,
  elementWidthPx: number,
  elementHeightPx: number,
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
  const centerXOriginal = pixelX + elementWidthPx / 2;
  const centerYOriginal = pixelY + elementHeightPx / 2;
  const percentageX = (centerXOriginal / containerSize.width) * 100;
  const percentageY = (centerYOriginal / containerSize.height) * 100;
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
  containerSize: { width: number; height: number };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  isSpacePressed: boolean;
  containerRef?: React.RefObject<HTMLElement>;
}

export const DraggableTextOverlay: React.FC<DraggableTextOverlayProps> = ({
  overlay,
  onLayoutChange,
  onStyleChange,
  onContentChange,
  onRemove,
  containerSize,
  isSelected,
  onSelect,
  onInternalDragStart,
  onInternalDragStop,
  isSpacePressed,
  containerRef,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  // MODIFIED: This is now a div, not a textarea
  const editorRef = useRef<HTMLDivElement>(null);
  const rndRef = useRef<Rnd | null>(null);

  const widthPx =
    containerSize.width > 0
      ? (containerSize.width * overlay.layout.size.width) / 100
      : 200;
  const heightPx =
    containerSize.height > 0
      ? (containerSize.height * overlay.layout.size.height) / 100
      : "auto";
  const xPx =
    containerSize.width > 0
      ? (containerSize.width * overlay.layout.position.x) / 100 - widthPx / 2
      : 0;
  const yPx =
    containerSize.height > 0
      ? (containerSize.height * overlay.layout.position.y) / 100 -
        (typeof heightPx === "number" ? heightPx / 2 : 50)
      : 0;

  const handleDragStop = useCallback(
    (e: any, d: { x: number; y: number }) => {
      onInternalDragStop();
      setIsDragging(false);
      if (
        containerSize.width <= 0 ||
        containerSize.height <= 0 ||
        !rndRef.current
      )
        return;

      const currentElement = rndRef.current.getSelfElement();
      if (!currentElement) return;
      const currentWidthPx = currentElement.offsetWidth;
      const currentHeightPx = currentElement.offsetHeight;

      // Clamp position to stay within bounds
      const clampedX = Math.max(0, Math.min(d.x, containerSize.width - currentWidthPx));
      const clampedY = Math.max(0, Math.min(d.y, containerSize.height - currentHeightPx));

      const newPositionPercent = calculatePercentagePosition(
        clampedX,
        clampedY,
        currentWidthPx,
        currentHeightPx,
        containerSize
      );
      if (newPositionPercent) {
        onLayoutChange(overlay.id, { position: newPositionPercent });
      }
    },
    [onInternalDragStop, containerSize, onLayoutChange, overlay.id]
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
      if (containerSize.width <= 0 || containerSize.height <= 0) return;

      const newWidthPx = parseInt(ref.style.width, 10);
      const newHeightPx = parseInt(ref.style.height, 10);

      const newPositionPercent = calculatePercentagePosition(
        pos.x,
        pos.y,
        newWidthPx,
        newHeightPx,
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
    [onInternalDragStop, containerSize, onLayoutChange, overlay.id]
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
      onLayoutChange(overlay.id, { rotation: initialRotation + angleDiff });
    };
    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSpacePressed) return; // Prevent editing when panning
    setIsEditing(true);
    setTimeout(() => editorRef.current?.focus(), 0);
  };

  // MODIFIED: This now reads innerHTML from the contentEditable div
  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditing(false);
    const newContent = e.currentTarget.innerHTML;
    if (newContent !== overlay.content) {
      onContentChange(overlay.id, newContent);
    }
  };

  // ADDED: Handle placeholder “Edit Text...”
  const handleFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.currentTarget.textContent === "Edit Text...") {
      e.currentTarget.innerHTML = "";
      onContentChange(overlay.id, ""); // Clear the content
    }
  };

  const getToolbarPosition = () => {
    if (!rndRef.current || !containerSize.width || !containerRef?.current) {
      return { x: 0, y: 0 };
    }
    const selfElement = rndRef.current.getSelfElement();
    if (!selfElement) return { x: 0, y: 0 };

    const rect = selfElement.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const x = rect.left - containerRect.left + rect.width / 2;
    const y = rect.top - containerRect.top;

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
          containerSize.width <= 0 ||
          containerSize.height <= 0
        }
        enableResizing={
          !isSpacePressed &&
          !isEditing &&
          containerSize.width > 0 &&
          containerSize.height > 0
            ? {
                top: true,
                right: true,
                bottom: true,
                left: true,
                topRight: true,
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
        bounds="parent" // <-- ADD THIS
        className={cn(
          "group pointer-events-auto transition-colors duration-200",
          isSelected
            ? "border-2 border-primary border-dashed"
            : "border-2 border-transparent hover:border-primary/50 border-dashed"
        )}
        style={{
          zIndex: overlay.layout.zIndex,
          transform: `rotate(${overlay.layout.rotation || 0}deg)`,
        }}
        dragHandleClassName="drag-handle"
        cancel="button, textarea, .rotate-handle"
      >
        <div
          className={cn(
            "w-full h-full relative drag-handle",
            (isDragging || isResizing) && "opacity-50"
          )}
          style={{
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
            // --- MODIFIED: Replaced <textarea> with contentEditable <div> ---
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={handleBlur}
              onFocus={handleFocus}
              className="w-full h-full overflow-y-auto outline-none focus:ring-2 focus:ring-primary/50 rounded"
              style={{
                fontFamily: overlay.style.fontFamily,
                fontSize: `${overlay.style.fontSize}px`,
                color: overlay.style.color,
                backgroundColor: "transparent",
                border: overlay.style.border
                  ? `${overlay.style.borderWidth}px solid ${overlay.style.borderColor}`
                  : "none",
                textShadow: overlay.style.shadow
                  ? "0 2px 4px rgba(0,0,0,0.5)"
                  : "none",
                padding: "0.5em",
                textAlign: (overlay.style as any).textAlign || "left",
                listStylePosition: "inside",
              }}
              onKeyDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              dangerouslySetInnerHTML={{ __html: overlay.content }}
            />
          ) : (
            // --- MODIFIED: This div now renders inside a styled container ---
            <div className="w-full h-full p-2 rounded">
              <div
                className="w-full h-full whitespace-pre-wrap break-words cursor-move"
                style={{
                  fontFamily: overlay.style.fontFamily,
                  fontSize: `${overlay.style.fontSize}px`,
                  color: overlay.style.color,
                  backgroundColor: overlay.style.backgroundColor,
                  border: overlay.style.border
                    ? `${overlay.style.borderWidth}px solid ${overlay.style.borderColor}`
                    : "none",
                  textShadow: overlay.style.shadow
                    ? "0 2px 4px rgba(0,0,0,0.5)"
                    : "none",
                  minWidth: "50px",
                  textAlign: (overlay.style as any).textAlign || "left",
                  listStylePosition: "inside",
                }}
                dangerouslySetInnerHTML={{
                  __html: overlay.content || "Double-click to edit",
                }}
              />
            </div>
          )}

          {isSelected && !isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(overlay.id);
              }}
              title="Remove Text"
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all hover:scale-110"
              style={{
                transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
                zIndex: "var(--z-draggable-element-active)",
              }}
            >
              <X className="w-4 h-4 pointer-events-none" />
            </button>
          )}
        </div>
      </Rnd>

      {isSelected && !isEditing && containerRef && (
        <TextEditingToolbar
          overlay={overlay}
          onStyleChange={onStyleChange}
          position={getToolbarPosition()}
          containerRef={containerRef}
        />
      )}
    </>
  );
};
