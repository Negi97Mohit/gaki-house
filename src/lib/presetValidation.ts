// src/lib/presetValidation.ts
// Utilities to validate and constrain preset layouts to ensure they fit within canvas bounds

import { CanvasPreset, CanvasPresetTextOverlay } from "@/types/canvasPreset";

export interface ScreenSize {
  width: number;
  height: number;
  type: 'mobile' | 'tablet' | 'desktop';
}

export function getScreenSize(): ScreenSize {
  const width = typeof window !== 'undefined' ? window.innerWidth : 1920;
  const height = typeof window !== 'undefined' ? window.innerHeight : 1080;
  
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop';
  if (width < 768) {
    type = 'mobile';
  } else if (width < 1024) {
    type = 'tablet';
  }
  
  return { width, height, type };
}

/**
 * Validates that a position and size fits within 0-100% bounds
 */
export function constrainToBounds(
  position: { x: number; y: number },
  size: { width: number; height: number }
): { position: { x: number; y: number }; size: { width: number; height: number } } {
  // Constrain size to not exceed 100%
  const constrainedWidth = Math.min(100, Math.max(1, size.width));
  const constrainedHeight = Math.min(100, Math.max(1, size.height));
  
  // Constrain position to ensure element stays within bounds
  const constrainedX = Math.max(0, Math.min(100 - constrainedWidth, position.x));
  const constrainedY = Math.max(0, Math.min(100 - constrainedHeight, position.y));
  
  return {
    position: { x: constrainedX, y: constrainedY },
    size: { width: constrainedWidth, height: constrainedHeight }
  };
}

/**
 * Gets the responsive layout for a text overlay based on current screen size
 */
export function getResponsiveTextLayout(
  textOverlay: CanvasPresetTextOverlay,
  screenSize: ScreenSize
): { position: { x: number; y: number }; size: { width: number; height: number } } {
  let layout = {
    position: { ...textOverlay.layout.position },
    size: { ...textOverlay.layout.size }
  };
  
  // Apply responsive layout if available
  if (screenSize.type === 'mobile' && textOverlay.responsive?.mobile?.layout) {
    layout = {
      position: textOverlay.responsive.mobile.layout.position ?? layout.position,
      size: textOverlay.responsive.mobile.layout.size ?? layout.size
    };
  } else if (screenSize.type === 'tablet' && textOverlay.responsive?.tablet?.layout) {
    layout = {
      position: textOverlay.responsive.tablet.layout.position ?? layout.position,
      size: textOverlay.responsive.tablet.layout.size ?? layout.size
    };
  }
  
  // Ensure it stays within bounds
  return constrainToBounds(layout.position, layout.size);
}

/**
 * Gets the responsive PIP layout based on current screen size
 */
export function getResponsivePipLayout(
  preset: CanvasPreset,
  screenSize: ScreenSize
): {
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  layoutMode?: typeof preset.pip.layoutMode;
} {
  let pipPosition = preset.pip.pipPosition ?? { x: 75, y: 75 };
  let pipSize = preset.pip.pipSize ?? { width: 20, height: 20 };
  let layoutMode = preset.pip.layoutMode;
  
  // Apply responsive layout if available
  if (screenSize.type === 'mobile' && preset.pip.responsive?.mobile) {
    pipPosition = preset.pip.responsive.mobile.pipPosition ?? pipPosition;
    pipSize = preset.pip.responsive.mobile.pipSize ?? pipSize;
    if (preset.pip.responsive.mobile.layoutMode) {
      layoutMode = preset.pip.responsive.mobile.layoutMode as typeof preset.pip.layoutMode;
    }
  } else if (screenSize.type === 'tablet' && preset.pip.responsive?.tablet) {
    pipPosition = preset.pip.responsive.tablet.pipPosition ?? pipPosition;
    pipSize = preset.pip.responsive.tablet.pipSize ?? pipSize;
    if (preset.pip.responsive.tablet.layoutMode) {
      layoutMode = preset.pip.responsive.tablet.layoutMode as typeof preset.pip.layoutMode;
    }
  }
  
  // Ensure PIP stays within bounds
  const constrained = constrainToBounds(pipPosition, pipSize);
  
  return {
    pipPosition: constrained.position,
    pipSize: constrained.size,
    layoutMode
  };
}

/**
 * Validates entire preset to ensure all elements fit within bounds
 */
export function validatePreset(preset: CanvasPreset, screenSize: ScreenSize): {
  isValid: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];
  
  // Validate text overlays
  preset.textOverlays.forEach((overlay, index) => {
    const { position, size } = getResponsiveTextLayout(overlay, screenSize);
    
    if (position.x + size.width > 100) {
      warnings.push(`Text overlay ${index + 1} exceeds right boundary`);
    }
    if (position.y + size.height > 100) {
      warnings.push(`Text overlay ${index + 1} exceeds bottom boundary`);
    }
  });
  
  // Validate PIP if not in split mode
  if (preset.pip.layoutMode === 'pip') {
    const { pipPosition, pipSize } = getResponsivePipLayout(preset, screenSize);
    
    if (pipPosition.x + pipSize.width > 100) {
      warnings.push('PIP exceeds right boundary');
    }
    if (pipPosition.y + pipSize.height > 100) {
      warnings.push('PIP exceeds bottom boundary');
    }
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}
