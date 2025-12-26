import React, { useState, useRef, useLayoutEffect } from "react";
import { cn } from "@/shared/lib/utils";
import { TextOverlayState } from "@/types/caption";
import { TextEditingToolbar } from "./TextEditingToolbar";
import { MultiLayerTextRenderer } from "./MultiLayerTextRenderer";
import { UniversalOverlayWrapper } from "@/features/canvas/ui/UniversalOverlayWrapper";
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
  allOverlays,
  onSnapGuidesChange,
  scale,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus editor when entering edit mode
  useLayoutEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

  // PHASE 2 FIX: Auto-Resize & Center-Pivot Logic
  // This ensures the container always fits the text tightly ("fit-content")
  // and maintains the center position when the size changes ("No Jumping").
  useLayoutEffect(() => {
    // Determine which element to measure (editor or view mode renderer)
    const elementToMeasure = isEditing ? editorRef.current : contentRef.current;

    if (elementToMeasure && sceneSize.width > 0 && sceneSize.height > 0) {
      // 1. Measure the natural size of the content
      const { scrollWidth, scrollHeight } = elementToMeasure;

      // Add a small buffer for borders/shadows/cursor
      const measuredWidth = scrollWidth + 4;
      const measuredHeight = scrollHeight + 4;

      // 2. Convert to percentages
      const newWidthPct = (measuredWidth / sceneSize.width) * 100;
      const newHeightPct = (measuredHeight / sceneSize.height) * 100;

      // 3. Check if size has changed significantly (> 0.5%) to avoid loops
      const currentWidth = overlay.layout.size.width;
      const currentHeight = overlay.layout.size.height;

      const widthDiff = Math.abs(newWidthPct - currentWidth);
      const heightDiff = Math.abs(newHeightPct - currentHeight);

      if (widthDiff > 0.1 || heightDiff > 0.1) {
        // 4. Center-Pivot Calculation:
        // Adjust X/Y so the center point remains stationary
        const widthDelta = newWidthPct - currentWidth;
        const heightDelta = newHeightPct - currentHeight;

        const newX = overlay.layout.position.x - widthDelta / 2;
        const newY = overlay.layout.position.y - heightDelta / 2;

        // 5. Update Layout
        onLayoutChange(overlay.id, {
          size: { width: newWidthPct, height: newHeightPct },
          position: { x: newX, y: newY },
        });
      }
    }
  }, [
    overlay.content,
    overlay.style,
    isEditing,
    sceneSize.width,
    sceneSize.height,
    // Dependency on ID ensures we check when switching items
    overlay.id,
  ]);

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditing(false);
    const newContent = e.currentTarget.innerHTML;
    if (newContent !== overlay.content) {
      onContentChange(overlay.id, newContent);
    }
  };

  const getStyleObject = () => ({
    fontFamily: overlay.style.fontFamily,
    fontSize: `${overlay.style.fontSize * (scale || 1)}px`,
    color: overlay.style.color,
    backgroundColor: overlay.style.backgroundColor || "transparent",
    fontWeight: overlay.style.bold ? "bold" : "normal",
    fontStyle: overlay.style.italic ? "italic" : "normal",
    textDecoration: overlay.style.underline ? "underline" : "none",
    textAlign: (overlay.style as any).textAlign || "left",
    textShadow: overlay.style.textShadow
      ? overlay.style.textShadow.replace(
          /(-?\d*\.?\d+)px/g,
          (match, p1) => `${parseFloat(p1) * (scale || 1)}px`
        )
      : undefined,
  });

  return (
    <>
      <UniversalOverlayWrapper
        id={overlay.id}
        type="text"
        position={overlay.layout.position}
        size={overlay.layout.size}
        rotation={overlay.layout.rotation}
        zIndex={overlay.layout.zIndex}
        containerSize={sceneSize}
        isSelected={isSelected}
        isEditing={isEditing}
        onSelect={onSelect}
        onRemove={onRemove}
        onCommit={(id, layout) => {
          onLayoutChange(id, {
            ...(layout.position && { position: layout.position }),
            ...(layout.size && { size: layout.size }),
            ...(layout.rotation !== undefined && { rotation: layout.rotation }),
          });
        }}
        onDoubleClick={() => setIsEditing(true)}
        allOverlays={allOverlays}
        onSnapGuidesChange={onSnapGuidesChange}
      >
        <div
          className={cn(
            "w-full h-full",
            isEditing ? "cursor-text select-text" : "cursor-default"
          )}
        >
          {isEditing ? (
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={handleBlur}
              className="w-full h-full outline-none focus:ring-0 whitespace-pre-wrap break-words p-1 bg-transparent"
              style={{
                ...getStyleObject(),
                // Use min-width to prevent collapse to 0
                minWidth: "1em",
                minHeight: "1em",
              }}
              dangerouslySetInnerHTML={{ __html: overlay.content }}
            />
          ) : (
            // View Mode
            <div
              ref={contentRef}
              className="w-full h-full"
              // Ensure container fits content for measurement
              style={{ width: "fit-content", height: "fit-content" }}
            >
              {overlay.style.layers ? (
                <MultiLayerTextRenderer
                  text={
                    overlay.content?.replace(/<[^>]+>/g, "") ||
                    "Double-click to edit"
                  }
                  layers={overlay.style.layers}
                  scale={scale || 1}
                  animation={(overlay.style as any).animation}
                  animationCSS={(overlay.style as any).animationCSS}
                />
              ) : (
                <div
                  className="w-full h-full whitespace-pre-wrap break-words p-1"
                  style={{
                    ...getStyleObject(),
                    display: "flex",
                    alignItems: "center",
                    justifyContent:
                      (overlay.style as any).textAlign || "flex-start",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: overlay.content || "Double-click to edit",
                  }}
                />
              )}
            </div>
          )}
        </div>
      </UniversalOverlayWrapper>

      {/* Toolbar */}
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
            onLayoutChange={onLayoutChange}
            position={{
              x: (overlay.layout.position.x / 100) * sceneSize.width,
              y: (overlay.layout.position.y / 100) * sceneSize.height,
            }}
            containerRef={containerRef}
            elementWidth={(overlay.layout.size.width / 100) * sceneSize.width}
            elementHeight={
              (overlay.layout.size.height / 100) * sceneSize.height
            }
          />
        </div>
      )}
    </>
  );
};

export const DraggableTextOverlay = React.memo(DraggableTextOverlayComponent);
