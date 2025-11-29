import React, { useCallback, useRef, useState, useMemo } from "react";
import { toast } from "sonner";
import { MainCanvasArea } from "./MainCanvasArea";
import { FloatingControlsPanel } from "@/components/FloatingControlsPanel";
import { FloatingLogo } from "@/components/FloatingLogo"; // Kept logo with canvas
import {
  CaptionStyle,
  GeneratedOverlay,
  GeneratedLayout,
  SceneState,
  SceneTransition,
  CanvasLayoutState,
  CanvasSectionCameraState,
  DEFAULT_CAMERA_STATE,
  TextOverlayState,
  LayoutMode,
  CameraShape,
} from "@/types/caption";
import { RecordingSession } from "@/types/editor";
import { processCommandWithAgent, updateOverlay } from "@/lib/ai";
import { AssetResult } from "@/components/AssetLibrary";
import { zIndex } from "@/lib/zIndex";

// Helper generators
const generateTextOverlayId = () =>
  `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
const generateOverlayId = () =>
  `overlay-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface CanvasContainerProps {
  // Managers
  activeScene: SceneState;
  previousScene: SceneState | null;
  activeTransition: SceneTransition | null;
  isTransitioning: boolean;
  updateActiveScene: (updater: (scene: SceneState) => SceneState) => void;
  updateSceneProperty: (key: keyof SceneState, value: any) => void;

  // Media & Layout
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  layoutManager: any; // Using simplified type for brevity, matches usage

  // Recording
  recording: any; // Matches useRecordingSession return
  onRecordingComplete: (session: RecordingSession) => void;

  // UI State
  uiState: {
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    isFsSidebarOpen: boolean;
    onFsSidebarToggle: (open: boolean) => void;
    isMouseActive: boolean;
    onOpenSessions: () => void;
  };

  // Shared State
  savedOverlays: GeneratedOverlay[];
  setSavedOverlays: React.Dispatch<React.SetStateAction<GeneratedOverlay[]>>;
  dynamicLayout: any;
  setDynamicLayout: (layout: any) => void;

  // Selection
  selection: {
    selectedBrowserId: string | null;
    setSelectedBrowserId: (id: string | null) => void;
    selectedFileId: string | null;
    setSelectedFileId: (id: string | null) => void;
    selectedTextId: string | null;
    setSelectedTextId: (id: string | null) => void;
    selectedGeneratedId: string | null;
    setSelectedGeneratedId: (id: string | null) => void;
    handleDeselectAll: () => void;
  };

  // Refs
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mainContainerRef: (node: HTMLDivElement) => void;
}

export const CanvasContainer: React.FC<CanvasContainerProps> = ({
  activeScene,
  previousScene,
  activeTransition,
  isTransitioning,
  updateActiveScene,
  updateSceneProperty,
  audioDevices,
  videoDevices,
  layoutManager,
  recording,
  onRecordingComplete,
  uiState,
  savedOverlays,
  setSavedOverlays,
  dynamicLayout,
  setDynamicLayout,
  selection,
  canvasRef,
  mainContainerRef,
}) => {
  const [showFloatingPanel, setShowFloatingPanel] = useState(false);
  const [isProcessingAi, setIsProcessingAi] = useState(false);
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const hasAiPopoverAutoOpenedRef = useRef(false);

  // --- Handlers ---

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
        onRecordingComplete(session);
        toast.success("Recording saved and ready for editing!");
      }
    },
    [recording, activeScene, onRecordingComplete, canvasRef]
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
        return {
          ...scene,
          canvasLayout: { ...scene.canvasLayout, sections: newSections },
        };
      });
    },
    [updateActiveScene]
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
    selection.handleDeselectAll();
    selection.setSelectedTextId(newTextOverlay.id);
    toast.info("Text element added. Click to edit!");
  }, [activeScene.captionStyle, updateActiveScene, selection]);

  const processTranscript = useCallback(
    async (transcript: string, targetId: string | null = null) => {
      if (!activeScene.isAiModeEnabled || isProcessingAi || !activeScene)
        return;

      setPromptHistory((prev) => [...prev, transcript]);
      setIsProcessingAi(true);
      const thinkingToast = toast.loading(
        targetId ? "AI is updating..." : "AI is creating..."
      );

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
        toast.error("AI command failed: " + (error as Error).message);
      } finally {
        setIsProcessingAi(false);
        toast.dismiss(thinkingToast);
      }
    },
    [
      isProcessingAi,
      activeScene,
      recording,
      updateActiveScene,
      setSavedOverlays,
    ]
  );

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
      onStyleChange: handleSetCaptionStyle,
      dynamicStyle: scene.dynamicStyle,
      onCaptionLayoutChange: (layout: any) => {
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
      onUserPositionChange: () => { },
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
        onCanvasPresetSelect: layoutManager.handleCanvasPresetSelect,
        selectedDeviceId: scene.selectedVideoDevice,
      },
    };
  };

  const activeSceneProps = useMemo(
    () => (activeScene ? getAllPropsForScene(activeScene) : null),
    [activeScene, savedOverlays, layoutManager]
  );
  const previousSceneProps = useMemo(
    () => (previousScene ? getAllPropsForScene(previousScene) : null),
    [previousScene, savedOverlays, layoutManager]
  );

  const globalCanvasProps = {
    isFullscreen: uiState.isFullscreen,
    onToggleFullscreen: uiState.onToggleFullscreen,
    isFsSidebarOpen: uiState.isFsSidebarOpen,
    onFsSidebarToggle: uiState.onFsSidebarToggle,
    dynamicLayout,
    onOpenSessions: uiState.onOpenSessions,
    onOpenSettings: () => setShowFloatingPanel(!showFloatingPanel),
    isMouseActive: uiState.isMouseActive,
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
    onPreviewGenerated: () => { },
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
    selectedBrowserId: selection.selectedBrowserId,
    setSelectedBrowserId: selection.setSelectedBrowserId,
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
    selectedFileId: selection.selectedFileId,
    setSelectedFileId: selection.setSelectedFileId,
    onInternalDragStart: () => { },
    onInternalDragStop: () => { },
    onDeselectAll: selection.handleDeselectAll,
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
        if (content)
          setDynamicLayout({
            isActive: true,
            mode,
            target: { ...target, content, layout: content.layout },
          });
      }
    },
    onRemoveTextOverlay: (id: string) => {
      updateActiveScene((s) => ({
        ...s,
        textOverlays: s.textOverlays.filter((o) => o.id !== id),
      }));
      if (selection.selectedTextId === id) selection.setSelectedTextId(null);
    },
    onSectionCameraSettingsChange: handleSectionCameraSettingsChange,
    onTextLayoutChange: (id: string, layout: any) =>
      updateActiveScene((s) => ({
        ...s,
        textOverlays: s.textOverlays.map((o) =>
          o.id === id ? { ...o, layout: { ...o.layout, ...layout } } : o
        ),
      })),
    onTextStyleChange: (id: string, style: any) =>
      updateActiveScene((s) => ({
        ...s,
        textOverlays: s.textOverlays.map((o) =>
          o.id === id ? { ...o, style: { ...o.style, ...style } } : o
        ),
      })),
    onTextContentChange: (id: string, content: string) =>
      updateActiveScene((s) => ({
        ...s,
        textOverlays: s.textOverlays.map((o) =>
          o.id === id ? { ...o, content } : o
        ),
      })),
    selectedTextId: selection.selectedTextId,
    setSelectedTextId: selection.setSelectedTextId,
    selectedGeneratedId: selection.selectedGeneratedId,
    setSelectedGeneratedId: selection.setSelectedGeneratedId,
    isRecording: recording.isRecording,
    onRecordingToggle: () =>
      handleRecordingToggle(
        recording.isRecording,
        canvasRef.current?.captureStream() as MediaStream,
        {
          width: canvasRef.current?.width || 1280,
          height: canvasRef.current?.height || 720,
        }
      ),
    canvasRef,
    onRecordingComplete,
    portalContainer: mainContainerRef,
    hasAiPopoverAutoOpenedRef: hasAiPopoverAutoOpenedRef,
    onAiPopoverAutoClose: () => {
      setTimeout(() => {
        setShowFloatingPanel(true);
        setTimeout(() => setShowFloatingPanel(false), 4000);
      }, 500);
    },
  };

  return (
    <>
      <FloatingControlsPanel
        isOpen={showFloatingPanel}
        onClose={() => setShowFloatingPanel(false)}
        isMouseActive={uiState.isMouseActive}
        {...activeSceneProps?.sidebarProps}
        onSaveCanvasPreset={layoutManager.handleSaveCanvasPreset}
        customCanvasPresets={layoutManager.customPresets}
        onDeleteCanvasPreset={layoutManager.handleDeleteCanvasPreset}
        publicPresets={layoutManager.publicPresets}
        isLoadingPublic={layoutManager.isLoadingPublic}
        onShareCanvasPreset={layoutManager.shareCanvasPreset}
        onUnshareCanvasPreset={layoutManager.unshareCanvasPreset}
      />

      <div className="fixed top-6 left-6 z-[2015] transition-opacity duration-300">
        <FloatingLogo />
      </div>

      <MainCanvasArea
        activeScene={activeScene}
        previousScene={previousScene}
        activeSceneProps={activeSceneProps}
        previousSceneProps={previousSceneProps}
        globalCanvasProps={globalCanvasProps}
        isTransitioning={isTransitioning}
        activeTransition={activeTransition}
      />
    </>
  );
};
