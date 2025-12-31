// src/hooks/useWebGLRenderLoop.ts
import { useEffect, useRef } from "react";
import { GLRenderer } from "@/kernel/engine/GLRenderer";

interface UseWebGLRenderLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  activeStream: MediaStream | null;

  videoFilter?: string;
  activeInteractiveFilter?: string;
  filterIntensity?: number;
  filterColor?: string;

  processedCanvas?: HTMLCanvasElement | null;
  // Removed backgroundEffect props

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
  isMasked?: boolean;
}

// Store latest props in a ref to avoid restarting the loop
export const useWebGLRenderLoop = ({
  canvasRef,
  videoRef,
  activeStream,
  videoFilter,
  activeInteractiveFilter,
  filterIntensity,
  filterColor,
  processedCanvas,
  facePositionRef,
  isAutoFramingEnabled,
  zoomSensitivity,
  trackingSpeed,
  isMasked,
}: UseWebGLRenderLoopProps) => {
  const propsRef = useRef(
    {
      videoFilter,
      activeInteractiveFilter,
      filterIntensity,
      filterColor,
      processedCanvas,
      facePositionRef,
      isAutoFramingEnabled,
      zoomSensitivity,
      trackingSpeed,
      isMasked,
    }
  );

  useEffect(() => {
    propsRef.current = {
      videoFilter,
      activeInteractiveFilter,
      filterIntensity,
      filterColor,
      processedCanvas,
      facePositionRef,
      isAutoFramingEnabled,
      zoomSensitivity,
      trackingSpeed,
      isMasked,
    };
  }, [
    videoFilter,
    activeInteractiveFilter,
    filterIntensity,
    filterColor,
    processedCanvas,
    facePositionRef,
    isAutoFramingEnabled,
    zoomSensitivity,
    trackingSpeed,
    isMasked,
  ]);

  const rendererRef = useRef<GLRenderer | null>(null);
  const animationFrameRef = useRef<number>();

  // 1. Manage Video Stream
  useEffect(() => {
    // If we don't own the stream management (e.g. shared video ref), skip this.
    // However, for the loop to work, the video must be playing.
    // We assume the owner handles playing.
    const video = videoRef.current;
    if (!video || activeStream === undefined) return;

    if (activeStream) {
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
        video.play().catch(console.error);
      }
    } else {
      video.srcObject = null;
      // Clear the canvas to transparent so the background is visible
      if (rendererRef.current) {
        rendererRef.current.ctx.clear();
      }
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

        const currentProps = propsRef.current;

        try {
          renderer.render(video, {
            videoFilter: currentProps.videoFilter,
            activeInteractiveFilter: currentProps.activeInteractiveFilter,
            filterIntensity: currentProps.filterIntensity,
            filterColor: currentProps.filterColor,
            processedCanvas: currentProps.processedCanvas,
            facePosition: currentProps.facePositionRef?.current,
            isAutoFramingEnabled: currentProps.isAutoFramingEnabled,
            zoomSensitivity: currentProps.zoomSensitivity,
            trackingSpeed: currentProps.trackingSpeed,
            isMasked: currentProps.isMasked,
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
  }, []); // Empty dependency array: loop runs continuously
};
