import { toast } from "sonner";
import { useRecordingSession } from "@/features/stream/hooks/useRecordingSession";
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

export const useEditorOrchestrator = () => {
  const recording = useRecordingSession();
  const ui = useIndexUI();
  const selection = useSelectionState();
  const sessionData = useSessionData();
  const drawing = useDrawingController();
  const { dynamicLayout, setDynamicLayout } = useDynamicLayoutState();

  // --- SCENE & MEDIA ---
  const sceneManager = useSceneManager({ recording });
  const { activeScene, effectiveScene, activeSceneId } = sceneManager;

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
    recording,
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
    recording,
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
    onToggleRecording: () => {
      if (recording.isRecording) {
        // Stop logic handled in canvas via refs usually, or specific method
      } else if (ui.canvasRef.current) {
        recording.startRecording(ui.canvasRef.current);
        toast.info("Recording started via shortcut!");
      }
    },
    onToggleMic: () =>
      sceneManager.updateSceneProperty("isAudioOn", !activeScene?.isAudioOn),
    onToggleCamera: () =>
      sceneManager.updateSceneProperty("isVideoOn", !activeScene?.isVideoOn),
    onToggleBroadcast: broadcast.toggleBroadcast,
    onToggleSmartSwitch: broadcast.toggleSmartSwitch,
    onAddText: overlayHandlers.handleAddTextOverlay,
    onOpenAssetLibrary: () => ui.setShowAnimationLibrary(true),
    onToggleDrawing: drawing.toggleDrawing,
  });

  return {
    recording,
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
