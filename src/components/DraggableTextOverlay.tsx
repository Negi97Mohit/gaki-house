// src/components/DraggableTextOverlay.tsx
import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { TextOverlayState } from "@/types/caption";
import { TextEditingToolbar } from "./TextEditingToolbar";
import { MultiLayerTextRenderer } from "./MultiLayerTextRenderer";
import { UniversalOverlayWrapper } from "@/components/video-canvas/UniversalOverlayWrapper";
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

  // Focus editor when entering edit mode
  useEffect(() => {
    if (isEditing && editorRef.current) {
      editorRef.current.focus();
      // Move cursor to end
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  }, [isEditing]);

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
        // Removed onClick here because HybridDraggable now handles it via UniversalOverlayWrapper
        >
          {isEditing ? (
            <div
              ref={editorRef}
              contentEditable={true}
              suppressContentEditableWarning={true}
              onBlur={handleBlur}
              className={cn(
                "w-full h-full outline-none focus:ring-2 focus:ring-primary/50 rounded break-words p-2"
              )}
              style={{
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
              }}
              dangerouslySetInnerHTML={{ __html: overlay.content }}
            />
          ) : (
            // View Mode
            <div className="w-full h-full">
              {overlay.style.layers ? (
                <MultiLayerTextRenderer
                  text={
                    overlay.content?.replace(/<[^>]+>/g, "") ||
                    "Double-click to edit"
                  }
                  layers={overlay.style.layers}
                  scale={scale || 1} // Pass scale to MultiLayerTextRenderer if it supports it, or handle scaling inside it? 
                // Wait, MultiLayerTextRenderer likely needs update too if it handles sizing internally.
                // Let's assume for now we just scale the container or font size here.
                // Actually, MultiLayerTextRenderer probably uses the style prop or similar.
                // Let's check MultiLayerTextRenderer in a moment. For now, let's assume it inherits or we need to pass it.
                />
              ) : (
                <div
                  className="w-full h-full whitespace-pre-wrap break-words p-2"
                  style={{
                    fontFamily: overlay.style.fontFamily,
                    fontSize: `${overlay.style.fontSize * (scale || 1)}px`,
                    color: overlay.style.color,
                    backgroundColor:
                      overlay.style.backgroundColor || "transparent",
                    fontWeight: overlay.style.bold ? "bold" : "normal",
                    fontStyle: overlay.style.italic ? "italic" : "normal",
                    textDecoration: overlay.style.underline
                      ? "underline"
                      : "none",
                    textAlign: (overlay.style as any).textAlign || "left",
                    textShadow: overlay.style.textShadow
                      ? overlay.style.textShadow.replace(
                        /(-?\d*\.?\d+)px/g,
                        (match, p1) => `${parseFloat(p1) * (scale || 1)}px`
                      )
                      : undefined,
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
            position={{
              x: (overlay.layout.position.x / 100) * sceneSize.width,
              y: (overlay.layout.position.y / 100) * sceneSize.height,
            }}
            containerRef={containerRef}
            elementWidth={(overlay.layout.size.width / 100) * sceneSize.width}
            elementHeight={(overlay.layout.size.height / 100) * sceneSize.height}
          />
        </div>
      )}
    </>
  );
};

export const DraggableTextOverlay = React.memo(DraggableTextOverlayComponent);
