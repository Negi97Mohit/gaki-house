import { StreamStyleTheme, StreamSceneType } from "@gaki/core/types/streamStyle";
import { CaptionStyle, CaptionShape, CaptionAnimation, LayoutMode, CameraShape } from "@gaki/core/types/caption";

export interface GeneratedSceneDesign {
  id: string;
  name: string;
  sceneType: StreamSceneType;
  blankCanvasColor: string;
  backgroundGradient?: string;
  backgroundEffect: 'none' | 'blur' | 'image';
  layoutMode: LayoutMode;
  cameraShape: CameraShape;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  pipBorder: { color: string; width: number };
  pipShadow?: string;
  videoFilter: string;
  textOverlays: SceneTextOverlay[];
  canvasAspectRatio: string;
  hasParticles?: boolean;
  hasGlow?: boolean;
  hasScanlines?: boolean;
}

export interface SceneTextOverlay {
  id: string;
  content: string;
  style: CaptionStyle;
  layout: { position: { x: number; y: number }; size: { width: number; height: number }; zIndex: number; rotation: number };
}

// Helper to create a full CaptionStyle with defaults
export function createStyle(partial: Partial<CaptionStyle> & { fontFamily: string; fontSize: number; color: string; position: { x: number; y: number } }): CaptionStyle {
  return {
    fontFamily: partial.fontFamily,
    fontSize: partial.fontSize,
    color: partial.color,
    backgroundColor: partial.backgroundColor || 'transparent',
    position: partial.position,
    shape: partial.shape || 'rounded',
    animation: partial.animation || 'fade',
    outline: partial.outline ?? false,
    shadow: partial.shadow ?? false,
    bold: partial.bold ?? false,
    italic: partial.italic ?? false,
    underline: partial.underline ?? false,
    textShadow: partial.textShadow,
    rotation: partial.rotation ?? 0,
    border: partial.border ?? false,
    borderColor: partial.borderColor || '#FFFFFF',
    borderWidth: partial.borderWidth ?? 0,
    letterSpacing: partial.letterSpacing,
    padding: partial.padding,
    textAlign: partial.textAlign,
  };
}

