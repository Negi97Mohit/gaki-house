import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";

export const InfiniteGridLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animateRow = (el: HTMLElement | null, dir: number) => {
      if (!el) return;
      gsap.to(el, {
        xPercent: dir * -50,
        ease: "none",
        duration: 20,
        repeat: -1,
      });
    };
    animateRow(row1Ref.current, 1);
    animateRow(row2Ref.current, -1);
  }, []);

  // Duplicate sections to create illusion of infinity
  const items = [...sections, ...sections, ...sections];

  return (
    <div className="w-full h-full bg-black flex flex-col justify-center gap-4 overflow-hidden">
      <div ref={row1Ref} className="flex gap-4 w-[200%]">
        {items.map((section, i) => (
          <div
            key={`${section.id}-1-${i}`}
            className="w-[400px] h-[250px] shrink-0 bg-gray-800 relative"
          >
            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id }}
              {...props}
            />
          </div>
        ))}
      </div>
      <div ref={row2Ref} className="flex gap-4 w-[200%] -ml-[100%]">
        {items.map((section, i) => (
          <div
            key={`${section.id}-2-${i}`}
            className="w-[400px] h-[250px] shrink-0 bg-gray-800 relative"
          >
            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id }}
              {...props}
            />
          </div>
        ))}
      </div>
    </div>
  );
};
