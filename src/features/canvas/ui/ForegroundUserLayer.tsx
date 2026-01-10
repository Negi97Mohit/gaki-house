import React, { useMemo } from "react";
import { useWebGLRenderLoop } from "@/features/canvas/hooks/useWebGLRenderLoop";
import { CameraShape, LayoutMode } from "@/types/caption";
import {
  getCameraShapeStyle,
  getNumericAspectRatio,
} from "@/features/canvas/ui/VideoCanvasHelpers";
import { cn } from "@/shared/lib/utils";

interface ForegroundUserLayerProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  processedCanvas: HTMLCanvasElement | null;
  facePositionRef: React.MutableRefObject<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>;
  videoFilter: string;
  isAutoFramingEnabled: boolean;
  zoomSensitivity: number;
  trackingSpeed: number;
  containerSize: { width: number; height: number };

  // PiP Props
  layoutMode?: LayoutMode;
  pipPosition?: { x: number; y: number };
  pipSize?: { width: number; height: number };
  pipRotation?: number;
  cameraShape?: CameraShape;
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  customMaskUrl?: string;
  sidebarProps?: any;

  // FIX: Add isCameraOn prop to control visibility
  isCameraOn?: boolean;
}

export const ForegroundUserLayer: React.FC<ForegroundUserLayerProps> = ({
  videoRef,
  processedCanvas,
  facePositionRef,
  videoFilter,
  isAutoFramingEnabled,
  zoomSensitivity,
  trackingSpeed,
  containerSize,
  layoutMode,
  pipPosition,
  pipSize,
  pipRotation = 0,
  cameraShape = "rectangle",
  pipBorder,
  pipShadow,
  customMaskUrl,
  sidebarProps,
  // FIX: Default to true for backward compatibility, but parent should pass this
  isCameraOn = true,
}) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  useWebGLRenderLoop({
    canvasRef,
    videoRef,
    activeStream: undefined, // Don't manage stream
    videoFilter,
    processedCanvas,
    facePositionRef,
    isAutoFramingEnabled,
    zoomSensitivity,
    trackingSpeed,
    isMasked: true, // Enable masked rendering
  });

  // Calculate effective size if in PiP mode (matching PipWindow logic)
  const effectivePipStyle = useMemo(() => {
    if (layoutMode !== "pip" || !pipSize || !containerSize.width) return {};

    const currentAspectRatio = sidebarProps
      ? getNumericAspectRatio(
          cameraShape,
          sidebarProps.cameraAspectRatio,
          sidebarProps.customAspectRatio
        )
      : false;

    const effectiveSize = { ...pipSize };

    if (
      typeof currentAspectRatio === "number" &&
      containerSize.width > 0 &&
      containerSize.height > 0
    ) {
      const widthPx = (pipSize.width / 100) * containerSize.width;
      const heightPx = widthPx / currentAspectRatio;
      effectiveSize.height = (heightPx / containerSize.height) * 100;
    }

    // Shape Styles
    const shapeStyle = getCameraShapeStyle(cameraShape, pipBorder, pipShadow);
    if (customMaskUrl) {
      shapeStyle.maskImage = `url(${customMaskUrl})`;
      (shapeStyle as any).WebkitMaskImage = `url(${customMaskUrl})`;
      shapeStyle.maskSize = "contain";
      (shapeStyle as any).WebkitMaskSize = "contain";
      shapeStyle.maskRepeat = "no-repeat";
      (shapeStyle as any).WebkitMaskRepeat = "no-repeat";
      shapeStyle.maskPosition = "center";
      (shapeStyle as any).WebkitMaskPosition = "center";
    }

    return {
      left: `${pipPosition?.x ?? 0}%`,
      top: `${pipPosition?.y ?? 0}%`,
      width: `${effectiveSize.width}%`,
      height: `${effectiveSize.height}%`,
      transform: `rotate(${pipRotation}deg)`,
      transformOrigin: "center center",
      ...shapeStyle,
    };
  }, [
    layoutMode,
    pipSize,
    pipPosition,
    pipRotation,
    cameraShape,
    pipBorder,
    pipShadow,
    customMaskUrl,
    containerSize,
    sidebarProps,
  ]);

  // FIX: Early return if camera is off.
  // This unmounts the canvas, ensuring no stale shadow/mask remains.
  if (!isCameraOn) {
    return null;
  }

  const isPip = layoutMode === "pip";

  return (
    <div
      className={cn(
        "absolute pointer-events-none z-[1000]",
        // If not PiP, full screen, else positioned
        !isPip && "inset-0 w-full h-full"
      )}
      style={isPip ? effectivePipStyle : undefined}
    >
      {/* Added pointer-events-none to the canvas itself to ensure click-through */}
      <canvas
        ref={canvasRef}
        className="w-full h-full object-cover pointer-events-none"
      />
    </div>
  );
};
