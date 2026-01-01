import React, { useRef, useLayoutEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { PictureInPicture } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CameraShape } from "@/types/caption";
import { PipCameraMenu } from "./pip/PipCameraMenu";
import { PipBackgroundMenu } from "./pip/PipBackgroundMenu";
import { PipEffectsMenu } from "./pip/PipEffectsMenu";
import { PipStyleMenu } from "./pip/PipStyleMenu";
import { PipLayoutMenu, PipLayoutPreset } from "./pip/PipLayoutMenu";

interface PipControlsToolbarProps {
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLElement>;
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
  videoFilter: string;
  onVideoFilterChange: (filter: string) => void;
  isNeonEdgeEnabled: boolean;
  onNeonEdgeToggle: (enabled: boolean) => void;
  neonIntensity: number;
  onNeonIntensityChange: (value: number) => void;
  neonEdgeColor?: string;
  onNeonEdgeColorChange: (color: string) => void;
  zoomSensitivity: number;
  onZoomSensitivityChange: (value: number) => void;
  trackingSpeed: number;
  onTrackingSpeedChange: (value: number) => void;
  cameraBackground: "none" | "blur" | "image";
  onCameraBackgroundChange: (bgId: "none" | "blur" | "image") => void;
  onCustomBackgroundUpload: (file: File) => void;
  cameraAspectRatio: string;
  onCameraAspectRatioChange: (ratio: string) => void;
  customAspectRatio: string;
  onCustomAspectRatioChange: (ratio: string) => void;
  isFaceTrackingEnabled: boolean;
  onFaceTrackingToggle: (enabled: boolean) => void;
  activeInteractiveFilter?: string;
  onInteractiveFilterChange?: (filter: string) => void;
  filterIntensity?: number;
  onFilterIntensityChange?: (intensity: number) => void;
  filterColor?: string;
  onFilterColorChange?: (color: string) => void;
  filterTarget?: "both" | "background" | "person";
  onFilterTargetChange?: (target: "both" | "background" | "person") => void;
  videoDevices: MediaDeviceInfo[];
  selectedDeviceId?: string;
  onCameraDeviceChange: (deviceId: string) => void;

  showAspectRatio?: boolean;
  cameraShape?: CameraShape;
  onCameraShapeChange?: (shape: CameraShape) => void;

  isPipActive?: boolean;
  onTogglePip?: () => void;
  onEnterPipMode?: () => void;
  isCameraActive?: boolean;

  // Screen share mode to show PIP layout menu
  screenShareMode?: "off" | "screen" | "canvas";

  // PIP Layout preset props
  currentPipLayoutId?: string;
  onPipLayoutSelect?: (preset: PipLayoutPreset) => void;
}

export const PipControlsToolbar: React.FC<PipControlsToolbarProps> = (
  props
) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  // Detect context: Full Screen vs PiP Window
  useLayoutEffect(() => {
    if (props.containerRef.current) {
      const rect = props.containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // 1. Check if we are "Full Screen" (height is > 80% of window)
      // If so, we are likely blocked by the BottomNavigation bar.
      const isTall = rect.height > windowHeight * 0.8;
      setIsFullScreen(isTall);

      // 2. Flip logic (optional, if at very bottom edge)
      // Usually bottom docking is fine if we have margin
      setIsFlipped(false);
    }
  }, [props.containerRef]);

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 p-1.5",
        "bg-background/40 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl",
        "transition-all duration-200 ease-out pointer-events-auto",
        // POSITIONING LOGIC:
        // If Full Screen: Move up to 'bottom-24' (approx 96px) to clear the BottomNavigation (which is ~72px tall/offset).
        // If PiP Window: Keep at 'bottom-4' for tight packing.
        isFlipped ? "top-4" : isFullScreen ? "bottom-24" : "bottom-4"
      )}
      style={{
        zIndex: "var(--z-text-toolbar)",
        width: "max-content",
        maxWidth: "90vw",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <PipCameraMenu
        videoDevices={props.videoDevices}
        selectedDeviceId={props.selectedDeviceId}
        onCameraDeviceChange={props.onCameraDeviceChange}
      />

      {props.showAspectRatio !== false && (
        <PipBackgroundMenu
          showAspectRatio={props.showAspectRatio}
          cameraAspectRatio={props.cameraAspectRatio}
          onCameraAspectRatioChange={props.onCameraAspectRatioChange}
          customAspectRatio={props.customAspectRatio}
          onCustomAspectRatioChange={props.onCustomAspectRatioChange}
          onEnterPipMode={props.onEnterPipMode}
        />
      )}

      <PipEffectsMenu
        videoFilter={props.videoFilter}
        onVideoFilterChange={props.onVideoFilterChange}
        activeInteractiveFilter={props.activeInteractiveFilter}
        onInteractiveFilterChange={props.onInteractiveFilterChange}
      />

      <PipStyleMenu
        cameraShape={props.cameraShape}
        onCameraShapeChange={props.onCameraShapeChange}
        pipBorder={props.pipBorder}
        onPipBorderChange={props.onPipBorderChange}
        pipShadow={props.pipShadow}
        onPipShadowChange={props.onPipShadowChange}
        isBeautifyEnabled={props.isBeautifyEnabled}
        onBeautifyToggle={props.onBeautifyToggle}
        isLowLightEnabled={props.isLowLightEnabled}
        onLowLightToggle={props.onLowLightToggle}
        isAutoFramingEnabled={props.isAutoFramingEnabled}
        onAutoFramingChange={props.onAutoFramingChange}
        zoomSensitivity={props.zoomSensitivity}
        onZoomSensitivityChange={props.onZoomSensitivityChange}
        trackingSpeed={props.trackingSpeed}
        onTrackingSpeedChange={props.onTrackingSpeedChange}
        isNeonEdgeEnabled={props.isNeonEdgeEnabled}
        onNeonEdgeToggle={props.onNeonEdgeToggle}
        neonIntensity={props.neonIntensity}
        onNeonIntensityChange={props.onNeonIntensityChange}
        neonEdgeColor={props.neonEdgeColor}
        onNeonEdgeColorChange={props.onNeonEdgeColorChange}
      />

      {/* PIP Layout Menu - Only visible during screen sharing */}
      {props.screenShareMode && props.screenShareMode !== "off" && props.onPipLayoutSelect && (
        <PipLayoutMenu
          currentPresetId={props.currentPipLayoutId}
          onPresetSelect={props.onPipLayoutSelect}
          onPositionChange={() => {}}
          onSizeChange={() => {}}
          onShapeChange={() => {}}
          onAspectRatioChange={() => {}}
        />
      )}

      {/* Pop-out Button - Only visible when camera is active */}
      {props.onTogglePip && props.isCameraActive && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl hover:bg-background/60",
            props.isPipActive &&
              "bg-primary/20 text-primary hover:bg-primary/30"
          )}
          onClick={props.onTogglePip}
          title={props.isPipActive ? "Exit Pop-out" : "Pop-out Camera"}
        >
          <PictureInPicture className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
};
