// src/pages/index/hooks/useSceneManager.ts
import { useState, useCallback, useMemo, useEffect, useRef } from "react"; // Added useRef, useEffect
// ... imports

// Stores
import { useCanvasStore } from "@/stores/canvas.store";
import { useMediaStore } from "@/stores/media.store";
import { useSceneStore } from "@/stores/scene.store";

// ... (keep existing imports)

import { v4 as uuidv4 } from "uuid";

// Helper to create a pristine default scene
const createDefaultScene = (name: string): SceneState => ({
  id: uuidv4(),
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
  isAiModeEnabled: false,
  aiButtonPosition: { x: 20, y: 20 },

  layoutMode: "solo",
  cameraShape: "rectangle",
  splitRatio: 0.5,
  pipPosition: { x: 75, y: 75 },
  pipSize: { width: 20, height: 20 },
  pipRotation: 0,
  pipBorder: { color: "#FFFFFF", width: 0 },
  pipShadow: { blur: 0, color: "rgba(0,0,0,0.5)" },

  videoFilter: "none",
  backgroundEffect: "none",
  backgroundImageUrl: null,
  blankCanvasColor: "#000000",

  captionStyle: {
    fontFamily: "Inter",
    fontSize: 24,
    color: "#FFFFFF",
    backgroundColor: "rgba(0,0,0,0.5)",
    position: { x: 50, y: 90 },
    shape: "rounded",
    animation: "fade",
    outline: false,
    shadow: true,
    bold: false,
    italic: false,
    underline: false,
    rotation: 0,
    border: false,
    borderColor: "#000000",
    borderWidth: 2,
    textAlign: "center",
  },
  dynamicStyle: "none",

  activeInteractiveFilter: "none",
  filterIntensity: 0.5,
  filterColor: "#22d3ee",
  filterTarget: "both",

  isAutoFramingEnabled: false,
  zoomSensitivity: 0.5,
  trackingSpeed: 0.5,
  isBeautifyEnabled: false,
  isLowLightEnabled: false,
  isNeonEdgeEnabled: false,
  neonIntensity: 0.8,
  neonColor: "#00ff00",

  cameraBackground: "none",
  customBackgroundUrl: null,
  activeSequenceId: null,
  cameraAspectRatio: "16:9",
  canvasAspectRatio: "16:9",
  customAspectRatio: "",
  isFaceTrackingEnabled: false,
});

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

  // --- STORE SYNC ---
  const canvasStore = useCanvasStore();
  const mediaStore = useMediaStore();
  const sceneStore = useSceneStore();

  const isSyncingFromStore = useRef(false);
  const isSyncingFromScene = useRef(false);

  // 1. Sync SCENE -> STORE (Hydration)
  useEffect(() => {
    if (isSyncingFromStore.current) return;

    isSyncingFromScene.current = true;

    // Media
    if (mediaStore.isAudioOn !== activeScene.isAudioOn)
      mediaStore.setAudioOn(activeScene.isAudioOn);
    if (mediaStore.isVideoOn !== activeScene.isVideoOn)
      mediaStore.setVideoOn(activeScene.isVideoOn);
    if (mediaStore.selectedAudioDevice !== activeScene.selectedAudioDevice)
      mediaStore.setSelectedAudioDevice(activeScene.selectedAudioDevice ?? "");
    if (mediaStore.selectedVideoDevice !== activeScene.selectedVideoDevice)
      mediaStore.setSelectedVideoDevice(activeScene.selectedVideoDevice ?? "");
    if (mediaStore.screenShareMode !== activeScene.screenShareMode)
      mediaStore.setScreenShareMode(activeScene.screenShareMode);

    // Canvas
    if (canvasStore.layoutMode !== activeScene.layoutMode)
      canvasStore.setLayoutMode(activeScene.layoutMode);
    if (canvasStore.cameraShape !== activeScene.cameraShape)
      canvasStore.setCameraShape(activeScene.cameraShape);
    if (canvasStore.splitRatio !== activeScene.splitRatio)
      canvasStore.setSplitRatio(activeScene.splitRatio);
    // Deep checks for objects might be needed or accept slight redundancy
    if (
      JSON.stringify(canvasStore.pipPosition) !==
      JSON.stringify(activeScene.pipPosition)
    )
      canvasStore.setPipPosition(activeScene.pipPosition);
    if (
      JSON.stringify(canvasStore.pipSize) !==
      JSON.stringify(activeScene.pipSize)
    )
      canvasStore.setPipSize(activeScene.pipSize);

    // Scene
    if (sceneStore.customMaskUrl !== activeScene.customMaskUrl)
      sceneStore.setCustomMaskUrl(activeScene.customMaskUrl);
    if (sceneStore.activeOverlays !== activeScene.activeOverlays)
      sceneStore.setActiveOverlays(activeScene.activeOverlays);
    if (sceneStore.textOverlays !== activeScene.textOverlays)
      sceneStore.setTextOverlays(activeScene.textOverlays);
    if (sceneStore.fileOverlays !== activeScene.fileOverlays)
      sceneStore.setFileOverlays(activeScene.fileOverlays);
    if (sceneStore.browserOverlays !== activeScene.browserOverlays)
      sceneStore.setBrowserOverlays(activeScene.browserOverlays);
    if (sceneStore.canvasLayout !== activeScene.canvasLayout)
      sceneStore.setCanvasLayout(activeScene.canvasLayout);
    if (sceneStore.backgroundEffect !== activeScene.backgroundEffect)
      sceneStore.setBackgroundEffect(activeScene.backgroundEffect);
    if (sceneStore.backgroundImageUrl !== activeScene.backgroundImageUrl)
      sceneStore.setBackgroundImageUrl(activeScene.backgroundImageUrl);
    if (sceneStore.videoFilter !== activeScene.videoFilter)
      sceneStore.setVideoFilter(activeScene.videoFilter);
    if (sceneStore.captionStyle !== activeScene.captionStyle)
      sceneStore.setCaptionStyle(activeScene.captionStyle);
    if (sceneStore.isAiModeEnabled !== activeScene.isAiModeEnabled)
      sceneStore.setAiModeEnabled(activeScene.isAiModeEnabled);
    if (sceneStore.captionsEnabled !== activeScene.captionsEnabled)
      sceneStore.setCaptionsEnabled(activeScene.captionsEnabled);

    // Reset flag after render cycle (timeout helps with React batching)
    setTimeout(() => {
      isSyncingFromScene.current = false;
    }, 0);
  }, [activeScene]); // Dependency on activeScene ensures update on switch or legacy change

  // 2. Sync STORE -> SCENE (Updates from Store UI)
  // We need to listen to all relevant store values.
  const storeValues = {
    isAudioOn: mediaStore.isAudioOn,
    isVideoOn: mediaStore.isVideoOn,
    selectedAudioDevice: mediaStore.selectedAudioDevice,
    selectedVideoDevice: mediaStore.selectedVideoDevice,
    screenShareMode: mediaStore.screenShareMode,
    layoutMode: canvasStore.layoutMode,
    cameraShape: canvasStore.cameraShape,
    splitRatio: canvasStore.splitRatio,
    pipPosition: canvasStore.pipPosition,
    pipSize: canvasStore.pipSize,
    customMaskUrl: sceneStore.customMaskUrl,
    activeOverlays: sceneStore.activeOverlays,
    textOverlays: sceneStore.textOverlays,
    fileOverlays: sceneStore.fileOverlays,
    browserOverlays: sceneStore.browserOverlays,
    canvasLayout: sceneStore.canvasLayout,
    backgroundEffect: sceneStore.backgroundEffect,
    backgroundImageUrl: sceneStore.backgroundImageUrl,
    videoFilter: sceneStore.videoFilter,
    captionStyle: sceneStore.captionStyle,
    isAiModeEnabled: sceneStore.isAiModeEnabled,
    captionsEnabled: sceneStore.captionsEnabled,
  };

  useEffect(() => {
    if (isSyncingFromScene.current) return;

    // Check if anything actually changed to avoid loop
    // This is expensive but necessary for massive sync object
    let changed = false;
    // ... complex check or just rely on 'updateActiveScene's internal check?
    // updateActiveScene has inner check.

    isSyncingFromStore.current = true;

    updateActiveScene((prev) => {
      const next = { ...prev };
      let modified = false;

      if (next.isAudioOn !== storeValues.isAudioOn) {
        next.isAudioOn = storeValues.isAudioOn;
        modified = true;
      }
      if (next.isVideoOn !== storeValues.isVideoOn) {
        next.isVideoOn = storeValues.isVideoOn;
        modified = true;
      }
      if (next.selectedAudioDevice !== storeValues.selectedAudioDevice) {
        next.selectedAudioDevice = storeValues.selectedAudioDevice;
        modified = true;
      }
      if (next.selectedVideoDevice !== storeValues.selectedVideoDevice) {
        next.selectedVideoDevice = storeValues.selectedVideoDevice;
        modified = true;
      }
      if (next.screenShareMode !== storeValues.screenShareMode) {
        next.screenShareMode = storeValues.screenShareMode;
        modified = true;
      }

      if (next.layoutMode !== storeValues.layoutMode) {
        next.layoutMode = storeValues.layoutMode;
        modified = true;
      }
      if (next.cameraShape !== storeValues.cameraShape) {
        next.cameraShape = storeValues.cameraShape;
        modified = true;
      }
      if (next.splitRatio !== storeValues.splitRatio) {
        next.splitRatio = storeValues.splitRatio;
        modified = true;
      }
      if (
        JSON.stringify(next.pipPosition) !==
        JSON.stringify(storeValues.pipPosition)
      ) {
        next.pipPosition = storeValues.pipPosition;
        modified = true;
      }
      if (
        JSON.stringify(next.pipSize) !== JSON.stringify(storeValues.pipSize)
      ) {
        next.pipSize = storeValues.pipSize;
        modified = true;
      }

      if (next.customMaskUrl !== storeValues.customMaskUrl) {
        next.customMaskUrl = storeValues.customMaskUrl;
        modified = true;
      }
      if (next.activeOverlays !== storeValues.activeOverlays) {
        next.activeOverlays = storeValues.activeOverlays;
        modified = true;
      }
      if (next.textOverlays !== storeValues.textOverlays) {
        next.textOverlays = storeValues.textOverlays;
        modified = true;
      }
      if (next.fileOverlays !== storeValues.fileOverlays) {
        next.fileOverlays = storeValues.fileOverlays;
        modified = true;
      }
      if (next.browserOverlays !== storeValues.browserOverlays) {
        next.browserOverlays = storeValues.browserOverlays;
        modified = true;
      }
      if (next.canvasLayout !== storeValues.canvasLayout) {
        next.canvasLayout = storeValues.canvasLayout;
        modified = true;
      }
      if (next.backgroundEffect !== storeValues.backgroundEffect) {
        next.backgroundEffect = storeValues.backgroundEffect;
        modified = true;
      }
      if (next.backgroundImageUrl !== storeValues.backgroundImageUrl) {
        next.backgroundImageUrl = storeValues.backgroundImageUrl;
        modified = true;
      }
      if (next.videoFilter !== storeValues.videoFilter) {
        next.videoFilter = storeValues.videoFilter;
        modified = true;
      }
      if (next.captionStyle !== storeValues.captionStyle) {
        next.captionStyle = storeValues.captionStyle;
        modified = true;
      }
      if (next.isAiModeEnabled !== storeValues.isAiModeEnabled) {
        next.isAiModeEnabled = storeValues.isAiModeEnabled;
        modified = true;
      }
      if (next.captionsEnabled !== storeValues.captionsEnabled) {
        next.captionsEnabled = storeValues.captionsEnabled;
        modified = true;
      }

      return modified ? next : prev;
    });

    setTimeout(() => {
      isSyncingFromStore.current = false;
    }, 0);
  }, [
    // Flatten dependency array for storeValues
    storeValues.isAudioOn,
    storeValues.isVideoOn,
    storeValues.selectedAudioDevice,
    storeValues.selectedVideoDevice,
    storeValues.screenShareMode,
    storeValues.layoutMode,
    storeValues.cameraShape,
    storeValues.splitRatio,
    storeValues.pipPosition,
    storeValues.pipSize,
    storeValues.customMaskUrl,
    storeValues.activeOverlays,
    storeValues.textOverlays,
    storeValues.fileOverlays,
    storeValues.browserOverlays,
    storeValues.canvasLayout,
    storeValues.backgroundEffect,
    storeValues.backgroundImageUrl,
    storeValues.videoFilter,
    storeValues.captionStyle,
    storeValues.isAiModeEnabled,
    storeValues.captionsEnabled,
  ]);

  // --- History Management ---
  // We store history per scene ID to allow independent undo/redo
  const [history, setHistory] = useState<{
    [sceneId: string]: {
      past: SceneState[];
      future: SceneState[];
    };
  }>({});

  const getSceneHistory = useCallback(
    (sceneId: string) => {
      return (
        history[sceneId] || {
          past: [],
          future: [],
        }
      );
    },
    [history]
  );

  const updateActiveScene = useCallback(
    (updates: (scene: SceneState) => SceneState) => {
      setScenes((prevScenes) => {
        const activeSceneIndex = prevScenes.findIndex(
          (s) => s.id === activeSceneId
        );
        if (activeSceneIndex === -1) return prevScenes;

        const currentScene = prevScenes[activeSceneIndex];
        const newScene = updates(currentScene);

        // If no change, don't update history or state
        if (JSON.stringify(currentScene) === JSON.stringify(newScene)) {
          return prevScenes;
        }

        // Update History
        setHistory((prev) => {
          const sceneHistory = prev[activeSceneId] || { past: [], future: [] };
          // Limit history size to 50
          const newPast = [...sceneHistory.past, currentScene].slice(-50);
          return {
            ...prev,
            [activeSceneId]: {
              past: newPast,
              future: [], // Clear future on new action
            },
          };
        });

        const newScenes = [...prevScenes];
        newScenes[activeSceneIndex] = newScene;
        return newScenes;
      });
    },
    [activeSceneId]
  );

  const undo = useCallback(() => {
    const sceneHistory = getSceneHistory(activeSceneId);
    if (sceneHistory.past.length === 0) return;

    const previousState = sceneHistory.past[sceneHistory.past.length - 1];
    const newPast = sceneHistory.past.slice(0, -1);

    setScenes((prev) =>
      prev.map((s) => {
        if (s.id === activeSceneId) {
          // Push current to future
          setHistory((h) => ({
            ...h,
            [activeSceneId]: {
              past: newPast,
              future: [s, ...sceneHistory.future],
            },
          }));
          return previousState;
        }
        return s;
      })
    );
  }, [activeSceneId, getSceneHistory]);

  const redo = useCallback(() => {
    const sceneHistory = getSceneHistory(activeSceneId);
    if (sceneHistory.future.length === 0) return;

    const nextState = sceneHistory.future[0];
    const newFuture = sceneHistory.future.slice(1);

    setScenes((prev) =>
      prev.map((s) => {
        if (s.id === activeSceneId) {
          // Push current to past
          setHistory((h) => ({
            ...h,
            [activeSceneId]: {
              past: [...sceneHistory.past, s],
              future: newFuture,
            },
          }));
          return nextState;
        }
        return s;
      })
    );
  }, [activeSceneId, getSceneHistory]);

  const resetScene = useCallback(() => {
    updateActiveScene((currentScene) => ({
      ...createDefaultScene(currentScene.name),
      id: currentScene.id, // Keep ID
    }));
  }, [updateActiveScene]);

  const resetLayout = useCallback(() => {
    updateActiveScene((scene) => ({
      ...scene,
      layoutMode: "solo",
      canvasLayout: null,
      splitRatio: 0.5,
      pipPosition: { x: 75, y: 75 },
      pipSize: { width: 20, height: 20 },
    }));
  }, [updateActiveScene]);

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
      type: "cross_dissolve",
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
    // Clear active subscene if it belonged to deleted scene
    if (activeSceneId === sceneId) {
      setActiveSceneId(newScenes[0].id);
      setActiveSubsceneId(undefined);
    }
  };

  // Reset a scene back to default state
  const handleResetSceneToDefault = useCallback(
    (sceneId: string) => {
      setScenes((prev) =>
        prev.map((scene) => {
          if (scene.id !== sceneId) return scene;

          const defaultScene = createDefaultScene(scene.name);
          return {
            ...defaultScene,
            id: scene.id, // Keep the original ID
            name: scene.name, // Keep the original name
            subscenes: undefined, // Clear all subscenes
            isExpanded: false,
          };
        })
      );
      // Clear active subscene if resetting active scene
      if (activeSceneId === sceneId) {
        setActiveSubsceneId(undefined);
      }
    },
    [activeSceneId]
  );

  const handleSceneReorder = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    setScenes((prev) => {
      const newScenes = [...prev];
      const [moved] = newScenes.splice(fromIndex, 1);
      newScenes.splice(toIndex, 0, moved);
      return newScenes;
    });
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

  // --- Subscene Management ---
  const [activeSubsceneId, setActiveSubsceneId] = useState<string | undefined>(
    undefined
  );

  // Compute effective scene that merges subscene canvas preset when subscene is active
  const effectiveScene = useMemo(() => {
    const scene = scenes.find((s) => s.id === activeSceneId);
    if (!scene) return scene!;

    // If no active subscene, return scene as-is
    if (!activeSubsceneId) return scene;

    // Find the active subscene
    const subscene = scene.subscenes?.find((s) => s.id === activeSubsceneId);
    if (!subscene || !subscene.canvasPreset) return scene;

    const preset = subscene.canvasPreset;

    // Apply full canvas preset to scene
    return {
      ...scene,
      blankCanvasColor: preset.blankCanvasColor,
      backgroundEffect: preset.backgroundEffect,
      backgroundImageUrl: preset.backgroundImageUrl ?? scene.backgroundImageUrl,
      layoutMode: preset.layoutMode,
      cameraShape: preset.cameraShape,
      pipPosition: preset.pipPosition,
      pipSize: preset.pipSize,
      pipBorder: preset.pipBorder ?? scene.pipBorder,
      pipShadow: preset.pipShadow ?? scene.pipShadow,
      videoFilter: preset.videoFilter,
      textOverlays: preset.textOverlays,
      canvasAspectRatio: preset.canvasAspectRatio ?? scene.canvasAspectRatio,
      isBeautifyEnabled: preset.isBeautifyEnabled ?? scene.isBeautifyEnabled,
      isNeonEdgeEnabled: preset.isNeonEdgeEnabled ?? scene.isNeonEdgeEnabled,
      neonColor: preset.neonColor ?? scene.neonColor,
      neonIntensity: preset.neonIntensity ?? scene.neonIntensity,
    };
  }, [scenes, activeSceneId, activeSubsceneId]);

  const handleAddSubscene = useCallback((parentId: string) => {
    setScenes((prev) => {
      return prev.map((scene) => {
        if (scene.id !== parentId) return scene;

        const currentSubscenes = scene.subscenes || [];
        const newSubscene: SubSceneState = {
          id: generateSubsceneId(),
          name: `Sub ${currentSubscenes.length + 1}`,
          parentId,
          order: currentSubscenes.length,
        };

        return {
          ...scene,
          subscenes: [...currentSubscenes, newSubscene],
          isExpanded: true,
        };
      });
    });
  }, []);

  const handleSubsceneClose = useCallback(
    (parentId: string, subsceneId: string) => {
      setScenes((prev) => {
        return prev.map((scene) => {
          if (scene.id !== parentId || !scene.subscenes) return scene;

          const newSubscenes = scene.subscenes
            .filter((s) => s.id !== subsceneId)
            .map((s, idx) => ({ ...s, order: idx }));

          return {
            ...scene,
            subscenes: newSubscenes,
            activeSubsceneId:
              scene.activeSubsceneId === subsceneId
                ? undefined
                : scene.activeSubsceneId,
          };
        });
      });

      if (activeSubsceneId === subsceneId) {
        setActiveSubsceneId(undefined);
      }
    },
    [activeSubsceneId]
  );

  const handleSubsceneReorder = useCallback(
    (parentId: string, fromIndex: number, toIndex: number) => {
      if (fromIndex === toIndex) return;

      setScenes((prev) => {
        return prev.map((scene) => {
          if (scene.id !== parentId || !scene.subscenes) return scene;

          const newSubscenes = [...scene.subscenes].sort(
            (a, b) => a.order - b.order
          );
          const [moved] = newSubscenes.splice(fromIndex, 1);
          newSubscenes.splice(toIndex, 0, moved);

          return {
            ...scene,
            subscenes: newSubscenes.map((s, idx) => ({ ...s, order: idx })),
          };
        });
      });
    },
    []
  );

  const handleSubsceneRename = useCallback(
    (parentId: string, subsceneId: string, newName: string) => {
      setScenes((prev) => {
        return prev.map((scene) => {
          if (scene.id !== parentId || !scene.subscenes) return scene;

          return {
            ...scene,
            subscenes: scene.subscenes.map((s) =>
              s.id === subsceneId ? { ...s, name: newName } : s
            ),
          };
        });
      });
    },
    []
  );

  const handleToggleExpand = useCallback((sceneId: string) => {
    setScenes((prev) => {
      return prev.map((scene) => {
        if (scene.id !== sceneId) return scene;
        return { ...scene, isExpanded: !(scene.isExpanded ?? true) };
      });
    });
  }, []);

  const handleDuplicateScene = useCallback(
    (sceneId: string) => {
      const sceneToDuplicate = scenes.find((s) => s.id === sceneId);
      if (!sceneToDuplicate) return;

      const newScene: SceneState = {
        ...sceneToDuplicate,
        id: generateSceneId(),
        name: `${sceneToDuplicate.name} (Copy)`,
        subscenes: sceneToDuplicate.subscenes?.map((sub) => ({
          ...sub,
          id: generateSubsceneId(),
          parentId: "", // Will be updated
        })),
      };

      // Update parent IDs for subscenes
      if (newScene.subscenes) {
        newScene.subscenes = newScene.subscenes.map((sub) => ({
          ...sub,
          parentId: newScene.id,
        }));
      }

      const sceneIndex = scenes.findIndex((s) => s.id === sceneId);
      setScenes((prev) => {
        const newScenes = [...prev];
        newScenes.splice(sceneIndex + 1, 0, newScene);
        return newScenes;
      });

      // Add transition from original to duplicate
      const newTransition: SceneTransition = {
        id: generateTransitionId(),
        fromSceneId: sceneId,
        toSceneId: newScene.id,
        type: "cross_dissolve",
        durationMs: 300,
        animationIn: "ease-in-out",
        animationOut: "ease-in-out",
        overlayEnabled: false,
      };
      setSceneTransitions((prev) => [...prev, newTransition]);
    },
    [scenes]
  );

  const handleSceneSelectWithSubscene = useCallback(
    (sceneId: string, subsceneId?: string) => {
      if (sceneId === activeSceneId && subsceneId === activeSubsceneId) return;

      // If just changing subscene within same scene
      if (sceneId === activeSceneId && subsceneId !== activeSubsceneId) {
        setActiveSubsceneId(subsceneId);
        return;
      }

      // Otherwise do full scene transition
      handleSceneSelect(sceneId);
      setActiveSubsceneId(subsceneId);
    },
    [activeSceneId, activeSubsceneId, handleSceneSelect]
  );

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

  // --- Create subscenes from Stream Style Preset using generateAllSceneDesigns ---
  const createScenesFromStreamStyle = useCallback(
    (preset: StreamStylePreset) => {
      // Generate unique designs for this theme
      const generatedDesigns = generateAllSceneDesigns(preset.theme, preset.id);

      const newSubscenes: SubSceneState[] = [];

      // Create a subscene for each generated design
      generatedDesigns.forEach(
        (design: GeneratedSceneDesign, index: number) => {
          const subsceneId = generateSubsceneId();

          // Convert GeneratedSceneDesign text overlays to TextOverlayState
          const textOverlays: TextOverlayState[] = design.textOverlays.map(
            (overlay, i) => ({
              id: `${subsceneId}-text-${i}-${Date.now()}`,
              content: overlay.content,
              style: {
                fontFamily: overlay.style.fontFamily,
                fontSize: overlay.style.fontSize,
                color: overlay.style.color,
                backgroundColor: overlay.style.backgroundColor || "transparent",
                position: overlay.style.position,
                shape: overlay.style.shape || ("rounded" as CaptionShape),
                animation:
                  overlay.style.animation || ("fade" as CaptionAnimation),
                outline: overlay.style.outline ?? false,
                shadow: overlay.style.shadow ?? true,
                bold: overlay.style.bold ?? false,
                italic: overlay.style.italic ?? false,
                underline: overlay.style.underline ?? false,
                textShadow: overlay.style.textShadow,
                rotation: overlay.style.rotation || 0,
                border: overlay.style.border ?? false,
                borderColor: overlay.style.borderColor || "#FFFFFF",
                borderWidth: overlay.style.borderWidth ?? 0,
                letterSpacing: overlay.style.letterSpacing,
                padding: overlay.style.padding,
                textAlign: overlay.style.textAlign,
              },
              layout: {
                position: overlay.layout.position,
                size: overlay.layout.size,
                zIndex: overlay.layout.zIndex,
                rotation: overlay.layout.rotation,
              },
            })
          );

          const newSubscene: SubSceneState = {
            id: subsceneId,
            name: design.name,
            parentId: activeSceneId,
            order: index,
            canvasPreset: {
              id: design.id,
              name: design.name,
              blankCanvasColor: design.blankCanvasColor,
              backgroundEffect: design.backgroundEffect,
              backgroundImageUrl: design.backgroundGradient, // Use gradient as background
              // Map layoutMode to valid caption LayoutMode type
              layoutMode:
                design.layoutMode === "corner-floating" ||
                design.layoutMode === "diagonal-split" ||
                design.layoutMode === "grid-3x3" ||
                design.layoutMode === "overlay-full"
                  ? ("pip" as LayoutMode)
                  : (design.layoutMode as LayoutMode),
              cameraShape: design.cameraShape as CameraShape,
              pipPosition: design.pipPosition,
              pipSize: design.pipSize,
              pipBorder: design.pipBorder,
              // Convert pipShadow string to object format if needed
              pipShadow: design.pipShadow
                ? { blur: 20, color: design.pipShadow }
                : undefined,
              videoFilter: design.videoFilter,
              textOverlays,
              canvasAspectRatio: design.canvasAspectRatio,
            },
          };

          newSubscenes.push(newSubscene);
        }
      );

      // Add subscenes to the active scene
      setScenes((prev) =>
        prev.map((scene) => {
          if (scene.id !== activeSceneId) return scene;

          const existingSubscenes = scene.subscenes || [];
          return {
            ...scene,
            subscenes: [...existingSubscenes, ...newSubscenes],
            isExpanded: true,
          };
        })
      );

      // Select the first new subscene
      if (newSubscenes.length > 0) {
        setActiveSubsceneId(newSubscenes[0].id);
      }

      return newSubscenes;
    },
    [activeSceneId]
  );

  return {
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
    handleSceneSelect: handleSceneSelectWithSubscene,
    handleSceneClose,
    handleSceneReorder,
    handleSceneRename,
    handleTransitionChange,
    handleSequenceTransition,
    // Subscene management
    handleAddSubscene,
    handleSubsceneClose,
    handleSubsceneReorder,
    handleSubsceneRename,
    handleToggleExpand,
    handleDuplicateScene,
    handleResetSceneToDefault,
    // Stream Style
    createScenesFromStreamStyle,
    // Undo/Redo/Reset
    undo,
    redo,
    resetScene,
    resetLayout,
    canUndo: (history[activeSceneId]?.past.length || 0) > 0,
    canRedo: (history[activeSceneId]?.future.length || 0) > 0,
  };
};
