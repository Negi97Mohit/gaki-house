import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";

export const CircularGalleryLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const wheelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.to(wheelRef.current, {
      rotation: 360,
      duration: 40,
      repeat: -1,
      ease: "none",
    });
  }, []);

  const radius = 400; // px

  return (
    <div className="w-full h-full bg-[#1a1a1a] overflow-hidden flex items-center justify-center relative">
      <div className="absolute text-white/10 text-[20vw] font-bold">SPIN</div>
      <div
        ref={wheelRef}
        className="relative w-[800px] h-[800px] rounded-full border border-white/10"
      >
        {sections.map((section, i) => {
          const angle = (i / sections.length) * 2 * Math.PI;
          const x = Math.cos(angle) * radius + 400; // center offset
          const y = Math.sin(angle) * radius + 400;

          return (
            <div
              key={section.id}
              className="absolute w-[300px] h-[200px] -ml-[150px] -mt-[100px] bg-gray-800 border-2 border-white rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              style={{
                left: x,
                top: y,
                transform: `rotate(${angle * (180 / Math.PI) + 90}deg)`,
              }}
            >
              <GridSectionWrapper
                section={section}
                templateSection={{ id: section.id }}
                {...props}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
