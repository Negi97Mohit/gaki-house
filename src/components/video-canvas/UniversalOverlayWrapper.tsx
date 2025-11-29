// src/components/video-canvas/UniversalOverlayWrapper.tsx
import React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";
import { HybridDraggable, LayoutUpdate } from "./HybridDraggable";
import { DynamicLayoutPicker } from "@/components/DynamicLayoutPicker";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";

interface UniversalOverlayWrapperProps {
  id: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  rotation: number;
  zIndex: number;
  containerSize: { width: number; height: number };
  isSelected: boolean;
  onCommit: (id: string, layout: LayoutUpdate) => void;
  onSelect: (id: string) => void;
  onRemove: (id: string) => void;
  onDoubleClick?: (id: string) => void;
  onSetDynamicLayout?: (
    target: { id: string; type: any },
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => void;
  type: "text" | "html" | "file" | "browser";
  children: React.ReactNode;
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;
  enableResizing?: boolean;
  isEditing?: boolean;
}

export const UniversalOverlayWrapper: React.FC<
  UniversalOverlayWrapperProps
> = ({
  id,
  position,
  size,
  rotation,
  zIndex,
  containerSize,
  isSelected,
  onCommit,
  onSelect,
  onRemove,
  onDoubleClick,
  onSetDynamicLayout,
  type,
  children,
  allOverlays,
  onSnapGuidesChange,
  enableResizing = true,
  isEditing = false,
}) => {
    return (
      <HybridDraggable
        id={id}
        position={position}
        size={size}
        rotation={rotation}
        zIndex={zIndex}
        containerSize={containerSize}
        isSelected={isSelected}
        onCommit={onCommit}
        onSelect={onSelect}
        onClick={() => onSelect(id)} // REINFORCE SELECTION ON CLICK
        onDoubleClick={onDoubleClick}
        enableDragging={!isEditing}
        enableResizing={enableResizing && !isEditing}
        enableRotation={!isEditing}
        allOverlays={allOverlays}
        onSnapGuidesChange={onSnapGuidesChange}
        cancelSelector=".close-btn, .layout-picker-btn"
        className={cn(
          "group transition-colors duration-200 border-2",
          isSelected
            ? "border-transparent" // Selection handled by HybridDraggable ring
            : "border-transparent hover:border-primary/50"
        )}
      >
        <div className="w-full h-full relative">
          {/* Content */}
          <div className="w-full h-full overflow-hidden relative">{children}</div>

          {/* UI Controls - Force visible if selected, otherwise hover */}
          {!isEditing && (
            <>
              {/* Dynamic Layout Picker */}
              {onSetDynamicLayout && (
                <div
                  className={cn(
                    "absolute top-2 left-2 z-[60] transition-opacity duration-200",
                    isSelected
                      ? "opacity-100"
                      : "opacity-0 group-hover:opacity-100"
                  )}
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <DynamicLayoutPicker
                    onSelectLayout={(mode) =>
                      onSetDynamicLayout({ id, type }, mode)
                    }
                  />
                </div>
              )}

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(id);
                }}
                onPointerDown={(e) => e.stopPropagation()}
                className={cn(
                  "close-btn absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all shadow-md cursor-pointer z-[60]",
                  isSelected
                    ? "opacity-100 scale-100"
                    : "opacity-0 group-hover:opacity-100 hover:scale-110"
                )}
                title="Remove"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </HybridDraggable>
    );
  };
