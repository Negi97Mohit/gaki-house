import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { cn } from "@/lib/utils";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../LayoutSettingsCtrl";
import { Plus, Trash2 } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

interface KineticTypographyLayoutProps {
  sections: CanvasSectionState[];
  template: any;
  onSectionDelete: (id: string) => void;
  onSectionContentChange: (id: string, content: any) => void;
  [key: string]: any;
}

export const KineticTypographyLayout: React.FC<
  KineticTypographyLayoutProps
> = ({ sections, onSectionDelete, onSectionContentChange, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const marqueeRef1 = useRef<HTMLDivElement>(null);
  const marqueeRef2 = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    hoveredSectionId,
    setHoveredSectionId,
    focusedField,
    setFocusedField,
    toolbarRef,
    handleUpdateText,
    handleUpdateStyle,
    handleFocus,
    handleAddSection,
    handleDeleteSection,
    getFieldStyle,
    getGlobalSettings,
    updateGlobalSetting,
  } = useLayoutEditor({
    layout: props.layout,
    onLayoutUpdate: props.onLayoutUpdate,
  });

  const { backgroundColor, textColor } = getGlobalSettings("#E5E5E5", "#000000");

  const headerData = props.layout.customSectionData?.["header"] || {};
  const marqueeText = headerData.marqueeText || "MOTION DESIGN • EDITORIAL • KINETIC • ";
  const marqueeText2 = headerData.marqueeText2 || "CREATIVE • CANVAS • DYNAMIC • ";

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
  }, [sections]); // Re-run when sections change

  // Split sections for layout variety
  const featuredSection = sections[0];
  const gridSections = sections.slice(1);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden relative font-sans"
      style={{ backgroundColor, color: textColor }}
    >
      <LayoutSettingsCtrl
        backgroundColor={backgroundColor}
        textColor={textColor}
        onUpdate={updateGlobalSetting}
      />

      <LayoutEditorToolbar
        focusedField={focusedField}
        toolbarRef={toolbarRef}
        currentStyle={focusedField ? props.layout.customSectionStyles?.[focusedField.id] : {}}
        onUpdateStyle={(field, value) => focusedField && handleUpdateStyle(focusedField.id, field, value)}
        onClose={() => setFocusedField(null)}
      />

      {/* Background Kinetic Text - Only editable via global marquee settings really, or mapped input */}
      <div className="fixed inset-0 pointer-events-none flex flex-col justify-between opacity-5 z-0 select-none overflow-hidden"
        style={{ color: textColor }}>
        <div
          ref={marqueeRef1}
          className="whitespace-nowrap text-[20vh] font-black leading-none flex w-fit"
        >
          {/* Using a repeating pattern for the marquee */}
          <span>{marqueeText}{marqueeText}</span>
          <span>{marqueeText}{marqueeText}</span>
        </div>
        <div
          ref={marqueeRef2}
          className="whitespace-nowrap text-[20vh] font-black leading-none flex w-fit"
        >
          <span>{marqueeText2}{marqueeText2}</span>
          <span>{marqueeText2}{marqueeText2}</span>

        </div>
      </div>

      <div className="relative z-10 w-full min-h-full p-8 md:p-16 flex flex-col gap-16">
        {/* Header */}
        <header className="w-full border-b-4 pb-8 mb-8" style={{ borderColor: textColor }}>
          {/* Editable Title */}
          <textarea
            value={headerData.title ?? "The Issue"}
            onChange={(e) => {
              handleUpdateText("header", "title", e.target.value);
              e.target.style.height = "auto";
              e.target.style.height = e.target.scrollHeight + "px";
            }}
            onFocus={(e) => handleFocus("header_title", e)}
            style={{
              ...getFieldStyle("header_title"),
              color: textColor // Ensure visible against bg
            }}
            className="w-full bg-transparent text-6xl md:text-8xl xl:text-9xl font-black uppercase tracking-tighter mix-blend-difference break-words focus:outline-none resize-none overflow-hidden bg-transparent p-0 m-0 leading-none"
            rows={1}
          />

          <div className="flex justify-between text-lg md:text-xl font-bold mt-4 uppercase border-t pt-4" style={{ borderColor: textColor }}>
            <textarea
              value={headerData.vol ?? "Vol. 01"}
              onChange={(e) => handleUpdateText("header", "vol", e.target.value)}
              onFocus={(e) => handleFocus("header_vol", e)}
              style={getFieldStyle("header_vol")}
              className="bg-transparent focus:outline-none resize-none w-32"
              rows={1}
            />
            <textarea
              value={headerData.series ?? "Kinetic Series"}
              onChange={(e) => handleUpdateText("header", "series", e.target.value)}
              onFocus={(e) => handleFocus("header_series", e)}
              style={getFieldStyle("header_series")}
              className="bg-transparent focus:outline-none resize-none text-center"
              rows={1}
            />
            <textarea
              value={headerData.year ?? "2025"}
              onChange={(e) => handleUpdateText("header", "year", e.target.value)}
              onFocus={(e) => handleFocus("header_year", e)}
              style={getFieldStyle("header_year")}
              className="bg-transparent focus:outline-none resize-none text-right w-20"
              rows={1}
            />
          </div>
        </header>

        {/* Featured Section (Hero) */}
        {featuredSection && (
          <div
            className="kinetic-card w-full h-[50vh] md:h-[60vh] relative group border-4 bg-white hover:-translate-y-1 transition-all duration-300"
            style={{
              borderColor: textColor,
              boxShadow: `8px 8px 0px 0px ${textColor}`
            }}
            onMouseEnter={() => setHoveredSectionId(featuredSection.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            <div className="absolute top-0 left-0 z-20 px-4 py-2 font-bold text-lg uppercase tracking-wider" style={{ background: textColor, color: backgroundColor }}>
              <input
                value={props.layout.customSectionData?.[featuredSection.id]?.label ?? "Cover Story"}
                onChange={(e) => handleUpdateText(featuredSection.id, "label", e.target.value)}
                className="bg-transparent border-none focus:outline-none text-inherit w-full"
              />
            </div>
            {/* Delete Button */}
            <div className={cn("absolute top-2 right-2 flex gap-2 z-50 transition-opacity duration-200", hoveredSectionId === featuredSection.id ? "opacity-100" : "opacity-0")}>
              <button
                onClick={(e) => handleDeleteSection(featuredSection.id, e)}
                className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md"
                title="Remove Panel"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <GridSectionWrapper
              section={featuredSection}
              templateSection={{ id: featuredSection.id, name: "Hero" }}
              onSectionDelete={onSectionDelete}
              onSectionContentChange={onSectionContentChange}
              {...props}
            />
          </div>
        )}

        {/* Dynamic Grid */}
        <div
          ref={contentRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {gridSections.map((section, i) => (
            <div
              key={section.id}
              className={cn(
                "kinetic-card relative bg-white border-2 h-[300px] md:h-[400px] flex flex-col shadow-lg",
                i % 3 === 0 ? "md:col-span-2" : ""
              )}
              style={{ borderColor: textColor }}
              onMouseEnter={() => setHoveredSectionId(section.id)}
              onMouseLeave={() => setHoveredSectionId(null)}
            >
              <div className="border-b-2 p-2 flex justify-between items-center bg-yellow-300" style={{ borderColor: textColor }}>
                <span className="font-mono font-bold text-xs uppercase tracking-widest text-black">
                  Fig. 0{i + 1}
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full" style={{ background: textColor }} />
                  <div className="w-2 h-2 rounded-full bg-transparent border" style={{ borderColor: textColor }} />
                </div>
              </div>

              <div className="flex-1 relative overflow-hidden group">
                <GridSectionWrapper
                  section={section}
                  templateSection={{ id: section.id, name: `Grid-${i}` }}
                  onSectionDelete={onSectionDelete}
                  onSectionContentChange={onSectionContentChange}
                  {...props}
                />
                {/* Hover controls */}
                <div className={cn("absolute top-2 right-2 flex gap-2 z-50 transition-opacity duration-200", hoveredSectionId === section.id ? "opacity-100" : "opacity-0")}>
                  <button
                    onClick={(e) => handleDeleteSection(section.id, e)}
                    className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-3 border-t-2 bg-white" style={{ borderColor: textColor }}>
                <textarea
                  value={props.layout.customSectionData?.[section.id]?.caption ?? "Section Input"}
                  onChange={(e) => handleUpdateText(section.id, "caption", e.target.value)}
                  onFocus={(e) => handleFocus(`${section.id}_caption`, e)}
                  style={getFieldStyle(`${section.id}_caption`)}
                  className="w-full bg-transparent font-bold text-lg uppercase leading-none border-none focus:outline-none resize-none text-black"
                  rows={1}
                />
              </div>
            </div>
          ))}

          {/* Add Panel Button */}
          <div
            onClick={handleAddSection}
            className="kinetic-card p-8 border-2 border-dashed flex flex-col items-center justify-center h-[300px] md:col-span-1 opacity-50 hover:opacity-100 cursor-pointer hover:bg-black/5 transition-all"
            style={{ borderColor: textColor, color: textColor }}
          >
            <Plus className="w-12 h-12 mb-2" />
            <span className="font-mono text-xl uppercase">Add Panel</span>
          </div>
        </div>

        {/* Footer Filler */}
        <div className="h-[20vh] flex flex-col items-center justify-center border-t-4 mt-8" style={{ borderColor: textColor }}>
          <textarea
            value={headerData.footer ?? "End of Stream"}
            onChange={(e) => handleUpdateText("header", "footer", e.target.value)}
            onFocus={(e) => handleFocus("header_footer", e)}
            style={getFieldStyle("header_footer")}
            className="text-4xl md:text-6xl font-black uppercase text-center bg-transparent border-none focus:outline-none opacity-20 resize-none w-full"
            rows={1}
          />
        </div>
      </div>
    </div>
  );
};
