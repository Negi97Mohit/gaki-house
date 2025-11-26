// src/components/video-canvas/PipWindow.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
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

    const handleMouseUp = () => {
      document.removeEventListener("mouseup", handleMouseUp);
      onInternalDragStop();
    };
    document.addEventListener("mouseup", handleMouseUp);
  };

  if (containerSize.width <= 0) return null;

  // Calculate effective size if aspect ratio is locked
  // This overrides the potentially stale height in pipSize
  const effectiveSize = { ...pipSize };
  if (
    typeof currentAspectRatio === "number" &&
    containerSize.width > 0 &&
    containerSize.height > 0
  ) {
    // Calculate height in pixels based on width px and ratio
    const widthPx = (pipSize.width / 100) * containerSize.width;
    const heightPx = widthPx / currentAspectRatio;
    // Convert back to percentage
    effectiveSize.height = (heightPx / containerSize.height) * 100;
  }

  return (
    <SmartDraggable
      id={`pip-${sceneId}`}
      position={pipPosition}
      size={effectiveSize} // Pass the ratio-corrected size
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
      onChange={handleChange}
      onDragStart={onInternalDragStart}
      onDragStop={onInternalDragStop}
      cancel=".rotate-handle, .pip-toggle-btn"
      className="pointer-events-auto"
    >
      <div
        className="w-full h-full relative group"
        style={{
          overflow: "hidden",
          transformOrigin: "center center",
          borderRadius: "inherit",
          ...getCameraShapeStyle(),
        }}
      >
        {pipContent === "camera"
          ? renderContent("cursor-move", {}, true, cameraShape)
          : renderScreen("cursor-move")}

        <div className="absolute inset-0 w-full h-full border-2 border-primary border-dashed rounded-[inherit] opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none" />

        <Button
          size="icon"
          variant="secondary"
          className="pip-toggle-btn absolute top-2 right-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => {
            e.stopPropagation();
            setPipContent(pipContent === "camera" ? "share" : "camera");
          }}
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
            zIndex: 200,
          }}
        >
          <RotateCcw className="w-4 h-4 pointer-events-none" />
        </div>
      </div>
    </SmartDraggable>
  );
};
