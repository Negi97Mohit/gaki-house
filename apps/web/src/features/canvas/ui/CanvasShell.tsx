// Single responsibility: outer canvas container, aspect-ratio shell, and background hosting.
import React, { useEffect } from "react";
import { cn } from "@caption-cam/core/lib/utils";

interface CanvasShellProps {
  containerRef: React.RefObject<HTMLDivElement>;
  sceneRef: React.RefObject<HTMLDivElement>;
  sceneStyle: React.CSSProperties;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  isMouseActive: boolean;
  isFullscreen: boolean;
  children: React.ReactNode;
}

export const CanvasShell: React.FC<CanvasShellProps> = ({
  containerRef,
  sceneRef,
  sceneStyle,
  onClick,
  onMouseEnter,
  onMouseLeave,
  isMouseActive,
  isFullscreen,
  children,
}) => {
  useEffect(() => {
    console.log("[CanvasShell] mounted");
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "absolute inset-0 w-full h-full bg-neutral-900 overflow-hidden flex items-center justify-center",
        !isMouseActive && isFullscreen && "cursor-none"
      )}
    >
      <div
        ref={sceneRef}
        className="relative overflow-hidden"
        style={sceneStyle}
        onClick={onClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </div>
    </div>
  );
};
