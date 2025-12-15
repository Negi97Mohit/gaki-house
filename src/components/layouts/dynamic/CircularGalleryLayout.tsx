import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../LayoutSettingsCtrl";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const CircularGalleryLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const wheelRef = useRef<HTMLDivElement>(null);

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

  const { backgroundColor, textColor } = getGlobalSettings("#1a1a1a", "#ffffff");
  const headerData = props.layout.customSectionData?.["header"] || {};
  const spinText = headerData.spinText || "SPIN";

  useEffect(() => {
    const tween = gsap.to(wheelRef.current, {
      rotation: 360,
      duration: 40,
      repeat: -1,
      ease: "none",
    });

    // Store tween on element for easy access? Or mostly just rely on React state re-renders not killing it?
    // Actually, re-renders might duplicate tweens if not cleaned up.
    // gsap.context handles cleanup.

    return () => { tween.kill(); };
  }, []);

  const radius = 400; // px

  return (
    <div
      className="w-full h-full overflow-hidden flex items-center justify-center relative"
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

      {/* Background Text */}
      <div className="absolute flex items-center justify-center pointer-events-auto z-0">
        <input
          value={spinText}
          onChange={(e) => handleUpdateText("header", "spinText", e.target.value)}
          onFocus={(e) => handleFocus("header_spinText", e)}
          style={{
            ...getFieldStyle("header_spinText"),
            color: textColor,
            opacity: 0.1
          }}
          className="bg-transparent border-none text-[20vw] font-bold text-center focus:outline-none w-full uppercase"
        />
      </div>

      <div
        ref={wheelRef}
        className="relative w-[800px] h-[800px] rounded-full border border-white/10 z-10"
        onMouseEnter={() => gsap.globalTimeline.timeScale(0)} // Global pause on hover for interaction
        onMouseLeave={() => gsap.globalTimeline.timeScale(1)}
      >
        {sections.map((section, i) => {
          const angle = (i / sections.length) * 2 * Math.PI;
          const x = Math.cos(angle) * radius + 400; // center offset
          const y = Math.sin(angle) * radius + 400;

          return (
            <div
              key={section.id}
              className="absolute w-[300px] h-[200px] -ml-[150px] -mt-[100px] bg-gray-800 border-2 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)] group"
              style={{
                left: x,
                top: y,
                transform: `rotate(${angle * (180 / Math.PI) + 90}deg)`,
                borderColor: textColor
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
              {/* Delete Button */}
              <div className={cn("absolute top-2 right-2 z-50 transition-opacity duration-200", hoveredSectionId === section.id ? "opacity-100" : "opacity-0")}>
                <button
                  onClick={(e) => handleDeleteSection(section.id, e)}
                  className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Central Add Button */}
      <div className="absolute z-20">
        <button
          onClick={handleAddSection}
          className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.5)]"
        >
          <Plus className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};
