import React from "react";
import { CanvasSectionCameraState } from "@/types/caption";
import { CameraRenderer } from "@/components/CameraRenderer";
import { InteractiveGridSection } from "@/components/InteractiveGridSection";

interface CameraGridSectionProps {
  sectionId: string;
  settings: CanvasSectionCameraState;
  cameraStream: MediaStream | null;
  videoDevices: MediaDeviceInfo[];
  onSectionCameraSettingsChange: (
    sectionId: string,
    settings: Partial<CanvasSectionCameraState>
  ) => void;
  cameraShape: "rectangle" | "circle" | "rounded";
  backgroundEffect: "none" | "blur" | "image";
  activeSequenceId?: string | null;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
  backgroundImageUrl?: string;
}

// Default fallback to prevent crashes
const DEFAULT_SETTINGS: CanvasSectionCameraState = {
  layoutMode: "solo",
  selectedDeviceId: "",
  pipBorder: { color: "#FFF", width: 0 },
  pipShadow: { blur: 0, color: "transparent" },
  isAutoFramingEnabled: false,
  isBeautifyEnabled: false,
  isLowLightEnabled: false,
  videoFilter: "none",
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
};

export const CameraGridSection: React.FC<CameraGridSectionProps> = ({
  sectionId,
  settings,
  cameraStream,
  videoDevices,
  onSectionCameraSettingsChange,
  cameraShape,
  backgroundEffect,
  activeSequenceId,
  onUserPositionChange,
  backgroundImageUrl,
}) => {
  // Safety check: Use defaults if settings are undefined
  const safeSettings = settings || DEFAULT_SETTINGS;

  if (safeSettings.layoutMode === "pip") {
    return (
      <InteractiveGridSection
        sectionId={sectionId}
        settings={safeSettings}
        onUpdate={(newSettings) =>
          onSectionCameraSettingsChange(sectionId, newSettings)
        }
        cameraStream={cameraStream}
        videoDevices={videoDevices}
        isActive={true}
        onSelect={() => {}}
      />
    );
  }

  return (
    <CameraRenderer
      stream={cameraStream}
      className="w-full h-full object-cover"
      style={{
        borderRadius:
          cameraShape === "circle"
            ? "50%"
            : cameraShape === "rounded"
            ? "12px"
            : "0",
      }}
      portalContainer={null}
      videoDevices={videoDevices}
      selectedDeviceId={safeSettings.selectedDeviceId}
      onCameraDeviceChange={(deviceId) =>
        onSectionCameraSettingsChange(sectionId, {
          selectedDeviceId: deviceId,
        })
      }
      pipBorder={safeSettings.pipBorder}
      onPipBorderChange={(border) =>
        onSectionCameraSettingsChange(sectionId, {
          pipBorder: border,
        })
      }
      pipShadow={safeSettings.pipShadow}
      onPipShadowChange={(shadow) =>
        onSectionCameraSettingsChange(sectionId, {
          pipShadow: shadow,
        })
      }
      isAutoFramingEnabled={safeSettings.isAutoFramingEnabled}
      onAutoFramingChange={(enabled) =>
        onSectionCameraSettingsChange(sectionId, {
          isAutoFramingEnabled: enabled,
        })
      }
      isBeautifyEnabled={safeSettings.isBeautifyEnabled}
      onBeautifyToggle={(enabled) =>
        onSectionCameraSettingsChange(sectionId, {
          isBeautifyEnabled: enabled,
        })
      }
      isLowLightEnabled={safeSettings.isLowLightEnabled}
      onLowLightToggle={(enabled) =>
        onSectionCameraSettingsChange(sectionId, {
          isLowLightEnabled: enabled,
        })
      }
      videoFilter={safeSettings.videoFilter}
      onVideoFilterChange={(filter) =>
        onSectionCameraSettingsChange(sectionId, {
          videoFilter: filter,
          activeInteractiveFilter: "none",
        })
      }
      isNeonEdgeEnabled={safeSettings.isNeonEdgeEnabled}
      onNeonEdgeToggle={(enabled) =>
        onSectionCameraSettingsChange(sectionId, {
          isNeonEdgeEnabled: enabled,
        })
      }
      neonIntensity={safeSettings.neonIntensity}
      onNeonIntensityChange={(value) =>
        onSectionCameraSettingsChange(sectionId, {
          neonIntensity: value,
        })
      }
      neonColor={safeSettings.neonColor}
      onNeonEdgeColorChange={(color) =>
        onSectionCameraSettingsChange(sectionId, {
          neonColor: color,
        })
      }
      zoomSensitivity={safeSettings.zoomSensitivity}
      onZoomSensitivityChange={(value) =>
        onSectionCameraSettingsChange(sectionId, {
          zoomSensitivity: value,
        })
      }
      trackingSpeed={safeSettings.trackingSpeed}
      onTrackingSpeedChange={(value) =>
        onSectionCameraSettingsChange(sectionId, {
          trackingSpeed: value,
        })
      }
      cameraAspectRatio={safeSettings.cameraAspectRatio}
      onCameraAspectRatioChange={(ratio) =>
        onSectionCameraSettingsChange(sectionId, {
          cameraAspectRatio: ratio,
        })
      }
      customAspectRatio={safeSettings.customAspectRatio}
      onCustomAspectRatioChange={(ratio) =>
        onSectionCameraSettingsChange(sectionId, {
          customAspectRatio: ratio,
        })
      }
      isFaceTrackingEnabled={safeSettings.isFaceTrackingEnabled}
      onFaceTrackingToggle={(enabled) =>
        onSectionCameraSettingsChange(sectionId, {
          isFaceTrackingEnabled: enabled,
        })
      }
      activeInteractiveFilter={safeSettings.activeInteractiveFilter}
      onInteractiveFilterChange={(filter) =>
        onSectionCameraSettingsChange(sectionId, {
          activeInteractiveFilter: filter as any,
          videoFilter: "none",
        })
      }
      filterIntensity={safeSettings.filterIntensity}
      onFilterIntensityChange={(value) =>
        onSectionCameraSettingsChange(sectionId, {
          filterIntensity: value,
        })
      }
      filterColor={safeSettings.filterColor}
      onFilterColorChange={(color) =>
        onSectionCameraSettingsChange(sectionId, {
          filterColor: color,
        })
      }
      filterTarget={safeSettings.filterTarget}
      onFilterTargetChange={(target) =>
        onSectionCameraSettingsChange(sectionId, {
          filterTarget: target,
        })
      }
      onUserPositionChange={
        sectionId === activeSequenceId ? onUserPositionChange : undefined
      }
    />
  );
};
