// src/lib/streamSceneDesigns.ts
// Unique, hand-crafted canvas designs for each stream scene type

import { StreamStyleTheme, StreamSceneType } from "@caption-cam/core/types/streamStyle";
import { CaptionStyle, CaptionShape, CaptionAnimation, LayoutMode, CameraShape } from "@caption-cam/core/types/caption";

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
function createStyle(partial: Partial<CaptionStyle> & { fontFamily: string; fontSize: number; color: string; position: { x: number; y: number } }): CaptionStyle {
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

// ========== STARTING SOON DESIGNS ==========
function generateStartingSoonDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
  const baseId = `${styleId}-starting-soon`;
  
  switch (theme.category) {
    case 'anime':
      return {
        id: baseId,
        name: 'Starting Soon',
        sceneType: 'starting-soon',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `linear-gradient(135deg, ${theme.colors.primary}20 0%, ${theme.colors.background} 50%, ${theme.colors.secondary}20 100%)`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasParticles: true,
        hasGlow: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'STARTING SOON',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 56,
              color: theme.colors.text,
              position: { x: 50, y: 35 },
              shadow: true,
              bold: true,
              textShadow: `0 0 30px ${theme.colors.glow || theme.colors.primary}`,
            }),
            layout: { position: { x: 50, y: 35 }, size: { width: 80, height: 15 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-subtitle`,
            content: '✿ stream begins shortly ✿',
            style: createStyle({
              fontFamily: theme.fonts.body,
              fontSize: 24,
              color: theme.colors.secondary,
              position: { x: 50, y: 55 },
              italic: true,
            }),
            layout: { position: { x: 50, y: 55 }, size: { width: 60, height: 8 }, zIndex: 19, rotation: 0 }
          }
        ],
      };

    case 'neon':
      return {
        id: baseId,
        name: 'Starting Soon',
        sceneType: 'starting-soon',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `radial-gradient(ellipse at center, ${theme.colors.background} 0%, #000000 100%)`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasScanlines: true,
        hasGlow: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'STARTING SOON',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 64,
              color: theme.colors.primary,
              position: { x: 50, y: 40 },
              shadow: true,
              bold: true,
              textShadow: `0 0 20px ${theme.colors.primary}, 0 0 40px ${theme.colors.primary}, 0 0 60px ${theme.colors.primary}`,
            }),
            layout: { position: { x: 50, y: 40 }, size: { width: 90, height: 18 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-glitch`,
            content: '[ LOADING... ]',
            style: createStyle({
              fontFamily: 'monospace',
              fontSize: 18,
              color: theme.colors.secondary,
              position: { x: 50, y: 60 },
            }),
            layout: { position: { x: 50, y: 60 }, size: { width: 40, height: 6 }, zIndex: 19, rotation: 0 }
          }
        ],
      };

    case 'gaming':
      return {
        id: baseId,
        name: 'Starting Soon',
        sceneType: 'starting-soon',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.primary}15 100%)`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rounded',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 4 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasGlow: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'STARTING SOON',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 72,
              color: theme.colors.text,
              position: { x: 50, y: 35 },
              bold: true,
              textShadow: `4px 4px 0 ${theme.colors.primary}`,
            }),
            layout: { position: { x: 50, y: 35 }, size: { width: 85, height: 20 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-bar`,
            content: '▸ GET READY ◂',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 20,
              color: theme.colors.accent,
              backgroundColor: `${theme.colors.primary}40`,
              position: { x: 50, y: 58 },
              shape: 'banner',
            }),
            layout: { position: { x: 50, y: 58 }, size: { width: 40, height: 8 }, zIndex: 19, rotation: 0 }
          }
        ],
      };

    default:
      return {
        id: baseId,
        name: 'Starting Soon',
        sceneType: 'starting-soon',
        blankCanvasColor: theme.colors.background,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'Starting Soon',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 48,
              color: theme.colors.text,
              position: { x: 50, y: 45 },
            }),
            layout: { position: { x: 50, y: 45 }, size: { width: 60, height: 12 }, zIndex: 20, rotation: 0 }
          }
        ]
      };
  }
}

// ========== LIVE SCENE DESIGNS ==========
function generateLiveDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
  const baseId = `${styleId}-live`;
  
  switch (theme.category) {
    case 'anime':
      return {
        id: baseId,
        name: 'Live',
        sceneType: 'live',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `linear-gradient(45deg, ${theme.colors.primary}10 0%, transparent 50%, ${theme.colors.secondary}10 100%)`,
        backgroundEffect: 'blur',
        layoutMode: 'pip',
        cameraShape: 'circle',
        pipPosition: { x: 80, y: 78 },
        pipSize: { width: 28, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 4 },
        pipShadow: `0 0 25px ${theme.colors.glow || theme.colors.primary}`,
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasParticles: true,
        textOverlays: [
          {
            id: `${baseId}-live-badge`,
            content: '● LIVE',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 16,
              color: '#FFFFFF',
              backgroundColor: '#FF0040',
              position: { x: 8, y: 6 },
              shape: 'pill',
              bold: true,
            }),
            layout: { position: { x: 8, y: 6 }, size: { width: 12, height: 5 }, zIndex: 25, rotation: 0 }
          }
        ]
      };

    case 'neon':
      return {
        id: baseId,
        name: 'Live',
        sceneType: 'live',
        blankCanvasColor: '#0a0a0f',
        backgroundEffect: 'blur',
        layoutMode: 'pip',
        cameraShape: 'rectangle',
        pipPosition: { x: 82, y: 75 },
        pipSize: { width: 30, height: 38 },
        pipBorder: { color: theme.colors.primary, width: 3 },
        pipShadow: `0 0 30px ${theme.colors.primary}, inset 0 0 20px ${theme.colors.primary}40`,
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasScanlines: true,
        hasGlow: true,
        textOverlays: [
          {
            id: `${baseId}-live-badge`,
            content: '◉ LIVE',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 14,
              color: theme.colors.primary,
              position: { x: 6, y: 5 },
              shape: 'rectangular',
              textShadow: `0 0 10px ${theme.colors.primary}`,
              border: true,
              borderColor: theme.colors.primary,
              borderWidth: 1,
            }),
            layout: { position: { x: 6, y: 5 }, size: { width: 10, height: 4 }, zIndex: 25, rotation: 0 }
          },
          {
            id: `${baseId}-hud`,
            content: 'STREAM ACTIVE',
            style: createStyle({
              fontFamily: 'monospace',
              fontSize: 10,
              color: theme.colors.secondary,
              position: { x: 94, y: 5 },
            }),
            layout: { position: { x: 94, y: 5 }, size: { width: 15, height: 3 }, zIndex: 24, rotation: 0 }
          }
        ]
      };

    case 'gaming':
      return {
        id: baseId,
        name: 'Live',
        sceneType: 'live',
        blankCanvasColor: theme.colors.background,
        backgroundEffect: 'blur',
        layoutMode: 'pip',
        cameraShape: 'rounded',
        pipPosition: { x: 85, y: 80 },
        pipSize: { width: 25, height: 32 },
        pipBorder: { color: theme.colors.primary, width: 4 },
        pipShadow: `0 8px 32px ${theme.colors.primary}60`,
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasGlow: true,
        textOverlays: [
          {
            id: `${baseId}-live-badge`,
            content: '▶ LIVE',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 18,
              color: '#FFFFFF',
              backgroundColor: theme.colors.primary,
              position: { x: 7, y: 5 },
              shape: 'banner',
              bold: true,
            }),
            layout: { position: { x: 7, y: 5 }, size: { width: 12, height: 6 }, zIndex: 25, rotation: 0 }
          }
        ]
      };

    default:
      return {
        id: baseId,
        name: 'Live',
        sceneType: 'live',
        blankCanvasColor: theme.colors.background,
        backgroundEffect: 'blur',
        layoutMode: 'pip',
        cameraShape: 'rounded',
        pipPosition: { x: 80, y: 78 },
        pipSize: { width: 25, height: 30 },
        pipBorder: { color: theme.colors.primary, width: 2 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-live-badge`,
            content: '● LIVE',
            style: createStyle({
              fontFamily: theme.fonts.body,
              fontSize: 14,
              color: '#FFFFFF',
              backgroundColor: '#E53935',
              position: { x: 5, y: 5 },
              shape: 'pill',
            }),
            layout: { position: { x: 5, y: 5 }, size: { width: 10, height: 4 }, zIndex: 25, rotation: 0 }
          }
        ]
      };
  }
}

// ========== BRB DESIGNS ==========
function generateBRBDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
  const baseId = `${styleId}-brb`;
  
  switch (theme.category) {
    case 'anime':
      return {
        id: baseId,
        name: 'Be Right Back',
        sceneType: 'brb',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `radial-gradient(circle at 30% 70%, ${theme.colors.secondary}30 0%, transparent 50%)`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasParticles: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'Be Right Back',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 52,
              color: theme.colors.text,
              position: { x: 50, y: 40 },
              italic: true,
              textShadow: `0 0 40px ${theme.colors.glow || theme.colors.primary}`,
            }),
            layout: { position: { x: 50, y: 40 }, size: { width: 70, height: 14 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-emoji`,
            content: '☕ taking a short break ☕',
            style: createStyle({
              fontFamily: theme.fonts.body,
              fontSize: 20,
              color: theme.colors.secondary,
              position: { x: 50, y: 58 },
            }),
            layout: { position: { x: 50, y: 58 }, size: { width: 50, height: 6 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    case 'neon':
      return {
        id: baseId,
        name: 'Be Right Back',
        sceneType: 'brb',
        blankCanvasColor: '#05050a',
        backgroundGradient: `linear-gradient(180deg, ${theme.colors.background} 0%, #000 100%)`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasScanlines: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'BRB',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 120,
              color: theme.colors.secondary,
              position: { x: 50, y: 42 },
              shape: 'rectangular',
              textShadow: `0 0 30px ${theme.colors.secondary}, 0 0 60px ${theme.colors.secondary}`,
            }),
            layout: { position: { x: 50, y: 42 }, size: { width: 60, height: 30 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-status`,
            content: '// AWAY FROM KEYBOARD',
            style: createStyle({
              fontFamily: 'monospace',
              fontSize: 14,
              color: theme.colors.primary,
              position: { x: 50, y: 68 },
            }),
            layout: { position: { x: 50, y: 68 }, size: { width: 40, height: 5 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    case 'gaming':
      return {
        id: baseId,
        name: 'Be Right Back',
        sceneType: 'brb',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `linear-gradient(135deg, ${theme.colors.background} 0%, ${theme.colors.secondary}15 100%)`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'BRB',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 96,
              color: theme.colors.text,
              position: { x: 50, y: 38 },
              bold: true,
              textShadow: `6px 6px 0 ${theme.colors.primary}`,
            }),
            layout: { position: { x: 50, y: 38 }, size: { width: 50, height: 25 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-bar`,
            content: '◀ PAUSED ▶',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 22,
              color: theme.colors.accent,
              backgroundColor: `${theme.colors.primary}50`,
              position: { x: 50, y: 62 },
              shape: 'banner',
            }),
            layout: { position: { x: 50, y: 62 }, size: { width: 30, height: 8 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    default:
      return {
        id: baseId,
        name: 'Be Right Back',
        sceneType: 'brb',
        blankCanvasColor: theme.colors.background,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'Be Right Back',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 44,
              color: theme.colors.text,
              position: { x: 50, y: 45 },
            }),
            layout: { position: { x: 50, y: 45 }, size: { width: 60, height: 12 }, zIndex: 20, rotation: 0 }
          }
        ]
      };
  }
}

// ========== INTERMISSION DESIGNS ==========
function generateIntermissionDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
  const baseId = `${styleId}-intermission`;
  
  switch (theme.category) {
    case 'anime':
      return {
        id: baseId,
        name: 'Intermission',
        sceneType: 'intermission',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `linear-gradient(to bottom, ${theme.colors.primary}15, ${theme.colors.background}, ${theme.colors.secondary}15)`,
        backgroundEffect: 'blur',
        layoutMode: 'pip',
        cameraShape: 'rounded',
        pipPosition: { x: 25, y: 65 },
        pipSize: { width: 35, height: 45 },
        pipBorder: { color: theme.colors.accent, width: 5 },
        pipShadow: `0 0 40px ${theme.colors.glow || theme.colors.primary}`,
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasParticles: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: '~ Intermission ~',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 38,
              color: theme.colors.text,
              position: { x: 70, y: 25 },
              textShadow: `0 0 20px ${theme.colors.glow || theme.colors.primary}`,
            }),
            layout: { position: { x: 70, y: 25 }, size: { width: 50, height: 10 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-chat`,
            content: 'chat with us!',
            style: createStyle({
              fontFamily: theme.fonts.body,
              fontSize: 22,
              color: theme.colors.secondary,
              position: { x: 70, y: 40 },
            }),
            layout: { position: { x: 70, y: 40 }, size: { width: 40, height: 6 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    case 'neon':
      return {
        id: baseId,
        name: 'Intermission',
        sceneType: 'intermission',
        blankCanvasColor: '#08080f',
        backgroundEffect: 'blur',
        layoutMode: 'pip',
        cameraShape: 'rectangle',
        pipPosition: { x: 25, y: 55 },
        pipSize: { width: 40, height: 50 },
        pipBorder: { color: theme.colors.secondary, width: 2 },
        pipShadow: `0 0 25px ${theme.colors.secondary}`,
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasScanlines: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'INTERMISSION',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 42,
              color: theme.colors.primary,
              position: { x: 72, y: 20 },
              textShadow: `0 0 15px ${theme.colors.primary}, 0 0 30px ${theme.colors.primary}`,
            }),
            layout: { position: { x: 72, y: 20 }, size: { width: 45, height: 12 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-line`,
            content: '─────────────────',
            style: createStyle({
              fontFamily: 'monospace',
              fontSize: 16,
              color: theme.colors.secondary,
              position: { x: 72, y: 32 },
            }),
            layout: { position: { x: 72, y: 32 }, size: { width: 40, height: 4 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    case 'gaming':
      return {
        id: baseId,
        name: 'Intermission',
        sceneType: 'intermission',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `linear-gradient(90deg, ${theme.colors.primary}20 0%, transparent 50%)`,
        backgroundEffect: 'blur',
        layoutMode: 'pip',
        cameraShape: 'rounded',
        pipPosition: { x: 20, y: 55 },
        pipSize: { width: 32, height: 42 },
        pipBorder: { color: theme.colors.primary, width: 4 },
        pipShadow: `0 10px 40px ${theme.colors.primary}50`,
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'INTERMISSION',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 52,
              color: theme.colors.text,
              position: { x: 65, y: 30 },
              bold: true,
              textShadow: `4px 4px 0 ${theme.colors.primary}`,
            }),
            layout: { position: { x: 65, y: 30 }, size: { width: 55, height: 14 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-sub`,
            content: '▸ BREAK TIME ◂',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 20,
              color: theme.colors.accent,
              backgroundColor: `${theme.colors.primary}40`,
              position: { x: 65, y: 48 },
            }),
            layout: { position: { x: 65, y: 48 }, size: { width: 30, height: 7 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    default:
      return {
        id: baseId,
        name: 'Intermission',
        sceneType: 'intermission',
        blankCanvasColor: theme.colors.background,
        backgroundEffect: 'blur',
        layoutMode: 'pip',
        cameraShape: 'rounded',
        pipPosition: { x: 25, y: 55 },
        pipSize: { width: 35, height: 45 },
        pipBorder: { color: theme.colors.primary, width: 2 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'Intermission',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 40,
              color: theme.colors.text,
              position: { x: 70, y: 35 },
            }),
            layout: { position: { x: 70, y: 35 }, size: { width: 45, height: 10 }, zIndex: 20, rotation: 0 }
          }
        ]
      };
  }
}

// ========== ENDING DESIGNS ==========
function generateEndingDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
  const baseId = `${styleId}-ending`;
  
  switch (theme.category) {
    case 'anime':
      return {
        id: baseId,
        name: 'Ending Soon',
        sceneType: 'ending',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `radial-gradient(ellipse at bottom, ${theme.colors.secondary}25, ${theme.colors.background})`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasParticles: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'Thanks for Watching!',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 46,
              color: theme.colors.text,
              position: { x: 50, y: 35 },
              textShadow: `0 0 30px ${theme.colors.glow || theme.colors.primary}`,
            }),
            layout: { position: { x: 50, y: 35 }, size: { width: 80, height: 14 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-bye`,
            content: '✿ see you next time! ✿',
            style: createStyle({
              fontFamily: theme.fonts.body,
              fontSize: 22,
              color: theme.colors.secondary,
              position: { x: 50, y: 55 },
              italic: true,
            }),
            layout: { position: { x: 50, y: 55 }, size: { width: 50, height: 6 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    case 'neon':
      return {
        id: baseId,
        name: 'Ending Soon',
        sceneType: 'ending',
        blankCanvasColor: '#030308',
        backgroundGradient: `linear-gradient(180deg, ${theme.colors.background} 0%, #000 100%)`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        hasScanlines: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'STREAM ENDING',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 56,
              color: theme.colors.accent,
              position: { x: 50, y: 38 },
              textShadow: `0 0 25px ${theme.colors.accent}, 0 0 50px ${theme.colors.accent}`,
            }),
            layout: { position: { x: 50, y: 38 }, size: { width: 75, height: 16 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-thanks`,
            content: '[ THANKS FOR WATCHING ]',
            style: createStyle({
              fontFamily: 'monospace',
              fontSize: 16,
              color: theme.colors.primary,
              position: { x: 50, y: 58 },
            }),
            layout: { position: { x: 50, y: 58 }, size: { width: 45, height: 5 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    case 'gaming':
      return {
        id: baseId,
        name: 'Ending Soon',
        sceneType: 'ending',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `linear-gradient(135deg, ${theme.colors.accent}15 0%, transparent 100%)`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'GG!',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 100,
              color: theme.colors.text,
              position: { x: 50, y: 35 },
              bold: true,
              textShadow: `6px 6px 0 ${theme.colors.primary}`,
            }),
            layout: { position: { x: 50, y: 35 }, size: { width: 40, height: 28 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-thanks`,
            content: '▸ THANKS FOR WATCHING ◂',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 24,
              color: theme.colors.accent,
              backgroundColor: `${theme.colors.primary}40`,
              position: { x: 50, y: 62 },
            }),
            layout: { position: { x: 50, y: 62 }, size: { width: 50, height: 9 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    default:
      return {
        id: baseId,
        name: 'Ending Soon',
        sceneType: 'ending',
        blankCanvasColor: theme.colors.background,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'none',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'Thanks for Watching',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 42,
              color: theme.colors.text,
              position: { x: 50, y: 45 },
            }),
            layout: { position: { x: 50, y: 45 }, size: { width: 60, height: 12 }, zIndex: 20, rotation: 0 }
          }
        ]
      };
  }
}

// ========== OFFLINE DESIGNS ==========
function generateOfflineDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
  const baseId = `${styleId}-offline`;
  
  switch (theme.category) {
    case 'anime':
      return {
        id: baseId,
        name: 'Offline',
        sceneType: 'offline',
        blankCanvasColor: theme.colors.background,
        backgroundGradient: `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.primary}08 100%)`,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'grayscale',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'Currently Offline',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 48,
              color: theme.colors.text,
              position: { x: 50, y: 40 },
              textShadow: `0 0 20px ${theme.colors.glow || theme.colors.primary}40`,
            }),
            layout: { position: { x: 50, y: 40 }, size: { width: 65, height: 14 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-follow`,
            content: '♡ follow for notifications ♡',
            style: createStyle({
              fontFamily: theme.fonts.body,
              fontSize: 20,
              color: theme.colors.secondary,
              position: { x: 50, y: 58 },
            }),
            layout: { position: { x: 50, y: 58 }, size: { width: 50, height: 6 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    case 'neon':
      return {
        id: baseId,
        name: 'Offline',
        sceneType: 'offline',
        blankCanvasColor: '#020204',
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'grayscale',
        canvasAspectRatio: '16:9',
        hasScanlines: true,
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'OFFLINE',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 80,
              color: '#555555',
              position: { x: 50, y: 42 },
              textShadow: `0 0 10px #333`,
            }),
            layout: { position: { x: 50, y: 42 }, size: { width: 60, height: 22 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-signal`,
            content: '// NO SIGNAL',
            style: createStyle({
              fontFamily: 'monospace',
              fontSize: 14,
              color: '#444',
              position: { x: 50, y: 62 },
            }),
            layout: { position: { x: 50, y: 62 }, size: { width: 25, height: 4 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    case 'gaming':
      return {
        id: baseId,
        name: 'Offline',
        sceneType: 'offline',
        blankCanvasColor: theme.colors.background,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'grayscale',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'OFFLINE',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 88,
              color: '#666',
              position: { x: 50, y: 38 },
              bold: true,
              textShadow: `4px 4px 0 #333`,
            }),
            layout: { position: { x: 50, y: 38 }, size: { width: 55, height: 24 }, zIndex: 20, rotation: 0 }
          },
          {
            id: `${baseId}-follow`,
            content: '◀ FOLLOW FOR UPDATES ▶',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 18,
              color: '#888',
              backgroundColor: '#333',
              position: { x: 50, y: 60 },
            }),
            layout: { position: { x: 50, y: 60 }, size: { width: 45, height: 7 }, zIndex: 19, rotation: 0 }
          }
        ]
      };

    default:
      return {
        id: baseId,
        name: 'Offline',
        sceneType: 'offline',
        blankCanvasColor: theme.colors.background,
        backgroundEffect: 'none',
        layoutMode: 'solo',
        cameraShape: 'rectangle',
        pipPosition: { x: 50, y: 50 },
        pipSize: { width: 30, height: 35 },
        pipBorder: { color: theme.colors.primary, width: 0 },
        videoFilter: 'grayscale',
        canvasAspectRatio: '16:9',
        textOverlays: [
          {
            id: `${baseId}-title`,
            content: 'Currently Offline',
            style: createStyle({
              fontFamily: theme.fonts.heading,
              fontSize: 40,
              color: '#888',
              position: { x: 50, y: 45 },
            }),
            layout: { position: { x: 50, y: 45 }, size: { width: 55, height: 12 }, zIndex: 20, rotation: 0 }
          }
        ]
      };
  }
}

// ========== MAIN GENERATOR ==========
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
