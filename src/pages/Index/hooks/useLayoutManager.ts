// src/pages/index/hooks/useLayoutManager.ts
import { useCallback } from "react";
import { useLayoutPresets } from "@/features/layouts/hooks/useLayoutPresets";
import { useCanvasPresets } from "@/features/canvas/hooks/useCanvasPresets";
import { usePublicPresets } from "@/hooks/usePublicPresets";
import { toast } from "sonner";
import {
  SceneState,
  DEFAULT_LAYOUT_STATE,
  DEFAULT_CAMERA_STATE,
  TextOverlayState,
  LayoutMode,
  CameraShape,
  CaptionShape,
  CaptionAnimation,
} from "@/types/caption";
import { CanvasPreset } from "@/types/canvasPreset";
import { LayoutPreset } from "@/types/layoutPreset";
import {
  getScreenSize,
  getResponsivePipLayout,
  getResponsiveTextLayout,
} from "@/lib/presetValidation";
import { generateId } from "@/shared/lib/id";

// Helper to generate IDs (same as in Index.tsx, duplicated for modularity or import if possible)
interface UseLayoutManagerProps {
  activeScene: SceneState;
  updateActiveScene: (updates: (scene: SceneState) => SceneState) => void;
  recording: any;
  // For UI state resetting
  setSelectedTextId: (id: string | null) => void;
  setSelectedFileId: (id: string | null) => void;
  setSelectedBrowserId: (id: string | null) => void;
}

export const useLayoutManager = ({
  activeScene,
  updateActiveScene,
  recording,
  setSelectedTextId,
  setSelectedFileId,
  setSelectedBrowserId,
}: UseLayoutManagerProps) => {
  // --- Hooks ---
  const { presets, savePreset, deletePreset } = useLayoutPresets();
  const {
    customPresets,
    saveCanvasPreset,
    deleteCanvasPreset,
    shareCanvasPreset,
    unshareCanvasPreset,
  } = useCanvasPresets();
  const { publicPresets, isLoading: isLoadingPublic } = usePublicPresets();

  // --- Canvas Preset Logic ---
  const handleSaveCanvasPreset = useCallback(
    (presetName: string) => {
      const preset: Omit<CanvasPreset, "id"> = {
        name: presetName,
        styleTags: ["custom"],
        background: {
          blankCanvasColor: activeScene.blankCanvasColor || "#000000",
          backgroundEffect:
            (activeScene.backgroundEffect === "image"
              ? "none"
              : activeScene.backgroundEffect) || "none",
        },
        pip: {
          layoutMode: activeScene.layoutMode,
          cameraShape: activeScene.cameraShape,
          splitRatio: activeScene.splitRatio,
          pipPosition: activeScene.pipPosition,
          pipSize: activeScene.pipSize,
          pipBorder: activeScene.pipBorder,
          pipShadow: activeScene.pipShadow,
        },
        textOverlays: activeScene.textOverlays.map((overlay) => ({
          id: overlay.id,
          content: overlay.content,
          style: {
            fontFamily: overlay.style.fontFamily,
            fontSize: overlay.style.fontSize,
            color: overlay.style.color,
            backgroundColor: overlay.style.backgroundColor,
            textShadow: overlay.style.textShadow || "none",
            textAlign:
              (overlay.style.textAlign as "left" | "center" | "right") ||
              "center",
            fontWeight: overlay.style.bold ? "bold" : "400",
          },
          layout: {
            position: overlay.layout.position,
            size: overlay.layout.size,
            zIndex: overlay.layout.zIndex,
            rotation: overlay.layout.rotation,
            layerOrder: "above-video",
          },
        })),
        effects: {
          videoFilter: activeScene.videoFilter,
          isBeautifyEnabled: activeScene.isBeautifyEnabled,
          isNeonEdgeEnabled: activeScene.isNeonEdgeEnabled,
          neonColor: (activeScene.neonColor || "cyan") as any,
          neonIntensity: activeScene.neonIntensity,
        },
        canvasAspectRatio: activeScene.canvasAspectRatio,
        canvasLayout: activeScene.canvasLayout,
      };

      saveCanvasPreset(preset);
      toast.success(`Canvas preset "${presetName}" saved!`);
    },
    [activeScene, saveCanvasPreset]
  );

  const handleDeleteCanvasPreset = useCallback(
    (id: string) => {
      deleteCanvasPreset(id);
      toast.success("Canvas preset deleted");
    },
    [deleteCanvasPreset]
  );

  const handleCanvasPresetSelect = useCallback(
    (preset: CanvasPreset) => {
      const screenSize = getScreenSize();
      updateActiveScene((scene) => {
        const newScene: SceneState = {
          ...scene,
          textOverlays: [],
          activeOverlays: [],
          browserOverlays: [],
          fileOverlays: [],
          blankCanvasColor: preset.background.blankCanvasColor,
          backgroundEffect: (preset.background.backgroundEffect === "blur" || preset.background.backgroundEffect === "image" ? preset.background.backgroundEffect : "none") as "none" | "blur" | "image",
          videoFilter: "none",
          isBeautifyEnabled: false,
          isNeonEdgeEnabled: false,
          ...getResponsivePipLayout(preset, screenSize),
          layoutMode: (preset.canvasLayout
            ? "pip"
            : preset.pip.layoutMode) as LayoutMode,
          cameraShape: preset.pip.cameraShape as CameraShape,
          splitRatio: preset.pip.splitRatio ?? DEFAULT_LAYOUT_STATE.splitRatio,
          pipBorder: preset.pip.pipBorder ?? DEFAULT_LAYOUT_STATE.pipBorder,
          pipShadow: preset.pip.pipShadow ?? DEFAULT_LAYOUT_STATE.pipShadow,
          canvasAspectRatio: preset.canvasAspectRatio ?? "16:9",
          canvasLayout: preset.canvasLayout || null,
          screenShareMode: (preset.canvasLayout
            ? "canvas"
            : preset.pip.layoutMode === "solo"
              ? "off"
              : "canvas") as any,
        };

        if (preset.effects.videoFilter)
          newScene.videoFilter = preset.effects.videoFilter;
        if (preset.effects.isBeautifyEnabled !== undefined)
          newScene.isBeautifyEnabled = preset.effects.isBeautifyEnabled;
        if (preset.effects.isNeonEdgeEnabled !== undefined)
          newScene.isNeonEdgeEnabled = preset.effects.isNeonEdgeEnabled;
        if (preset.effects.neonColor)
          newScene.neonColor = preset.effects.neonColor;
        if (preset.effects.neonIntensity !== undefined)
          newScene.neonIntensity = preset.effects.neonIntensity;

        // Force camera aspect ratio to "free" to allow custom PiP sizes to take effect
        // unless the preset explicitly defines a camera aspect ratio (which standard CanvasPreset doesn't usually do for PiP)
        newScene.cameraAspectRatio = "free";

        const newTextOverlays: TextOverlayState[] = preset.textOverlays.map(
          (textOverlay) => {
            const { position: responsivePosition, size: responsiveSize } =
              getResponsiveTextLayout(textOverlay, screenSize);

            const responsiveStyle =
              screenSize.type === "mobile" &&
                textOverlay.responsive?.mobile?.style
                ? textOverlay.responsive.mobile.style
                : screenSize.type === "tablet" &&
                  textOverlay.responsive?.tablet?.style
                  ? textOverlay.responsive.tablet.style
                  : null;

            const finalLayout = {
              position: responsivePosition,
              size: responsiveSize,
              zIndex: textOverlay.layout.zIndex,
              rotation: textOverlay.layout.rotation || 0,
            };

            const finalStyle = {
              fontFamily:
                responsiveStyle?.fontFamily ?? textOverlay.style.fontFamily,
              fontSize: responsiveStyle?.fontSize ?? textOverlay.style.fontSize,
              color: responsiveStyle?.color ?? textOverlay.style.color,
              backgroundColor:
                responsiveStyle?.backgroundColor ??
                textOverlay.style.backgroundColor,
              textShadow:
                responsiveStyle?.textShadow ?? textOverlay.style.textShadow,
              textAlign: (responsiveStyle?.textAlign ??
                textOverlay.style.textAlign) as any,
              fontWeight:
                responsiveStyle?.fontWeight ?? textOverlay.style.fontWeight,
            };

            return {
              id: generateId("text"),
              content: textOverlay.content.replace(/<[^>]+>/g, ""),
              style: {
                fontFamily: finalStyle.fontFamily,
                fontSize: finalStyle.fontSize,
                color: finalStyle.color,
                backgroundColor: finalStyle.backgroundColor,
                position: finalLayout.position,
                shape: "rounded" as CaptionShape,
                animation: "fade" as CaptionAnimation,
                outline: false,
                shadow: true,
                bold: false,
                italic: false,
                underline: false,
                textShadow: finalStyle.textShadow,
                rotation: finalLayout.rotation,
                border: !!textOverlay.style.border,
                borderColor: "#FFFFFF",
                borderWidth: 2,
              },
              layout: {
                position: finalLayout.position,
                size: finalLayout.size,
                zIndex: finalLayout.zIndex,
                rotation: finalLayout.rotation,
              },
            };
          }
        );

        newScene.textOverlays = newTextOverlays;
        return newScene;
      });

      // Reset selections
      setSelectedTextId(null);
      setSelectedFileId(null);
      setSelectedBrowserId(null);

      // Record change if recording
      setTimeout(() => {
        if (recording.isRecording) {
          const { pipPosition, pipSize, layoutMode } = getResponsivePipLayout(
            preset,
            screenSize
          );
          recording.recordLayoutChange({
            mode: layoutMode,
            cameraShape: preset.pip.cameraShape,
            splitRatio:
              preset.pip.splitRatio ?? DEFAULT_LAYOUT_STATE.splitRatio,
            pipPosition,
            pipSize,
            pipBorder: preset.pip.pipBorder ?? DEFAULT_LAYOUT_STATE.pipBorder,
            pipShadow: preset.pip.pipShadow ?? DEFAULT_LAYOUT_STATE.pipShadow,
          });
        }
      }, 50);

      toast.success(`"${preset.name}" preset applied!`);
    },
    [
      updateActiveScene,
      recording,
      setSelectedTextId,
      setSelectedFileId,
      setSelectedBrowserId,
    ]
  );

  // --- Layout Preset Logic (Scene-wide) ---
  const handleSaveLayout = useCallback(() => {
    const presetName = prompt("Name this layout preset:");
    if (!presetName) return;

    const preset: Omit<LayoutPreset, "id" | "createdAt"> = {
      name: presetName,
      captionStyle: activeScene.captionStyle,
      dynamicStyle: activeScene.dynamicStyle,
      layoutState: {
        mode: activeScene.layoutMode,
        cameraShape: activeScene.cameraShape,
        splitRatio: activeScene.splitRatio,
        pipPosition: activeScene.pipPosition,
        pipSize: activeScene.pipSize,
        pipRotation: activeScene.pipRotation,
        customMaskUrl: activeScene.customMaskUrl,
        pipBorder: activeScene.pipBorder,
        pipShadow: activeScene.pipShadow,
      },
      videoFilter: activeScene.videoFilter,
      backgroundEffect: activeScene.backgroundEffect,
      backgroundImageUrl: activeScene.backgroundImageUrl,
      htmlOverlays: activeScene.activeOverlays,
      fileOverlays: activeScene.fileOverlays,
      browserOverlays: activeScene.browserOverlays,
    };

    savePreset(preset);
    toast.success(`Layout "${presetName}" saved!`);
  }, [activeScene, savePreset]);

  const handleLoadPreset = useCallback(
    (preset: LayoutPreset) => {
      updateActiveScene((scene) => ({
        ...scene,
        captionStyle: preset.captionStyle,
        dynamicStyle: preset.dynamicStyle,
        layoutMode: preset.layoutState.mode,
        cameraShape: preset.layoutState.cameraShape,
        splitRatio: preset.layoutState.splitRatio,
        pipPosition: preset.layoutState.pipPosition,
        pipSize: preset.layoutState.pipSize,
        pipRotation: preset.layoutState.pipRotation,
        customMaskUrl: preset.layoutState.customMaskUrl,
        pipBorder: preset.layoutState.pipBorder,
        pipShadow: preset.layoutState.pipShadow,
        videoFilter: preset.videoFilter,
        backgroundEffect: preset.backgroundEffect,
        backgroundImageUrl: preset.backgroundImageUrl,
        activeOverlays: preset.htmlOverlays,
        fileOverlays: preset.fileOverlays,
        browserOverlays: preset.browserOverlays,
      }));
    },
    [updateActiveScene]
  );

  const handleDeletePreset = useCallback(
    (id: string) => {
      deletePreset(id);
    },
    [deletePreset]
  );

  return {
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
  };
};
