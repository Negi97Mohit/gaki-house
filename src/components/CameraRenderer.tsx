// src/components/CameraRenderer.tsx
import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { PipControlsToolbar } from "./PipControlsToolbar";
import { VideoOff } from "lucide-react";
import { cn } from "@/lib/utils";
// --- NEW ANIME STYLES ---
import { applyStyle, AnimeStyles } from "@/lib/animeStyles";
import { toast } from "sonner";

// --- EXISTING FILTERS ---
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

// --- PROPS INTERFACE ---
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
  isFaceTrackingEnabled?: boolean; // Overridden by isAutoFramingEnabled
  cameraAspectRatio?: string;

  // --- Toolbar Props ---
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
  onFaceTrackingToggle: (enabled: boolean) => void;

  // --- Background Props ---
  backgroundEffect: "none" | "blur" | "image";
  backgroundImageUrl?: string | null;
  portalContainer?: HTMLElement | null;
  activeInteractiveFilter?: string;
  onInteractiveFilterChange?: (filter: string) => void;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
  // NEW: Device Props
  videoDevices?: MediaDeviceInfo[];
  selectedDeviceId?: string;
  onCameraDeviceChange?: (deviceId: string) => void;
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
  isFaceTrackingEnabled = false,
  cameraAspectRatio = "16:9",
  pipBorder,
  onPipBorderChange,
  pipShadow,
  onPipShadowChange,
  isAutoFramingEnabled,
  onAutoFramingChange,
  isBeautifyEnabled,
  onBeautifyToggle,
  isLowLightEnabled,
  onLowLightToggle,
  onVideoFilterChange,
  onNeonEdgeToggle,
  onNeonIntensityChange,
  onNeonEdgeColorChange,
  zoomSensitivity,
  onZoomSensitivityChange,
  trackingSpeed,
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
  onUserPositionChange,
  videoDevices = [],
  selectedDeviceId,
  onCameraDeviceChange,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // --- Zoom/Pan State ---
  const currentScale = useRef(1);
  const currentXOffset = useRef(0);
  const currentYOffset = useRef(0);

  // --- NEW: Handle Local Device Stream ---
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // If a specific device ID is selected for THIS camera, fetch that stream
    if (selectedDeviceId) {
      const getStream = async () => {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: selectedDeviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
          setLocalStream(newStream);
        } catch (e) {
          console.error("Failed to get local camera stream", e);
          toast.error("Could not access selected camera");
        }
      };
      getStream();
      return () => {
        // Cleanup local stream on unmount or change
        if (localStream) localStream.getTracks().forEach((t) => t.stop());
      };
    } else {
      setLocalStream(null); // Revert to global stream
    }
  }, [selectedDeviceId]);

  // Determine which stream to use
  const activeStream = localStream || stream;

  // Initialize MediaPipe effects
  const { processedCanvas, facePosition, isReady } = useCameraEffects({
    videoElement: videoRef.current,
    isBackgroundRemovalEnabled: cameraBackground !== "none",
    backgroundType: cameraBackground,
    backgroundImageUrl: customBackgroundUrl || undefined,
    isFaceTrackingEnabled: isFaceTrackingEnabled || isAutoFramingEnabled,
    onUserPositionChange,
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

  // --- Canvas Sizing ---
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

  // --- Video Stream Handling ---
  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    if (activeStream) {
      if (video.srcObject !== activeStream) {
        video.srcObject = activeStream;
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
        // Reset state if no video
        currentScale.current = 1;
        currentXOffset.current = 0;
        currentYOffset.current = 0;
        animationFrameRef.current = requestAnimationFrame(renderFrame);
        return;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Ensure canvas size matches display size
      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Source: either MediaPipe processed canvas or raw video
      const sourceElement = processedCanvas || video;
      const sourceWidth = video.videoWidth || 1280;
      const sourceHeight = video.videoHeight || 720;
      const sourceAspect = sourceWidth / sourceHeight;
      const canvasAspect = canvas.width / canvas.height;

      // --- PAN/ZOOM LOGIC ---
      // 1. Base scale to cover container
      const baseScale =
        canvasAspect > sourceAspect
          ? canvas.width / sourceWidth
          : canvas.height / sourceHeight;

      // 2. Target scale/pan from Auto-Framing
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

      // 3. Smooth transitions
      const zoomSpeed = 0.05;
      currentScale.current += (targetScale - currentScale.current) * zoomSpeed;
      currentXOffset.current +=
        (targetXOffset - currentXOffset.current) * trackingSpeed;
      currentYOffset.current +=
        (targetYOffset - currentYOffset.current) * trackingSpeed;

      // 4. Final draw parameters
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

      // Draw base video
      ctx.filter = videoFilter;
      ctx.drawImage(
        sourceElement,
        finalDrawX,
        finalDrawY,
        finalWidth,
        finalHeight
      );
      ctx.filter = "none";

      // --- INTERACTIVE FILTERS ---
      const currentTime = Date.now();

      if (activeInteractiveFilter !== "none") {
        // Setup temp canvas for processing
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

        if (tempCtx) {
          // Draw current video frame to temp canvas
          tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);

          const frame = tempCtx.getImageData(
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
          );
          let processed: ImageData | null = null;

          // --- FILTER LOGIC ---

          // 1. Check for Anime Styles (New System)
          if (activeInteractiveFilter in AnimeStyles) {
            processed = applyStyle(
              activeInteractiveFilter as keyof typeof AnimeStyles,
              tempCtx,
              frame
            ).imageData;
          }
          // 2. Standard Filters (Existing System)
          else {
            switch (activeInteractiveFilter) {
              case "neon-edge": {
                const edges = detectEdges(
                  tempCtx,
                  frame,
                  neonIntensity,
                  neonColor
                );
                ctx.globalCompositeOperation = "lighter";
                ctx.putImageData(
                  edges,
                  Math.round(finalDrawX),
                  Math.round(finalDrawY)
                );
                ctx.globalCompositeOperation = "source-over";
                return; // Skip selective masking
              }
              case "hologram":
                processed = applyHologramEffect(tempCtx, frame, currentTime);
                break;
              case "hologram-fx":
                processed = applyHologramEffect(tempCtx, frame, currentTime);
                break;
              case "pixel":
                processed = applyPixelEffect(tempCtx, frame, 8);
                break;
              case "comic":
                processed = applyComicEffect(tempCtx, frame);
                break;
              case "ascii": {
                ctx.save();
                ctx.translate(Math.round(finalDrawX), Math.round(finalDrawY));
                applyASCIIEffect(ctx, frame, tempCanvas);
                ctx.restore();
                return; // Skip selective masking
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
                processed = applyOilPaintEffect(
                  tempCtx,
                  frame,
                  filterIntensity
                );
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
              case "infrared-fx":
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
          }

          // --- APPLY PROCESSED DATA TO CANVAS ---
          if (processed) {
            // Get segmentation mask if needed
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

            if (segmentationMask) {
              // Blend based on mask (Person vs Background)
              const output = ctx.createImageData(frame.width, frame.height);
              const frameData = frame.data;
              const processedData = processed.data;
              const maskData = segmentationMask.data;

              for (let i = 0; i < frameData.length; i += 4) {
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
              // Apply to whole frame
              ctx.putImageData(
                processed,
                Math.round(finalDrawX),
                Math.round(finalDrawY)
              );
            }
          }
        }
      }

      // --- LEGACY NEON EDGE SUPPORT ---
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
        if (tempCtx) {
          tempCtx.drawImage(video, 0, 0, tempCanvas.width, tempCanvas.height);
          const frame = tempCtx.getImageData(
            0,
            0,
            tempCanvas.width,
            tempCanvas.height
          );
          const edges = detectEdges(tempCtx, frame, neonIntensity, neonColor);
          ctx.globalCompositeOperation = "lighter";
          ctx.putImageData(
            edges,
            Math.round(finalDrawX),
            Math.round(finalDrawY)
          );
          ctx.globalCompositeOperation = "source-over";
        }
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
      className={cn("relative w-full h-full", className)}
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
      {!activeStream && (
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
              // Pass device props
              videoDevices={videoDevices}
              selectedDeviceId={selectedDeviceId}
              onCameraDeviceChange={onCameraDeviceChange || (() => {})}
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
              videoDevices={videoDevices}
              selectedDeviceId={selectedDeviceId}
              onCameraDeviceChange={onCameraDeviceChange || (() => {})}
            />
          )}
    </div>
  );
};
