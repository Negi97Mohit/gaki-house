// Single responsibility: wire canvas state, handlers, and hooks; compose and render the canvas area.
import React, { useCallback, useRef, useMemo, useState, useEffect } from "react";
import { MainCanvasArea } from "./MainCanvasArea";
import { FloatingControlsPanel } from "@/features/studio/ui/FloatingControlsPanel";
import { FloatingLogo } from "@/features/studio/ui/FloatingLogo";
import { SocialBannerEditor } from "@/features/banners/ui/SocialBannerEditor";
import { GeneratedOverlay, SceneTransition } from "@/types/caption";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { generateId } from "@/shared/lib/id";
import { VaultFile } from "@/types/vault";
import { useCanvasPaste } from "../hooks/useCanvasPaste";
import { useCanvasAi } from "../hooks/useCanvasAi";
import { useCanvasBanners } from "../hooks/useCanvasBanners";
import { getAllPropsForScene } from "../utils/canvasProps";
import { useCanvasState } from "../hooks/useCanvasState";
import { useCanvasHandlers } from "../hooks/useCanvasHandlers";

interface CanvasContainerProps {
  layoutManager: any;
  vaultFiles: VaultFile[];
  onAddVaultFiles: (files: FileList | File[], source: VaultFile["source"]) => void;
  onRemoveVaultFile: (id: string) => void;
  onClearVault: () => void;
  remoteStream?: MediaStream | null;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  layoutManager,
  vaultFiles,
  onAddVaultFiles,
  onRemoveVaultFile,
  onClearVault,
  remoteStream,
}) => {
  useEffect(() => {
    console.log("[CanvasContainer] mounted");
  }, []);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const hasAiPopoverAutoOpenedRef = useRef(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly any[]>([]);

  // --- Wire state and handlers ---
  const state = useCanvasState();
  const handlers = useCanvasHandlers(state);
  console.log("[CanvasContainer] useCanvasState + useCanvasHandlers wired");

  const {
    activeScene, previousScene,
    activeOverlays, setActiveOverlays,
    textOverlays, setTextOverlays,
    fileOverlays, setFileOverlays,
    browserOverlays, setBrowserOverlays,
    selectedBrowserId, setSelectedBrowserId,
    selectedFileId, setSelectedFileId,
    selectedTextId, setSelectedTextId,
    selectedGeneratedId, setSelectedGeneratedId,
    isMouseActive,
    isFullscreen, setFullscreen,
    isFsSidebarOpen, setFsSidebarOpen,
    setShowSessionsPanel,
    showSettings, setShowSettings,
    isChatbotOpen, setChatbotOpen,
    isTransitioning, activeTransition,
    dynamicLayout,
  } = state;

  const { updateActiveScene, selectionWrapper, ...handlerFns } = handlers;

  // --- Supplemental hooks ---
  useCanvasPaste({ activeScene, updateActiveScene, selection: selectionWrapper, isDrawing });
  const { isProcessingAi, processTranscript } = useCanvasAi({
    activeScene,
    updateActiveScene,
    setSavedOverlays: () => {},
  });
  const bannerLogic = useCanvasBanners({ activeScene, updateActiveScene, selection: selectionWrapper });

  // --- Assemble prop bundles for getAllPropsForScene ---
  const commonCallbacks = useMemo(
    () => ({
      ...handlerFns,
      updateActiveScene,
      onCanvasPresetSelect: layoutManager.handleCanvasPresetSelect,
      onSaveCanvasPreset: layoutManager.handleSaveCanvasPreset,
      onDeleteCanvasPreset: layoutManager.handleDeleteCanvasPreset,
      shareCanvasPreset: layoutManager.shareCanvasPreset,
      unshareCanvasPreset: layoutManager.unshareCanvasPreset,
      onAddSavedOverlay: (overlay: GeneratedOverlay) => {
        setActiveOverlays([...activeOverlays, { ...overlay, id: generateId("overlay") }]);
      },
      onDeleteSavedOverlay: (_id: string) => {},
      onBannerTextStyleChange: bannerLogic.handleBannerTextStyleChange,
      onBannerTextClose: bannerLogic.onBannerTextClose,
      onGridAssetSelect: (_id: string, _asset: AssetResult) => {},
      onSectionCameraSettingsChange: (_id: string, _settings: any) => {},
    }),
    [
      handlerFns, updateActiveScene, layoutManager,
      bannerLogic.handleBannerTextStyleChange, bannerLogic.onBannerTextClose,
      activeOverlays, setActiveOverlays,
    ]
  );

  const commonData = useMemo(
    () => ({
      audioDevices: state.audioDevices,
      videoDevices: state.videoDevices,
      savedOverlays: [],
      customPresets: layoutManager.customPresets,
      publicPresets: layoutManager.publicPresets,
      isLoadingPublic: layoutManager.isLoadingPublic,
      editingBannerText: bannerLogic.editingBannerText,
      hasAiPopoverAutoOpenedRef,
    }),
    [state.audioDevices, state.videoDevices, layoutManager, bannerLogic.editingBannerText]
  );

  const activeSceneProps = useMemo(
    () => (activeScene ? getAllPropsForScene(activeScene, commonCallbacks, commonData) : null),
    [activeScene, commonCallbacks, commonData]
  );
  const previousSceneProps = useMemo(
    () => (previousScene ? getAllPropsForScene(previousScene as any, commonCallbacks, commonData) : null),
    [previousScene, commonCallbacks, commonData]
  );

  if (activeSceneProps?.sidebarProps) {
    (activeSceneProps.sidebarProps as any).onAddSocialBanner = bannerLogic.handleAddSocialBanner;
    (activeSceneProps.sidebarProps as any).onAddAnimatedBanner = bannerLogic.handleAddAnimatedBanner;
    (activeSceneProps.sidebarProps as any).onAddTextOverlay = () => {};
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
        onAddTextOverlay={() => {}}
        onAssetSelect={(_asset: any) => {}}
        setIsDrawing={setIsDrawing}
        portalContainer={mainContainerRef.current || undefined}
      />

      <div
        className={`fixed top-6 left-6 z-[2015] transition-opacity duration-300 ${
          isMouseActive ? "opacity-100" : "opacity-0 pointer-events-none"
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
          onChatbotToggle: (val: any) =>
            setChatbotOpen(typeof val === "function" ? val(isChatbotOpen) : val),
          isFullscreen,
          onToggleFullscreen: () => setFullscreen(!isFullscreen),
          isFsSidebarOpen,
          onFsSidebarToggle: setFsSidebarOpen,
          dynamicLayout,
          onOpenSessions: () => setShowSessionsPanel(true),
          onOpenSettings: () => setShowSettings((prev: boolean) => !prev),
          isMouseActive,
          isProcessingAi,
          onProcessTranscript: processTranscript,
          isDrawing,
          setIsDrawing,
          excalidrawElements,
          setExcalidrawElements,
          onOverlayLayoutChange: (id: string, key: string, value: any) => {
            setActiveOverlays(
              activeOverlays.map((o) => (o.id === id ? { ...o, layout: { ...o.layout, [key]: value } } : o))
            );
          },
          onRemoveOverlay: (id: string) =>
            setActiveOverlays(activeOverlays.filter((o) => o.id !== id)),
          canvasRef,
          portalContainer: mainContainerRef.current,
          selectedBrowserId,
          setSelectedBrowserId,
          onRemoveBrowser: (id: string) =>
            setBrowserOverlays(browserOverlays.filter((b) => b.id !== id)),
          onBrowserUrlChange: (id: string, url: string) =>
            setBrowserOverlays(browserOverlays.map((b) => (b.id === id ? { ...b, url } : b))),
          selectedTextId,
          setSelectedTextId,
          onRemoveTextOverlay: (id: string) =>
            setTextOverlays(textOverlays.filter((t) => t.id !== id)),
          onTextLayoutChange: (id: string, layout: any) =>
            setTextOverlays(
              textOverlays.map((t) => (t.id === id ? { ...t, layout: { ...t.layout, ...layout } } : t))
            ),
          onTextStyleChange: (id: string, style: any) =>
            setTextOverlays(
              textOverlays.map((t) => (t.id === id ? { ...t, style: { ...t.style, ...style } } : t))
            ),
          onTextContentChange: (id: string, content: string) =>
            setTextOverlays(textOverlays.map((t) => (t.id === id ? { ...t, content } : t))),
          selectedFileId,
          setSelectedFileId,
          onRemoveFile: (id: string) =>
            setFileOverlays(fileOverlays.filter((f) => f.id !== id)),
          onFileLayoutChange: (id: string, layout: any) =>
            setFileOverlays(
              fileOverlays.map((f) => (f.id === id ? { ...f, layout: { ...f.layout, ...layout } } : f))
            ),
          onAddFile: (_file: any) => {},
          selectedGeneratedId,
          setSelectedGeneratedId,
          onPreviewGenerated: (id: string, preview: any) =>
            setActiveOverlays(activeOverlays.map((o) => (o.id === id ? { ...o, preview } : o))),
          onUpdateOverlayMetadata: (id: string, metadata: any) =>
            setActiveOverlays(activeOverlays.map((o) => (o.id === id ? { ...o, metadata } : o))),
          onDeselectAll: selectionWrapper.handleDeselectAll,
        }}
        isTransitioning={isTransitioning}
        activeTransition={activeTransition as unknown as SceneTransition}
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
