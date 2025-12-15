import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";

interface KineticStencilLayoutProps {
  sections: CanvasSectionState[];
  [key: string]: any;
}

export const KineticStencilLayout: React.FC<KineticStencilLayoutProps> = ({
  sections,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Breaths animation for the giant text
      gsap.to(textRef.current, {
        scale: 1.1,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const mainSection = sections[0];

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-black overflow-hidden"
    >
      {/* 1. The Video Layer (Full Background) */}
      <div className="absolute inset-0 z-0">
        {mainSection && (
          <GridSectionWrapper
            section={mainSection}
            templateSection={{ id: mainSection.id, name: "Stencil Feed" }}
            {...props}
          />
        )}
      </div>

      {/* 2. The Stencil Mask Layer (White background with Black Text = See through video) */}
      <div className="absolute inset-0 z-10 bg-white mix-blend-multiply flex items-center justify-center pointer-events-none">
        <div ref={textRef} className="text-center">
          <h1 className="text-[25vw] font-black leading-none text-black tracking-tighter">
            VISION
          </h1>
          <h1 className="text-[25vw] font-black leading-none text-black tracking-tighter -mt-[5vw]">
            ARY
          </h1>
        </div>
      </div>

      {/* 3. Overlay Elements (On top of everything) */}
      <div className="absolute inset-0 z-20 pointer-events-none p-12 border-[20px] border-white/10">
        <div className="absolute top-8 left-8 bg-black text-white px-4 py-2 font-mono text-xl uppercase">
          Live Feed
        </div>
        <div className="absolute bottom-8 right-8 text-white font-mono text-right">
          <p>EST. 2025</p>
          <p>KINETIC SERIES</p>
        </div>
      </div>
    </div>
  );
};
