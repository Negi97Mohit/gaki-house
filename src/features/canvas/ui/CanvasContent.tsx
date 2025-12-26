import React, { useMemo } from "react";
import {
  VideoCanvasSplitLayout,
  DynamicLayoutConfig,
} from "@/features/canvas/ui/VideoCanvasSplitLayout";
import { ScreenShareView } from "@/features/canvas/ui/ScreenShareView";
import { PipWindow } from "@/features/canvas/ui/PipWindow";
import { VideoPlayer } from "@/features/canvas/ui/VideoPlayer";
import { getNumericAspectRatio } from "@/features/canvas/ui/VideoCanvasHelpers";
import { VideoCanvasProps } from "@/types/videoCanvas";
import { Camera, FileUp, Monitor } from "lucide-react"; // Icons for empty state

interface CanvasContentProps {
  dynamicLayout: {
    isActive: boolean;
    mode: "split-vertical" | "split-horizontal" | "pip";
    target: any;
  };
  containerSize: { width: number; height: number };
  dynamicPipSize: { width: number; height: number };
  setDynamicPipSize: (size: { width: number; height: number }) => void;
  dynamicPipPosition: { x: number; y: number };
  setDynamicPipPosition: (pos: { x: number; y: number }) => void;
  dynamicSplitRatio: number;
  setDynamicSplitRatio: (ratio: number) => void;
  setIsDraggingDynamicSplitter: (isDragging: boolean) => void;
  renderCamera: () => React.ReactNode;
  theme?: string;
  fullTranscript: string;
  interimTranscript: string;
  sidebarProps: any;
  screenShareMode: VideoCanvasProps["screenShareMode"];
  screenStream: MediaStream | null;
  cameraStream: MediaStream | null;
  canvasLayout: VideoCanvasProps["canvasLayout"];
  fileOverlays: VideoCanvasProps["fileOverlays"];
  textOverlays: VideoCanvasProps["textOverlays"];
  blankCanvasColor: string;
  backgroundImageUrl: string | null;
  backgroundEffect: VideoCanvasProps["backgroundEffect"];
  layoutMode: VideoCanvasProps["layoutMode"];
  cameraShape: VideoCanvasProps["cameraShape"];
  pipSize: VideoCanvasProps["pipSize"];
  pipBorder?: VideoCanvasProps["pipBorder"];
  pipShadow?: VideoCanvasProps["pipShadow"];
  videoDevices: VideoCanvasProps["videoDevices"];
  onGridAssetSelect: VideoCanvasProps["onGridAssetSelect"];
  onSectionCameraSettingsChange: VideoCanvasProps["onSectionCameraSettingsChange"];
  onSetSectionDefault?: VideoCanvasProps["onSetSectionDefault"];
  activeSequenceId?: VideoCanvasProps["activeSequenceId"];
  onUserPositionChange?: VideoCanvasProps["onUserPositionChange"];
  onCanvasLayoutChange?: VideoCanvasProps["onCanvasLayoutChange"];
  sceneId: string;
  pipPosition: { x: number; y: number };
  customMaskUrl?: string;
  onPipPositionChange: VideoCanvasProps["onPipPositionChange"];
  onPipSizeChange: VideoCanvasProps["onPipSizeChange"];
  onPipRotationChange?: VideoCanvasProps["onPipRotationChange"];
  pipRotation?: number;
  onInternalDragStart: VideoCanvasProps["onInternalDragStart"];
  onInternalDragStop: VideoCanvasProps["onInternalDragStop"];
  onScreenShareModeChange: VideoCanvasProps["onScreenShareModeChange"];
  onRemoveBrowser: VideoCanvasProps["onRemoveBrowser"];
  browserOverlays: VideoCanvasProps["browserOverlays"];
}

export const CanvasContent: React.FC<CanvasContentProps> = (props) => {
  const {
    dynamicLayout,
    containerSize,
    dynamicPipSize,
    setDynamicPipSize,
    dynamicPipPosition,
    setDynamicPipPosition,
    dynamicSplitRatio,
    setIsDraggingDynamicSplitter,
    renderCamera,
    theme,
    fullTranscript,
    interimTranscript,
    sidebarProps,
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
    onGridAssetSelect,
    onSectionCameraSettingsChange,
    onSetSectionDefault,
    activeSequenceId,
    onUserPositionChange,
    onCanvasLayoutChange,
    sceneId,
    pipPosition,
    customMaskUrl,
    onPipPositionChange,
    onPipSizeChange,
    onPipRotationChange,
    pipRotation,
    onInternalDragStart,
    onInternalDragStop,
    onScreenShareModeChange,
    onRemoveBrowser,
    browserOverlays,
  } = props;

  if (dynamicLayout.isActive && dynamicLayout.target) {
    return (
      <VideoCanvasSplitLayout
        dynamicLayout={dynamicLayout as DynamicLayoutConfig}
        containerSize={containerSize}
        dynamicPipSize={dynamicPipSize}
        setDynamicPipSize={setDynamicPipSize}
        dynamicPipPosition={dynamicPipPosition}
        setDynamicPipPosition={setDynamicPipPosition}
        dynamicSplitRatio={dynamicSplitRatio}
        setDynamicSplitRatio={props.setDynamicSplitRatio}
        setIsDraggingDynamicSplitter={setIsDraggingDynamicSplitter}
        renderCamera={renderCamera}
        theme={theme}
        fullTranscript={fullTranscript}
        interimTranscript={interimTranscript}
        sidebarProps={sidebarProps}
      />
    );
  }

  const isGridActive = !!canvasLayout;
  const showPipMode =
    screenShareMode !== "off" || isGridActive || layoutMode === "pip";

  // PHASE 3 FIX: "Black Void" Detection
  // Check if the canvas is effectively empty to show onboarding
  const isEffectivelyEmpty =
    !cameraStream &&
    !screenStream &&
    !backgroundImageUrl &&
    fileOverlays.length === 0 &&
    textOverlays.length === 0 &&
    !isGridActive &&
    screenShareMode === "off";

  const mainContent = showPipMode ? (
    <ScreenShareView
      screenShareMode={isGridActive ? "canvas" : screenShareMode}
      screenStream={screenStream}
      cameraStream={cameraStream}
      canvasLayout={canvasLayout}
      fileOverlays={fileOverlays}
      textOverlays={textOverlays}
      blankCanvasColor={blankCanvasColor}
      backgroundImageUrl={backgroundImageUrl || null}
      backgroundEffect={backgroundEffect}
      layoutMode={layoutMode}
      cameraShape={cameraShape}
      pipSize={pipSize}
      pipBorder={pipBorder}
      pipShadow={pipShadow}
      videoDevices={videoDevices}
      onGridAssetSelect={onGridAssetSelect}
      onSectionCameraSettingsChange={onSectionCameraSettingsChange}
      onSetSectionDefault={onSetSectionDefault}
      activeSequenceId={activeSequenceId}
      onUserPositionChange={onUserPositionChange}
      onCanvasLayoutChange={onCanvasLayoutChange}
    />
  ) : (
    renderCamera()
  );

  return (
    <div className="w-full h-full relative">
      <div className="relative w-full h-full">{mainContent}</div>

      {/* PHASE 3 FIX: Onboarding Empty State */}
      {isEffectivelyEmpty && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-background/80 backdrop-blur-md border border-border/50 p-8 rounded-2xl shadow-2xl max-w-md text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
            <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-500">
              Start Creating
            </h2>
            <p className="text-muted-foreground text-sm">
              Your canvas is empty. Choose an action below to begin:
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="flex flex-col items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Camera className="w-6 h-6 text-primary" />
                <span className="text-xs font-medium">Turn on Camera</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-2 rounded-lg bg-muted/50">
                <Monitor className="w-6 h-6 text-blue-500" />
                <span className="text-xs font-medium">Share Screen</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-2 rounded-lg bg-muted/50">
                <FileUp className="w-6 h-6 text-green-500" />
                <span className="text-xs font-medium">Add Media</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPipMode && !isGridActive && layoutMode === "pip" && (
        <PipWindow
          sceneId={sceneId}
          containerSize={containerSize}
          pipPosition={pipPosition}
          pipSize={pipSize}
          cameraShape={cameraShape}
          pipBorder={pipBorder}
          pipShadow={pipShadow}
          customMaskUrl={customMaskUrl}
          screenShareMode={screenShareMode}
          onPipPositionChange={onPipPositionChange}
          onPipSizeChange={onPipSizeChange}
          onPipRotationChange={onPipRotationChange || (() => {})}
          pipRotation={pipRotation}
          onInternalDragStart={onInternalDragStart}
          onInternalDragStop={onInternalDragStop}
          onClose={() => onScreenShareModeChange("off")}
          renderContent={renderCamera}
          renderScreen={() => <VideoPlayer stream={screenStream} />}
          currentAspectRatio={
            cameraShape === "circle"
              ? 1
              : (getNumericAspectRatio(
                  cameraShape,
                  sidebarProps.cameraAspectRatio,
                  sidebarProps.customAspectRatio
                ) as number)
          }
        />
      )}
    </div>
  );
};
