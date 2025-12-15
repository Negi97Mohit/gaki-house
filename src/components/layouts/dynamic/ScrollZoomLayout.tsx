import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { Plus } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const ScrollZoomContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({ sections, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);
  const { colors, editor, controlsVisible } = useDynamicLayout();

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
    <div ref={containerRef} className="w-full h-[200vh] relative">
      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        <div ref={zoomRef} className="w-[60%] h-[60%] shadow-2xl relative z-10 flex flex-wrap content-center justify-center bg-black/50 backdrop-blur-sm">
          {/* Sections Grid */}
          {sections.map((section, i) => (
            <div
              key={section.id}
              className={cn(
                "relative border overflow-hidden transition-all duration-300",
                sections.length === 1 ? "w-full h-full" : "w-1/2 h-1/2"
              )}
              style={{
                borderColor: colors.textColor,
                backgroundColor: i % 2 === 0 ? "#FF007F" : "#7F00FF", // Neon Pink / Purple
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
              <DynamicDeleteButton sectionId={section.id} className={cn("absolute top-2 right-2", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />
            </div>
          ))}

          {/* Add Button Logic */}
          {sections.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <DynamicAddButton defaultValue="ADD CONTENT" className="w-full h-full" />
            </div>
          ) : (
            <div className={cn(
              "absolute bottom-4 right-4 z-50 transition-all duration-300",
              controlsVisible ? "opacity-100 scale-100" : "opacity-0 scale-0 pointer-events-none"
            )}>
              <button
                onClick={editor.handleAddSection}
                className="w-12 h-12 rounded-full border-none bg-white text-black shadow-lg flex items-center justify-center hover:scale-110 transition-transform"
                style={{ backgroundColor: colors.textColor, color: colors.backgroundColor }}
              >
                <Plus className="w-6 h-6" />
              </button>
            </div>
          )}

        </div>

        {/* Editable Big Text */}
        <div className="absolute z-20 pointer-events-none top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full mix-blend-difference">
          <EditableText
            sectionId="header"
            fieldId="zoomText"
            defaultValue="SCROLL TO ZOOM"
            className="text-center w-full text-[10vw] font-bold tracking-tighter"
          />
        </div>
      </div>
    </div>
  )
}

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
