import React, { useRef, useLayoutEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { PictureInPicture, MonitorUp } from "lucide-react";
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

  // Screen sharing
  screenShareMode?: "off" | "screen" | "window";
  onScreenShareModeChange?: (mode: "off" | "screen" | "window") => void;

  // PIP Layout presets (visible during screen share)
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

      // Consider fullscreen if height > 80% of viewport
      setIsFullScreen(rect.height > windowHeight * 0.8);
      setIsFlipped(false);
    }
  }, [props.containerRef]);

  return (
    <div
      ref={toolbarRef}
      className={cn(
        "absolute left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-1",
        "bg-background/60 dark:bg-background/40 backdrop-blur-2xl",
        "border border-border/20 dark:border-white/10 rounded-2xl",
        "shadow-2xl shadow-black/10 dark:shadow-black/30",
        "transition-all duration-300 ease-out pointer-events-auto",
        isFlipped ? "top-3" : isFullScreen ? "bottom-20" : "bottom-3"
      )}
      style={{
        zIndex: "var(--z-text-toolbar)",
        width: "max-content",
        maxWidth: "90vw",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
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

      {/* Screen Share Button */}
      {props.onScreenShareModeChange && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-xl hover:bg-foreground/5 dark:hover:bg-white/10 transition-all",
            props.screenShareMode === "screen" &&
              "bg-primary/15 text-primary hover:bg-primary/20"
          )}
          onClick={() => {
            const next = props.screenShareMode === "screen" ? "off" : "screen";
            props.onScreenShareModeChange?.(next);
          }}
          title={
            props.screenShareMode === "screen" ? "Stop Sharing" : "Share Screen"
          }
        >
          <MonitorUp className="h-3.5 w-3.5" />
        </Button>
      )}

      {/* PIP Layout Menu - visible only during screen sharing */}
      {props.screenShareMode !== "off" && props.onPipLayoutSelect && (
        <PipLayoutMenu
          currentPresetId={props.currentPipLayoutId}
          onPresetSelect={props.onPipLayoutSelect}
          onPositionChange={() => {}}
          onSizeChange={() => {}}
          onShapeChange={() => {}}
          onAspectRatioChange={() => {}}
        />
      )}

      {/* Pop-out Button */}
      {props.onTogglePip && props.isCameraActive && (
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-7 w-7 rounded-xl hover:bg-foreground/5 dark:hover:bg-white/10 transition-all",
            props.isPipActive &&
              "bg-primary/15 text-primary hover:bg-primary/20"
          )}
          onClick={props.onTogglePip}
          title={props.isPipActive ? "Exit Pop-out" : "Pop-out Camera"}
        >
          <PictureInPicture className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  );
};
