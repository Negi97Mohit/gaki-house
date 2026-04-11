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
} from "@caption-cam/core/types/caption";
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
import { Button } from "@caption-cam/ui/button";
import { AICommandPopover } from "@/features/ai-assistant/ui/AICommandPopover";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { CanvasHoverToolbar } from "@/features/canvas/ui/CanvasHoverToolbar";
import { OverlayElement } from "@/hooks/useSnapGuides";
import { VideoCanvasCamera } from "@/features/canvas/ui/VideoCanvasCamera";
import { ForegroundUserLayer } from "@/features/canvas/ui/ForegroundUserLayer";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { VideoCanvasProps } from "@caption-cam/core/types/videoCanvas";
import { CanvasContent } from "@/features/canvas/ui/CanvasContent";
import { OverlayLayer } from "@/features/canvas/ui/OverlayLayer";
import { SnapLines } from "@/features/canvas/ui/SnapLines";
import { CanvasShell } from "@/features/canvas/ui/CanvasShell";
import { CaptionLayer } from "@/features/canvas/ui/CaptionLayer";
import { BannerToolbarLayer } from "@/features/canvas/ui/BannerToolbarLayer";
import { BroadcastBus } from "@caption-cam/engine/kernel/engine/BroadcastBus";
import { buildSceneGraph } from "@caption-cam/engine/kernel/engine/SceneGraph";
import { useOverlayMediaPool } from "@caption-cam/engine/kernel/hooks/useOverlayMediaPool";
import { useStingerTransition } from "@/features/canvas/hooks/useStingerTransition";

export const VideoCanvas = (props: VideoCanvasProps) => {
  useEffect(() => {
    console.log("[VideoCanvas] mounted");
  }, []);

  // ─── BroadcastBus kernel (Phase C) ────────────────────────────────────────
  // kernelRef guards against React strict-mode double-invoke.
  // The ref holds the actual instance so cleanup destroys exactly what was created.
  const kernelRef = useRef<BroadcastBus | null>(null);

  useEffect(() => {
    // Guard: skip if already initialised (strict-mode second invoke) or no canvas
    if (kernelRef.current) return;
    if (!props.canvasRef?.current) {
      console.warn(
        "[VideoCanvas] kernel useEffect: canvasRef.current is null — skipping",
      );
      return;
    }

    console.log("[VideoCanvas] creating BroadcastBus");
    const kernel = new BroadcastBus(props.canvasRef.current);
    kernelRef.current = kernel;

    // Lift the instance to Index.tsx via onKernelReady
    props.onKernelReady?.(kernel);

    // NOTE: BroadcastBus is re-created on each scene switch because
    // MemoizedVideoCanvas is re-keyed with activeScene.id in MainCanvasArea.
    // This is a Phase C known limitation; addressed in a future cleanup pass
    // by lifting the kernel to CanvasContainer.
    return () => {
      kernel.destroy();
      kernelRef.current = null;
      console.log("[VideoCanvas] BroadcastBus destroyed on unmount");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty — kernel is created once per mount lifecycle
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
    })),
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
    })),
  );

  // Resize Logic
  useCanvasResize(canvasContainerRef, sceneRef, props.isFullscreen);

  // Canvas Dimension Sync
  useCanvasDimensionSync({
    canvasRef: props.canvasRef,
    sceneSize,
    kernelRef,
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
    emptyGridPanels = [],
    selectedEmptyGridPanelId,
    setSelectedEmptyGridPanelId,
    onAddEmptyGridPanel,
    onRemoveEmptyGridPanel,
    onEmptyGridPanelLayoutChange,
    onEmptyGridPanelContentChange,
    onEmptyGridPanelAssetSelect,
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
    [textOverlays, browserOverlays, fileOverlays, generatedOverlays],
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

  // F2: Stinger Transition Hook
  useStingerTransition(props.stingerConfig || null, kernelRef as any);

  // F3: Overlay Media Pool (eager loading of OBS assets)
  // Only start sending frames to the worker once ALL assets for the scene are ready.
  const { items: overlayItems, isReady: overlaysReady } = useOverlayMediaPool(
    fileOverlays,
    sceneId,
    (id, layout) => {
      setTimeout(() => {
        props.onFileLayoutChange?.(id, layout);
      }, 0);
    }
  );

  useEffect(() => {
    if (overlaysReady && kernelRef.current) {
      kernelRef.current.startOverlayFeeds(overlayItems);
    } else if (!overlaysReady && kernelRef.current) {
      kernelRef.current.stopOverlayFeeds();
    }
  }, [overlaysReady, overlayItems]);

  // Compute the ratio of logical scene pixels to rendered DOM pixels.
  // When the canvas is letterboxed inside its container, sceneRef.clientWidth < sceneSize.width.
  // HybridDraggable receives screen-space pointer events but works in logical pixels,
  // so pointer deltas must be divided by this ratio to get 1:1 cursor tracking.
  const viewportScale = React.useMemo(() => {
    const el = sceneRef.current;
    if (!el || sceneSize.width === 0) return 1;
    const rendered = el.getBoundingClientRect().width;
    return rendered > 0 ? sceneSize.width / rendered : 1;
  }, [sceneSize.width]);
  // Re-compute on resize by watching sceneSize (ResizeObserver already updates it).

  const hasScreenSection = props.canvasLayout?.sections.some(
    (s) => s.content.type === "screen",
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
            : s,
        );
        if (
          updatedSections.some(
            (s, i) =>
              s.content.type !== props.canvasLayout!.sections[i].content.type,
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
      isCameraOn={props.isVideoOn}
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
      onCameraCanvasReady={(canvas) =>
        kernelRef.current?.startCameraFeed(canvas)
      }
    />
  );

  // captionBaseStyle, captionWidth, captionHeight moved to CaptionLayer

  return (
    <CanvasShell
      containerRef={canvasContainerRef}
      sceneRef={sceneRef}
      sceneStyle={getCanvasAspectRatioStyle(
        props.sidebarProps.canvasAspectRatio,
        props.sidebarProps.customAspectRatio,
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
        onAddEmptyGridPanel={onAddEmptyGridPanel}
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
        onVideoElementReady={(video) =>
          kernelRef.current?.startScreenFeed(video)
        }
        onVideoElementUnmount={() => kernelRef.current?.stopScreenFeed()}
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
                emptyGridPanels={[]}
                activeDynamicTargetId={
                  dynamicLayout?.isActive ? dynamicLayout.target?.id : undefined
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
                viewportScale={viewportScale}
                selectedEmptyGridPanelId={selectedEmptyGridPanelId ?? null}
                onSelectEmptyGridPanel={setSelectedEmptyGridPanelId ?? (() => {})}
                onRemoveEmptyGridPanel={onRemoveEmptyGridPanel ?? (() => {})}
                onEmptyGridPanelLayoutChange={onEmptyGridPanelLayoutChange ?? (() => {})}
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
                emptyGridPanels={[]}
                activeDynamicTargetId={
                  dynamicLayout?.isActive ? dynamicLayout.target?.id : undefined
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
                viewportScale={viewportScale}
                selectedEmptyGridPanelId={null}
                onSelectEmptyGridPanel={() => {}}
                onRemoveEmptyGridPanel={() => {}}
                onEmptyGridPanelLayoutChange={() => {}}
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
                emptyGridPanels={emptyGridPanels}
                activeDynamicTargetId={
                  dynamicLayout?.isActive ? dynamicLayout.target?.id : undefined
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
                viewportScale={viewportScale}
                selectedEmptyGridPanelId={selectedEmptyGridPanelId ?? null}
                onSelectEmptyGridPanel={setSelectedEmptyGridPanelId ?? (() => {})}
                onRemoveEmptyGridPanel={onRemoveEmptyGridPanel ?? (() => {})}
                onEmptyGridPanelLayoutChange={onEmptyGridPanelLayoutChange ?? (() => {})}
                onEmptyGridPanelContentChange={onEmptyGridPanelContentChange}
                onEmptyGridPanelAssetSelect={onEmptyGridPanelAssetSelect}
                cameraStream={cameraStream}
                screenStream={screenStream}
                videoDevices={props.videoDevices}
                blankCanvasColor={props.blankCanvasColor}
              />
            </div>
          </React.Fragment>
        );
      })}
    </CanvasShell>
  );
};
