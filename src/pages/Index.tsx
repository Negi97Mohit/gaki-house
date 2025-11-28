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
import { AnimationPreset } from "@/types/animation";
import { CanvasContainer } from "./Index/components/CanvasContainer";

import { useRecordingSession } from "@/hooks/useRecordingSession";
import { useCompositeStream } from "@/hooks/useCompositeStream";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useSceneManager } from "./index/hooks/useSceneManager";
import { useMediaManager } from "./index/hooks/useMediaManager";
import { useLayoutManager } from "./index/hooks/useLayoutManager";

import {
  GeneratedOverlay,
  GeneratedLayout,
  TextOverlayState,
} from "@/types/caption";
import { RecordingSession } from "@/types/editor";
import { zIndex } from "@/lib/zIndex";
import { cn } from "@/lib/utils";

const generateOverlayId = () =>
  `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateTextOverlayId = () =>
  `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const Index = () => {
  const navigate = useNavigate();
  const recording = useRecordingSession();

  // --- HOOKS ---
  const {
    scenes,
    activeScene,
    activeSceneId,
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
  } = useSceneManager({ recording });

  const { audioDevices, videoDevices } = useMediaManager({
    isAudioOn: activeScene?.isAudioOn || false,
    selectedAudioDevice: activeScene?.selectedAudioDevice,
    sceneId: activeSceneId,
    onAudioToggle: (val) => updateSceneProperty("isAudioOn", val),
  });

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

  // Selection
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(
    null
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

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

  // UI Effects
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 50;
      if (window.innerWidth - e.clientX <= threshold)
        setIsSceneTabsHidden(false);
      else if (window.innerWidth - e.clientX > 300) setIsSceneTabsHidden(true);

      setIsMouseActive(true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => setIsMouseActive(false), 5000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // --- Handlers ---
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
        id: generateOverlayId(),
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
      toast.success(`Added "${preset.name}" to canvas`);
      setShowAnimationLibrary(false);
    },
    [updateActiveScene, recording]
  );

  const handleAddTextOverlay = useCallback(() => {
    const newTextOverlay: TextOverlayState = {
      id: generateTextOverlayId(),
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

  if (!activeScene) return <div>Loading...</div>;

  return (
    <div
      ref={(node) => node && setMainContainer(node)}
      className={cn(
        "h-screen flex bg-background overflow-hidden relative w-full",
        !isMouseActive && "cursor-none"
      )}
    >
      <CanvasContainer
        activeScene={activeScene}
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
          onToggleFullscreen: () => setIsFullscreen(!isFullscreen),
          isFsSidebarOpen,
          onFsSidebarToggle: setIsFsSidebarOpen,
          isMouseActive,
          onOpenSessions: () => setShowSessionsPanel(true),
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
          handleDeselectAll: () => {
            setSelectedBrowserId(null);
            setSelectedFileId(null);
            setSelectedTextId(null);
          },
        }}
        canvasRef={canvasRef}
        mainContainerRef={(node) => node && setMainContainer(node)}
      />

      <SceneTabs
        scenes={scenes}
        activeSceneId={activeSceneId}
        transitions={sceneTransitions}
        onSceneSelect={handleSceneSelect}
        onSceneAdd={handleAddScene}
        onTransitionClick={setActiveTransition}
        onSceneClose={handleSceneClose}
        onSceneReorder={handleSceneReorder}
        onSceneRename={handleSceneRename}
        isHidden={isSceneTabsHidden}
        onHide={() => setIsSceneTabsHidden(true)}
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
        onOpenSettings={() => {}}
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
        onVideoToggle={(val) => updateSceneProperty("isVideoOn", val)}
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
        onRecordingToggle={() => {
          // This is a UI-only trigger, logic is in CanvasContainer via handleRecordingToggle ref
          // Ideally CanvasContainer exposes a handler or we access it differently.
          // For now, we can replicate the trigger or pass a ref to trigger it.
          // OR simply pass the recording handler from CanvasContainer back up? No.
          // We will duplicate the simple trigger logic or access the handler from a shared context/hook if strictly needed.
          // Or simpler: We define handleRecordingToggle in Index and pass it to both.
          // Let's rely on the passed prop if possible, or define it in Index.
        }}
        isBroadcasting={isVirtualCameraEnabled}
        onBroadcastToggle={() => setIsVirtualCameraEnabled((prev) => !prev)}
        onAddTextOverlay={handleAddTextOverlay}
        onAssetSelect={(asset) => toast.info(`Asset selected: ${asset.alt}`)}
        setIsDrawing={setIsDrawing}
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        isFullscreen={isFullscreen}
        layoutMode={activeScene.layoutMode}
        cameraShape={activeScene.cameraShape}
        onLayoutModeChange={(val) => updateSceneProperty("layoutMode", val)}
        onCameraShapeChange={(val) => updateSceneProperty("cameraShape", val)}
        onCustomMaskUpload={(file) => {
          // Duplicate simple handler or move to shared utils
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
      />
    </div>
  );
};

export default Index;
