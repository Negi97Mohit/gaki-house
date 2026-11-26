import { StreamStyleTheme, StreamSceneType } from "@gaki/core/types/streamStyle";
import { CaptionStyle, CaptionShape, CaptionAnimation, LayoutMode, CameraShape } from "@gaki/core/types/caption";
import { GeneratedSceneDesign, createStyle } from "./types";

export function generateStartingSoonDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
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

export function generateLiveDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
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

export function generateBRBDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
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

