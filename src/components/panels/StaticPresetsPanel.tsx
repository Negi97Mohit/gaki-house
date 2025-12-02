// src/components/panels/StaticPresetsPanel.tsx
import React from "react";
import { Paintbrush } from "lucide-react";
import { CAPTION_PRESETS } from "@/lib/captionPresets";
import { CaptionStyle } from "@/types/caption";

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
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
        <Paintbrush className="w-5 h-5 text-primary" />
        <h3 className="text-base font-semibold tracking-wide">
          Caption Static Styles
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {CAPTION_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => handlePresetSelect(preset)}
            title={preset.name}
            className="group relative rounded-lg overflow-hidden border-2 border-pink-500/20 hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-200"
          >
            <img
              src={preset.preview}
              alt={preset.name}
              className="w-full aspect-video object-cover transition-transform duration-200 group-hover:scale-105"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
              <span className="text-xs font-semibold font-cyber text-white">
                {preset.name}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
