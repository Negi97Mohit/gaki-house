import React, { useState, useRef, useLayoutEffect, useCallback } from "react";
import { cn } from "@caption-cam/core/lib/utils";
import { TextOverlayState } from "@caption-cam/core/types/caption";
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
  viewportScale?: number;
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
  viewportScale = 1,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  const updateSize = useCallback(
    (element: HTMLElement) => {
      if (!element || sceneSize.width === 0 || sceneSize.height === 0) return;

      const hasBackground =
        overlay.style.backgroundColor &&
        overlay.style.backgroundColor !== "transparent";

      if (hasBackground) {
        return;
      }

      const originalWidth = element.style.width;
      const originalHeight = element.style.height;
      const originalWhiteSpace = element.style.whiteSpace;

      element.style.width = "max-content";
      element.style.height = "auto";
      element.style.whiteSpace = "pre-wrap";

      const scrollWidth = element.scrollWidth;
      const scrollHeight = element.scrollHeight;

      element.style.width = originalWidth;
      element.style.height = originalHeight;
      element.style.whiteSpace = originalWhiteSpace;

      const measuredWidth = scrollWidth + 10;
      const measuredHeight = scrollHeight + 4;

      const newWidthPct = (measuredWidth / sceneSize.width) * 100;
      const newHeightPct = (measuredHeight / sceneSize.height) * 100;

      const currentWidth = overlay.layout.size.width;
      const currentHeight = overlay.layout.size.height;

      const widthDiff = Math.abs(newWidthPct - currentWidth);
      const heightDiff = Math.abs(newHeightPct - currentHeight);

      if (widthDiff > 0.1 || heightDiff > 0.1) {
        const widthDelta = newWidthPct - currentWidth;
        const heightDelta = newHeightPct - currentHeight;

        const newX = overlay.layout.position.x - widthDelta / 2;
        const newY = overlay.layout.position.y - heightDelta / 2;

        onLayoutChange(overlay.id, {
          size: { width: newWidthPct, height: newHeightPct },
          position: { x: newX, y: newY },
        });
      }
    },
    [
      sceneSize,
      overlay.layout,
      overlay.id,
      onLayoutChange,
      overlay.style.backgroundColor,
    ]
  );

  useLayoutEffect(() => {
    const elementToMeasure = isEditing ? editorRef.current : contentRef.current;
    if (elementToMeasure) {
      updateSize(elementToMeasure);
    }
  }, [
    overlay.content,
    overlay.style,
    isEditing,
    sceneSize.width,
    sceneSize.height,
    overlay.id,
    updateSize,
  ]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    updateSize(e.currentTarget);
  };

  const handleBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    setIsEditing(false);
    const newContent = e.currentTarget.innerHTML;
    if (newContent !== overlay.content) {
      onContentChange(overlay.id, newContent);
    }
  };

  const getStyleObject = () => {
    const baseStyle: React.CSSProperties = {
      fontFamily: overlay.style.fontFamily,
      fontSize: `${overlay.style.fontSize * (scale || 1)}px`,
      fontWeight: overlay.style.bold ? "bold" : "normal",
      fontStyle: overlay.style.italic ? "italic" : "normal",
      textDecoration: overlay.style.underline ? "underline" : "none",
      textAlign: (overlay.style as any).textAlign || "left",
      letterSpacing: (overlay.style as any).letterSpacing || "0px",
      textShadow: overlay.style.textShadow
        ? overlay.style.textShadow.replace(
          /(-?\d*\.?\d+)px/g,
          (match, p1) => `${parseFloat(p1) * (scale || 1)}px`
        )
        : undefined,
    };

    // Apply gradient to text if present
    if (overlay.style.gradient) {
      return {
        ...baseStyle,
        backgroundImage: overlay.style.gradient,
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
      };
    }

    // Otherwise use solid color for text
    return {
      ...baseStyle,
      color: overlay.style.color,
      // backgroundColor is NOT applied to text elements
      // It's applied to the parent container instead (see below)
    };
  };

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
        viewportScale={viewportScale}
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
              onInput={handleInput}
              onBlur={handleBlur}
              className="w-full h-full outline-none focus:ring-0 whitespace-pre-wrap break-words p-1 bg-transparent"
              style={{
                ...getStyleObject(),
                minWidth: "1em",
                minHeight: "1em",
              }}
              dangerouslySetInnerHTML={{ __html: overlay.content }}
            />
          ) : (
            <div
              ref={contentRef}
              className="w-full h-full"
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                // Use background property to support both solid colors and gradients
                background: overlay.style.backgroundColor || "transparent",
                borderRadius: `${(overlay.style.borderRadius || 0) * (scale || 1)}px`,
              }}
            >
              {overlay.style.layers ? (
                <MultiLayerTextRenderer
                  text={
                    overlay.content?.replace(/<[^>]+>/g, "") ||
                    "Double-click to edit"
                  }
                  layers={overlay.style.layers}
                  scale={scale || 1}
                  fontSize={overlay.style.fontSize}
                  color={overlay.style.color}
                  letterSpacing={(overlay.style as any).letterSpacing} // Pass the indent/spacing
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
            onEditClick={() => setIsEditing(true)}
          />
        </div>
      )}
    </>
  );
};

export const DraggableTextOverlay = React.memo(DraggableTextOverlayComponent);
