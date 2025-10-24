// src/components/CaptionPreviewRenderer.tsx

import React from "react";
import { CaptionStyle } from "@/types/caption";
import { cn } from "@/lib/utils";

interface CaptionPreviewRendererProps {
  style: CaptionStyle;
  text: string;
}

const getShapeClasses = (shape: CaptionStyle["shape"]) => {
  switch (shape) {
    case "pill":
      return "rounded-full";
    case "rectangular":
      return "rounded-none";
    case "speech-bubble":
      return "rounded-2xl relative after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:translate-y-full after:border-8 after:border-transparent after:border-t-current";
    case "banner":
      return "rounded-none w-full text-center";
    default:
      return "rounded-xl";
  }
};

export const CaptionPreviewRenderer: React.FC<CaptionPreviewRendererProps> = ({
  style,
  text,
}) => {
  // Calculate final static CSS properties
  const finalStyle: React.CSSProperties = {
    fontFamily: style.fontFamily,
    fontSize: `${style.fontSize}px`,
    color: style.color,
    backgroundColor: style.backgroundColor,
    fontWeight: style.bold ? "bold" : "normal",
    fontStyle: style.italic ? "italic" : "normal",
    textDecoration: style.underline ? "underline" : "none",
    border: style.border
      ? `${style.borderWidth}px solid ${style.borderColor}`
      : "none",
    textShadow: style.shadow ? "0 2px 4px rgba(0,0,0,0.5)" : "none",
    transform: `rotate(${style.rotation || 0}deg)`,
    // Ensure the speech bubble pointer color uses the background color
    "--tw-border-t-current": style.backgroundColor,
    // Ensure the text itself is readable even with a transparent BG
    minWidth: "200px",
  };

  return (
    <div
      className={cn(
        "p-2 text-center shadow-lg transition-all duration-200 inline-block",
        getShapeClasses(style.shape)
      )}
      style={finalStyle}
    >
      {text}
    </div>
  );
};
