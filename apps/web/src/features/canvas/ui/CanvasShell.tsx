// Single responsibility: outer canvas container, aspect-ratio shell, and background hosting.
import React, { useEffect } from "react";
import { cn } from "@caption-cam/core/lib/utils";
import Guides from "@scena/react-guides";
import { isV2Engine } from "@/features/canvas/lib/engineFlag";

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
      {isV2Engine && (
        <>
          <div className="absolute top-0 left-8 right-0 h-8 z-[9999] bg-neutral-900 border-b border-neutral-800">
            <Guides type="horizontal" style={{ width: "100%", height: "32px" }} />
          </div>
          <div className="absolute top-8 left-0 bottom-0 w-8 z-[9999] bg-neutral-900 border-r border-neutral-800">
            <Guides type="vertical" style={{ width: "32px", height: "100%" }} />
          </div>
        </>
      )}
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
