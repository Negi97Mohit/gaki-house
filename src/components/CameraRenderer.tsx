// src/components/CameraRenderer.tsx
import { createPortal } from "react-dom";
import React, { useRef, useState, useEffect } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { useWebGLRenderLoop } from "@/hooks/useWebGLRenderLoop";
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
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  // DEBUG: Track re-renders
  useEffect(() => {
    // console.log("[CameraRenderer] Re-rendered. Props updated?");
  });

  // Stream Management
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

  // CHANGED: Use facePositionRef to prevent re-renders
  const { processedCanvas, facePositionRef } = useCameraEffects({
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
    facePositionRef, // Pass ref instead of value
  });

  const handleMouseEnter = () => {
    console.log("[CameraRenderer] handleMouseEnter triggered");
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      console.log("[CameraRenderer] Cleared existing leave timeout");
    }

    if (containerRef.current) {
      setToolbarPosition({
        x: containerRef.current.offsetWidth / 2,
        y: 0,
      });
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    console.log(
      "[CameraRenderer] handleMouseLeave triggered - starting timeout"
    );
    hoverTimeoutRef.current = setTimeout(() => {
      console.log(
        "[CameraRenderer] Timeout finished - setting isHovered=false"
      );
      setIsHovered(false);
    }, 500); // Increased to 500ms for easier debugging/usage
  };

  // Ensure timeout is cleared on unmount
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

      {/* Using a wrapper div with mouse handlers ensures that moving the mouse 
          FROM the canvas TO the toolbar doesn't trigger a 'leave' event that closes it.
      */}
      {isHovered &&
        (props.portalContainer instanceof HTMLElement ? (
          createPortal(
            <div
              className="absolute top-0 left-0 w-full"
              style={{ pointerEvents: "auto" }} // Ensure it captures events
              onMouseEnter={() => {
                console.log("[CameraRenderer] Entered Portal Toolbar Wrapper");
                if (hoverTimeoutRef.current)
                  clearTimeout(hoverTimeoutRef.current);
                setIsHovered(true);
              }}
              onMouseLeave={() => {
                console.log("[CameraRenderer] Left Portal Toolbar Wrapper");
                handleMouseLeave();
              }}
            >
              <PipControlsToolbar {...toolbarProps} />
            </div>,
            props.portalContainer
          )
        ) : (
          <div
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
            // We use a full-size wrapper to position the toolbar, but the wrapper itself shouldn't block clicks elsewhere
          >
            <div className="pointer-events-auto inline-block">
              <PipControlsToolbar {...toolbarProps} />
            </div>
          </div>
        ))}
    </div>
  );
};
