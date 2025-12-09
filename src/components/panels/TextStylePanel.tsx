// src/components/panels/TextStylePanel.tsx
import React from "react";
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
    <div className="space-y-4 font-mono">
      {/* Section Label */}
      <div className="pb-3 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          Customize Text Style
        </span>
      </div>
      
      <StyleControls style={style} onStyleChange={onStyleChange} />
    </div>
  );
};
