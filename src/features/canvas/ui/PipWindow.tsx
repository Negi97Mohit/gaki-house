// src/components/video-canvas/PipWindow.tsx
import React, { useState, useEffect } from "react";
import { Button } from "@/shared/ui/button";
import { RotateCcw, X } from "lucide-react";
import { cn, throttle } from "@/shared/lib/utils";
import { CameraShape } from "@/types/caption";
import { SmartDraggable } from "./SmartDraggable";

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
  // Added prop for rotation
  onPipRotationChange: (rotation: number) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  onClose?: () => void;

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

export const PipWindow: React.FC<PipWindowProps> = ({
  sceneId,
  containerSize,
  pipPosition,
  pipSize,
  cameraShape,
  pipBorder,
  pipShadow,
  pipRotation = 0,
  customMaskUrl,
  screenShareMode,
  onPipPositionChange,
  onPipSizeChange,
  onPipRotationChange,
  onInternalDragStart,
  onInternalDragStop,
  onClose,
  renderContent,
  renderScreen,
  currentAspectRatio,
}) => {
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

  const handleChange = (
    id: string,
    layout: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    }
  ) => {
    if (layout.position) {
      onPipPositionChange(layout.position);
    }
    if (layout.size) {
      onPipSizeChange(layout.size);
    }
  };

  const handlePipRotationStart = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onInternalDragStart();

    // Find the element to rotate (the group container)
    const element = e.currentTarget.closest(".group");
    if (!element) return;

    const box = element.getBoundingClientRect();
    const centerX = box.left + box.width / 2;
    const centerY = box.top + box.height / 2;
    // Calculate start angle relative to center
    const startAngle =
      Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI);
    const initialRotation = pipRotation || 0;

    const handleMouseMove = throttle((moveEvent: MouseEvent) => {
      const currentAngle =
        Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX) *
        (180 / Math.PI);
      const angleDiff = currentAngle - startAngle;
      const newRotation = initialRotation + angleDiff;

      // Optional: Snap to 15 degree increments if Shift is held (can add later)
      onPipRotationChange(newRotation);
    }, 16);

    const handleMouseUp = () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      onInternalDragStop();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Calculate effective size if aspect ratio is locked
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

  // Clamp position to ensure PiP stays fully visible when aspect ratio changes
  useEffect(() => {
    if (containerSize.width <= 0 || containerSize.height <= 0) return;

    const maxX = 100 - effectiveSize.width;
    const maxY = 100 - effectiveSize.height;

    const clampedX = Math.max(0, Math.min(pipPosition.x, maxX));
    const clampedY = Math.max(0, Math.min(pipPosition.y, maxY));

    if (clampedX !== pipPosition.x || clampedY !== pipPosition.y) {
      onPipPositionChange({ x: clampedX, y: clampedY });
    }
  }, [
    effectiveSize.width,
    effectiveSize.height,
    containerSize,
    currentAspectRatio,
    pipPosition.x,
    pipPosition.y,
    onPipPositionChange,
  ]);

  if (containerSize.width <= 0) return null;

  return (
    <SmartDraggable
      id={`pip-${sceneId}`}
      position={pipPosition}
      size={effectiveSize}
      containerSize={containerSize}
      minWidth={containerSize.width * 0.1}
      minHeight={
        typeof currentAspectRatio === "number"
          ? (containerSize.width * 0.1) / currentAspectRatio
          : containerSize.height * 0.1
      }
      lockAspectRatio={
        typeof currentAspectRatio === "number" ? currentAspectRatio : false
      }
      zIndex={100}
      rotation={pipRotation} // Pass rotation to SmartDraggable wrapper
      onChange={handleChange}
      onDragStart={onInternalDragStart}
      onDragStop={onInternalDragStop}
      cancel=".rotate-handle"
      className="pointer-events-auto"
    >
      {/* Outer Container: Handles Group Hover & Layout (No Overflow Hidden) */}
      <div className="w-full h-full relative group">
        {/* Inner Container: Handles Shape & Clipping (Overflow Hidden) */}
        <div
          className="w-full h-full relative"
          style={{
            transformOrigin: "center center",
            ...getCameraShapeStyle(),
          }}
        >
          {pipContent === "camera"
            ? renderContent("cursor-move", {}, true, cameraShape)
            : renderScreen("cursor-move")}

          {/* Hover Border - Inside clipped area to match shape */}
          <div className="absolute inset-0 w-full h-full border-2 border-primary border-dashed rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />
        </div>

        {/* Rotate Handle - Inside, Modern, Glassmorphism */}
        <div
          onMouseDown={handlePipRotationStart}
          className={cn(
            "rotate-handle absolute bottom-2 left-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all hover:scale-105 hover:bg-primary cursor-alias backdrop-blur-sm border border-white/10 shadow-sm",
            "opacity-0 group-hover:opacity-100"
          )}
          style={{
            zIndex: 200,
          }}
        >
          <RotateCcw className="w-4 h-4 pointer-events-none" />
        </div>

        {/* Close Button - Inside, Modern, Glassmorphism */}
        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className={cn(
              "close-handle absolute top-2 right-2 bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-all hover:scale-105 hover:bg-destructive backdrop-blur-sm border border-white/10 shadow-sm",
              "opacity-0 group-hover:opacity-100"
            )}
            style={{ zIndex: 200 }}
          >
            <X className="w-4 h-4 pointer-events-none" />
          </button>
        )}
      </div>
    </SmartDraggable>
  );
};
