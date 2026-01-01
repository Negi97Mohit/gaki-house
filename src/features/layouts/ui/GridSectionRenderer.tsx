import React from "react";
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

export const GridSectionRenderer: React.FC<GridSectionRendererProps> = ({
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

  switch (content.type) {
    case "color":
      return (
        <div
          className="w-full h-full"
          style={{
            backgroundColor: content.color || blankCanvasColor,
          }}
        />
      );

    case "image":
      // Fix: If no src is provided, show empty controls instead of broken image
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
      if (!screenStream) return <div className="w-full h-full bg-muted" />;
      return (
        <video
          autoPlay
          playsInline
          muted
          ref={(video) => {
            if (video && screenStream) video.srcObject = screenStream;
          }}
          className="w-full h-full object-cover"
        />
      );

    case "file":
      let fileOverlay = fileOverlays?.find((f) => f.id === content.fileId);

      // Construct temporary overlay if we have direct file data but no ID match
      if (!fileOverlay && content.url && content.fileType) {
        fileOverlay = {
          id: section.id, // Use section ID as fallback
          fileUrl: content.url,
          fileType: content.fileType,
          fileName: content.name || "File",
          file: null as any, // File object might not be available for URL-based content
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
      const textOverlay = textOverlays.find((t) => t.id === content.textId);
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
            textDecoration: textOverlay.style.underline ? "underline" : "none",
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
};
