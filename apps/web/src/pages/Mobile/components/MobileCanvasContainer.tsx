import React, { useCallback, useRef, useMemo, useState } from "react";
import { toast } from "sonner";
import { MainCanvasArea } from "@/pages/Index/components/MainCanvasArea";
import { MobileStudioToolsDrawer } from "./MobileStudioToolsDrawer";
import { useMobileSceneAdapter } from "./useMobileSceneAdapter";
import {
  CaptionStyle,
  GeneratedOverlay,
  SceneState,
  SceneTransition,
  CanvasSectionCameraState,
  DEFAULT_CAMERA_STATE,
  TextOverlayState,
  FileOverlayState,
  FileType,
} from "@gaki/core/types/caption";

import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { zIndex } from "@/lib/zIndex";
import { generateId } from "@gaki/core/lib/id";
import { VaultFile } from "@gaki/core/types/vault";

// Hooks
import { useCanvasPaste } from "@/pages/Index/hooks/useCanvasPaste";
import { useCanvasAi } from "@/pages/Index/hooks/useCanvasAi";
import { useCanvasBanners } from "@/pages/Index/hooks/useCanvasBanners";
import { getAllPropsForScene } from "@/pages/Index/utils/canvasProps";
import { useLayoutManager } from "@/pages/Index/hooks/useLayoutManager";

// Stores & Optimization
import { useShallow } from "zustand/react/shallow";
import { useCanvasStore } from "@/stores/canvas.store";
import { useMediaStore } from "@/stores/media.store";
import { useStreamStore } from "@/stores/stream.store";
import { useSceneStore } from "@/stores/scene.store";
import { useUiStore } from "@/stores/ui.store";

export interface MobileCanvasContainerProps {
  layoutManager?: any; // optional — real hook is used internally

  vaultFiles: VaultFile[];
  onAddVaultFiles: (
    files: FileList | File[],
    source: VaultFile["source"]
  ) => void;
  onRemoveVaultFile: (id: string) => void;
  onClearVault: () => void;
  remoteStream?: MediaStream | null;
  trigger?: React.ReactNode;
  isDrawerOpen?: boolean;
  onDrawerOpenChange?: (open: boolean) => void;
}

export const MobileCanvasContainer: React.FC<MobileCanvasContainerProps> = ({
  layoutManager: _externalLayoutManager,

  vaultFiles,
  onAddVaultFiles,
  onRemoveVaultFile,
  onClearVault,
  remoteStream,
  trigger,
  isDrawerOpen,
  onDrawerOpenChange,
}) => {
  const hasAiPopoverAutoOpenedRef = useRef(false);

  // Local ref for canvas since we removed the prop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // --- Excalidraw State ---
  const [isDrawing, setIsDrawing] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly any[]>(
    []
  );

  const {
    layoutMode,
    setLayoutMode,
    cameraShape,
    setCameraShape,
    splitRatio,
    setSplitRatio,
    pipPosition,
    setPipPosition,
    pipSize,
    setPipSize,
    isTransitioning,
    activeTransition,
    dynamicLayout,
    isAudioOn,
    setAudioOn,
    isVideoOn,
    setVideoOn,
    audioDevices,
    selectedAudioDevice,
    setSelectedAudioDevice,
    videoDevices,
    selectedVideoDevice,
    setSelectedVideoDevice,
    selectedScreenSourceId,
    setSelectedScreenSourceId,
    screenShareMode,
    setScreenShareMode,
    customMaskUrl,
    setCustomMaskUrl,
    activeOverlays,
    setActiveOverlays,
    textOverlays,
    setTextOverlays,
    fileOverlays,
    setFileOverlays,
    browserOverlays,
    setBrowserOverlays,
    canvasLayout,
    setCanvasLayout,
    backgroundEffect,
    setBackgroundEffect,
    backgroundImageUrl,
    setBackgroundImageUrl,
    blankCanvasColor,
    setBlankCanvasColor,
    videoFilter,
    setVideoFilter,
    captionStyle,
    setCaptionStyle,
    dynamicStyle,
    setDynamicStyle,
    isAiModeEnabled,
    setAiModeEnabled,
    captionsEnabled,
    setCaptionsEnabled,
    previousScene,
    selectedBrowserId,
    setSelectedBrowserId,
    selectedFileId,
    setSelectedFileId,
    selectedTextId,
    setSelectedTextId,
    selectedGeneratedId,
    setSelectedGeneratedId,
    deselectAll,
    // Added State
    pipRotation,
    setPipRotation,
    pipBorder,
    setPipBorder,
    pipShadow,
    setPipShadow,
    cameraAspectRatio,
    setCameraAspectRatio,
    customAspectRatio,
    setCustomAspectRatio,
    activeInteractiveFilter,
    setActiveInteractiveFilter,
    filterIntensity,
    setFilterIntensity,
    filterColor,
    setFilterColor,
    filterTarget,
    setFilterTarget,
    isAutoFramingEnabled,
    setIsAutoFramingEnabled,
    isBeautifyEnabled,
    setIsBeautifyEnabled,
    isLowLightEnabled,
    setIsLowLightEnabled,
    isNeonEdgeEnabled,
    setIsNeonEdgeEnabled,
    neonIntensity,
    setNeonIntensity,
    neonColor,
    setNeonColor,
    cameraBackground,
    setCameraBackground,
    customBackgroundUrl,
    setCustomBackgroundUrl,
    zoomSensitivity,
    setZoomSensitivity,
    trackingSpeed,
    setTrackingSpeed,
    isFaceTrackingEnabled,
    setIsFaceTrackingEnabled,
    canvasAspectRatio,
    setCanvasAspectRatio,
    isMouseActive,
    isFullscreen,
    setFullscreen,
    isFsSidebarOpen,
    setFsSidebarOpen,
    setShowSessionsPanel,
    showSettings,
    setShowSettings,
    isChatbotOpen,
    setChatbotOpen,
    activeScene,
    updateActiveScene,
    updateSceneProperty,
  } = useMobileSceneAdapter();


  // Selection object wrapper
  const selectionWrapper = useMemo(
    () => ({
      selectedBrowserId,
      setSelectedBrowserId,
      selectedFileId,
      setSelectedFileId,
      selectedTextId,
      setSelectedTextId,
      selectedGeneratedId,
      setSelectedGeneratedId,
      handleDeselectAll: deselectAll,
    }),
    [
      selectedBrowserId,
      selectedFileId,
      selectedTextId,
      selectedGeneratedId,
      setSelectedBrowserId,
      setSelectedFileId,
      setSelectedTextId,
      setSelectedGeneratedId,
      deselectAll,
    ]
  );

  // Hooks
  useCanvasPaste({
    activeScene,
    updateActiveScene,
    selection: selectionWrapper,
    isDrawing, // Pass isDrawing to prevent paste capturing when drawing
  });

  const { isProcessingAi, processTranscript } = useCanvasAi({
    activeScene,
    updateActiveScene,
    setSavedOverlays: () => { },
  });

  const bannerLogic = useCanvasBanners({
    activeScene,
    updateActiveScene,
    selection: selectionWrapper,
  });

  // Real Layout Manager (replaces the stubbed one from props)
  const layoutManager = useLayoutManager({
    activeScene,
    updateActiveScene,
    setSelectedTextId,
    setSelectedFileId,
    setSelectedBrowserId,
  });

  // Handlers
  const handleSetIsAudioOn = (val: boolean) => setAudioOn(val);
  const handleSetIsVideoOn = (val: boolean) => setVideoOn(val);
  const handleSetSelectedAudioDevice = (val: string) =>
    setSelectedAudioDevice(val);
  const handleSetSelectedVideoDevice = (val: string) =>
    setSelectedVideoDevice(val);

  const handleSetScreenShareMode = (val: "off" | "screen" | "canvas") => {
    setScreenShareMode(val);
    setLayoutMode(val !== "off" ? "pip" : "solo");
  };

  const handleSetCaptionStyle = (val: CaptionStyle) => {
    setCaptionStyle(val);
  };

  const handleCustomMaskUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === "string")
        setCustomMaskUrl(e.target.result);
      toast.success("Custom camera mask uploaded!");
    };
    reader.readAsDataURL(file);
  };

  const handleCanvasBackgroundUpload = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Invalid file type. Please upload an image.");
      return;
    }
    const url = URL.createObjectURL(file);
    setBackgroundEffect("image");
    setBackgroundImageUrl(url);
    toast.success("Custom canvas background uploaded!");
  };

  // Callbacks for GetAllProps
  const commonCallbacks = {
    updateSceneProperty,
    updateActiveScene,
    handleSetIsAudioOn,
    handleSetIsVideoOn,
    handleSetSelectedAudioDevice,
    handleSetSelectedVideoDevice,
    handleSetScreenShareMode,
    handleSetCaptionStyle,
    handleCustomMaskUpload,
    handleCanvasBackgroundUpload,
    handleGridAssetSelect: (id: string, asset: AssetResult) => {
      /* Reuse logic */
    },
    handleSectionCameraSettingsChange: (id: string, settings: any) => {
      /* Reimplement */
    },
    onCanvasPresetSelect: layoutManager.handleCanvasPresetSelect,
    onSaveCanvasPreset: layoutManager.handleSaveCanvasPreset,
    onDeleteCanvasPreset: layoutManager.handleDeleteCanvasPreset,
    shareCanvasPreset: layoutManager.shareCanvasPreset,
    unshareCanvasPreset: layoutManager.unshareCanvasPreset,
    onAddSavedOverlay: (overlay: GeneratedOverlay) => {
      setActiveOverlays([
        ...activeOverlays,
        { ...overlay, id: generateId("overlay") },
      ]);
    },
    onDeleteSavedOverlay: (id: string) => { },
    onBannerTextStyleChange: bannerLogic.handleBannerTextStyleChange,
    onBannerTextClose: bannerLogic.onBannerTextClose,
  };

  const commonData = {
    audioDevices,
    videoDevices,
    savedOverlays: [],
    customPresets: layoutManager.customPresets,
    publicPresets: layoutManager.publicPresets,
    isLoadingPublic: layoutManager.isLoadingPublic,
    editingBannerText: bannerLogic.editingBannerText,
    hasAiPopoverAutoOpenedRef,
  };

  const activeSceneProps = useMemo(
    () =>
      activeScene
        ? getAllPropsForScene(activeScene, commonCallbacks, commonData)
        : null,
    [activeScene, layoutManager, bannerLogic.editingBannerText, commonCallbacks]
  );

  const previousSceneProps = useMemo(
    () =>
      previousScene
        ? getAllPropsForScene(previousScene as any, commonCallbacks, commonData)
        : null,
    [
      previousScene,
      layoutManager,
      bannerLogic.editingBannerText,
      commonCallbacks,
    ]
  );

  // Inject handlers
  if (activeSceneProps?.sidebarProps) {
    // @ts-ignore
    activeSceneProps.sidebarProps.onAddSocialBanner =
      bannerLogic.handleAddSocialBanner;
    // @ts-ignore
    activeSceneProps.sidebarProps.onAddAnimatedBanner =
      bannerLogic.handleAddAnimatedBanner;
    // @ts-ignore
    activeSceneProps.sidebarProps.onAddTextOverlay = () => { };
  }

  return (
    <>
      <MobileStudioToolsDrawer
        isOpen={isDrawerOpen}
        onOpenChange={onDrawerOpenChange}
        layoutManager={layoutManager}
      />



      <MainCanvasArea
        activeScene={activeScene}
        previousScene={previousScene}
        activeSceneProps={activeSceneProps}
        previousSceneProps={previousSceneProps}
        globalCanvasProps={{
          remoteStream,
          isChatbotOpen,
          onChatbotToggle: (val) =>
            setChatbotOpen(
              typeof val === "function" ? val(isChatbotOpen) : val
            ),
          isFullscreen,
          onToggleFullscreen: () => setFullscreen(!isFullscreen),
          isFsSidebarOpen,
          onFsSidebarToggle: setFsSidebarOpen,
          dynamicLayout,
          onOpenSessions: () => setShowSessionsPanel(true),
          onOpenSettings: () => setShowSettings(!showSettings),
          isMouseActive,
          isProcessingAi,
          onProcessTranscript: processTranscript,

          // Excalidraw props
          isDrawing,
          setIsDrawing,
          excalidrawElements,
          setExcalidrawElements,

          onOverlayLayoutChange: (id, key, value) => {
            const updated = activeOverlays.map((o) =>
              o.id === id ? { ...o, layout: { ...o.layout, [key]: value } } : o
            );
            setActiveOverlays(updated);
          },
          onRemoveOverlay: (id) =>
            setActiveOverlays(activeOverlays.filter((o) => o.id !== id)),

          canvasRef, // Passing reference
          portalContainer: mainContainerRef.current,
          // ... other props
          // Browser
          selectedBrowserId,
          setSelectedBrowserId,
          onRemoveBrowser: (id) =>
            setBrowserOverlays(browserOverlays.filter((b) => b.id !== id)),
          onBrowserUrlChange: (id, url) =>
            setBrowserOverlays(
              browserOverlays.map((b) => (b.id === id ? { ...b, url } : b))
            ),

          // Text
          selectedTextId,
          setSelectedTextId,
          onRemoveTextOverlay: (id) =>
            setTextOverlays(textOverlays.filter((t) => t.id !== id)),
          onTextLayoutChange: (id, layout) =>
            setTextOverlays(
              textOverlays.map((t) =>
                t.id === id ? { ...t, layout: { ...t.layout, ...layout } } : t
              )
            ),
          onTextStyleChange: (id, style) =>
            setTextOverlays(
              textOverlays.map((t) =>
                t.id === id ? { ...t, style: { ...t.style, ...style } } : t
              )
            ),
          onTextContentChange: (id, content) =>
            setTextOverlays(
              textOverlays.map((t) => (t.id === id ? { ...t, content } : t))
            ),

          // File
          selectedFileId,
          setSelectedFileId,
          onRemoveFile: (id) =>
            setFileOverlays(fileOverlays.filter((f) => f.id !== id)),
          onFileLayoutChange: (id, layout) =>
            setFileOverlays(
              fileOverlays.map((f) =>
                f.id === id ? { ...f, layout: { ...f.layout, ...layout } } : f
              )
            ),
          onAddFile: (file) => {
            /* TODO: Implement global file add if needed, or rely on activeSceneProps */
          },

          // Generated
          selectedGeneratedId,
          setSelectedGeneratedId,
          onPreviewGenerated: (id, preview) =>
            setActiveOverlays(
              activeOverlays.map((o) => (o.id === id ? { ...o, preview } : o))
            ),
          onUpdateOverlayMetadata: (id, metadata) =>
            setActiveOverlays(
              activeOverlays.map((o) => (o.id === id ? { ...o, metadata } : o))
            ),

          // Selection
          onDeselectAll: selectionWrapper.handleDeselectAll,
        }}
        isTransitioning={isTransitioning}
        activeTransition={activeTransition as unknown as SceneTransition}
      />

    </>
  );
};
