// src/components/panels/TextStylePanel.tsx
import React from "react";
import { Palette } from "lucide-react";
import { StyleControls } from "@/components/StyleControls";
import { CaptionStyle } from "@/types/caption";

interface TextStylePanelProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}

export const TextStylePanel: React.FC<TextStylePanelProps> = ({
  style,
  onStyleChange,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/40">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-base font-semibold tracking-wide">
          Caption Text Style
        </h3>
      </div>
      <StyleControls style={style} onStyleChange={onStyleChange} />
    </div>
  );
};
