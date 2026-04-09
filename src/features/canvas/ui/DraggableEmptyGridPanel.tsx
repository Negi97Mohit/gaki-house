// src/features/canvas/ui/DraggableEmptyGridPanel.tsx
import React, { useCallback } from "react";
import { X, Camera, Monitor, FileVideo, Image as ImageIcon, Palette } from "lucide-react";
import { EmptyGridPanelState, CanvasSectionState } from "@/types/caption";
import { HybridDraggable } from "./HybridDraggable";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";
import { EmptyGridSection } from "@/features/layouts/ui/grid-section/EmptyGridSection";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { CameraGridSection } from "@/features/layouts/ui/grid-section/CameraGridSection";
import { ScreenShareGridSection } from "@/features/layouts/ui/grid-section/ScreenShareGridSection";
import { FileRenderer } from "@/features/canvas/ui/DraggableFileViewer";

interface DraggableEmptyGridPanelProps {
  overlay: EmptyGridPanelState;
  sceneSize: { width: number; height: number };
  isSelected: boolean;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onLayoutChange: (
    id: string,
    layout: Partial<EmptyGridPanelState["layout"]>
  ) => void;
  onContentChange?: (id: string, content: CanvasSectionState["content"]) => void;
  onGridAssetSelect?: (panelId: string, asset: AssetResult) => void;
  onInternalDragStart?: () => void;
  onInternalDragStop?: () => void;
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;
  viewportScale?: number;
  // streams for live content
  cameraStream?: MediaStream | null;
  screenStream?: MediaStream | null;
  videoDevices?: MediaDeviceInfo[];
  blankCanvasColor?: string;
}

/** Lightweight content renderer — avoids GridSectionRenderer's hook-in-switch issue */
const PanelContentView: React.FC<{
  content: CanvasSectionState["content"];
  id: string;
  cameraStream?: MediaStream | null;
  screenStream?: MediaStream | null;
  videoDevices?: MediaDeviceInfo[];
  blankCanvasColor?: string;
  onClear: () => void;
}> = ({ content, id, cameraStream, screenStream, videoDevices = [], blankCanvasColor, onClear }) => {
  if (!content) return null;

  switch (content.type) {
    case "color": {
      const isGradient = content.color?.includes("gradient");
      return (
        <div
          className="w-full h-full"
          style={isGradient ? { background: content.color } : { backgroundColor: content.color || blankCanvasColor }}
        />
      );
    }

    case "image":
      return content.src
        ? <img src={content.src} alt="" className="w-full h-full object-cover" />
        : <PlaceholderBadge icon={<ImageIcon className="w-5 h-5" />} label="Image" onClear={onClear} />;

    case "camera":
      return cameraStream
        ? (
          <CameraGridSection
            sectionId={id}
            settings={content.settings as any}
            cameraStream={cameraStream}
            videoDevices={videoDevices}
            cameraShape={(content.settings as any)?.cameraShape}
          />
        )
        : <PlaceholderBadge icon={<Camera className="w-5 h-5" />} label="Camera" onClear={onClear} />;

    case "screen": {
      const stream = screenStream;
      return stream
        ? <ScreenShareGridSection stream={stream} cameraStream={cameraStream} displayMode="cover" />
        : <PlaceholderBadge icon={<Monitor className="w-5 h-5" />} label="Screen Share" onClear={onClear} />;
    }

    case "file":
      if (content.url && content.fileType) {
        const fakeOverlay: any = {
          id,
          fileUrl: content.url,
          fileType: content.fileType,
          fileName: content.name || "File",
          file: null,
          layout: { position: { x: 0, y: 0 }, size: { width: 100, height: 100 }, zIndex: 0, rotation: 0 },
        };
        return (
          <div className="w-full h-full flex items-center justify-center">
            <FileRenderer overlay={fakeOverlay} />
          </div>
        );
      }
      return <PlaceholderBadge icon={<FileVideo className="w-5 h-5" />} label="File" onClear={onClear} />;

    default:
      return null;
  }
};

const PlaceholderBadge: React.FC<{ icon: React.ReactNode; label: string; onClear: () => void }> = ({ icon, label, onClear }) => (
  <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-black/30">
    <div className="text-white/50">{icon}</div>
    <span className="text-[11px] font-medium text-white/50 tracking-wider uppercase">{label}</span>
    <button
      className="mt-1 px-3 py-1 text-[10px] rounded-md bg-white/10 text-white/60 hover:bg-white/20 transition-colors border border-white/10"
      onClick={(e) => { e.stopPropagation(); onClear(); }}
      onPointerDown={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      Clear
    </button>
  </div>
);

export const DraggableEmptyGridPanel: React.FC<DraggableEmptyGridPanelProps> = ({
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

  // Inner wrapper: NO overflow hidden so the delete button (in HybridDraggable's layer) stays visible
  const innerStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    borderRadius: `${style?.borderRadius ?? 8}px`,
    opacity: style?.opacity ?? 1,
    position: "relative",
    // No overflow:hidden — let HybridDraggable clip at its own level
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
    // HybridDraggable itself is `absolute pointer-events-auto` and does NOT clip overflow,
    // so we can absolutely position the delete button INSIDE the HybridDraggable's own div
    // by using a React portal-like trick: render controls as siblings of the inner content div.
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
      {/* Main content panel */}
      <div
        className="group"
        style={innerStyle}
      >
        {hasContent ? (
          <>
            <PanelContentView
              content={content!}
              id={id}
              cameraStream={cameraStream}
              screenStream={screenStream}
              videoDevices={videoDevices}
              blankCanvasColor={blankCanvasColor}
              onClear={handleClear}
            />
            {/* "Change" pill — appears on hover when content assigned */}
            <button
              aria-label="Clear panel content"
              onClick={(e) => { e.stopPropagation(); handleClear(); }}
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
                letterSpacing: "0.05em",
              }}
            >
              Clear
            </button>
          </>
        ) : (
          <>
            {/* Subtle grid SVG pattern */}
            <svg
              aria-hidden="true"
              width="100%"
              height="100%"
              style={{ position: "absolute", inset: 0, opacity: 0.1, pointerEvents: "none" }}
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern id={`egp-grid-${id}`} width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="white" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill={`url(#egp-grid-${id})`} />
            </svg>

            {/*
              EmptyGridSection — shows its buttons at opacity-50 always and full opacity on hover.
              The `group` class on the parent div triggers group-hover: utilities inside EmptyGridSection.
              We override EmptyGridSection's opacity-0 via a CSS wrapper below.
            */}
            <div
              className="w-full h-full"
              style={{ position: "relative", zIndex: 1 }}
              // Stop drag propagation so clicking the Add button doesn't drag the panel
              onPointerDown={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <EmptyGridSection
                sectionId={id}
                blankCanvasColor={blankCanvasColor}
                onSectionContentChange={(sectionId, newContent) =>
                  onContentChange?.(sectionId, newContent)
                }
                onGridAssetSelect={(sectionId, asset) =>
                  onGridAssetSelect?.(sectionId, asset)
                }
              />
            </div>

            {/* Always-visible "+ Add" hint label when completely unhovered */}
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
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "Inter, sans-serif", fontWeight: 500, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Add
              </span>
            </div>
          </>
        )}
      </div>

      {/* ── Delete button ─────────────────────────────────────────────────────
          Rendered as a child of HybridDraggable (which is `absolute` but does
          NOT clip its children), positioned at top-right INSIDE the panel box.
          Using top/right with a small inset so it's never clipped by the border.
      ───────────────────────────────────────────────────────────────────────── */}
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
            // absolute within HybridDraggable's div (which is the coordinate space)
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
