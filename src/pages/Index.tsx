import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { SavedSessionsPanel } from "@/components/SavedSessionsPanel";
import { ExcalidrawOverlay } from "@/components/ExcalidrawOverlay";
import { SceneTabs } from "@/components/SceneTabs";
import { TransitionPopover } from "@/components/TransitionPopover";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AnimationLibraryPanel } from "@/components/AnimationLibraryPanel";
import { CanvasContainer } from "./Index/components/CanvasContainer";
import { RemoteConnectModal } from "@/components/RemoteConnectModal";

import { useRecordingSession } from "@/hooks/useRecordingSession";
import { useCompositeStream } from "@/hooks/useCompositeStream";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSceneManager } from "./Index/hooks/useSceneManager";
import { useMediaManager } from "./Index/hooks/useMediaManager";
import { useLayoutManager } from "./Index/hooks/useLayoutManager";
import { useSmartCameraSwitcher } from "@/hooks/useSmartCameraSwitcher";
import { useLayerControls } from "@/hooks/useLayerControls";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useIndexUI } from "./Index/hooks/useIndexUI";
import { useRemoteConnection } from "./Index/hooks/useRemoteConnection";
import { useOverlayHandlers } from "./Index/hooks/useOverlayHandlers";

import { GeneratedOverlay, GeneratedLayout } from "@/types/caption";
import { RecordingSession } from "@/types/editor";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/id";
import { zIndex } from "@/lib/zIndex";

const Index = () => {
  const navigate = useNavigate();
  const recording = useRecordingSession();

  // --- STATE EXTRACTED TO HOOKS ---
  const ui = useIndexUI();

  // --- SCENE & MEDIA MANAGERS ---
  const {
    scenes,
    activeScene,
    effectiveScene,
    activeSceneId,
    activeSubsceneId,
    previousScene,
    sceneTransitions,
    activeTransition,
    isTransitioning,
    setActiveTransition,
    updateActiveScene,
    updateSceneProperty,
    handleAddScene,
    handleSceneSelect,
    handleSceneClose,
    handleSceneReorder,
    handleSceneRename,
    handleTransitionChange,
    handleAddSubscene,
    handleSubsceneClose,
    handleSubsceneReorder,
    handleSubsceneRename,
    handleToggleExpand,
    handleDuplicateScene,
    createScenesFromStreamStyle,
    handleResetSceneToDefault,
    undo,
    redo,
    canUndo,
    canRedo,
    resetScene,
  } = useSceneManager({ recording });

  const { audioDevices, videoDevices } = useMediaManager({
    isAudioOn: activeScene?.isAudioOn || false,
    selectedAudioDevice: activeScene?.selectedAudioDevice,
    sceneId: activeSceneId,
    onAudioToggle: (val) => updateSceneProperty("isAudioOn", val),
  });

  const remote = useRemoteConnection(activeScene);

  // --- SELECTION STATE ---
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(
    null
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedGeneratedId, setSelectedGeneratedId] = useState<string | null>(
    null
  );

  // --- LAYOUT MANAGER ---
  const {
    presets,
    handleSaveLayout,
    handleLoadPreset,
    handleDeletePreset,
    ...layoutManager
  } = useLayoutManager({
    activeScene,
    updateActiveScene,
    recording,
    setSelectedTextId,
    setSelectedFileId,
    setSelectedBrowserId,
  });

  // --- ADDITIONAL FEATURES ---
  const [isSmartSwitchEnabled, setIsSmartSwitchEnabled] = useState(false);
  const [isVirtualCameraEnabled, setIsVirtualCameraEnabled] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly any[]>(
    []
  );

  const [dynamicLayout, setDynamicLayout] = useState<{
    isActive: boolean;
    mode: "split-vertical" | "split-horizontal" | "pip";
    target: {
      id: string;
      type: string;
      content: any;
      layout: GeneratedLayout;
    } | null;
  }>({ isActive: false, mode: "split-vertical", target: null });

  // Storage
  const [allSessions, setAllSessions] = useLocalStorage<RecordingSession[]>(
    "gaki-recorded-sessions",
    []
  );
  const [savedOverlays, setSavedOverlays] = useLocalStorage<GeneratedOverlay[]>(
    "gaki-saved-overlays",
    []
  );

  useSmartCameraSwitcher({
    scenes,
    activeSceneId,
    onSceneSelect: handleSceneSelect,
    isEnabled: isSmartSwitchEnabled,
    remoteStream: remote.remoteStream,
    videoDevices,
  });

  const { compositeStream, isReady: isCompositeReady } = useCompositeStream({
    canvasRef: ui.canvasRef,
    isEnabled: isVirtualCameraEnabled,
    frameRate: 30,
  });

  useEffect(() => {
    if (isCompositeReady && compositeStream) {
      toast.success("🎥 Broadcasting Active!");
    }
  }, [isCompositeReady, compositeStream]);

  // --- LAYER CONTROLS & OVERLAYS ---
  const layerControls = useLayerControls({ activeScene, updateActiveScene });

  const overlayHandlers = useOverlayHandlers({
    activeScene: effectiveScene!,
    updateActiveScene,
    recording,
    selection: {
      selectedTextId,
      setSelectedTextId,
      selectedFileId,
      setSelectedFileId,
      selectedBrowserId,
      setSelectedBrowserId,
      selectedGeneratedId,
      setSelectedGeneratedId,
    },
    setShowAnimationLibrary: ui.setShowAnimationLibrary,
    ...layerControls,
  });

  // --- KEYBOARD SHORTCUTS ---
  useKeyboardShortcuts({
    onToggleFullscreen: ui.handleToggleFullscreen,
    onToggleAiAssistant: () => ui.setIsChatbotOpen((prev) => !prev),
    onToggleSettings: () => ui.setShowSettings((prev) => !prev),
    onUndo: canUndo ? undo : undefined,
    onRedo: canRedo ? redo : undefined,
    onResetScene: resetScene,
    onDelete: overlayHandlers.handleDeleteSelected,
    onBringToFront: overlayHandlers.handleBringToFront,
    onSendToBack: overlayHandlers.handleSendToBack,
    onBringForward: overlayHandlers.handleBringForward,
    onSendBackward: overlayHandlers.handleSendBackward,
    onToggleRecording: () => {
      if (recording.isRecording) {
        // Stop logic handled in canvas
      } else if (ui.canvasRef.current) {
        recording.startRecording(ui.canvasRef.current);
        toast.info("Recording started via shortcut!");
      }
    },
    onToggleMic: () =>
      updateSceneProperty("isAudioOn", !activeScene?.isAudioOn),
    onToggleCamera: () =>
      updateSceneProperty("isVideoOn", !activeScene?.isVideoOn),
    onToggleBroadcast: () => setIsVirtualCameraEnabled((p) => !p),
    onToggleSmartSwitch: () => {
      setIsSmartSwitchEnabled((prev) => !prev);
      toast.info(
        !isSmartSwitchEnabled
          ? "Smart Scene Switch: ON"
          : "Smart Scene Switch: OFF"
      );
    },
    onAddText: overlayHandlers.handleAddTextOverlay,
    onOpenAssetLibrary: () => ui.setShowAnimationLibrary(true),
    onToggleDrawing: () => setIsDrawing((prev) => !prev),
  });

  const handleRecordingComplete = useCallback(
    (session: RecordingSession) => {
      setAllSessions((prev) => [session, ...prev]);
      setTimeout(() => navigate(`/edit/${session.id}`), 50);
    },
    [navigate, setAllSessions]
  );

  if (!activeScene || !effectiveScene) return <div>Loading...</div>;

  return (
    <div
      ref={ui.mainContainerRef}
      className={cn(
        "h-screen flex bg-background overflow-hidden relative w-full",
        !ui.isMouseActive && "cursor-none"
      )}
    >
      <CanvasContainer
        activeScene={effectiveScene}
        previousScene={previousScene}
        activeTransition={activeTransition}
        isTransitioning={isTransitioning}
        updateActiveScene={updateActiveScene}
        updateSceneProperty={updateSceneProperty}
        audioDevices={audioDevices}
        videoDevices={videoDevices}
        layoutManager={{ ...layoutManager, presets, handleSaveLayout }}
        recording={recording}
        onRecordingComplete={handleRecordingComplete}
        uiState={{
          isFullscreen: ui.isFullscreen,
          onToggleFullscreen: ui.handleToggleFullscreen,
          isFsSidebarOpen: ui.isFsSidebarOpen,
          onFsSidebarToggle: ui.setIsFsSidebarOpen,
          isMouseActive: ui.isMouseActive,
          onOpenSessions: () => ui.setShowSessionsPanel(true),
          isDrawing,
        }}
        savedOverlays={savedOverlays}
        setSavedOverlays={setSavedOverlays}
        dynamicLayout={dynamicLayout}
        setDynamicLayout={setDynamicLayout}
        selection={{
          selectedBrowserId,
          setSelectedBrowserId,
          selectedFileId,
          setSelectedFileId,
          selectedTextId,
          setSelectedTextId,
          selectedGeneratedId,
          setSelectedGeneratedId,
          handleDeselectAll: () => {
            setSelectedBrowserId(null);
            setSelectedFileId(null);
            setSelectedTextId(null);
            setSelectedGeneratedId(null);
          },
        }}
        canvasRef={ui.canvasRef}
        mainContainerRef={ui.mainContainerRef}
        isSettingsOpen={ui.showSettings}
        onSetSettingsOpen={ui.setShowSettings}
        remoteStream={remote.remoteStream}
        isChatbotOpen={ui.isChatbotOpen}
        onChatbotToggle={ui.setIsChatbotOpen}
      />

      <SceneTabs
        scenes={scenes}
        activeSceneId={activeSceneId}
        activeSubsceneId={activeSubsceneId}
        transitions={sceneTransitions}
        onSceneSelect={handleSceneSelect}
        onSceneAdd={handleAddScene}
        onSubsceneAdd={handleAddSubscene}
        onTransitionClick={setActiveTransition}
        onSceneClose={handleSceneClose}
        onSubsceneClose={handleSubsceneClose}
        onSceneReorder={handleSceneReorder}
        onSubsceneReorder={handleSubsceneReorder}
        onSceneRename={handleSceneRename}
        onSubsceneRename={handleSubsceneRename}
        onToggleExpand={handleToggleExpand}
        onDuplicateScene={handleDuplicateScene}
        onResetScene={handleResetSceneToDefault}
        isHidden={ui.isSceneTabsHidden}
        onHide={() => ui.setIsSceneTabsHidden(true)}
        isPopoverOpen={activeTransition !== null}
        onApplyStreamStyle={(preset) => {
          const newSubscenes = createScenesFromStreamStyle(preset);
          toast.success(
            `Created ${newSubscenes.length} subscenes from "${preset.name}" style!`
          );
        }}
      />

      <TransitionPopover
        transition={activeTransition}
        onClose={() => setActiveTransition(null)}
        onTransitionChange={handleTransitionChange}
      />

      <AnimationLibraryPanel
        isOpen={ui.showAnimationLibrary}
        onClose={() => ui.setShowAnimationLibrary(false)}
        onSelect={overlayHandlers.handleSelectAnimation}
        onSelectGSAP={overlayHandlers.handleSelectGSAPAnimation}
      />

      <SavedSessionsPanel
        sessions={allSessions}
        onDeleteSession={(id) =>
          setAllSessions((s) => s.filter((x) => x.id !== id))
        }
        presets={presets}
        onDeletePreset={handleDeletePreset}
        onLoadPreset={handleLoadPreset}
        isOpen={ui.showSessionsPanel}
        onClose={() => ui.setShowSessionsPanel(false)}
      />

      <ExcalidrawOverlay
        isVisible={isDrawing}
        onClose={() => setIsDrawing(false)}
        initialElements={excalidrawElements}
        onElementsChange={setExcalidrawElements}
      />

      <BottomNavigation
        isMouseActive={ui.isBottomNavVisible}
        onOpenSettings={() => ui.setShowSettings((prev) => !prev)}
        onOpenSessions={() => ui.setShowSessionsPanel(true)}
        onSaveLayout={handleSaveLayout}
        onOpenAnimationLibrary={() => ui.setShowAnimationLibrary(true)}
        isAudioOn={activeScene.isAudioOn}
        onAudioToggle={(val) => updateSceneProperty("isAudioOn", val)}
        audioDevices={audioDevices}
        onAudioDeviceSelect={(val) =>
          updateSceneProperty("selectedAudioDevice", val)
        }
        selectedAudioDevice={activeScene.selectedAudioDevice}
        isVideoOn={activeScene.isVideoOn}
        onVideoToggle={(val) => {
          if (
            val &&
            activeScene.selectedVideoDevice === "remote-peer" &&
            !remote.isRemoteConnected
          ) {
            remote.setHasDismissedRemoteModal(false);
            remote.setIsRemoteModalOpen(true);
          }
          updateSceneProperty("isVideoOn", val);
        }}
        videoDevices={videoDevices}
        onVideoDeviceSelect={(val) =>
          updateSceneProperty("selectedVideoDevice", val)
        }
        selectedVideoDevice={activeScene.selectedVideoDevice}
        screenShareMode={activeScene.screenShareMode}
        onScreenShareModeChange={(val) => {
          updateActiveScene((scene) => ({
            ...scene,
            screenShareMode: val,
            layoutMode: val !== "off" ? "pip" : "solo",
          }));
        }}
        isRecording={recording.isRecording}
        onRecordingToggle={() => {}}
        isBroadcasting={isVirtualCameraEnabled}
        onBroadcastToggle={() => setIsVirtualCameraEnabled((prev) => !prev)}
        onAddTextOverlay={overlayHandlers.handleAddTextOverlay}
        onAssetSelect={(asset) => {
          const newOverlay: GeneratedOverlay = {
            id: generateId("overlay"),
            name: asset.alt || "Asset",
            htmlContent: `<img src="${asset.downloadUrl}" alt="${asset.alt}" style="width: 100%; height: 100%; object-fit: contain;" />`,
            layout: {
              position: { x: 50, y: 50 },
              size: { width: 30, height: 30 },
              zIndex: zIndex.draggableElement,
              rotation: 0,
              layerOrder: "above-video",
            },
            preview: asset.previewUrl,
          };
          updateActiveScene((scene) => ({
            ...scene,
            activeOverlays: [...scene.activeOverlays, newOverlay],
          }));
          if (recording.isRecording) recording.recordHtmlOverlay(newOverlay);

          setSelectedBrowserId(null);
          setSelectedFileId(null);
          setSelectedTextId(null);
          setSelectedGeneratedId(newOverlay.id);

          toast.success(`Added "${asset.alt}" to canvas`);
        }}
        setIsDrawing={setIsDrawing}
        onToggleFullscreen={ui.handleToggleFullscreen}
        isFullscreen={ui.isFullscreen}
        layoutMode={activeScene.layoutMode}
        cameraShape={activeScene.cameraShape}
        onLayoutModeChange={(val) => updateSceneProperty("layoutMode", val)}
        onCameraShapeChange={(val) => updateSceneProperty("cameraShape", val)}
        onCustomMaskUpload={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === "string")
              updateSceneProperty("customMaskUrl", e.target.result);
          };
          reader.readAsDataURL(file);
        }}
        portalContainer={ui.mainContainerRef.current || undefined}
        splitRatio={activeScene.splitRatio}
        pipPosition={activeScene.pipPosition}
        pipSize={activeScene.pipSize}
        onSplitRatioChange={(val) => updateSceneProperty("splitRatio", val)}
        onPipPositionChange={(val) => updateSceneProperty("pipPosition", val)}
        onPipSizeChange={(val) => updateSceneProperty("pipSize", val)}
        customMaskUrl={activeScene.customMaskUrl}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onResetScene={resetScene}
        canvasLayout={activeScene.canvasLayout}
        isSmartSwitchEnabled={isSmartSwitchEnabled}
        onSmartSwitchToggle={() => {
          setIsSmartSwitchEnabled((prev) => !prev);
          toast.info(
            isSmartSwitchEnabled
              ? "Smart Scene Switch: OFF"
              : "Smart Scene Switch: ON"
          );
        }}
      />

      <RemoteConnectModal
        isOpen={remote.isRemoteModalOpen}
        onOpenChange={(open) => {
          remote.setIsRemoteModalOpen(open);
          if (!open) remote.setHasDismissedRemoteModal(true);
        }}
        peerId={remote.peerId}
        isConnected={remote.isRemoteConnected}
      />
    </div>
  );
};

export default Index;
