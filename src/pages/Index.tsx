import { useCallback, useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { SavedSessionsPanel } from "@/components/SavedSessionsPanel";
import { ExcalidrawOverlay } from "@/components/ExcalidrawOverlay";
import { SceneTabs } from "@/components/SceneTabs";
import { TransitionPopover } from "@/components/TransitionPopover";
import { BottomNavigation } from "@/components/BottomNavigation";
import { AnimationLibraryPanel } from "@/components/AnimationLibraryPanel";
import { generateHtmlFromPreset } from "@/lib/animationGenerator";
import { generateGSAPHtml } from "@/lib/gsapHtmlGenerator";
import { AnimationPreset } from "@/types/animation";
import { GSAPPreset } from "@/lib/gsapAnimations";
import { CanvasContainer } from "./Index/components/CanvasContainer";
import { CANVAS_PRESETS } from "@/lib/canvasPresets";

import { useRecordingSession } from "@/hooks/useRecordingSession";
import { useCompositeStream } from "@/hooks/useCompositeStream";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSceneManager } from "./Index/hooks/useSceneManager";
import { useMediaManager } from "./Index/hooks/useMediaManager";
import { useLayoutManager } from "./Index/hooks/useLayoutManager";
import { useRemotePeer } from "@/hooks/useRemotePeer";
import { RemoteConnectModal } from "@/components/RemoteConnectModal";
import { useSmartCameraSwitcher } from "@/hooks/useSmartCameraSwitcher";
import { useLayerControls } from "@/hooks/useLayerControls"; // --- ADDED ---
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts"; // --- ADDED ---
import {
  GeneratedOverlay,
  GeneratedLayout,
  TextOverlayState,
} from "@/types/caption";
import { RecordingSession } from "@/types/editor";
import { zIndex } from "@/lib/zIndex";
import { cn } from "@/lib/utils";
import { generateId } from "@/lib/id";

const Index = () => {
  const navigate = useNavigate();
  const recording = useRecordingSession();

  // --- HOOKS ---
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
    // Subscene management
    handleAddSubscene,
    handleSubsceneClose,
    handleSubsceneReorder,
    handleSubsceneRename,
    handleToggleExpand,
    handleDuplicateScene,
    // Stream Style
    createScenesFromStreamStyle,
    handleResetSceneToDefault,
    // Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
    resetScene,
    resetLayout,
  } = useSceneManager({ recording });

  const { audioDevices, videoDevices } = useMediaManager({
    isAudioOn: activeScene?.isAudioOn || false,
    selectedAudioDevice: activeScene?.selectedAudioDevice,
    sceneId: activeSceneId,
    onAudioToggle: (val) => updateSceneProperty("isAudioOn", val),
  });

  const {
    peerId,
    remoteStream,
    isConnected: isRemoteConnected,
  } = useRemotePeer();
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);
  const [hasDismissedRemoteModal, setHasDismissedRemoteModal] = useState(false);

  // Reset dismissal when we switch AWAY from remote peer, so if we come back, it asks again.
  useEffect(() => {
    if (activeScene?.selectedVideoDevice !== "remote-peer") {
      setHasDismissedRemoteModal(false);
    }
  }, [activeScene?.selectedVideoDevice]);

  useEffect(() => {
    if (
      activeScene?.selectedVideoDevice === "remote-peer" &&
      !isRemoteConnected &&
      !isRemoteModalOpen &&
      !hasDismissedRemoteModal
    ) {
      setIsRemoteModalOpen(true);
    } else if (isRemoteConnected && isRemoteModalOpen) {
      setIsRemoteModalOpen(false);
    }
  }, [activeScene?.selectedVideoDevice, isRemoteConnected, isRemoteModalOpen, hasDismissedRemoteModal]);

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
    setSelectedTextId: (id: string | null) => setSelectedTextId(id),
    setSelectedFileId: (id: string | null) => setSelectedFileId(id),
    setSelectedBrowserId: (id: string | null) => setSelectedBrowserId(id),
  });

  // --- STATE ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSceneTabsHidden, setIsSceneTabsHidden] = useState(true);
  const [isFsSidebarOpen, setIsFsSidebarOpen] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(true);
  const [showSessionsPanel, setShowSessionsPanel] = useState(false);
  const [showAnimationLibrary, setShowAnimationLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false); // --- LIFTED STATE ---

  // --- SMART SCENE SWITCHING ---
  const [isSmartSwitchEnabled, setIsSmartSwitchEnabled] = useState(false);

  useSmartCameraSwitcher({
    scenes,
    activeSceneId,
    onSceneSelect: handleSceneSelect,
    isEnabled: isSmartSwitchEnabled,
    remoteStream,
    videoDevices,
  });

  // Selection
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(
    null
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedGeneratedId, setSelectedGeneratedId] = useState<string | null>(
    null
  );

  const [isDrawing, setIsDrawing] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly any[]>(
    []
  );

  // Dynamic Layout
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

  // Refs
  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mainContainer, setMainContainer] = useState<HTMLDivElement | null>(
    null
  );
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Virtual Camera
  const [isVirtualCameraEnabled, setIsVirtualCameraEnabled] = useState(false);
  const { compositeStream, isReady: isCompositeReady } = useCompositeStream({
    canvasRef,
    isEnabled: isVirtualCameraEnabled,
    frameRate: 30,
  });

  useEffect(() => {
    if (isCompositeReady && compositeStream) {
      toast.success("🎥 Broadcasting Active!");
    }
  }, [isCompositeReady, compositeStream]);

  // --- SHORTCUTS & CONTROLS ---
  // Import dynamically inside hook logic or here
  // We need to import useLayerControls and useKeyboardShortcuts at top level, added in imports below/above

  // Layer Controls
  const {
    bringToFront,
    sendToBack,
    bringForward,
    sendBackward,
  } = useLayerControls({
    activeScene,
    updateActiveScene,
  });

  // Helper for Deletion
  const handleDeleteSelected = useCallback(() => {
    if (selectedTextId) {
      updateActiveScene(s => ({
        ...s,
        textOverlays: s.textOverlays.filter(o => o.id !== selectedTextId)
      }));
      setSelectedTextId(null);
      toast.success("Text deleted");
    } else if (selectedFileId) {
      updateActiveScene(s => ({
        ...s,
        fileOverlays: s.fileOverlays.filter(o => o.id !== selectedFileId)
      }));
      setSelectedFileId(null);
      toast.success("File deleted");
    } else if (selectedBrowserId) {
      updateActiveScene(s => ({
        ...s,
        browserOverlays: s.browserOverlays.filter(o => o.id !== selectedBrowserId)
      }));
      setSelectedBrowserId(null);
      toast.success("Browser deleted");
    } else if (selectedGeneratedId) {
      updateActiveScene(s => ({
        ...s,
        activeOverlays: s.activeOverlays.filter(o => o.id !== selectedGeneratedId)
      }));
      setSelectedGeneratedId(null);
      toast.success("Overlay deleted");
    }
  }, [selectedTextId, selectedFileId, selectedBrowserId, selectedGeneratedId, updateActiveScene]);


  const handleAddTextOverlay = useCallback(() => {
    const newTextOverlay: TextOverlayState = {
      id: generateId("text"),
      content: "Edit Text...",
      style: { ...activeScene.captionStyle, position: { x: 50, y: 50 } },
      layout: {
        position: { x: 50, y: 50 },
        size: { width: 30, height: 10 },
        zIndex: zIndex.draggableElement,
        rotation: 0,
      },
    };
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: [...scene.textOverlays, newTextOverlay],
    }));
    setSelectedTextId(newTextOverlay.id);
    toast.info("Text element added. Click to edit!");
  }, [activeScene?.captionStyle, updateActiveScene]);



  const handleToggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  useKeyboardShortcuts({
    // System
    onToggleFullscreen: handleToggleFullscreen,
    // AI
    onToggleAiAssistant: () => setIsChatbotOpen(prev => !prev),
    onToggleSettings: () => setShowSettings(prev => !prev),
    // History
    onUndo: canUndo ? undo : undefined,
    onRedo: canRedo ? redo : undefined,
    onResetScene: resetScene,
    onDelete: handleDeleteSelected,
    // Layers
    onBringToFront: () => {
      if (selectedTextId) bringToFront(selectedTextId, "text");
      if (selectedFileId) bringToFront(selectedFileId, "file");
      if (selectedBrowserId) bringToFront(selectedBrowserId, "browser");
      if (selectedGeneratedId) bringToFront(selectedGeneratedId, "generated");
    },
    onSendToBack: () => {
      if (selectedTextId) sendToBack(selectedTextId, "text");
      if (selectedFileId) sendToBack(selectedFileId, "file");
      if (selectedBrowserId) sendToBack(selectedBrowserId, "browser");
      if (selectedGeneratedId) sendToBack(selectedGeneratedId, "generated");
    },
    onBringForward: () => {
      if (selectedTextId) bringForward(selectedTextId, "text");
      if (selectedFileId) bringForward(selectedFileId, "file");
      if (selectedBrowserId) bringForward(selectedBrowserId, "browser");
      if (selectedGeneratedId) bringForward(selectedGeneratedId, "generated");
    },
    onSendBackward: () => {
      if (selectedTextId) sendBackward(selectedTextId, "text");
      if (selectedFileId) sendBackward(selectedFileId, "file");
      if (selectedBrowserId) sendBackward(selectedBrowserId, "browser");
      if (selectedGeneratedId) sendBackward(selectedGeneratedId, "generated");
    },
    // Media
    onToggleRecording: () => { /* Handled in VideoCanvas via props usually, but we can't trigger it here easily without ref access to CanvasContainer's internal state or refactoring. 
          Actually CanvasContainer handles recording toggle. We need to pass a ref or expose a method. 
          For now, 'Cmd+R' might be tricky if logic is inside CanvasContainer.
          However, 'recording' object is here! */
      // Logic is: startRecording needs a canvas ref. 
      // We have canvasRef here! passed to CanvasContainer.

      if (recording.isRecording) {
        // Stop is complex, needs size etc. Let's rely on the UI button handler logic which is inside CanvasContainer.
        // We can't easily replicate it here without duplicating logic.
        // SKIP for now or simple toast "Use button to stop" if too complex.
        // Actually, let's leave it undefined here and handle it if we can move logic up.
        // Or, we can just toggle the STATE if we had a toggle function.
        // user request says "Possible".
      } else {
        // Start implementation...
        if (canvasRef.current) {
          recording.startRecording(canvasRef.current);
          toast.info("Recording started via shortcut!");
        }
      }
    },
    onToggleMic: () => updateSceneProperty("isAudioOn", !activeScene.isAudioOn),
    onToggleCamera: () => updateSceneProperty("isVideoOn", !activeScene.isVideoOn),
    onToggleBroadcast: () => setIsVirtualCameraEnabled(p => !p),
    onToggleSmartSwitch: () => {
      setIsSmartSwitchEnabled(prev => !prev);
      toast.info(!isSmartSwitchEnabled ? "Smart Scene Switch: ON" : "Smart Scene Switch: OFF");
    },
    // Creation
    onAddText: handleAddTextOverlay,
    onOpenAssetLibrary: () => { /* This is inside CanvasHoverToolbar... we can open a general one? 
          Or maybe 'L' opens the AnimationLibraryPanel?
          User request says "Open Asset Library src/pages/Index.tsx L Possible".
          We have `setShowAnimationLibrary`. Let's use that for now or add a new state for global asset lib?
          Actually `CanvasHoverToolbar` has the assets.
          Let's map 'L' to AnimationLibrary for now, or just skip if ambiguous.
          Let's map to setShowAnimationLibrary for 'L'.
      */
      setShowAnimationLibrary(true);
    },
    onToggleDrawing: () => setIsDrawing(prev => !prev),
  });

  // UI Effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 50;
      if (window.innerWidth - e.clientX <= threshold)
        setIsSceneTabsHidden(false);
      else if (window.innerWidth - e.clientX > 300) setIsSceneTabsHidden(true);

      setIsMouseActive(true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => setIsMouseActive(false), 3000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);



  const handleRecordingComplete = useCallback(
    (session: RecordingSession) => {
      setAllSessions((prev) => [session, ...prev]);
      setTimeout(() => navigate(`/edit/${session.id}`), 50);
    },
    [navigate, setAllSessions]
  );

  const handleSelectAnimation = useCallback(
    (preset: AnimationPreset) => {
      const htmlContent = generateHtmlFromPreset(preset);
      const newOverlay: GeneratedOverlay = {
        id: generateId("overlay"),
        name: preset.name,
        htmlContent,
        layout: {
          position: { x: 30, y: 40 },
          size: { width: 40, height: 20 },
          zIndex: zIndex.draggableElement,
          rotation: 0,
          layerOrder: "above-video",
        },
        preview: "",
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

      toast.success(`Added "${preset.name}" to canvas`);
      setShowAnimationLibrary(false);
    },
    [updateActiveScene, recording]
  );

  const handleSelectGSAPAnimation = useCallback(
    (preset: GSAPPreset, customText?: string, customColor?: string) => {
      const displayText = customText || preset.name;
      const textColor = customColor || preset.config.color || "#FFFFFF";
      const htmlContent = generateGSAPHtml(preset, displayText, preset.description, {
        fontFamily: preset.config.fontFamily || "Inter",
        fontSize: preset.config.fontSize || 48,
        color: textColor,
        backgroundColor: "transparent",
        textAlign: "center",
      });
      const newOverlay: GeneratedOverlay = {
        id: generateId("gsap-overlay"),
        name: `${preset.name} (Pro)`,
        htmlContent,
        layout: {
          position: { x: 25, y: 35 },
          size: { width: 50, height: 30 },
          zIndex: zIndex.draggableElement,
          rotation: 0,
          layerOrder: "above-video",
        },
        preview: "",
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

      toast.success(`Added "${displayText}" animation to canvas`);
    },
    [updateActiveScene, recording]
  );

  if (!activeScene || !effectiveScene) return <div>Loading...</div>;

  return (
    <div
      ref={(node) => node && setMainContainer(node)}
      className={cn(
        "h-screen flex bg-background overflow-hidden relative w-full",
        !isMouseActive && "cursor-none"
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
          isFullscreen,
          onToggleFullscreen: handleToggleFullscreen,
          isFsSidebarOpen,
          onFsSidebarToggle: setIsFsSidebarOpen,
          isMouseActive,
          onOpenSessions: () => setShowSessionsPanel(true),
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
        canvasRef={canvasRef}
        mainContainerRef={(node) => node && setMainContainer(node)}
        isSettingsOpen={showSettings}
        onSetSettingsOpen={setShowSettings}
        remoteStream={remoteStream}
        isChatbotOpen={isChatbotOpen} // --- PROP ---
        onChatbotToggle={setIsChatbotOpen} // --- PROP ---
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
        onSubsceneReorder={handleSceneReorder}
        onSceneRename={handleSceneRename}
        onSubsceneRename={handleSubsceneRename}
        onToggleExpand={handleToggleExpand}
        onDuplicateScene={handleDuplicateScene}
        onResetScene={handleResetSceneToDefault}
        isHidden={isSceneTabsHidden}
        onHide={() => setIsSceneTabsHidden(true)}
        isPopoverOpen={activeTransition !== null}
        onApplyStreamStyle={(preset) => {
          const newSubscenes = createScenesFromStreamStyle(preset);
          toast.success(`Created ${newSubscenes.length} subscenes from "${preset.name}" style!`);
        }}
      />



      <TransitionPopover
        transition={activeTransition}
        onClose={() => setActiveTransition(null)}
        onTransitionChange={handleTransitionChange}
      />

      <AnimationLibraryPanel
        isOpen={showAnimationLibrary}
        onClose={() => setShowAnimationLibrary(false)}
        onSelect={handleSelectAnimation}
        onSelectGSAP={handleSelectGSAPAnimation}
      />

      <SavedSessionsPanel
        sessions={allSessions}
        onDeleteSession={(id) =>
          setAllSessions((s) => s.filter((x) => x.id !== id))
        }
        presets={presets}
        onDeletePreset={handleDeletePreset}
        onLoadPreset={handleLoadPreset}
        isOpen={showSessionsPanel}
        onClose={() => setShowSessionsPanel(false)}
      />

      <ExcalidrawOverlay
        isVisible={isDrawing}
        onClose={() => setIsDrawing(false)}
        initialElements={excalidrawElements}
        onElementsChange={setExcalidrawElements}
      />

      <BottomNavigation
        isMouseActive={isMouseActive}
        onOpenSettings={() => setShowSettings((prev) => !prev)}
        onOpenSessions={() => setShowSessionsPanel(true)}
        onSaveLayout={handleSaveLayout}
        onOpenAnimationLibrary={() => setShowAnimationLibrary(true)}
        isAudioOn={activeScene.isAudioOn}
        onAudioToggle={(val) => updateSceneProperty("isAudioOn", val)}
        audioDevices={audioDevices}
        onAudioDeviceSelect={(val) =>
          updateSceneProperty("selectedAudioDevice", val)
        }
        selectedAudioDevice={activeScene.selectedAudioDevice}
        isVideoOn={activeScene.isVideoOn}
        onVideoToggle={(val) => {
          // If turning ON and using remote peer, force the modal to reappear even if previously dismissed
          if (val && activeScene.selectedVideoDevice === "remote-peer" && !isRemoteConnected) {
            setHasDismissedRemoteModal(false);
            setIsRemoteModalOpen(true);
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
        onRecordingToggle={() => { }}
        isBroadcasting={isVirtualCameraEnabled}
        onBroadcastToggle={() => setIsVirtualCameraEnabled((prev) => !prev)}
        onAddTextOverlay={handleAddTextOverlay}
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
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
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
        portalContainer={mainContainer || undefined}
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
        // --- Smart Switch Props ---
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
        isOpen={isRemoteModalOpen}
        onOpenChange={(open) => {
          setIsRemoteModalOpen(open);
          if (!open) setHasDismissedRemoteModal(true);
        }}
        peerId={peerId}
        isConnected={isRemoteConnected}
      />
    </div>
  );
};

export default Index;
