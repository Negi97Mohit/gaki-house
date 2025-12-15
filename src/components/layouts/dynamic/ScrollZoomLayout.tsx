import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";

gsap.registerPlugin(ScrollTrigger);

export const ScrollZoomLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(zoomRef.current, {
        scale: 1.5,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-[200vh] bg-black relative">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        <div ref={zoomRef} className="w-[60%] h-[60%] shadow-2xl relative z-10">
          {sections[0] && (
            <GridSectionWrapper
              section={sections[0]}
              templateSection={{ id: sections[0].id }}
              {...props}
            />
          )}
        </div>
        <h1 className="absolute z-20 text-white text-[10vw] font-bold mix-blend-difference pointer-events-none">
          ZOOM IN
        </h1>
      </div>
    </div>
  );
};
