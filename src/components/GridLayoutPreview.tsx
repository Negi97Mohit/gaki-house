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
  // Detect if this is a "slider" type layout where all sections overlap
  // In that case, show only the first section for a cleaner preview
  const isSliderLayout = sections.length > 1 && sections.every(
    (s) => s.style.width === "100%" && s.style.height === "100%"
  );

  const sectionsToRender = isSliderLayout ? [sections[0]] : sections;

  return (
    <div
      className={cn(
        "relative w-full aspect-video rounded-sm bg-muted/50 overflow-hidden",
        "border border-border/50"
      )}
    >
      {sectionsToRender.map((section, index) => {
        // Get background - check both 'background' and 'backgroundColor' properties
        const bgStyle = section.style.background || section.style.backgroundColor;
        
        return (
          <div
            key={section.id}
            className="absolute border border-background/20"
            style={{
              position: "absolute",
              top: section.style.top,
              left: section.style.left,
              width: section.style.width,
              height: section.style.height,
              // Apply the actual background (gradient or color)
              background: bgStyle || `rgba(139, 92, 246, ${0.3 + index * 0.1})`,
            }}
          />
        );
      })}
      
      {/* Show slide count indicator for slider layouts */}
      {isSliderLayout && sections.length > 1 && (
        <div className="absolute bottom-1 right-1 bg-background/80 text-[8px] px-1 rounded text-muted-foreground">
          {sections.length} slides
        </div>
      )}
    </div>
  );
};
