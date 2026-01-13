import React, { useMemo, useRef } from "react";
import { Rnd } from "react-rnd";
import { useTheme } from "next-themes";
import { cn } from "@/shared/lib/utils";
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
import {
  getNumericAspectRatio,
  getCanvasAspectRatioStyle,
} from "@/features/canvas/ui/VideoCanvasHelpers";
import { useVideoStreams } from "@/features/stream/hooks/useVideoStreams";
import { usePipGestures } from "@/hooks/usePipGestures";
import { Sparkles } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { AICommandPopover } from "@/features/ai-assistant/ui/AICommandPopover";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { CanvasHoverToolbar } from "@/features/canvas/ui/CanvasHoverToolbar";
import { OverlayElement } from "@/hooks/useSnapGuides";
import { CaptionRenderer } from "@/features/canvas/ui/CaptionRenderer";
import { TextEditingToolbar } from "@/features/canvas/ui/TextEditingToolbar";
import { VideoCanvasCamera } from "@/features/canvas/ui/VideoCanvasCamera";
import { ForegroundUserLayer } from "@/features/canvas/ui/ForegroundUserLayer";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { VideoCanvasProps } from "@/types/videoCanvas";
import { CanvasContent } from "@/features/canvas/ui/CanvasContent";
import { OverlayLayer } from "@/features/canvas/ui/OverlayLayer";
import { SnapLines } from "@/features/canvas/ui/SnapLines";

export const VideoCanvas = (props: VideoCanvasProps) => {
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

  const captionBaseStyle: React.CSSProperties = {
    fontFamily: props.liveCaptionStyle.fontFamily,
    fontSize: `${props.liveCaptionStyle.fontSize}px`,
    color: props.liveCaptionStyle.color,
    fontWeight: props.liveCaptionStyle.bold ? "bold" : "normal",
    fontStyle: props.liveCaptionStyle.italic ? "italic" : "normal",
    textDecoration: props.liveCaptionStyle.underline ? "underline" : "none",
    textShadow: props.liveCaptionStyle.textShadow,
  };

  // Allow width to be dynamic based on style, default to ~50% or 600px equivalent
  const captionWidthPercent = props.liveCaptionStyle.width || 50;
  const captionWidth = (sceneSize.width * captionWidthPercent) / 100;
  const captionHeight = "auto"; // Allow height to grow with text

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

        {captionsEnabled &&
          (fullTranscript || interimTranscript) &&
          sceneSize.width > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: "var(--z-caption)" }}
            >
              <Rnd
                key={`${sceneSize.width}-${captionWidthPercent}`}
                size={{
                  width: captionWidth,
                  height: "auto",
                }}
                position={{
                  x:
                    (sceneSize.width * props.liveCaptionStyle.position.x) /
                      100 -
                    captionWidth / 2,
                  y:
                    (sceneSize.height * props.liveCaptionStyle.position.y) /
                      100 -
                    50, // Approx vertical centering offset since height is auto
                }}
                enableResizing={{
                  top: false,
                  right: true,
                  bottom: false,
                  left: true,
                  topRight: false,
                  bottomRight: false,
                  bottomLeft: false,
                  topLeft: false,
                }}
                className="pointer-events-auto border-2 border-transparent hover:border-primary/50 transition-colors rounded-lg"
                style={{ position: "absolute" }}
                onDragStop={(e, d) => {
                  const rect = d.node.getBoundingClientRect();
                  const centerX = d.x + captionWidth / 2;
                  const centerY = d.y + rect.height / 2;

                  const newXPercent = (centerX / sceneSize.width) * 100;
                  const newYPercent = (centerY / sceneSize.height) * 100;

                  props.onCaptionLayoutChange({
                    position: { x: newXPercent, y: newYPercent },
                  });
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                  const newWidthPx = parseInt(ref.style.width, 10);
                  const newWidthPercent = (newWidthPx / sceneSize.width) * 100;

                  // Update position (center) based on new width and new top-left (position)
                  const newCenterX = position.x + newWidthPx / 2;
                  const newXPercent = (newCenterX / sceneSize.width) * 100;

                  // Maintain Y center
                  const rect = ref.getBoundingClientRect();
                  const newCenterY = position.y + rect.height / 2;
                  const newYPercent = (newCenterY / sceneSize.height) * 100;

                  props.onCaptionLayoutChange({
                    size: { width: newWidthPercent, height: 0 },
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

        {props.editingBannerText && props.onBannerTextStyleChange && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ zIndex: "var(--z-text-toolbar, 9999)" }}
          >
            {(() => {
              const bannerOverlay = generatedOverlays.find(
                (o) => o.id === props.editingBannerText?.overlayId
              );
              if (!bannerOverlay) return null;

              const position = {
                x: (bannerOverlay.layout.position.x / 100) * sceneSize.width,
                y: (bannerOverlay.layout.position.y / 100) * sceneSize.height,
              };

              const cssStyle = props.editingBannerText.style;
              const captionStyle: CaptionStyle = {
                ...props.liveCaptionStyle,
                fontFamily: (cssStyle.fontFamily as string) || "Inter",
                fontSize: parseInt((cssStyle.fontSize as string) || "24", 10),
                color: (cssStyle.color as string) || "#ffffff",
                backgroundColor:
                  (cssStyle.backgroundColor as string) || "transparent",
                bold:
                  cssStyle.fontWeight === "bold" || cssStyle.fontWeight === 700,
                italic: cssStyle.fontStyle === "italic",
                underline:
                  (cssStyle.textDecoration as string)?.includes("underline") ||
                  false,
                textShadow: cssStyle.textShadow as string,
                textAlign: (cssStyle.textAlign as any) || "left",
                position: { x: 0, y: 0 },
                shape: "rectangular",
                animation: "none",
                outline: false,
                shadow: false,
                rotation: 0,
                border: false,
                borderColor: "transparent",
                borderWidth: 0,
              };

              const proxyOverlay: TextOverlayState = {
                id: props.editingBannerText.overlayId,
                content: props.editingBannerText.currentText,
                style: captionStyle,
                layout: bannerOverlay.layout,
              };

              return (
                <div className="pointer-events-auto">
                  <TextEditingToolbar
                    overlay={proxyOverlay}
                    position={position}
                    containerRef={sceneRef}
                    elementWidth={
                      (bannerOverlay.layout.size.width / 100) * sceneSize.width
                    }
                    elementHeight={
                      (bannerOverlay.layout.size.height / 100) *
                      sceneSize.height
                    }
                    onLayoutChange={(id: string, partialLayout: any) => {
                      if (partialLayout.position)
                        props.onOverlayLayoutChange(
                          id,
                          "position",
                          partialLayout.position
                        );
                      if (partialLayout.size)
                        props.onOverlayLayoutChange(
                          id,
                          "size",
                          partialLayout.size
                        );
                      if (partialLayout.rotation !== undefined)
                        props.onOverlayLayoutChange(
                          id,
                          "rotation",
                          partialLayout.rotation
                        );
                      if (partialLayout.isBehindUser !== undefined) {
                        props.onOverlayLayoutChange(
                          id,
                          "isBehindUser",
                          partialLayout.isBehindUser
                        );
                        if (props.onUpdateOverlayMetadata) {
                          props.onUpdateOverlayMetadata(id, {
                            ...bannerOverlay.metadata,
                            data: {
                              ...bannerOverlay.metadata?.data,
                              isBehindUser: partialLayout.isBehindUser,
                            },
                          });
                        }
                      }
                    }}
                    onStyleChange={(id, partialStyle) => {
                      const newCssStyle: React.CSSProperties = {};
                      if (partialStyle.fontFamily)
                        newCssStyle.fontFamily = partialStyle.fontFamily;
                      if (partialStyle.fontSize)
                        newCssStyle.fontSize = `${partialStyle.fontSize}px`;
                      if (partialStyle.color)
                        newCssStyle.color = partialStyle.color;
                      if (partialStyle.backgroundColor)
                        newCssStyle.backgroundColor =
                          partialStyle.backgroundColor;
                      if (partialStyle.bold !== undefined)
                        newCssStyle.fontWeight = partialStyle.bold
                          ? "bold"
                          : "normal";
                      if (partialStyle.italic !== undefined)
                        newCssStyle.fontStyle = partialStyle.italic
                          ? "italic"
                          : "normal";
                      if (partialStyle.underline !== undefined)
                        newCssStyle.textDecoration = partialStyle.underline
                          ? "underline"
                          : "none";
                      if (partialStyle.textShadow !== undefined)
                        newCssStyle.textShadow = partialStyle.textShadow;
                      if (partialStyle.textAlign)
                        newCssStyle.textAlign = partialStyle.textAlign;

                      props.onBannerTextStyleChange?.(newCssStyle);
                    }}
                  />
                </div>
              );
            })()}
          </div>
        )}

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
      </div>
    </div>
  );
};
