// src/components/CameraRenderer.tsx
import { createPortal } from "react-dom";
import React, { useRef, useState, useEffect } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { useCanvasRenderLoop } from "@/hooks/useCanvasRenderLoop";
import { PipControlsToolbar } from "./PipControlsToolbar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

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

  // Toolbar Props
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

  backgroundEffect: "none" | "blur" | "image";
  backgroundImageUrl?: string | null;
  portalContainer?: HTMLElement | null;
  activeInteractiveFilter?: string;
  onInteractiveFilterChange?: (filter: string) => void;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
  videoDevices?: MediaDeviceInfo[];
  selectedDeviceId?: string;
  onCameraDeviceChange?: (deviceId: string) => void;
}

export const CameraRenderer: React.FC<CameraRendererProps> = (props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // --- Local Stream Management ---
  useEffect(() => {
    if (props.selectedDeviceId) {
      let isMounted = true;
      const getStream = async () => {
        try {
          const newStream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: props.selectedDeviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
          if (isMounted) setLocalStream(newStream);
        } catch (e) {
          console.error("Failed to get local camera stream", e);
          toast.error("Could not access selected camera");
        }
      };
      getStream();
      return () => {
        isMounted = false;
        if (localStream) localStream.getTracks().forEach((t) => t.stop());
      };
    } else {
      setLocalStream(null);
    }
  }, [props.selectedDeviceId]);

  const activeStream = localStream || props.stream;

  // --- Effects & Tracking ---
  const { processedCanvas, facePosition } = useCameraEffects({
    videoElement: videoRef.current,
    isBackgroundRemovalEnabled: props.cameraBackground !== "none",
    backgroundType: props.cameraBackground || "none",
    backgroundImageUrl: props.customBackgroundUrl || undefined,
    isFaceTrackingEnabled:
      props.isFaceTrackingEnabled || props.isAutoFramingEnabled,
    onUserPositionChange: props.onUserPositionChange,
  });

  // --- Render Loop ---
  useCanvasRenderLoop({
    canvasRef,
    videoRef,
    activeStream,
    processedCanvas,
    facePosition,
    isAutoFramingEnabled: props.isAutoFramingEnabled,
    isFaceTrackingEnabled: props.isFaceTrackingEnabled || false,
    zoomSensitivity: props.zoomSensitivity,
    trackingSpeed: props.trackingSpeed,
    videoFilter: getVideoFilterStyle(
      props.videoFilter,
      props.isBeautifyEnabled,
      props.isLowLightEnabled
    ),
    activeInteractiveFilter: props.activeInteractiveFilter,
    filterIntensity: props.filterIntensity,
    filterColor: props.filterColor,
    filterTarget: props.filterTarget,
    isNeonEdgeEnabled: props.isNeonEdgeEnabled,
    neonIntensity: props.neonIntensity,
    neonColor: props.neonColor,
  });

  // --- Toolbar Positioning ---
  const handleMouseEnter = () => {
    if (containerRef.current) {
      setToolbarPosition({
        x: containerRef.current.offsetWidth / 2,
        y: 0,
      });
    }
    setIsHovered(true);
  };

  // --- Render Helpers ---
  const toolbarProps = {
    position: toolbarPosition,
    containerRef,
    ...props,
    onCameraDeviceChange: props.onCameraDeviceChange || (() => {}),
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full", props.className)}
      style={props.style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => setIsHovered(false)}
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
            style={{ maxWidth: "50px", maxHeight: "50px" }}
          />
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full" />

      {isHovered &&
        (props.portalContainer instanceof HTMLElement ? (
          createPortal(
            <PipControlsToolbar {...toolbarProps} />,
            props.portalContainer
          )
        ) : (
          <PipControlsToolbar {...toolbarProps} />
        ))}
    </div>
  );
};

// Helper function moved outside component
function getVideoFilterStyle(
  baseFilter: string,
  isBeautify: boolean,
  isLowLight: boolean
): string {
  const filters: string[] = [];
  if (baseFilter && baseFilter !== "none") filters.push(baseFilter);
  if (isBeautify) filters.push("blur(0.5px) saturate(1.1) brightness(1.05)");
  if (isLowLight) filters.push("brightness(1.3) contrast(1.15)");
  return filters.length > 0 ? filters.join(" ") : "none";
}
