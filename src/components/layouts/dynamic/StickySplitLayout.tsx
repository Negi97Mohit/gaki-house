import React, { useState, useEffect, useRef } from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../LayoutSettingsCtrl";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const StickySplitLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach((_, index) => {
      const el = textRefs.current[index];
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSectionIndex(index);
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach(o => o.disconnect());
  }, [sections.length]);

  return (
    <div
      className="w-full h-full flex overflow-y-auto relative"
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

      {/* Left Column: Scrollable Text */}
      <div className="w-1/2 min-h-full">
        <div className="p-20 flex flex-col gap-[80vh] min-h-screen pb-[50vh]">
          {sections.length === 0 && (
            <div className="h-screen flex items-center justify-center opacity-50">
              Add a section to begin...
            </div>
          )}

          {sections.map((section, index) => {
            const title = props.layout.customSectionData?.[section.id]?.title ?? `Chapter 0${index + 1}`;
            const desc = props.layout.customSectionData?.[section.id]?.desc ?? `Minimalism redefined through texture and form.`;

            return (
              <div
                key={section.id}
                ref={el => { textRefs.current[index] = el }}
                className={cn("transition-opacity duration-500", activeSectionIndex === index ? "opacity-100" : "opacity-30")}
              >
                <input
                  value={title}
                  onChange={(e) => handleUpdateText(section.id, "title", e.target.value)}
                  onFocus={(e) => handleFocus(`${section.id}_title`, e)}
                  style={getFieldStyle(`${section.id}_title`)}
                  className="bg-transparent border-none text-4xl md:text-6xl font-serif mb-8 w-full focus:outline-none"
                />
                <textarea
                  value={desc}
                  onChange={(e) => handleUpdateText(section.id, "desc", e.target.value)}
                  onFocus={(e) => handleFocus(`${section.id}_desc`, e)}
                  style={getFieldStyle(`${section.id}_desc`)}
                  className="bg-transparent border-none text-xl leading-relaxed w-full min-h-[100px] resize-none focus:outline-none"
                />

                {/* Delete Button for this Chapter */}
                <div className="mt-4">
                  <button
                    onClick={(e) => handleDeleteSection(section.id, e)}
                    className="text-red-500 text-sm hover:underline flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" /> Remove Chapter
                  </button>
                </div>
              </div>
            )
          })}

          {/* Add Button */}
          <div className="h-[200px] flex items-center justify-center border-2 border-dashed rounded-lg opacity-50 hover:opacity-100 cursor-pointer transition-opacity"
            onClick={handleAddSection}
            style={{ borderColor: textColor }}
          >
            <div className="flex flex-col items-center">
              <Plus className="w-8 h-8" />
              <span>Add Chapter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: Sticky Media */}
      <div className="w-1/2 h-full sticky top-0 overflow-hidden bg-gray-100/5" style={{ borderColor: textColor, borderLeftWidth: 1 }}>
        <div className="relative w-full h-full">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out",
                activeSectionIndex === index ? "opacity-100 z-10" : "opacity-0 z-0"
              )}
            >
              <GridSectionWrapper
                section={section}
                templateSection={{ id: section.id }}
                onSectionDelete={props.onSectionDelete}
                onSectionContentChange={props.onSectionContentChange}
                {...props}
              />
            </div>
          ))}

          {sections.length === 0 && (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              No Media
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
