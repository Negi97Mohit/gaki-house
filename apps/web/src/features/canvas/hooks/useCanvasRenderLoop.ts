import { useEffect, useRef } from "react";
import { GLRenderer } from "@caption-cam/engine/kernel/engine/GLRenderer";

// Worker import (Vite syntax)
import CanvasWorker from "../workers/canvas.worker?worker";

interface UseCanvasRenderLoopProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  videoRef: React.RefObject<HTMLVideoElement>;
  activeStream: MediaStream | null;
  processedCanvas: HTMLCanvasElement | null;
  facePosition: { x: number; y: number; width: number; height: number } | null;

  // Settings
  isAutoFramingEnabled: boolean;
  isFaceTrackingEnabled: boolean;
  zoomSensitivity: number;
  trackingSpeed: number;
  videoFilter: string;

  // Filter Props
  activeInteractiveFilter?: string;
  filterIntensity?: number;
  filterColor?: string;
  filterTarget?: "both" | "background" | "person";
  isNeonEdgeEnabled?: boolean;
  neonIntensity?: number;
  neonColor?: string;
}

export const useCanvasRenderLoop = ({
  canvasRef,
  videoRef,
  activeStream,
  processedCanvas,
  facePosition,
  isAutoFramingEnabled,
  isFaceTrackingEnabled,
  zoomSensitivity,
  trackingSpeed,
  videoFilter,
  activeInteractiveFilter = "none",
  filterIntensity,
  filterColor,
  filterTarget,
  isNeonEdgeEnabled,
  neonIntensity,
  neonColor,
}: UseCanvasRenderLoopProps) => {
  const animationFrameRef = useRef<number>();
  const workerRef = useRef<Worker | null>(null);
  const rendererRef = useRef<GLRenderer | null>(null);
  const isOffscreenTransferred = useRef(false);

  // 1. Sync options (Mutable Ref)
  const optionsRef = useRef({
    processedCanvas,
    facePosition,
    isAutoFramingEnabled,
    isFaceTrackingEnabled,
    zoomSensitivity,
    trackingSpeed,
    videoFilter,
    activeInteractiveFilter,
    filterIntensity,
    filterColor,
    filterTarget,
    isNeonEdgeEnabled,
    neonIntensity,
    neonColor,
  });

  useEffect(() => {
    optionsRef.current = {
      processedCanvas,
      facePosition,
      isAutoFramingEnabled,
      isFaceTrackingEnabled,
      zoomSensitivity,
      trackingSpeed,
      videoFilter,
      activeInteractiveFilter,
      filterIntensity,
      filterColor,
      filterTarget,
      isNeonEdgeEnabled,
      neonIntensity,
      neonColor,
    };
  }, [
    processedCanvas,
    facePosition,
    isAutoFramingEnabled,
    isFaceTrackingEnabled,
    zoomSensitivity,
    trackingSpeed,
    videoFilter,
    activeInteractiveFilter,
    filterIntensity,
    filterColor,
    filterTarget,
    isNeonEdgeEnabled,
    neonIntensity,
    neonColor,
  ]);

  // 2. Stream Attachment
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (activeStream) {
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
        video.play().catch(console.error);
      }
    } else {
      if (video.srcObject) video.srcObject = null;
    }
  }, [activeStream, videoRef]);

  // 3. Render Loop (Worker or Main Thread)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Detect OffscreenCanvas support
    const supportsOffscreen = !!canvas.transferControlToOffscreen;

    // --- WORKER MODE (Fast) ---
    if (supportsOffscreen && !rendererRef.current) {
      if (!workerRef.current) {
        workerRef.current = new CanvasWorker();
      }

      // Transfer control ONLY ONCE
      if (!isOffscreenTransferred.current) {
        const offscreen = canvas.transferControlToOffscreen();
        workerRef.current.postMessage(
          { type: "init", payload: { canvas: offscreen } },
          [offscreen]
        );
        isOffscreenTransferred.current = true;
      }

      const renderWorkerFrame = async () => {
        const video = videoRef.current;
        const opts = optionsRef.current;
        const worker = workerRef.current;

        if (
          !video ||
          !worker ||
          video.paused ||
          video.ended ||
          !video.videoWidth
        ) {
          animationFrameRef.current = requestAnimationFrame(renderWorkerFrame);
          return;
        }

        // Logic preparation
        let effectiveFilter = opts.activeInteractiveFilter || "none";
        let effectiveColor = opts.filterColor;
        let effectiveIntensity = opts.filterIntensity;

        if (effectiveFilter === "none" && opts.isNeonEdgeEnabled) {
          effectiveFilter = "neon-edge";
          effectiveColor = opts.neonColor;
          effectiveIntensity = opts.neonIntensity;
        }

        // Create bitmap (Fast, prevents main thread jank)
        try {
          const bitmap = await createImageBitmap(video);

          // Send to worker
          worker.postMessage(
            {
              type: "render",
              payload: {
                bitmap,
                options: {
                  videoFilter: opts.videoFilter,
                  activeInteractiveFilter: effectiveFilter,
                  filterIntensity: effectiveIntensity,
                  filterColor: effectiveColor,
                  // Note: processedCanvas (mask) usually can't be sent easily if it's a DOM element.
                  // For advanced masking in workers, you'd need to bitmap that too.
                  // For now, we assume basic video or worker-compatible masking.
                  facePosition: opts.facePosition,
                  isAutoFramingEnabled:
                    opts.isAutoFramingEnabled || opts.isFaceTrackingEnabled,
                  zoomSensitivity: opts.zoomSensitivity,
                  trackingSpeed: opts.trackingSpeed,
                  filterTarget: opts.filterTarget,
                  isMasked:
                    !!opts.processedCanvas && opts.filterTarget !== "both",
                },
              },
            },
            [bitmap] // Transfer bitmap ownership to worker
          );
        } catch (e) {
          // Ignore bitmap creation errors (video might not be ready)
        }

        animationFrameRef.current = requestAnimationFrame(renderWorkerFrame);
      };

      renderWorkerFrame();
    }
    // --- FALLBACK MAIN THREAD MODE (Compatibility) ---
    else if (!isOffscreenTransferred.current) {
      if (!rendererRef.current) {
        rendererRef.current = new GLRenderer(canvas);
      }
      const renderer = rendererRef.current;

      const renderMainFrame = () => {
        const video = videoRef.current;
        const opts = optionsRef.current;

        if (!video || video.paused || video.ended || !video.videoWidth) {
          animationFrameRef.current = requestAnimationFrame(renderMainFrame);
          return;
        }

        if (
          canvas.width !== canvas.clientWidth ||
          canvas.height !== canvas.clientHeight
        ) {
          renderer.resize();
        }

        let effectiveFilter = opts.activeInteractiveFilter || "none";
        let effectiveColor = opts.filterColor;
        let effectiveIntensity = opts.filterIntensity;

        if (effectiveFilter === "none" && opts.isNeonEdgeEnabled) {
          effectiveFilter = "neon-edge";
          effectiveColor = opts.neonColor;
          effectiveIntensity = opts.neonIntensity;
        }

        renderer.render(video, {
          videoFilter: opts.videoFilter,
          activeInteractiveFilter: effectiveFilter,
          filterIntensity: effectiveIntensity,
          filterColor: effectiveColor,
          processedCanvas: opts.processedCanvas,
          facePosition: opts.facePosition,
          isAutoFramingEnabled:
            opts.isAutoFramingEnabled || opts.isFaceTrackingEnabled,
          zoomSensitivity: opts.zoomSensitivity,
          trackingSpeed: opts.trackingSpeed,
          isMasked: !!opts.processedCanvas && opts.filterTarget !== "both",
          filterTarget: opts.filterTarget,
        });

        animationFrameRef.current = requestAnimationFrame(renderMainFrame);
      };
      renderMainFrame();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      // Note: We generally don't terminate the worker immediately if we expect
      // the component to remount often, but cleaner cleanup is good.
      if (rendererRef.current) {
        rendererRef.current.destroy();
        rendererRef.current = null;
      }
    };
  }, []); // Runs once
};
