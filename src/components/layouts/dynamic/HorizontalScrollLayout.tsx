import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";

gsap.registerPlugin(ScrollTrigger);

export const HorizontalScrollLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  // Measure track width after render
  useEffect(() => {
    if (trackRef.current) {
      setTrackWidth(trackRef.current.scrollWidth);
    }
  }, [sections]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scroller = scrollerRef.current;
      const track = trackRef.current;
      if (!scroller || !track || trackWidth === 0) return;

      const windowWidth = scroller.clientWidth;
      const scrollAmount = trackWidth - windowWidth;

      // Only animate if content overflows
      if (scrollAmount <= 0) return;

      gsap.to(track, {
        x: -scrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: scroller.querySelector(".ghost-height"), // Trigger on the tall ghost element
          scroller: scroller, // IMPORTANT: Watch this specific container, not the window
          start: "top top",
          end: "bottom bottom",
          scrub: 1, // Smooth scrubbing
          invalidateOnRefresh: true,
        },
      });
    }, scrollerRef);

    return () => ctx.revert();
  }, [trackWidth]);

  return (
    // 1. The Scroll Container (This creates the scrollbar)
    <div
      ref={scrollerRef}
      className="w-full h-full overflow-y-auto bg-white relative"
    >
      {/* 2. Ghost Height (Creates space to scroll) */}
      {/* Height = horizontal width + extra buffer for feel */}
      <div
        className="ghost-height w-full"
        style={{
          height: `${Math.max(100, (trackWidth / window.innerWidth) * 100)}vh`,
        }}
      >
        {/* 3. Sticky Viewport (Stays fixed while you scroll down) */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
          {/* 4. The Moving Track */}
          <div ref={trackRef} className="flex h-full w-fit">
            {/* Intro Section */}
            <div className="w-screen h-full flex items-center justify-center bg-black text-white shrink-0">
              <div className="text-center">
                <h1 className="text-9xl font-bold uppercase tracking-tighter">
                  Runway
                </h1>
                <p className="mt-4 text-xl opacity-50 animate-bounce">
                  ↓ SCROLL TO PAN ↓
                </p>
              </div>
            </div>

            {/* Dynamic Sections */}
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="w-[80vw] h-full p-12 shrink-0 border-r border-gray-200 flex items-center justify-center"
              >
                <div className="w-full h-full bg-gray-100 relative shadow-2xl overflow-hidden group">
                  <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id }}
                    {...props}
                  />

                  {/* Overlay Label */}
                  <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/50 to-transparent text-white">
                    <h2 className="text-6xl font-black mix-blend-overlay">
                      LOOK 0{i + 1}
                    </h2>
                  </div>
                </div>
              </div>
            ))}

            {/* Outro Section */}
            <div className="w-screen h-full flex items-center justify-center bg-black text-white shrink-0">
              <h1 className="text-9xl font-bold uppercase tracking-tighter">
                FIN
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
