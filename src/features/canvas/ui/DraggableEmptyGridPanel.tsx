import React, { useCallback } from "react";
import { X } from "lucide-react";
import { EmptyGridPanelState, CanvasSectionState } from "@/types/caption";
import { HybridDraggable } from "./HybridDraggable";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { GridSectionRenderer } from "@/features/layouts/ui/GridSectionRenderer";

interface DraggableEmptyGridPanelProps {
  overlay: EmptyGridPanelState;
  sceneSize: { width: number; height: number };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onLayoutChange: (
    id: string,
    layout: Partial<EmptyGridPanelState["layout"]>,
  ) => void;
  onContentChange?: (
    id: string,
    content: CanvasSectionState["content"],
  ) => void;
  onGridAssetSelect?: (panelId: string, asset: AssetResult) => void;
  onInternalDragStart?: () => void;
  onInternalDragStop?: () => void;
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;
  viewportScale?: number;
  cameraStream?: MediaStream | null;
  screenStream?: MediaStream | null;
  videoDevices?: MediaDeviceInfo[];
  blankCanvasColor?: string;
}

export const DraggableEmptyGridPanel: React.FC<
  DraggableEmptyGridPanelProps
> = ({
  overlay,
  sceneSize,
  isSelected,
  onSelect,
  onRemove,
  onLayoutChange,
  onContentChange,
  onGridAssetSelect,
  onInternalDragStart,
  onInternalDragStop,
  allOverlays = [],
  onSnapGuidesChange,
  viewportScale = 1,
  cameraStream,
  screenStream,
  videoDevices = [],
  blankCanvasColor = "#000000",
}) => {
  const { id, layout, style, content } = overlay;
  const hasContent = content && content.type !== "empty";

  const handleClear = useCallback(() => {
    onContentChange?.(id, { type: "empty" });
  }, [id, onContentChange]);

  const innerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: `${style?.borderRadius ?? 8}px`,
    opacity: style?.opacity ?? 1,
    position: "relative",
    boxSizing: "border-box",
    border: hasContent
      ? `1.5px solid rgba(255,255,255,0.15)`
      : `2px dashed ${style?.borderColor ?? "rgba(255,255,255,0.35)"}`,
    backgroundColor: hasContent
      ? "transparent"
      : (style?.backgroundColor ?? "rgba(255,255,255,0.04)"),
    backdropFilter: hasContent ? "none" : "blur(2px)",
    transition: "border-color 0.2s ease, background-color 0.2s ease",
    overflow: "hidden",
  };

  return (
    <HybridDraggable
      id={id}
      position={layout.position}
      size={layout.size}
      rotation={layout.rotation}
      zIndex={layout.zIndex}
      containerSize={sceneSize}
      viewportScale={viewportScale}
      isSelected={isSelected}
      allOverlays={allOverlays}
      onSnapGuidesChange={onSnapGuidesChange}
      onSelect={() => onSelect(id)}
      onCommit={(_id, changes) => {
        onLayoutChange(id, {
          ...(changes.position !== undefined && { position: changes.position }),
          ...(changes.size !== undefined && { size: changes.size }),
          ...(changes.rotation !== undefined && { rotation: changes.rotation }),
        });
      }}
    >
      <div className="group" style={innerStyle}>
        {/* We ripped out PanelContentView. Now mapping directly back to the unified GridSectionRenderer */}
        <GridSectionRenderer
          section={{ id, content: content || { type: "empty" } }}
          cameraStream={cameraStream}
          screenStream={screenStream}
          videoDevices={videoDevices}
          blankCanvasColor={blankCanvasColor}
          onSectionContentChange={(sectionId, newContent) =>
            onContentChange?.(sectionId, newContent)
          }
          onGridAssetSelect={(sectionId, asset) =>
            onGridAssetSelect?.(sectionId, asset)
          }
          forceInteractive={true} // Forces the Add UI to display even in nested/preview conditions
        />

        {hasContent && (
          <button
            aria-label="Clear panel content"
            onClick={(e) => {
              e.stopPropagation();
              handleClear();
            }}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              position: "absolute",
              bottom: 8,
              right: 8,
              padding: "2px 8px",
              borderRadius: 5,
              background: "rgba(0,0,0,0.65)",
              color: "rgba(255,255,255,0.85)",
              border: "1px solid rgba(255,255,255,0.2)",
              fontSize: 10,
              fontFamily: "Inter, sans-serif",
              fontWeight: 500,
              cursor: "pointer",
              zIndex: 50,
            }}
          >
            Clear
          </button>
        )}

        {/* SVG overlay decoration (only visible when empty) */}
        {!hasContent && (
          <>
            <svg
              aria-hidden="true"
              width="100%"
              height="100%"
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0.1,
                pointerEvents: "none",
              }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id={`egp-grid-${id}`}
                  width="24"
                  height="24"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 24 0 L 0 0 0 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="0.5"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#egp-grid-${id})`} />
            </svg>
            <div
              className="group-hover:opacity-0 transition-opacity pointer-events-none"
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  border: "1.5px solid rgba(255,255,255,0.3)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "rgba(255,255,255,0.5)",
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span
                style={{
                  fontSize: 10,
                  color: "rgba(255,255,255,0.4)",
                  fontFamily: "Inter, sans-serif",
                  fontWeight: 500,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                Add
              </span>
            </div>
          </>
        )}
      </div>

      {isSelected && (
        <button
          aria-label="Remove panel"
          title="Remove panel"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove(id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            top: 6,
            right: 6,
            width: 20,
            height: 20,
            borderRadius: "50%",
            background: "hsl(var(--destructive, 0 72% 51%))",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            boxShadow: "0 1px 6px rgba(0,0,0,0.5)",
          }}
        >
          <X style={{ width: 10, height: 10 }} />
        </button>
      )}
    </HybridDraggable>
  );
};
