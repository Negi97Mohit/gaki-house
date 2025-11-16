// src/components/CameraRenderer.tsx
import { createPortal } from "react-dom";
import React, { useEffect, useRef, useState } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { PipControlsToolbar } from "./PipControlsToolbar";
import { VideoOff } from "lucide-react"; // <-- ADDED
import { cn } from "@/lib/utils"; // <-- FIX: Added missing import

// --- HELPER FUNCTIONS (No changes) ---
function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100;
  l /= 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  let r = 0,
    g = 0,
    b = 0;
  if (h < 60) {
    r = c;
    g = x;
  } else if (h < 120) {
    r = x;
    g = c;
  } else if (h < 180) {
    g = c;
    b = x;
  } else if (h < 240) {
    g = x;
    b = c;
  } else if (h < 300) {
    r = x;
    b = c;
  } else {
    r = c;
    b = x;
  }
  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 255, 255]; // fallback to cyan
}

function detectEdges(
  ctx: CanvasRenderingContext2D,
  imageData: ImageData,
  intensity: number,
  color: string
): ImageData {
  const data = imageData.data;
  const w = imageData.width;
  const h = imageData.height;
  const output = ctx.createImageData(w, h);
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  const colors: { [key: string]: [number, number, number] } = {
    cyan: [0, 255, 255],
    magenta: [255, 0, 255],
    green: [0, 255, 0],
    blue: [0, 100, 255],
    red: [255, 0, 0],
    yellow: [255, 255, 0],
  };
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let gx = 0,
        gy = 0;
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * w + (x + kx)) * 4;
          const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          const kernelIdx = (ky + 1) * 3 + (kx + 1);
          gx += gray * sobelX[kernelIdx];
          gy += gray * sobelY[kernelIdx];
        }
      }
      const magnitude = Math.sqrt(gx * gx + gy * gy) * intensity;
      const outIdx = (y * w + x) * 4;
      if (magnitude > 20) {
        let rgb: [number, number, number];
        if (color === "rainbow") {
          rgb = hslToRgb((x / w + y / h) * 360, 100, 50);
        } else if (color.startsWith("#")) {
          // Support hex colors
          rgb = hexToRgb(color);
        } else {
          // Support preset color names
          rgb = colors[color] || colors["cyan"];
        }
        output.data[outIdx] = rgb[0];
        output.data[outIdx + 1] = rgb[1];
        output.data[outIdx + 2] = rgb[2];
        output.data[outIdx + 3] = Math.min(magnitude * 1.5, 255);
      }
    }
  }
  return output;
}

// --- PROPS INTERFACE (FIX: Fully updated) ---
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
  isFaceTrackingEnabled?: boolean;
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
  onCameraBackgroundChange: (bgId: "none" | "blur" | "image") => void;
  onCustomBackgroundUpload: (file: File) => void;
  onCameraAspectRatioChange: (ratio: string) => void; // <-- FIX: Added
  customAspectRatio: string;
  onCustomAspectRatioChange: (ratio: string) => void;
  onFaceTrackingToggle: (enabled: boolean) => void;

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
  isFaceTrackingEnabled = false,
  cameraAspectRatio = "16:9",

  // --- FIX: Destructure ALL props ---
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
  onCameraAspectRatioChange, // <-- FIX: Added
  customAspectRatio,
  onCustomAspectRatioChange,
  onFaceTrackingToggle,
  backgroundEffect,
  backgroundImageUrl,
  portalContainer,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // Initialize useCameraEffects hook
  const { processedCanvas, facePosition, isReady } = useCameraEffects({
    videoElement: videoRef.current,
    isBackgroundRemovalEnabled: cameraBackground !== "none",
    backgroundType: cameraBackground,
    backgroundImageUrl: customBackgroundUrl || undefined,
    isFaceTrackingEnabled,
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

  // --- FIX: Correct useEffect structure ---
  useEffect(() => {
    const canvas = canvasRef.current; // Read ref *inside* effect
    if (!canvas) {
      // console.log("[CameraRenderer] ResizeObserver effect: Canvas ref not ready.");
      return;
    }
    // console.log("[CameraRenderer] ResizeObserver effect: Attaching observer.");
    const resizeObserver = new ResizeObserver(() => {
      if (canvas) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
      }
    });
    resizeObserver.observe(canvas);
    return () => resizeObserver.disconnect();
  }, [canvasRef.current]); // <-- FIX: Depend on the ref's *current* value

  // --- FIX: Correct useEffect structure ---
  useEffect(() => {
    const video = videoRef.current; // Read ref *inside* effect
    const canvas = canvasRef.current; // Read ref *inside* effect
    if (!video || !canvas) {
      // console.log("[CameraRenderer] Drawing effect: Refs not ready.");
      return;
    }

    // console.log("[CameraRenderer] Drawing effect: Running. Stream:", stream ? "Yes" : "No");

    if (stream) {
      // +++ FIX for AbortError: Only set srcObject if it's a new stream +++
      if (video.srcObject !== stream) {
        console.log("[CameraRenderer] Attaching new stream.");
        video.srcObject = stream;
        video.play().catch(console.error);
      }
    } else {
      // +++ FIX for AbortError: Only clear if it's not already null +++
      if (video.srcObject) {
        console.log("[CameraRenderer] No stream, clearing video.");
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
      const videoAspect = video.videoWidth / video.videoHeight;
      const canvasAspect = canvas.width / canvas.height;

      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let drawX = 0;
      let drawY = 0;

      if (isFaceTrackingEnabled && facePosition) {
        const offsetX = (50 - facePosition.x) * 0.1;
        const offsetY = (50 - facePosition.y) * 0.1;
        drawX += offsetX * canvas.width;
        drawY += offsetY * canvas.height;
      }

      if (canvasAspect > videoAspect) {
        drawHeight = canvas.width / videoAspect;
        drawY += (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * videoAspect;
        drawX += (canvas.width - drawWidth) / 2;
      }

      ctx.filter = videoFilter;
      ctx.drawImage(sourceElement, drawX, drawY, drawWidth, drawHeight);
      ctx.filter = "none";

      if (isNeonEdgeEnabled) {
        if (
          !tempCanvasRef.current ||
          tempCanvasRef.current.width !== drawWidth ||
          tempCanvasRef.current.height !== drawHeight
        ) {
          tempCanvasRef.current = document.createElement("canvas");
          tempCanvasRef.current.width = Math.round(drawWidth);
          tempCanvasRef.current.height = Math.round(drawHeight);
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
        ctx.putImageData(edges, Math.round(drawX), Math.round(drawY));
        ctx.globalCompositeOperation = "source-over";
      }

      animationFrameRef.current = requestAnimationFrame(renderFrame);
    };

    renderFrame();

    return () => {
      // console.log("[CameraRenderer] Cleanup drawing effect.");
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    stream,
    videoRef.current, // <-- FIX: Depend on the ref's *current* value
    canvasRef.current, // <-- FIX: Depend on the ref's *current* value
    isNeonEdgeEnabled,
    neonIntensity,
    neonColor,
    videoFilter,
    processedCanvas,
    facePosition,
    isFaceTrackingEnabled,
  ]);

  return (
    <div
      ref={containerRef}
      className={cn("relative", className)} // <-- cn is now defined
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
      {/* --- ADDED: Placeholder when stream is off --- */}
      {!stream && (
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-black/30 text-muted-foreground/50 pointer-events-none">
          <img
            src="/icon.png"
            alt="Camera Off"
            className="w-1/2 h-1/2 object-cover" // Made it circular and larger
            style={{
              maxWidth: "50px",
              maxHeight: "50px",
            }}
          />
        </div>
      )}
      {/* --- END ADDED --- */}
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
              onCameraAspectRatioChange={onCameraAspectRatioChange} // <-- FIX: Prop is now passed
              customAspectRatio={customAspectRatio}
              onCustomAspectRatioChange={onCustomAspectRatioChange}
              isFaceTrackingEnabled={isFaceTrackingEnabled}
              onFaceTrackingToggle={onFaceTrackingToggle}
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
            />
          )}
    </div>
  );
};
