import { StreamStyleTheme, StreamSceneType } from "@gaki/core/types/streamStyle";
import { CaptionStyle, CaptionShape, CaptionAnimation, LayoutMode, CameraShape } from "@gaki/core/types/caption";
import { GeneratedSceneDesign, createStyle } from "./types";

export function generateIntermissionDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
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

export function generateEndingDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
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

export function generateOfflineDesign(theme: StreamStyleTheme, styleId: string): GeneratedSceneDesign {
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

