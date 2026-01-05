import React, { useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { MainCanvasArea } from "./MainCanvasArea";
import { FloatingControlsPanel } from "@/features/studio/ui/FloatingControlsPanel";
import { FloatingLogo } from "@/features/studio/ui/FloatingLogo";
import { SocialBannerEditor } from "@/features/banners/ui/SocialBannerEditor";
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
} from "@/types/caption";
import { RecordingSession } from "@/types/editor";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { zIndex } from "@/lib/zIndex";
import { generateId } from "@/shared/lib/id";
import { VaultFile } from "@/types/vault";

// Hooks
import { useCanvasPaste } from "../hooks/useCanvasPaste";
import { useCanvasAi } from "../hooks/useCanvasAi";
import { useCanvasBanners } from "../hooks/useCanvasBanners";
import { getAllPropsForScene } from "../utils/canvasProps";

// Stores & Optimization
import { useShallow } from 'zustand/react/shallow';
import { useCanvasStore } from "@/stores/canvas.store";
import { useMediaStore } from "@/stores/media.store";
import { useStreamStore } from "@/stores/stream.store";
import { useSceneStore } from "@/stores/scene.store";
import { useUiStore } from "@/stores/ui.store";

interface CanvasContainerProps {
  layoutManager: any;
  recording: any;
  onRecordingComplete: (session: RecordingSession) => void;
  vaultFiles: VaultFile[];
  onAddVaultFiles: (files: FileList | File[], source: VaultFile['source']) => void;
  onRemoveVaultFile: (id: string) => void;
  onClearVault: () => void;
  remoteStream?: MediaStream | null;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  layoutManager,
  recording,
  onRecordingComplete,
  vaultFiles,
  onAddVaultFiles,
  onRemoveVaultFile,
  onClearVault,
  remoteStream,
}) => {
  const hasAiPopoverAutoOpenedRef = useRef(false);

  // Local ref for canvas since we removed the prop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  // --- Optimized Store Access ---

  // Canvas Store
  const {
    layoutMode, setLayoutMode,
    cameraShape, setCameraShape,
    splitRatio, setSplitRatio,
    pipPosition, setPipPosition,
    pipSize, setPipSize,
    isTransitioning, activeTransition,
    dynamicLayout,
  } = useCanvasStore(useShallow(state => ({
    layoutMode: state.layoutMode, setLayoutMode: state.setLayoutMode,
    cameraShape: state.cameraShape, setCameraShape: state.setCameraShape,
    splitRatio: state.splitRatio, setSplitRatio: state.setSplitRatio,
    pipPosition: state.pipPosition, setPipPosition: state.setPipPosition,
    pipSize: state.pipSize, setPipSize: state.setPipSize,
    isTransitioning: state.isTransitioning,
    activeTransition: state.activeTransition,
    dynamicLayout: state.dynamicLayout,
  })));

  // Media Store
  const {
    isAudioOn, setAudioOn,
    isVideoOn, setVideoOn,
    audioDevices, selectedAudioDevice, setSelectedAudioDevice,
    videoDevices, selectedVideoDevice, setSelectedVideoDevice,
    screenShareMode, setScreenShareMode
  } = useMediaStore(useShallow(state => ({
    isAudioOn: state.isAudioOn, setAudioOn: state.setAudioOn,
    isVideoOn: state.isVideoOn, setVideoOn: state.setVideoOn,
    audioDevices: state.audioDevices,
    selectedAudioDevice: state.selectedAudioDevice, setSelectedAudioDevice: state.setSelectedAudioDevice,
    videoDevices: state.videoDevices,
    selectedVideoDevice: state.selectedVideoDevice, setSelectedVideoDevice: state.setSelectedVideoDevice,
    screenShareMode: state.screenShareMode, setScreenShareMode: state.setScreenShareMode
  })));

  // Scene Store
  const {
    customMaskUrl, setCustomMaskUrl,
    activeOverlays, setActiveOverlays,
    textOverlays, setTextOverlays,
    fileOverlays, setFileOverlays,
    browserOverlays, setBrowserOverlays,
    canvasLayout, setCanvasLayout,
    backgroundEffect, setBackgroundEffect,
    backgroundImageUrl, setBackgroundImageUrl,
    videoFilter, setVideoFilter,
    captionStyle, setCaptionStyle,
    dynamicStyle,
    isAiModeEnabled, setAiModeEnabled,
    captionsEnabled, setCaptionsEnabled,
    previousScene,
    selectedBrowserId, setSelectedBrowserId,
    selectedFileId, setSelectedFileId,
    selectedTextId, setSelectedTextId,
    selectedGeneratedId, setSelectedGeneratedId,
    deselectAll
  } = useSceneStore(useShallow(state => ({
    customMaskUrl: state.customMaskUrl, setCustomMaskUrl: state.setCustomMaskUrl,
    activeOverlays: state.activeOverlays, setActiveOverlays: state.setActiveOverlays,
    textOverlays: state.textOverlays, setTextOverlays: state.setTextOverlays,
    fileOverlays: state.fileOverlays, setFileOverlays: state.setFileOverlays,
    browserOverlays: state.browserOverlays, setBrowserOverlays: state.setBrowserOverlays,
    canvasLayout: state.canvasLayout, setCanvasLayout: state.setCanvasLayout,
    backgroundEffect: state.backgroundEffect, setBackgroundEffect: state.setBackgroundEffect,
    backgroundImageUrl: state.backgroundImageUrl, setBackgroundImageUrl: state.setBackgroundImageUrl,
    videoFilter: state.videoFilter, setVideoFilter: state.setVideoFilter,
    captionStyle: state.captionStyle, setCaptionStyle: state.setCaptionStyle,
    dynamicStyle: state.dynamicStyle,
    isAiModeEnabled: state.isAiModeEnabled, setAiModeEnabled: state.setAiModeEnabled,
    captionsEnabled: state.captionsEnabled, setCaptionsEnabled: state.setCaptionsEnabled,
    previousScene: state.previousScene,
    selectedBrowserId: state.selectedBrowserId, setSelectedBrowserId: state.setSelectedBrowserId,
    selectedFileId: state.selectedFileId, setSelectedFileId: state.setSelectedFileId,
    selectedTextId: state.selectedTextId, setSelectedTextId: state.setSelectedTextId,
    selectedGeneratedId: state.selectedGeneratedId, setSelectedGeneratedId: state.setSelectedGeneratedId,
    deselectAll: state.deselectAll
  })));

  // UI Store
  const {
    isMouseActive,
    isFullscreen, setFullscreen,
    isFsSidebarOpen, setFsSidebarOpen,
    setShowSessionsPanel,
    showSettings, setShowSettings,
    isChatbotOpen, setChatbotOpen // Assuming setChatbotOpen exists or we use toggle
  } = useUiStore(useShallow(state => ({
    isMouseActive: state.isMouseActive,
    isFullscreen: state.isFullscreen, setFullscreen: state.setFullscreen,
    isFsSidebarOpen: state.isFsSidebarOpen, setFsSidebarOpen: state.setFsSidebarOpen,
    setShowSessionsPanel: state.setShowSessionsPanel,
    showSettings: state.showSettings, setShowSettings: state.setShowSettings,
    isChatbotOpen: state.isChatbotOpen, setChatbotOpen: state.setChatbotOpen
  })));

  // Construct activeScene from optimized values
  const activeScene: SceneState = useMemo(() => ({
    isAudioOn, isVideoOn, audioDevices, videoDevices, selectedAudioDevice, selectedVideoDevice, screenShareMode,
    layoutMode, cameraShape, splitRatio, pipPosition, pipSize,
    customMaskUrl, activeOverlays, textOverlays, fileOverlays, browserOverlays,
    canvasLayout, backgroundEffect, backgroundImageUrl, videoFilter, captionStyle,
    dynamicStyle, isAiModeEnabled, captionsEnabled, previousScene,
  }), [
    isAudioOn, isVideoOn, audioDevices, videoDevices, selectedAudioDevice, selectedVideoDevice, screenShareMode,
    layoutMode, cameraShape, splitRatio, pipPosition, pipSize,
    customMaskUrl, activeOverlays, textOverlays, fileOverlays, browserOverlays,
    canvasLayout, backgroundEffect, backgroundImageUrl, videoFilter, captionStyle,
    dynamicStyle, isAiModeEnabled, captionsEnabled, previousScene
  ]);

  // Compatibility: updateActiveScene function that diffs and dispatches
  const updateActiveScene = useCallback((updater: (scene: SceneState) => SceneState) => {
    const newScene = updater(activeScene);

    if (newScene.isAudioOn !== activeScene.isAudioOn) setAudioOn(newScene.isAudioOn);
    if (newScene.isVideoOn !== activeScene.isVideoOn) setVideoOn(newScene.isVideoOn);
    if (newScene.selectedAudioDevice !== activeScene.selectedAudioDevice && newScene.selectedAudioDevice) setSelectedAudioDevice(newScene.selectedAudioDevice);
    if (newScene.selectedVideoDevice !== activeScene.selectedVideoDevice && newScene.selectedVideoDevice) setSelectedVideoDevice(newScene.selectedVideoDevice);
    if (newScene.screenShareMode !== activeScene.screenShareMode) setScreenShareMode(newScene.screenShareMode);

    if (newScene.layoutMode !== activeScene.layoutMode) setLayoutMode(newScene.layoutMode);
    if (newScene.cameraShape !== activeScene.cameraShape) setCameraShape(newScene.cameraShape);
    if (newScene.splitRatio !== activeScene.splitRatio) setSplitRatio(newScene.splitRatio);
    if (newScene.pipPosition !== activeScene.pipPosition) setPipPosition(newScene.pipPosition);

    if (newScene.customMaskUrl !== activeScene.customMaskUrl) setCustomMaskUrl(newScene.customMaskUrl);
    if (newScene.activeOverlays !== activeScene.activeOverlays) setActiveOverlays(newScene.activeOverlays);
    if (newScene.textOverlays !== activeScene.textOverlays) setTextOverlays(newScene.textOverlays);
    if (newScene.fileOverlays !== activeScene.fileOverlays) setFileOverlays(newScene.fileOverlays);
    if (newScene.browserOverlays !== activeScene.browserOverlays) setBrowserOverlays(newScene.browserOverlays);
    if (newScene.canvasLayout !== activeScene.canvasLayout) setCanvasLayout(newScene.canvasLayout);
    if (newScene.backgroundEffect !== activeScene.backgroundEffect) setBackgroundEffect(newScene.backgroundEffect);
    if (newScene.backgroundImageUrl !== activeScene.backgroundImageUrl) setBackgroundImageUrl(newScene.backgroundImageUrl);
    if (newScene.videoFilter !== activeScene.videoFilter) setVideoFilter(newScene.videoFilter);
    if (newScene.captionStyle !== activeScene.captionStyle) setCaptionStyle(newScene.captionStyle);
    if (newScene.isAiModeEnabled !== activeScene.isAiModeEnabled) setAiModeEnabled(newScene.isAiModeEnabled);
    if (newScene.captionsEnabled !== activeScene.captionsEnabled) setCaptionsEnabled(newScene.captionsEnabled);
  }, [
    activeScene, setAudioOn, setVideoOn, setSelectedAudioDevice, setSelectedVideoDevice, setScreenShareMode,
    setLayoutMode, setCameraShape, setSplitRatio, setPipPosition,
    setCustomMaskUrl, setActiveOverlays, setTextOverlays, setFileOverlays, setBrowserOverlays,
    setCanvasLayout, setBackgroundEffect, setBackgroundImageUrl, setVideoFilter, setCaptionStyle,
    setAiModeEnabled, setCaptionsEnabled
  ]);

  // Compatibility: updateSceneProperty
  const updateSceneProperty = useCallback((key: keyof SceneState, value: any) => {
    switch (key) {
      case 'isAudioOn': setAudioOn(value); break;
      case 'isVideoOn': setVideoOn(value); break;
      case 'selectedAudioDevice': setSelectedAudioDevice(value); break;
      case 'selectedVideoDevice': setSelectedVideoDevice(value); break;
      case 'screenShareMode': setScreenShareMode(value); break;
      case 'layoutMode': setLayoutMode(value); break;
      case 'cameraShape': setCameraShape(value); break;
      case 'splitRatio': setSplitRatio(value); break;
      case 'pipPosition': setPipPosition(value); break;
      case 'pipSize': setPipSize(value); break;
      case 'customMaskUrl': setCustomMaskUrl(value); break;
      case 'activeOverlays': setActiveOverlays(value); break;
      case 'textOverlays': setTextOverlays(value); break;
      case 'canvasLayout': setCanvasLayout(value); break;
      case 'captionStyle': setCaptionStyle(value); break;
      case 'isAiModeEnabled': setAiModeEnabled(value); break;
      case 'captionsEnabled': setCaptionsEnabled(value); break;
      default: console.warn(`updateSceneProperty: Unhandled key ${String(key)}`);
    }
  }, [
    setAudioOn, setVideoOn, setSelectedAudioDevice, setSelectedVideoDevice, setScreenShareMode,
    setLayoutMode, setCameraShape, setSplitRatio, setPipPosition, setPipSize,
    setCustomMaskUrl, setActiveOverlays, setTextOverlays, setCanvasLayout, setCaptionStyle,
    setAiModeEnabled, setCaptionsEnabled
  ]);

  // Selection object wrapper
  const selectionWrapper = useMemo(() => ({
    selectedBrowserId, setSelectedBrowserId,
    selectedFileId, setSelectedFileId,
    selectedTextId, setSelectedTextId,
    selectedGeneratedId, setSelectedGeneratedId,
    handleDeselectAll: deselectAll,
  }), [selectedBrowserId, selectedFileId, selectedTextId, selectedGeneratedId,
    setSelectedBrowserId, setSelectedFileId, setSelectedTextId, setSelectedGeneratedId, deselectAll]);

  // Hooks
  useCanvasPaste({
    activeScene,
    updateActiveScene,
    selection: selectionWrapper,
    isDrawing: false,
  });

  const { isProcessingAi, processTranscript } = useCanvasAi({
    activeScene,
    updateActiveScene,
    recording,
    setSavedOverlays: () => { },
  });

  const bannerLogic = useCanvasBanners({
    activeScene,
    updateActiveScene,
    selection: selectionWrapper,
  });

  // Handlers
  const handleSetIsAudioOn = (val: boolean) => setAudioOn(val);
  const handleSetIsVideoOn = (val: boolean) => setVideoOn(val);
  const handleSetSelectedAudioDevice = (val: string) => setSelectedAudioDevice(val);
  const handleSetSelectedVideoDevice = (val: string) => setSelectedVideoDevice(val);

  const handleSetScreenShareMode = (val: "off" | "screen" | "canvas") => {
    setScreenShareMode(val);
    setLayoutMode(val !== "off" ? "pip" : "solo");
  };

  const handleSetCaptionStyle = (val: CaptionStyle) => {
    setCaptionStyle(val);
    if (recording.isRecording) recording.recordCaptionStyle(val);
  };

  const handleRecordingToggle = useCallback(
    async (
      isCurrentlyRecording: boolean,
      stream: MediaStream,
      containerSize: { width: number; height: number }
    ) => {
      if (!isCurrentlyRecording) {
        await recording.startRecording(canvasRef.current);
        toast.info("Recording started!");
      } else {
        const session = await recording.stopRecording(
          containerSize.width,
          containerSize.height,
          {
            dynamicStyle: activeScene.dynamicStyle,
            videoFilter: activeScene.videoFilter,
            backgroundEffect: activeScene.backgroundEffect,
            backgroundImageUrl: activeScene.backgroundImageUrl,
          }
        );
        onRecordingComplete(session);
        toast.success("Recording saved!");
      }
    },
    [recording, activeScene, onRecordingComplete]
  );

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
    handleGridAssetSelect: (id: string, asset: AssetResult) => { /* Reuse logic */ },
    handleSectionCameraSettingsChange: (id: string, settings: any) => { /* Reimplement */ },
    onCanvasPresetSelect: layoutManager.handleCanvasPresetSelect,
    onSaveCanvasPreset: layoutManager.handleSaveCanvasPreset,
    onDeleteCanvasPreset: layoutManager.handleDeleteCanvasPreset,
    shareCanvasPreset: layoutManager.shareCanvasPreset,
    unshareCanvasPreset: layoutManager.unshareCanvasPreset,
    onAddSavedOverlay: (overlay: GeneratedOverlay) => {
      setActiveOverlays([...activeOverlays, { ...overlay, id: generateId("overlay") }])
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
        ? getAllPropsForScene(previousScene, commonCallbacks, commonData)
        : null,
    [previousScene, layoutManager, bannerLogic.editingBannerText, commonCallbacks]
  );

  // Inject handlers
  if (activeSceneProps?.sidebarProps) {
    // @ts-ignore
    activeSceneProps.sidebarProps.onAddSocialBanner = bannerLogic.handleAddSocialBanner;
    // @ts-ignore
    activeSceneProps.sidebarProps.onAddAnimatedBanner = bannerLogic.handleAddAnimatedBanner;
    // @ts-ignore
    activeSceneProps.sidebarProps.onAddTextOverlay = () => { };
  }

  return (
    <>
      <FloatingControlsPanel
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        isMouseActive={isMouseActive}
        {...activeSceneProps?.sidebarProps}
        onAddSocialBanner={bannerLogic.handleAddSocialBanner}
        onAddAnimatedBanner={bannerLogic.handleAddAnimatedBanner}
        vaultFiles={vaultFiles}
        onAddVaultFiles={onAddVaultFiles}
        onRemoveVaultFile={onRemoveVaultFile}
        onClearVault={onClearVault}
        onAddTextOverlay={() => { /* implementation */ }}
        onAssetSelect={(asset) => { /* implementation */ }}
        setIsDrawing={() => { /* implementation */ }}
        portalContainer={mainContainerRef.current || undefined}
      />

      <div
        className={`fixed top-6 left-6 z-[2015] transition-opacity duration-300 ${isMouseActive
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
          }`}
      >
        <FloatingLogo />
      </div>

      <MainCanvasArea
        activeScene={activeScene}
        previousScene={previousScene}
        activeSceneProps={activeSceneProps}
        previousSceneProps={previousSceneProps}
        globalCanvasProps={{
          remoteStream,
          isChatbotOpen,
          onChatbotToggle: (val) => setChatbotOpen(typeof val === 'function' ? val(isChatbotOpen) : val),
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

          onOverlayLayoutChange: (id, key, value) => {
            const updated = activeOverlays.map(o => o.id === id ? { ...o, layout: { ...o.layout, [key]: value } } : o);
            setActiveOverlays(updated);
          },
          onRemoveOverlay: (id) => setActiveOverlays(activeOverlays.filter(o => o.id !== id)),

          canvasRef, // Passing reference
          portalContainer: mainContainerRef.current,
          // ... other props
          // Browser
          selectedBrowserId, setSelectedBrowserId,
          onRemoveBrowser: (id) => setBrowserOverlays(browserOverlays.filter(b => b.id !== id)),
          onBrowserUrlChange: (id, url) => setBrowserOverlays(browserOverlays.map(b => b.id === id ? { ...b, url } : b)),

          // Text
          selectedTextId, setSelectedTextId,
          onRemoveTextOverlay: (id) => setTextOverlays(textOverlays.filter(t => t.id !== id)),
          onTextLayoutChange: (id, layout) => setTextOverlays(textOverlays.map(t => t.id === id ? { ...t, layout: { ...t.layout, ...layout } } : t)),
          onTextStyleChange: (id, style) => setTextOverlays(textOverlays.map(t => t.id === id ? { ...t, style: { ...t.style, ...style } } : t)),
          onTextContentChange: (id, content) => setTextOverlays(textOverlays.map(t => t.id === id ? { ...t, content } : t)),

          // File
          selectedFileId, setSelectedFileId,
          onRemoveFile: (id) => setFileOverlays(fileOverlays.filter(f => f.id !== id)),
          onFileLayoutChange: (id, layout) => setFileOverlays(fileOverlays.map(f => f.id === id ? { ...f, layout: { ...f.layout, ...layout } } : f)),
          onAddFile: (file) => { /* TODO: Implement global file add if needed, or rely on activeSceneProps */ },

          // Generated
          selectedGeneratedId, setSelectedGeneratedId,
          onPreviewGenerated: (id, preview) => setActiveOverlays(activeOverlays.map(o => o.id === id ? { ...o, preview } : o)),
          onUpdateOverlayMetadata: (id, metadata) => setActiveOverlays(activeOverlays.map(o => o.id === id ? { ...o, metadata } : o)),


          // Selection
          onDeselectAll: selectionWrapper.handleDeselectAll,

        }}
        isTransitioning={isTransitioning}
        activeTransition={activeTransition as SceneTransition}
      />

      <SocialBannerEditor
        isOpen={bannerLogic.isBannerEditorOpen}
        onClose={() => bannerLogic.setIsBannerEditorOpen(false)}
        onSave={bannerLogic.handleSaveBanner}
        initialData={bannerLogic.bannerUserData}
      />
    </>
  );
};
