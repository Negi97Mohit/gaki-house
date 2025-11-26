// src/components/DraggableTextOverlay.tsx
import React, { useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { TextOverlayState } from "@/types/caption";
import { X, RotateCcw, GripVertical } from "lucide-react";
import { TextEditingToolbar } from "./TextEditingToolbar";
import { MultiLayerTextRenderer } from "./MultiLayerTextRenderer";
import { SmartDraggable } from "@/components/video-canvas/SmartDraggable";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";

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
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;
  scale: number;
}

// Separate component for Memoization
const DraggableTextOverlayComponent: React.FC<DraggableTextOverlayProps> = ({
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
  scale,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  // Track dragging state locally to hide toolbar during movement
  const [isDragging, setIsDragging] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  const handleRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const element = e.currentTarget.closest(".group");
    if (!element) return;

    const box = element.getBoundingClientRect();
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

      if (!moveEvent.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15;
      }
      onLayoutChange(overlay.id, { rotation: newRotation });
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

  const getToolbarPosition = () => {
    const x =
      (overlay.layout.position.x / 100) * sceneSize.width +
      ((overlay.layout.size.width / 100) * sceneSize.width) / 2;
    const y = (overlay.layout.position.y / 100) * sceneSize.height;
    return { x, y };
  };

  return (
    <>
      <SmartDraggable
        id={overlay.id}
        position={overlay.layout.position}
        size={overlay.layout.size}
        containerSize={sceneSize}
        zIndex={overlay.layout.zIndex}
        rotation={overlay.layout.rotation}
        isSelected={isSelected}
        onSelect={onSelect}
        scale={scale}
        onDragStart={() => {
          setIsDragging(true); // Hide toolbar
          if (!isEditing && !isSpacePressed) onInternalDragStart();
        }}
        onDragStop={() => {
          setIsDragging(false); // Show toolbar
          onInternalDragStop();
        }}
        onChange={(id, layout) => {
          onLayoutChange(id, {
            ...(layout.position && { position: layout.position }),
            ...(layout.size && { size: layout.size }),
          });
        }}
        allOverlays={allOverlays}
        onSnapGuidesChange={onSnapGuidesChange}
        enableResizing={!isEditing && !isSpacePressed}
        className={cn(
          "group transition-colors duration-200",
          isEditing && "cursor-text pointer-events-auto"
        )}
        cancel={isEditing ? "*" : ".close-button, .rotate-handle"}
      >
        <div
          className={cn(
            "w-full h-full relative",
            isSelected
              ? "border-2 border-primary border-dashed"
              : "border-2 border-transparent hover:border-primary/50 border-dashed"
          )}
          onDoubleClick={handleDoubleClick}
          // CRITICAL FIX: Stop click propagation to prevent deselecting when releasing drag or clicking
          onClick={(e) => e.stopPropagation()}
          style={{ cursor: isEditing ? "text" : "grab" }}
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
              className={cn(
                "w-full h-full overflow-auto outline-none focus:ring-2 focus:ring-primary/50 rounded",
                overlay.style.layers && "opacity-50"
              )}
              style={{
                fontFamily: overlay.style.fontFamily,
                fontSize: `${overlay.style.fontSize}px`,
                color: overlay.style.color,
                backgroundColor: overlay.style.backgroundColor || "transparent",
                fontWeight: overlay.style.bold ? "bold" : "normal",
                fontStyle: overlay.style.italic ? "italic" : "normal",
                textDecoration: overlay.style.underline ? "underline" : "none",
                textAlign: (overlay.style as any).textAlign || "left",
              }}
              dangerouslySetInnerHTML={{ __html: overlay.content }}
            />
          ) : (
            <div className="w-full h-full rounded cursor-move overflow-hidden">
              {overlay.style.layers ? (
                <MultiLayerTextRenderer
                  text={overlay.content || "Double-click to edit"}
                  layers={overlay.style.layers}
                />
              ) : (
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
                    textAlign: (overlay.style as any).textAlign || "left",
                    textShadow: overlay.style.textShadow,
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
                className="close-button absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all hover:scale-110 pointer-events-auto cursor-pointer"
                style={{
                  transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
                }}
              >
                <X className="w-4 h-4 pointer-events-none" />
              </button>

              <div
                onMouseDown={handleRotationStart}
                className="rotate-handle absolute -bottom-3 -left-3 flex items-center justify-center cursor-alias"
                style={{
                  width: "24px",
                  height: "24px",
                  transform: `rotate(-${overlay.layout.rotation || 0}deg)`,
                }}
              >
                <div className="bg-primary text-primary-foreground rounded-full w-full h-full flex items-center justify-center">
                  <RotateCcw className="w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </>
          )}
        </div>
      </SmartDraggable>

      {/* Hide toolbar while dragging to prevent visual lag */}
      {isSelected && !isEditing && !isDragging && (
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

// Memoize to prevent re-renders when other elements update
export const DraggableTextOverlay = React.memo(DraggableTextOverlayComponent);
