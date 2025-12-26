// src/components/CaptionRenderer.tsx
import React from "react";
import { DYNAMIC_STYLES } from "@/lib/dynamicCaptionStyles";
import { DynamicStyleProps } from "@/types/caption";
import { CaptionStyle } from "@/types/caption";
import { cn } from "@/shared/lib/utils";

interface CaptionRendererProps extends DynamicStyleProps {
  activeStyleId: string;
  captionStyle: CaptionStyle;
}

export const CaptionRenderer: React.FC<CaptionRendererProps> = ({
  activeStyleId,
  captionStyle,
  baseStyle,
  ...props
}) => {
  const getShapeClasses = () => {
    switch (captionStyle.shape) {
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

  // You were calculating this correctly for the log...
  const text = (props.fullTranscript + " " + props.interimTranscript).trim();

  console.log(`[CaptionRenderer] Rendering with text: "${text}"`, {
    activeStyleId,
    text,
  });

  if (!text) return null;

  const styleEntry = DYNAMIC_STYLES[activeStyleId] || DYNAMIC_STYLES["none"];
  const StyleComponent = styleEntry.component;

  const combinedStyle: React.CSSProperties = {
    backgroundColor: captionStyle.backgroundColor,
  };
  if (captionStyle.border) {
    combinedStyle.border = `${captionStyle.borderWidth}px solid ${captionStyle.borderColor}`;
  }
  combinedStyle.minHeight = "2em";

  const innerStyle: React.CSSProperties = {
    fontFamily: baseStyle.fontFamily,
    fontSize: baseStyle.fontSize,
    color: baseStyle.color,
    fontWeight: baseStyle.fontWeight,
    fontStyle: baseStyle.fontStyle,
    textDecoration: baseStyle.textDecoration,
  };

  return (
    <div
      className={cn(
        "w-full p-2 max-w-full transition-all duration-200 flex items-center justify-center text-center overflow-hidden",
        getShapeClasses(),
        captionStyle.shape === "banner" && "px-8",
        captionStyle.shape === "speech-bubble" &&
          `after:border-t-[${captionStyle.backgroundColor.replace(/,/g, "-")}]`
      )}
      style={combinedStyle}
    >
      <div
        style={{
          ...innerStyle,
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {/* FIX: Explicitly pass the 'text' prop to the child component */}
        <StyleComponent {...props} baseStyle={baseStyle} text={text} />
      </div>
    </div>
  );
};
