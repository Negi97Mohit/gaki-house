import React from "react";
import { ScreenShare } from "lucide-react";
import { CanvasGridLayout } from "@/features/layouts/ui/CanvasGridLayout";
import { VideoPlayer } from "./VideoPlayer";
import {
  CanvasLayoutState,
  FileOverlayState,
  TextOverlayState,
  CanvasSectionCameraState,
  LayoutMode,
  CameraShape,
} from "@/types/caption";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";

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
  // 1. If we have a Grid Layout, render it
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
        // FIX: Ensure grid section setting changes (e.g. filters) actually update the layout state
        onSectionCameraSettingsChange={(sectionId, settings) => {
          if (onCanvasLayoutChange) {
            const updatedSections = canvasLayout.sections.map((s) => {
              if (s.id === sectionId && s.content.type === "camera") {
                return {
                  ...s,
                  content: {
                    ...s.content,
                    settings: { ...s.content.settings, ...settings },
                  },
                };
              }
              return s;
            });
            onCanvasLayoutChange({
              ...canvasLayout,
              sections: updatedSections,
            });
          }
          // Also call original prop if needed for side effects (like updating global camera prefs)
          onSectionCameraSettingsChange?.(sectionId, settings);
        }}
        layoutMode={layoutMode}
        cameraShape={cameraShape}
        pipSize={pipSize}
        pipBorder={pipBorder}
        pipShadow={pipShadow}
        onGridAssetSelect={onGridAssetSelect}
        backgroundEffect={backgroundEffect}
        onLayoutUpdate={onCanvasLayoutChange}
        onSetSectionDefault={onSetSectionDefault}
        activeSequenceId={activeSequenceId}
        onUserPositionChange={onUserPositionChange}
        videoDevices={videoDevices}
      />
    );
  }

  // 2. Screen Share Mode
  if (screenShareMode === "screen" && screenStream) {
    return <VideoPlayer stream={screenStream} />;
  }

  // 3. Logic for Standard Canvas / PIP Background
  // - 'canvas' mode should show background
  // - 'pip' layout needs a background behind the camera even if screenShareMode is 'off'
  const effectiveColor = blankCanvasColor || "#000000";
  const isGradientBg = effectiveColor.includes("gradient");
  const shouldShowBackground = screenShareMode === "canvas" || layoutMode === "pip";

  if (shouldShowBackground) {
    // Handle Image Background
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
        style={isGradientBg ? { background: effectiveColor } : { backgroundColor: effectiveColor }}
      />
    );
  }

  // 4. Default / Empty State
  return (
    <div className="w-full h-full flex items-center justify-center text-center text-muted-foreground bg-black">
      <div>
        <ScreenShare className="w-16 h-16 mx-auto mb-2" />
        <p className="text-sm">Select a share source</p>
      </div>
    </div>
  );
};
