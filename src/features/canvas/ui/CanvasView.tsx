import React, { useMemo, useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { useShallow } from "zustand/react/shallow";
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
import { useCanvasStore } from "../model/canvas.store";
import { useUIStore } from "../model/ui.store";
import { useCanvasResize } from "../hooks/useCanvasResize";
import { useCanvasSpeech } from "../hooks/useCanvasSpeech";
import { useCanvasDimensionSync } from "../hooks/useCanvasDimensionSync";
import { SnapLinesRef } from "./SnapLines";
import { getCanvasAspectRatioStyle } from "@/features/canvas/ui/VideoCanvasHelpers";
import { useVideoStreams } from "@/features/stream/hooks/useVideoStreams";
import { usePipGestures } from "@/hooks/usePipGestures";
import { Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AICommandPopover } from "@/features/ai-assistant/ui/AICommandPopover";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { CanvasHoverToolbar } from "@/features/canvas/ui/CanvasHoverToolbar";
import { OverlayElement } from "@/hooks/useSnapGuides";
import { VideoCanvasCamera } from "@/features/canvas/ui/VideoCanvasCamera";
import { ForegroundUserLayer } from "@/features/canvas/ui/ForegroundUserLayer";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { VideoCanvasProps } from "@/types/videoCanvas";
import { CanvasContent } from "@/features/canvas/ui/CanvasContent";
import { OverlayLayer } from "@/features/canvas/ui/OverlayLayer";
import { SnapLines } from "@/features/canvas/ui/SnapLines";
import { CanvasShell } from "@/features/canvas/ui/CanvasShell";
import { CaptionLayer } from "@/features/canvas/ui/CaptionLayer";
import { BannerToolbarLayer } from "@/features/canvas/ui/BannerToolbarLayer";

export const VideoCanvas = (props: VideoCanvasProps) => {
  useEffect(() => {
    console.log("[VideoCanvas] mounted");
  }, []);
  const { theme } = useTheme();

  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<HTMLDivElement>(null);
  const snapLinesRef = useRef<SnapLinesRef>(null);

  // 1. Optimized Store Selectors
  const { viewport, setViewport, sceneSize, containerSize } = useCanvasStore(
    useShallow((state) => ({
      viewport: state.viewport,
      setViewport: state.setViewport,
      sceneSize: state.sceneSize,
      containerSize: state.containerSize,
    }))
  );

  const {
    isCanvasHovered,
    setIsCanvasHovered,
    isSpacePressed,
    isDraggingDynamicSplitter,
    setIsDraggingDynamicSplitter,
    dynamicSplitRatio,
    setDynamicSplitRatio,
    dynamicPipPosition,
    setDynamicPipPosition,
    dynamicPipSize,
    setDynamicPipSize,
  } = useUIStore(
    useShallow((state) => ({
      isCanvasHovered: state.isCanvasHovered,
      setIsCanvasHovered: state.setIsCanvasHovered,
      isSpacePressed: state.isSpacePressed,
      isDraggingDynamicSplitter: state.isDraggingDynamicSplitter,
      setIsDraggingDynamicSplitter: state.setIsDraggingDynamicSplitter,
      dynamicSplitRatio: state.dynamicSplitRatio,
      setDynamicSplitRatio: state.setDynamicSplitRatio,
      dynamicPipPosition: state.dynamicPipPosition,
      setDynamicPipPosition: state.setDynamicPipPosition,
      dynamicPipSize: state.dynamicPipSize,
      setDynamicPipSize: state.setDynamicPipSize,
    }))
  );

  // Resize Logic
  useCanvasResize(canvasContainerRef, sceneRef, props.isFullscreen);

  // Canvas Dimension Sync
  useCanvasDimensionSync({
    canvasRef: props.canvasRef,
    sceneSize,
  });

  // Speech/Captions
  const { fullTranscript, interimTranscript } = useCanvasSpeech({
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

  // --- Text Behind User State ---
  const [isTextDepthEnabled, setIsTextDepthEnabled] = React.useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const allOverlays: OverlayElement[] = useMemo(
    () => [
      ...textOverlays.map((o) => ({
        id: o.id,
        layout: o.layout,
        type: "text" as const,
      })),
      ...browserOverlays.map((o) => ({
        id: o.id,
        layout: o.layout,
        type: "browser" as const,
      })),
      ...fileOverlays.map((o) => ({
        id: o.id,
        layout: o.layout,
        type: "file" as const,
      })),
      ...generatedOverlays.map((o) => ({
        id: o.id,
        layout: o.layout,
        type: "generated" as const,
      })),
    ],
    [textOverlays, browserOverlays, fileOverlays, generatedOverlays]
  );

  const hasBehindUserOverlay = useMemo(() => {
    return allOverlays.some((o) => o.layout.isBehindUser);
  }, [allOverlays]);

  const isSegmentationEnabled =
    isTextDepthEnabled ||
    hasBehindUserOverlay ||
    (props.sidebarProps?.filterTarget &&
      props.sidebarProps.filterTarget !== "both");

  const { processedCanvas, facePositionRef } = useCameraEffects({
    videoElement: videoRef.current,
    isSegmentationEnabled: !!isSegmentationEnabled,
    isFaceTrackingEnabled: props.isAutoFramingEnabled,
    onUserPositionChange: props.onUserPositionChange,
  });

  const hasScreenSection = props.canvasLayout?.sections.some(
    (s) => s.content.type === "screen"
  );

  const { cameraStream, screenStream } = useVideoStreams({
    isCameraOn: isVideoOn,
    isAudioOn: isAudioOn,
    isScreenSharing: screenShareMode === "screen" || !!hasScreenSection,
    selectedCameraDevice: selectedVideoDevice,
    selectedAudioDevice: selectedAudioDevice,
    selectedScreenSourceId: props.selectedScreenSourceId, // ADDED
    onScreenShareEnd: () => {
      props.onScreenShareModeChange("off");
      if (props.canvasLayout && props.onCanvasLayoutChange) {
        const updatedSections = props.canvasLayout.sections.map((s) =>
          s.content.type === "screen"
            ? { ...s, content: { type: "empty" } as const }
            : s
        );
        if (
          updatedSections.some(
            (s, i) =>
              s.content.type !== props.canvasLayout!.sections[i].content.type
          )
        ) {
          props.onCanvasLayoutChange({
            ...props.canvasLayout,
            sections: updatedSections,
          });
        }
      }
    },
    remoteStream: props.remoteStream,
  });

  const isDefaultMode =
    !props.selectedTextId &&
    !props.selectedBrowserId &&
    !props.selectedFileId &&
    !props.selectedGeneratedId &&
    !props.editingBannerText &&
    !props.dynamicLayout?.isActive &&
    !props.canvasLayout;

  usePipGestures({
    layoutMode: props.layoutMode,
    containerRef: sceneRef,
    containerSize,
    pipSize: props.pipSize,
    onPipPositionChange: props.onPipPositionChange,
    screenShareMode: props.screenShareMode,
    onScreenShareModeChange: props.onScreenShareModeChange,
    isDefaultMode,
  });

  const renderCamera = (className?: string, style?: React.CSSProperties) => (
    <VideoCanvasCamera
      className={className}
      style={style}
      stream={cameraStream}
      cameraShape={props.cameraShape}
      pipBorder={props.pipBorder}
      pipShadow={props.pipShadow}
      videoFilter={props.videoFilter}
      isBeautifyEnabled={props.isBeautifyEnabled}
      isLowLightEnabled={props.isLowLightEnabled}
      isAutoFramingEnabled={props.isAutoFramingEnabled}
      videoDevices={props.videoDevices}
      selectedVideoDevice={selectedVideoDevice}
      onVideoDeviceSelect={props.onVideoDeviceSelect}
      onCameraShapeChange={props.onCameraShapeChange}
      portalContainer={
        typeof props.portalContainer === "function"
          ? undefined
          : props.portalContainer
      }
      isMouseActive={props.isMouseActive}
      sidebarProps={props.sidebarProps}
      screenShareMode={props.screenShareMode}
      onScreenShareModeChange={props.onScreenShareModeChange}
      onLayoutModeChange={props.onLayoutModeChange}
      externalVideoRef={videoRef}
      processedCanvas={processedCanvas}
      facePositionRef={facePositionRef}
      onPipPositionChange={props.onPipPositionChange}
      onPipSizeChange={props.onPipSizeChange}
      onCameraAspectRatioChange={props.sidebarProps?.onCameraAspectRatioChange}
    />
  );

  // captionBaseStyle, captionWidth, captionHeight moved to CaptionLayer

  return (
    <CanvasShell
      containerRef={canvasContainerRef}
      sceneRef={sceneRef}
      sceneStyle={getCanvasAspectRatioStyle(
        props.sidebarProps.canvasAspectRatio,
        props.sidebarProps.customAspectRatio
      )}
      onClick={props.onDeselectAll}
      onMouseEnter={() => setIsCanvasHovered(true)}
      onMouseLeave={() => setIsCanvasHovered(false)}
      isMouseActive={props.isMouseActive}
      isFullscreen={props.isFullscreen}
    >
        <CanvasHoverToolbar
          blankCanvasColor={props.blankCanvasColor}
          onBlankCanvasColorChange={props.sidebarProps.onBlankCanvasColorChange}
          onCanvasBackgroundUpload={props.onCanvasBackgroundUpload}
          onCanvasBackgroundAssetSelect={props.onCanvasBackgroundAssetSelect}
          isVisible={isCanvasHovered}
          isMouseActive={props.isMouseActive}
          canvasLayout={props.canvasLayout}
          onCanvasLayoutChange={props.onCanvasLayoutChange}
          activeSequenceId={props.activeSequenceId}
          isChatbotOpen={props.isChatbotOpen}
          onToggleChatbot={props.onChatbotToggle}
        />

        <CanvasContent
          {...props}
          dynamicLayout={dynamicLayout}
          containerSize={containerSize}
          dynamicPipSize={dynamicPipSize}
          setDynamicPipSize={setDynamicPipSize}
          dynamicPipPosition={dynamicPipPosition}
          setDynamicPipPosition={setDynamicPipPosition}
          dynamicSplitRatio={dynamicSplitRatio}
          setDynamicSplitRatio={setDynamicSplitRatio}
          setIsDraggingDynamicSplitter={setIsDraggingDynamicSplitter}
          renderCamera={() => renderCamera()}
          theme={theme}
          fullTranscript={fullTranscript}
          interimTranscript={interimTranscript}
          sidebarProps={props.sidebarProps}
          screenStream={screenStream}
          cameraStream={cameraStream}
          blankCanvasColor={props.blankCanvasColor}
        />

        <CaptionLayer
          captionsEnabled={captionsEnabled}
          fullTranscript={fullTranscript}
          interimTranscript={interimTranscript}
          sceneSize={sceneSize}
          liveCaptionStyle={props.liveCaptionStyle as any}
          dynamicStyle={props.dynamicStyle}
          onCaptionLayoutChange={props.onCaptionLayoutChange}
        />

        <BannerToolbarLayer
          editingBannerText={props.editingBannerText}
          generatedOverlays={generatedOverlays}
          sceneRef={sceneRef}
          sceneSize={sceneSize}
          liveCaptionStyle={props.liveCaptionStyle}
          onBannerTextStyleChange={props.onBannerTextStyleChange}
          onOverlayLayoutChange={props.onOverlayLayoutChange}
          onUpdateOverlayMetadata={props.onUpdateOverlayMetadata}
        />

        <canvas
          ref={props.canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ zIndex: 100 }}
        />

        <SnapLines ref={snapLinesRef} containerSize={sceneSize} />

        {["below-video", "above-video"].map((order) => {
          if (order === "below-video") {
            return (
              <div
                key={order}
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: "var(--z-overlays-below-video)" }}
              >
                <OverlayLayer
                  layerOrder="below-video"
                  sceneId={sceneId}
                  containerSize={sceneSize}
                  viewport={viewport}
                  htmlOverlays={generatedOverlays}
                  browserOverlays={browserOverlays}
                  fileOverlays={fileOverlays}
                  textOverlays={textOverlays}
                  activeDynamicTargetId={
                    dynamicLayout?.isActive
                      ? dynamicLayout.target?.id
                      : undefined
                  }
                  onSetDynamicLayout={onSetDynamicLayout}
                  onOverlayLayoutChange={props.onOverlayLayoutChange}
                  onRemoveOverlay={props.onRemoveOverlay}
                  onPreviewGenerated={props.onPreviewGenerated}
                  onUpdateOverlayMetadata={props.onUpdateOverlayMetadata}
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
                  onAddFile={props.onAddFile}
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
                  onBannerDoubleClick={props.onBannerDoubleClick}
                />
              </div>
            );
          }

          // --- ABOVE VIDEO ---
          return (
            <React.Fragment key="above-video-group">
              {/* 1. Overlays BEHIND User */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: "var(--z-overlays-above-video)" }}
              >
                <OverlayLayer
                  layerOrder="above-video"
                  sceneId={sceneId}
                  containerSize={sceneSize}
                  viewport={viewport}
                  htmlOverlays={generatedOverlays}
                  browserOverlays={browserOverlays}
                  fileOverlays={fileOverlays}
                  textOverlays={textOverlays}
                  activeDynamicTargetId={
                    dynamicLayout?.isActive
                      ? dynamicLayout.target?.id
                      : undefined
                  }
                  onSetDynamicLayout={onSetDynamicLayout}
                  onOverlayLayoutChange={props.onOverlayLayoutChange}
                  onRemoveOverlay={props.onRemoveOverlay}
                  onPreviewGenerated={props.onPreviewGenerated}
                  onUpdateOverlayMetadata={props.onUpdateOverlayMetadata}
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
                  onAddFile={props.onAddFile}
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
                  onBannerDoubleClick={props.onBannerDoubleClick}
                  filterBehindUser={true}
                />
              </div>

              {/* 2. THE USER (Foreground Layer) */}
              {(isTextDepthEnabled || hasBehindUserOverlay) &&
                !props.canvasLayout &&
                containerSize.width > 0 && (
                  <ForegroundUserLayer
                    videoRef={videoRef}
                    processedCanvas={processedCanvas}
                    facePositionRef={facePositionRef}
                    videoFilter={props.videoFilter}
                    isAutoFramingEnabled={props.isAutoFramingEnabled}
                    zoomSensitivity={props.zoomSensitivity}
                    trackingSpeed={props.trackingSpeed}
                    containerSize={containerSize}
                    layoutMode={props.layoutMode}
                    pipPosition={props.pipPosition}
                    pipSize={props.pipSize}
                    pipRotation={props.pipRotation}
                    cameraShape={props.cameraShape}
                    pipBorder={props.pipBorder}
                    pipShadow={props.pipShadow}
                    customMaskUrl={props.customMaskUrl}
                    sidebarProps={props.sidebarProps}
                    isCameraOn={isVideoOn} // FIX: Pass camera state to handle unmounting
                  />
                )}

              {/* 3. Overlays IN FRONT of User */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: 1500 }}
              >
                <OverlayLayer
                  layerOrder="above-video"
                  sceneId={sceneId}
                  containerSize={sceneSize}
                  viewport={viewport}
                  htmlOverlays={generatedOverlays}
                  browserOverlays={browserOverlays}
                  fileOverlays={fileOverlays}
                  textOverlays={textOverlays}
                  activeDynamicTargetId={
                    dynamicLayout?.isActive
                      ? dynamicLayout.target?.id
                      : undefined
                  }
                  onSetDynamicLayout={onSetDynamicLayout}
                  onOverlayLayoutChange={props.onOverlayLayoutChange}
                  onRemoveOverlay={props.onRemoveOverlay}
                  onPreviewGenerated={props.onPreviewGenerated}
                  onUpdateOverlayMetadata={props.onUpdateOverlayMetadata}
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
                  onAddFile={props.onAddFile}
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
                  onBannerDoubleClick={props.onBannerDoubleClick}
                  filterBehindUser={false}
                />
              </div>
            </React.Fragment>
          );
        })}
    </CanvasShell>
  );
};
