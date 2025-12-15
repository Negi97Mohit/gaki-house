import React, { useRef, useEffect } from "react";
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

export const ScrollZoomLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef<HTMLDivElement>(null);

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

  const { backgroundColor, textColor } = getGlobalSettings("#000000", "#ffffff");
  const headerData = props.layout.customSectionData?.["header"] || {};
  const zoomText = headerData.zoomText || "SCROLL TO ZOOM";

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
    <div
      ref={containerRef}
      className="w-full h-[200vh] relative"
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

      <div className="sticky top-0 w-full h-screen overflow-hidden flex items-center justify-center">
        <div ref={zoomRef} className="w-[60%] h-[60%] shadow-2xl relative z-10 flex flex-wrap content-center justify-center bg-black/50 backdrop-blur-sm">
          {/* Render all sections in a grid/flex inside the zoom container */}
          {sections.map((section, i) => (
            <div
              key={section.id}
              className={cn(
                "relative border overflow-hidden transition-all duration-300",
                sections.length === 1 ? "w-full h-full" : "w-1/2 h-1/2" // Simple logic: 1=Full, >1=Grid
              )}
              style={{ borderColor: textColor }}
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
              {/* Delete Panel */}
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

          {/* Add Button */}
          <div
            onClick={handleAddSection}
            className={cn(
              "flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors border-2 border-dashed",
              sections.length === 0 ? "w-full h-full" : "absolute bottom-4 right-4 w-12 h-12 rounded-full border-none bg-white text-black z-50 shadow-lg"
            )}
            style={sections.length === 0 ? { borderColor: textColor } : {}}
          >
            <Plus className={sections.length === 0 ? "w-12 h-12" : "w-6 h-6"} />
            {sections.length === 0 && <span className="mt-2 font-bold" style={{ color: textColor }}>ADD CONTENT</span>}
          </div>
        </div>

        {/* Editable Big Text */}
        <div className="absolute z-20 pointer-events-auto mix-blend-difference top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center w-full">
          <input
            value={zoomText}
            onChange={(e) => handleUpdateText("header", "zoomText", e.target.value)}
            onFocus={(e) => handleFocus("header_zoomText", e)}
            style={{
              ...getFieldStyle("header_zoomText"),
              color: textColor // Actually mix-blend-difference might invert this, but user can change it.
            }}
            className="bg-transparent border-none text-center focus:outline-none w-full text-[10vw] font-bold tracking-tighter"
          />
        </div>
      </div>
    </div>
  );
};
