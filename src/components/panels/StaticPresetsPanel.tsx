// src/components/panels/StaticPresetsPanel.tsx
import React from "react";
import { CAPTION_PRESETS } from "@/lib/captionPresets";
import { CaptionStyle } from "@/types/caption";
import { cn } from "@/lib/utils";

interface StaticPresetsPanelProps {
  onStyleChange: (style: CaptionStyle) => void;
  currentStyle: CaptionStyle;
}

export const StaticPresetsPanel: React.FC<StaticPresetsPanelProps> = ({
  onStyleChange,
  currentStyle,
}) => {
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

      <div className="grid grid-cols-2 gap-2">
        {CAPTION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset)}
            title={preset.name}
            className={cn(
              "group relative overflow-hidden border transition-all duration-150",
              "border-border hover:border-primary"
            )}
          >
            <img
              src={preset.preview}
              alt={preset.name}
              className="w-full aspect-video object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-2 pt-4">
              <span className="text-[10px] font-medium tracking-wide text-foreground">
                {preset.name.toUpperCase()}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
