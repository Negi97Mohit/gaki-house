import React, { useCallback, useRef, useMemo } from "react";
import { toast } from "sonner";
import { MainCanvasArea } from "./MainCanvasArea";
import { FloatingControlsPanel } from "@/features/studio/ui/FloatingControlsPanel";
import { FloatingLogo } from "@/features/studio/ui/FloatingLogo";
import { SocialBannerEditor } from "@/features/banners/ui/SocialBannerEditor";
import {
  CaptionStyle,
  GeneratedOverlay,
  SceneState,
  SceneTransition,
  CanvasSectionCameraState,
  DEFAULT_CAMERA_STATE,
  TextOverlayState,
} from "@/types/caption";
import { RecordingSession } from "@/types/editor";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { zIndex } from "@/lib/zIndex";
import { generateId } from "@/shared/lib/id";
import { FileType, FileOverlayState } from "@/types/caption";

// Hooks
import { useCanvasPaste } from "../hooks/useCanvasPaste";
import { useCanvasAi } from "../hooks/useCanvasAi";
import { useCanvasBanners } from "../hooks/useCanvasBanners";
import { getAllPropsForScene } from "../utils/canvasProps";

interface CanvasContainerProps {
  activeScene: SceneState;
  previousScene: SceneState | null;
  activeTransition: SceneTransition | null;
  isTransitioning: boolean;
  updateActiveScene: (updater: (scene: SceneState) => SceneState) => void;
  updateSceneProperty: (key: keyof SceneState, value: any) => void;
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  layoutManager: any;
  recording: any;
  onRecordingComplete: (session: RecordingSession) => void;
  uiState: {
    isFullscreen: boolean;
    onToggleFullscreen: () => void;
    isFsSidebarOpen: boolean;
    onFsSidebarToggle: (open: boolean) => void;
    isMouseActive: boolean;
    onOpenSessions: () => void;
    isDrawing: boolean;
  };
  savedOverlays: GeneratedOverlay[];
  setSavedOverlays: React.Dispatch<React.SetStateAction<GeneratedOverlay[]>>;
  dynamicLayout: any;
  setDynamicLayout: (layout: any) => void;
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
  canvasRef: React.RefObject<HTMLCanvasElement>;
  mainContainerRef: React.RefObject<HTMLDivElement> | ((node: HTMLDivElement) => void);
  isSettingsOpen: boolean;
  onSetSettingsOpen: (isOpen: boolean) => void;
  remoteStream?: MediaStream | null;
  isChatbotOpen: boolean;
  onChatbotToggle: React.Dispatch<React.SetStateAction<boolean>>;
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
  isSettingsOpen,
  onSetSettingsOpen,
  remoteStream,
  isChatbotOpen,
  onChatbotToggle,
}) => {
  const hasAiPopoverAutoOpenedRef = useRef(false);

  // --- Initialize Hooks ---

  // 1. Paste Support
  useCanvasPaste({
    activeScene,
    updateActiveScene,
    selection,
    isDrawing: uiState.isDrawing,
  });

  // 2. AI Support
  const { isProcessingAi, processTranscript } = useCanvasAi({
    activeScene,
    updateActiveScene,
    recording,
    setSavedOverlays,
  });

  // 3. Banner Support (Editing & Adding)
  const bannerLogic = useCanvasBanners({
    activeScene,
    updateActiveScene,
    selection,
  });

  // --- Core Handlers (that weren't complex enough for their own hook) ---

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
      console.log(`handleGridAssetSelect called for section ${sectionId}`, asset);
      updateActiveScene((scene) => {
        if (!scene.canvasLayout) {
          console.warn("No canvas layout found");
          return scene;
        }

        const sectionExists = scene.canvasLayout.sections.some(s => s.id === sectionId);
        if (!sectionExists) {
          console.error(`Section ${sectionId} not found in layout sections`, scene.canvasLayout.sections.map(s => s.id));
          toast.error(`Section ${sectionId} not found`);
          return scene;
        }

        const updatedCanvasLayout = {
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
        };
        console.log("Section updated, new content type set to image");
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
    selection.handleDeselectAll();
    selection.setSelectedTextId(newTextOverlay.id);
    toast.info("Text element added. Click to edit!");
  }, [activeScene.captionStyle, updateActiveScene, selection]);

  // --- Props Construction (Using Utility) ---

  const commonCallbacks = {
    updateSceneProperty,
    updateActiveScene,
    handleSetIsAudioOn,
    handleSetIsVideoOn,
    handleSetSelectedAudioDevice,
    handleSetSelectedVideoDevice,
    handleSetScreenShareMode,
    handleSetCaptionStyle,
    handleCustomMaskUpload,
    handleCanvasBackgroundUpload,
    handleGridAssetSelect,
    handleSectionCameraSettingsChange,
    onCanvasPresetSelect: layoutManager.handleCanvasPresetSelect,
    onSaveCanvasPreset: layoutManager.handleSaveCanvasPreset,
    onDeleteCanvasPreset: layoutManager.handleDeleteCanvasPreset,
    shareCanvasPreset: layoutManager.shareCanvasPreset,
    unshareCanvasPreset: layoutManager.unshareCanvasPreset,
    onAddSavedOverlay: (overlay: GeneratedOverlay) => {
      updateActiveScene((s) => ({
        ...s,
        activeOverlays: [
          ...s.activeOverlays,
          { ...overlay, id: generateId("overlay") },
        ],
      }));
      toast.success("Overlay added to canvas");
    },
    onDeleteSavedOverlay: (id: string) =>
      setSavedOverlays((prev) => prev.filter((o) => o.id !== id)),
    onBannerTextStyleChange: bannerLogic.handleBannerTextStyleChange,
    onBannerTextClose: bannerLogic.onBannerTextClose,
  };

  const commonData = {
    audioDevices,
    videoDevices,
    savedOverlays,
    customPresets: layoutManager.customPresets,
    publicPresets: layoutManager.publicPresets,
    isLoadingPublic: layoutManager.isLoadingPublic,
    editingBannerText: bannerLogic.editingBannerText,
    hasAiPopoverAutoOpenedRef,
  };

  const activeSceneProps = useMemo(
    () =>
      activeScene
        ? getAllPropsForScene(activeScene, commonCallbacks, commonData)
        : null,
    [activeScene, savedOverlays, layoutManager, bannerLogic.editingBannerText]
  );

  const previousSceneProps = useMemo(
    () =>
      previousScene
        ? getAllPropsForScene(previousScene, commonCallbacks, commonData)
        : null,
    [previousScene, savedOverlays, layoutManager, bannerLogic.editingBannerText]
  );

  // Note: We need to inject the add handlers into the calculated sidebarProps
  if (activeSceneProps?.sidebarProps) {
    // @ts-ignore - appending props that sidebar expects
    activeSceneProps.sidebarProps.onAddSocialBanner =
      bannerLogic.handleAddSocialBanner;
    // @ts-ignore
    activeSceneProps.sidebarProps.onAddAnimatedBanner =
      bannerLogic.handleAddAnimatedBanner;
    // @ts-ignore
    activeSceneProps.sidebarProps.onAddTextOverlay = handleAddTextOverlay;
  }

  const globalCanvasProps = {
    remoteStream,
    isChatbotOpen,
    onChatbotToggle,
    isFullscreen: uiState.isFullscreen,
    onToggleFullscreen: uiState.onToggleFullscreen,
    isFsSidebarOpen: uiState.isFsSidebarOpen,
    onFsSidebarToggle: uiState.onFsSidebarToggle,
    dynamicLayout,
    onOpenSessions: uiState.onOpenSessions,
    onOpenSettings: () => onSetSettingsOpen(!isSettingsOpen),
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
    onUpdateOverlayMetadata: (id: string, metadata: any) =>
      updateActiveScene((s) => ({
        ...s,
        activeOverlays: s.activeOverlays.map((o) =>
          o.id === id ? { ...o, metadata } : o
        ),
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
    onAddFile: (file: File) => {
      // Determine file type
      let fileType: FileType = "unknown";
      const name = file.name.toLowerCase();

      if (
        name.endsWith(".ply") ||
        name.endsWith(".splat") ||
        name.endsWith(".ksplat")
      ) {
        fileType = "3d";
      } else if (file.type.startsWith("image/")) fileType = "image";
      else if (file.type.startsWith("video/")) fileType = "video";
      else if (file.type === "application/pdf") fileType = "pdf";
      else if (file.type.startsWith("audio/")) fileType = "audio";
      else if (file.type.startsWith("text/")) fileType = "text";

      if (fileType !== "unknown") {
        const url = URL.createObjectURL(file);
        const newFileOverlay: FileOverlayState = {
          id: generateId("file"),
          file,
          fileName: file.name,
          fileType,
          fileUrl: url,
          layout: {
            position: { x: 30, y: 30 },
            size: { width: 40, height: 40 },
            zIndex: zIndex.draggableElement,
            rotation: 0,
            layerOrder: "above-video",
          },
        };

        updateActiveScene((prev) => ({
          ...prev,
          fileOverlays: [...prev.fileOverlays, newFileOverlay],
        }));

        selection.handleDeselectAll();
        selection.setSelectedFileId(newFileOverlay.id);
      }
    },
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
        onSetSettingsOpen(true);
        setTimeout(() => onSetSettingsOpen(false), 4000);
      }, 500);
    },
    onBannerDoubleClick: bannerLogic.handleBannerTextClick,
  };

  return (
    <>
      <FloatingControlsPanel
        isOpen={isSettingsOpen}
        onClose={() => onSetSettingsOpen(false)}
        isMouseActive={uiState.isMouseActive}
        {...activeSceneProps?.sidebarProps}
        onAddSocialBanner={bannerLogic.handleAddSocialBanner}
        onAddAnimatedBanner={bannerLogic.handleAddAnimatedBanner}
      />

      <div
        className={`fixed top-6 left-6 z-[2015] transition-opacity duration-300 ${uiState.isMouseActive
          ? "opacity-100"
          : "opacity-0 pointer-events-none"
          }`}
      >
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

      <SocialBannerEditor
        isOpen={bannerLogic.isBannerEditorOpen}
        onClose={() => bannerLogic.setIsBannerEditorOpen(false)}
        onSave={bannerLogic.handleSaveBanner}
        initialData={bannerLogic.bannerUserData}
      />
    </>
  );
};
