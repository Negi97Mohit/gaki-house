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

  const isPairsLayout =
    count > 2 &&
    count % 2 === 0 &&
    sections.every(
      (s) => !s.style.top && !s.style.left && !s.style.width && !s.style.height
    );

  if (isPairsLayout) {
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

  const needsFallback = sections.some(
    (s) => !s.style.top && !s.style.left && !s.style.width && !s.style.height
  );

  if (!needsFallback) return sections;

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
  // --- 1. HADID RIBBON PREVIEW (UPDATED) ---
  // Reflects the new Linear/Gallery style
  if (templateId === "hadid-ribbon") {
    return (
      <div className="relative w-full aspect-video rounded-md bg-[#f8fafc] border border-border/50 overflow-hidden group">
        {/* Floor Line */}
        <div className="absolute bottom-[20%] left-0 w-full h-[1px] bg-black/5" />

        {/* Floating Cards (Linear) */}
        <div className="absolute top-1/2 left-[15%] w-[30%] h-[50%] bg-white border border-gray-200 shadow-sm rounded-sm transform -translate-y-1/2 group-hover:-translate-y-[55%] transition-transform duration-500 overflow-hidden">
          <div className="w-full h-full" style={{ background: sections[0]?.style?.background || "#ffffff" }} />
        </div>

        <div className="absolute top-1/2 left-[50%] w-[30%] h-[50%] bg-white border border-gray-200 shadow-sm rounded-sm transform -translate-y-1/2 group-hover:-translate-y-[55%] transition-transform duration-500 delay-75 z-20 overflow-hidden">
          <div className="w-full h-full" style={{ background: sections[1]?.style?.background || "#ffffff" }} />
        </div>

        {/* Peek next card */}
        <div className="absolute top-1/2 left-[85%] w-[15%] h-[50%] bg-white/80 border border-dashed border-gray-300 rounded-sm transform -translate-y-1/2 scale-90 opacity-60 ml-2" />

        <div className="absolute bottom-1 right-2 text-[8px] font-mono font-bold text-gray-400 uppercase tracking-widest bg-white/50 px-1 rounded">
          LINEAR
        </div>
      </div>
    );
  }

  if (templateId === "liquid-lens") {
    const s1 = sections[0]?.style?.background || "#f0f9ff";
    const s2 = sections[1]?.style?.background || "#f0fdf4";
    const s3 = sections[2]?.style?.background || "#fff7ed";

    return (
      <div className="relative w-full aspect-video rounded-sm bg-white border border-border/50 overflow-hidden">
        {/* Title Layer */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-[20px] font-black text-black/5 uppercase tracking-tighter">FLUID</span>
        </div>

        {/* Nodes */}
        <div className="absolute inset-0 flex items-center justify-center scale-75 gap-2">
          <div className="w-16 h-12 bg-white shadow-lg rounded-sm border border-black/10 flex items-center justify-center transform -rotate-2 hover:scale-105 transition-transform">
            <div className="w-full h-full" style={{ background: s1 }}></div>
          </div>
          <div className="w-16 h-12 bg-white shadow-lg rounded-sm border border-black/10 flex items-center justify-center transform rotate-2 z-10 hover:scale-105 transition-transform">
            <div className="w-full h-full" style={{ background: s2 }}></div>
          </div>
          <div className="w-16 h-12 bg-white shadow-lg rounded-sm border border-black/10 flex items-center justify-center transform -rotate-1 hover:scale-105 transition-transform opacity-80">
            <div className="w-full h-full" style={{ background: s3 }}></div>
          </div>
        </div>

        <div className="absolute bottom-2 left-2 flex gap-1 items-center opacity-50">
          <div className="w-1 h-1 bg-black rounded-full"></div>
          <span className="text-[6px] font-mono">SCROLL</span>
        </div>
      </div>
    );
  }

  if (templateId === "vogue-parallax") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-white border border-border/50 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
          <span className="text-[30px] font-serif font-bold uppercase text-black">
            VOGUE
          </span>
        </div>
        <div className="absolute top-[10%] left-[10%] w-[35%] h-[60%] border border-black/10 shadow-sm" style={{ background: sections[0]?.style?.background || "#f3f4f6" }} />
        <div className="absolute top-[30%] right-[10%] w-[35%] h-[60%] border border-black/10 shadow-sm" style={{ background: sections[1]?.style?.background || "#f3f4f6" }} />
        <div className="absolute bottom-1 right-1 text-[7px] font-mono text-black/40 bg-white/80 px-1 rounded">
          EDITORIAL
        </div>
      </div>
    );
  }

  if (templateId === "brutalist-glitch") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-black border border-white/20 overflow-hidden">
        <div className="absolute inset-0 opacity-50" style={{ background: sections[0]?.style?.background }} />
        <div className="absolute top-2 left-2 w-12 h-12 border border-white/80 bg-white/10 animate-pulse" />
        <div className="absolute bottom-2 right-2 w-16 h-8 bg-white text-black text-[6px] font-mono flex items-center justify-center font-bold">
          ERROR_404
        </div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[1px] bg-red-500/50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1px] h-full bg-blue-500/50" />
      </div>
    );
  }

  if (templateId === "diagonal-rush") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-[#1a1a2e] border border-border/50 overflow-hidden flex items-center justify-center gap-4">
        <div className="absolute inset-[-50%] w-[200%] h-[200%] rotate-[-5deg] opacity-20 pointer-events-none flex flex-col justify-center gap-2">
          <div className="bg-white/10 h-2 w-full"></div>
          <div className="bg-white/10 h-2 w-full translate-x-10"></div>
          <div className="bg-white/10 h-2 w-full -translate-x-10"></div>
        </div>
        <div className="w-[80px] h-[100px] bg-[#FACC15] transform -rotate-2 border-4 border-[#FACC15] shadow-[5px_5px_0px_rgba(250,204,21,0.2)] z-10 flex items-center justify-center">
          <div className="w-[80%] h-[80%] bg-black/10"></div>
        </div>
        <div className="w-[80px] h-[100px] bg-[#A3E635] transform rotate-2 border-4 border-[#A3E635] shadow-[5px_5px_0px_rgba(163,230,53,0.2)] z-10 flex items-center justify-center">
          <div className="w-[80%] h-[80%] bg-black/10"></div>
        </div>
      </div>
    )
  }

  if (templateId === "infinite-grid") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-[#101010] border border-border/50 overflow-hidden flex flex-col justify-center gap-2 p-4">
        <div className="flex gap-2 w-[150%] -ml-8">
          <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#EE5D5D] shrink-0 opacity-80"></div>
          <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-[#4ECDC4] to-[#45B7AF] shrink-0 opacity-80"></div>
          <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#EE5D5D] shrink-0 opacity-80"></div>
          <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-[#4ECDC4] to-[#45B7AF] shrink-0 opacity-80"></div>
        </div>
        <div className="flex gap-2 w-[150%] -ml-16">
          <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-[#4ECDC4] to-[#45B7AF] shrink-0 opacity-80"></div>
          <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#EE5D5D] shrink-0 opacity-80"></div>
          <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-[#4ECDC4] to-[#45B7AF] shrink-0 opacity-80"></div>
          <div className="w-24 h-16 rounded-lg bg-gradient-to-br from-[#FF6B6B] to-[#EE5D5D] shrink-0 opacity-80"></div>
        </div>
      </div>
    )
  }

  if (templateId === "kinetic-stencil") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-[#FFD700] border border-border/50 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-[url('https://grain-url')] opacity-30 mix-blend-overlay"></div>
        <div className="text-[30px] font-black leading-none text-center bg-black text-transparent bg-clip-text mix-blend-multiply opacity-80 tracking-tighter">
          VISION<br />ARY
        </div>
        <div className="absolute inset-4 border-[3px] border-black/10 mix-blend-overlay"></div>
        <div className="absolute top-3 left-3 bg-black text-[#FFD700] text-[5px] font-bold px-1.5 py-0.5 uppercase tracking-widest">
          Stencil Mode
        </div>
      </div>
    )
  }

  if (templateId === "kinetic-typography") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-[#E5E5E5] border border-border/50 overflow-hidden flex flex-col p-4 gap-4">
        <div className="w-full text-[12px] font-black uppercase tracking-tight leading-none border-b-2 border-black pb-1">The Issue</div>

        <div className="grid grid-cols-3 gap-2 flex-1">
          <div className="col-span-1 h-full bg-[#ff4d4d] border-2 border-black shadow-[3px_3px_0px_black] relative group"></div>
          <div className="col-span-1 h-full bg-white border-2 border-black shadow-[3px_3px_0px_black] relative"></div>
          <div className="col-span-1 h-full bg-black border-2 border-black shadow-[3px_3px_0px_black] relative"></div>
        </div>
      </div>
    )
  }

  if (templateId === "layered-parallax") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-[#0f172a] border border-border/50 overflow-hidden flex items-center justify-center perspective-[50px]">
        {/* Parallax Layers */}
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_#1e293b_0%,_#0f172a_100%)]"></div>

        <div className="w-[28%] aspect-[3/4] bg-[#334155] border border-white/10 rounded-lg shadow-2xl transform translate-x-8 translate-y-4 rotate-3 opacity-60 scale-90"></div>
        <div className="w-[32%] aspect-[3/4] bg-[#475569] border border-white/20 rounded-lg shadow-2xl transform -translate-x-6 -translate-y-2 -rotate-2 z-10"></div>
        <div className="absolute bottom-4 right-4 text-slate-500/20 text-[40px] font-black leading-none select-none">
          DEPTH
        </div>
      </div>
    )
  }

  if (templateId === "scroll-zoom") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-[#120A2A] border border-border/50 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <span className="text-white mix-blend-difference text-[8px] font-bold tracking-tighter">SCROLL TO ZOOM</span>
        </div>
        <div className="w-[60%] h-[60%] grid grid-cols-2 bg-black/50 shadow-2xl relative z-10 transform scale-110">
          <div className="bg-[#FF007F] border border-white/20"></div>
          <div className="bg-[#7F00FF] border border-white/20"></div>
          <div className="bg-[#7F00FF] border border-white/20"></div>
          <div className="bg-[#FF007F] border border-white/20"></div>
        </div>
      </div>
    )
  }

  if (templateId === "sticky-split") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-white border border-border/50 overflow-hidden flex">
        <div className="w-1/2 h-full p-4 flex flex-col justify-center gap-3 bg-white">
          <div className="w-8 h-1 bg-black/20 rounded-full"></div>
          <div className="w-24 h-2 bg-black/80 rounded mb-2"></div>
          <div className="w-full h-1 bg-black/10 rounded"></div>
          <div className="w-2/3 h-1 bg-black/10 rounded"></div>
          <div className="w-4/5 h-1 bg-black/10 rounded"></div>
        </div>
        <div className="w-1/2 h-full bg-gray-50 border-l border-black/5 flex items-center justify-center p-4">
          <div className="w-full h-full bg-white shadow-lg border border-black/5 rounded-lg transform translate-x-2 translate-y-2"></div>
        </div>
      </div>
    )
  }


  if (templateId === "circular-gallery") {
    return (
      <div className="relative w-full aspect-video rounded-sm bg-[#0F0F0F] border border-border/50 overflow-hidden flex items-center justify-center perspective-[100px]">
        <div className="absolute text-white/5 text-[24px] font-black uppercase tracking-tighter scale-150">GALLERY</div>

        {/* Ring items */}
        <div className="w-[35%] aspect-video bg-gradient-to-br from-[hsl(280,70%,40%)] to-[hsl(280,70%,20%)] border border-white/20 rounded-sm shadow-2xl transform -translate-x-[60%] translate-z-[-20px] rotate-y-[30deg] absolute opacity-60"></div>

        <div className="w-[45%] aspect-video bg-gradient-to-br from-[hsl(340,70%,50%)] to-[hsl(340,70%,30%)] border border-white/30 rounded-md shadow-2xl transform z-10 relative hover:scale-105 transition-transform"></div>

        <div className="w-[35%] aspect-video bg-gradient-to-br from-[hsl(40,70%,40%)] to-[hsl(40,70%,20%)] border border-white/20 rounded-sm shadow-2xl transform translate-x-[60%] translate-z-[-20px] rotate-y-[-30deg] absolute opacity-60"></div>
      </div>
    )
  }

  if (templateId === "snap-sections") {
    // Show first 3 sections to imply vertical scroll
    const previewSections = sections.slice(0, 3);
    const hasMore = sections.length > 3;

    return (
      <div className="relative w-full aspect-video rounded-sm bg-black border border-border/50 overflow-hidden flex flex-col">
        {previewSections.map((section, i) => (
          <div
            key={section.id}
            className="w-full flex-1 relative border-b border-white/10 last:border-0"
            style={{ background: section.style?.background || "#1a1a1a" }}
          >
            {/* Simulated Text Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-2">
              <div className="w-1/3 h-1 bg-white/20 rounded mb-1"></div>
              <div className="w-1/2 h-2 bg-white/40 rounded"></div>
            </div>
          </div>
        ))}
        {hasMore && (
          <div className="absolute bottom-1 w-full text-center">
            <div className="inline-block w-4 h-4 rounded-full bg-white/20 animate-bounce"></div>
          </div>
        )}
        {/* Overlay Title */}
        <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 rounded text-[8px] text-white font-mono uppercase">
          Snap Stories
        </div>
      </div>
    );
  }

  // --- STANDARD LAYOUT LOGIC ---
  const isSliderLayout =
    sections.length > 1 &&
    sections.every(
      (s) => s.style.width === "100%" && s.style.height === "100%"
    );

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

      {isSliderLayout && sections.length > 1 && (
        <div className="absolute bottom-1 right-1 bg-background/80 text-[8px] px-1 rounded text-muted-foreground">
          {sections.length} slides
        </div>
      )}

      {!isSliderLayout && sections.length > processedSections.length && (
        <div className="absolute bottom-1 right-1 bg-background/80 text-[8px] px-1 rounded text-muted-foreground">
          {sections.length / 2} pairs
        </div>
      )}
    </div>
  );
};
