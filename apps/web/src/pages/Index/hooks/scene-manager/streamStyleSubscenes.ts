import type {
  SubSceneState,
  TextOverlayState,
  CaptionShape,
  CaptionAnimation,
  LayoutMode,
  CameraShape,
} from "@gaki/core/types/caption";
import type { StreamStylePreset } from "@gaki/core/types/streamStyle";
import { GeneratedSceneDesign, generateAllSceneDesigns } from "@/lib/streamSceneDesigns";
import { generateSubsceneId } from "./sceneDefaults";

export function buildSubscenesFromStreamStyle(
  preset: StreamStylePreset,
  parentSceneId: string,
): SubSceneState[] {
  const generatedDesigns = generateAllSceneDesigns(preset.theme, preset.id);
  const newSubscenes: SubSceneState[] = [];

  generatedDesigns.forEach((design: GeneratedSceneDesign, index: number) => {
    const subsceneId = generateSubsceneId();

    const textOverlays: TextOverlayState[] = design.textOverlays.map((overlay, i) => ({
      id: `${subsceneId}-text-${i}-${Date.now()}`,
      content: overlay.content,
      style: {
        fontFamily: overlay.style.fontFamily,
        fontSize: overlay.style.fontSize,
        color: overlay.style.color,
        backgroundColor: overlay.style.backgroundColor || "transparent",
        position: overlay.style.position,
        shape: overlay.style.shape || ("rounded" as CaptionShape),
        animation: overlay.style.animation || ("fade" as CaptionAnimation),
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
    }));

    const newSubscene: SubSceneState = {
      id: subsceneId,
      name: design.name,
      parentId: parentSceneId,
      order: index,
      canvasPreset: {
        id: design.id,
        name: design.name,
        blankCanvasColor: design.blankCanvasColor,
        backgroundEffect: design.backgroundEffect,
        backgroundImageUrl: design.backgroundGradient,
        layoutMode: (["solo", "split-vertical", "split-horizontal", "pip"].includes(design.layoutMode)
          ? design.layoutMode
          : "pip") as LayoutMode,
        cameraShape: design.cameraShape as CameraShape,
        pipPosition: design.pipPosition,
        pipSize: design.pipSize,
        pipBorder: design.pipBorder,
        pipShadow: design.pipShadow
          ? { blur: 20, color: design.pipShadow }
          : undefined,
        videoFilter: design.videoFilter,
        textOverlays,
        canvasAspectRatio: design.canvasAspectRatio,
      },
    };

    newSubscenes.push(newSubscene);
  });

  return newSubscenes;
}
