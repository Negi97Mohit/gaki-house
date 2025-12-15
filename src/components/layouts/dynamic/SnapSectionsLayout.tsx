import React from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";

export const SnapSectionsLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory bg-black text-white">
      {sections.map((section, i) => (
        <div
          key={section.id}
          className="w-full h-full snap-start relative flex items-center justify-center"
        >
          {/* Background Media */}
          <div className="absolute inset-0 opacity-60">
            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id }}
              {...props}
            />
          </div>

          {/* Overlay Text */}
          <div className="relative z-10 text-center mix-blend-difference">
            <h2 className="text-2xl tracking-[0.5em] uppercase mb-4">
              Story 0{i + 1}
            </h2>
            <h1 className="text-8xl font-black uppercase">IMMERSE</h1>
          </div>
        </div>
      ))}
      {/* Placeholder if empty */}
      {sections.length === 0 && (
        <div className="w-full h-full flex items-center justify-center snap-start">
          Add sections to start story
        </div>
      )}
    </div>
  );
};
