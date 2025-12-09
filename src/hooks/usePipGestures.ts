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

// Selectors for UI elements that should block PiP gesture
const UI_ELEMENT_SELECTORS = [
  '[data-radix-popper-content-wrapper]', // Radix dropdowns/popovers
  '[role="dialog"]',
  '[role="menu"]',
  '[role="listbox"]',
  '.banner-design-selector',
  '.floating-controls-panel',
  '.pip-controls-toolbar',
  '.text-editing-toolbar',
  '.canvas-hover-toolbar',
  '[data-floating-panel]',
  '[data-no-pip-gesture]',
];

const isOverUIElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;
  
  // Check if target or any parent matches UI selectors
  for (const selector of UI_ELEMENT_SELECTORS) {
    if (target.closest(selector)) return true;
  }
  
  // Also check for common interactive elements with pointer-events
  const computed = window.getComputedStyle(target);
  if (computed.pointerEvents === 'auto' && target.closest('[class*="toolbar"], [class*="panel"], [class*="menu"], [class*="popover"]')) {
    return true;
  }
  
  return false;
};

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

      // Don't trigger PiP if scrolling over UI elements
      if (isOverUIElement(e.target)) return;

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
