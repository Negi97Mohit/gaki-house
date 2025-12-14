import React from "react";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { cn } from "@/lib/utils";

interface GridLayoutPreviewProps {
  sections: CanvasLayoutTemplate["sections"];
  templateId?: string;
}

// Generate fallback positions for standard sections that don't have explicit positioning
const generateFallbackPositions = (
  sections: CanvasLayoutTemplate["sections"]
) => {
  const count = sections.length;

  // Check if this is a pairs layout (e.g., Double Vertical Slider)
  const isPairsLayout =
    count > 2 &&
    count % 2 === 0 &&
    sections.every(
      (s) => !s.style.top && !s.style.left && !s.style.width && !s.style.height
    );

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
      },
    }));
  }

  // Check if sections need fallback (no positioning defined)
  const needsFallback = sections.some(
    (s) => !s.style.top && !s.style.left && !s.style.width && !s.style.height
  );

  if (!needsFallback) return sections;

  // Generate grid-like fallback positions
  if (count === 2) {
    return sections.map((section, i) => ({
      ...section,
      style: {
        ...section.style,
        top: "5%",
        left: i === 0 ? "3%" : "51%",
        width: "46%",
        height: "90%",
      },
    }));
  }

  if (count === 3) {
    return sections.map((section, i) => ({
      ...section,
      style: {
        ...section.style,
        top: `${5 + i * 32}%`,
        left: "5%",
        width: "90%",
        height: "28%",
      },
    }));
  }

  if (count === 4) {
    return sections.map((section, i) => ({
      ...section,
      style: {
        ...section.style,
        top: i < 2 ? "5%" : "52%",
        left: i % 2 === 0 ? "3%" : "51%",
        width: "46%",
        height: "43%",
      },
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
    },
  }));
};

export const GridLayoutPreview: React.FC<GridLayoutPreviewProps> = ({
  sections,
  templateId,
}) => {
  // --- 1. HADID RIBBON PREVIEW ---
  if (templateId === "hadid-ribbon") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-white border border-border/50 overflow-hidden group">
        {/* The Curve Path */}
        <svg
          className="absolute inset-0 w-full h-full text-black/10 group-hover:text-black/20 transition-colors"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <path
            d="M 50,0 Q 90,25 50,50 Q 10,75 50,100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          />
        </svg>

        {/* Nodes along curve */}
        <div className="absolute top-[10%] left-[55%] w-[30%] h-[20%] bg-white border border-black/20 shadow-sm rounded-sm z-10" />
        <div className="absolute top-[40%] left-[15%] w-[30%] h-[20%] bg-white border border-black/20 shadow-sm rounded-sm z-10" />
        <div className="absolute top-[70%] left-[55%] w-[30%] h-[20%] bg-white border border-black/20 shadow-sm rounded-sm z-10" />

        <div className="absolute bottom-1 right-1 text-[7px] font-mono text-black/40 bg-white/80 px-1 rounded">
          PARAMETRIC
        </div>
      </div>
    );
  }

  // --- 2. LIQUID LENS PREVIEW ---
  if (templateId === "liquid-lens") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-gray-50 border border-border/50 overflow-hidden">
        {/* Ripples */}
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-300 via-transparent to-transparent" />

        {/* Grid */}
        <div className="grid grid-cols-3 gap-1 p-2 h-full items-center">
          <div className="aspect-square bg-white border border-black/10 shadow-sm rounded-sm transform -translate-y-1" />
          <div className="aspect-square bg-white border border-black/10 shadow-sm rounded-sm transform translate-y-1" />
          <div className="aspect-square bg-white border border-black/10 shadow-sm rounded-sm transform -translate-y-1" />
        </div>
        <div className="absolute bottom-1 right-1 text-[7px] font-mono text-black/40 bg-white/80 px-1 rounded">
          FLUID
        </div>
      </div>
    );
  }

  // --- 3. VOGUE EDITORIAL PREVIEW ---
  if (templateId === "vogue-parallax") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-white border border-border/50 overflow-hidden">
        {/* Title Background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="text-[30px] font-serif font-bold uppercase text-black">
            VOGUE
          </span>
        </div>
        {/* Asymmetrical Columns */}
        <div className="absolute top-[10%] left-[10%] w-[35%] h-[60%] bg-gray-100 border border-black/10 shadow-sm" />
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[60%] bg-gray-100 border border-black/10 shadow-sm" />
        <div className="absolute bottom-1 right-1 text-[7px] font-mono text-black/40 bg-white/80 px-1 rounded">
          EDITORIAL
        </div>
      </div>
    );
  }



  // --- 5. BRUTALIST GLITCH PREVIEW ---
  if (templateId === "brutalist-glitch") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-black border border-white/20 overflow-hidden">
        <div className="absolute top-2 left-2 w-12 h-12 border border-white/80 bg-white/10 animate-pulse" />
        <div className="absolute bottom-2 right-2 w-16 h-8 bg-white text-black text-[6px] font-mono flex items-center justify-center font-bold">
          ERROR_404
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-red-500/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-blue-500/50" />
      </div>
    );
  }





  // --- STANDARD LAYOUT LOGIC (Slider / Grid) ---

  // Detect if this is a "slider" type layout where all sections overlap
  const isSliderLayout =
    sections.length > 1 &&
    sections.every(
      (s) => s.style.width === "100%" && s.style.height === "100%"
    );

  // Generate positions for sections without explicit positioning
  const processedSections = isSliderLayout
    ? [sections[0]]
    : generateFallbackPositions(sections);

  return (
    <div
      className={cn(
        "relative w-full aspect-video rounded-sm bg-muted/50 overflow-hidden",
        "border border-border/50"
      )}
    >
      {processedSections.map((section, index) => {
        const bgStyle =
          section.style.background || section.style.backgroundColor;

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
