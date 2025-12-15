import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../LayoutSettingsCtrl";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

gsap.registerPlugin(ScrollTrigger);

export const LayeredParallaxLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ghostRef = useRef<HTMLDivElement>(null);
  const backRef = useRef<HTMLDivElement>(null);
  const midRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

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

  const { backgroundColor, textColor } = getGlobalSettings("#0a0a0a", "#ffffff");
  const headerData = props.layout.customSectionData?.["header"] || {};

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
            stagger: 0.1 // Stagger effects if multiple cards
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
    <div
      ref={scrollerRef}
      className="w-full h-full overflow-y-auto relative perspective-[1000px]"
      style={{ backgroundColor }}
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

      <div ref={ghostRef} className="ghost-height w-full h-[300%]">
        <div className="sticky top-0 w-full h-full overflow-hidden flex items-center justify-center">

          {/* LAYER 1: Background */}
          <div
            ref={backRef}
            className="absolute inset-0 w-full h-full origin-center opacity-40"
          >
            {sections[0] ? (
              <GridSectionWrapper
                section={sections[0]}
                templateSection={{ id: sections[0].id }}
                onSectionDelete={props.onSectionDelete}
                onSectionContentChange={props.onSectionContentChange}
                {...props}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-b from-slate-900 to-black" />
            )}
            {/* Delete for Background */}
            {sections[0] && (
              <div className="absolute top-4 left-4 z-50">
                <button
                  onClick={(e) => handleDeleteSection(sections[0].id, e)}
                  className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md opacity-20 hover:opacity-100"
                  title="Remove Background"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* LAYER 2: Decorative Circles */}
          <div
            ref={midRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-30 origin-center"
            style={{ color: textColor }}
          >
            <div className="w-[60vw] h-[60vw] max-w-[600px] max-h-[600px] border border-current rounded-full absolute" />
            <div className="w-[40vw] h-[40vw] max-w-[400px] max-h-[400px] border border-current rounded-full absolute" />
          </div>

          {/* LAYER 3: Foreground Cards */}
          <div className="absolute z-20 w-full h-full flex items-center justify-center pointer-events-none">
            {/* Stack foreground sections */}
            {sections.slice(1).map((section, index) => (
              <div
                key={section.id}
                className={cn(
                  "parallax-card absolute w-[85%] max-w-[450px] aspect-[3/4] bg-black/40 backdrop-blur-xl border shadow-2xl rounded-2xl overflow-hidden pointer-events-auto",
                  // Slight offset for stacked look if multiple? 
                  // Actually, purely stacking them on top with stagger animation is cool. 
                  // But if they end at same Y (0), they overlap perfectly.
                  // Let's vary the END y slightly or scale?
                  // For now they stack.
                )}
                style={{
                  borderColor: textColor,
                  // Offset indices slightly visually if sitting static (not animating)
                  zIndex: 20 + index
                }}
                onMouseEnter={() => setHoveredSectionId(section.id)}
                onMouseLeave={() => setHoveredSectionId(null)}
              >
                <GridSectionWrapper
                  section={section}
                  templateSection={{ id: section.id }}
                  onSectionDelete={props.onSectionDelete}
                  onSectionContentChange={props.onSectionContentChange}
                  {...props}
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

                {/* Delete */}
                <div className={cn("absolute top-2 right-2 flex gap-2 z-50 transition-opacity duration-200", hoveredSectionId === section.id ? "opacity-100" : "opacity-0")}>
                  <button
                    onClick={(e) => handleDeleteSection(section.id, e)}
                    className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Add Button (Floating) */}
            <div className="absolute bottom-8 right-8 pointer-events-auto z-50">
              <button
                onClick={handleAddSection}
                className="bg-white text-black p-4 rounded-full shadow-xl hover:scale-110 transition-transform font-bold flex items-center gap-2"
                title="Add Layer"
              >
                <Plus className="w-5 h-5" />
                Add Layer
              </button>
            </div>
          </div>

          {/* LAYER 4: Title Text */}
          <div
            ref={textRef}
            className="absolute z-30 text-center select-none w-full px-4 flex flex-col items-center justify-center h-full pointer-events-auto"
          >
            <input
              value={headerData.title ?? "DEPTH"}
              onChange={(e) => handleUpdateText("header", "title", e.target.value)}
              onFocus={(e) => handleFocus("header_title", e)}
              style={getFieldStyle("header_title")} // Use Global text color if mapped?
              className="text-[12vw] font-black leading-none tracking-tighter mix-blend-overlay bg-transparent border-none text-center focus:outline-none w-full"
            />

            <div className="mt-8 flex flex-col items-center animate-pulse">
              <input
                value={headerData.subtitle ?? "Scroll to Explore"}
                onChange={(e) => handleUpdateText("header", "subtitle", e.target.value)}
                onFocus={(e) => handleFocus("header_subtitle", e)}
                style={{
                  ...getFieldStyle("header_subtitle"),
                  color: textColor
                }}
                className="text-xs md:text-sm font-mono tracking-[0.3em] uppercase opacity-70 mb-2 bg-transparent border-none text-center focus:outline-none w-full"
              />
              <div className="w-px h-12 bg-gradient-to-b from-current to-transparent" style={{ color: textColor }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
