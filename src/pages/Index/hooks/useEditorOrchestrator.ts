import { useEffect } from "react";
import { toast } from "sonner";

import { useLayerControls } from "@/hooks/useLayerControls";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useIndexUI } from "./useIndexUI";
import { useSceneManager } from "./useSceneManager";
import { useMediaManager } from "./useMediaManager";
import { useLayoutManager } from "./useLayoutManager";
import { useRemoteConnection } from "./useRemoteConnection";
import { useOverlayHandlers } from "./useOverlayHandlers";
import { useSelectionState } from "./useSelectionState";
import { useBroadcastController } from "./useBroadcastController";
import { useSessionData } from "./useSessionData";
import { useDrawingController } from "./useDrawingController";
import { useDynamicLayoutState } from "./useDynamicLayoutState";
import { useSceneAudioStore } from "@/stores/sceneAudio.store";
import { useCompositorSync } from "@/features/canvas/hooks/useCompositorSync";

export const useEditorOrchestrator = () => {

  const ui = useIndexUI();
  const selection = useSelectionState();
  const sessionData = useSessionData();
  const drawing = useDrawingController();
  const { dynamicLayout, setDynamicLayout } = useDynamicLayoutState();

  // --- SCENE & MEDIA ---
  const sceneManager = useSceneManager({});
  const { activeScene, effectiveScene, activeSceneId } = sceneManager;

  // Sync scene info to audio store
  const setSceneAudioScenes = useSceneAudioStore((s) => s.setScenes);
  const setSceneAudioActiveId = useSceneAudioStore((s) => s.setActiveSceneId);
  useEffect(() => {
    setSceneAudioScenes(sceneManager.scenes.map((s) => ({ id: s.id, name: s.name })));
  }, [sceneManager.scenes, setSceneAudioScenes]);
  useEffect(() => {
    setSceneAudioActiveId(activeSceneId);
  }, [activeSceneId, setSceneAudioActiveId]);

  // --- COMPOSITOR SYNC ---
  // Bridges legacy scene state → new CompositorScene → WebGL compositor
  useCompositorSync({
    scenes: sceneManager.scenes,
    activeSceneId,
    isTransitioning: sceneManager.isTransitioning,
    activeTransition: sceneManager.activeTransition,
    previousScene: sceneManager.previousScene,
  });

  const mediaManager = useMediaManager({
    isAudioOn: activeScene?.isAudioOn || false,
    selectedAudioDevice: activeScene?.selectedAudioDevice,
    sceneId: activeSceneId,
    onAudioToggle: (val) => sceneManager.updateSceneProperty("isAudioOn", val),
  });

  const remote = useRemoteConnection(activeScene);

  // --- BROADCAST ---
  const broadcast = useBroadcastController({
    scenes: sceneManager.scenes,
    activeSceneId: sceneManager.activeSceneId,
    onSceneSelect: sceneManager.handleSceneSelect,
    remoteStream: remote.remoteStream,
    videoDevices: mediaManager.videoDevices,
    canvasRef: ui.canvasRef,
  });

  // --- LAYOUT ---
  const layoutManager = useLayoutManager({
    activeScene,
    updateActiveScene: sceneManager.updateActiveScene,

    setSelectedTextId: selection.setSelectedTextId,
    setSelectedFileId: selection.setSelectedFileId,
    setSelectedBrowserId: selection.setSelectedBrowserId,
  });

  // --- CONTROLS & HANDLERS ---
  const layerControls = useLayerControls({
    activeScene,
    updateActiveScene: sceneManager.updateActiveScene,
  });

  const overlayHandlers = useOverlayHandlers({
    activeScene: effectiveScene!,
    updateActiveScene: sceneManager.updateActiveScene,

    selection,
    setShowAnimationLibrary: ui.setShowAnimationLibrary,
    ...layerControls,
  });

  // --- SHORTCUTS ---
  useKeyboardShortcuts({
    onToggleFullscreen: ui.handleToggleFullscreen,
    onToggleAiAssistant: () => ui.setIsChatbotOpen((prev) => !prev),
    onToggleSettings: () => ui.setShowSettings((prev) => !prev),
    onUndo: sceneManager.canUndo ? sceneManager.undo : undefined,
    onRedo: sceneManager.canRedo ? sceneManager.redo : undefined,
    onResetScene: sceneManager.resetScene,
    onDelete: overlayHandlers.handleDeleteSelected,
    onBringToFront: overlayHandlers.handleBringToFront,
    onSendToBack: overlayHandlers.handleSendToBack,
    onBringForward: overlayHandlers.handleBringForward,
    onSendBackward: overlayHandlers.handleSendBackward,

    onToggleMic: () =>
      sceneManager.updateSceneProperty("isAudioOn", !activeScene?.isAudioOn),
    onToggleCamera: () =>
      sceneManager.updateSceneProperty("isVideoOn", !activeScene?.isVideoOn),
    onToggleBroadcast: broadcast.toggleBroadcast,
    onToggleSmartSwitch: broadcast.toggleSmartSwitch,
    onToggleScreenShare: () => {
      const { screenShareMode, setScreenShareMode } = require("@/stores/media.store").useMediaStore.getState();
      setScreenShareMode(screenShareMode === "off" ? "screen" : "off");
    },
    onAddScene: sceneManager.handleAddScene,
    onToggleGridLayout: () => ui.setIsSceneTabsHidden((prev) => !prev),
    onAddText: overlayHandlers.handleAddTextOverlay,
    onOpenAssetLibrary: () => ui.setShowAnimationLibrary(true),
    onToggleDrawing: drawing.toggleDrawing,
  });

  return {

    ui,
    selection,
    sessionData,
    drawing,
    dynamicLayout,
    setDynamicLayout,
    sceneManager,
    mediaManager,
    remote,
    broadcast,
    layoutManager,
    layerControls,
    overlayHandlers,
    activeScene,
    effectiveScene,
    activeSceneId,
  };
};
