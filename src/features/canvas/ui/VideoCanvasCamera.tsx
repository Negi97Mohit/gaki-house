import React, { useCallback, useState } from "react";
import { CameraRenderer } from "@/features/stream/ui/CameraRenderer";
import { CanvasSectionCameraState } from "@/types/caption";
import { CanvasHoverToolbar } from "./CanvasHoverToolbar";

interface VideoCanvasCameraProps {
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

export const VideoCanvasCamera: React.FC<VideoCanvasCameraProps> = ({
  stream,
  cameraSettings,
  onCameraSettingsChange,
  pipSize,
  pipBorder,
  pipShadow,
  videoDevices,
  activeSequenceId,
  onUserPositionChange,
  isActive = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Deep merge settings with defaults to prevent undefined props
  const safeSettings = { ...DEFAULT_CAMERA_SETTINGS, ...cameraSettings };

  const handleMouseEnter = useCallback(() => setIsHovered(true), []);
  const handleMouseLeave = useCallback(() => setIsHovered(false), []);

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
          // Pass safe settings to ensure filters apply
          isBeautifyEnabled={safeSettings.isBeautifyEnabled}
          isLowLightEnabled={safeSettings.isLowLightEnabled}
          isAutoFramingEnabled={safeSettings.isAutoFramingEnabled}
          videoFilter={safeSettings.videoFilter}
          isNeonEdgeEnabled={safeSettings.isNeonEdgeEnabled}
          neonIntensity={safeSettings.neonIntensity}
          neonColor={safeSettings.neonColor}
          zoomSensitivity={safeSettings.zoomSensitivity}
          trackingSpeed={safeSettings.trackingSpeed}
          cameraAspectRatio={safeSettings.cameraAspectRatio}
          customAspectRatio={safeSettings.customAspectRatio}
          isFaceTrackingEnabled={safeSettings.isFaceTrackingEnabled}
          activeInteractiveFilter={safeSettings.activeInteractiveFilter}
          filterIntensity={safeSettings.filterIntensity}
          filterColor={safeSettings.filterColor}
          filterTarget={safeSettings.filterTarget}
          cameraBackground={safeSettings.cameraBackground}
          // Callbacks
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

      {isHovered && isActive && (
        <div className="absolute top-2 right-2 z-50">
          {/* Controls can go here if not using the floating toolbar */}
        </div>
      )}
    </div>
  );
};
