import { StreamStyleTheme, StreamSceneType } from "@gaki/core/types/streamStyle";
import { CaptionStyle, CaptionShape, CaptionAnimation, LayoutMode, CameraShape } from "@gaki/core/types/caption";
import { GeneratedSceneDesign, SceneTextOverlay } from "./stream-scene-designs/types";
import { generateStartingSoonDesign, generateLiveDesign, generateBRBDesign } from "./stream-scene-designs/live-scenes";
import { generateIntermissionDesign, generateEndingDesign, generateOfflineDesign } from "./stream-scene-designs/outro-scenes";

export type { GeneratedSceneDesign, SceneTextOverlay };

export function generateAllSceneDesigns(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign[] {
  return [
    generateStartingSoonDesign(theme, styleId),
    generateLiveDesign(theme, styleId),
    generateBRBDesign(theme, styleId),
    generateIntermissionDesign(theme, styleId),
    generateEndingDesign(theme, styleId),
    generateOfflineDesign(theme, styleId),
  ];
}

export function generateSceneDesign(theme: StreamStyleTheme, styleId: string, sceneType: StreamSceneType): GeneratedSceneDesign {
  switch (sceneType) {
    case 'starting-soon': return generateStartingSoonDesign(theme, styleId);
    case 'live': return generateLiveDesign(theme, styleId);
    case 'brb': return generateBRBDesign(theme, styleId);
    case 'intermission': return generateIntermissionDesign(theme, styleId);
    case 'ending': return generateEndingDesign(theme, styleId);
    case 'offline': return generateOfflineDesign(theme, styleId);
  }
}
