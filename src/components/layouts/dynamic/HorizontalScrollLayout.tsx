import React, { useRef, useLayoutEffect, useState, useEffect } from "react";
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

export const HorizontalScrollLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const inactiveTimer = useRef<NodeJS.Timeout | null>(null);

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

  const { backgroundColor, textColor } = getGlobalSettings("#ffffff", "#000000");
  const headerData = props.layout.customSectionData?.["header"] || {};

  // Mouse Inactivity Logic
  useEffect(() => {
    const onMouseMove = () => {
      setControlsVisible(true);
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current);
      inactiveTimer.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    };

    window.addEventListener("mousemove", onMouseMove);
    onMouseMove();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current);
    }
  }, []);

  // Measure track width after render
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
    <div
      ref={scrollerRef}
      className="w-full h-full overflow-y-auto relative"
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

      {/* Ghost Height */}
      <div
        className="ghost-height w-full"
        style={{
          height: `${Math.max(100, (trackWidth / window.innerWidth) * 100)}vh`,
        }}
      >
        {/* Sticky Viewport */}
        <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center">
          {/* The Moving Track */}
          <div ref={trackRef} className="flex h-full w-fit">

            {/* Intro Section - Inverted Colors for Contrast */}
            <div className="w-screen h-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: textColor, color: backgroundColor }}>
              <div className="text-center w-full px-8">
                <input
                  value={headerData.title ?? "Runway"}
                  onChange={(e) => handleUpdateText("header", "title", e.target.value)}
                  onFocus={(e) => handleFocus("header_title", e)}
                  style={{ ...getFieldStyle("header_title"), color: backgroundColor }}
                  className="bg-transparent border-none text-9xl font-bold uppercase tracking-tighter text-center focus:outline-none w-full"
                />
                <div className={cn(
                  "transition-opacity duration-500",
                  controlsVisible ? "opacity-100" : "opacity-0"
                )}>
                  <input
                    value={headerData.subtitle ?? "↓ SCROLL TO PAN ↓"}
                    onChange={(e) => handleUpdateText("header", "subtitle", e.target.value)}
                    onFocus={(e) => handleFocus("header_subtitle", e)}
                    style={{ ...getFieldStyle("header_subtitle"), color: backgroundColor }}
                    className="bg-transparent border-none mt-4 text-xl opacity-50 animate-bounce text-center focus:outline-none w-full"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Sections */}
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="w-[80vw] h-full p-12 shrink-0 border-r border-gray-200 flex items-center justify-center relative group/slide"
                style={{
                  borderColor: textColor,
                  backgroundColor
                }}
              >
                {/* Delete Button (Top Right) */}
                <div className={cn(
                  "absolute top-4 right-4 z-50 transition-opacity duration-300",
                  hoveredSectionId === section.id && controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
                  // Modified to ALSO depend on controlsVisible, or just hover? 
                  // Usually "mouse inactivity" implies global cleanup, but if I'm actively hovering a card, the mouse IS moving/active.
                  // The inactiveTimer handles lack of MOVEMENT.
                  // So if I stare at a card for 3s, the delete button fades. That's consistent.
                )}>
                  <button
                    onClick={(e) => handleDeleteSection(section.id, e)}
                    className="bg-red-500 text-white p-3 rounded-full hover:scale-110 shadow-lg"
                  >
                    <Trash2 className="w-6 h-6" />
                  </button>
                </div>

                <div
                  className="w-full h-full relative shadow-2xl overflow-hidden group"
                  style={{ backgroundColor: "#f3f4f6" }}
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

                  {/* Overlay Label - Auto hide as well? User only asked for SCROLL TO PAN. */}
                  {/* I'll leave label visible as it's content. */}
                  <div className="absolute bottom-0 left-0 p-8 w-full bg-gradient-to-t from-black/50 to-transparent text-white pointer-events-none">
                    <input
                      value={props.layout.customSectionData?.[section.id]?.label ?? `LOOK 0${i + 1}`}
                      onChange={(e) => handleUpdateText(section.id, "label", e.target.value)}
                      className="bg-transparent border-none text-6xl font-black mix-blend-overlay focus:outline-none w-full pointer-events-auto"
                    />
                  </div>
                </div>
              </div>
            ))}

            {/* Add Section Card */}
            <div className="w-[40vw] h-full flex items-center justify-center shrink-0 border-r border-dashed"
              style={{ borderColor: textColor }}>
              <div
                onClick={handleAddSection}
                className={cn(
                  "w-32 h-32 rounded-full border-4 border-dashed flex items-center justify-center cursor-pointer hover:bg-black/5 transition-all duration-500",
                  controlsVisible ? "opacity-100 scale-100" : "opacity-0 scale-75 pointer-events-none"
                )}
                style={{ borderColor: textColor }}
              >
                <Plus className="w-12 h-12" style={{ color: textColor }} />
              </div>
            </div>

            {/* Outro Section */}
            <div className="w-screen h-full flex items-center justify-center shrink-0"
              style={{ backgroundColor: textColor, color: backgroundColor }}>
              <input
                value={headerData.outro ?? "FIN"}
                onChange={(e) => handleUpdateText("header", "outro", e.target.value)}
                onFocus={(e) => handleFocus("header_outro", e)}
                style={{ ...getFieldStyle("header_outro"), color: backgroundColor }}
                className="bg-transparent border-none text-9xl font-bold uppercase tracking-tighter text-center focus:outline-none w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
