import {
  SceneState,
  GeneratedOverlay,
  CanvasLayoutState,
  CanvasSectionCameraState,
  DEFAULT_CAMERA_STATE,
  LayoutMode,
  CameraShape,
  CaptionStyle,
} from "@/types/caption";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { toast } from "sonner";
import { generateId } from "@/shared/lib/id";

// Helper to clone overlay with new ID
const newOverlay = (overlay: GeneratedOverlay) => ({
  ...overlay,
  id: generateId("overlay"),
});

interface CanvasCallbacks {
  updateSceneProperty: (key: keyof SceneState, value: any) => void;
  updateActiveScene: (updater: (scene: SceneState) => SceneState) => void;
  handleSetIsAudioOn: (val: boolean) => void;
  handleSetIsVideoOn: (val: boolean) => void;
  handleSetSelectedAudioDevice: (val: string) => void;
  handleSetSelectedVideoDevice: (val: string) => void;
  handleSetScreenShareMode: (val: "off" | "screen" | "canvas") => void;
  handleSetCaptionStyle: (val: CaptionStyle) => void;
  handleCustomMaskUpload: (file: File) => void;
  handleCanvasBackgroundUpload: (file: File) => void;
  handleGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
  handleSectionCameraSettingsChange: (
    sectionId: string,
    settings: Partial<CanvasSectionCameraState>
  ) => void;
  onCanvasPresetSelect: (layout: any) => void;
  onSaveCanvasPreset: (name: string, layout: any) => void;
  onDeleteCanvasPreset: (id: string) => void;
  shareCanvasPreset: (id: string) => void;
  unshareCanvasPreset: (id: string) => void;
  onAddSavedOverlay: (overlay: GeneratedOverlay) => void;
  onDeleteSavedOverlay: (id: string) => void;
  onBannerTextStyleChange: (style: React.CSSProperties) => void;
  onBannerTextClose: () => void;
}

interface CanvasData {
  audioDevices: MediaDeviceInfo[];
  videoDevices: MediaDeviceInfo[];
  savedOverlays: GeneratedOverlay[];
  customPresets: any[]; // Replace with CanvasPreset[] if type available
  publicPresets: any[];
  isLoadingPublic: boolean;
  editingBannerText: {
    overlayId: string;
    field: "name" | "tagline";
    currentText: string;
    style: React.CSSProperties;
  } | null;
  hasAiPopoverAutoOpenedRef: React.MutableRefObject<boolean>;
}

export const getAllPropsForScene = (
  scene: SceneState,
  callbacks: CanvasCallbacks,
  data: CanvasData
) => {
  return {
    sceneId: scene.id,
    isAudioOn: scene.isAudioOn,
    onAudioToggle: callbacks.handleSetIsAudioOn,
    isVideoOn: scene.isVideoOn,
    onVideoToggle: callbacks.handleSetIsVideoOn,
    selectedVideoDevice: scene.selectedVideoDevice,
    onVideoDeviceSelect: callbacks.handleSetSelectedVideoDevice,
    selectedAudioDevice: scene.selectedAudioDevice,
    onAudioDeviceSelect: callbacks.handleSetSelectedAudioDevice,
    isAiModeEnabled: scene.isAiModeEnabled,
    onAiModeToggle: (val: boolean) =>
      callbacks.updateSceneProperty("isAiModeEnabled", val),
    aiButtonPosition: scene.aiButtonPosition,
    onAiButtonPositionChange: (pos: { x: number; y: number }) =>
      callbacks.updateSceneProperty("aiButtonPosition", pos),
    generatedOverlays: scene.activeOverlays,
    browserOverlays: scene.browserOverlays,
    fileOverlays: scene.fileOverlays,
    textOverlays: scene.textOverlays,
    captionsEnabled: scene.captionsEnabled,
    onCaptionsToggle: (val: boolean) =>
      callbacks.updateSceneProperty("captionsEnabled", val),
    liveCaptionStyle: scene.captionStyle,
    onStyleChange: callbacks.handleSetCaptionStyle,
    dynamicStyle: scene.dynamicStyle,
    onCaptionLayoutChange: (layout: any) => {
      const updatedStyle = {
        ...scene.captionStyle,
        position: layout.position ?? scene.captionStyle.position,
        // Check for layout.width (direct) OR layout.size.width (nested)
        width: layout.width ?? layout.size?.width ?? scene.captionStyle.width,
      };
      callbacks.handleSetCaptionStyle(updatedStyle);
    },
    layoutMode: scene.layoutMode,
    cameraShape: scene.cameraShape,
    splitRatio: scene.splitRatio,
    pipPosition: scene.pipPosition,
    pipSize: scene.pipSize,
    onLayoutModeChange: (val: LayoutMode) =>
      callbacks.updateSceneProperty("layoutMode", val),
    onCameraShapeChange: (val: CameraShape) =>
      callbacks.updateSceneProperty("cameraShape", val),
    onSplitRatioChange: (val: number) =>
      callbacks.updateSceneProperty("splitRatio", val),
    onPipPositionChange: (val: any) =>
      callbacks.updateSceneProperty("pipPosition", val),
    onPipSizeChange: (val: any) =>
      callbacks.updateSceneProperty("pipSize", val),
    pipRotation: scene.pipRotation,
    onPipRotationChange: (val: number) =>
      callbacks.updateSceneProperty("pipRotation", val),
    pipBorder: scene.pipBorder,
    pipShadow: scene.pipShadow,
    customMaskUrl: scene.customMaskUrl,
    onCustomMaskUpload: callbacks.handleCustomMaskUpload,
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
    onScreenShareModeChange: callbacks.handleSetScreenShareMode,
    canvasLayout: scene.canvasLayout,
    activeSequenceId: scene.activeSequenceId,
    onSetSectionDefault: (id: string) => {
      callbacks.updateActiveScene((s) => {
        if (!s.canvasLayout) return s;
        const sections = s.canvasLayout.sections.map((sec) =>
          sec.id === id ? { ...sec, defaultContent: sec.content } : sec
        );
        return { ...s, canvasLayout: { ...s.canvasLayout, sections } };
      });
    },
    onUserPositionChange: () => {},
    onCanvasLayoutChange: (layout: CanvasLayoutState | null) => {
      callbacks.updateActiveScene((s) => ({ ...s, canvasLayout: layout }));
    },
    onCanvasBackgroundUpload: callbacks.handleCanvasBackgroundUpload,
    onGridAssetSelect: callbacks.handleGridAssetSelect,
    onCanvasBackgroundAssetSelect: (asset: AssetResult) => {
      callbacks.updateSceneProperty("backgroundImageUrl", asset.downloadUrl);
      callbacks.updateSceneProperty("backgroundEffect", "image");
    },
    hasAiPopoverAutoOpenedRef: data.hasAiPopoverAutoOpenedRef,
    audioDevices: data.audioDevices,
    videoDevices: data.videoDevices,
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
      onStyleChange: callbacks.handleSetCaptionStyle,
      onDynamicStyleChange: (val: string) =>
        callbacks.updateSceneProperty("dynamicStyle", val),
      onBlankCanvasColorChange: (val: string) =>
        callbacks.updateSceneProperty("blankCanvasColor", val),
      onBackgroundEffectChange: (val: any) =>
        callbacks.updateSceneProperty("backgroundEffect", val),
      onBackgroundImageUrlChange: (val: string) =>
        callbacks.updateSceneProperty("backgroundImageUrl", val),
      pipBorder: scene.pipBorder,
      onPipBorderChange: (val: any) =>
        callbacks.updateSceneProperty("pipBorder", val),
      pipShadow: scene.pipShadow,
      onPipShadowChange: (val: any) =>
        callbacks.updateSceneProperty("pipShadow", val),
      onAutoFramingChange: (val: boolean) =>
        callbacks.updateSceneProperty("isAutoFramingEnabled", val),
      onZoomSensitivityChange: (val: number) =>
        callbacks.updateSceneProperty("zoomSensitivity", val),
      onTrackingSpeedChange: (val: number) =>
        callbacks.updateSceneProperty("trackingSpeed", val),
      onBeautifyToggle: (val: boolean) =>
        callbacks.updateSceneProperty("isBeautifyEnabled", val),
      onLowLightToggle: (val: boolean) =>
        callbacks.updateSceneProperty("isLowLightEnabled", val),
      onVideoFilterChange: (val: string) =>
        callbacks.updateSceneProperty("videoFilter", val),
      onNeonEdgeToggle: (val: boolean) =>
        callbacks.updateSceneProperty("isNeonEdgeEnabled", val),
      onNeonIntensityChange: (val: number) =>
        callbacks.updateSceneProperty("neonIntensity", val),
      onNeonColorChange: (val: string) =>
        callbacks.updateSceneProperty("neonColor", val),
      activeInteractiveFilter: scene.activeInteractiveFilter,
      onInteractiveFilterChange: (val: any) =>
        callbacks.updateSceneProperty("activeInteractiveFilter", val),
      filterIntensity: scene.filterIntensity,
      onFilterIntensityChange: (val: number) =>
        callbacks.updateSceneProperty("filterIntensity", val),
      filterColor: scene.filterColor,
      onFilterColorChange: (val: string) =>
        callbacks.updateSceneProperty("filterColor", val),
      filterTarget: scene.filterTarget,
      onFilterTargetChange: (val: any) =>
        callbacks.updateSceneProperty("filterTarget", val),
      savedOverlays: data.savedOverlays,
      onCanvasBackgroundUpload: callbacks.handleCanvasBackgroundUpload,
      onAddSavedOverlay: callbacks.onAddSavedOverlay,
      onDeleteSavedOverlay: callbacks.onDeleteSavedOverlay,
      cameraBackground: scene.cameraBackground,
      onCameraBackgroundChange: (val: any) =>
        callbacks.updateSceneProperty("cameraBackground", val),
      onCustomBackgroundUpload: (file: File) => {
        const url = URL.createObjectURL(file);
        callbacks.updateActiveScene((s) => ({
          ...s,
          cameraBackground: "image",
          customBackgroundUrl: url,
        }));
      },
      cameraAspectRatio: scene.cameraAspectRatio,
      onCameraAspectRatioChange: (val: string) =>
        callbacks.updateSceneProperty("cameraAspectRatio", val),
      canvasAspectRatio: scene.canvasAspectRatio,
      onCanvasAspectRatioChange: (val: string) =>
        callbacks.updateSceneProperty("canvasAspectRatio", val),
      customAspectRatio: scene.customAspectRatio,
      onCustomAspectRatioChange: (val: string) =>
        callbacks.updateSceneProperty("customAspectRatio", val),
      isFaceTrackingEnabled: scene.isFaceTrackingEnabled,
      onFaceTrackingToggle: (val: boolean) =>
        callbacks.updateSceneProperty("isFaceTrackingEnabled", val),
      onCanvasPresetSelect: callbacks.onCanvasPresetSelect,
      selectedDeviceId: scene.selectedVideoDevice,
      // Pass through layout manager props
      onSaveCanvasPreset: callbacks.onSaveCanvasPreset,
      customCanvasPresets: data.customPresets,
      onDeleteCanvasPreset: callbacks.onDeleteCanvasPreset,
      publicPresets: data.publicPresets,
      isLoadingPublic: data.isLoadingPublic,
      onShareCanvasPreset: callbacks.shareCanvasPreset,
      onUnshareCanvasPreset: callbacks.unshareCanvasPreset,
    },
    // Inline Banner Editing
    editingBannerText: data.editingBannerText,
    onBannerTextStyleChange: callbacks.onBannerTextStyleChange,
    onBannerTextClose: callbacks.onBannerTextClose,
  };
};
