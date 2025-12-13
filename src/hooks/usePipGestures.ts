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
  isDefaultMode: boolean;
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

// Helper to check if the target is the "background" or "camera" layer
// and NOT an interactive overlay (like browser, text, file, etc.)
const isDirectContact = (target: EventTarget | null): boolean => {
  if (!(target instanceof Element)) return false;

  // We want to allow the gesture ONLY if we are clicking on:
  // 1. The main container itself
  // 2. The video element (hidden or visible)
  // 3. The canvas element
  // 4. The ambient background
  // 5. The absolute inset container that holds these callbacks

  // Use a data attribute or class to identify "safe" layers if possible.
  // Or inversely, check if we are inside an overlay.

  // Check if we are inside any known overlay types
  if (target.closest('.react-draggable') || // Most overlays (text, generated) use Rnd or similar which usually adds draggable classes or we can check our specific overlay structures
    target.closest('[data-overlay-type]') || // If we have this
    target.closest('.browser-view') ||
    target.closest('.file-overlay') ||
    target.closest('.text-overlay')
  ) {
    return false;
  }

  return true;
};

export const usePipGestures = ({
  layoutMode,
  containerRef,
  containerSize,
  pipSize,
  onPipPositionChange,
  screenShareMode,
  onScreenShareModeChange,
  isDefaultMode,
}: UsePipGesturesProps) => {
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      const container = containerRef.current;
      if (!container || layoutMode !== "solo") return;

      // STRICTER CHECKS:
      // 1. Must be in default mode (no active selections, not editing)
      if (!isDefaultMode) return;

      // 2. Must be "direct contact" (not over UI, not over overlays)
      if (isOverUIElement(e.target)) return;
      if (!isDirectContact(e.target)) return;

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
      isDefaultMode,
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
