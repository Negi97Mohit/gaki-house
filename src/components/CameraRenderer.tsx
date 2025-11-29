// src/components/CameraRenderer.tsx
import { createPortal } from "react-dom";
import React, { useRef, useState, useEffect } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { useWebGLRenderLoop } from "@/hooks/useWebGLRenderLoop";
import { PipControlsToolbar } from "./PipControlsToolbar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// ... (Keep Interface CameraRendererProps exactly as is)
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

  // --- FIX 3: Robust Hover State ---
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // ... (Keep useEffect for Stream Management) ...
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

  const { processedCanvas, facePosition } = useCameraEffects({
    videoElement: videoRef.current,
    isBackgroundRemovalEnabled: props.cameraBackground !== "none",
    backgroundType: props.cameraBackground || "none",
    backgroundImageUrl: props.customBackgroundUrl || undefined,
    isFaceTrackingEnabled:
      props.isFaceTrackingEnabled || props.isAutoFramingEnabled,
    onUserPositionChange: props.onUserPositionChange,
  });

  useWebGLRenderLoop({
    canvasRef,
    videoRef,
    activeStream,
    isAutoFramingEnabled: props.isAutoFramingEnabled,
    isFaceTrackingEnabled: props.isFaceTrackingEnabled || false,
    zoomSensitivity: props.zoomSensitivity,
    trackingSpeed: props.trackingSpeed,
    videoFilter: props.videoFilter,
    activeInteractiveFilter: props.activeInteractiveFilter,
    filterIntensity: props.filterIntensity,
    filterColor: props.filterColor,
    processedCanvas,
    backgroundEffect: props.backgroundEffect,
  });

  // --- FIX 3: Improved Mouse Handlers ---
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);

    if (containerRef.current) {
      setToolbarPosition({
        x: containerRef.current.offsetWidth / 2,
        y: 0,
      });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    // Delay hiding to allow bridging gap or moving into portal
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 300); // 300ms grace period
  };

  // Cancel timeout if we re-enter (handled by handleMouseEnter above)
  // also clear on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

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
            style={{ maxWidth: "50px", maxHeight: "50px" }}
          />
        </div>
      )}
      <canvas ref={canvasRef} className="w-full h-full" />

      {isHovered &&
        (props.portalContainer instanceof HTMLElement ? (
          createPortal(
            // Add mouse handlers to the toolbar itself to keep it open
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="absolute top-0 left-0 w-full" // wrapper to catch events
            >
              <PipControlsToolbar {...toolbarProps} />
            </div>,
            props.portalContainer
          )
        ) : (
          <PipControlsToolbar {...toolbarProps} />
        ))}
    </div>
  );
};
