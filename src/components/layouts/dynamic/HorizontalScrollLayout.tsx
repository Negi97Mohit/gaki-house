import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
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

const HorizontalScrollContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({ sections, ...props }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const { colors, editor, controlsVisible } = useDynamicLayout();

  // Measure track width after render/updates
  useEffect(() => {
    if (trackRef.current) {
      setTimeout(() => {
        setTrackWidth(trackRef.current?.scrollWidth || 0);
      }, 100);
    }
  }, [sections.length]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const scroller = scrollerRef.current;
      const track = trackRef.current;
      if (!scroller || !track || trackWidth === 0) return;

      const windowWidth = scroller.clientWidth;
      const scrollAmount = trackWidth - windowWidth;

      if (scrollAmount <= 0) return;

      gsap.to(track, {
        x: -scrollAmount,
        ease: "none",
        scrollTrigger: {
          trigger: scroller.querySelector(".ghost-height"),
          scroller: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });
    }, scrollerRef);

    return () => ctx.revert();
  }, [trackWidth]);

  return (
    <div ref={scrollerRef} className="w-full h-full overflow-y-auto relative">
      <div
        className="ghost-height w-full"
        style={{
          height: `${Math.max(100, (trackWidth / window.innerWidth) * 100)}vh`,
        }}
      >
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
          <div ref={trackRef} className="flex h-full w-fit">

            {/* Intro Section - Inverted Colors */}
            <div className="w-screen h-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: colors.textColor, color: colors.backgroundColor }}>
              <div className="text-center w-full px-8">
                <EditableText
                  sectionId="header"
                  fieldId="title"
                  defaultValue="Runway"
                  className="text-9xl font-bold uppercase tracking-tighter text-center w-full text-inherit"
                  style={{ color: colors.backgroundColor }}
                />
                <div className={cn(
                  "transition-opacity duration-500",
                  controlsVisible ? "opacity-100" : "opacity-0"
                )}>
                  <EditableText
                    sectionId="header"
                    fieldId="subtitle"
                    defaultValue="↓ SCROLL TO PAN ↓"
                    className="mt-4 text-xl opacity-50 animate-bounce text-center w-full text-inherit"
                    style={{ color: colors.backgroundColor }}
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Sections */}
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="w-[80vw] h-full p-12 shrink-0 border-r border-gray-200 flex items-center justify-center relative group/slide"
                style={{ borderColor: colors.textColor, backgroundColor: colors.backgroundColor }}
              >
                <DynamicDeleteButton sectionId={section.id} className={cn("absolute top-4 right-4", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />

                <div
                  className="w-full h-full relative shadow-2xl overflow-hidden group"
                  style={{ backgroundColor: "#f3f4f6" }}
                  onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                  onMouseLeave={() => editor.setHoveredSectionId(null)}
                >
                  <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id }}
                    onSectionDelete={props.onSectionDelete}
                    onSectionContentChange={props.onSectionContentChange}
                    {...props}
                  />

                  <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/50 to-transparent text-white pointer-events-none">
                    <EditableText
                      sectionId={section.id}
                      fieldId="label"
                      defaultValue={`LOOK 0${i + 1}`}
                      className="text-6xl font-black mix-blend-overlay w-full pointer-events-auto"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add Section Card */}
            <div className="w-[40vw] h-full flex items-center justify-center shrink-0 border-r border-dashed"
              style={{ borderColor: colors.textColor }}>
              <div
                onClick={editor.handleAddSection}
                className={cn(
                  "w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center cursor-pointer hover:bg-black/5 transition-all duration-500",
                  controlsVisible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                )}
                style={{ borderColor: colors.textColor }}
              >
                <Plus className="w-12 h-12" style={{ color: colors.textColor }} />
              </div>
            </div>

            {/* Outro Section */}
            <div className="w-screen h-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: colors.textColor, color: colors.backgroundColor }}>
              <EditableText
                sectionId="header"
                fieldId="outro"
                defaultValue="FIN"
                className="text-9xl font-bold uppercase tracking-tighter text-center w-full text-inherit"
                style={{ color: colors.backgroundColor }}
              />
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export const HorizontalScrollLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#ffffff"
      defaultTextColor="#000000"
      {...props}
    >
      <HorizontalScrollContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
