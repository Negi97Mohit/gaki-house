// src/components/panels/StaticPresetsPanel.tsx
import React, { useEffect, useRef } from "react";
import { useCaptionPresets } from "@/hooks/useCaptionPresets";
import { CaptionStyle } from "@gaki/core/types/caption";
import { cn } from "@gaki/core/lib/utils";
import { ScrollArea, ScrollBar } from "@gaki/ui/scroll-area";

interface StaticPresetsPanelProps {
  onStyleChange: (style: CaptionStyle) => void;
  currentStyle: CaptionStyle;
  // NEW: Optional prop to identify which preset is active
  activePresetId?: string;
  isHorizontal?: boolean;
}

export const StaticPresetsPanel: React.FC<StaticPresetsPanelProps> = ({
  onStyleChange,
  currentStyle,
  activePresetId,
  isHorizontal = false,
}) => {
  const { captionPresets: CAPTION_PRESETS } = useCaptionPresets();
  // NEW: Refs for scroll-to functionality
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
  }, [activePresetId]);

  const handlePresetSelect = (preset: (typeof CAPTION_PRESETS)[0]) => {
    const updates: Partial<CaptionStyle> = {
      fontFamily: preset.style.fontFamily,
      fontSize: preset.style.fontSize,
      color: preset.style.color,
      backgroundColor: preset.style.backgroundColor,
    };
    onStyleChange({ ...currentStyle, ...updates });
  };

  return (
    <div className="space-y-4 font-mono">
      {/* Section Label */}
      <div className="pb-3 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          Select Style Preset
        </span>
      </div>

      {isHorizontal ? (
        <ScrollArea className="w-full">
          <div className="flex gap-2 pb-4">
            {CAPTION_PRESETS.map((preset) => {
              const isSelected = activePresetId === preset.id;

              return (
                <button
                  key={preset.id}
                  // NEW: Attach Ref
                  ref={(el) => (itemRefs.current[preset.id] = el)}
                  onClick={() => handlePresetSelect(preset)}
                  title={preset.name}
                  className={cn(
                    "group relative overflow-hidden flex-shrink-0 w-36 border transition-all duration-150",
                    // NEW: Selected styling
                    isSelected
                      ? "border-primary ring-2 ring-primary ring-offset-1 ring-offset-background"
                      : "border-border hover:border-primary"
                  )}
                >
                  <img
                    src={preset.preview}
                    alt={preset.name}
                    className="w-full aspect-video object-cover transition-transform duration-200 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-2 pt-4">
                    <span
                      className={cn(
                        "text-[10px] font-medium tracking-wide",
                        isSelected ? "text-primary" : "text-foreground"
                      )}
                    >
                      {preset.name.toUpperCase()}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {CAPTION_PRESETS.map((preset) => {
            const isSelected = activePresetId === preset.id;

            return (
              <button
                key={preset.id}
                // NEW: Attach Ref
                ref={(el) => (itemRefs.current[preset.id] = el)}
                onClick={() => handlePresetSelect(preset)}
                title={preset.name}
                className={cn(
                  "group relative overflow-hidden border transition-all duration-150",
                  // NEW: Selected styling
                  isSelected
                    ? "border-primary ring-2 ring-primary ring-offset-1 ring-offset-background"
                    : "border-border hover:border-primary"
                )}
              >
                <img
                  src={preset.preview}
                  alt={preset.name}
                  className="w-full aspect-video object-cover transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-2 pt-4">
                  <span
                    className={cn(
                      "text-[10px] font-medium tracking-wide",
                      isSelected ? "text-primary" : "text-foreground"
                    )}
                  >
                    {preset.name.toUpperCase()}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
