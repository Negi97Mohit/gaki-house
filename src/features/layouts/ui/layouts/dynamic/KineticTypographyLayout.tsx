import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { cn } from "@/shared/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

gsap.registerPlugin(ScrollTrigger);

const KineticTypographyContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({ sections, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef1 = useRef<HTMLDivElement>(null);
  const marqueeRef2 = useRef<HTMLDivElement>(null);
  const { colors, editor, controlsVisible, layout } = useDynamicLayout();

  const marqueeText = layout.customSectionData?.["header"]?.["marqueeText"] || "MOTION DESIGN • EDITORIAL • KINETIC • ";
  const marqueeText2 = layout.customSectionData?.["header"]?.["marqueeText2"] || "CREATIVE • CANVAS • DYNAMIC • ";

  useEffect(() => {
    // Wait for render to ensure refs are ready
    const timer = setTimeout(() => {
      const scroller = containerRef.current;
      if (!scroller) return;

      const ctx = gsap.context(() => {
        // 1. Marquee Animations (Infinite Scroll) - independent of scroll
        const tl = gsap.timeline({ repeat: -1 });
        if (marqueeRef1.current) {
          try {
            // Reset first to avoid conflict
            gsap.set(marqueeRef1.current, { xPercent: 0 });
            tl.to(marqueeRef1.current, {
              xPercent: -50,
              duration: 20,
              ease: "none",
            });
          } catch (e) { console.warn("GSAP error", e) }
        }

        const tl2 = gsap.timeline({ repeat: -1 });
        if (marqueeRef2.current) {
          try {
            gsap.set(marqueeRef2.current, { xPercent: 0 }); // Reset
            tl2.fromTo(marqueeRef2.current,
              { xPercent: -50 }, // Start shifted left
              {
                xPercent: 0, // Move to 0 (rightward visually)
                duration: 25,
                ease: "none",
              }
            );
          } catch (e) { console.warn("GSAP error", e) }
        }

        // 2. Parallax & Scale Effect on Content Cards
        const cards = gsap.utils.toArray(".kinetic-card");
        cards.forEach((card: any, i) => {
          gsap.fromTo(
            card,
            {
              y: 100,
              opacity: 0,
              scale: 0.9,
              rotation: i % 2 === 0 ? -2 : 2,
            },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              rotation: 0,
              duration: 0.8,
              ease: "power3.out",
              scrollTrigger: {
                trigger: card,
                scroller: scroller,
                start: "top bottom-=50",
                toggleActions: "play none none reverse",
              },
            }
          );
        });
      }, containerRef);

      return () => ctx.revert();
    }, 100);

    return () => clearTimeout(timer);
  }, [sections, marqueeText, marqueeText2]);

  const featuredSection = sections[0];
  const gridSections = sections.slice(1);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden relative font-sans"
    >
      {/* Background Kinetic Text */}
      <div className="fixed inset-0 pointer-events-none flex flex-col justify-between opacity-5 z-0 select-none overflow-hidden"
        style={{ color: colors.textColor }}>
        <div ref={marqueeRef1} className="whitespace-nowrap text-[20vh] font-black leading-none flex w-fit">
          <span>{marqueeText}{marqueeText}</span>
          <span>{marqueeText}{marqueeText}</span>
        </div>
        <div ref={marqueeRef2} className="whitespace-nowrap text-[20vh] font-black leading-none flex w-fit">
          <span>{marqueeText2}{marqueeText2}</span>
          <span>{marqueeText2}{marqueeText2}</span>

        </div>
      </div>

      <div className="relative z-10 w-full min-h-full p-8 md:p-16 flex flex-col gap-16">
        {/* Header */}
        <header className="w-full border-b-4 pb-8 mb-8" style={{ borderColor: colors.textColor }}>
          <EditableText
            sectionId="header"
            fieldId="title"
            defaultValue="The Issue"
            multiline
            className="w-full text-6xl md:text-8xl xl:text-9xl font-black uppercase tracking-tighter mix-blend-difference break-words resize-none overflow-hidden p-0 m-0 leading-none"
          />

          <div className="flex justify-between text-lg md:text-xl font-bold mt-4 uppercase border-t pt-4" style={{ borderColor: colors.textColor }}>
            <EditableText sectionId="header" fieldId="vol" defaultValue="Vol. 01" className="w-32 resize-none" multiline />
            <EditableText sectionId="header" fieldId="series" defaultValue="Kinetic Series" className="text-center resize-none" multiline />
            <EditableText sectionId="header" fieldId="year" defaultValue="2025" className="text-right w-20 resize-none" multiline />
          </div>
        </header>

        {/* Featured Section (Hero) */}
        {featuredSection && (
          <div
            className="kinetic-card w-full h-[50vh] md:h-[60vh] relative group border-4 hover:-translate-y-1 transition-all duration-300"
            style={{
              backgroundColor: "#ff4d4d", // Vibrant red for hero
              borderColor: colors.textColor,
              boxShadow: `8px 8px 0px 0px ${colors.textColor}`
            }}
            onMouseEnter={() => editor.setHoveredSectionId(featuredSection.id)}
            onMouseLeave={() => editor.setHoveredSectionId(null)}
          >
            <div className="absolute top-0 left-0 z-20 px-4 py-2 font-bold text-lg uppercase tracking-wider" style={{ background: colors.textColor, color: colors.backgroundColor }}>
              <EditableText sectionId={featuredSection.id} fieldId="label" defaultValue="Cover Story" className="text-inherit" />
            </div>

            <DynamicDeleteButton sectionId={featuredSection.id} className={cn("absolute top-2 right-2", editor.hoveredSectionId === featuredSection.id ? "opacity-100" : "opacity-0")} />

            <GridSectionWrapper
              section={featuredSection}
              templateSection={{ id: featuredSection.id, name: "Hero" }}
              onSectionDelete={props.onSectionDelete}
              onSectionContentChange={props.onSectionContentChange}
              isHovered={editor.hoveredSectionId === featuredSection.id}
              {...props}
            />
          </div>
        )}

        {/* Dynamic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {gridSections.map((section, i) => (
            <div
              key={section.id}
              className={cn(
                "kinetic-card relative border-2 h-[300px] md:h-[400px] flex flex-col shadow-lg",
                i % 3 === 0 ? "md:col-span-2" : ""
              )}
              style={{
                borderColor: colors.textColor,
                backgroundColor: i % 2 === 0 ? "#ffffff" : "#f0f0f0" // Alternating slight contrast
              }}
              onMouseEnter={() => editor.setHoveredSectionId(section.id)}
              onMouseLeave={() => editor.setHoveredSectionId(null)}
            >
              <div className="border-b-2 p-2 flex justify-between items-center bg-yellow-300" style={{ borderColor: colors.textColor }}>
                <span className="font-mono font-bold text-xs uppercase tracking-widest text-black">
                  Fig. 0{i + 1}
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: colors.textColor }} />
                  <div className="w-2 h-2 rounded-full bg-transparent border" style={{ borderColor: colors.textColor }} />
                </div>
              </div>

              <div className="flex-1 relative overflow-hidden group">
                <GridSectionWrapper
                  section={section}
                  templateSection={{ id: section.id, name: `Grid-${i}` }}
                  onSectionDelete={props.onSectionDelete}
                  onSectionContentChange={props.onSectionContentChange}
                  isHovered={editor.hoveredSectionId === section.id}
                  {...props}
                />
                <DynamicDeleteButton sectionId={section.id} className={cn("absolute top-2 right-2", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />
              </div>

              <div className="p-3 border-t-2 bg-white" style={{ borderColor: colors.textColor }}>
                <EditableText
                  sectionId={section.id}
                  fieldId="caption"
                  defaultValue="Section Input"
                  className="font-bold text-lg uppercase leading-none text-black resize-none"
                  multiline
                />
              </div>
            </div>
          ))}

          <DynamicAddButton className="kinetic-card h-[300px] md:col-span-1" defaultValue="Add Panel" />
        </div>

        {/* Footer Filler */}
        <div className="h-[20vh] flex flex-col items-center justify-center border-t-4 mt-8" style={{ borderColor: colors.textColor }}>
          <EditableText
            sectionId="header"
            fieldId="footer"
            defaultValue="End of Stream"
            className="text-4xl md:text-6xl font-black uppercase text-center opacity-20 resize-none"
            multiline
          />
        </div>

        {/* Settings Footer - using controlsVisible logic from wrapper */}
        <div className={cn(
          "border-t-4 pt-8 mt-16 pb-32 transition-opacity duration-300",
          controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
        )} style={{ borderColor: colors.textColor }}>
          <h3 className="text-xl font-bold uppercase mb-4 opacity-50">Background Text Settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase block mb-2 opacity-50">Top Scrolling Text</label>
              <EditableText
                sectionId="header"
                fieldId="marqueeText"
                defaultValue="MOTION DESIGN • EDITORIAL • KINETIC • "
                className="bg-black/5 p-4 font-mono text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold uppercase block mb-2 opacity-50">Bottom Scrolling Text</label>
              <EditableText
                sectionId="header"
                fieldId="marqueeText2"
                defaultValue="CREATIVE • CANVAS • DYNAMIC • "
                className="bg-black/5 p-4 font-mono text-sm"
              />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export const KineticTypographyLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#E5E5E5"
      defaultTextColor="#000000"
      {...props}
    >
      <KineticTypographyContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
