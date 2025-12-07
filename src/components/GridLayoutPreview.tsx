// src/components/GridLayoutPreview.tsx
import React from "react";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { cn } from "@/lib/utils";

interface GridLayoutPreviewProps {
  sections: CanvasLayoutTemplate["sections"];
}

export const GridLayoutPreview: React.FC<GridLayoutPreviewProps> = ({
  sections,
}) => {
  return (
    <div
      className={cn(
        "relative w-full aspect-video rounded-sm bg-muted/50 overflow-hidden",
        "border border-border/50"
      )}
    >
      {sections.map((section, index) => (
        <div
          key={section.id}
          className="absolute border border-background/20"
          style={{
            ...section.style,
            // Use the background color from the layout, or a fallback
            backgroundColor:
              section.style.backgroundColor ||
              `rgba(139, 92, 246, ${0.3 + index * 0.1})`, // Fallback with violet tint
          }}
        />
      ))}
    </div>
  );
};
