// src/components/DraggableAmbientEffect.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { GeneratedOverlay } from "@/types/caption";
import { AmbientEffectsOverlay } from "./AmbientEffectsOverlay";
import { SmartDraggable } from "@/components/video-canvas/SmartDraggable";
import { X } from "lucide-react";

interface DraggableAmbientEffectProps {
  overlay: GeneratedOverlay;
  onLayoutChange: (id: string, key: "position" | "size", value: any) => void;
  onRemove: (id: string) => void;
  containerSize: { width: number; height: number };
  onSelect: (id: string) => void;
  isSelected: boolean;
}

export const DraggableAmbientEffect: React.FC<DraggableAmbientEffectProps> = ({
  overlay,
  onLayoutChange,
  onRemove,
  containerSize,
  onSelect,
  isSelected,
}) => {
  if (!containerSize.width || !containerSize.height || !overlay.ambientEffect) {
    return null;
  }

  const handleChange = (
    id: string,
    layout: {
      position?: { x: number; y: number };
      size?: { width: number; height: number };
    }
  ) => {
    if (layout.position) onLayoutChange(id, "position", layout.position);
    if (layout.size) onLayoutChange(id, "size", layout.size);
  };

  return (
    <SmartDraggable
      id={overlay.id}
      position={overlay.layout.position}
      size={overlay.layout.size}
      containerSize={containerSize}
      zIndex={overlay.layout.zIndex}
      isSelected={isSelected}
      onSelect={onSelect}
      onChange={handleChange}
      minWidth={50}
      minHeight={50}
      className={cn(
        "border-2 border-dashed group pointer-events-auto transition-colors overflow-hidden",
        isSelected
          ? "border-primary border-solid"
          : "border-transparent hover:border-primary/50"
      )}
    >
      <div className="w-full h-full relative cursor-move">
        <AmbientEffectsOverlay effect={overlay.ambientEffect} />

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(overlay.id);
          }}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-50 cursor-pointer"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </SmartDraggable>
  );
};
