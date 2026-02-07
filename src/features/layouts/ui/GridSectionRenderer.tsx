import React, { useMemo } from "react";
import {
  CanvasSectionState,
  FileOverlayState,
  TextOverlayState,
  CanvasSectionCameraState,
} from "@/types/caption";
import { FileRenderer } from "@/features/canvas/ui/DraggableFileViewer";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { EmptyGridSection } from "@/features/layouts/ui/grid-section/EmptyGridSection";
import { CameraGridSection } from "@/features/layouts/ui/grid-section/CameraGridSection";
import { ScreenShareGridSection } from "@/features/layouts/ui/grid-section/ScreenShareGridSection";
import { usePreviewMode } from "./layouts/dynamic/core/PreviewModeContext";
import { Video } from "lucide-react";
import { useStreamManagerStore } from "@/stores/stream-manager.store";
import { useScreenStream } from "@/features/stream/hooks/useScreenStream";
// 1. Import the optimized VideoPlayer
import { VideoPlayer } from "@/features/canvas/ui/VideoPlayer";

export interface GridSectionRendererProps {
  section: CanvasSectionState;
  cameraStream?: MediaStream | null;
  screenStream?: MediaStream | null;
  fileOverlays?: FileOverlayState[];
  textOverlays?: TextOverlayState[];
  blankCanvasColor?: string;
  backgroundImageUrl?: string;
  onSectionContentChange?: (
    sectionId: string,
    content: CanvasSectionState["content"]
  ) => void;
  onGridAssetSelect?: (sectionId: string, asset: AssetResult) => void;
  onSectionCameraSettingsChange?: (
    sectionId: string,
    settings: Partial<CanvasSectionCameraState>
  ) => void;
  videoDevices?: MediaDeviceInfo[];
  activeSequenceId?: string | null;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
  cameraShape?: "rectangle" | "circle" | "rounded";
  backgroundEffect?: "none" | "blur" | "image";
  [key: string]: any;
}

// 2. Wrap in React.memo to prevent unnecessary re-renders from parent layout updates
export const GridSectionRenderer: React.FC<GridSectionRendererProps> =
  React.memo(
    ({
      section,
      cameraStream,
      screenStream,
      fileOverlays,
      textOverlays,
      blankCanvasColor,
      backgroundImageUrl,
      onSectionContentChange,
      onGridAssetSelect,
      onSectionCameraSettingsChange,
      videoDevices = [],
      activeSequenceId,
      onUserPositionChange,
      cameraShape,
      backgroundEffect,
    }) => {
      const { content } = section;
      const isPreview = usePreviewMode();

      switch (content.type) {
        case "color":
          const colorValue = content.color || blankCanvasColor;
          const isGradientColor = colorValue?.includes("gradient");
          return (
            <div
              className="w-full h-full"
              style={
                isGradientColor
                  ? { background: colorValue }
                  : { backgroundColor: colorValue }
              }
            />
          );

        case "image":
          if (!content.src && !backgroundImageUrl) {
            return (
              <EmptyGridSection
                sectionId={section.id}
                blankCanvasColor={blankCanvasColor}
                backgroundImageUrl={backgroundImageUrl}
                onSectionContentChange={onSectionContentChange}
                onGridAssetSelect={onGridAssetSelect}
              />
            );
          }
          return (
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: `url(${content.src || backgroundImageUrl})`,
              }}
            />
          );

        case "camera":
          if (isPreview) {
            return (
              <div className="w-full h-full bg-muted/30 flex flex-col items-center justify-center border-2 border-dashed border-white/10">
                <Video className="w-8 h-8 text-white/20 mb-2" />
                <span className="text-[10px] font-bold text-white/30 tracking-widest">
                  CAMERA FEED
                </span>
              </div>
            );
          }

          return (
            <CameraGridSection
              sectionId={section.id}
              settings={content.settings}
              cameraStream={cameraStream}
              videoDevices={videoDevices}
              onSectionCameraSettingsChange={onSectionCameraSettingsChange}
              cameraShape={cameraShape}
              backgroundEffect={backgroundEffect}
              activeSequenceId={activeSequenceId}
              onUserPositionChange={onUserPositionChange}
              backgroundImageUrl={backgroundImageUrl}
            />
          );

        case "screen":
          // Use the hook to ensure stream is created/retrieved
          const managedStream = useScreenStream(content.sourceId);
          // Fallback to older prop if no managed stream
          const streamToRender = managedStream || screenStream;

          if (!streamToRender) return <div className="w-full h-full bg-muted" />;

          return (
            <ScreenShareGridSection
              stream={streamToRender}
              cameraStream={cameraStream}
              displayMode={
                (content.displayMode as "cover" | "fit" | "stretch" | "center") || "cover"
              }
            />
          );

        case "file":
          let fileOverlay = fileOverlays?.find((f) => f.id === content.fileId);

          if (!fileOverlay && content.url && content.fileType) {
            fileOverlay = {
              id: section.id,
              fileUrl: content.url,
              fileType: content.fileType,
              fileName: content.name || "File",
              file: null as any,
              layout: {
                position: { x: 0, y: 0 },
                size: { width: 100, height: 100 },
                zIndex: 0,
                rotation: 0,
              },
            };
          }

          if (!fileOverlay) return <div className="w-full h-full bg-muted" />;
          return (
            <div className="w-full h-full flex items-center justify-center">
              <FileRenderer overlay={fileOverlay} />
            </div>
          );

        case "text":
          const textOverlay = textOverlays?.find(
            (t) => t.id === content.textId
          );
          if (!textOverlay) return <div className="w-full h-full bg-muted" />;
          return (
            <div
              className="w-full h-full flex items-center justify-center p-4"
              style={{
                fontFamily: textOverlay.style.fontFamily,
                fontSize: `${textOverlay.style.fontSize}px`,
                color: textOverlay.style.color,
                backgroundColor: textOverlay.style.backgroundColor,
                fontWeight: textOverlay.style.bold ? "bold" : "normal",
                fontStyle: textOverlay.style.italic ? "italic" : "normal",
                textDecoration: textOverlay.style.underline
                  ? "underline"
                  : "none",
              }}
            >
              {textOverlay.content}
            </div>
          );

        case "empty":
        default:
          return (
            <EmptyGridSection
              sectionId={section.id}
              blankCanvasColor={blankCanvasColor}
              backgroundImageUrl={backgroundImageUrl}
              onSectionContentChange={onSectionContentChange}
              onGridAssetSelect={onGridAssetSelect}
            />
          );
      }
    }
  );
