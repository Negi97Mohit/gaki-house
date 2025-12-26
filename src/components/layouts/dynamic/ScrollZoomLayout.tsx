import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/shared/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { Plus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ScrollZoomContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const { colors, editor, controlsVisible } = useDynamicLayout();

  // Calculate grid dimensions
  const rowCount = Math.ceil(sections.length / 2);
  const containerHeight = Math.max(200, rowCount * 60);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(zoomRef.current, {
        scale: 1.25,
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
        },
      });
    }, containerRef);
    return () => ctx.revert();
  }, [sections.length]);

  return (
    <div
      ref={containerRef}
      className="w-full relative"
      style={{ height: `${containerHeight}vh` }}
    >
      {/* Sticky Viewport 
        - acts as the 'camera' that stays pinned 
        - overflow-hidden ensures the 'absolute' children are contained
      */}
      <div className="sticky top-0 w-full h-screen overflow-hidden">
        {/* Scrollable Layer for Panels 
           - This sits behind the text
           - It handles the scrolling of the panels
        */}
        <div className="absolute inset-0 w-full h-full overflow-y-auto overflow-x-hidden flex items-start pt-20 justify-center">
          <div
            ref={zoomRef}
            className="w-[80%] md:w-[60%] min-h-[60vh] h-auto shadow-2xl relative z-10 flex flex-wrap content-start justify-center bg-black/50 backdrop-blur-sm rounded-lg mb-20"
          >
            {/* Sections Grid */}
            {sections.map((section, i) => (
              <div
                key={section.id}
                className={cn(
                  "relative border overflow-hidden transition-all duration-300 group",
                  sections.length === 1
                    ? "w-full aspect-video"
                    : "w-full md:w-1/2 aspect-video"
                )}
                style={{
                  borderColor: colors.textColor,
                  backgroundColor: i % 2 === 0 ? "#FF007F" : "#7F00FF",
                }}
                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                onMouseLeave={() => editor.setHoveredSectionId(null)}
              >
                <GridSectionWrapper
                  section={section}
                  templateSection={{ id: section.id }}
                  onSectionDelete={props.onSectionDelete}
                  onSectionContentChange={props.onSectionContentChange}
                  isHovered={editor.hoveredSectionId === section.id}
                  {...props}
                />

                <DynamicDeleteButton
                  sectionId={section.id}
                  className={cn(
                    "absolute top-2 right-2 z-50",
                    editor.hoveredSectionId === section.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
              </div>
            ))}

            {/* Add Button Logic */}
            {sections.length === 0 ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <DynamicAddButton
                  defaultValue="ADD CONTENT"
                  className="w-full h-full"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "fixed bottom-8 right-8 z-[60] transition-all duration-300",
                  controlsVisible
                    ? "opacity-100 scale-100"
                    : "opacity-0 scale-0 pointer-events-none"
                )}
              >
                <button
                  onClick={editor.handleAddSection}
                  className="w-14 h-14 rounded-full border-2 bg-white text-black shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
                  style={{
                    backgroundColor: colors.textColor,
                    color: colors.backgroundColor,
                    borderColor: colors.backgroundColor,
                  }}
                >
                  <Plus className="w-8 h-8" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Text Overlay 
           - Positioned absolute relative to the sticky container
           - Does NOT scroll with the panels
           - pointer-events-none ensures clicks pass through to the scroll layer
        */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center mix-blend-difference">
          <div className="text-center w-full">
            <EditableText
              sectionId="header"
              fieldId="zoomText"
              defaultValue="SCROLL TO ZOOM"
              className="text-center w-full text-[10vw] font-bold tracking-tighter opacity-50"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const ScrollZoomLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#120A2A"
      defaultTextColor="#ffffff"
      {...props}
    >
      <ScrollZoomContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
