import { useCallback } from "react";
import { toast } from "sonner";
import { generateId } from "@/shared/lib/id";
import { zIndex } from "@/lib/zIndex";
import { generateHtmlFromPreset } from "@/lib/animationGenerator";
import { generateGSAPHtml } from "@/lib/gsapHtmlGenerator";
import { AnimationPreset } from "@/types/animation";
import { GSAPPreset } from "@/lib/gsapAnimations";
import { GeneratedOverlay, TextOverlayState } from "@/types/caption";
import { SceneState } from "@/types/editor";

interface UseOverlayHandlersProps {
  activeScene: SceneState;
  updateActiveScene: (updater: (prev: SceneState) => SceneState) => void;
  recording: any; // Ideally strictly typed
  selection: {
    selectedTextId: string | null;
    setSelectedTextId: (id: string | null) => void;
    selectedFileId: string | null;
    setSelectedFileId: (id: string | null) => void;
    selectedBrowserId: string | null;
    setSelectedBrowserId: (id: string | null) => void;
    selectedGeneratedId: string | null;
    setSelectedGeneratedId: (id: string | null) => void;
  };
  setShowAnimationLibrary: (show: boolean) => void;
  bringToFront: (id: string, type: string) => void;
  sendToBack: (id: string, type: string) => void;
  bringForward: (id: string, type: string) => void;
  sendBackward: (id: string, type: string) => void;
}

export const useOverlayHandlers = ({
  activeScene,
  updateActiveScene,
  recording,
  selection,
  setShowAnimationLibrary,
  bringToFront,
  sendToBack,
  bringForward,
  sendBackward,
}: UseOverlayHandlersProps) => {
  const {
    selectedTextId,
    setSelectedTextId,
    selectedFileId,
    setSelectedFileId,
    selectedBrowserId,
    setSelectedBrowserId,
    selectedGeneratedId,
    setSelectedGeneratedId,
  } = selection;

  const handleDeleteSelected = useCallback(() => {
    if (selectedTextId) {
      updateActiveScene((s) => ({
        ...s,
        textOverlays: s.textOverlays.filter((o) => o.id !== selectedTextId),
      }));
      setSelectedTextId(null);
      toast.success("Text deleted");
    } else if (selectedFileId) {
      updateActiveScene((s) => ({
        ...s,
        fileOverlays: s.fileOverlays.filter((o) => o.id !== selectedFileId),
      }));
      setSelectedFileId(null);
      toast.success("File deleted");
    } else if (selectedBrowserId) {
      updateActiveScene((s) => ({
        ...s,
        browserOverlays: s.browserOverlays.filter(
          (o) => o.id !== selectedBrowserId
        ),
      }));
      setSelectedBrowserId(null);
      toast.success("Browser deleted");
    } else if (selectedGeneratedId) {
      updateActiveScene((s) => ({
        ...s,
        activeOverlays: s.activeOverlays.filter(
          (o) => o.id !== selectedGeneratedId
        ),
      }));
      setSelectedGeneratedId(null);
      toast.success("Overlay deleted");
    }
  }, [
    selectedTextId,
    selectedFileId,
    selectedBrowserId,
    selectedGeneratedId,
    updateActiveScene,
    setSelectedTextId,
    setSelectedFileId,
    setSelectedBrowserId,
    setSelectedGeneratedId,
  ]);

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
    setSelectedTextId(newTextOverlay.id);
    toast.info("Text element added. Click to edit!");
  }, [activeScene?.captionStyle, updateActiveScene, setSelectedTextId]);

  const handleSelectAnimation = useCallback(
    (preset: AnimationPreset) => {
      const htmlContent = generateHtmlFromPreset(preset);
      const newOverlay: GeneratedOverlay = {
        id: generateId("overlay"),
        name: preset.name,
        htmlContent,
        layout: {
          position: { x: 30, y: 40 },
          size: { width: 40, height: 20 },
          zIndex: zIndex.draggableElement,
          rotation: 0,
          layerOrder: "above-video",
        },
        preview: "",
      };
      updateActiveScene((scene) => ({
        ...scene,
        activeOverlays: [...scene.activeOverlays, newOverlay],
      }));
      if (recording.isRecording) recording.recordHtmlOverlay(newOverlay);

      setSelectedBrowserId(null);
      setSelectedFileId(null);
      setSelectedTextId(null);
      setSelectedGeneratedId(newOverlay.id);

      toast.success(`Added "${preset.name}" to canvas`);
      setShowAnimationLibrary(false);
    },
    [
      updateActiveScene,
      recording,
      setSelectedBrowserId,
      setSelectedFileId,
      setSelectedTextId,
      setSelectedGeneratedId,
      setShowAnimationLibrary,
    ]
  );

  const handleSelectGSAPAnimation = useCallback(
    (preset: GSAPPreset, customText?: string, customColor?: string) => {
      const displayText = customText || preset.name;
      const textColor = customColor || preset.config.color || "#FFFFFF";
      const htmlContent = generateGSAPHtml(
        preset,
        displayText,
        preset.description,
        {
          fontFamily: preset.config.fontFamily || "Inter",
          fontSize: preset.config.fontSize || 48,
          color: textColor,
          backgroundColor: "transparent",
          textAlign: "center",
        }
      );
      const newOverlay: GeneratedOverlay = {
        id: generateId("gsap-overlay"),
        name: `${preset.name} (Pro)`,
        htmlContent,
        layout: {
          position: { x: 25, y: 35 },
          size: { width: 50, height: 30 },
          zIndex: zIndex.draggableElement,
          rotation: 0,
          layerOrder: "above-video",
        },
        preview: "",
      };
      updateActiveScene((scene) => ({
        ...scene,
        activeOverlays: [...scene.activeOverlays, newOverlay],
      }));
      if (recording.isRecording) recording.recordHtmlOverlay(newOverlay);

      setSelectedBrowserId(null);
      setSelectedFileId(null);
      setSelectedTextId(null);
      setSelectedGeneratedId(newOverlay.id);

      toast.success(`Added "${displayText}" animation to canvas`);
    },
    [
      updateActiveScene,
      recording,
      setSelectedBrowserId,
      setSelectedFileId,
      setSelectedTextId,
      setSelectedGeneratedId,
    ]
  );

  // Layer Actions
  const handleBringToFront = useCallback(() => {
    if (selectedTextId) bringToFront(selectedTextId, "text");
    if (selectedFileId) bringToFront(selectedFileId, "file");
    if (selectedBrowserId) bringToFront(selectedBrowserId, "browser");
    if (selectedGeneratedId) bringToFront(selectedGeneratedId, "generated");
  }, [
    selectedTextId,
    selectedFileId,
    selectedBrowserId,
    selectedGeneratedId,
    bringToFront,
  ]);

  const handleSendToBack = useCallback(() => {
    if (selectedTextId) sendToBack(selectedTextId, "text");
    if (selectedFileId) sendToBack(selectedFileId, "file");
    if (selectedBrowserId) sendToBack(selectedBrowserId, "browser");
    if (selectedGeneratedId) sendToBack(selectedGeneratedId, "generated");
  }, [
    selectedTextId,
    selectedFileId,
    selectedBrowserId,
    selectedGeneratedId,
    sendToBack,
  ]);

  const handleBringForward = useCallback(() => {
    if (selectedTextId) bringForward(selectedTextId, "text");
    if (selectedFileId) bringForward(selectedFileId, "file");
    if (selectedBrowserId) bringForward(selectedBrowserId, "browser");
    if (selectedGeneratedId) bringForward(selectedGeneratedId, "generated");
  }, [
    selectedTextId,
    selectedFileId,
    selectedBrowserId,
    selectedGeneratedId,
    bringForward,
  ]);

  const handleSendBackward = useCallback(() => {
    if (selectedTextId) sendBackward(selectedTextId, "text");
    if (selectedFileId) sendBackward(selectedFileId, "file");
    if (selectedBrowserId) sendBackward(selectedBrowserId, "browser");
    if (selectedGeneratedId) sendBackward(selectedGeneratedId, "generated");
  }, [
    selectedTextId,
    selectedFileId,
    selectedBrowserId,
    selectedGeneratedId,
    sendBackward,
  ]);

  return {
    handleDeleteSelected,
    handleAddTextOverlay,
    handleSelectAnimation,
    handleSelectGSAPAnimation,
    handleBringToFront,
    handleSendToBack,
    handleBringForward,
    handleSendBackward,
  };
};
