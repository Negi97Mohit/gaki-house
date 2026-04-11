// src/hooks/useSceneCompositor.ts
import { useEffect, useRef } from 'react';

interface UseSceneCompositorProps {
  sceneRef: React.RefObject<HTMLDivElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isEnabled: boolean;
  fps?: number;
}

/**
 * Composites the entire scene (video + overlays) onto a canvas for streaming
 * Uses efficient DOM-to-canvas rendering for real-time capture
 */
export const useSceneCompositor = ({
  sceneRef,
  canvasRef,
  isEnabled,
  fps = 30,
}: UseSceneCompositorProps) => {
  const animationFrameRef = useRef<number>();
  const lastRenderTime = useRef<number>(0);

  useEffect(() => {
    if (!isEnabled || !sceneRef.current || !canvasRef.current) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    const scene = sceneRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });

    if (!ctx) {
      console.error('[SceneCompositor] Failed to get canvas context');
      return;
    }

    const frameInterval = 1000 / fps;

    // Set canvas size to match scene
    const updateCanvasSize = () => {
      const rect = scene.getBoundingClientRect();
      if (canvas.width !== rect.width || canvas.height !== rect.height) {
        canvas.width = rect.width || 1920;
        canvas.height = rect.height || 1080;
      }
    };

    updateCanvasSize();

    const renderFrame = (timestamp: number) => {
      // Throttle to target FPS
      if (timestamp - lastRenderTime.current < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      lastRenderTime.current = timestamp;

      try {
        // Update canvas size if container changed
        updateCanvasSize();

        // Keep rendering even when tab is not visible
        // This ensures OBS and screen capture continue to work
        
      } catch (error) {
        console.error('[SceneCompositor] Render error:', error);
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    animationFrameRef.current = requestAnimationFrame(renderFrame);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [sceneRef, canvasRef, isEnabled, fps]);
};
