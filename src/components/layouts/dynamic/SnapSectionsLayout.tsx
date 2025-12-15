import React, { useRef, useEffect, useState } from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../LayoutSettingsCtrl";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const SnapSectionsLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
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

  const { backgroundColor, textColor } = getGlobalSettings("#000000", "#ffffff");

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

  return (
    <div
      className="w-full h-full overflow-y-scroll snap-y snap-mandatory relative scroll-smooth"
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

      {sections.map((section, i) => (
        <div
          key={section.id}
          className="w-full h-full snap-start relative flex items-center justify-center group"
          onMouseEnter={() => setHoveredSectionId(section.id)}
          onMouseLeave={() => setHoveredSectionId(null)}
        >
          {/* Background Media - Higher Z-index if empty so we can click add buttons */}
          <div className={cn(
            "absolute inset-0 transition-all duration-300",
            section.content?.type === "empty" ? "z-20 opacity-100" : "z-0 opacity-60"
          )}>
            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id }}
              onSectionDelete={props.onSectionDelete}
              onSectionContentChange={props.onSectionContentChange}
              {...props}
            />
          </div>

          {/* Overlay Text - Added pointer-events-none to container so it doesn't block background clicks */}
          <div className="relative z-10 text-center mix-blend-difference w-full px-8 pointer-events-none">
            <input
              value={props.layout.customSectionData?.[section.id]?.seq ?? `Story 0${i + 1}`}
              onChange={(e) => handleUpdateText(section.id, "seq", e.target.value)}
              className="bg-transparent border-none text-2xl tracking-[0.5em] uppercase mb-4 text-center w-full focus:outline-none pointer-events-auto"
              style={{ color: textColor }}
            />
            <input
              value={props.layout.customSectionData?.[section.id]?.headline ?? "IMMERSE"}
              onChange={(e) => handleUpdateText(section.id, "headline", e.target.value)}
              className="bg-transparent border-none text-8xl font-black uppercase text-center w-full focus:outline-none pointer-events-auto"
              style={{ color: textColor }}
            />
          </div>

          {/* Delete Button - Auto Hide */}
          <div className={cn(
            "absolute top-8 right-8 z-50 transition-opacity duration-200",
            hoveredSectionId === section.id && controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}>
            <button
              onClick={(e) => handleDeleteSection(section.id, e)}
              className="bg-red-500 text-white p-3 rounded-full hover:scale-110 shadow-lg"
            >
              <Trash2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      ))}

      {/* Add New Story Slide */}
      <div className="w-full h-full snap-start flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        onClick={handleAddSection}
      >
        <div className={cn(
          "flex flex-col items-center gap-4 transition-opacity duration-500",
          controlsVisible ? "opacity-50" : "opacity-0"
        )}>
          <Plus className="w-20 h-20" style={{ color: textColor }} />
          <h2 className="text-2xl uppercase tracking-widest font-bold" style={{ color: textColor }}>Add Story</h2>
        </div>
      </div>

    </div>
  );
};
