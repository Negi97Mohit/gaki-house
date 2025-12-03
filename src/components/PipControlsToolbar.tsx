import React, { useRef, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PictureInPicture } from "lucide-react";
import { cn } from "@/lib/utils";
import { CameraShape } from "@/types/caption";
import { PipCameraMenu } from "./pip-controls/PipCameraMenu";
import { PipBackgroundMenu } from "./pip-controls/PipBackgroundMenu";
import { PipEffectsMenu } from "./pip-controls/PipEffectsMenu";
import { PipStyleMenu } from "./pip-controls/PipStyleMenu";

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
  isCameraActive?: boolean;
}

export const PipControlsToolbar: React.FC<PipControlsToolbarProps> = (
  props
) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  useLayoutEffect(() => {
    if (toolbarRef.current && props.containerRef.current) {
      const toolbarHeight = toolbarRef.current.offsetHeight;
      const toolbarWidth = toolbarRef.current.offsetWidth;
      const containerRect = props.containerRef.current.getBoundingClientRect();
      const parentRect =
        props.containerRef.current.parentElement!.getBoundingClientRect();

      const yAbove = props.position.y - toolbarHeight - 8;
      const wouldOverlapTopToolbar = yAbove < 80;
      const x = props.position.x - toolbarWidth / 2;

      let y: number;
      if (wouldOverlapTopToolbar) {
        y = containerRect.height - toolbarHeight - 90;
      } else {
        y = yAbove;
      }

      const clampedX = Math.max(
        parentRect.left - containerRect.left + 8,
        Math.min(x, parentRect.right - containerRect.left - toolbarWidth - 8)
      );

      const clampedY = Math.max(
        8,
        Math.min(y, containerRect.height - toolbarHeight - 8)
      );

      setToolbarPosition({ x: clampedX, y: clampedY });
    }
  }, [props.position, props.containerRef]);

  return (
    <div
      ref={toolbarRef}
      className="absolute bg-background/40 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl p-1.5 flex items-center gap-0.5"
      style={{
        left: `${toolbarPosition.x}px`,
        top: `${toolbarPosition.y}px`,
        zIndex: "var(--z-text-toolbar)",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <PipCameraMenu
        videoDevices={props.videoDevices}
        selectedDeviceId={props.selectedDeviceId}
        onCameraDeviceChange={props.onCameraDeviceChange}
      />

      {props.showAspectRatio === true && (
        <PipBackgroundMenu
          showAspectRatio={props.showAspectRatio}
          cameraAspectRatio={props.cameraAspectRatio}
          onCameraAspectRatioChange={props.onCameraAspectRatioChange}
          customAspectRatio={props.customAspectRatio}
          onCustomAspectRatioChange={props.onCustomAspectRatioChange}
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
