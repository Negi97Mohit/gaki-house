import { useEffect, useRef } from "react";
import { renderInteractiveFilters } from "@/lib/filterRenderer";

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
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Zoom/Pan State Refs
  const currentScale = useRef(1);
  const currentXOffset = useRef(0);
  const currentYOffset = useRef(0);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    // Handle Stream Attachment
    if (activeStream) {
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
        video.play().catch(console.error);
      }
    } else {
      if (video.srcObject) video.srcObject = null;
    }

    const renderFrame = () => {
      if (
        !video.srcObject ||
        video.paused ||
        video.ended ||
        video.videoWidth === 0
      ) {
        currentScale.current = 1;
        currentXOffset.current = 0;
        currentYOffset.current = 0;
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      // FIX: Default context (alpha: true) allows transparency for backgrounds
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Sync Canvas Size
      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sourceElement = processedCanvas || video;
      const sourceWidth = video.videoWidth || 1280;
      const sourceHeight = video.videoHeight || 720;
      const sourceAspect = sourceWidth / sourceHeight;
      const canvasAspect = canvas.width / canvas.height;

      // --- PAN/ZOOM CALCULATION ---
      const baseScale =
        canvasAspect > sourceAspect
          ? canvas.width / sourceWidth
          : canvas.height / sourceHeight;

      let targetScale = 1.0;
      let targetXOffset = 0.0;
      let targetYOffset = 0.0;

      if (isAutoFramingEnabled && facePosition) {
        const faceWidthPx = (facePosition.width / 100) * sourceWidth;
        const faceHeightPx = (facePosition.height / 100) * sourceHeight;
        const faceSizePx = Math.max(faceWidthPx, faceHeightPx);
        const faceScreenPercentage = 0.1 + (zoomSensitivity / 10) * 0.2;
        const targetFaceSizePx =
          Math.min(canvas.width, canvas.height) * faceScreenPercentage;

        targetScale = Math.min(5, Math.max(1, targetFaceSizePx / faceSizePx));
        targetXOffset = (50 - facePosition.x) / 100;
        targetYOffset = (50 - facePosition.y) / 100;
      } else if (isFaceTrackingEnabled && facePosition) {
        targetScale = 1.0;
        targetXOffset = (50 - facePosition.x) / 100;
        targetYOffset = (50 - facePosition.y) / 100;
      }

      // Smooth Transitions
      const zoomSpeed = 0.05;
      currentScale.current += (targetScale - currentScale.current) * zoomSpeed;
      currentXOffset.current +=
        (targetXOffset - currentXOffset.current) * trackingSpeed;
      currentYOffset.current +=
        (targetYOffset - currentYOffset.current) * trackingSpeed;

      // Final Draw Metrics
      const finalScale = baseScale * currentScale.current;
      const finalWidth = sourceWidth * finalScale;
      const finalHeight = sourceHeight * finalScale;

      let finalDrawX = (canvas.width - finalWidth) / 2;
      let finalDrawY = (canvas.height - finalHeight) / 2;

      const panAmountX = currentXOffset.current * finalWidth;
      const panAmountY = currentYOffset.current * finalHeight;
      const maxPanX = Math.max(0, (finalWidth - canvas.width) / 2);
      const maxPanY = Math.max(0, (finalHeight - canvas.height) / 2);

      finalDrawX += Math.max(-maxPanX, Math.min(maxPanX, panAmountX));
      finalDrawY += Math.max(-maxPanY, Math.min(maxPanY, panAmountY));

      // 1. Draw Base Video
      ctx.filter = videoFilter;
      ctx.drawImage(
        sourceElement,
        finalDrawX,
        finalDrawY,
        finalWidth,
        finalHeight
      );
      ctx.filter = "none";

      // 2. Draw Interactive Filters
      if (
        activeInteractiveFilter !== "none" ||
        (isNeonEdgeEnabled && activeInteractiveFilter === "none")
      ) {
        if (!tempCanvasRef.current) {
          tempCanvasRef.current = document.createElement("canvas");
        }

        renderInteractiveFilters({
          ctx,
          tempCanvas: tempCanvasRef.current,
          video,
          finalDrawX,
          finalDrawY,
          finalWidth,
          finalHeight,
          activeInteractiveFilter,
          currentTime: Date.now(),
          filterIntensity,
          filterColor,
          filterTarget,
          neonIntensity,
          neonColor,
          isNeonEdgeEnabled,
          processedCanvas,
        });
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    activeStream,
    canvasRef,
    videoRef,
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
};
