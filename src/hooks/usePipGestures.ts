import { useEffect, useCallback } from "react";
import { LayoutMode } from "@/types/caption";

interface UsePipGesturesProps {
  layoutMode: LayoutMode;
  containerRef: React.RefObject<HTMLDivElement>;
  containerSize: { width: number; height: number };
  pipSize: { width: number; height: number };
  onPipPositionChange: (pos: { x: number; y: number }) => void;
  screenShareMode: string;
  onScreenShareModeChange: (mode: "off" | "screen" | "canvas") => void;
}

export const usePipGestures = ({
  layoutMode,
  containerRef,
  containerSize,
  pipSize,
  onPipPositionChange,
  screenShareMode,
  onScreenShareModeChange,
}: UsePipGesturesProps) => {
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const container = containerRef.current;
      if (!container || layoutMode !== "solo") return;

      e.preventDefault();
      e.stopPropagation();

      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newXPercent = (mouseX / containerSize.width) * 100;
      const newYPercent = (mouseY / containerSize.height) * 100;

      onPipPositionChange({
        x: Math.max(0, Math.min(newXPercent, 100 - pipSize.width)),
        y: Math.max(0, Math.min(newYPercent, 100 - pipSize.height)),
      });

      if (screenShareMode === "off") {
        onScreenShareModeChange("canvas");
      }
    },
    [
      containerRef,
      layoutMode,
      containerSize,
      pipSize,
      onPipPositionChange,
      screenShareMode,
      onScreenShareModeChange,
    ]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => {
      container.removeEventListener("wheel", handleWheel);
    };
  }, [handleWheel, containerRef]);
};
