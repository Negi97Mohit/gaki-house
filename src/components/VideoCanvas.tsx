import React, { useMemo, useRef } from "react";
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
} from "@/components/video-canvas/VideoCanvasHelpers";
import { useVideoStreams } from "@/hooks/useVideoStreams";
import { usePipGestures } from "@/hooks/usePipGestures";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AICommandPopover } from "@/components/AICommandPopover";
import { AssetResult } from "@/components/AssetLibrary";
import { CanvasHoverToolbar } from "@/components/CanvasHoverToolbar";
import { OverlayElement } from "@/hooks/useSnapGuides";
import { CaptionRenderer } from "@/components/CaptionRenderer";
import { TextEditingToolbar } from "@/components/TextEditingToolbar";
import { VideoCanvasCamera } from "@/components/video-canvas/VideoCanvasCamera";
import { ForegroundUserLayer } from "@/components/video-canvas/ForegroundUserLayer";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { VideoCanvasProps } from "@/types/videoCanvas";
import { CanvasContent } from "@/components/video-canvas/CanvasContent";

// VideoCanvasProps moved to @/types/videoCanvas
import { OverlayLayer } from "@/components/video-canvas/OverlayLayer";
import { SnapLines } from "@/components/video-canvas/SnapLines";

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

  // --- Text Behind User State ---
  const [isTextDepthEnabled, setIsTextDepthEnabled] = React.useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Auto-disable depth mode when entering PIP mode
  React.useEffect(() => {
    if (props.layoutMode === 'pip' && isTextDepthEnabled) {
      setIsTextDepthEnabled(false);
    }
  }, [props.layoutMode]);

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

  // Check if any overlay is explicitly set to be behind the user
  const hasBehindUserOverlay = useMemo(() => {
    return allOverlays.some(o => o.layout.isBehindUser);
  }, [allOverlays]);

  const isSegmentationEnabled =
    isTextDepthEnabled ||
    hasBehindUserOverlay ||
    (props.sidebarProps?.filterTarget && props.sidebarProps.filterTarget !== "both");

  const { processedCanvas, facePositionRef } = useCameraEffects({
    videoElement: videoRef.current,
    isSegmentationEnabled: !!isSegmentationEnabled,
    isFaceTrackingEnabled: props.isAutoFramingEnabled,
    onUserPositionChange: props.onUserPositionChange,
  });

  // --- Hooks ---
  // Check if any grid section requires screen sharing
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
      // If we were sharing for a grid section, clear it locally
      if (props.canvasLayout && props.onCanvasLayoutChange) {
        const updatedSections = props.canvasLayout.sections.map((s) =>
          s.content.type === "screen"
            ? { ...s, content: { type: "empty" } as const } // Cast to const to satisfy strict union types if needed
            : s
        );
        // Only update if there was actually a screen section to clear
        if (
          updatedSections.some(
            (s, i) => s.content.type !== props.canvasLayout!.sections[i].content.type
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

  // Calculate Default Mode: No active selections, not editing text/banner/etc., and NOT in a grid layout.
  const isDefaultMode =
    !props.selectedTextId &&
    !props.selectedBrowserId &&
    !props.selectedFileId &&
    !props.selectedGeneratedId &&
    !props.editingBannerText &&
    !props.dynamicLayout.isActive &&
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
    />
  );

  // renderContent removed, replaced by CanvasContent



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
          setIsDraggingDynamicSplitter={setIsDraggingDynamicSplitter}
          renderCamera={() => renderCamera()}
          theme={theme}
          fullTranscript={fullTranscript}
          interimTranscript={interimTranscript}
          sidebarProps={props.sidebarProps}
          screenStream={screenStream}
          cameraStream={cameraStream}
        />

        {captionsEnabled &&
          (fullTranscript || interimTranscript) &&
          sceneSize.width > 0 && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ zIndex: "var(--z-caption)" }}
            >
              <Rnd
                key={sceneSize.width}
                default={{
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
                className="pointer-events-auto"
                style={{ position: "absolute" }}
                onDragStop={(e, d) => {
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
                      if (partialLayout.position) props.onOverlayLayoutChange(id, "position", partialLayout.position);
                      if (partialLayout.size) props.onOverlayLayoutChange(id, "size", partialLayout.size);
                      if (partialLayout.rotation !== undefined) props.onOverlayLayoutChange(id, "rotation", partialLayout.rotation);
                      if (partialLayout.isBehindUser !== undefined) {
                        props.onOverlayLayoutChange(id, "isBehindUser", partialLayout.isBehindUser);
                        // Also update metadata if available
                        if (props.onUpdateOverlayMetadata) {
                          props.onUpdateOverlayMetadata(id, {
                            ...bannerOverlay.metadata,
                            data: {
                              ...bannerOverlay.metadata?.data,
                              isBehindUser: partialLayout.isBehindUser
                            }
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
          // We only apply the sandwich logic for 'above-video'. 
          // 'below-video' is behind everything anyway.
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
                    dynamicLayout.isActive ? dynamicLayout.target?.id : undefined
                  }
                  onSetDynamicLayout={onSetDynamicLayout}
                  onOverlayLayoutChange={props.onOverlayLayoutChange}
                  onRemoveOverlay={props.onRemoveOverlay}
                  onPreviewGenerated={props.onPreviewGenerated}
                  onUpdateOverlayMetadata={props.onUpdateOverlayMetadata}
                  selectedGeneratedId={props.selectedGeneratedId}
                  onSelectGenerated={props.setSelectedGeneratedId}
                  portalContainer={typeof props.portalContainer === 'function' ? null : props.portalContainer}
                  allOverlays={allOverlays}
                  onSnapGuidesChange={(guides) => snapLinesRef.current?.setGuides(guides)}
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
                  onBannerDoubleClick={props.onBannerDoubleClick}
                // No filtering for behind user here as it's already below video
                />
              </div>
            );
          }

          // --- ABOVE VIDEO (The Sandwich) ---
          return (
            <React.Fragment key="above-video-group">
              {/* 1. Overlays BEHIND User */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ zIndex: "var(--z-overlays-above-video)" }} // z-index 150 (Below User 1000)
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
                    dynamicLayout.isActive ? dynamicLayout.target?.id : undefined
                  }
                  onSetDynamicLayout={onSetDynamicLayout}
                  onOverlayLayoutChange={props.onOverlayLayoutChange}
                  onRemoveOverlay={props.onRemoveOverlay}
                  onPreviewGenerated={props.onPreviewGenerated}
                  onUpdateOverlayMetadata={props.onUpdateOverlayMetadata}
                  selectedGeneratedId={props.selectedGeneratedId}
                  onSelectGenerated={props.setSelectedGeneratedId}
                  portalContainer={typeof props.portalContainer === 'function' ? null : props.portalContainer}
                  allOverlays={allOverlays}
                  onSnapGuidesChange={(guides) => snapLinesRef.current?.setGuides(guides)}
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
                  onBannerDoubleClick={props.onBannerDoubleClick}
                  filterBehindUser={true}
                />
              </div>

              {/* 2. THE USER (Cutout Layer) - Hide when in PIP mode since camera is in PIP window */}
              {(isTextDepthEnabled || hasBehindUserOverlay) && !props.canvasLayout && containerSize.width > 0 && props.layoutMode !== 'pip' && (
                <ForegroundUserLayer
                  videoRef={videoRef}
                  processedCanvas={processedCanvas}
                  facePositionRef={facePositionRef}
                  videoFilter={props.videoFilter}
                  isAutoFramingEnabled={props.isAutoFramingEnabled}
                  zoomSensitivity={props.zoomSensitivity}
                  trackingSpeed={props.trackingSpeed}
                  containerSize={containerSize}
                />
              )}

              {/* 3. Overlays IN FRONT of User (Must be > 1000) */}
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
                    dynamicLayout.isActive ? dynamicLayout.target?.id : undefined
                  }
                  onSetDynamicLayout={onSetDynamicLayout}
                  onOverlayLayoutChange={props.onOverlayLayoutChange}
                  onRemoveOverlay={props.onRemoveOverlay}
                  onPreviewGenerated={props.onPreviewGenerated}
                  onUpdateOverlayMetadata={props.onUpdateOverlayMetadata}
                  selectedGeneratedId={props.selectedGeneratedId}
                  onSelectGenerated={props.setSelectedGeneratedId}
                  portalContainer={typeof props.portalContainer === 'function' ? null : props.portalContainer}
                  allOverlays={allOverlays}
                  onSnapGuidesChange={(guides) => snapLinesRef.current?.setGuides(guides)}
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
                  onBannerDoubleClick={props.onBannerDoubleClick}
                  filterBehindUser={false}
                />
              </div>
            </React.Fragment>
          );
        })}
      </div>

      {containerSize.width > 0 && (
        <Rnd
          style={{ zIndex: "var(--z-ai-popover-trigger)" }}
          cancel=".aicp-content"
          // REDUCED SIZE: 64 -> 48 to be less obtrusive
          size={{ width: 48, height: 48 }}
          position={{
            // REDUCED OFFSET: 32 -> 24 (half of 48) to keep it centered
            x: (props.aiButtonPosition.x / 100) * containerSize.width - 24,
            y: (props.aiButtonPosition.y / 100) * containerSize.height - 24,
          }}
          onDragStop={(e, d) => {
            // REDUCED OFFSET: 32 -> 24
            const newX = ((d.x + 24) / containerSize.width) * 100;
            const newY = ((d.y + 24) / containerSize.height) * 100;
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
              variant="outline"
              className="rounded-full h-12 w-12 shadow-lg bg-black border-2 border-yellow-400 hover:bg-black/80 hover:border-yellow-300 text-yellow-400"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </AICommandPopover>
        </Rnd>
      )}
    </div>
  );
};
