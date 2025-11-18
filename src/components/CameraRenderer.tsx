// src/components/CameraRenderer.tsx
import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { PipControlsToolbar } from "./PipControlsToolbar";
import { VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  detectEdges,
  applyHologramEffect,
  applyPixelEffect,
  applyComicEffect,
  applyASCIIEffect,
  applyThermalEffect,
  applyMirrorEffect,
  applyKaleidoscopeEffect,
  applyOilPaintEffect,
  applySketchEffect,
  applyPrismEffect,
  applyVHSEffect,
  applyInfraredEffect,
  applyXRayEffect,
  applyCyberpunkEffect,
} from "@/lib/effects";

// --- PROPS INTERFACE (Fully updated) ---
interface CameraRendererProps {
  stream: MediaStream | null;
  className?: string;
  style?: React.CSSProperties;
  videoFilter: string;
  isNeonEdgeEnabled: boolean;
  neonIntensity: number;
  neonColor: string;
  cameraBackground?: "none" | "blur" | "image";
  customBackgroundUrl?: string | null;
  isFaceTrackingEnabled?: boolean; // This prop is now overridden by isAutoFramingEnabled
  cameraAspectRatio?: string;

  // --- All Toolbar Props ---
  pipBorder?: { color: string; width: number };
  onPipBorderChange: (border: { color: string; width: number }) => void;
  pipShadow?: { blur: number; color: string };
  onPipShadowChange: (shadow: { blur: number; color: string }) => void;
  isAutoFramingEnabled: boolean;
  onAutoFramingChange: (enabled: boolean) => void;
  isBeautifyEnabled: boolean;
  onBeautifyToggle: (enabled: boolean) => void;
  isLowLightEnabled: boolean;
  onLowLightToggle: (enabled: boolean) => void;
  onVideoFilterChange: (filter: string) => void;
  onNeonEdgeToggle: (enabled: boolean) => void;
  onNeonIntensityChange: (value: number) => void;
  onNeonEdgeColorChange: (color: string) => void;
  zoomSensitivity: number;
  onZoomSensitivityChange: (value: number) => void;
  trackingSpeed: number;
  onTrackingSpeedChange: (value: number) => void;
  // New interactive filters
  activeInteractiveFilter?:
    | "none"
    | "neon-edge"
    | "hologram"
    | "pixel"
    | "comic"
    | "ascii"
    | "thermal"
    | "mirror"
    | "kaleidoscope"
    | "oil-paint"
    | "sketch"
    | "prism"
    | "vhs"
    | "infrared"
    | "xray"
    | "cyberpunk";
  onInteractiveFilterChange?: (
    filter:
      | "none"
      | "neon-edge"
      | "hologram"
      | "pixel"
      | "comic"
      | "ascii"
      | "thermal"
      | "mirror"
      | "kaleidoscope"
      | "oil-paint"
      | "sketch"
      | "prism"
      | "vhs"
      | "infrared"
      | "xray"
      | "cyberpunk"
  ) => void;
  filterIntensity?: number;
  onFilterIntensityChange?: (intensity: number) => void;
  filterColor?: string;
  onFilterColorChange?: (color: string) => void;
  filterTarget?: "both" | "background" | "person";
  onFilterTargetChange?: (target: "both" | "background" | "person") => void;
  onCameraBackgroundChange: (bgId: "none" | "blur" | "image") => void;
  onCustomBackgroundUpload: (file: File) => void;
  onCameraAspectRatioChange: (ratio: string) => void;
  customAspectRatio: string;
  onCustomAspectRatioChange: (ratio: string) => void;
  onFaceTrackingToggle: (enabled: boolean) => void; // Kept for the UI

  // --- Original Background Props ---
  backgroundEffect: "none" | "blur" | "image";
  backgroundImageUrl?: string | null;
  portalContainer?: HTMLElement | null;
}

export const CameraRenderer: React.FC<CameraRendererProps> = ({
  stream,
  className,
  style,
  videoFilter,
  isNeonEdgeEnabled,
  neonIntensity,
  neonColor,
  cameraBackground = "none",
  customBackgroundUrl,
  isFaceTrackingEnabled = false, // We still accept this prop
  cameraAspectRatio = "16:9",
  pipBorder,
  onPipBorderChange,
  pipShadow,
  onPipShadowChange,
  isAutoFramingEnabled, // This is the main prop for the new logic
  onAutoFramingChange,
  isBeautifyEnabled,
  onBeautifyToggle,
  isLowLightEnabled,
  onLowLightToggle,
  onVideoFilterChange,
  onNeonEdgeToggle,
  onNeonIntensityChange,
  onNeonEdgeColorChange,
  zoomSensitivity, // Prop for zoom level
  onZoomSensitivityChange,
  trackingSpeed, // Prop for pan speed
  onTrackingSpeedChange,
  onCameraBackgroundChange,
  onCustomBackgroundUpload,
  onCameraAspectRatioChange,
  customAspectRatio,
  onCustomAspectRatioChange,
  onFaceTrackingToggle,
  backgroundEffect,
  backgroundImageUrl,
  portalContainer,
  activeInteractiveFilter = "none",
  onInteractiveFilterChange,
  filterIntensity = 1.0,
  onFilterIntensityChange,
  filterColor = "#00ffff",
  onFilterColorChange,
  filterTarget = "both",
  onFilterTargetChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // --- Refs for smoothed auto-frame state ---
  const currentScale = useRef(1);
  const currentXOffset = useRef(0);
  const currentYOffset = useRef(0);

  // Initialize useCameraEffects hook
  const { processedCanvas, facePosition, isReady } = useCameraEffects({
    videoElement: videoRef.current,
    isBackgroundRemovalEnabled: cameraBackground !== "none",
    backgroundType: cameraBackground,
    backgroundImageUrl: customBackgroundUrl || undefined,
    isFaceTrackingEnabled: isFaceTrackingEnabled || isAutoFramingEnabled,
  });

  const handleMouseEnter = () => {
    if (containerRef.current) {
      setToolbarPosition({
        x: containerRef.current.offsetWidth / 2,
        y: 0,
      });
    }
    setIsHovered(true);
  };
  const handleMouseLeave = () => setIsHovered(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [canvasRef.current]);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (stream) {
      if (video.srcObject !== stream) {
        video.srcObject = stream;
        video.play().catch(console.error);
      }
    } else {
      if (video.srcObject) {
        video.srcObject = null;
      }
    }

    const renderFrame = () => {
      if (
        !video.srcObject ||
        video.paused ||
        video.ended ||
        video.videoWidth === 0
      ) {
        // Reset zoom/pan when video stops
        currentScale.current = 1;
        currentXOffset.current = 0;
        currentYOffset.current = 0;
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const sourceElement = processedCanvas || video;
      const sourceWidth = video.videoWidth;
      const sourceHeight = video.videoHeight;
      const sourceAspect = sourceWidth / sourceHeight;
      const canvasAspect = canvas.width / canvas.height;

      // --- START: NEW ROBUST PAN/ZOOM LOGIC ---

      // 1. Calculate base 'cover' scale
      const baseScale =
        canvasAspect > sourceAspect
          ? canvas.width / sourceWidth // Canvas is wider, fit to width
          : canvas.height / sourceHeight; // Canvas is taller, fit to height

      // 2. Determine target auto-frame scale & pan
      let targetScale = 1.0; // This is the *additional* zoom
      let targetXOffset = 0.0; // -0.5 to 0.5 (percentage of video width)
      let targetYOffset = 0.0; // -0.5 to 0.5 (percentage of video height)

      if (isAutoFramingEnabled && facePosition) {
        // Calculate target scale
        const faceWidthPx = (facePosition.width / 100) * sourceWidth;
        const faceHeightPx = (facePosition.height / 100) * sourceHeight;
        const faceSizePx = Math.max(faceWidthPx, faceHeightPx);

        const faceScreenPercentage = 0.1 + (zoomSensitivity / 10) * 0.2; // 15% to 50%

        // Calculate how much we need to scale the face to reach target size
        const targetFaceSizePx =
          Math.min(canvas.width, canvas.height) * faceScreenPercentage;

        targetScale = Math.min(5, Math.max(1, targetFaceSizePx / faceSizePx));
        // Calculate target pan (face center % (0-100) -> pan % (-0.5 to 0.5))

        targetXOffset = (50 - facePosition.x) / 100;
        targetYOffset = (50 - facePosition.y) / 100;
      } else if (isFaceTrackingEnabled && facePosition) {
        // Fallback to simple face tracking (pan only)
        targetScale = 1.0;
        targetXOffset = (50 - facePosition.x) / 100;
        targetYOffset = (50 - facePosition.y) / 100;
      }

      // 3. Apply Smoothing (Lerp)
      const zoomSpeed = 0.05; // Slower, smoother zoom
      currentScale.current += (targetScale - currentScale.current) * zoomSpeed;

      // Use the user's trackingSpeed prop (0.01 to 0.5)
      currentXOffset.current +=
        (targetXOffset - currentXOffset.current) * trackingSpeed;
      currentYOffset.current +=
        (targetYOffset - currentYOffset.current) * trackingSpeed;

      // 4. Calculate Final Draw Parameters
      const finalScale = baseScale * currentScale.current;
      const finalWidth = sourceWidth * finalScale;
      const finalHeight = sourceHeight * finalScale;

      // Base position (centered)
      let finalDrawX = (canvas.width - finalWidth) / 2;
      let finalDrawY = (canvas.height - finalHeight) / 2;

      // Calculate pan in pixels
      const panAmountX = currentXOffset.current * finalWidth;
      const panAmountY = currentYOffset.current * finalHeight;

      // Calculate *maximum* allowed pan (the "padding")
      const maxPanX = Math.max(0, (finalWidth - canvas.width) / 2);
      const maxPanY = Math.max(0, (finalHeight - canvas.height) / 2);

      // Clamp the pan amount to stay within the padding
      const clampedPanX = Math.max(-maxPanX, Math.min(maxPanX, panAmountX));
      const clampedPanY = Math.max(-maxPanY, Math.min(maxPanY, panAmountY));

      // Apply the clamped pan
      finalDrawX += clampedPanX;
      finalDrawY += clampedPanY;

      // 5. Draw the image
      ctx.filter = videoFilter;
      ctx.drawImage(
        sourceElement,
        finalDrawX,
        finalDrawY,
        finalWidth,
        finalHeight
      );
      ctx.filter = "none";
      // --- END: NEW ROBUST PAN/ZOOM LOGIC ---

      // Apply interactive filters
      const currentTime = Date.now();

      if (activeInteractiveFilter !== "none") {
        if (
          !tempCanvasRef.current ||
          tempCanvasRef.current.width !== Math.round(finalWidth) ||
          tempCanvasRef.current.height !== Math.round(finalHeight)
        ) {
          tempCanvasRef.current = document.createElement("canvas");
          tempCanvasRef.current.width = Math.round(finalWidth);
          tempCanvasRef.current.height = Math.round(finalHeight);
        }
        const tempCanvas = tempCanvasRef.current;
        const tempCtx = tempCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!tempCtx) return;

        // Draw the source video for processing
        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

        // Get segmentation mask if filtering person or background separately
        let segmentationMask: ImageData | null = null;
        if (filterTarget !== "both" && processedCanvas) {
          const processCtx = processedCanvas.getContext("2d", {
            willReadFrequently: true,
          });
          if (processCtx) {
            segmentationMask = processCtx.getImageData(
              0,
              0,
              tempCanvas.width,
              tempCanvas.height
            );
          }
        }

        // Apply the selected interactive filter
        const frame = tempCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        let processed: ImageData | null = null;

        switch (activeInteractiveFilter) {
          case "neon-edge": {
            const edges = detectEdges(tempCtx, frame, neonIntensity, neonColor);
            ctx.globalCompositeOperation = "lighter";
            ctx.putImageData(
              edges,
              Math.round(finalDrawX),
              Math.round(finalDrawY)
            );
            ctx.globalCompositeOperation = "source-over";
            return; // Skip selective application for edge detection
          }
          case "hologram":
            processed = applyHologramEffect(tempCtx, frame, currentTime);
            break;
          case "pixel":
            processed = applyPixelEffect(tempCtx, frame, 8);
            break;
          case "comic":
            processed = applyComicEffect(tempCtx, frame);
            break;
          case "ascii": {
            // ASCII needs canvas reference - handle separately
            ctx.save();
            ctx.translate(Math.round(finalDrawX), Math.round(finalDrawY));
            applyASCIIEffect(ctx, frame, tempCanvas);
            ctx.restore();
            return; // Skip selective application for ASCII
          }
          case "thermal":
            processed = applyThermalEffect(tempCtx, frame);
            break;
          case "mirror":
            processed = applyMirrorEffect(tempCtx, frame, filterIntensity);
            break;
          case "kaleidoscope":
            processed = applyKaleidoscopeEffect(
              tempCtx,
              frame,
              filterIntensity
            );
            break;
          case "oil-paint":
            processed = applyOilPaintEffect(tempCtx, frame, filterIntensity);
            break;
          case "sketch":
            processed = applySketchEffect(tempCtx, frame, filterIntensity);
            break;
          case "prism":
            processed = applyPrismEffect(
              tempCtx,
              frame,
              filterIntensity,
              filterColor
            );
            break;
          case "vhs":
            processed = applyVHSEffect(tempCtx, frame, filterIntensity);
            break;
          case "infrared":
            processed = applyInfraredEffect(tempCtx, frame, filterColor);
            break;
          case "xray":
            processed = applyXRayEffect(tempCtx, frame, filterIntensity);
            break;
          case "cyberpunk":
            processed = applyCyberpunkEffect(
              tempCtx,
              frame,
              filterIntensity,
              filterColor
            );
            break;
        }

        // Apply filter selectively based on target
        if (processed) {
          if (filterTarget === "both") {
            // Apply to entire frame
            ctx.putImageData(
              processed,
              Math.round(finalDrawX),
              Math.round(finalDrawY)
            );
          } else if (segmentationMask) {
            // Blend original and processed based on segmentation mask
            const output = ctx.createImageData(frame.width, frame.height);
            const frameData = frame.data;
            const processedData = processed.data;
            const maskData = segmentationMask.data;

            for (let i = 0; i < frameData.length; i += 4) {
              // Mask alpha channel indicates if pixel is person (255) or background (0)
              const isPerson = maskData[i + 3] > 128;
              const useProcessed =
                filterTarget === "person" ? isPerson : !isPerson;

              if (useProcessed) {
                output.data[i] = processedData[i];
                output.data[i + 1] = processedData[i + 1];
                output.data[i + 2] = processedData[i + 2];
                output.data[i + 3] = processedData[i + 3];
              } else {
                output.data[i] = frameData[i];
                output.data[i + 1] = frameData[i + 1];
                output.data[i + 2] = frameData[i + 2];
                output.data[i + 3] = frameData[i + 3];
              }
            }

            ctx.putImageData(
              output,
              Math.round(finalDrawX),
              Math.round(finalDrawY)
            );
          } else {
            // No segmentation available, fall back to applying to entire frame
            ctx.putImageData(
              processed,
              Math.round(finalDrawX),
              Math.round(finalDrawY)
            );
          }
        }
      }

      // Legacy neon edge support (when using old toggle)
      if (isNeonEdgeEnabled && activeInteractiveFilter === "none") {
        if (
          !tempCanvasRef.current ||
          tempCanvasRef.current.width !== Math.round(finalWidth) ||
          tempCanvasRef.current.height !== Math.round(finalHeight)
        ) {
          tempCanvasRef.current = document.createElement("canvas");
          tempCanvasRef.current.width = Math.round(finalWidth);
          tempCanvasRef.current.height = Math.round(finalHeight);
        }
        const tempCanvas = tempCanvasRef.current;
        const tempCtx = tempCanvas.getContext("2d", {
          willReadFrequently: true,
        });
        if (!tempCtx) return;

        tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
        const frame = tempCtx.getImageData(
          0,
          0,
          tempCanvas.width,
          tempCanvas.height
        );
        const edges = detectEdges(tempCtx, frame, neonIntensity, neonColor);
        ctx.globalCompositeOperation = "lighter";
        ctx.putImageData(edges, Math.round(finalDrawX), Math.round(finalDrawY));
        ctx.globalCompositeOperation = "source-over";
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
    stream,
    videoRef.current,
    canvasRef.current,
    isNeonEdgeEnabled,
    neonIntensity,
    neonColor,
    videoFilter,
    processedCanvas,
    facePosition,
    isFaceTrackingEnabled,
    isAutoFramingEnabled,
    zoomSensitivity,
    trackingSpeed,
    activeInteractiveFilter,
    filterIntensity,
    filterColor,
    filterTarget,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full", className)} // Added w-full h-full
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="hidden object-cover w-full h-full"
      />
      {!stream && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 text-muted-foreground/50 pointer-events-none">
          <img
            src="/icon.png"
            alt="Camera Off"
            className="w-1/2 h-1/2 object-contain"
            style={{
              maxWidth: "50px",
              maxHeight: "50px",
            }}
          />
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full" />

      {isHovered && portalContainer instanceof HTMLElement
        ? createPortal(
            <PipControlsToolbar
              position={toolbarPosition}
              containerRef={containerRef}
              pipBorder={pipBorder}
              onPipBorderChange={onPipBorderChange}
              pipShadow={pipShadow}
              onPipShadowChange={onPipShadowChange}
              isAutoFramingEnabled={isAutoFramingEnabled}
              onAutoFramingChange={onAutoFramingChange}
              isBeautifyEnabled={isBeautifyEnabled}
              onBeautifyToggle={onBeautifyToggle}
              isLowLightEnabled={isLowLightEnabled}
              onLowLightToggle={onLowLightToggle}
              videoFilter={videoFilter}
              onVideoFilterChange={onVideoFilterChange}
              isNeonEdgeEnabled={isNeonEdgeEnabled}
              onNeonEdgeToggle={onNeonEdgeToggle}
              neonIntensity={neonIntensity}
              onNeonIntensityChange={onNeonIntensityChange}
              neonEdgeColor={neonColor}
              onNeonEdgeColorChange={onNeonEdgeColorChange}
              zoomSensitivity={zoomSensitivity}
              onZoomSensitivityChange={onZoomSensitivityChange}
              trackingSpeed={trackingSpeed}
              onTrackingSpeedChange={onTrackingSpeedChange}
              cameraBackground={cameraBackground}
              onCameraBackgroundChange={onCameraBackgroundChange}
              onCustomBackgroundUpload={onCustomBackgroundUpload}
              cameraAspectRatio={cameraAspectRatio}
              onCameraAspectRatioChange={onCameraAspectRatioChange}
              customAspectRatio={customAspectRatio}
              onCustomAspectRatioChange={onCustomAspectRatioChange}
              isFaceTrackingEnabled={isFaceTrackingEnabled}
              onFaceTrackingToggle={onFaceTrackingToggle}
              activeInteractiveFilter={activeInteractiveFilter}
              onInteractiveFilterChange={onInteractiveFilterChange}
              filterIntensity={filterIntensity}
              onFilterIntensityChange={onFilterIntensityChange}
              filterColor={filterColor}
              onFilterColorChange={onFilterColorChange}
              filterTarget={filterTarget}
              onFilterTargetChange={onFilterTargetChange}
            />,
            portalContainer
          )
        : isHovered && (
            <PipControlsToolbar
              position={toolbarPosition}
              containerRef={containerRef}
              pipBorder={pipBorder}
              onPipBorderChange={onPipBorderChange}
              pipShadow={pipShadow}
              onPipShadowChange={onPipShadowChange}
              isAutoFramingEnabled={isAutoFramingEnabled}
              onAutoFramingChange={onAutoFramingChange}
              isBeautifyEnabled={isBeautifyEnabled}
              onBeautifyToggle={onBeautifyToggle}
              isLowLightEnabled={isLowLightEnabled}
              onLowLightToggle={onLowLightToggle}
              videoFilter={videoFilter}
              onVideoFilterChange={onVideoFilterChange}
              isNeonEdgeEnabled={isNeonEdgeEnabled}
              onNeonEdgeToggle={onNeonEdgeToggle}
              neonIntensity={neonIntensity}
              onNeonIntensityChange={onNeonIntensityChange}
              neonEdgeColor={neonColor}
              onNeonEdgeColorChange={onNeonEdgeColorChange}
              zoomSensitivity={zoomSensitivity}
              onZoomSensitivityChange={onZoomSensitivityChange}
              trackingSpeed={trackingSpeed}
              onTrackingSpeedChange={onTrackingSpeedChange}
              cameraBackground={cameraBackground}
              onCameraBackgroundChange={onCameraBackgroundChange}
              onCustomBackgroundUpload={onCustomBackgroundUpload}
              cameraAspectRatio={cameraAspectRatio}
              onCameraAspectRatioChange={onCameraAspectRatioChange}
              customAspectRatio={customAspectRatio}
              onCustomAspectRatioChange={onCustomAspectRatioChange}
              isFaceTrackingEnabled={isFaceTrackingEnabled}
              onFaceTrackingToggle={onFaceTrackingToggle}
              activeInteractiveFilter={activeInteractiveFilter}
              onInteractiveFilterChange={onInteractiveFilterChange}
            />
          )}
    </div>
  );
};
