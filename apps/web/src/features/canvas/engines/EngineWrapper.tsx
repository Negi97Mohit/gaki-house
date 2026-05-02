import React from 'react';
import { isV2Engine } from "@/features/canvas/lib/engineFlag";
import { HybridDraggable, HybridDraggableProps } from "@/features/canvas/ui/HybridDraggable";
import { cn } from "@gaki/core/lib/utils";

/**
 * Drop-in replacement for HybridDraggable that conditionally bypasses react-rnd
 * and renders a pure layout-driven DOM node when isV2Engine=true.
 */
export const EngineWrapper: React.FC<HybridDraggableProps> = ({ children, className, ...props }) => {
  if (isV2Engine) {
    return (
      <div
        data-engine-id={props.id}
        style={{
          position: 'absolute',
          left: `${props.position.x}%`,
          top: `${props.position.y}%`,
          width: `${props.size?.width}%`,
          height: `${props.size?.height}%`,
          transform: `rotate(${props.rotation || 0}deg)`,
          zIndex: props.zIndex,
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          props.onSelect?.(props.id);
        }}
        className={cn("pointer-events-auto", className)}
      >
        {children}
      </div>
    );
  }

  // Fallback to legacy
  return (
    <HybridDraggable className={className} {...props}>
      {children}
    </HybridDraggable>
  );
};
