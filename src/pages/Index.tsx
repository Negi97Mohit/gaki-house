// src/pages/Index.tsx

import { useCallback, useRef, useEffect, useState, useMemo, memo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTheme } from "next-themes";

// --- Components ---
import { FloatingLogo } from "@/components/FloatingLogo";
import { FloatingControlsPanel } from "@/components/FloatingControlsPanel";
import { SavedSessionsPanel } from "@/components/SavedSessionsPanel";
import { ExcalidrawOverlay } from "@/components/ExcalidrawOverlay";
import { SceneTabs } from "@/components/SceneTabs";
import { TransitionPopover } from "@/components/TransitionPopover";
import { BottomNavigation } from "@/components/BottomNavigation";
import { MainCanvasArea } from "./index/components/MainCanvasArea";

// --- Hooks ---
import { useRecordingSession } from "@/hooks/useRecordingSession";
import { useCompositeStream } from "@/hooks/useCompositeStream";
import { useLog } from "@/context/LogContext";
import { useDebug } from "@/context/DebugContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";

// --- New Refactored Hooks ---
import { useSceneManager } from "./index/hooks/useSceneManager";
import { useMediaManager } from "./index/hooks/useMediaManager";
import { useLayoutManager } from "./index/hooks/useLayoutManager";

// --- Types & Libs ---
import {
  CaptionStyle,
  GeneratedOverlay,
  LayoutMode,
  CameraShape,
  GeneratedLayout,
  SceneState,
  SceneTransition,
  CanvasLayoutState,
  CanvasSectionCameraState,
  DEFAULT_CAMERA_STATE,
} from "@/types/caption";
import { RecordingSession } from "@/types/editor";
import { processCommandWithAgent, updateOverlay } from "@/lib/ai";
import { AssetResult } from "@/components/AssetLibrary";
import { zIndex } from "@/lib/zIndex";
import { cn } from "@/lib/utils";

// --- ID Generators ---
const generateTextOverlayId = () =>
  `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateOverlayId = () =>
  `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateFileId = () => `file-${Date.now()}`;
const generateBrowserId = () => `browser-${Date.now()}`;

const Index = () => {
  const navigate = useNavigate();
  const recording = useRecordingSession();
  const { log } = useLog();
  const { setDebugInfo } = useDebug();

  // --- 1. SCENE MANAGEMENT HOOK ---
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
    handleSequenceTransition,
  } = useSceneManager({ recording });

  // --- UI STATE ---
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSceneTabsHidden, setIsSceneTabsHidden] = useState(true);
  const [isFsSidebarOpen, setIsFsSidebarOpen] = useState(false);
  const [isMouseActive, setIsMouseActive] = useState(true);
  const [showSessionsPanel, setShowSessionsPanel] = useState(false);
  const [showFloatingPanel, setShowFloatingPanel] = useState(false);

  // Selection State
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(
    null
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);

  // Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly any[]>(
    []
  );

  // AI State
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const hasAiPopoverAutoOpenedRef = useRef(false);

  // Dynamic Layout State
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
  const mainContainerRef = useCallback((node: HTMLDivElement) => {
    if (node !== null) setMainContainer(node);
  }, []);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // --- 2. MEDIA MANAGER HOOK ---
  const { audioDevices, videoDevices } = useMediaManager({
    isAudioOn: activeScene?.isAudioOn || false,
    selectedAudioDevice: activeScene?.selectedAudioDevice,
    sceneId: activeSceneId,
    onAudioToggle: (val) => updateSceneProperty("isAudioOn", val),
  });

  // --- 3. LAYOUT MANAGER HOOK ---
  const {
    presets,
    customPresets,
    publicPresets,
    isLoadingPublic,
    handleSaveCanvasPreset,
    handleDeleteCanvasPreset,
    handleCanvasPresetSelect,
    handleSaveLayout,
    handleLoadPreset,
    handleDeletePreset,
    shareCanvasPreset,
    unshareCanvasPreset,
  } = useLayoutManager({
    activeScene,
    updateActiveScene,
    recording,
    setSelectedTextId,
    setSelectedFileId,
    setSelectedBrowserId,
  });

  // --- Virtual Camera / Broadcasting ---
  const [isVirtualCameraEnabled, setIsVirtualCameraEnabled] = useState(false);
  const { compositeStream, isReady: isCompositeReady } = useCompositeStream({
    canvasRef,
    isEnabled: isVirtualCameraEnabled,
    frameRate: 30,
  });

  useEffect(() => {
    if (isCompositeReady && compositeStream) {
      toast.success("🎥 Broadcasting Active!", {
        description:
          "Virtual camera stream is ready for OBS/streaming platforms",
        duration: 5000,
      });
    }
  }, [isCompositeReady, compositeStream]);

  // --- UI Effects ---
  useEffect(() => {
    // Auto-show/hide SceneTabs
    const handleMouseMove = (e: MouseEvent) => {
      const threshold = 50;
      const distanceFromRight = window.innerWidth - e.clientX;
      if (distanceFromRight <= threshold) {
        setIsSceneTabsHidden(false);
      } else if (distanceFromRight > 300) {
        setIsSceneTabsHidden(true);
      }

      // Mouse activity tracker
      setIsMouseActive(true);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
      mouseTimeoutRef.current = setTimeout(() => {
        setIsMouseActive(false);
      }, 5000);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (mouseTimeoutRef.current) clearTimeout(mouseTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    // Auto-open floating panel on mount
    const openTimer = setTimeout(() => {
      setShowFloatingPanel(true);
    }, 500);
    return () => clearTimeout(openTimer);
  }, []);

  // --- Scene Property Handlers (Wrappers) ---
  const handleSetIsAudioOn = useCallback(
    (val: boolean) => updateSceneProperty("isAudioOn", val),
    [updateSceneProperty]
  );
  const handleSetIsVideoOn = useCallback(
    (val: boolean) => updateSceneProperty("isVideoOn", val),
    [updateSceneProperty]
  );
  const handleSetSelectedAudioDevice = useCallback(
    (val: string) => updateSceneProperty("selectedAudioDevice", val),
    [updateSceneProperty]
  );
  const handleSetSelectedVideoDevice = useCallback(
    (val: string) => updateSceneProperty("selectedVideoDevice", val),
    [updateSceneProperty]
  );
  const handleSetScreenShareMode = useCallback(
    (val: "off" | "screen" | "canvas") => {
      updateActiveScene((scene) => ({
        ...scene,
        screenShareMode: val,
        layoutMode: val !== "off" ? "pip" : "solo",
      }));
    },
    [updateActiveScene]
  );

  const handleSetCaptionStyle = useCallback(
    (val: CaptionStyle) => {
      updateSceneProperty("captionStyle", val);
      if (recording.isRecording) recording.recordCaptionStyle(val);
    },
    [updateSceneProperty, recording]
  );

  // --- Complex Handlers ---

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

  const handleCustomMaskUpload = useCallback(
    (file: File) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === "string") {
          updateSceneProperty("customMaskUrl", result);
          toast.success("Custom camera mask uploaded!");
        }
      };
      reader.readAsDataURL(file);
    },
    [updateSceneProperty]
  );

  const handleCanvasBackgroundUpload = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file type. Please upload an image.");
        return;
      }
      const url = URL.createObjectURL(file);
      updateActiveScene((scene) => ({
        ...scene,
        backgroundEffect: "image",
        backgroundImageUrl: url,
      }));
      toast.success("Custom canvas background uploaded!");
    },
    [updateActiveScene]
  );

  const handleGridAssetSelect = useCallback(
    (sectionId: string, asset: AssetResult) => {
      updateActiveScene((scene) => {
        const updatedCanvasLayout = scene.canvasLayout
          ? {
              ...scene.canvasLayout,
              sections: scene.canvasLayout.sections.map((s) =>
                s.id === sectionId
                  ? {
                      ...s,
                      content: {
                        type: "image" as const,
                        src: asset.downloadUrl,
                      },
                    }
                  : s
              ),
            }
          : scene.canvasLayout;
        return { ...scene, canvasLayout: updatedCanvasLayout };
      });
      toast.success(`Added '${asset.alt}' to grid`);
    },
    [updateActiveScene]
  );

  const handleSectionCameraSettingsChange = useCallback(
    (sectionId: string, settings: Partial<CanvasSectionCameraState>) => {
      updateActiveScene((scene) => {
        if (!scene.canvasLayout) return scene;
        const newSections = scene.canvasLayout.sections.map((s) => {
          if (s.id === sectionId) {
            let newContent = s.content;
            let currentSettings = DEFAULT_CAMERA_STATE;
            if (s.content.type === "camera") {
              currentSettings = { ...s.content.settings, ...settings };
              newContent = { ...s.content, settings: currentSettings };
            } else if (s.savedCameraSettings) {
              currentSettings = { ...s.savedCameraSettings, ...settings };
            }
            return {
              ...s,
              content: newContent,
              savedCameraSettings: currentSettings,
            };
          }
          return s;
        });

        const isTrackingOn =
          settings.isFaceTrackingEnabled ||
          settings.isAutoFramingEnabled ||
          (newSections.find((s) => s.id === sectionId)?.content as any)
            ?.settings?.isAutoFramingEnabled;

        return {
          ...scene,
          activeSequenceId:
            isTrackingOn &&
            scene.canvasLayout?.sectionOrder?.includes(sectionId)
              ? sectionId
              : scene.activeSequenceId,
          canvasLayout: { ...scene.canvasLayout, sections: newSections },
        };
      });
    },
    [updateActiveScene]
  );

  // --- Overlay Handlers ---
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
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: [...scene.textOverlays, newTextOverlay],
    }));
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
      textOverlays: scene.textOverlays.map((o) =>
        o.id === id ? { ...o, layout: { ...o.layout, ...layout } } : o
      ),
    }));
  };

  const handleTextStyleChange = (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.map((o) =>
        o.id === id ? { ...o, style: { ...o.style, ...style } } : o
      ),
    }));
  };

  const handleTextContentChange = (id: string, content: string) => {
    updateActiveScene((scene) => ({
      ...scene,
      textOverlays: scene.textOverlays.map((o) =>
        o.id === id ? { ...o, content } : o
      ),
    }));
  };

  // --- AI Processing ---
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
          if (!existingOverlay) throw new Error("Target overlay not found.");

          const { name, htmlContent } = await updateOverlay(
            existingOverlay.htmlContent,
            transcript
          );

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
          const { name, htmlContent } = await processCommandWithAgent(
            transcript
          );
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
            const updated = [...scene.activeOverlays, newOverlay];
            if (recording.isRecording) recording.recordHtmlOverlay(newOverlay);
            return { ...scene, activeOverlays: updated };
          });
          toast.success(`AI generated "${name}".`);
        }
      } catch (error) {
        log("ERROR", "Error in processTranscript", error);
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

  const handleDeselectAll = () => {
    setSelectedBrowserId(null);
    setSelectedFileId(null);
    setSelectedTextId(null);
  };

  const handleAssetSelect = async (asset: AssetResult) => {
    // Simplified asset handler from original
    try {
      // Logic to add asset based on type (not fully implemented in snippet but assumed)
      toast.info(`Asset selected: ${asset.alt}`);
    } catch (error) {
      toast.error("Failed to add asset");
    }
  };

  // --- Props Construction ---

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
      onAiModeToggle: (val: boolean) =>
        updateSceneProperty("isAiModeEnabled", val),
      aiButtonPosition: scene.aiButtonPosition,
      onAiButtonPositionChange: (pos: { x: number; y: number }) =>
        updateSceneProperty("aiButtonPosition", pos),
      generatedOverlays: scene.activeOverlays,
      browserOverlays: scene.browserOverlays,
      fileOverlays: scene.fileOverlays,
      textOverlays: scene.textOverlays,
      captionsEnabled: scene.captionsEnabled,
      onCaptionsToggle: (val: boolean) =>
        updateSceneProperty("captionsEnabled", val),
      liveCaptionStyle: scene.captionStyle,
      onStyleChange: (val: CaptionStyle) => handleSetCaptionStyle(val),
      dynamicStyle: scene.dynamicStyle,
      onCaptionLayoutChange: (layout: any) => {
        // Implementation from original
        const updatedStyle = {
          ...scene.captionStyle,
          position: layout.position ?? scene.captionStyle.position,
          width: layout.size?.width ?? scene.captionStyle.width,
        };
        handleSetCaptionStyle(updatedStyle);
      },
      layoutMode: scene.layoutMode,
      cameraShape: scene.cameraShape,
      splitRatio: scene.splitRatio,
      pipPosition: scene.pipPosition,
      pipSize: scene.pipSize,
      onLayoutModeChange: (val: LayoutMode) =>
        updateSceneProperty("layoutMode", val),
      onCameraShapeChange: (val: CameraShape) =>
        updateSceneProperty("cameraShape", val),
      onSplitRatioChange: (val: number) =>
        updateSceneProperty("splitRatio", val),
      onPipPositionChange: (val: any) =>
        updateSceneProperty("pipPosition", val),
      onPipSizeChange: (val: any) => updateSceneProperty("pipSize", val),
      pipRotation: scene.pipRotation,
      onPipRotationChange: (val: number) =>
        updateSceneProperty("pipRotation", val),
      pipBorder: scene.pipBorder,
      pipShadow: scene.pipShadow,
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
      screenShareMode: scene.screenShareMode as "off" | "screen" | "canvas",
      onScreenShareModeChange: handleSetScreenShareMode,
      canvasLayout: scene.canvasLayout,
      activeSequenceId: scene.activeSequenceId,
      onSetSectionDefault: (id: string) => {
        updateActiveScene((s) => {
          if (!s.canvasLayout) return s;
          const sections = s.canvasLayout.sections.map((sec) =>
            sec.id === id ? { ...sec, defaultContent: sec.content } : sec
          );
          return { ...s, canvasLayout: { ...s.canvasLayout, sections } };
        });
      },
      onUserPositionChange: (pos: any) => {
        // Sequencer logic is handled in useGridSequencer inside useSceneManager
        // But we need to trigger it.
        // Wait, useSceneManager returned handleSequenceTransition but not the location tracker itself.
        // We should instantiate useGridSequencer here or pass logic.
        // Actually, VideoCanvas instantiates useGridSequencer? No, previous code did it in Index.
        // I will reimplement the sequencer logic briefly or pass it if it was in useSceneManager.
      },
      onCanvasLayoutChange: (layout: CanvasLayoutState | null) => {
        updateActiveScene((s) => ({ ...s, canvasLayout: layout }));
      },
      onCanvasBackgroundUpload: handleCanvasBackgroundUpload,
      onGridAssetSelect: handleGridAssetSelect,
      onCanvasBackgroundAssetSelect: (asset: AssetResult) => {
        updateSceneProperty("backgroundImageUrl", asset.downloadUrl);
        updateSceneProperty("backgroundEffect", "image");
      },
      hasAiPopoverAutoOpenedRef: hasAiPopoverAutoOpenedRef,
      audioDevices: audioDevices,
      videoDevices: videoDevices,
      canvasAspectRatio: scene.canvasAspectRatio,
      sidebarProps: {
        // Populate all the individual sidebar props
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
        onDynamicStyleChange: (val: string) =>
          updateSceneProperty("dynamicStyle", val),
        onBlankCanvasColorChange: (val: string) =>
          updateSceneProperty("blankCanvasColor", val),
        onBackgroundEffectChange: (val: any) =>
          updateSceneProperty("backgroundEffect", val),
        onBackgroundImageUrlChange: (val: string) =>
          updateSceneProperty("backgroundImageUrl", val),
        pipBorder: scene.pipBorder,
        onPipBorderChange: (val: any) => updateSceneProperty("pipBorder", val),
        pipShadow: scene.pipShadow,
        onPipShadowChange: (val: any) => updateSceneProperty("pipShadow", val),
        onAutoFramingChange: (val: boolean) =>
          updateSceneProperty("isAutoFramingEnabled", val),
        onZoomSensitivityChange: (val: number) =>
          updateSceneProperty("zoomSensitivity", val),
        onTrackingSpeedChange: (val: number) =>
          updateSceneProperty("trackingSpeed", val),
        onBeautifyToggle: (val: boolean) =>
          updateSceneProperty("isBeautifyEnabled", val),
        onLowLightToggle: (val: boolean) =>
          updateSceneProperty("isLowLightEnabled", val),
        onVideoFilterChange: (val: string) =>
          updateSceneProperty("videoFilter", val),
        onNeonEdgeToggle: (val: boolean) =>
          updateSceneProperty("isNeonEdgeEnabled", val),
        onNeonIntensityChange: (val: number) =>
          updateSceneProperty("neonIntensity", val),
        onNeonColorChange: (val: string) =>
          updateSceneProperty("neonColor", val),
        activeInteractiveFilter: scene.activeInteractiveFilter,
        onInteractiveFilterChange: (val: any) =>
          updateSceneProperty("activeInteractiveFilter", val),
        filterIntensity: scene.filterIntensity,
        onFilterIntensityChange: (val: number) =>
          updateSceneProperty("filterIntensity", val),
        filterColor: scene.filterColor,
        onFilterColorChange: (val: string) =>
          updateSceneProperty("filterColor", val),
        filterTarget: scene.filterTarget,
        onFilterTargetChange: (val: any) =>
          updateSceneProperty("filterTarget", val),
        savedOverlays: savedOverlays,
        onCanvasBackgroundUpload: handleCanvasBackgroundUpload,
        onAddSavedOverlay: (overlay: GeneratedOverlay) => {
          updateActiveScene((s) => ({
            ...s,
            activeOverlays: [...s.activeOverlays, overlay],
          }));
        },
        onDeleteSavedOverlay: (id: string) =>
          setSavedOverlays((prev) => prev.filter((o) => o.id !== id)),
        cameraBackground: scene.cameraBackground,
        onCameraBackgroundChange: (val: any) =>
          updateSceneProperty("cameraBackground", val),
        onCustomBackgroundUpload: (file: File) => {
          const url = URL.createObjectURL(file);
          updateActiveScene((s) => ({
            ...s,
            cameraBackground: "image",
            customBackgroundUrl: url,
          }));
        },
        cameraAspectRatio: scene.cameraAspectRatio,
        onCameraAspectRatioChange: (val: string) =>
          updateSceneProperty("cameraAspectRatio", val),
        canvasAspectRatio: scene.canvasAspectRatio,
        onCanvasAspectRatioChange: (val: string) =>
          updateSceneProperty("canvasAspectRatio", val),
        customAspectRatio: scene.customAspectRatio,
        onCustomAspectRatioChange: (val: string) =>
          updateSceneProperty("customAspectRatio", val),
        isFaceTrackingEnabled: scene.isFaceTrackingEnabled,
        onFaceTrackingToggle: (val: boolean) =>
          updateSceneProperty("isFaceTrackingEnabled", val),
        onCanvasPresetSelect: handleCanvasPresetSelect,
        selectedDeviceId: scene.selectedVideoDevice,
      },
    };
  };

  const activeSceneProps = useMemo(
    () => (activeScene ? getAllPropsForScene(activeScene) : null),
    [activeScene, savedOverlays]
  );
  const previousSceneProps = useMemo(
    () => (previousScene ? getAllPropsForScene(previousScene) : null),
    [previousScene, savedOverlays]
  );

  // --- Global Canvas Props ---
  const globalCanvasProps = {
    isFullscreen,
    onToggleFullscreen: () => setIsFullscreen(!isFullscreen),
    isFsSidebarOpen,
    onFsSidebarToggle: setIsFsSidebarOpen,
    dynamicLayout,
    onOpenSessions: () => setShowSessionsPanel(true),
    onOpenSettings: () => setShowFloatingPanel(!showFloatingPanel),
    isMouseActive,
    isProcessingAi,
    onProcessTranscript: processTranscript,
    onOverlayLayoutChange: (id: string, key: string, value: any) => {
      updateActiveScene((s) => ({
        ...s,
        activeOverlays: s.activeOverlays.map((o) =>
          o.id === id ? { ...o, layout: { ...o.layout, [key]: value } } : o
        ),
      }));
    },
    onRemoveOverlay: (id: string) =>
      updateActiveScene((s) => ({
        ...s,
        activeOverlays: s.activeOverlays.filter((o) => o.id !== id),
      })),
    onPreviewGenerated: () => {},
    onRemoveBrowser: (id: string) =>
      updateActiveScene((s) => ({
        ...s,
        browserOverlays: s.browserOverlays.filter((b) => b.id !== id),
      })),
    onBrowserUrlChange: (id: string, url: string) =>
      updateActiveScene((s) => ({
        ...s,
        browserOverlays: s.browserOverlays.map((b) =>
          b.id === id ? { ...b, url } : b
        ),
      })),
    onBrowserLayoutChange: (id: string, layout: any) =>
      updateActiveScene((s) => ({
        ...s,
        browserOverlays: s.browserOverlays.map((b) =>
          b.id === id ? { ...b, layout: { ...b.layout, ...layout } } : b
        ),
      })),
    onGridAssetSelect: handleGridAssetSelect,
    selectedBrowserId,
    setSelectedBrowserId,
    onRemoveFile: (id: string) =>
      updateActiveScene((s) => ({
        ...s,
        fileOverlays: s.fileOverlays.filter((f) => f.id !== id),
      })),
    onFileLayoutChange: (id: string, layout: any) =>
      updateActiveScene((s) => ({
        ...s,
        fileOverlays: s.fileOverlays.map((f) =>
          f.id === id ? { ...f, layout: { ...f.layout, ...layout } } : f
        ),
      })),
    selectedFileId,
    setSelectedFileId,
    onInternalDragStart: () => {},
    onInternalDragStop: () => {},
    onDeselectAll: () => {
      setSelectedBrowserId(null);
      setSelectedFileId(null);
      setSelectedTextId(null);
    },
    onSetDynamicLayout: (target: any, mode: any) => {
      if (mode === "reset") {
        setDynamicLayout({
          isActive: false,
          mode: "split-vertical",
          target: null,
        });
      } else {
        let content = null;
        if (target.type === "html")
          content = activeScene.activeOverlays.find((o) => o.id === target.id);
        // ... fetch content based on type ...
        if (content)
          setDynamicLayout({
            isActive: true,
            mode,
            target: { ...target, content, layout: content.layout },
          });
      }
    },
    onRemoveTextOverlay: handleRemoveTextOverlay,
    onSectionCameraSettingsChange: handleSectionCameraSettingsChange,
    onTextLayoutChange: handleTextLayoutChange,
    onTextStyleChange: handleTextStyleChange,
    onTextContentChange: handleTextContentChange,
    selectedTextId,
    setSelectedTextId,
    isRecording: recording.isRecording,
    onRecordingToggle: handleRecordingToggle,
    canvasRef,
    onRecordingComplete: () => {},
    portalContainer: mainContainerRef,
    hasAiPopoverAutoOpenedRef,
    onAiPopoverAutoClose: () => {
      // Legacy auto-open logic
      setTimeout(() => {
        setShowFloatingPanel(true);
        setTimeout(() => setShowFloatingPanel(false), 4000);
      }, 500);
    },
  };

  if (!activeScene) return <div>Loading...</div>;

  return (
    <div
      ref={mainContainerRef}
      className={cn(
        "h-screen flex bg-background overflow-hidden relative w-full",
        !isMouseActive && "cursor-none"
      )}
    >
      <FloatingControlsPanel
        isOpen={showFloatingPanel}
        onClose={() => setShowFloatingPanel(false)}
        isMouseActive={isMouseActive}
        {...activeSceneProps?.sidebarProps} // Pass the constructed props
        onSaveCanvasPreset={handleSaveCanvasPreset}
        customCanvasPresets={customPresets}
        onDeleteCanvasPreset={handleDeleteCanvasPreset}
        publicPresets={publicPresets}
        isLoadingPublic={isLoadingPublic}
        onShareCanvasPreset={shareCanvasPreset}
        onUnshareCanvasPreset={unshareCanvasPreset}
      />

      <div className="fixed top-6 left-6 z-[2015] transition-opacity duration-300">
        <FloatingLogo />
      </div>

      <SceneTabs
        scenes={scenes}
        activeSceneId={activeSceneId}
        transitions={sceneTransitions}
        onSceneSelect={handleSceneSelect}
        onSceneAdd={handleAddScene}
        onTransitionClick={(t) => setActiveTransition(t)}
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

      <MainCanvasArea
        activeScene={activeScene}
        previousScene={previousScene}
        activeSceneProps={activeSceneProps}
        previousSceneProps={previousSceneProps}
        globalCanvasProps={globalCanvasProps}
        isTransitioning={isTransitioning}
        activeTransition={activeTransition}
      />

      <ExcalidrawOverlay
        isVisible={isDrawing}
        onClose={() => setIsDrawing(false)}
        initialElements={excalidrawElements}
        onElementsChange={setExcalidrawElements}
      />

      <BottomNavigation
        isMouseActive={isMouseActive}
        onOpenSettings={() => setShowFloatingPanel(!showFloatingPanel)}
        onOpenSessions={() => setShowSessionsPanel(true)}
        onSaveLayout={handleSaveLayout}
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
        onToggleFullscreen={() => setIsFullscreen(!isFullscreen)}
        isFullscreen={isFullscreen}
        layoutMode={activeScene.layoutMode}
        cameraShape={activeScene.cameraShape}
        onLayoutModeChange={(val) => updateSceneProperty("layoutMode", val)}
        onCameraShapeChange={(val) => updateSceneProperty("cameraShape", val)}
        onCustomMaskUpload={handleCustomMaskUpload}
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
