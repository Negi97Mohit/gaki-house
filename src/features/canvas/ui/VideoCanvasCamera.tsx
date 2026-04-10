import React, { useCallback, useState } from "react";
import { CameraRenderer } from "@/features/stream/ui/CameraRenderer";
import { CanvasSectionCameraState, CameraShape } from "@/types/caption";

// Legacy props interface for backward compatibility with CanvasView
interface LegacyVideoCanvasCameraProps {
  className?: string;
  style?: React.CSSProperties;
  stream: MediaStream | null;
  isCameraOn?: boolean;
  cameraShape?: CameraShape;
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  videoFilter?: string;
  isBeautifyEnabled?: boolean;
  isLowLightEnabled?: boolean;
  isAutoFramingEnabled?: boolean;
  videoDevices?: MediaDeviceInfo[];
  selectedVideoDevice?: string;
  onVideoDeviceSelect?: (deviceId: string) => void;
  onCameraShapeChange?: (shape: CameraShape) => void;
  portalContainer?: HTMLElement | null;
  isMouseActive?: boolean;
  sidebarProps?: any;
  screenShareMode?: "off" | "screen" | "canvas";
  onScreenShareModeChange?: (mode: "off" | "screen" | "canvas") => void;
  onLayoutModeChange?: (mode: any) => void;
  externalVideoRef?: React.RefObject<HTMLVideoElement>;
  processedCanvas?: HTMLCanvasElement | null;
  facePositionRef?: React.MutableRefObject<any>;
  onPipPositionChange?: (pos: { x: number; y: number }) => void;
  onPipSizeChange?: (size: { width: number; height: number }) => void;
  onCameraAspectRatioChange?: (ratio: string) => void;
  onCameraCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

// New props interface for grid sections
interface NewVideoCanvasCameraProps {
  stream: MediaStream | null;
  cameraSettings: CanvasSectionCameraState;
  onCameraSettingsChange: (settings: Partial<CanvasSectionCameraState>) => void;
  pipSize?: { width: number; height: number };
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  videoDevices?: MediaDeviceInfo[];
  activeSequenceId?: string | null;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
  isActive?: boolean;
  onCameraCanvasReady?: (canvas: HTMLCanvasElement) => void;
}

// Union type for both APIs
type VideoCanvasCameraProps = LegacyVideoCanvasCameraProps | NewVideoCanvasCameraProps;

// Type guard to check if it's using new API
function isNewAPI(props: VideoCanvasCameraProps): props is NewVideoCanvasCameraProps {
  return 'cameraSettings' in props;
}

const DEFAULT_CAMERA_SETTINGS: Partial<CanvasSectionCameraState> = {
  videoFilter: "none",
  isBeautifyEnabled: false,
  isLowLightEnabled: false,
  isAutoFramingEnabled: false,
  isNeonEdgeEnabled: false,
  neonIntensity: 50,
  neonColor: "#00FFFF",
  zoomSensitivity: 1,
  trackingSpeed: 0.5,
  cameraAspectRatio: "16:9",
  customAspectRatio: "",
  isFaceTrackingEnabled: false,
  activeInteractiveFilter: "none",
  filterIntensity: 100,
  filterColor: "#000",
  filterTarget: "background",
  cameraBackground: "none",
  pipBorder: { color: "#FFF", width: 0 },
  pipShadow: { blur: 0, color: "transparent" },
};

export const VideoCanvasCamera: React.FC<VideoCanvasCameraProps> = (props) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

  // Handle new API (grid sections)
  if (isNewAPI(props)) {
    const {
      stream,
      cameraSettings,
      onCameraSettingsChange,
      pipBorder,
      pipShadow,
      videoDevices,
      activeSequenceId,
      onUserPositionChange,
      onCameraCanvasReady,
    } = props;

    const safeSettings = { ...DEFAULT_CAMERA_SETTINGS, ...cameraSettings };

    return (
      <div
        className="w-full h-full relative group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="w-full h-full" style={{ overflow: "hidden" }}>
          <CameraRenderer
            stream={stream}
            className="w-full h-full object-cover"
            selectedDeviceId={safeSettings.selectedDeviceId}
            videoDevices={videoDevices}
            onCameraDeviceChange={(id) =>
              onCameraSettingsChange({ selectedDeviceId: id })
            }
            isBeautifyEnabled={safeSettings.isBeautifyEnabled}
            isLowLightEnabled={safeSettings.isLowLightEnabled}
            isAutoFramingEnabled={safeSettings.isAutoFramingEnabled}
            videoFilter={safeSettings.videoFilter || "none"}
            onCameraCanvasReady={onCameraCanvasReady}
            isNeonEdgeEnabled={safeSettings.isNeonEdgeEnabled}
            neonIntensity={safeSettings.neonIntensity || 50}
            neonColor={safeSettings.neonColor || "#00FFFF"}
            zoomSensitivity={safeSettings.zoomSensitivity || 1}
            trackingSpeed={safeSettings.trackingSpeed || 0.5}
            cameraAspectRatio={safeSettings.cameraAspectRatio}
            customAspectRatio={safeSettings.customAspectRatio || ""}
            isFaceTrackingEnabled={safeSettings.isFaceTrackingEnabled}
            activeInteractiveFilter={safeSettings.activeInteractiveFilter}
            filterIntensity={safeSettings.filterIntensity}
            filterColor={safeSettings.filterColor}
            filterTarget={safeSettings.filterTarget}
            onBeautifyToggle={(enabled) =>
              onCameraSettingsChange({ isBeautifyEnabled: enabled })
            }
            onLowLightToggle={(enabled) =>
              onCameraSettingsChange({ isLowLightEnabled: enabled })
            }
            onAutoFramingChange={(enabled) =>
              onCameraSettingsChange({ isAutoFramingEnabled: enabled })
            }
            onVideoFilterChange={(filter) =>
              onCameraSettingsChange({
                videoFilter: filter,
                activeInteractiveFilter: "none",
              })
            }
            onNeonEdgeToggle={(enabled) =>
              onCameraSettingsChange({ isNeonEdgeEnabled: enabled })
            }
            onNeonIntensityChange={(val) =>
              onCameraSettingsChange({ neonIntensity: val })
            }
            onNeonEdgeColorChange={(col) =>
              onCameraSettingsChange({ neonColor: col })
            }
            onZoomSensitivityChange={(val) =>
              onCameraSettingsChange({ zoomSensitivity: val })
            }
            onTrackingSpeedChange={(val) =>
              onCameraSettingsChange({ trackingSpeed: val })
            }
            onCameraAspectRatioChange={(ratio) =>
              onCameraSettingsChange({ cameraAspectRatio: ratio })
            }
            onCustomAspectRatioChange={(ratio) =>
              onCameraSettingsChange({ customAspectRatio: ratio })
            }
            onFaceTrackingToggle={(enabled) =>
              onCameraSettingsChange({ isFaceTrackingEnabled: enabled })
            }
            onInteractiveFilterChange={(filter) =>
              onCameraSettingsChange({
                activeInteractiveFilter: filter as any,
                videoFilter: "none",
              })
            }
            onFilterIntensityChange={(val) =>
              onCameraSettingsChange({ filterIntensity: val })
            }
            onFilterColorChange={(col) =>
              onCameraSettingsChange({ filterColor: col })
            }
            onFilterTargetChange={(target) =>
              onCameraSettingsChange({ filterTarget: target })
            }
            pipBorder={pipBorder || safeSettings.pipBorder}
            pipShadow={pipShadow || safeSettings.pipShadow}
            onPipBorderChange={(b) => onCameraSettingsChange({ pipBorder: b })}
            onPipShadowChange={(s) => onCameraSettingsChange({ pipShadow: s })}
            onUserPositionChange={
              activeSequenceId ? onUserPositionChange : undefined
            }
          />
        </div>
      </div>
    );
  }

  // Handle legacy API (CanvasView)
  const {
    className,
    style,
    stream,
    pipBorder,
    pipShadow,
    videoFilter = "none",
    isBeautifyEnabled = false,
    isLowLightEnabled = false,
    isAutoFramingEnabled = false,
    videoDevices,
    selectedVideoDevice,
    onVideoDeviceSelect,
    portalContainer,
    isMouseActive,
    sidebarProps,
    externalVideoRef,
    processedCanvas,
    facePositionRef,
    onCameraAspectRatioChange,
    onCameraCanvasReady,
  } = props;

  return (
    <div
      className={`w-full h-full relative group ${className || ""}`}
      style={style}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="w-full h-full" style={{ overflow: "hidden" }}>
        <CameraRenderer
          stream={stream}
          className="w-full h-full object-cover"
          selectedDeviceId={selectedVideoDevice}
          videoDevices={videoDevices}
          onCameraDeviceChange={onVideoDeviceSelect}
          isBeautifyEnabled={isBeautifyEnabled}
          isLowLightEnabled={isLowLightEnabled}
          isAutoFramingEnabled={isAutoFramingEnabled}
          videoFilter={videoFilter}
          onCameraCanvasReady={onCameraCanvasReady}
          isNeonEdgeEnabled={sidebarProps?.isNeonEdgeEnabled || false}
          neonIntensity={sidebarProps?.neonIntensity || 50}
          neonColor={sidebarProps?.neonColor || "#00FFFF"}
          zoomSensitivity={sidebarProps?.zoomSensitivity || 1}
          trackingSpeed={sidebarProps?.trackingSpeed || 0.5}
          cameraAspectRatio={sidebarProps?.cameraAspectRatio || "16:9"}
          customAspectRatio={sidebarProps?.customAspectRatio || ""}
          isFaceTrackingEnabled={sidebarProps?.isFaceTrackingEnabled || false}
          activeInteractiveFilter={sidebarProps?.activeInteractiveFilter || "none"}
          filterIntensity={sidebarProps?.filterIntensity || 100}
          filterColor={sidebarProps?.filterColor || "#000"}
          filterTarget={sidebarProps?.filterTarget || "both"}
          onBeautifyToggle={sidebarProps?.onBeautifyToggle}
          onLowLightToggle={sidebarProps?.onLowLightToggle}
          onAutoFramingChange={sidebarProps?.onAutoFramingToggle}
          onVideoFilterChange={sidebarProps?.onVideoFilterChange}
          onNeonEdgeToggle={sidebarProps?.onNeonEdgeToggle}
          onNeonIntensityChange={sidebarProps?.onNeonIntensityChange}
          onNeonEdgeColorChange={sidebarProps?.onNeonEdgeColorChange}
          onZoomSensitivityChange={sidebarProps?.onZoomSensitivityChange}
          onTrackingSpeedChange={sidebarProps?.onTrackingSpeedChange}
          onCameraAspectRatioChange={onCameraAspectRatioChange || sidebarProps?.onCameraAspectRatioChange}
          onCustomAspectRatioChange={sidebarProps?.onCustomAspectRatioChange}
          onFaceTrackingToggle={sidebarProps?.onFaceTrackingToggle}
          onInteractiveFilterChange={sidebarProps?.onInteractiveFilterChange}
          onFilterIntensityChange={sidebarProps?.onFilterIntensityChange}
          onFilterColorChange={sidebarProps?.onFilterColorChange}
          onFilterTargetChange={sidebarProps?.onFilterTargetChange}
          pipBorder={pipBorder}
          pipShadow={pipShadow}
          onPipBorderChange={sidebarProps?.onPipBorderChange}
          onPipShadowChange={sidebarProps?.onPipShadowChange}
          portalContainer={portalContainer}
          isMouseActive={isMouseActive}
          externalVideoRef={externalVideoRef}
          processedCanvas={processedCanvas}
          facePositionRef={facePositionRef}
        />
      </div>
    </div>
  );
};