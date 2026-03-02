// src/components/CameraRenderer.tsx
import { createPortal } from "react-dom";
import React, { useRef, useState, useEffect } from "react";
import { useCameraEffects } from "@/hooks/useCameraEffects";
import { useWebGLRenderLoop } from "@/features/canvas/hooks/useWebGLRenderLoop";
import { usePictureInPicture } from "@/hooks/usePictureInPicture";
import { PipControlsToolbar } from "./PipControlsToolbar";
import { cn } from "@/shared/lib/utils";
import { AmbientBackground } from "./AmbientBackground";
import { PipLayoutPreset } from "./pip/PipLayoutMenu";
import { CinematicOverlay } from "./CinematicOverlay";
import { CinematicEffect } from "./pip/cinematicShotData";
import { getCinematicCanvasStyles } from "./pip/cinematicCanvasStyles";
import { CinematicFilters } from "./pip/CinematicFilters";

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
  hidePipToolbar?: boolean;
  activeInteractiveFilter?: string;
  onInteractiveFilterChange?: (filter: string) => void;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
  videoDevices?: MediaDeviceInfo[];
  selectedDeviceId?: string;
  onCameraDeviceChange?: (deviceId: string) => void;
  onEnterPipMode?: () => void;
  isMouseActive?: boolean;
  screenShareMode?: "off" | "screen" | "window" | "canvas";
  onScreenShareModeChange?: (
    mode: "off" | "screen" | "window" | "canvas"
  ) => void;
  externalVideoRef?: React.RefObject<HTMLVideoElement>;
  processedCanvas?: HTMLCanvasElement | null;
  facePositionRef?: React.MutableRefObject<any>;

  // PIP Layout props
  currentPipLayoutId?: string;
  onPipLayoutSelect?: (preset: PipLayoutPreset) => void;
}

export const CameraRenderer: React.FC<CameraRendererProps> = (props) => {
  const internalVideoRef = useRef<HTMLVideoElement>(null);
  const videoRef = props.externalVideoRef || internalVideoRef;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState(false);
  const [cinematicEffect, setCinematicEffect] = useState<CinematicEffect>("none");
  const [manualZoom, setManualZoom] = useState(1.0);
  const hoverTimeoutRef = useRef<NodeJS.Timeout>();
  const activeStream = props.stream;

  const { isPipActive, togglePiP } = usePictureInPicture({ canvasRef });

  const isInternalSegmentationNeeded =
    !!(props.filterTarget && props.filterTarget !== "both") &&
    !props.processedCanvas;

  const isInternalFaceTrackingNeeded =
    (props.isFaceTrackingEnabled || props.isAutoFramingEnabled) &&
    !props.facePositionRef;

  const internalEffects = useCameraEffects({
    videoElement: videoRef.current,
    isSegmentationEnabled: isInternalSegmentationNeeded,
    isFaceTrackingEnabled: isInternalFaceTrackingNeeded,
    onUserPositionChange: props.onUserPositionChange,
  });

  const processedCanvas =
    props.processedCanvas || internalEffects.processedCanvas;
  const facePositionRef =
    props.facePositionRef || internalEffects.facePositionRef;

  // Combine manual zoom with auto-framing zoom
  const effectiveZoom = props.isAutoFramingEnabled
    ? (props.zoomSensitivity ?? 1) * manualZoom
    : manualZoom;

  useWebGLRenderLoop({
    canvasRef,
    videoRef,
    activeStream,
    isAutoFramingEnabled: props.isAutoFramingEnabled || manualZoom !== 1.0,
    isFaceTrackingEnabled: props.isFaceTrackingEnabled || false,
    zoomSensitivity: effectiveZoom,
    trackingSpeed: props.trackingSpeed,
    videoFilter: props.videoFilter,
    activeInteractiveFilter: props.activeInteractiveFilter,
    filterIntensity: props.filterIntensity,
    filterColor: props.filterColor,
    processedCanvas,
    facePositionRef,
    cinematicEffect, // Pass the current cinematic effect (e.g., "fisheye")
  });

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
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

  // Time warp (slow-motion / hyperlapse) is now handled by the
  // TimeWarpBuffer inside GLRenderer — no playbackRate needed.

  const toolbarProps = {
    position: { x: 0, y: 0 },
    containerRef,
    ...props,
    onCameraDeviceChange: props.onCameraDeviceChange || (() => { }),
    onEnterPipMode: props.onEnterPipMode,
    isPipActive,
    onTogglePip: togglePiP,
    isCameraActive: !!activeStream,
    screenShareMode: props.screenShareMode,
    onScreenShareModeChange: props.onScreenShareModeChange,
    activeCinematicEffect: cinematicEffect,
    onCinematicEffectChange: setCinematicEffect,
    manualZoom,
    onManualZoomChange: setManualZoom,
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

      {!activeStream && (
        <div className="absolute inset-0 w-full h-full">
          <AmbientBackground />
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <img
              src="./icon.png"
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

      {/* SVG filter definitions for cinematic effects */}
      <CinematicFilters />

      {(() => {
        const cinematicStyles = getCinematicCanvasStyles(cinematicEffect);
        return (
          <div
            className="w-full h-full relative z-0"
            style={cinematicStyles.container}
          >
            <canvas ref={canvasRef} className="w-full h-full" style={cinematicStyles.canvas} />
          </div>
        );
      })()}

      <CinematicOverlay effect={cinematicEffect} />

      {!props.hidePipToolbar && isHovered &&
        (props.isMouseActive ?? true) &&
        (props.portalContainer instanceof HTMLElement ? (
          createPortal(
            <div
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ zIndex: 9999 }}
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
          // FALLBACK: If no portal, use absolute positioning with high Z-index
          // to try and beat the BottomNavigation.
          // Note: If CanvasContainer has a lower stacking context, this z-index might not escape,
          // which is why the 'bottom-24' position fix in PipControlsToolbar is critical.
          <div className="absolute inset-0 w-full h-full pointer-events-none z-[5000]">
            {/* @ts-ignore */}
            <PipControlsToolbar {...toolbarProps} />
          </div>
        ))}
    </div>
  );
};
