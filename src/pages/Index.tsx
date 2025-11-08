// src/pages/Index.tsx

import {
  useState,
  useCallback,
  useRef,
  useEffect,
  useMemo,
  memo,
  ChangeEvent,
} from "react"; // ADDED ChangeEvent
import { FloatingLogo } from "@/components/FloatingLogo";
import { useNavigate } from "react-router-dom";
import { VideoCanvas } from "@/components/VideoCanvas";
// --- DELETED: FloatingLogo ---
import { FloatingControlsPanel } from "@/components/FloatingControlsPanel";
import { CanvasPreset } from "@/types/canvasPreset";
// --- DELETED: InstructionsDialog (now in BottomNav) ---
import { DraggableTextOverlay } from "@/components/DraggableTextOverlay";
// --- DELETED: Unused icons ---
import { ExcalidrawOverlay } from "@/components/ExcalidrawOverlay";
// ExcalidrawElement type removed - using any for excalidraw data
import { Pencil } from "lucide-react";
import { zIndex } from "@/lib/zIndex";
import {
  CaptionStyle,
  GeneratedOverlay,
  LayoutMode,
  CameraShape,
  GeneratedLayout,
  TextOverlayState,
  FileOverlayState,
  FileType,
  SceneState,
  SceneTransition,
  TransitionType,
  TransitionEasing,
  DEFAULT_LAYOUT_STATE,
  CaptionShape as CaptionShapeType,
  CaptionAnimation as CaptionAnimationType,
} from "@/types/caption";
import { processCommandWithAgent, updateOverlay } from "@/lib/ai";
import { toast } from "sonner";
import { useLog } from "@/context/LogContext";
import { useDebug } from "@/context/DebugContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useRecordingSession } from "@/hooks/useRecordingSession";
import { useCompositeStream } from "@/hooks/useCompositeStream";
import {
  DraggableBrowser,
  BrowserOverlayState,
} from "@/components/DraggableBrowser";
import { SavedSessionsPanel } from "@/components/SavedSessionsPanel";
import { RecordingSession } from "@/types/editor";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
// --- DELETED: Button (no longer used here) ---
// --- DELETED: FloatingAssetSearch (now in BottomNav) ---
import { AssetResult } from "@/components/AssetLibrary";
import { SceneTabs } from "@/components/SceneTabs";
import { TransitionPopover } from "@/components/TransitionPopover";
// --- ADDED: Import new BottomNavigation ---
import { BottomNavigation } from "@/components/BottomNavigation";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const generateTextOverlayId = () =>
  `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateOverlayId = () =>
  `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateFileId = () => `file-${Date.now()}`;
const generateBrowserId = () => `browser-${Date.now()}`;
const generateSceneId = () => `scene-${Date.now()}`;
const generateTransitionId = () => `trans-${Date.now()}`;

const DEFAULT_CAPTION_STYLE: CaptionStyle = {
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

const createDefaultScene = (name: string): SceneState => ({
  id: generateSceneId(),
  name,
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
});

const MemoizedVideoCanvas = memo(VideoCanvas);
const Index = () => {
  const navigate = useNavigate();

  const recording = useRecordingSession();
  const { log } = useLog();
  const { setDebugInfo } = useDebug();

  // --- SCENE STATE ---
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

  // --- UI & WINDOW STATE ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  // --- MODIFIED: This is no longer used by TopToolbar ---
  const [isSceneTabsHidden, setIsSceneTabsHidden] = useState(false);
  const [isFsSidebarOpen, setIsFsSidebarOpen] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(true);
  const [showSessionsPanel, setShowSessionsPanel] = useState(false);
  const [showFloatingPanel, setShowFloatingPanel] = useState(false);
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(
    null
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<
    readonly any[]
  >([]);
  const hasAiPopoverAutoOpenedRef = useRef(false);
  const [allSessions, setAllSessions] = useLocalStorage<RecordingSession[]>(
    "gaki-recorded-sessions",
    []
  );
  const [savedOverlays, setSavedOverlays] = useLocalStorage<GeneratedOverlay[]>(
    "gaki-saved-overlays",
    []
  );

  const mouseTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Virtual camera: Enable composite stream for broadcasting
  // This captures the final composed canvas output for streaming to viewers
  const [isVirtualCameraEnabled, setIsVirtualCameraEnabled] = useState(false);
  const { compositeStream, isReady: isCompositeReady } = useCompositeStream({
    canvasRef,
    isEnabled: isVirtualCameraEnabled,
    frameRate: 30,
  });

  // Notify when composite stream is ready
  useEffect(() => {
    if (isCompositeReady && compositeStream) {
      toast.success(
        "🎥 Broadcasting Active! Your composite scene is live.",
        {
          description: "Virtual camera stream is ready for OBS/streaming platforms",
          duration: 5000,
        }
      );
      console.log('[GAKI Virtual Camera] Composite stream ready:', {
        streamId: compositeStream.id,
        tracks: compositeStream.getTracks().map(t => ({
          kind: t.kind,
          label: t.label,
          enabled: t.enabled,
        })),
      });
    } else if (!isVirtualCameraEnabled && !isCompositeReady) {
      console.log('[GAKI Virtual Camera] Broadcasting stopped');
    }
  }, [isCompositeReady, compositeStream, isVirtualCameraEnabled]);

  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);

  const [dynamicLayout, setDynamicLayout] = useState<{
    isActive: boolean;
    mode: "split-vertical" | "split-horizontal" | "pip";
    target: {
      id: string;
      type: string;
      content: any;
      layout: GeneratedLayout;
    } | null;
  }>({
    isActive: false,
    mode: "split-vertical",
    target: null,
  });

  // --- SCENE MANAGEMENT ---

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
    handleSceneSelect(newScene.id);
  };

  const handleSceneSelect = (sceneId: string) => {
    if (sceneId === activeSceneId || isTransitioning) {
      console.log("[Transition] Blocked:", { activeSceneId, isTransitioning });
      return;
    }
    setIsDrawing(false);
    handleDeselectAll();
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

    console.log("[Transition] Starting:", {
      from: oldScene.name,
      to: newScene.name,
      type: effectiveTransition.type,
      duration: effectiveTransition.durationMs,
    });

    setPreviousScene(oldScene);
    setActiveTransition(effectiveTransition);
    setIsTransitioning(true);
    setActiveSceneId(newScene.id);
    handleDeselectAll();

    setTimeout(() => {
      console.log("[Transition] Complete");
      setIsTransitioning(false);
      setPreviousScene(null);
      setActiveTransition(null);
    }, effectiveTransition.durationMs);
  };

  const handleTransitionClick = (transition: SceneTransition) => {
    const popoverTransition =
      sceneTransitions.find((t) => t.id === transition.id) || null;
    setActiveTransition(popoverTransition);
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

  const handleSceneClose = (sceneId: string) => {
    if (scenes.length <= 1) {
      toast.error("Cannot delete the last scene");
      return;
    }

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

  // --- STABLE PROPERTY UPDATER ---
  const updateSceneProperty = useCallback(
    <K extends keyof SceneState>(key: K, value: SceneState[K]) => {
      updateActiveScene((scene) => {
        const updatedScene = { ...scene, [key]: value };
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

  // --- ALL STABLE HANDLERS DEFINED AT TOP LEVEL ---
  const handleSetIsAudioOn = useCallback(
    (value: boolean) => {
      updateActiveScene((scene) => {
        return { ...scene, isAudioOn: value };
      });
    },
    [updateActiveScene]
  );

  const handleSetIsVideoOn = useCallback(
    (value: boolean) => updateSceneProperty("isVideoOn", value),
    [updateSceneProperty]
  );
  // --- MODIFIED: Need to get devices for BottomNav ---
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
        setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
      } catch (err) {
        console.warn("Could not enumerate devices:", err);
      }
    };
    getDevices();
  }, []);
  // --- END MODIFICATION ---

  const handleSetSelectedVideoDevice = useCallback(
    (value: string | undefined) =>
      updateSceneProperty("selectedVideoDevice", value),
    [updateSceneProperty]
  );
  const handleSetSelectedAudioDevice = useCallback(
    (value: string | undefined) =>
      updateSceneProperty("selectedAudioDevice", value),
    [updateSceneProperty]
  );
  const handleSetCaptionStyle = useCallback(
    (value: CaptionStyle) => {
      updateSceneProperty("captionStyle", value);
      if (recording.isRecording) {
        recording.recordCaptionStyle(value);
      }
    },
    [updateSceneProperty, recording]
  );
  const handleSetDynamicStyle = useCallback(
    (value: string) => updateSceneProperty("dynamicStyle", value),
    [updateSceneProperty]
  );
  const handleSetCaptionsEnabled = useCallback(
    (value: boolean) => updateSceneProperty("captionsEnabled", value),
    [updateSceneProperty]
  );
  const handleSetAiButtonPosition = useCallback(
    (value: { x: number; y: number }) =>
      updateSceneProperty("aiButtonPosition", value),
    [updateSceneProperty]
  );
  const handleSetScreenShareMode = useCallback(
    (value: "off" | "screen" | "canvas") => {
      updateActiveScene((scene) => {
        const newLayoutMode = value !== "off" ? "pip" : "solo";
        return { ...scene, screenShareMode: value, layoutMode: newLayoutMode };
      });
    },
    [updateActiveScene]
  );
  const handleSetIsAiModeEnabled = useCallback(
    (value: boolean) => updateSceneProperty("isAiModeEnabled", value),
    [updateSceneProperty]
  );
  const handleSetLayoutMode = useCallback(
    (value: LayoutMode) => {
      updateSceneProperty("layoutMode", value);
      if (recording.isRecording) {
        // This assumes you refactor updateSceneProperty to return the updated scene
        // or you read from activeScene. A better pattern is needed,
        // but for the fix, let's assume we can access the new layout state.
        // This is complex due to the monolithic state.
        // A simpler fix is to just record the value that changed.
        recording.recordLayoutChange({
          mode: value,
          cameraShape: activeScene.cameraShape,
          splitRatio: activeScene.splitRatio,
          pipPosition: activeScene.pipPosition,
          pipSize: activeScene.pipSize,
        });
      }
    },
    [updateSceneProperty, recording, activeScene]
  );
  const handleSetCameraShape = useCallback(
    (value: CameraShape) => {
      updateSceneProperty("cameraShape", value);
      if (recording.isRecording) {
        recording.recordLayoutChange({
          mode: activeScene.layoutMode,
          cameraShape: value,
          splitRatio: activeScene.splitRatio,
          pipPosition: activeScene.pipPosition,
          pipSize: activeScene.pipSize,
        });
      }
    },
    [updateSceneProperty, recording, activeScene]
  );
  const handleSetSplitRatio = useCallback(
    (value: number) => updateSceneProperty("splitRatio", value),
    [updateSceneProperty]
  );
  const handleSetPipPosition = useCallback(
    (value: { x: number; y: number }) =>
      updateSceneProperty("pipPosition", value),
    [updateSceneProperty]
  );
  const handleSetPipSize = useCallback(
    (value: { width: number; height: number }) =>
      updateSceneProperty("pipSize", value),
    [updateSceneProperty]
  );
  const handleSetCustomMaskUrl = useCallback(
    (value: string | undefined) => updateSceneProperty("customMaskUrl", value),
    [updateSceneProperty]
  );
  const handleSetBlankCanvasColor = useCallback(
    (value: string) => updateSceneProperty("blankCanvasColor", value),
    [updateSceneProperty]
  );
  const handleSetVideoFilter = useCallback(
    (value: string) => updateSceneProperty("videoFilter", value),
    [updateSceneProperty]
  );
  const handleSetBackgroundEffect = useCallback(
    (value: "none" | "blur" | "image") =>
      updateSceneProperty("backgroundEffect", value),
    [updateSceneProperty]
  );
  const handleSetBackgroundImageUrl = useCallback(
    (value: string | null) => updateSceneProperty("backgroundImageUrl", value),
    [updateSceneProperty]
  );
  const handleSetIsAutoFramingEnabled = useCallback(
    (value: boolean) => updateSceneProperty("isAutoFramingEnabled", value),
    [updateSceneProperty]
  );
  const handleSetZoomSensitivity = useCallback(
    (value: number) => updateSceneProperty("zoomSensitivity", value),
    [updateSceneProperty]
  );
  const handleSetTrackingSpeed = useCallback(
    (value: number) => updateSceneProperty("trackingSpeed", value),
    [updateSceneProperty]
  );
  const handleSetIsBeautifyEnabled = useCallback(
    (value: boolean) => updateSceneProperty("isBeautifyEnabled", value),
    [updateSceneProperty]
  );
  const handleSetIsLowLightEnabled = useCallback(
    (value: boolean) => updateSceneProperty("isLowLightEnabled", value),
    [updateSceneProperty]
  );
  const handleSetIsNeonEdgeEnabled = useCallback(
    (value: boolean) => updateSceneProperty("isNeonEdgeEnabled", value),
    [updateSceneProperty]
  );
  const handleSetNeonIntensity = useCallback(
    (value: number) => updateSceneProperty("neonIntensity", value),
    [updateSceneProperty]
  );
  const handleSetNeonColor = useCallback(
    (value: string) => updateSceneProperty("neonColor", value),
    [updateSceneProperty]
  );
  
  // Camera controls
  const handleSetCameraBackground = useCallback(
    (value: "none" | "blur" | "image") => updateSceneProperty("cameraBackground", value),
    [updateSceneProperty]
  );
  
  const handleCustomBackgroundUpload = useCallback(
    (file: File) => {
      const url = URL.createObjectURL(file);
      updateActiveScene((scene) => ({
        ...scene,
        cameraBackground: "image",
        customBackgroundUrl: url,
      }));
      toast.success("Custom background uploaded");
    },
    [updateActiveScene]
  );
  
  const handleSetCameraAspectRatio = useCallback(
    (value: string) => updateSceneProperty("cameraAspectRatio", value),
    [updateSceneProperty]
  );
  
  const handleSetCanvasAspectRatio = useCallback(
    (value: string) => updateSceneProperty("canvasAspectRatio", value),
    [updateSceneProperty]
  );
  
  const handleSetCustomAspectRatio = useCallback(
    (value: string) => updateSceneProperty("customAspectRatio", value),
    [updateSceneProperty]
  );
  
  const handleSetIsFaceTrackingEnabled = useCallback(
    (value: boolean) => {
      updateSceneProperty("isFaceTrackingEnabled", value);
      if (value) {
        toast.success("Face tracking enabled - AI will follow your face");
      }
    },
    [updateSceneProperty]
  );

  // --- HANDLERS ---
  // --- MOVED FUNCTION UP ---
  // This function must be defined *before* it is used in the useMemo hooks below.
  const getAllPropsForScene = (scene: SceneState) => {
    return {
      sceneId: scene.id,
      isAudioOn: scene.isAudioOn,
      onAudioToggle: handleSetIsAudioOn,
      isVideoOn: scene.isVideoOn,
      onVideoToggle: handleSetIsVideoOn,
      selectedVideoDevice: scene.selectedVideoDevice,
      onVideoDeviceSelect: handleSetSelectedVideoDevice,
      selectedAudioDevice: scene.selectedAudioDevice,
      onAudioDeviceSelect: handleSetSelectedAudioDevice,
      isAiModeEnabled: scene.isAiModeEnabled,
      onAiModeToggle: handleSetIsAiModeEnabled,
      aiButtonPosition: scene.aiButtonPosition,
      onAiButtonPositionChange: handleSetAiButtonPosition,
      generatedOverlays: scene.activeOverlays,
      browserOverlays: scene.browserOverlays,
      fileOverlays: scene.fileOverlays,
      textOverlays: scene.textOverlays,
      captionsEnabled: scene.captionsEnabled,
      onCaptionsToggle: handleSetCaptionsEnabled,
      liveCaptionStyle: scene.captionStyle,
      onStyleChange: handleSetCaptionStyle,
      dynamicStyle: scene.dynamicStyle,
      onCaptionLayoutChange: handleCaptionLayoutChange,
      layoutMode: scene.layoutMode,
      cameraShape: scene.cameraShape,
      splitRatio: scene.splitRatio,
      pipPosition: scene.pipPosition,
      pipSize: scene.pipSize,
      onLayoutModeChange: handleSetLayoutMode,
      onCameraShapeChange: handleSetCameraShape,
      onSplitRatioChange: handleSetSplitRatio,
      onPipPositionChange: handleSetPipPosition,
      onPipSizeChange: handleSetPipSize,
      customMaskUrl: scene.customMaskUrl,
      onCustomMaskUpload: handleCustomMaskUpload,
      blankCanvasColor: scene.blankCanvasColor,
      videoFilter: scene.videoFilter,
      backgroundEffect: scene.backgroundEffect,
      backgroundImageUrl: scene.backgroundImageUrl,
      isAutoFramingEnabled: scene.isAutoFramingEnabled,
      zoomSensitivity: scene.zoomSensitivity,
      trackingSpeed: scene.trackingSpeed,
      isBeautifyEnabled: scene.isBeautifyEnabled,
      isLowLightEnabled: scene.isLowLightEnabled,
      isNeonEdgeEnabled: scene.isNeonEdgeEnabled,
      neonIntensity: scene.neonIntensity,
      neonColor: scene.neonColor,
      screenShareMode: scene.screenShareMode,
      onScreenShareModeChange: handleSetScreenShareMode,
      hasAiPopoverAutoOpenedRef: hasAiPopoverAutoOpenedRef,
      // --- MODIFIED: Pass device lists to canvas ---
      audioDevices: audioDevices,
      videoDevices: videoDevices,
      // --- END MODIFICATION ---
      sidebarProps: {
        style: scene.captionStyle,
        dynamicStyle: scene.dynamicStyle,
        blankCanvasColor: scene.blankCanvasColor,
        backgroundEffect: scene.backgroundEffect,
        backgroundImageUrl: scene.backgroundImageUrl,
        isAutoFramingEnabled: scene.isAutoFramingEnabled,
        zoomSensitivity: scene.zoomSensitivity,
        trackingSpeed: scene.trackingSpeed,
        isBeautifyEnabled: scene.isBeautifyEnabled,
        isLowLightEnabled: scene.isLowLightEnabled,
        videoFilter: scene.videoFilter,
        isNeonEdgeEnabled: scene.isNeonEdgeEnabled,
        neonIntensity: scene.neonIntensity,
        neonColor: scene.neonColor,
        onStyleChange: handleSetCaptionStyle,
        onDynamicStyleChange: handleSetDynamicStyle,
        onBlankCanvasColorChange: handleSetBlankCanvasColor,
        onBackgroundEffectChange: handleSetBackgroundEffect,
        onBackgroundImageUrlChange: handleSetBackgroundImageUrl,
        onAutoFramingChange: handleSetIsAutoFramingEnabled,
        onZoomSensitivityChange: handleSetZoomSensitivity,
        onTrackingSpeedChange: handleSetTrackingSpeed,
        onBeautifyToggle: handleSetIsBeautifyEnabled,
        onLowLightToggle: handleSetIsLowLightEnabled,
        onVideoFilterChange: handleSetVideoFilter,
        onNeonEdgeToggle: handleSetIsNeonEdgeEnabled,
        onNeonIntensityChange: handleSetNeonIntensity,
        onNeonColorChange: handleSetNeonColor,
        savedOverlays: savedOverlays,
        onAddSavedOverlay: handleAddSavedOverlay,
        onDeleteSavedOverlay: handleDeleteSavedOverlay,
        cameraBackground: scene.cameraBackground,
        onCameraBackgroundChange: handleSetCameraBackground,
        onCustomBackgroundUpload: handleCustomBackgroundUpload,
        cameraAspectRatio: scene.cameraAspectRatio,
        onCameraAspectRatioChange: handleSetCameraAspectRatio,
        canvasAspectRatio: scene.canvasAspectRatio,
        onCanvasAspectRatioChange: handleSetCanvasAspectRatio,
        customAspectRatio: scene.customAspectRatio,
        onCustomAspectRatioChange: handleSetCustomAspectRatio,
        isFaceTrackingEnabled: scene.isFaceTrackingEnabled,
        onFaceTrackingToggle: handleSetIsFaceTrackingEnabled,
      },
    };
  };
  // --- END MOVED FUNCTION ---

  const handleSetDynamicLayout = (
    target: {
      id: string;
      type: "html" | "file" | "browser" | "caption" | "text";
    },
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => {
    if (!activeScene) return;
    let targetOverlay: any = null;

    if (target.type === "html") {
      targetOverlay = activeScene.activeOverlays.find(
        (o) => o.id === target.id
      );
    } else if (target.type === "file") {
      targetOverlay = activeScene.fileOverlays.find((o) => o.id === target.id);
    } else if (target.type === "browser") {
      targetOverlay = activeScene.browserOverlays.find(
        (o) => o.id === target.id
      );
    } else if (target.type === "caption") {
      targetOverlay = {
        id: "live-caption",
        type: "caption",
        layout: activeScene.captionStyle,
      };
    }
    if (target.type === "text") {
      targetOverlay = activeScene.textOverlays.find((o) => o.id === target.id);
    }
    if (mode === "reset") {
      setDynamicLayout({
        isActive: false,
        mode: "split-vertical",
        target: null,
      });
      return;
    }

    if (!targetOverlay) return;

    setDynamicLayout({
      isActive: true,
      mode: mode,
      target: {
        ...target,
        content: targetOverlay,
        layout: targetOverlay.layout,
      },
    });
  };

  const getFileType = (file: File): FileType => {
    const fileType = file.type;
    const fileName = file.name.toLowerCase();
    if (fileType.startsWith("image/")) return "image";
    if (fileType.startsWith("video/")) return "video";
    if (fileType.startsWith("audio/")) return "audio";
    if (fileType === "application/pdf") return "pdf";
    if (fileType.startsWith("text/")) return "text";
    const textExtensions = [
      ".js",
      ".jsx",
      ".ts",
      ".tsx",
      ".json",
      ".py",
      ".html",
      ".css",
      ".scss",
      ".md",
      ".txt",
      ".csv",
      ".xml",
      ".yaml",
      ".yml",
      ".env",
    ];
    if (textExtensions.some((ext) => fileName.endsWith(ext))) {
      return "text";
    }
    return "unknown";
  };

  const handleAddFile = useCallback(
    (file: File) => {
      if (!file || !activeSceneId) return;
      const newOverlay: FileOverlayState = {
        id: generateFileId(),
        file: file,
        fileName: file.name,
        fileType: getFileType(file),
        fileUrl: URL.createObjectURL(file),
        layout: {
          position: { x: 50, y: 50 },
          size: { width: 35, height: 45 },
          zIndex: zIndex.draggableElement,
          rotation: 0,
        },
      };

      updateActiveScene((scene) => {
        const updatedOverlays = [...scene.fileOverlays, newOverlay];
        if (recording.isRecording) {
          recording.recordFileOverlay(newOverlay);
        }
        return { ...scene, fileOverlays: updatedOverlays };
      });

      toast.info(`Added file: ${file.name}`);
    },
    [activeSceneId, recording, updateActiveScene]
  );

  useEffect(() => {
    const handleDragOver = (e: DragEvent) => e.preventDefault();
    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (isDraggingInternally.current) {
        isDraggingInternally.current = false;
        return;
      }
      if (e.dataTransfer?.files?.length) {
        Array.from(e.dataTransfer.files).forEach(handleAddFile);
      }
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.clipboardData?.files?.length > 0) {
        Array.from(e.clipboardData.files).forEach(handleAddFile);
        return;
      }
      const pastedText = e.clipboardData?.getData("text/plain");
      if (
        pastedText &&
        (pastedText.startsWith("http://") || pastedText.startsWith("https://"))
      ) {
        const newBrowser: BrowserOverlayState = {
          id: generateBrowserId(),
          url: pastedText,
          layout: {
            position: { x: 50, y: 50 },
            size: { width: 40, height: 50 },
            zIndex: zIndex.draggableElement,
            rotation: 0,
          },
        };
        updateActiveScene((scene) => {
          const updatedOverlays = [...scene.browserOverlays, newBrowser];
          if (recording.isRecording) {
            recording.recordBrowserOverlay(newBrowser);
          }
          return { ...scene, browserOverlays: updatedOverlays };
        });
        toast.info("Browser window added from URL.");
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);
    window.addEventListener("paste", handlePaste);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
      window.removeEventListener("paste", handlePaste);
      scenes.forEach((scene) => {
        scene.fileOverlays.forEach((o) => URL.revokeObjectURL(o.fileUrl));
      });
    };
  }, [handleAddFile, scenes, updateActiveScene, recording]);

  const isDraggingInternally = useRef(false);
  const handleInternalDragStart = () => {
    isDraggingInternally.current = true;
  };
  const handleInternalDragStop = () => {
    isDraggingInternally.current = false;
  };
  const handleRemoveFile = (id: string) => {
    updateActiveScene((scene) => {
      const overlayToRemove = scene.fileOverlays.find((o) => o.id === id);
      if (overlayToRemove) {
        URL.revokeObjectURL(overlayToRemove.fileUrl);
      }
      return {
        ...scene,
        fileOverlays: scene.fileOverlays.filter((o) => o.id !== id),
      };
    });
  };

  const handleFileLayoutChange = (
    id: string,
    layout: Partial<FileOverlayState["layout"]>
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      fileOverlays: scene.fileOverlays.map((o) => {
        if (o.id === id) {
          const updatedOverlay = { ...o, layout: { ...o.layout, ...layout } };
          if (recording.isRecording)
            recording.recordFileOverlay(updatedOverlay);
          return updatedOverlay;
        }
        return o;
      }),
    }));
  };

  const handleAddTextOverlay = () => {
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

    updateActiveScene((scene) => {
      const updatedOverlays = [...scene.textOverlays, newTextOverlay];
      return { ...scene, textOverlays: updatedOverlays };
    });

    handleDeselectAll();
    setSelectedTextId(newTextOverlay.id);
    toast.info("Text element added. Click to edit!");
  };

  const handleRemoveTextOverlay = (id: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.filter((o) => o.id !== id),
    }));
    if (selectedTextId === id) setSelectedTextId(null);
  };

  const handleTextLayoutChange = (
    id: string,
    layout: Partial<TextOverlayState["layout"]>
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.map((o) => {
        if (o.id === id) {
          return { ...o, layout: { ...o.layout, ...layout } };
        }
        return o;
      }),
    }));
  };

  const handleTextStyleChange = (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.map((o) => {
        if (o.id === id) {
          return { ...o, style: { ...o.style, ...style } };
        }
        return o;
      }),
    }));
  };

  const handleTextContentChange = (id: string, content: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.map((o) => {
        if (o.id === id) {
          return { ...o, content };
        }
        return o;
      }),
    }));
  };

  const handleDeselectAll = () => {
    setSelectedBrowserId(null);
    setSelectedFileId(null);
    setSelectedTextId(null);
  };

  const handleAssetSelect = async (asset: AssetResult) => {
    try {
      const response = await fetch(asset.downloadUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch asset: ${response.statusText}`);
      }
      const blob = await response.blob();
      const file = new File([blob], asset.fileName, { type: asset.type });
      handleAddFile(file);
    } catch (error) {
      console.error("Failed to add asset:", error);
      toast.error(`Failed to add asset: ${(error as Error).message}`);
    }
  };

  const handleCaptionLayoutChange = useCallback(
    (newLayout: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    }) => {
      const updatedStyle = {
        ...activeScene.captionStyle,
        position: newLayout.position ?? activeScene.captionStyle.position,
        width: newLayout.size?.width ?? activeScene.captionStyle.width,
      };
      handleSetCaptionStyle(updatedStyle);
      if (recording.isRecording) recording.recordCaptionStyle(updatedStyle);
    },
    [recording, handleSetCaptionStyle, activeScene.captionStyle]
  );

  const processTranscript = useCallback(
    async (transcript: string, targetId: string | null = null) => {
      if (!activeScene.isAiModeEnabled || isProcessingAi || !activeScene)
        return;
      setPromptHistory((prev) => [...prev, transcript]);
      log("TRANSCRIPT", "Processing command", { transcript, targetId });
      setDebugInfo((prev) => ({
        ...prev,
        rawTranscript: transcript,
        aiResponse: null,
        error: null,
      }));
      const thinkingToast = toast.loading(
        targetId ? "AI is updating..." : "AI is creating..."
      );
      setIsProcessingAi(true);
      try {
        if (targetId) {
          const existingOverlay = activeScene.activeOverlays.find(
            (o) => o.id === targetId
          );
          if (!existingOverlay) {
            throw new Error("Target overlay not found for update.");
          }
          log("AI_REQUEST", "Requesting overlay update", {
            existingHtml: existingOverlay.htmlContent,
            prompt: transcript,
          });
          const { name, htmlContent } = await updateOverlay(
            existingOverlay.htmlContent,
            transcript
          );
          log("AI_RESPONSE", `Agent HTML received for update on "${name}"`);

          updateActiveScene((scene) => ({
            ...scene,
            activeOverlays: scene.activeOverlays.map((o) => {
              if (o.id === targetId) {
                const updated = { ...o, name, htmlContent, preview: "" };
                if (recording.isRecording) recording.recordHtmlOverlay(updated);
                return updated;
              }
              return o;
            }),
          }));
          toast.success(`Updated overlay "${name}".`);
        } else {
          log("AI_REQUEST", "Requesting new overlay creation", {
            prompt: transcript,
          });
          const { name, htmlContent } = await processCommandWithAgent(
            transcript
          );
          log("AI_RESPONSE", `Agent HTML received for new overlay "${name}"`);
          const newOverlay: GeneratedOverlay = {
            id: generateOverlayId(),
            name,
            htmlContent,
            layout: {
              position: { x: 50, y: 50 },
              size: { width: 40, height: 40 },
              zIndex: 10,
              rotation: 0,
            },
            preview: "",
          };
          setSavedOverlays((prev) => [newOverlay, ...prev]);
          updateActiveScene((scene) => {
            const updatedOverlays = [...scene.activeOverlays, newOverlay];
            if (recording.isRecording) {
              recording.recordHtmlOverlay(newOverlay);
            }
            return { ...scene, activeOverlays: updatedOverlays };
          });
          toast.success(`AI generated "${name}".`);
        }
      } catch (error) {
        log("ERROR", "Error in processTranscript", error);
        setDebugInfo((prev) => ({
          ...prev,
          error: "AI command processing failed.",
        }));
        toast.error("AI command failed: " + (error as Error).message);
      } finally {
        setIsProcessingAi(false);
        toast.dismiss(thinkingToast);
      }
    },
    [
      isProcessingAi,
      log,
      setDebugInfo,
      activeScene,
      recording,
      updateActiveScene,
    ]
  );

  const handleOverlayLayoutChange = (
    id: string,
    key: "position" | "size" | "rotation",
    value: any
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      activeOverlays: scene.activeOverlays.map((o) => {
        if (o.id === id) {
          const updated = { ...o, layout: { ...o.layout, [key]: value } };
          if (recording.isRecording) recording.recordHtmlOverlay(updated);
          return updated;
        }
        return o;
      }),
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) {
        return;
      }

      if (e.key === "/") {
        e.preventDefault();
        const newBrowser: BrowserOverlayState = {
          id: generateBrowserId(),
          url: "https://www.google.com/search?igu=1",
          layout: {
            position: { x: 50, y: 50 },
            size: { width: 40, height: 50 },
            zIndex: zIndex.draggableElement,
            rotation: 0,
          },
        };
        updateActiveScene((scene) => {
          const updatedOverlays = [...scene.browserOverlays, newBrowser];
          if (recording.isRecording) {
            recording.recordBrowserOverlay(newBrowser);
          }
          return { ...scene, browserOverlays: updatedOverlays };
        });
        toast.info("Browser window added.");
      }

      if (e.key === "Escape") {
        if (selectedBrowserId) {
          e.preventDefault();
          e.stopPropagation();
          handleRemoveBrowser(selectedBrowserId);
          setSelectedBrowserId(null);
        }
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedBrowserId, recording, updateActiveScene]);

  const handleRemoveBrowser = (id: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      browserOverlays: scene.browserOverlays.filter((b) => b.id !== id),
    }));
  };

  const handleBrowserUrlChange = (id: string, url: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      browserOverlays: scene.browserOverlays.map((b) =>
        b.id === id ? { ...b, url } : b
      ),
    }));
  };

  const handleBrowserLayoutChange = (
    id: string,
    layout: Partial<BrowserOverlayState["layout"]>
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      browserOverlays: scene.browserOverlays.map((b) => {
        if (b.id === id) {
          const updated = { ...b, layout: { ...b.layout, ...layout } };
          if (recording.isRecording) recording.recordBrowserOverlay(updated);
          return updated;
        }
        return b;
      }),
    }));
  };

  const handleRemoveOverlay = (id: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      activeOverlays: scene.activeOverlays.filter((o) => o.id !== id),
    }));
    toast.info("Overlay removed from canvas.");
  };

  const handleCustomMaskUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === "string") {
        handleSetCustomMaskUrl(result);
        toast.success("Custom camera mask uploaded!");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddSavedOverlay = (overlay: GeneratedOverlay) => {
    const newActiveOverlay: GeneratedOverlay = {
      ...overlay,
      id: generateOverlayId(),
      layout: {
        position: { x: 50, y: 50 },
        size: { width: 40, height: 40 },
        zIndex: zIndex.draggableElement,
        rotation: 0,
      },
      preview: "",
    };
    updateActiveScene((scene) => {
      const updatedOverlays = [...scene.activeOverlays, newActiveOverlay];
      if (recording.isRecording) {
        recording.recordHtmlOverlay(newActiveOverlay);
      }
      return { ...scene, activeOverlays: updatedOverlays };
    });
  };

  const handleDeleteSavedOverlay = useCallback((id: string) => {
    setSavedOverlays((prev) => prev.filter((o) => o.id !== id));
  }, [setSavedOverlays]);

  // --- CANVAS PRESET HANDLER ---
  const handleCanvasPresetSelect = useCallback((preset: CanvasPreset) => {
    console.log('[Canvas Preset] Applying preset:', preset.name);
    
    updateActiveScene((scene) => {
      // Apply background
      const newScene = {
        ...scene,
        blankCanvasColor: preset.background.blankCanvasColor,
        backgroundEffect: preset.background.backgroundEffect,
      };

      // Apply layout and PiP settings
      if (preset.pip.layoutMode === 'pip' || preset.pip.layoutMode === 'split-vertical' || preset.pip.layoutMode === 'split-horizontal') {
        newScene.layoutMode = preset.pip.layoutMode as LayoutMode;
      }
      
      // Map camera shape
      const shapeMap: Record<string, CameraShape> = {
        'rectangle': 'rectangle',
        'circle': 'circle',
        'rounded': 'rounded',
      };
      newScene.cameraShape = shapeMap[preset.pip.cameraShape] || 'rectangle';
      
      if (preset.pip.splitRatio !== undefined) {
        newScene.splitRatio = preset.pip.splitRatio;
      }
      if (preset.pip.pipPosition) {
        newScene.pipPosition = { ...preset.pip.pipPosition };
      }
      if (preset.pip.pipSize) {
        newScene.pipSize = { ...preset.pip.pipSize };
      }

      // Apply effects
      if (preset.effects.videoFilter) {
        newScene.videoFilter = preset.effects.videoFilter;
      }
      if (preset.effects.isBeautifyEnabled !== undefined) {
        newScene.isBeautifyEnabled = preset.effects.isBeautifyEnabled;
      }
      if (preset.effects.isNeonEdgeEnabled !== undefined) {
        newScene.isNeonEdgeEnabled = preset.effects.isNeonEdgeEnabled;
      }
      if (preset.effects.neonColor) {
        newScene.neonColor = preset.effects.neonColor;
      }
      if (preset.effects.neonIntensity !== undefined) {
        newScene.neonIntensity = preset.effects.neonIntensity;
      }

      // Convert preset text overlays to draggable text overlays with full CaptionStyle
      const newTextOverlays: TextOverlayState[] = preset.textOverlays.map((textOverlay) => ({
        id: generateTextOverlayId(),
        content: textOverlay.content.replace(/<[^>]+>/g, ''), // Strip HTML tags
        style: {
          fontFamily: textOverlay.style.fontFamily,
          fontSize: textOverlay.style.fontSize,
          color: textOverlay.style.color,
          backgroundColor: textOverlay.style.backgroundColor,
          position: { ...textOverlay.layout.position },
          shape: 'rounded' as CaptionShapeType,
          animation: 'fade' as CaptionAnimationType,
          outline: false,
          shadow: true,
          bold: false,
          italic: false,
          underline: false,
          textShadow: textOverlay.style.textShadow,
          rotation: textOverlay.layout.rotation || 0,
          border: !!textOverlay.style.border,
          borderColor: '#FFFFFF',
          borderWidth: 2,
        },
        layout: {
          position: { ...textOverlay.layout.position },
          size: { ...textOverlay.layout.size },
          zIndex: textOverlay.layout.zIndex || 15,
          rotation: textOverlay.layout.rotation || 0,
        },
      }));

      // Add new text overlays to scene
      newScene.textOverlays = [...newScene.textOverlays, ...newTextOverlays];

      return newScene;
    });

    toast.success(`"${preset.name}" preset applied! Text overlays are now editable.`, {
      description: 'Drag and resize text overlays to customize your design.'
    });
  }, [updateActiveScene]);

  const handleToggleFullscreen = () => setIsFullscreen((prev) => !prev);

  useEffect(() => {
    if (isFullscreen) {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      } else if ((document.documentElement as any).webkitRequestFullscreen) {
        (document.documentElement as any).webkitRequestFullscreen();
      } else if ((document.documentElement as any).msRequestFullscreen) {
        (document.documentElement as any).msRequestFullscreen();
      }
    } else if (document.fullscreenElement) {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen();
      }
    }
  }, [isFullscreen]);

  useEffect(() => {
    const handleMouseMove = () => {
      setIsMouseActive(true);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 5000);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseTimeoutRef.current) {
        clearTimeout(mouseTimeoutRef.current);
      }
    };
  }, []);

  // --- Sidebar Props ---
  const sidebarProps = {
    style: activeScene.captionStyle,
    onStyleChange: handleSetCaptionStyle,
    dynamicStyle: activeScene.dynamicStyle,
    onDynamicStyleChange: handleSetDynamicStyle,
    blankCanvasColor: activeScene.blankCanvasColor,
    onBlankCanvasColorChange: handleSetBlankCanvasColor,
    backgroundEffect: activeScene.backgroundEffect,
    onBackgroundEffectChange: handleSetBackgroundEffect,
    backgroundImageUrl: activeScene.backgroundImageUrl,
    onBackgroundImageUrlChange: handleSetBackgroundImageUrl,
    isAutoFramingEnabled: activeScene.isAutoFramingEnabled,
    onAutoFramingChange: handleSetIsAutoFramingEnabled,
    zoomSensitivity: activeScene.zoomSensitivity,
    onZoomSensitivityChange: handleSetZoomSensitivity,
    trackingSpeed: activeScene.trackingSpeed,
    onTrackingSpeedChange: handleSetTrackingSpeed,
    isBeautifyEnabled: activeScene.isBeautifyEnabled,
    onBeautifyToggle: handleSetIsBeautifyEnabled,
    isLowLightEnabled: activeScene.isLowLightEnabled,
    onLowLightToggle: handleSetIsLowLightEnabled,
    videoFilter: activeScene.videoFilter,
    onVideoFilterChange: handleSetVideoFilter,
    isNeonEdgeEnabled: activeScene.isNeonEdgeEnabled,
    onNeonEdgeToggle: handleSetIsNeonEdgeEnabled,
    neonIntensity: activeScene.neonIntensity,
    onNeonIntensityChange: handleSetNeonIntensity,
    neonColor: activeScene.neonColor,
    onNeonColorChange: handleSetNeonColor,
    savedOverlays: savedOverlays,
    onAddSavedOverlay: handleAddSavedOverlay,
    onDeleteSavedOverlay: handleDeleteSavedOverlay,
    cameraBackground: activeScene.cameraBackground,
    onCameraBackgroundChange: handleSetCameraBackground,
    onCustomBackgroundUpload: handleCustomBackgroundUpload,
    cameraAspectRatio: activeScene.cameraAspectRatio,
    onCameraAspectRatioChange: handleSetCameraAspectRatio,
    canvasAspectRatio: activeScene.canvasAspectRatio,
    onCanvasAspectRatioChange: handleSetCanvasAspectRatio,
    customAspectRatio: activeScene.customAspectRatio,
    onCustomAspectRatioChange: handleSetCustomAspectRatio,
    isFaceTrackingEnabled: activeScene.isFaceTrackingEnabled,
    onFaceTrackingToggle: handleSetIsFaceTrackingEnabled,
    onCanvasPresetSelect: handleCanvasPresetSelect,
  };

  const handleDeleteSession = useCallback(
    (id: string) => {
      setAllSessions((prev) => prev.filter((s) => s.id !== id));
    },
    [setAllSessions]
  );

  // --- MODIFIED: Wrap canvas props in a memoized object ---
  // MOVED: These hooks are now BEFORE the early return.
  const activeSceneProps = useMemo(
    () => (activeScene ? getAllPropsForScene(activeScene) : null),
    [activeScene, savedOverlays]
  );

  const previousSceneProps = useMemo(
    () => (previousScene ? getAllPropsForScene(previousScene) : null),
    [previousScene, savedOverlays]
  );

  const handleRecordingToggle = useCallback(
    async (
      isCurrentlyRecording: boolean,
      stream: MediaStream,
      containerSize: { width: number; height: number }
    ) => {
      if (!isCurrentlyRecording) {
        await recording.startRecording(canvasRef.current as HTMLCanvasElement);
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
        setAllSessions((prev) => [session, ...prev]);
        toast.success("Recording saved and ready for editing!");
        setTimeout(() => {
          navigate(`/edit/${session.id}`);
        }, 50);
      }
    },
    [recording, setAllSessions, navigate, activeScene]
  );

  if (!activeScene || !activeSceneProps) {
    return <div>Loading...</div>;
  }

  const globalCanvasProps = {
    isFullscreen: isFullscreen,
    onToggleFullscreen: handleToggleFullscreen,
    isFsSidebarOpen: isFsSidebarOpen,
    onFsSidebarToggle: setIsFsSidebarOpen,
    dynamicLayout: dynamicLayout,
    onOpenSessions: () => setShowSessionsPanel(true),
    onOpenSettings: () => setShowFloatingPanel(!showFloatingPanel),
    isMouseActive: isMouseActive,
    isProcessingAi: isProcessingAi,
    onProcessTranscript: processTranscript,
    onOverlayLayoutChange: handleOverlayLayoutChange,
    onRemoveOverlay: handleRemoveOverlay,
    onPreviewGenerated: () => {},
    onRemoveBrowser: handleRemoveBrowser,
    onBrowserUrlChange: handleBrowserUrlChange,
    onBrowserLayoutChange: handleBrowserLayoutChange,
    selectedBrowserId: selectedBrowserId,
    setSelectedBrowserId: setSelectedBrowserId,
    onRemoveFile: handleRemoveFile,
    onFileLayoutChange: handleFileLayoutChange,
    selectedFileId: selectedFileId,
    setSelectedFileId: setSelectedFileId,
    onInternalDragStart: handleInternalDragStart,
    onInternalDragStop: handleInternalDragStop,
    onDeselectAll: handleDeselectAll,
    onSetDynamicLayout: handleSetDynamicLayout,
    onRemoveTextOverlay: handleRemoveTextOverlay,
    onTextLayoutChange: handleTextLayoutChange,
    onTextStyleChange: handleTextStyleChange,
    onTextContentChange: handleTextContentChange,
    selectedTextId: selectedTextId,
    setSelectedTextId: setSelectedTextId,
    isRecording: recording.isRecording,
    onRecordingToggle: handleRecordingToggle,
    canvasRef: canvasRef,
    onRecordingComplete: () => {},
    portalContainer: null,
    hasAiPopoverAutoOpenedRef: hasAiPopoverAutoOpenedRef,
  };

  return (
    <div
      ref={mainContainerRef}
      className={cn(
        "h-screen flex bg-background overflow-hidden relative",
        !isMouseActive && "cursor-none",
        "w-full"
      )}
    >
      <FloatingControlsPanel
        isOpen={showFloatingPanel} // --- MODIFIED: Pass open state ---
        onClose={() => setShowFloatingPanel(false)} // --- MODIFIED: Pass close handler ---
        isMouseActive={isMouseActive}
        {...sidebarProps}
      />

      {/* --- DELETED: FloatingLogo --- */}
      {/* --- ADDED: FloatingLogo restored --- */}
      <div className="fixed top-6 left-6 z-[2015] transition-opacity duration-300">
        <FloatingLogo />
      </div>
      {/* --- END ADDED --- */}

      <SceneTabs
        scenes={scenes}
        activeSceneId={activeSceneId}
        transitions={sceneTransitions}
        onSceneSelect={handleSceneSelect}
        onSceneAdd={handleAddScene}
        onTransitionClick={handleTransitionClick}
        onSceneClose={handleSceneClose}
        onSceneReorder={handleSceneReorder}
        onSceneRename={handleSceneRename}
        isHidden={isSceneTabsHidden} // ADDED
        onHide={() => setIsSceneTabsHidden(true)} // ADDED
      />

      {/* --- DELETED: Top-right button group --- */}

      <TransitionPopover
        transition={activeTransition}
        onClose={() => setActiveTransition(null)}
        onTransitionChange={handleTransitionChange as any}
      />

      <SavedSessionsPanel
        sessions={allSessions}
        onDeleteSession={handleDeleteSession}
        isOpen={showSessionsPanel}
        onClose={() => setShowSessionsPanel(false)}
      />

      {/* --- ADDED: Show Scenes Button --- */}
      {isSceneTabsHidden && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-1/2 right-2 -translate-y-1/2 z-[2025] cybr-scroll-btn"
          onClick={() => setIsSceneTabsHidden(false)}
          title="Show Scenes"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
      )}
      {/* --- END ADDED --- */}
      <div className="flex-1 relative overflow-hidden">
        {previousScene && previousSceneProps && (
          <div
            className="absolute inset-0 w-full h-full"
            style={{ display: isTransitioning ? "block" : "none" }}
          >
            {" "}
            <MemoizedVideoCanvas
              key="previous-scene-canvas" // Static key
              {...(previousSceneProps || activeSceneProps)} // Give valid props
              {...globalCanvasProps}
              isAudioOn={false}
              captionsEnabled={false}
              isTransitioningOut={isTransitioning}
              transition={activeTransition}
            />
          </div>
        )}

        <MemoizedVideoCanvas
          key="active-scene-canvas"
          {...activeSceneProps}
          {...globalCanvasProps}
          isTransitioningIn={isTransitioning}
          transition={activeTransition}
        />
      </div>

      <ExcalidrawOverlay
        isVisible={isDrawing}
        onClose={() => setIsDrawing(false)}
        initialElements={excalidrawElements}
        onElementsChange={setExcalidrawElements}
      />

      {/* --- ADDED: Render new BottomNavigation --- */}
      <BottomNavigation
        isMouseActive={isMouseActive}
        onOpenSettings={() => setShowFloatingPanel(!showFloatingPanel)}
        onOpenSessions={() => setShowSessionsPanel(true)}
        isAudioOn={activeScene.isAudioOn}
        onAudioToggle={handleSetIsAudioOn}
        audioDevices={audioDevices}
        onAudioDeviceSelect={handleSetSelectedAudioDevice}
        selectedAudioDevice={activeScene.selectedAudioDevice}
        isVideoOn={activeScene.isVideoOn}
        onVideoToggle={handleSetIsVideoOn}
        videoDevices={videoDevices}
        onVideoDeviceSelect={handleSetSelectedVideoDevice}
        selectedVideoDevice={activeScene.selectedVideoDevice}
        screenShareMode={activeScene.screenShareMode}
        onScreenShareModeChange={handleSetScreenShareMode}
        isRecording={recording.isRecording}
        onRecordingToggle={() =>
          handleRecordingToggle(
            recording.isRecording,
            canvasRef.current?.captureStream() as MediaStream,
            {
              width: canvasRef.current?.width || 1280,
              height: canvasRef.current?.height || 720,
            }
          )
        }
        isBroadcasting={isVirtualCameraEnabled}
        onBroadcastToggle={() => setIsVirtualCameraEnabled((prev) => !prev)}
        onAddTextOverlay={handleAddTextOverlay}
        onAssetSelect={handleAssetSelect}
        setIsDrawing={setIsDrawing}
        onToggleFullscreen={handleToggleFullscreen}
        isFullscreen={isFullscreen}
        // Pass Layout props
        layoutMode={activeScene.layoutMode}
        cameraShape={activeScene.cameraShape}
        onLayoutModeChange={handleSetLayoutMode}
        onCameraShapeChange={handleSetCameraShape}
        onCustomMaskUpload={handleCustomMaskUpload}
        portalContainer={mainContainerRef.current}
        splitRatio={activeScene.splitRatio}
        pipPosition={activeScene.pipPosition}
        pipSize={activeScene.pipSize}
        onSplitRatioChange={handleSetSplitRatio}
        onPipPositionChange={handleSetPipPosition}
        onPipSizeChange={handleSetPipSize}
        customMaskUrl={activeScene.customMaskUrl}
      />
    </div>
  );
};

export default Index;
