// src/pages/index/hooks/useSceneManager.ts
import { useState, useCallback, useMemo } from "react";
import {
  SceneState,
  SceneTransition,
  CaptionStyle,
  DEFAULT_LAYOUT_STATE,
  DEFAULT_CAMERA_STATE,
  CanvasLayoutState,
} from "@/types/caption";
import { zIndex } from "@/lib/zIndex";

const generateSceneId = () => `scene-${Date.now()}`;
const generateTransitionId = () => `trans-${Date.now()}`;

export const DEFAULT_CAPTION_STYLE: CaptionStyle = {
  fontFamily: "Inter",
  fontSize: 32,
  color: "#FFFFFF",
  backgroundColor: "rgba(0,0,0,0.8)",
  position: { x: 50, y: 50 },
  shape: "rounded",
  animation: "fade",
  outline: false,
  shadow: true,
  bold: false,
  italic: false,
  underline: false,
  rotation: 0,
  border: false,
  borderColor: "#FFFFFF",
  borderWidth: 2,
  width: 60,
};

export const createDefaultScene = (name: string): SceneState => ({
  id: generateSceneId(),
  name,
  canvasLayout: null,
  textOverlays: [],
  browserOverlays: [],
  fileOverlays: [],
  activeOverlays: [],
  selectedVideoDevice: undefined,
  selectedAudioDevice: undefined,
  isAudioOn: false,
  isVideoOn: false,
  captionsEnabled: true,
  screenShareMode: "off",
  isAiModeEnabled: true,
  aiButtonPosition: { x: 90, y: 90 },
  captionStyle: DEFAULT_CAPTION_STYLE,
  dynamicStyle: "none",
  layoutMode: DEFAULT_LAYOUT_STATE.mode,
  cameraShape: DEFAULT_LAYOUT_STATE.cameraShape,
  splitRatio: DEFAULT_LAYOUT_STATE.splitRatio,
  pipPosition: DEFAULT_LAYOUT_STATE.pipPosition,
  pipSize: DEFAULT_LAYOUT_STATE.pipSize,
  pipRotation: DEFAULT_LAYOUT_STATE.pipRotation,
  pipBorder: DEFAULT_LAYOUT_STATE.pipBorder,
  pipShadow: DEFAULT_LAYOUT_STATE.pipShadow,
  customMaskUrl: undefined,
  videoFilter: "none",
  blankCanvasColor: "#1A1A1A",
  backgroundEffect: "none",
  backgroundImageUrl: null,
  isAutoFramingEnabled: false,
  zoomSensitivity: 4.0,
  trackingSpeed: 0.08,
  isBeautifyEnabled: false,
  isLowLightEnabled: false,
  isNeonEdgeEnabled: false,
  neonIntensity: 20,
  neonColor: "cyan",
  cameraBackground: "none",
  customBackgroundUrl: null,
  cameraAspectRatio: "16:9",
  canvasAspectRatio: "16:9",
  customAspectRatio: "",
  isFaceTrackingEnabled: false,
  activeInteractiveFilter: "none",
  filterIntensity: 1.0,
  filterColor: "#00ffff",
  filterTarget: "both",
});

interface UseSceneManagerProps {
  recording: any; // Type from useRecordingSession
}

export const useSceneManager = ({ recording }: UseSceneManagerProps) => {
  const [scenes, setScenes] = useState<SceneState[]>(() => [
    createDefaultScene("Scene 1"),
  ]);
  const [activeSceneId, setActiveSceneId] = useState<string>(scenes[0].id);
  const [sceneTransitions, setSceneTransitions] = useState<SceneTransition[]>(
    []
  );
  const [previousScene, setPreviousScene] = useState<SceneState | null>(null);
  const [activeTransition, setActiveTransition] =
    useState<SceneTransition | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const activeScene = useMemo(
    () => scenes.find((s) => s.id === activeSceneId)!,
    [scenes, activeSceneId]
  );

  const updateActiveScene = useCallback(
    (updates: (scene: SceneState) => SceneState) => {
      setScenes((prevScenes) =>
        prevScenes.map((scene) => {
          if (scene.id === activeSceneId) {
            return updates(scene);
          }
          return scene;
        })
      );
    },
    [activeSceneId]
  );

  const updateSceneProperty = useCallback(
    <K extends keyof SceneState>(key: K, value: SceneState[K]) => {
      updateActiveScene((scene) => {
        const updatedScene = { ...scene, [key]: value };
        // Record layout changes if recording
        if (
          [
            "layoutMode",
            "cameraShape",
            "splitRatio",
            "pipPosition",
            "pipSize",
          ].includes(key as string)
        ) {
          if (recording.isRecording) {
            recording.recordLayoutChange({
              mode: updatedScene.layoutMode,
              cameraShape: updatedScene.cameraShape,
              splitRatio: updatedScene.splitRatio,
              pipPosition: updatedScene.pipPosition,
              pipSize: updatedScene.pipSize,
            });
          }
        }
        return updatedScene;
      });
    },
    [updateActiveScene, recording]
  );

  const handleAddScene = () => {
    const newScene = createDefaultScene(`Scene ${scenes.length + 1}`);
    const newScenes = [...scenes, newScene];

    if (scenes.length > 0) {
      const prevSceneId = scenes[scenes.length - 1].id;
      const newTransition: SceneTransition = {
        id: generateTransitionId(),
        fromSceneId: prevSceneId,
        toSceneId: newScene.id,
        type: "none",
        durationMs: 300,
        animationIn: "ease-in-out",
        animationOut: "ease-in-out",
        overlayEnabled: false,
      };
      setSceneTransitions((prev) => [...prev, newTransition]);
    }

    setScenes(newScenes);
    // Automatically select the new scene? Or wait for user?
    // Typically UI expects explicit selection, but we can trigger logic here if needed.
    // For consistency with original Index.tsx, we'll just add it.
    // If you want to auto-switch: handleSceneSelect(newScene.id);
  };

  const handleSceneSelect = (sceneId: string) => {
    if (sceneId === activeSceneId || isTransitioning) return;

    const newScene = scenes.find((s) => s.id === sceneId);
    if (!newScene) return;

    const oldScene = activeScene;
    const transition =
      sceneTransitions.find(
        (t) =>
          (t.fromSceneId === oldScene.id && t.toSceneId === newScene.id) ||
          (t.fromSceneId === newScene.id && t.toSceneId === oldScene.id)
      ) || null;

    const effectiveTransition: SceneTransition = transition || {
      id: "default",
      fromSceneId: oldScene.id,
      toSceneId: newScene.id,
      type: "dissolve",
      durationMs: 500,
      animationIn: "ease-in-out",
      animationOut: "ease-in-out",
      overlayEnabled: false,
    };

    if (effectiveTransition.type === "none") {
      setActiveSceneId(sceneId);
      setPreviousScene(null);
      setActiveTransition(null);
      return;
    }

    setPreviousScene(oldScene);
    setActiveTransition(effectiveTransition);
    setIsTransitioning(true);
    setActiveSceneId(newScene.id);

    setTimeout(() => {
      setIsTransitioning(false);
      setPreviousScene(null);
      setActiveTransition(null);
    }, effectiveTransition.durationMs);
  };

  const handleSceneClose = (sceneId: string) => {
    if (scenes.length <= 1) return; // Can't close last scene
    const newScenes = scenes.filter((s) => s.id !== sceneId);
    setScenes(newScenes);
    setSceneTransitions((prev) =>
      prev.filter((t) => t.fromSceneId !== sceneId && t.toSceneId !== sceneId)
    );
    if (activeSceneId === sceneId) {
      setActiveSceneId(newScenes[0].id);
    }
  };

  const handleSceneReorder = (fromIndex: number, toIndex: number) => {
    const newScenes = [...scenes];
    const [moved] = newScenes.splice(fromIndex, 1);
    newScenes.splice(toIndex, 0, moved);
    setScenes(newScenes);
  };

  const handleSceneRename = (sceneId: string, newName: string) => {
    setScenes((prev) =>
      prev.map((scene) =>
        scene.id === sceneId ? { ...scene, name: newName } : scene
      )
    );
  };

  const handleTransitionChange = (
    transitionId: string,
    updates: Partial<SceneTransition>
  ) => {
    setSceneTransitions((prev) =>
      prev.map((t) => (t.id === transitionId ? { ...t, ...updates } : t))
    );
    if (activeTransition && activeTransition.id === transitionId) {
      setActiveTransition((prev) => ({ ...prev!, ...updates }));
    }
  };

  // --- Sequencer Logic for Scene Manager ---
  const handleSequenceTransition = useCallback(
    (newLayout: CanvasLayoutState, newActiveId: string) => {
      updateActiveScene((scene) => ({
        ...scene,
        canvasLayout: newLayout,
        activeSequenceId: newActiveId,
      }));
    },
    [updateActiveScene]
  );

  return {
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
    handleSequenceTransition,
  };
};
