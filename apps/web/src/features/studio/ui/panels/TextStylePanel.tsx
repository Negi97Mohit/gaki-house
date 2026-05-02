// src/components/panels/TextStylePanel.tsx
import React from "react";
import { StyleControls } from "@/features/caption/ui/StyleControls";
import { CaptionStyle } from "@gaki/core/types/caption";

interface TextStylePanelProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}

export const TextStylePanel: React.FC<TextStylePanelProps> = ({
  style,
  onStyleChange,
}) => {
  return <StyleControls style={style} onStyleChange={onStyleChange} />;
};
