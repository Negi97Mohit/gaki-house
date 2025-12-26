import React from "react";
import { cn } from "@/shared/lib/utils";
import { CameraRenderer } from "@/features/stream/ui/CameraRenderer";
import {
  getCameraShapeStyle,
  getVideoFilterStyle,
} from "@/features/canvas/ui/VideoCanvasHelpers";
import { CameraShape, LayoutMode } from "@/types/caption";

export interface VideoCanvasCameraProps {
  className?: string;
  style?: React.CSSProperties;
  stream: MediaStream | null;
  cameraShape: CameraShape;
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  videoFilter: string;
  isBeautifyEnabled: boolean;
  isLowLightEnabled: boolean;
  isAutoFramingEnabled: boolean;
  videoDevices: MediaDeviceInfo[];
  selectedVideoDevice: string | undefined;
  onVideoDeviceSelect: (deviceId: string) => void;
  onCameraShapeChange: (shape: CameraShape) => void;
  portalContainer?: HTMLElement | null | undefined;
  isMouseActive: boolean;
  sidebarProps: any;
  screenShareMode: "off" | "screen" | "canvas";
  onScreenShareModeChange: (mode: "off" | "screen" | "canvas") => void;
  onLayoutModeChange: (mode: LayoutMode) => void;
  externalVideoRef?: React.RefObject<HTMLVideoElement>;
  processedCanvas?: HTMLCanvasElement | null;
  facePositionRef?: React.MutableRefObject<any>;
}

// 3. Wrap component in React.memo
export const VideoCanvasCamera = React.memo<VideoCanvasCameraProps>((props) => {
  const {
    style: _unsafeStyle,
    width: _unsafeWidth,
    height: _unsafeHeight,
    className: _unsafeClassName,
    ...safeSidebarProps
  } = props.sidebarProps || {};

  const handleEnterPipMode = () => {
    if (props.screenShareMode === "off") {
      props.onScreenShareModeChange("canvas");
      props.onLayoutModeChange("pip");
    }
  };

  return (
    <div
      className={cn("w-full h-full", props.className)}
      style={{
        ...getCameraShapeStyle(
          props.cameraShape,
          props.pipBorder,
          props.pipShadow
        ),
        ...props.style,
      }}
    >
      <CameraRenderer
        stream={props.stream}
        className="w-full h-full"
        portalContainer={props.portalContainer}
        style={props.style}
        videoFilter={getVideoFilterStyle(
          props.videoFilter,
          props.isBeautifyEnabled,
          props.isLowLightEnabled
        )}
        cameraShape={props.cameraShape}
        onCameraShapeChange={props.onCameraShapeChange}
        isAutoFramingEnabled={props.isAutoFramingEnabled}
        videoDevices={props.videoDevices}
        selectedDeviceId={props.selectedVideoDevice}
        onCameraDeviceChange={props.onVideoDeviceSelect}
        pipBorder={props.pipBorder}
        pipShadow={props.pipShadow}
        showAspectRatio={true}
        onEnterPipMode={handleEnterPipMode}
        isMouseActive={props.isMouseActive}
        externalVideoRef={props.externalVideoRef}
        processedCanvas={props.processedCanvas}
        facePositionRef={props.facePositionRef}
        {...safeSidebarProps}
      />
    </div>
  );
});
