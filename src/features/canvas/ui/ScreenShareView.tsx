import React from "react";
import { ScreenShare } from "lucide-react";
import { CanvasGridLayout } from "@/components/CanvasGridLayout";
import { VideoPlayer } from "./VideoPlayer";
import {
  CanvasLayoutState,
  FileOverlayState,
  TextOverlayState,
  CanvasSectionCameraState,
  LayoutMode,
  CameraShape,
} from "@/types/caption";
import { AssetResult } from "@/components/AssetLibrary";

interface ScreenShareViewProps {
  screenShareMode: "off" | "screen" | "canvas";
  screenStream: MediaStream | null;
  cameraStream: MediaStream | null;
  canvasLayout: CanvasLayoutState | null;
  fileOverlays: FileOverlayState[];
  textOverlays: TextOverlayState[];
  blankCanvasColor: string;
  backgroundImageUrl: string | null;
  backgroundEffect: "none" | "blur" | "image";
  layoutMode: LayoutMode;
  cameraShape: CameraShape;
  pipSize: { width: number; height: number };
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  videoDevices?: MediaDeviceInfo[];
  activeSequenceId?: string | null;

  onCanvasLayoutChange?: (layout: CanvasLayoutState) => void;
  onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
  onSectionCameraSettingsChange: (
    sectionId: string,
    settings: Partial<CanvasSectionCameraState>
  ) => void;
  onSetSectionDefault?: (sectionId: string) => void;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
}

export const ScreenShareView: React.FC<ScreenShareViewProps> = ({
  screenShareMode,
  screenStream,
  cameraStream,
  canvasLayout,
  fileOverlays,
  textOverlays,
  blankCanvasColor,
  backgroundImageUrl,
  backgroundEffect,
  layoutMode,
  cameraShape,
  pipSize,
  pipBorder,
  pipShadow,
  videoDevices,
  activeSequenceId,
  onCanvasLayoutChange,
  onGridAssetSelect,
  onSectionCameraSettingsChange,
  onSetSectionDefault,
  onUserPositionChange,
}) => {
  // Fix: Treat existence of layout as active canvas mode
  if (canvasLayout) {
    return (
      <CanvasGridLayout
        layout={canvasLayout}
        cameraStream={cameraStream}
        screenStream={screenStream}
        fileOverlays={fileOverlays}
        textOverlays={textOverlays}
        blankCanvasColor={blankCanvasColor}
        backgroundImageUrl={backgroundImageUrl || undefined}
        onSectionContentChange={(sectionId, content) => {
          if (onCanvasLayoutChange) {
            const updatedSections = canvasLayout.sections.map((s) =>
              s.id === sectionId ? { ...s, content } : s
            );
            onCanvasLayoutChange({
              ...canvasLayout,
              sections: updatedSections,
            });
          }
        }}
        layoutMode={layoutMode}
        cameraShape={cameraShape}
        pipSize={pipSize}
        pipBorder={pipBorder}
        pipShadow={pipShadow}
        onGridAssetSelect={onGridAssetSelect}
        onSectionCameraSettingsChange={onSectionCameraSettingsChange}
        backgroundEffect={backgroundEffect}
        onLayoutUpdate={onCanvasLayoutChange}
        onSetSectionDefault={onSetSectionDefault}
        activeSequenceId={activeSequenceId}
        onUserPositionChange={onUserPositionChange}
        videoDevices={videoDevices}
      />
    );
  }

  if (screenShareMode === "canvas") {
    if (backgroundEffect === "image" && backgroundImageUrl) {
      return (
        <div
          className="w-full h-full bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundImageUrl})` }}
        />
      );
    }
    return (
      <div
        className="w-full h-full"
        style={{ backgroundColor: blankCanvasColor }}
      />
    );
  }

  if (screenShareMode === "screen" && screenStream) {
    return <VideoPlayer stream={screenStream} />;
  }

  return (
    <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground bg-black">
      <div>
        <ScreenShare className="w-16 h-16 mx-auto mb-2" />
        <p className="text-sm">Select a share source</p>
      </div>
    </div>
  );
};
