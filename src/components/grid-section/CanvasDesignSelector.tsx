import React, { useState } from "react";
import { CANVAS_PRESETS, CANVAS_PRESET_CATEGORIES } from "@/lib/canvasPresets";
import { CanvasPreset } from "@/types/canvasPreset";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"; // Added ScrollBar
import { cn } from "@/lib/utils";
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
  publicPresets?: CanvasPreset[];
  isLoadingPublic?: boolean;
}

export const CanvasDesignSelector: React.FC<CanvasDesignSelectorProps> = ({
  onSelect,
  publicPresets = [],
  isLoadingPublic = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

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
        {filteredPresets.map((preset) => (
          <button
            key={preset.id}
            className="flex flex-col gap-2 p-2 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left group h-full"
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
                      fontSize: "8px", // Force small size for preview
                    }}
                  >
                    Aa
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-0.5">
              <span className="text-xs font-medium truncate block">
                {preset.name}
              </span>
              {selectedCategory === "community" && (
                <span className="text-[9px] text-muted-foreground block">
                  by {(preset as any).authorName || "Unknown"}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
