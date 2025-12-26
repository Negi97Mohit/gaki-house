import React, { useState, useEffect, useRef } from "react";
import { CANVAS_PRESET_CATEGORIES } from "@/lib/canvasPresets";
import { useCanvasPresets } from "@/features/canvas/hooks/useCanvasPresets"; // --- ADDED
import { CanvasPreset } from "@/types/canvasPreset";
import { Button } from "@/shared/ui/button";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { cn } from "@/shared/lib/utils";
import {
  LayoutGrid,
  Crown,
  Zap,
  Minus,
  Cpu,
  Film,
  Shirt,
  Clock,
  Users,
} from "lucide-react";

interface CanvasDesignSelectorProps {
  onSelect: (preset: CanvasPreset) => void;
  // NEW: Prop to track active selection
  activePresetId?: string;
  publicPresets?: CanvasPreset[];
  isLoadingPublic?: boolean;
}

export const CanvasDesignSelector: React.FC<CanvasDesignSelectorProps> = ({
  onSelect,
  activePresetId, // Destructure new prop
  publicPresets = [],
  isLoadingPublic = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const { systemPresets: CANVAS_PRESETS } = useCanvasPresets(); // --- ADDED

  // NEW: Refs for scroll functionality
  const itemRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  // NEW: Scroll effect
  useEffect(() => {
    if (activePresetId && itemRefs.current[activePresetId]) {
      const element = itemRefs.current[activePresetId];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }
  }, [activePresetId, selectedCategory]);

  const categoryIcons: Record<string, React.ElementType> = {
    LayoutGrid,
    Crown,
    Zap,
    Minus,
    Cpu,
    Film,
    Shirt,
    Clock,
    Users,
  };

  const filteredPresets =
    selectedCategory === "all"
      ? CANVAS_PRESETS
      : selectedCategory === "community"
        ? publicPresets
        : CANVAS_PRESETS.filter((p) => p.styleTags.includes(selectedCategory));

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-muted-foreground">
        Template Presets
      </h4>

      {/* Category Tabs */}
      <ScrollArea className="w-full whitespace-nowrap pb-2">
        <div className="flex gap-1.5 w-max px-1">
          {CANVAS_PRESET_CATEGORIES.map((cat) => {
            const IconComponent = categoryIcons[cat.icon];
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "ghost"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "h-7 text-xs px-2.5",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground bg-muted/30"
                )}
              >
                {IconComponent && <IconComponent className="w-3 h-3 mr-1.5" />}
                {cat.name.toUpperCase()}
              </Button>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      {/* Loading State */}
      {selectedCategory === "community" && isLoadingPublic && (
        <div className="py-8 text-center text-muted-foreground text-xs">
          Loading community designs...
        </div>
      )}

      {/* Empty State */}
      {selectedCategory === "community" &&
        !isLoadingPublic &&
        filteredPresets.length === 0 && (
          <div className="py-8 text-center text-muted-foreground text-xs">
            No community designs loaded.
          </div>
        )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-2">
        {filteredPresets.map((preset) => {
          const isSelected = activePresetId === preset.id;

          return (
            <button
              key={preset.id}
              // NEW: Attach Ref
              ref={(el) => (itemRefs.current[preset.id] = el)}
              className={cn(
                "flex flex-col gap-2 p-2 rounded-lg border transition-all text-left group h-full",
                // NEW: Visual feedback for selection
                isSelected
                  ? "border-primary bg-accent ring-1 ring-primary"
                  : "border-border hover:border-primary hover:bg-accent"
              )}
              onClick={() => onSelect(preset)}
            >
              <div className="w-full aspect-video rounded-md bg-muted/20 flex items-center justify-center overflow-hidden border border-border/50 relative">
                <div
                  className="relative overflow-hidden shadow-sm w-full h-full"
                  style={{
                    background: preset.background.blankCanvasColor || "#000000",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                >
                  {/* PiP Preview */}
                  <div
                    className="absolute bg-primary/20 border border-primary/50 transition-all"
                    style={{
                      left: `${preset.pip?.pipPosition?.x || 0}%`,
                      top: `${preset.pip?.pipPosition?.y || 0}%`,
                      width: `${preset.pip?.pipSize?.width || 30}%`,
                      height: `${preset.pip?.cameraShape === "circle"
                          ? (preset.pip?.pipSize?.width || 30) * (16 / 9)
                          : preset.pip?.pipSize?.height || 30
                        }%`,
                      borderRadius:
                        preset.pip.cameraShape === "circle"
                          ? "50%"
                          : preset.pip.cameraShape === "rounded"
                            ? "4px"
                            : "0px",
                      border: preset.pip.pipBorder
                        ? `${Math.max(
                          1,
                          preset.pip.pipBorder.width / 6
                        )}px solid ${preset.pip.pipBorder.color}`
                        : undefined,
                    }}
                  />
                  {/* Text Preview */}
                  {preset.textOverlays?.slice(0, 1).map((t, i) => (
                    <div
                      key={i}
                      className="absolute flex items-center justify-center overflow-hidden"
                      style={{
                        left: `${t.layout.position.x}%`,
                        top: `${t.layout.position.y}%`,
                        width: `${t.layout.size.width}%`,
                        height: `${t.layout.size.height}%`,
                        transform: `rotate(${t.layout.rotation}deg)`,
                        fontFamily: t.style.fontFamily,
                        color: t.style.color,
                        backgroundColor: t.style.backgroundColor,
                        textAlign: t.style.textAlign as any,
                        fontWeight: t.style.fontWeight,
                        whiteSpace: "nowrap",
                        lineHeight: 1,
                        zIndex: 10,
                        fontSize: "8px",
                      }}
                    >
                      Aa
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-0.5">
                <span
                  className={cn(
                    "text-xs truncate block",
                    isSelected ? "font-semibold text-primary" : "font-medium"
                  )}
                >
                  {preset.name}
                </span>
                {selectedCategory === "community" && (
                  <span className="text-[9px] text-muted-foreground block">
                    by {(preset as any).authorName || "Unknown"}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
