// src/pages/index/hooks/useSceneManager.ts
import { useState, useCallback, useMemo } from "react";
import {
  SceneState,
  SceneTransition,
  SubSceneState,
  CaptionStyle,
  DEFAULT_LAYOUT_STATE,
  DEFAULT_CAMERA_STATE,
  CanvasLayoutState,
} from "@/types/caption";
import { zIndex } from "@/lib/zIndex";
import { StreamStylePreset, DEFAULT_STREAM_SCENES } from "@/types/streamStyle";

const generateSceneId = () => `scene-${Date.now()}`;
const generateSubsceneId = () => `subscene-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
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
    if (activeSceneId === sceneId) {
      setActiveSceneId(newScenes[0].id);
    }
  };

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
  const [activeSubsceneId, setActiveSubsceneId] = useState<string | undefined>(undefined);

  // Compute effective scene that merges subscene settings when subscene is active
  const effectiveScene = useMemo(() => {
    const scene = scenes.find((s) => s.id === activeSceneId);
    if (!scene) return scene!;
    
    // If no active subscene, return scene as-is
    if (!activeSubsceneId) return scene;
    
    // Find the active subscene
    const subscene = scene.subscenes?.find(s => s.id === activeSubsceneId);
    if (!subscene) return scene;
    
    // Merge subscene settings into scene (subscene overrides take precedence)
    return {
      ...scene,
      blankCanvasColor: subscene.blankCanvasColor ?? scene.blankCanvasColor,
      backgroundEffect: subscene.backgroundEffect ?? scene.backgroundEffect,
      backgroundImageUrl: subscene.backgroundImageUrl ?? scene.backgroundImageUrl,
      layoutMode: subscene.layoutMode ?? scene.layoutMode,
      cameraShape: subscene.cameraShape ?? scene.cameraShape,
      pipPosition: subscene.pipPosition ?? scene.pipPosition,
      pipSize: subscene.pipSize ?? scene.pipSize,
      pipBorder: subscene.pipBorder ?? scene.pipBorder,
      pipShadow: subscene.pipShadow ?? scene.pipShadow,
      videoFilter: subscene.videoFilter ?? scene.videoFilter,
      textOverlays: subscene.textOverlays ?? scene.textOverlays,
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

  const handleSubsceneClose = useCallback((parentId: string, subsceneId: string) => {
    setScenes((prev) => {
      return prev.map((scene) => {
        if (scene.id !== parentId || !scene.subscenes) return scene;
        
        const newSubscenes = scene.subscenes
          .filter((s) => s.id !== subsceneId)
          .map((s, idx) => ({ ...s, order: idx }));
        
        return {
          ...scene,
          subscenes: newSubscenes,
          activeSubsceneId: scene.activeSubsceneId === subsceneId 
            ? undefined 
            : scene.activeSubsceneId,
        };
      });
    });
    
    if (activeSubsceneId === subsceneId) {
      setActiveSubsceneId(undefined);
    }
  }, [activeSubsceneId]);

  const handleSubsceneReorder = useCallback((parentId: string, fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;
    
    setScenes((prev) => {
      return prev.map((scene) => {
        if (scene.id !== parentId || !scene.subscenes) return scene;
        
        const newSubscenes = [...scene.subscenes].sort((a, b) => a.order - b.order);
        const [moved] = newSubscenes.splice(fromIndex, 1);
        newSubscenes.splice(toIndex, 0, moved);
        
        return {
          ...scene,
          subscenes: newSubscenes.map((s, idx) => ({ ...s, order: idx })),
        };
      });
    });
  }, []);

  const handleSubsceneRename = useCallback((parentId: string, subsceneId: string, newName: string) => {
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
  }, []);

  const handleToggleExpand = useCallback((sceneId: string) => {
    setScenes((prev) => {
      return prev.map((scene) => {
        if (scene.id !== sceneId) return scene;
        return { ...scene, isExpanded: !(scene.isExpanded ?? true) };
      });
    });
  }, []);

  const handleDuplicateScene = useCallback((sceneId: string) => {
    const sceneToDuplicate = scenes.find((s) => s.id === sceneId);
    if (!sceneToDuplicate) return;

    const newScene: SceneState = {
      ...sceneToDuplicate,
      id: generateSceneId(),
      name: `${sceneToDuplicate.name} (Copy)`,
      subscenes: sceneToDuplicate.subscenes?.map((sub) => ({
        ...sub,
        id: generateSubsceneId(),
        parentId: '', // Will be updated
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
  }, [scenes]);

  const handleSceneSelectWithSubscene = useCallback((sceneId: string, subsceneId?: string) => {
    if (sceneId === activeSceneId && subsceneId === activeSubsceneId) return;
    
    // If just changing subscene within same scene
    if (sceneId === activeSceneId && subsceneId !== activeSubsceneId) {
      setActiveSubsceneId(subsceneId);
      return;
    }
    
    // Otherwise do full scene transition
    handleSceneSelect(sceneId);
    setActiveSubsceneId(subsceneId);
  }, [activeSceneId, activeSubsceneId, handleSceneSelect]);

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

  // --- Create subscenes from Stream Style Preset in the active scene ---
  const createScenesFromStreamStyle = useCallback((preset: StreamStylePreset, canvasPresets: any[]) => {
    // Get a selection of canvas presets to use for the subscenes
    // We'll pick presets that match the theme category or use first available ones
    const categoryPresets = canvasPresets.filter(p => 
      p.styleTags?.includes(preset.theme.category) || 
      p.styleTags?.includes('minimal') ||
      p.styleTags?.includes('modern')
    );
    const presetsToUse = categoryPresets.length >= 6 ? categoryPresets : canvasPresets;
    
    const newSubscenes: SubSceneState[] = [];
    
    // Create a subscene for each stream scene type
    DEFAULT_STREAM_SCENES.forEach((sceneConfig, index) => {
      const subsceneId = generateSubsceneId();
      const canvasPreset = presetsToUse[index % presetsToUse.length];
      
      const newSubscene: SubSceneState = {
        id: subsceneId,
        name: sceneConfig.name,
        parentId: activeSceneId,
        order: index,
        presetId: canvasPreset?.id,
        blankCanvasColor: canvasPreset?.background?.blankCanvasColor || preset.theme.colors.background,
        backgroundEffect: canvasPreset?.background?.backgroundEffect || 'none',
        layoutMode: canvasPreset?.pip?.layoutMode || (sceneConfig.hasCamera ? 'pip' : 'solo'),
        cameraShape: canvasPreset?.pip?.cameraShape || 'rectangle',
        pipPosition: sceneConfig.cameraPosition || canvasPreset?.pip?.pipPosition || { x: 75, y: 75 },
        pipSize: sceneConfig.cameraSize || canvasPreset?.pip?.pipSize || { width: 25, height: 30 },
        pipBorder: canvasPreset?.pip?.pipBorder || { color: preset.theme.colors.primary, width: 3 },
        pipShadow: canvasPreset?.pip?.pipShadow,
        videoFilter: canvasPreset?.effects?.videoFilter || 'none',
        textOverlays: canvasPreset?.textOverlays?.map((overlay: any, i: number) => ({
          id: `${subsceneId}-text-${i}`,
          content: i === 0 ? sceneConfig.defaultText : (sceneConfig.subText || overlay.content),
          style: {
            ...overlay.style,
            fontFamily: preset.theme.fonts.heading,
          },
          layout: overlay.layout,
        })) || [],
      };
      
      newSubscenes.push(newSubscene);
    });
    
    // Add subscenes to the active scene
    setScenes(prev => prev.map(scene => {
      if (scene.id !== activeSceneId) return scene;
      
      const existingSubscenes = scene.subscenes || [];
      return {
        ...scene,
        subscenes: [...existingSubscenes, ...newSubscenes],
        isExpanded: true,
      };
    }));
    
    // Select the first new subscene
    if (newSubscenes.length > 0) {
      setActiveSubsceneId(newSubscenes[0].id);
    }
    
    return newSubscenes;
  }, [activeSceneId]);

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
