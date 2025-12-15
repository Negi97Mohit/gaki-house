import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { Plus } from "lucide-react"; // Custom Add Icon

gsap.registerPlugin(ScrollTrigger);

const LayeredParallaxContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({ sections, ...props }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { colors, editor, controlsVisible } = useDynamicLayout();

  const backgroundSection = sections[0];
  const foregroundSections = sections.slice(1);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const scroller = scrollerRef.current;
      const ghost = ghostRef.current;
      if (!scroller || !ghost) return;

      // Master timeline linked to scroll
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: ghost,
          scroller: scroller,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
      });

      // 1. Background
      if (backRef.current) {
        tl.to(backRef.current, { scale: 1.2, opacity: 0.6, ease: "none" }, 0);
      }

      // 2. Middle Circles
      if (midRef.current) {
        tl.to(midRef.current, { rotation: 45, scale: 1.5, opacity: 0, ease: "none" }, 0);
      }

      // 3. Foreground Cards
      const cards = gsap.utils.toArray(".parallax-card");
      if (cards.length > 0) {
        tl.fromTo(
          cards,
          { y: "120vh", rotateX: 20, opacity: 0 },
          {
            y: "0vh",
            rotateX: 0,
            opacity: 1,
            ease: "power2.out",
            duration: 0.8,
            stagger: 0.1
          },
          0
        );
      }

      // 4. Text
      if (textRef.current) {
        tl.to(textRef.current, { y: -300, opacity: 0, scale: 0.8, ease: "power1.in" }, 0);
      }
    }, scrollerRef);

    return () => ctx.revert();
  }, [sections.length]);

  return (
    <div ref={scrollerRef} className="w-full h-full overflow-y-auto relative perspective-[1000px]">

      <div ref={ghostRef} className="ghost-height w-full h-[300%]">
        <div className="sticky top-0 w-full h-full overflow-hidden flex items-center justify-center">

          {/* LAYER 1: Background */}
          <div ref={backRef} className="absolute inset-0 w-full h-full origin-center opacity-40">
            {backgroundSection ? (
              <GridSectionWrapper
                section={backgroundSection}
                templateSection={{ id: backgroundSection.id }}
                onSectionDelete={props.onSectionDelete}
                onSectionContentChange={props.onSectionContentChange}
                {...props}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-slate-900 to-black" />
            )}
            {backgroundSection && (
              <DynamicDeleteButton sectionId={backgroundSection.id} className="absolute top-4 left-4" />
            )}
          </div>

          {/* LAYER 2: Decorative Circles */}
          <div ref={midRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30 origin-center"
            style={{ color: colors.textColor }}
          >
            <div className="w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border border-current rounded-full absolute" />
            <div className="w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] border border-current rounded-full absolute" />
          </div>

          {/* LAYER 3: Foreground Cards */}
          <div className="absolute z-20 w-full h-full flex items-center justify-center pointer-events-none">
            {foregroundSections.map((section, index) => (
              <div
                key={section.id}
                className={cn(
                  "parallax-card absolute w-[85%] max-w-[450px] aspect-[3/4] bg-black/40 backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden pointer-events-auto",
                )}
                style={{
                  borderColor: colors.textColor,
                  zIndex: 20 + index
                }}
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
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />
                <DynamicDeleteButton sectionId={section.id} className={cn("absolute top-2 right-2", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />
              </div>
            ))}

            {/* Add Button (Floating) */}
            <div className={cn(
              "absolute bottom-8 right-8 pointer-events-auto z-50 transition-all duration-500",
              controlsVisible ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
            )}>
              <button
                onClick={editor.handleAddSection}
                className="bg-white text-black p-4 rounded-full shadow-xl hover:scale-110 transition-transform font-bold flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <div onClick={(e) => e.stopPropagation()}>
                  <EditableText
                    sectionId="ui"
                    fieldId="add_layer_label"
                    defaultValue="Add Layer"
                    className="font-bold bg-transparent border-none text-inherit text-left focus:outline-none w-24"
                  />
                </div>
              </button>
            </div>
          </div>

          {/* LAYER 4: Title Text */}
          <div ref={textRef} className="absolute z-30 text-center select-none w-full px-4 flex flex-col items-center justify-center h-full pointer-events-auto">
            <EditableText
              sectionId="header"
              fieldId="title"
              defaultValue="DEPTH"
              className="text-[12vw] font-black leading-none tracking-tighter mix-blend-overlay border-none text-center"
            />
            <div className="mt-8 flex flex-col items-center animate-pulse">
              <EditableText
                sectionId="header"
                fieldId="subtitle"
                defaultValue="Scroll to Explore"
                className="text-xs md:text-sm font-mono tracking-[0.3em] uppercase opacity-70 mb-2 border-none text-center w-full"
              />
              <div className="w-px h-12 bg-gradient-to-b from-current to-transparent" style={{ color: colors.textColor }} />
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export const LayeredParallaxLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#0a0a0a"
      defaultTextColor="#ffffff"
      {...props}
    >
      <LayeredParallaxContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
