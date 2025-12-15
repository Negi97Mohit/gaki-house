import React from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";

export const StickySplitLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const stickyMedia = sections[0];

  return (
    <div className="w-full h-full flex bg-white text-black overflow-y-auto">
      <div className="w-1/2 p-20 flex flex-col gap-[80vh]">
        <div>
          <h1 className="text-8xl font-serif mb-8">The Collection.</h1>
          <p className="text-xl leading-relaxed">
            Scroll to explore the visual narrative of the new season.
          </p>
        </div>
        <div>
          <h2 className="text-4xl font-serif mb-4">Chapter 01</h2>
          <p className="text-lg">
            Minimalism redefined through texture and form.
          </p>
        </div>
        <div>
          <h2 className="text-4xl font-serif mb-4">Chapter 02</h2>
          <p className="text-lg">Bold structures meeting organic flow.</p>
        </div>
      </div>
      <div className="w-1/2 h-full sticky top-0 bg-gray-100">
        {stickyMedia && (
          <GridSectionWrapper
            section={stickyMedia}
            templateSection={{ id: stickyMedia.id }}
            {...props}
          />
        )}
      </div>
    </div>
  );
};
