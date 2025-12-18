// src/components/CameraRenderer.tsx
import { createPortal } from "react-dom";
import React, { useRef, useState, useEffect } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { useWebGLRenderLoop } from "@/hooks/useWebGLRenderLoop";
import { usePictureInPicture } from "@/hooks/usePictureInPicture";
import { PipControlsToolbar } from "./PipControlsToolbar";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { AmbientBackground } from "./AmbientBackground";

interface CameraRendererProps {
  stream: MediaStream | null;
  className?: string;
  style?: React.CSSProperties;
  videoFilter: string;
  isNeonEdgeEnabled: boolean;
  neonIntensity: number;
  neonColor: string;
  isFaceTrackingEnabled?: boolean;
  cameraAspectRatio?: string;
  showAspectRatio?: boolean;
  cameraShape?: "rectangle" | "circle" | "rounded";
  onCameraShapeChange?: (shape: "rectangle" | "circle" | "rounded") => void;
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

  onCameraAspectRatioChange: (ratio: string) => void;
  customAspectRatio: string;
  onCustomAspectRatioChange: (ratio: string) => void;
  onFaceTrackingToggle: (enabled: boolean) => void;

  portalContainer?: HTMLElement | null;
  activeInteractiveFilter?: string;
  onInteractiveFilterChange?: (filter: string) => void;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
  videoDevices?: MediaDeviceInfo[];
  selectedDeviceId?: string;
  onCameraDeviceChange?: (deviceId: string) => void;
  onEnterPipMode?: () => void;
  isMouseActive?: boolean;
  externalVideoRef?: React.RefObject<HTMLVideoElement>;
  processedCanvas?: HTMLCanvasElement | null;
  facePositionRef?: React.MutableRefObject<any>;
}

export const CameraRenderer: React.FC<CameraRendererProps> = (props) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = props.externalVideoRef || internalVideoRef;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  const { isPipActive, togglePiP } = usePictureInPicture({ canvasRef });

  useEffect(() => {
    // --- FIX: Check if device is 'remote-peer' before requesting stream ---
    if (props.selectedDeviceId && props.selectedDeviceId !== "remote-peer") {
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
          // Only show toast for real errors, not interruptions
          if ((e as Error).name !== "AbortError") {
            toast.error("Could not access selected camera");
          }
        }
      };
      getStream();
      return () => {
        isMounted = false;
        if (localStream) localStream.getTracks().forEach((t) => t.stop());
      };
    } else {
      // If it's remote-peer or undefined, clear local stream so we use props.stream
      setLocalStream(null);
    }
  }, [props.selectedDeviceId]);

  // If localStream is null (e.g. remote peer), fall back to props.stream
  const activeStream = localStream || props.stream;

  const isInternalSegmentationNeeded =
    !!(props.filterTarget && props.filterTarget !== "both") && !props.processedCanvas;

  const isInternalFaceTrackingNeeded =
    (props.isFaceTrackingEnabled || props.isAutoFramingEnabled) && !props.facePositionRef;

  // Use internal hook if processedCanvas is NOT provided externally (legacy/fallback)
  const internalEffects = useCameraEffects({
    videoElement: videoRef.current,
    isSegmentationEnabled: isInternalSegmentationNeeded,
    isFaceTrackingEnabled: isInternalFaceTrackingNeeded,
    onUserPositionChange: props.onUserPositionChange,
  });

  const processedCanvas = props.processedCanvas || internalEffects.processedCanvas;
  const facePositionRef = props.facePositionRef || internalEffects.facePositionRef;

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
    facePositionRef,
  });

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
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
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 500);
  };

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  const toolbarProps = {
    position: toolbarPosition,
    containerRef,
    ...props,
    onCameraDeviceChange: props.onCameraDeviceChange || (() => { }),
    onEnterPipMode: props.onEnterPipMode,
    isPipActive,
    onTogglePip: togglePiP,
    isCameraActive: !!activeStream,
  };

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full h-full overflow-hidden", props.className)}
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

      {/* --- UPDATED: New Ambient Background Logic --- */}
      {!activeStream && (
        <div className="absolute inset-0 w-full h-full">
          {/* Background Layer */}
          <AmbientBackground />

          {/* Content Layer (Logo & Text) */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <img
              src="/icon.png"
              alt="GAKI Logo"
              className="w-[10%] min-w-[20px] max-w-[50px] h-auto object-contain drop-shadow-2xl mb-4"
            />
            {props.selectedDeviceId === "remote-peer" && (
              <p className="text-white/80 text-sm animate-pulse">
                Waiting for phone connection...
              </p>
            )}
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="w-full h-full relative z-0" />

      {isHovered &&
        (props.isMouseActive ?? true) &&
        (props.portalContainer instanceof HTMLElement ? (
          createPortal(
            <div
              className="absolute top-0 left-0 w-full"
              style={{ pointerEvents: "auto", zIndex: 9999 }}
              onMouseEnter={() => {
                if (hoverTimeoutRef.current)
                  clearTimeout(hoverTimeoutRef.current);
                setIsHovered(true);
              }}
              onMouseLeave={handleMouseLeave}
            >
              {/* @ts-ignore */}
              <PipControlsToolbar {...toolbarProps} />
            </div>,
            props.portalContainer
          )
        ) : (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-50">
            <div className="pointer-events-auto inline-block">
              {/* @ts-ignore */}
              <PipControlsToolbar {...toolbarProps} />
            </div>
          </div>
        ))}
    </div>
  );
};
