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
  backgroundImageUrl?: string; // ADDED

  facePositionRef?: React.MutableRefObject<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;

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
  backgroundImageUrl,
  facePositionRef,
  isAutoFramingEnabled,
  zoomSensitivity,
  trackingSpeed,
}: UseWebGLRenderLoopProps) => {
  const rendererRef = useRef<GLRenderer | null>(null);
  const animationFrameRef = useRef<number>();
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const debugCounter = useRef(0);

  // Load Background Image if needed
  useEffect(() => {
    if (backgroundEffect === "image" && backgroundImageUrl) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = backgroundImageUrl;
      img.onload = () => {
        bgImageRef.current = img;
        console.log("[WebGL] Background image loaded:", backgroundImageUrl);
      };
    } else {
      bgImageRef.current = null;
    }
  }, [backgroundEffect, backgroundImageUrl]);

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
        const dpr = window.devicePixelRatio || 1;
        const displayWidth = canvas.clientWidth;
        const displayHeight = canvas.clientHeight;

        if (
          canvas.width !== Math.floor(displayWidth * dpr) ||
          canvas.height !== Math.floor(displayHeight * dpr)
        ) {
          canvas.width = Math.floor(displayWidth * dpr);
          canvas.height = Math.floor(displayHeight * dpr);
          renderer.resize();
        }

        // Debug Log
        debugCounter.current++;
        if (debugCounter.current % 180 === 0) {
          if (backgroundEffect && backgroundEffect !== "none") {
            console.log(
              `[BackgroundDebug] Rendering composite. Effect: ${backgroundEffect}, Mask Ready: ${!!processedCanvas}`
            );
          }
        }

        try {
          renderer.render(video, {
            videoFilter,
            activeInteractiveFilter,
            filterIntensity,
            filterColor,
            processedCanvas,
            backgroundEffect,
            backgroundImage: bgImageRef.current,
            // Auto-framing props
            facePosition: facePositionRef?.current,
            isAutoFramingEnabled,
            zoomSensitivity,
            trackingSpeed,
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
    isAutoFramingEnabled,
    zoomSensitivity,
    trackingSpeed,
  ]);
};
