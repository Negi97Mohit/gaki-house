import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";

gsap.registerPlugin(ScrollTrigger);

export const LayeredParallaxLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const frontRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scroller = scrollerRef.current;
      const ghost = ghostRef.current;
      if (!scroller || !ghost) return;

      // Master timeline linked to scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ghost,
          scroller: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Increased scrub for smoother/weightier feel
          invalidateOnRefresh: true,
        },
      });

      // 1. Background: Zooms in to create "diving" feel
      if (backRef.current) {
        tl.to(
          backRef.current,
          {
            scale: 1.2,
            opacity: 0.6,
            ease: "none",
          },
          0
        );
      }

      // 2. Middle Circles: Rotate and Expand
      if (midRef.current) {
        tl.to(
          midRef.current,
          {
            rotation: 45,
            scale: 1.5,
            opacity: 0, // Fade out as we get closer
            ease: "none",
          },
          0
        );
      }

      // 3. Foreground Card: RISES from below screen to Center
      if (frontRef.current) {
        // Start from below (y: 100vh or similar) and end at center (y: 0)
        // We set initial state in CSS/render, here we define the movement
        tl.fromTo(
          frontRef.current,
          { y: "120vh", rotateX: 20, opacity: 0 },
          {
            y: "0vh",
            rotateX: 0,
            opacity: 1,
            ease: "power2.out",
            duration: 0.8,
          },
          0
        );
      }

      // 4. Text: Moves up quickly and fades out
      if (textRef.current) {
        tl.to(
          textRef.current,
          {
            y: -300,
            opacity: 0,
            scale: 0.8,
            ease: "power1.in",
          },
          0
        );
      }
    }, scrollerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={scrollerRef}
      className="w-full h-full overflow-y-auto bg-[#0a0a0a] relative perspective-[1000px]"
    >
      {/* Increased height to 300% to allow for a longer "exploration" scroll */}
      <div ref={ghostRef} className="ghost-height w-full h-[300%]">
        {/* Sticky Viewport */}
        <div className="sticky top-0 w-full h-full overflow-hidden flex items-center justify-center">
          {/* LAYER 1: Background */}
          <div
            ref={backRef}
            className="absolute inset-0 w-full h-full origin-center opacity-40"
          >
            {sections[0] ? (
              <GridSectionWrapper
                section={sections[0]}
                templateSection={{ id: sections[0].id }}
                {...props}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-slate-900 to-black" />
            )}
          </div>

          {/* LAYER 2: Decorative Circles */}
          <div
            ref={midRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30 origin-center"
          >
            <div className="w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border border-white/20 rounded-full absolute" />
            <div className="w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] border border-white/10 rounded-full absolute" />
          </div>

          {/* LAYER 3: Foreground Card (Starts hidden below) */}
          <div
            ref={frontRef}
            className="absolute z-20 w-[85%] max-w-[450px] aspect-[3/4] bg-black/40 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl overflow-hidden translate-y-[120vh]"
          >
            {sections[1] ? (
              <GridSectionWrapper
                section={sections[1]}
                templateSection={{ id: sections[1].id }}
                {...props}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30 font-mono text-sm border-2 border-dashed border-white/10 m-4 rounded-xl">
                ADD CONTENT 2
              </div>
            )}
            {/* Shiny overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
          </div>

          {/* LAYER 4: Title Text (Visible initially) */}
          <div
            ref={textRef}
            className="absolute z-30 text-center pointer-events-none select-none w-full px-4 flex flex-col items-center justify-center h-full"
          >
            <h1 className="text-[12vw] font-black text-white leading-none tracking-tighter mix-blend-overlay">
              DEPTH
            </h1>
            <div className="mt-8 flex flex-col items-center animate-pulse">
              <p className="text-xs md:text-sm text-white font-mono tracking-[0.3em] uppercase opacity-70 mb-2">
                Scroll to Explore
              </p>
              <div className="w-px h-12 bg-gradient-to-b from-white to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
