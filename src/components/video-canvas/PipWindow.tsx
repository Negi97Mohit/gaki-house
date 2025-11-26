import React, { useRef, useState } from "react";
import { Rnd } from "react-rnd";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { CameraShape } from "@/types/caption";

interface PipWindowProps {
  sceneId: string;
  containerSize: { width: number; height: number };
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  cameraShape: CameraShape;
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  pipRotation?: number;
  customMaskUrl?: string;
  screenShareMode: "off" | "screen" | "canvas";

  onPipPositionChange: (pos: { x: number; y: number }) => void;
  onPipSizeChange: (size: { width: number; height: number }) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;

  // Render props for content
  renderContent: (
    className?: string,
    style?: React.CSSProperties,
    isPip?: boolean,
    cameraShape?: CameraShape
  ) => React.ReactNode;
  renderScreen: (className?: string) => React.ReactNode;

  // Aspect ratio helpers
  currentAspectRatio?: number | boolean;
}

const SNAP_THRESHOLD = 5;

export const PipWindow: React.FC<PipWindowProps> = ({
  sceneId,
  containerSize,
  pipPosition,
  pipSize,
  cameraShape,
  pipBorder,
  pipShadow,
  customMaskUrl,
  screenShareMode,
  onPipPositionChange,
  onPipSizeChange,
  onInternalDragStart,
  onInternalDragStop,
  renderContent,
  renderScreen,
  currentAspectRatio,
}) => {
  const pipRndRef = useRef<Rnd | null>(null);
  const [pipContent, setPipContent] = useState<"camera" | "share">("camera");

  const getCameraShapeStyle = () => {
    const baseStyle: React.CSSProperties = {
      overflow: "hidden",
      transition: "all 0.3s ease",
    };

    if (pipBorder && pipBorder.width > 0) {
      baseStyle.border = `${pipBorder.width}px solid ${pipBorder.color}`;
    }

    if (pipShadow && pipShadow.blur > 0) {
      baseStyle.boxShadow = `0 0 ${pipShadow.blur}px ${pipShadow.color}`;
    }

    if (customMaskUrl) {
      return {
        ...baseStyle,
        maskImage: `url(${customMaskUrl})`,
        WebkitMaskImage: `url(${customMaskUrl})`,
        maskSize: "contain",
        WebkitMaskSize: "contain",
        maskRepeat: "no-repeat",
        WebkitMaskRepeat: "no-repeat",
        maskPosition: "center",
        WebkitMaskPosition: "center",
      };
    }
    switch (cameraShape) {
      case "circle":
        return { ...baseStyle, borderRadius: "50%" };
      case "rounded":
        return { ...baseStyle, borderRadius: "16px" };
      case "rectangle":
      default:
        return { ...baseStyle, borderRadius: "0" };
    }
  };

  const handlePipDragStop = (e: any, d: { x: number; y: number }) => {
    // Convert top-left pixel to top-left percentage
    let newX = (d.x / containerSize.width) * 100;
    let newY = (d.y / containerSize.height) * 100;

    const pipWidthPercent = pipSize.width;
    const pipHeightPercent =
      cameraShape === "circle"
        ? (pipSize.width * containerSize.width) / containerSize.height
        : pipSize.height;

    // Snapping logic
    if (newX < SNAP_THRESHOLD) newX = 2;
    if (newX > 100 - pipWidthPercent - SNAP_THRESHOLD)
      newX = 98 - pipWidthPercent;
    if (newY < SNAP_THRESHOLD) newY = 2;
    if (newY > 100 - pipHeightPercent - SNAP_THRESHOLD)
      newY = 98 - pipHeightPercent;

    // Boundary Enforcement
    newX = Math.max(0, Math.min(newX, 100 - pipWidthPercent));
    newY = Math.max(0, Math.min(newY, 100 - pipHeightPercent));

    onPipPositionChange({ x: newX, y: newY });
  };

  const handlePipResizeStop = (
    e: any,
    direction: any,
    ref: HTMLElement,
    delta: any,
    position: any
  ) => {
    const newWidthPx = parseInt(ref.style.width, 10);
    let newWidth = (newWidthPx / containerSize.width) * 100;

    let newHeight =
      currentAspectRatio && typeof currentAspectRatio === "number"
        ? (newWidthPx / currentAspectRatio / containerSize.height) * 100
        : (parseInt(ref.style.height, 10) / containerSize.height) * 100;

    let newX = (position.x / containerSize.width) * 100;
    let newY = (position.y / containerSize.height) * 100;

    // Boundary Enforcement
    newX = Math.max(0, Math.min(newX, 100 - newWidth));
    newY = Math.max(0, Math.min(newY, 100 - newHeight));
    newWidth = Math.min(newWidth, 100 - newX);
    newHeight = Math.min(newHeight, 100 - newY);

    onPipSizeChange({
      width: Math.max(10, Math.min(100, newWidth)),
      height: Math.max(10, Math.min(100, newHeight)),
    });
    onPipPositionChange({ x: newX, y: newY });
  };

  const handlePipRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onInternalDragStart();

    // Placeholder for rotation logic logic (can be fully implemented if rotation state is passed)

    const handleMouseUp = () => {
      document.removeEventListener("mouseup", handleMouseUp);
      onInternalDragStop();
    };
    document.addEventListener("mouseup", handleMouseUp);
  };

  const pipSizePx = {
    width: (containerSize.width * pipSize.width) / 100,
    height:
      currentAspectRatio && typeof currentAspectRatio === "number"
        ? (containerSize.width * pipSize.width) / 100 / currentAspectRatio
        : (containerSize.height * pipSize.height) / 100,
  };

  const pipPositionPx = {
    x: (containerSize.width * pipPosition.x) / 100,
    y: (containerSize.height * pipPosition.y) / 100,
  };

  // Resize handles config
  const circleResizeHandles = {
    top: true,
    right: true,
    bottom: true,
    left: true,
    topRight: false,
    bottomRight: false,
    bottomLeft: false,
    topLeft: false,
  };
  const defaultResizeHandles = {
    ...circleResizeHandles,
    topRight: true,
    bottomRight: true,
    bottomLeft: true,
    topLeft: true,
  };

  if (containerSize.width <= 0) return null;

  return (
    <Rnd
      ref={pipRndRef}
      key={`pip-${sceneId}`}
      size={pipSizePx}
      position={pipPositionPx}
      minWidth={containerSize.width * 0.1}
      minHeight={
        currentAspectRatio && typeof currentAspectRatio === "number"
          ? (containerSize.width * 0.1) / currentAspectRatio
          : containerSize.height * 0.1
      }
      cancel=".rotate-handle"
      maxWidth={containerSize.width * (100 - pipPosition.x)}
      maxHeight={containerSize.height * (100 - pipPosition.y)}
      lockAspectRatio={currentAspectRatio ? currentAspectRatio : false}
      enableResizing={
        cameraShape === "circle" ? circleResizeHandles : defaultResizeHandles
      }
      bounds="parent"
      onDragStop={handlePipDragStop}
      onResizeStop={handlePipResizeStop}
      className="pointer-events-auto"
      style={{
        zIndex: "var(--z-video-pip)",
        ...getCameraShapeStyle(),
      }}
    >
      <div
        className="w-full h-full relative group"
        style={{
          overflow: "hidden",
          transformOrigin: "center center",
          borderRadius: "inherit",
        }}
      >
        {pipContent === "camera"
          ? renderContent("cursor-move", {}, true, cameraShape)
          : renderScreen("cursor-move")}

        <div className="absolute inset-0 w-full h-full border-2 border-primary border-dashed rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        <Button
          size="icon"
          variant="secondary"
          className="absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() =>
            setPipContent(pipContent === "camera" ? "share" : "camera")
          }
        >
          <RotateCcw className="h-4 w-4" />
        </Button>

        <div
          onMouseDown={handlePipRotationStart}
          className={cn(
            "rotate-handle absolute -bottom-3 -left-3 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center transition-all hover:scale-110 cursor-alias",
            "opacity-0 group-hover:opacity-100"
          )}
          style={{
            zIndex: "var(--z-draggable-element-active)",
          }}
        >
          <RotateCcw className="w-4 h-4 pointer-events-none" />
        </div>
      </div>
    </Rnd>
  );
};
