// src/hooks/useWebGLRenderLoop.ts
import { useEffect, useRef } from "react";
import { GLRenderer } from "@/lib/webgl/GLRenderer";

interface UseWebGLRenderLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  activeStream: MediaStream | null;

  videoFilter?: string;
  activeInteractiveFilter?: string;
  filterIntensity?: number;
  filterColor?: string;

  processedCanvas?: HTMLCanvasElement | null;
  backgroundEffect?: "none" | "blur" | "image";

  isAutoFramingEnabled?: boolean;
  isFaceTrackingEnabled?: boolean;
  zoomSensitivity?: number;
  trackingSpeed?: number;
}

export const useWebGLRenderLoop = ({
  canvasRef,
  videoRef,
  activeStream,
  videoFilter,
  activeInteractiveFilter,
  filterIntensity,
  filterColor,
  processedCanvas,
  backgroundEffect,
}: UseWebGLRenderLoopProps) => {
  const rendererRef = useRef<GLRenderer | null>(null);
  const animationFrameRef = useRef<number>();

  // 1. Manage Video Stream
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeStream) {
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
        video.play().catch(console.error);
      }
    } else {
      video.srcObject = null;
    }
  }, [activeStream, videoRef]);

  // 2. Initialize WebGL Renderer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      rendererRef.current = new GLRenderer(canvas);
      // console.log('[WebGL] Renderer initialized');
    } catch (e) {
      console.error("[WebGL] Initialization failed", e);
    }

    return () => {
      rendererRef.current?.destroy();
      rendererRef.current = null;
    };
  }, [canvasRef]);

  // 3. Render Loop
  useEffect(() => {
    const render = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const renderer = rendererRef.current;

      if (video && canvas && renderer && video.readyState >= 2) {
        // --- FIX 1: High DPI Handling for Crisp Video ---
        const dpr = window.devicePixelRatio || 1;
        // Measure display size
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        // Check if the canvas is not the same size
        const needResize =
          canvas.width !== Math.floor(displayWidth * dpr) ||
          canvas.height !== Math.floor(displayHeight * dpr);

        if (needResize) {
          // Make the canvas the same size as the display * pixel ratio
          canvas.width = Math.floor(displayWidth * dpr);
          canvas.height = Math.floor(displayHeight * dpr);
          renderer.resize(); // Notify renderer of new size
        }
        // -------------------------------------------------

        try {
          renderer.render(video, {
            videoFilter,
            activeInteractiveFilter,
            filterIntensity,
            filterColor,
            processedCanvas,
            backgroundEffect,
          });
        } catch (e) {
          console.error("[WebGL] Render error:", e);
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    videoFilter,
    activeInteractiveFilter,
    filterIntensity,
    filterColor,
    processedCanvas,
    backgroundEffect,
  ]);
};
