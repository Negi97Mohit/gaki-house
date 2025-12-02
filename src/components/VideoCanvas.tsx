// src/components/VideoCanvas.tsx

import React, { useMemo } from "react";
import { Rnd } from "react-rnd";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LayoutMode,
  CameraShape,
  CaptionStyle,
  FileOverlayState,
  TextOverlayState,
  SceneTransition,
  CanvasLayoutState,
  CanvasSectionCameraState,
  GeneratedOverlay,
  GeneratedLayout,
} from "@/types/caption";
import { useVideoCanvasState } from "@/hooks/useVideoCanvasState";
import {
  getNumericAspectRatio,
  getCanvasAspectRatioStyle,
  getCameraShapeStyle,
  getVideoFilterStyle,
} from "@/components/video-canvas/VideoCanvasHelpers";
import { useVideoStreams } from "@/hooks/useVideoStreams";
import { usePipGestures } from "@/hooks/usePipGestures";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CameraRenderer } from "@/components/CameraRenderer";
import { AICommandPopover } from "@/components/AICommandPopover";
import { AssetResult } from "@/components/AssetLibrary";

import { CanvasHoverToolbar } from "@/components/CanvasHoverToolbar";
import { GuideLine, OverlayElement } from "@/hooks/useSnapGuides";
import { DynamicContentRenderer } from "@/components/video-canvas/DynamicContentRenderer";
import { PipWindow } from "@/components/video-canvas/PipWindow";
import { OverlayLayer } from "@/components/video-canvas/OverlayLayer";
import { BrowserOverlayState } from "./DraggableBrowser";
import { VideoPlayer } from "@/components/video-canvas/VideoPlayer";
import { ScreenShareView } from "@/components/video-canvas/ScreenShareView";
import { SnapLines, SnapLinesRef } from "@/components/video-canvas/SnapLines";
import { CaptionRenderer } from "@/components/CaptionRenderer";

interface VideoCanvasProps {
  sceneId: string;
  isTransitioningIn?: boolean;
  isTransitioningOut?: boolean;
  transition?: SceneTransition | null;
  captionsEnabled: boolean;
  onStyleChange: (style: any) => void;
  onCaptionsToggle: (on: boolean) => void;
  isAiModeEnabled: boolean;
  onAiModeToggle: (on: boolean) => void;
  backgroundEffect: "none" | "blur" | "image";
  backgroundImageUrl: string | null;
  isAutoFramingEnabled: boolean;
  onProcessTranscript: (transcript: string, targetId: string | null) => void;
  generatedOverlays: GeneratedOverlay[];
  onOverlayLayoutChange: (
    id: string,
    key: "position" | "size" | "rotation",
    value: any
  ) => void;
  onRemoveOverlay: (id: string) => void;
  liveCaptionStyle: CaptionStyle;
  dynamicStyle: string;
  videoFilter: string;
  isAudioOn: boolean;
  onAudioToggle: (on: boolean) => void;
  isVideoOn: boolean;
  onVideoToggle: (on: boolean) => void;
  isRecording: boolean;
  onRecordingToggle: (
    on: boolean,
    stream: MediaStream,
    size: { width: number; height: number }
  ) => void;
  selectedAudioDevice: string | undefined;
  onAudioDeviceSelect: (deviceId: string) => void;
  selectedVideoDevice: string | undefined;
  onVideoDeviceSelect: (deviceId: string) => void;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  zoomSensitivity: number;
  trackingSpeed: number;
  isBeautifyEnabled: boolean;
  isLowLightEnabled: boolean;
  layoutMode: LayoutMode;
  textOverlays: TextOverlayState[];
  onRemoveTextOverlay: (id: string) => void;
  onTextLayoutChange: (
    id: string,
    layout: Partial<TextOverlayState["layout"]>
  ) => void;
  onTextStyleChange: (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => void;
  onTextContentChange: (id: string, content: string) => void;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  cameraShape: CameraShape;
  splitRatio: number;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  onLayoutModeChange: (mode: LayoutMode) => void;
  onCameraShapeChange: (shape: CameraShape) => void;
  onSplitRatioChange: (ratio: number) => void;
  onPipPositionChange: (position: { x: number; y: number }) => void;
  onPipSizeChange: (size: { width: number; height: number }) => void;
  customMaskUrl?: string;
  onCustomMaskUpload?: (file: File) => void;
  aiButtonPosition: { x: number; y: number };
  onAiButtonPositionChange: (position: { x: number; y: number }) => void;
  onCaptionLayoutChange: (layout: {
    position?: { x: number; y: number };
    size?: { width: number; height: number };
  }) => void;
  isNeonEdgeEnabled: boolean;
  neonIntensity: number;
  neonColor: string;
  isProcessingAi: boolean;
  onPreviewGenerated: (id: string, dataUrl: string) => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  isFsSidebarOpen: boolean;
  onFsSidebarToggle: (open: boolean | ((prev: boolean) => boolean)) => void;
  portalContainer?: HTMLElement | null | ((node: HTMLDivElement) => void);
  browserOverlays: BrowserOverlayState[];
  onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
  screenShareMode: "off" | "screen" | "canvas";
  onScreenShareModeChange: (mode: "off" | "screen" | "canvas") => void;
  onSectionCameraSettingsChange: (
    sectionId: string,
    settings: Partial<CanvasSectionCameraState>
  ) => void;
  onSetSectionDefault?: (sectionId: string) => void;
  activeSequenceId?: string | null;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
  canvasLayout: CanvasLayoutState | null;
  onCanvasLayoutChange?: (layout: CanvasLayoutState) => void;
  onRemoveBrowser: (id: string) => void;
  onBrowserUrlChange: (id: string, url: string) => void;
  onCanvasBackgroundUpload: (file: File) => void;
  onBrowserLayoutChange: (
    id: string,
    layout: Partial<BrowserOverlayState["layout"]>
  ) => void;
  sidebarProps: any;
  selectedBrowserId: string | null;
  setSelectedBrowserId: (id: string | null) => void;
  fileOverlays: FileOverlayState[];
  onRemoveFile: (id: string) => void;
  onFileLayoutChange: (
    id: string,
    layout: Partial<FileOverlayState["layout"]>
  ) => void;
  selectedFileId: string | null;
  setSelectedFileId: (id: string | null) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  onDeselectAll: () => void;
  dynamicLayout: {
    isActive: boolean;
    mode: "split-vertical" | "split-horizontal" | "pip";
    target: {
      id: string;
      type: string;
      content: any;
      layout: GeneratedLayout;
    } | null;
  };
  onSetDynamicLayout: (
    target: { id: string; type: string },
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => void;
  isMouseActive: boolean;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
  onRecordingComplete: (
    session: import("@/types/editor").RecordingSession
  ) => void;
  onOpenSessions: () => void;
  onOpenSettings: () => void;
  blankCanvasColor: string;
  hasAiPopoverAutoOpenedRef: React.RefObject<boolean>;
  onCanvasBackgroundAssetSelect: (asset: AssetResult) => void;
  onAiPopoverAutoClose?: () => void;
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  onPipRotationChange?: (rotation: number) => void;
  pipRotation?: number;
  canvasAspectRatio: string;
  selectedGeneratedId?: string | null;
  setSelectedGeneratedId?: (id: string | null) => void;
  remoteStream?: MediaStream | null;
}



// --- Main Component ---
export const VideoCanvas = (props: VideoCanvasProps) => {
  const { theme } = useTheme();

  const {
    canvasContainerRef,
    sceneRef,
    snapLinesRef,
    viewport,
    setViewport,
    isCanvasHovered,
    setIsCanvasHovered,
    isSpacePressed,
    setIsSpacePressed,
    sceneSize,
    containerSize,
    isDraggingDynamicSplitter,
    setIsDraggingDynamicSplitter,
    dynamicSplitRatio,
    setDynamicSplitRatio,
    dynamicPipPosition,
    setDynamicPipPosition,
    dynamicPipSize,
    setDynamicPipSize,
    fullTranscript,
    interimTranscript,
  } = useVideoCanvasState({
    isFullscreen: props.isFullscreen,
    isAudioOn: props.isAudioOn,
    selectedAudioDevice: props.selectedAudioDevice,
    captionsEnabled: props.captionsEnabled,
  });

  const {
    sceneId,
    generatedOverlays,
    textOverlays,
    browserOverlays,
    fileOverlays,
    isVideoOn,
    isAudioOn,
    selectedVideoDevice,
    selectedAudioDevice,
    screenShareMode,
    captionsEnabled,
    dynamicLayout,
    onSetDynamicLayout,
  } = props;

  // --- Hooks ---
  const { cameraStream, screenStream } = useVideoStreams({
    isCameraOn: isVideoOn,
    isAudioOn: isAudioOn,
    isScreenSharing: screenShareMode === "screen",
    selectedCameraDevice: selectedVideoDevice,
    selectedAudioDevice: selectedAudioDevice,
    selectedAudioDevice: selectedAudioDevice,
    onScreenShareEnd: () => props.onScreenShareModeChange("off"),
    remoteStream: props.remoteStream,
  });

  usePipGestures({
    layoutMode: props.layoutMode,
    containerRef: sceneRef,
    containerSize,
    pipSize: props.pipSize,
    onPipPositionChange: props.onPipPositionChange,
    screenShareMode: props.screenShareMode,
    onScreenShareModeChange: props.onScreenShareModeChange,
  });



  const renderCamera = (className?: string, style?: React.CSSProperties) => {
    const {
      style: _unsafeStyle,
      width: _unsafeWidth,
      height: _unsafeHeight,
      className: _unsafeClassName,
      ...safeSidebarProps
    } = props.sidebarProps || {};

    return (
      <div
        className={cn("w-full h-full", className)}
        style={{
          ...getCameraShapeStyle(
            props.cameraShape,
            props.pipBorder,
            props.pipShadow
          ),
          ...style,
        }}
      >
        <CameraRenderer
          stream={cameraStream}
          className="w-full h-full"
          portalContainer={
            typeof props.portalContainer === "function"
              ? undefined
              : props.portalContainer
          }
          style={style}
          videoFilter={getVideoFilterStyle(
            props.videoFilter,
            props.isBeautifyEnabled,
            props.isLowLightEnabled
          )}
          cameraShape={props.cameraShape}
          onCameraShapeChange={props.onCameraShapeChange}
          isAutoFramingEnabled={props.isAutoFramingEnabled}
          videoDevices={props.videoDevices}
          onCameraDeviceChange={props.onVideoDeviceSelect}
          pipBorder={props.pipBorder}
          pipShadow={props.pipShadow}
          showAspectRatio={true}
          {...safeSidebarProps}
        />
      </div>
    );
  };

  const renderContent = () => {
    if (dynamicLayout.isActive && dynamicLayout.target) {
      const isVertical = dynamicLayout.mode === "split-vertical";
      if (dynamicLayout.mode === "pip") {
        return (
          <div className="w-full h-full relative bg-black">
            {renderCamera()}
            <Rnd
              size={{
                width: (containerSize.width * dynamicPipSize.width) / 100,
                height: (containerSize.height * dynamicPipSize.height) / 100,
              }}
              position={{
                x: (containerSize.width * dynamicPipPosition.x) / 100,
                y: (containerSize.height * dynamicPipPosition.y) / 100,
              }}
              minWidth={150}
              minHeight={150}
              bounds="parent"
              onDragStop={(e, d) =>
                setDynamicPipPosition({
                  x: (d.x / containerSize.width) * 100,
                  y: (d.y / containerSize.height) * 100,
                })
              }
              onResizeStop={(e, dir, ref, delta, pos) => {
                setDynamicPipSize({
                  width:
                    (parseInt(ref.style.width, 10) / containerSize.width) * 100,
                  height:
                    (parseInt(ref.style.height, 10) / containerSize.height) *
                    100,
                });
                setDynamicPipPosition({
                  x: (pos.x / containerSize.width) * 100,
                  y: (pos.y / containerSize.height) * 100,
                });
              }}
              className="pointer-events-auto border-2 border-primary shadow-lg rounded-lg overflow-hidden"
            >
              <DynamicContentRenderer
                target={dynamicLayout.target}
                theme={theme}
                fullTranscript={fullTranscript}
                interimTranscript={interimTranscript}
                sidebarProps={props.sidebarProps}
              />
            </Rnd>
          </div>
        );
      }
      return (
        <div
          className={cn(
            "w-full h-full flex bg-black",
            isVertical ? "flex-col" : "flex-row"
          )}
        >
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              [isVertical ? "height" : "width"]: `${dynamicSplitRatio * 100}%`,
            }}
          >
            <DynamicContentRenderer
              target={dynamicLayout.target}
              theme={theme}
              fullTranscript={fullTranscript}
              interimTranscript={interimTranscript}
              sidebarProps={props.sidebarProps}
            />
          </div>
          <div
            className={cn(
              "bg-border hover:bg-primary transition-colors flex items-center justify-center group z-10",
              isVertical
                ? "h-2 w-full cursor-row-resize"
                : "w-2 h-full cursor-col-resize"
            )}
            onMouseDown={() => setIsDraggingDynamicSplitter(true)}
          >
            <div
              className={cn(
                "bg-primary/50 group-hover:bg-primary rounded-full transition-colors",
                isVertical ? "w-12 h-1" : "w-1 h-12"
              )}
            />
          </div>
          <div
            className="relative flex items-center justify-center overflow-hidden"
            style={{
              [isVertical ? "height" : "width"]: `${(1 - dynamicSplitRatio) * 100
                }%`,
            }}
          >
            {renderCamera()}
          </div>
        </div>
      );
    }

    const isGridActive = !!props.canvasLayout;
    const isScreenSharing = screenShareMode !== "off" || isGridActive;

    const mainContent = isScreenSharing ? (
      <ScreenShareView
        screenShareMode={isGridActive ? "canvas" : screenShareMode}
        screenStream={screenStream}
        cameraStream={cameraStream}
        canvasLayout={props.canvasLayout}
        fileOverlays={fileOverlays}
        textOverlays={textOverlays}
        blankCanvasColor={props.blankCanvasColor}
        backgroundImageUrl={props.backgroundImageUrl || null}
        backgroundEffect={props.backgroundEffect}
        layoutMode={props.layoutMode}
        cameraShape={props.cameraShape}
        pipSize={props.pipSize}
        pipBorder={props.pipBorder}
        pipShadow={props.pipShadow}
        videoDevices={props.videoDevices}
        onGridAssetSelect={props.onGridAssetSelect}
        onSectionCameraSettingsChange={props.onSectionCameraSettingsChange}
        onSetSectionDefault={props.onSetSectionDefault}
        activeSequenceId={props.activeSequenceId}
        onUserPositionChange={props.onUserPositionChange}
        onCanvasLayoutChange={props.onCanvasLayoutChange}
      />
    ) : (
      renderCamera()
    );

    return (
      <div className="w-full h-full relative">
        <div className="relative w-full h-full">{mainContent}</div>
        {isScreenSharing && !isGridActive && props.layoutMode === "pip" && (
          <PipWindow
            sceneId={sceneId}
            containerSize={containerSize}
            pipPosition={props.pipPosition}
            pipSize={props.pipSize}
            cameraShape={props.cameraShape}
            pipBorder={props.pipBorder}
            pipShadow={props.pipShadow}
            customMaskUrl={props.customMaskUrl}
            screenShareMode={props.screenShareMode}
            onPipPositionChange={props.onPipPositionChange}
            onPipSizeChange={props.onPipSizeChange}
            onPipRotationChange={props.onPipRotationChange || (() => { })}
            pipRotation={props.pipRotation}
            onInternalDragStart={props.onInternalDragStart}
            onInternalDragStop={props.onInternalDragStop}
            renderContent={renderCamera}
            renderScreen={() => <VideoPlayer stream={screenStream} />}
            currentAspectRatio={getNumericAspectRatio(
              props.cameraShape,
              props.sidebarProps.cameraAspectRatio,
              props.sidebarProps.customAspectRatio
            )}
          />
        )}
      </div>
    );
  };

  const allOverlays: OverlayElement[] = useMemo(
    () => [
      ...textOverlays.map((o) => ({
        id: o.id,
        layout: o.layout,
        type: "text",
      })),
      ...browserOverlays.map((o) => ({
        id: o.id,
        layout: o.layout,
        type: "browser",
      })),
      ...fileOverlays.map((o) => ({
        id: o.id,
        layout: o.layout,
        type: "file",
      })),
      ...generatedOverlays.map((o) => ({
        id: o.id,
        layout: o.layout,
        type: "generated",
      })),
    ],
    [textOverlays, browserOverlays, fileOverlays, generatedOverlays]
  );

  // --- ADDED: Style construction helper ---
  const captionBaseStyle: React.CSSProperties = {
    fontFamily: props.liveCaptionStyle.fontFamily,
    fontSize: `${props.liveCaptionStyle.fontSize}px`,
    color: props.liveCaptionStyle.color,
    fontWeight: props.liveCaptionStyle.bold ? "bold" : "normal",
    fontStyle: props.liveCaptionStyle.italic ? "italic" : "normal",
    textDecoration: props.liveCaptionStyle.underline ? "underline" : "none",
    textShadow: props.liveCaptionStyle.textShadow,
  };

  const captionWidth = 600;
  const captionHeight = 100;

  return (
    <div
      ref={canvasContainerRef}
      className={cn(
        "absolute inset-0 w-full h-full bg-neutral-900 overflow-hidden flex items-center justify-center",
        !props.isMouseActive && props.isFullscreen && "cursor-none"
      )}
    >
      <div
        ref={sceneRef}
        className="relative overflow-hidden"
        style={getCanvasAspectRatioStyle(
          props.sidebarProps.canvasAspectRatio,
          props.sidebarProps.customAspectRatio
        )}
        onClick={props.onDeselectAll}
        onMouseEnter={() => setIsCanvasHovered(true)}
        onMouseLeave={() => setIsCanvasHovered(false)}
      >
        <CanvasHoverToolbar
          blankCanvasColor={props.blankCanvasColor}
          onBlankCanvasColorChange={props.sidebarProps.onBlankCanvasColorChange}
          onCanvasBackgroundUpload={props.onCanvasBackgroundUpload}
          onCanvasBackgroundAssetSelect={props.onCanvasBackgroundAssetSelect}
          isVisible={isCanvasHovered}
          canvasLayout={props.canvasLayout}
          onCanvasLayoutChange={props.onCanvasLayoutChange}
          activeSequenceId={props.activeSequenceId}
        />

        {renderContent()}

        {/* --- MODIFIED: Live Caption Renderer with Correct Centering --- */}
        {captionsEnabled &&
          (fullTranscript || interimTranscript) &&
          sceneSize.width > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: "var(--z-caption)" }}
            >
              <Rnd
                key={sceneSize.width} // Re-mount if scene size changes (fixes init glitch)
                default={{
                  // Center the box on the target point
                  x:
                    (sceneSize.width * props.liveCaptionStyle.position.x) /
                    100 -
                    captionWidth / 2,
                  y:
                    (sceneSize.height * props.liveCaptionStyle.position.y) /
                    100 -
                    captionHeight / 2,
                  width: captionWidth,
                  height: captionHeight,
                }}
                // Controlled position: Keep it centered
                position={{
                  x:
                    (sceneSize.width * props.liveCaptionStyle.position.x) /
                    100 -
                    captionWidth / 2,
                  y:
                    (sceneSize.height * props.liveCaptionStyle.position.y) /
                    100 -
                    captionHeight / 2,
                }}
                enableResizing={false}
                // Removed bounds="parent" to prevent clipping if text is near edge
                className="pointer-events-auto"
                style={{ position: "absolute" }}
                onDragStop={(e, d) => {
                  // Convert top-left coordinate back to center percentage
                  const centerX = d.x + captionWidth / 2;
                  const centerY = d.y + captionHeight / 2;

                  const newXPercent = (centerX / sceneSize.width) * 100;
                  const newYPercent = (centerY / sceneSize.height) * 100;

                  props.onCaptionLayoutChange({
                    position: { x: newXPercent, y: newYPercent },
                  });
                }}
              >
                <CaptionRenderer
                  text=""
                  fullTranscript={fullTranscript}
                  interimTranscript={interimTranscript}
                  activeStyleId={props.dynamicStyle}
                  captionStyle={props.liveCaptionStyle}
                  baseStyle={captionBaseStyle}
                />
              </Rnd>
            </div>
          )}

        <canvas
          ref={props.canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 100 }}
        />

        <SnapLines ref={snapLinesRef} containerSize={sceneSize} />

        {["below-video", "above-video"].map((order) => (
          <div
            key={order}
            className="absolute inset-0 pointer-events-none"
            style={{
              zIndex:
                order === "below-video"
                  ? "var(--z-overlays-below-video)"
                  : "var(--z-overlays-above-video)",
            }}
          >
            <OverlayLayer
              layerOrder={order as "below-video" | "above-video"}
              sceneId={sceneId}
              containerSize={sceneSize}
              viewport={viewport}
              htmlOverlays={generatedOverlays}
              browserOverlays={browserOverlays}
              fileOverlays={fileOverlays}
              textOverlays={textOverlays}
              activeDynamicTargetId={
                dynamicLayout.isActive ? dynamicLayout.target?.id : undefined
              }
              onSetDynamicLayout={onSetDynamicLayout}
              onOverlayLayoutChange={props.onOverlayLayoutChange}
              onRemoveOverlay={props.onRemoveOverlay}
              onPreviewGenerated={props.onPreviewGenerated}
              selectedGeneratedId={props.selectedGeneratedId}
              onSelectGenerated={props.setSelectedGeneratedId}
              portalContainer={
                typeof props.portalContainer === "function"
                  ? null
                  : props.portalContainer
              }
              allOverlays={allOverlays}
              onSnapGuidesChange={(guides) =>
                snapLinesRef.current?.setGuides(guides)
              }
              onRemoveBrowser={props.onRemoveBrowser}
              onBrowserUrlChange={props.onBrowserUrlChange}
              onBrowserLayoutChange={props.onBrowserLayoutChange}
              selectedBrowserId={props.selectedBrowserId}
              onSelectBrowser={props.setSelectedBrowserId}
              onRemoveFile={props.onRemoveFile}
              onFileLayoutChange={props.onFileLayoutChange}
              selectedFileId={props.selectedFileId}
              onSelectFile={props.setSelectedFileId}
              onRemoveTextOverlay={props.onRemoveTextOverlay}
              onTextLayoutChange={props.onTextLayoutChange}
              onTextStyleChange={props.onTextStyleChange}
              onTextContentChange={props.onTextContentChange}
              selectedTextId={props.selectedTextId}
              onSelectText={props.setSelectedTextId}
              containerRef={sceneRef}
              isSpacePressed={isSpacePressed}
              onInternalDragStart={props.onInternalDragStart}
              onInternalDragStop={props.onInternalDragStop}
            />
          </div>
        ))}
      </div>

      {containerSize.width > 0 && (
        <Rnd
          style={{ zIndex: "var(--z-ai-popover-trigger)" }}
          cancel=".aicp-content"
          size={{ width: 64, height: 64 }}
          position={{
            x: (props.aiButtonPosition.x / 100) * containerSize.width - 32,
            y: (props.aiButtonPosition.y / 100) * containerSize.height - 32,
          }}
          onDragStop={(e, d) => {
            const newX = ((d.x + 32) / containerSize.width) * 100;
            const newY = ((d.y + 32) / containerSize.height) * 100;
            props.onAiButtonPositionChange({ x: newX, y: newY });
          }}
          bounds="parent"
          className={cn(
            "pointer-events-auto transition-opacity duration-300",
            props.isMouseActive || !props.isFullscreen
              ? "opacity-100"
              : "opacity-0"
          )}
        >
          <AICommandPopover
            onSubmit={props.onProcessTranscript}
            isProcessing={props.isProcessingAi}
            activeOverlays={generatedOverlays}
            isFullscreen={props.isFullscreen}
            isAiModeEnabled={props.isAiModeEnabled}
            onAiModeToggle={props.onAiModeToggle}
            captionsEnabled={captionsEnabled}
            onCaptionsToggle={props.onCaptionsToggle}
            portalContainer={canvasContainerRef.current}
            hasAiPopoverAutoOpenedRef={props.hasAiPopoverAutoOpenedRef}
            onAutoClose={props.onAiPopoverAutoClose}
          >
            <Button
              size="icon"
              className="rounded-full h-16 w-16 shadow-lg bg-purple-600 hover:bg-purple-700"
            >
              <Sparkles className="h-8 w-8" />
            </Button>
          </AICommandPopover>
        </Rnd>
      )}
    </div>
  );
};
