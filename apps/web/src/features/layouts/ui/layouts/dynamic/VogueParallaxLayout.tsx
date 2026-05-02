import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@gaki/core/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@gaki/core/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus, Trash2, Type } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface VogueParallaxProps {
  sections: CanvasSectionState[];
  layout?: CanvasLayoutState;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

export const VogueParallaxLayout: React.FC<VogueParallaxProps> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const mainContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);

  // Editable Title State - Default to VOGUE
  const [mainTitle, setMainTitle] = useState("VOGUE");

  // --- Add Section Logic ---
  const handleAddSection = () => {
    if (!layout || !onLayoutUpdate) return;

    const newSection: CanvasSectionState = {
      id: `vogue-${Date.now()}`,
      content: { type: "empty" },
      style: {
        background: "linear-gradient(to bottom, #ffffff, #f7f7f7)",
      },
    };

    onLayoutUpdate({
      ...layout,
      sections: [...layout.sections, newSection],
    });
  };

  // --- Remove Section Logic ---
  const handleRemoveSection = (sectionId: string) => {
    if (!layout || !onLayoutUpdate) return;
    if (layout.sections.length <= 1) return;

    onLayoutUpdate({
      ...layout,
      sections: layout.sections.filter((s) => s.id !== sectionId),
    });
  };

  useEffect(() => {
    if (!scrollContainerRef.current || !mainContainerRef.current) return;

    ScrollTrigger.defaults({
      scroller: scrollContainerRef.current,
    });

    const ctx = gsap.context(() => {
      // 1. Title Parallax - Slower movement, keeps opacity high
      gsap.to(titleRef.current, {
        y: 300,
        ease: "none",
        scrollTrigger: {
          trigger: scrollContainerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // 2. Column Parallax
      gsap.to(".vogue-col-left", {
        y: -150,
        ease: "none",
        scrollTrigger: {
          trigger: ".vogue-grid",
          start: "top bottom",
          end: "bottom top",
          scrub: 0.5,
        },
      });

      gsap.fromTo(
        ".vogue-col-right",
        { y: -50 },
        {
          y: 200,
          ease: "none",
          scrollTrigger: {
            trigger: ".vogue-grid",
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        }
      );

      // 3. Entry Animations (Cards appear smoothly)
      const cards = gsap.utils.toArray<HTMLElement>(".vogue-card");
      cards.forEach((card) => {
        gsap.fromTo(
          card,
          { y: 80, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 100%", // Trigger slightly earlier
              toggleActions: "play none none reverse",
            },
          }
        );
      });
    }, mainContainerRef);

    setTimeout(() => ScrollTrigger.refresh(), 500);

    return () => {
      ctx.revert();
      ScrollTrigger.defaults({ scroller: window });
    };
  }, [sections]);

  const leftSections = sections.filter((_, i) => i % 2 === 0);
  const rightSections = sections.filter((_, i) => i % 2 !== 0);

  return (
    <div
      ref={mainContainerRef}
      className="relative w-full h-full bg-white text-black overflow-hidden group/main"
    >
      {/* 1. Grain/Noise Overlay */}
      <div
        className="absolute inset-0 z-50 pointer-events-none opacity-[0.04] mix-blend-multiply"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* 2. Scrollable Area */}
      <div
        ref={scrollContainerRef}
        className="w-full h-full overflow-y-auto overflow-x-hidden relative z-10 scrollbar-hide perspective-1px"
      >
        {/* Sticky Title (SOLID BLACK & EDITABLE) */}
        {/* z-0 ensures it is behind images, but pointer-events-auto allows clicking in the gaps */}
        <div className="absolute top-0 left-0 w-full h-[80vh] flex items-center justify-center z-0 pointer-events-auto">
          <div ref={titleRef} className="relative group/title cursor-text">
            <input
              value={mainTitle}
              onChange={(e) => setMainTitle(e.target.value)}
              className="text-[18vw] font-serif leading-none tracking-tighter text-black uppercase bg-transparent border-none text-center focus:outline-none w-full min-w-[50vw] placeholder:text-black/50"
              style={{ textShadow: "0px 10px 30px rgba(0,0,0,0.1)" }} // Subtle shadow for depth
            />
            {/* Edit Icon hint */}
            <Type className="absolute -top-8 right-0 w-6 h-6 text-black opacity-0 group-hover/title:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* 3. The Grid */}
        <div className="vogue-grid relative z-10 grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-16 max-w-[1400px] mx-auto min-h-[120vh] px-6 md:px-12 py-32 pointer-events-none">
          {/* LEFT COLUMN */}
          <div className="vogue-col-left col-span-1 md:col-span-5 flex flex-col gap-24 pointer-events-auto">
            {leftSections.map((section, i) => (
              <VogueCard
                key={section.id}
                section={section}
                index={i * 2}
                onRemove={() => handleRemoveSection(section.id)}
                {...wrapperProps}
              />
            ))}

            {/* Add Button */}
            <button
              onClick={handleAddSection}
              className="group flex items-center gap-4 opacity-60 hover:opacity-100 transition-opacity py-12 cursor-pointer pointer-events-auto"
            >
              <div className="w-14 h-14 rounded-full border-2 border-black flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                <Plus className="w-6 h-6" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-sm tracking-widest uppercase">
                  Add Page
                </span>
                <span className="text-[10px] text-gray-500 font-mono">
                  NEW SECTION
                </span>
              </div>
            </button>
          </div>

          {/* SPACER (Click-through to title) */}
          <div className="hidden md:block col-span-2 pointer-events-none" />

          {/* RIGHT COLUMN */}
          <div className="vogue-col-right col-span-1 md:col-span-5 flex flex-col gap-24 pt-0 md:pt-48 pointer-events-auto">
            {rightSections.map((section, i) => (
              <VogueCard
                key={section.id}
                section={section}
                index={i * 2 + 1}
                onRemove={() => handleRemoveSection(section.id)}
                {...wrapperProps}
              />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="h-64 w-full flex items-center justify-center text-black/40 text-xs font-mono tracking-[1em] uppercase pb-24">
          End of Issue
        </div>
      </div>
    </div>
  );
};

// --- Updated Card Component ---
const VogueCard = ({ section, index, onRemove, ...props }: any) => {
  return (
    <div className="vogue-card group relative w-full mb-12">
      {/* Numbering */}
      <div className="absolute -top-12 -left-4 text-7xl font-serif text-black/10 z-0 select-none">
        {(index + 1).toString().padStart(2, "0")}
      </div>

      {/* Frame with Delete Button */}
      <div className="relative z-10 w-full aspect-[4/5] bg-white shadow-[0_20px_40px_-10px_rgba(0,0,0,0.2)] transition-all duration-500 hover:shadow-[0_30px_60px_-10px_rgba(0,0,0,0.3)] hover:-translate-y-2">
        {/* Delete Button (Top Right) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute -top-4 -right-4 z-50 w-10 h-10 bg-white border border-black/10 rounded-full flex items-center justify-center text-black/40 opacity-0 group-hover:opacity-100 hover:bg-black hover:text-white hover:border-black transition-all shadow-md cursor-pointer"
          title="Remove Page"
        >
          <Trash2 className="w-4 h-4" />
        </button>

        {/* Content Wrapper */}
        <div
          className="w-full h-full overflow-hidden text-black pointer-events-auto relative z-20"
          style={{ background: section.style?.background || "#ffffff" }}
        >
          <GridSectionWrapper
            section={section}
            templateSection={{ id: section.id, name: "Editorial Frame" }}
            isHovered={props.editor?.hoveredSectionId === section.id}
            {...props}
          />
        </div>

        {/* Inner Border Frame */}
        <div className="absolute inset-4 border border-black/5 pointer-events-none z-30" />
      </div>

      {/* Editable Caption */}
      <div className="flex justify-between items-end mt-6 px-1 border-b border-black pt-2 pb-2">
        <input
          defaultValue={`Figure ${section.id.slice(0, 4)}`}
          className="bg-transparent border-none text-xs font-bold uppercase tracking-[0.2em] text-black focus:outline-none w-full placeholder:text-black/30"
          placeholder="CAPTION..."
        />
        <div className="w-4 h-[2px] bg-black group-hover:w-12 transition-all duration-500" />
      </div>
    </div>
  );
};
