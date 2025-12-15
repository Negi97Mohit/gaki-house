import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

interface KineticTypographyLayoutProps {
  sections: CanvasSectionState[];
  template: any;
  onSectionDelete: (id: string) => void;
  onSectionContentChange: (id: string, content: any) => void;
  [key: string]: any;
}

export const KineticTypographyLayout: React.FC<
  KineticTypographyLayoutProps
> = ({ sections, onSectionDelete, onSectionContentChange, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef1 = useRef<HTMLDivElement>(null);
  const marqueeRef2 = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Wait for render to ensure refs are ready
    const timer = setTimeout(() => {
      const scroller = containerRef.current;
      if (!scroller) return;

      const ctx = gsap.context(() => {
        // 1. Marquee Animations (Infinite Scroll) - independent of scroll
        const tl = gsap.timeline({ repeat: -1 });
        if (marqueeRef1.current) {
          tl.to(marqueeRef1.current, {
            xPercent: -50,
            duration: 20,
            ease: "none",
          });
        }

        const tl2 = gsap.timeline({ repeat: -1 });
        if (marqueeRef2.current) {
          tl2.to(marqueeRef2.current, {
            xPercent: 50, // Reverse direction
            duration: 25,
            ease: "none",
          });
        }

        // 2. Parallax & Scale Effect on Content Cards
        // IMPORTANT: We must specify 'scroller' because the scrollbar is on the container div
        const cards = gsap.utils.toArray(".kinetic-card");
        cards.forEach((card: any, i) => {
          gsap.fromTo(
            card,
            {
              y: 100,
              opacity: 0,
              scale: 0.9,
              rotation: i % 2 === 0 ? -2 : 2,
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                scroller: scroller, // <--- CRITICAL FIX
                start: "top bottom-=50", // Trigger when top of card hits 50px from bottom of view
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }, containerRef);

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [sections]);

  // Split sections for layout variety
  const featuredSection = sections[0];
  const gridSections = sections.slice(1);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-[#E5E5E5] text-black overflow-y-auto overflow-x-hidden relative font-sans"
    >
      {/* Background Kinetic Text */}
      <div className="fixed inset-0 pointer-events-none flex flex-col justify-between opacity-5 z-0 select-none overflow-hidden">
        <div
          ref={marqueeRef1}
          className="whitespace-nowrap text-[20vh] font-black leading-none flex w-[200%]"
        >
          <span>MOTION DESIGN • EDITORIAL • KINETIC • </span>
          <span>MOTION DESIGN • EDITORIAL • KINETIC • </span>
        </div>
        <div
          ref={marqueeRef2}
          className="whitespace-nowrap text-[20vh] font-black leading-none flex w-[200%] -ml-[100%]"
        >
          <span>CREATIVE • CANVAS • DYNAMIC • </span>
          <span>CREATIVE • CANVAS • DYNAMIC • </span>
        </div>
      </div>

      <div className="relative z-10 w-full min-h-full p-8 md:p-16 flex flex-col gap-16">
        {/* Header */}
        <header className="w-full border-b-4 border-black pb-8 mb-8">
          <h1 className="text-6xl md:text-8xl xl:text-9xl font-black uppercase tracking-tighter mix-blend-difference break-words">
            The Issue
          </h1>
          <div className="flex justify-between text-lg md:text-xl font-bold mt-4 uppercase border-t border-black pt-4">
            <span>Vol. 01</span>
            <span>Kinetic Series</span>
            <span>2025</span>
          </div>
        </header>

        {/* Featured Section (Hero) */}
        {featuredSection && (
          <div className="kinetic-card w-full h-[50vh] md:h-[60vh] relative group border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all duration-300">
            <div className="absolute top-0 left-0 z-20 bg-black text-white px-4 py-2 font-bold text-lg uppercase tracking-wider">
              Cover Story
            </div>
            <GridSectionWrapper
              section={featuredSection}
              templateSection={{ id: featuredSection.id, name: "Hero" }}
              onSectionDelete={onSectionDelete}
              onSectionContentChange={onSectionContentChange}
              {...props}
            />
          </div>
        )}

        {/* Dynamic Grid */}
        <div
          ref={contentRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {gridSections.map((section, i) => (
            <div
              key={section.id}
              className={cn(
                "kinetic-card relative bg-white border-2 border-black h-[300px] md:h-[400px] flex flex-col shadow-lg",
                i % 3 === 0 ? "md:col-span-2" : ""
              )}
            >
              <div className="border-b-2 border-black p-2 flex justify-between items-center bg-yellow-300">
                <span className="font-mono font-bold text-xs uppercase tracking-widest">
                  Fig. 0{i + 1}
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-black" />
                  <div className="w-2 h-2 rounded-full bg-transparent border border-black" />
                </div>
              </div>
              <div className="flex-1 relative overflow-hidden">
                <GridSectionWrapper
                  section={section}
                  templateSection={{ id: section.id, name: `Grid-${i}` }}
                  onSectionDelete={onSectionDelete}
                  onSectionContentChange={onSectionContentChange}
                  {...props}
                />
              </div>
              <div className="p-3 border-t-2 border-black bg-white">
                <h3 className="font-bold text-lg uppercase leading-none">
                  Section Input
                </h3>
              </div>
            </div>
          ))}

          {/* Add Placeholder slots if fewer than 3 grid items to flesh out the layout */}
          {gridSections.length < 3 && (
            <div className="kinetic-card p-8 border-2 border-dashed border-black/30 flex items-center justify-center h-[300px] md:col-span-1 opacity-50">
              <span className="font-mono text-xl uppercase">Coming Soon</span>
            </div>
          )}
        </div>

        {/* Footer Filler */}
        <div className="h-[20vh] flex flex-col items-center justify-center border-t-4 border-black mt-8">
          <p className="text-4xl md:text-6xl font-black text-black/10 uppercase">
            End of Stream
          </p>
        </div>
      </div>
    </div>
  );
};
