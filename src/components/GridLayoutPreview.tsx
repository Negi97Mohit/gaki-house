// src/components/GridLayoutPreview.tsx
import React from "react";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { cn } from "@/lib/utils";

interface GridLayoutPreviewProps {
  sections: CanvasLayoutTemplate["sections"];
}

// Generate fallback positions for sections that don't have explicit positioning
const generateFallbackPositions = (sections: CanvasLayoutTemplate["sections"]) => {
  const count = sections.length;
  
  // Check if this is a pairs layout (e.g., Double Vertical Slider)
  const isPairsLayout = count > 2 && count % 2 === 0 && 
    sections.every(s => !s.style.top && !s.style.left && !s.style.width && !s.style.height);
  
  if (isPairsLayout) {
    // Show first pair side by side as preview
    return sections.slice(0, 2).map((section, i) => ({
      ...section,
      style: {
        ...section.style,
        top: "10%",
        left: i === 0 ? "5%" : "52%",
        width: "43%",
        height: "80%",
      }
    }));
  }
  
  // Check if sections need fallback (no positioning defined)
  const needsFallback = sections.some(s => !s.style.top && !s.style.left && !s.style.width && !s.style.height);
  
  if (!needsFallback) return sections;
  
  // Generate grid-like fallback positions
  if (count === 2) {
    // Split layout
    return sections.map((section, i) => ({
      ...section,
      style: {
        ...section.style,
        top: "5%",
        left: i === 0 ? "3%" : "51%",
        width: "46%",
        height: "90%",
      }
    }));
  }
  
  if (count === 3) {
    // Stacked layout
    return sections.map((section, i) => ({
      ...section,
      style: {
        ...section.style,
        top: `${5 + i * 32}%`,
        left: "5%",
        width: "90%",
        height: "28%",
      }
    }));
  }
  
  if (count === 4) {
    // 2x2 grid
    return sections.map((section, i) => ({
      ...section,
      style: {
        ...section.style,
        top: i < 2 ? "5%" : "52%",
        left: i % 2 === 0 ? "3%" : "51%",
        width: "46%",
        height: "43%",
      }
    }));
  }
  
  // Generic fallback: stacked rows
  const heightPer = Math.floor(85 / count);
  return sections.map((section, i) => ({
    ...section,
    style: {
      ...section.style,
      top: `${5 + i * heightPer}%`,
      left: "5%",
      width: "90%",
      height: `${heightPer - 3}%`,
    }
  }));
};

export const GridLayoutPreview: React.FC<GridLayoutPreviewProps> = ({
  sections,
}) => {
  // Detect if this is a "slider" type layout where all sections overlap
  const isSliderLayout = sections.length > 1 && sections.every(
    (s) => s.style.width === "100%" && s.style.height === "100%"
  );

  // Generate positions for sections without explicit positioning
  const processedSections = isSliderLayout ? [sections[0]] : generateFallbackPositions(sections);

  return (
    <div
      className={cn(
        "relative w-full aspect-video rounded-sm bg-muted/50 overflow-hidden",
        "border border-border/50"
      )}
    >
      {processedSections.map((section, index) => {
        const bgStyle = section.style.background || section.style.backgroundColor;
        
        return (
          <div
            key={section.id}
            className="absolute border border-background/20"
            style={{
              position: "absolute",
              top: section.style.top || "0%",
              left: section.style.left || "0%",
              width: section.style.width || "100%",
              height: section.style.height || "100%",
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
      
      {/* Show section count for pair layouts */}
      {!isSliderLayout && sections.length > processedSections.length && (
        <div className="absolute bottom-1 right-1 bg-background/80 text-[8px] px-1 rounded text-muted-foreground">
          {sections.length / 2} pairs
        </div>
      )}
    </div>
  );
};
