import React, { useRef, useEffect } from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@caption-cam/core/types/caption";
import { cn } from "@caption-cam/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { Plus } from "lucide-react";

const SnapStoriesContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { colors, editor, controlsVisible } = useDynamicLayout();

  // Refs for auto-scrolling behavior
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevSectionCount = useRef(sections.length);

  // Auto-scroll to the new section when one is added
  useEffect(() => {
    if (sections.length > prevSectionCount.current) {
      // The new section is at the end of the sections array (before the Add button)
      const newSectionIndex = sections.length - 1;
      const el = sectionRefs.current[newSectionIndex];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    prevSectionCount.current = sections.length;
  }, [sections.length]);

  return (
    <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory relative scroll-smooth">
      {sections.map((section, i) => (
        <div
          key={section.id}
          ref={(el) => {
            sectionRefs.current[i] = el;
          }}
          className="w-full h-full snap-start relative flex items-center justify-center group"
          onMouseEnter={() => editor.setHoveredSectionId(section.id)}
          onMouseLeave={() => editor.setHoveredSectionId(null)}
        >
          {/* Background Media 
              - Empty state: z-40 (high opacity)
              - Content state: z-0 (lower opacity for overlay effect)
          */}
          <div
            className={cn(
              "absolute inset-0 transition-all duration-300",
              section.content?.type === "empty"
                ? "z-40 opacity-100"
                : "z-0 opacity-60",
              "bg-gradient-to-b from-indigo-900 to-purple-900"
            )}
          >
            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id }}
              onSectionDelete={props.onSectionDelete}
              onSectionContentChange={props.onSectionContentChange}
              isHovered={editor.hoveredSectionId === section.id}
              {...props}
            />
          </div>

          {/* Overlay Text 
              CHANGED: Increased z-index from z-30 to z-50 to ensure visibility 
              over the empty state background (z-40).
              pointer-events-none allows clicks to pass through to the background,
              while EditableText re-enables pointer-events-auto for editing.
          */}
          <div className="relative z-50 text-center mix-blend-difference w-full px-8 pointer-events-none">
            <EditableText
              sectionId={section.id}
              fieldId="seq"
              defaultValue={`Story 0${i + 1}`}
              className="text-2xl tracking-[0.5em] uppercase mb-4 text-center pointer-events-auto"
            />
            <EditableText
              sectionId={section.id}
              fieldId="headline"
              defaultValue="IMMERSE"
              className="text-8xl font-black uppercase text-center pointer-events-auto"
            />
          </div>

          <DynamicDeleteButton
            sectionId={section.id}
            className={cn(
              "absolute top-8 right-8 z-[60]",
              editor.hoveredSectionId === section.id
                ? "opacity-100"
                : "opacity-0"
            )}
          />
        </div>
      ))}

      {/* Add New Story Slide */}
      <div
        className="w-full h-full snap-start flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer relative z-50"
        onClick={editor.handleAddSection}
      >
        <div
          className={cn(
            "flex flex-col items-center gap-4 transition-opacity duration-500",
            controlsVisible ? "opacity-50" : "opacity-0"
          )}
        >
          <Plus className="w-20 h-20" style={{ color: colors.textColor }} />
          <div onClick={(e) => e.stopPropagation()}>
            <EditableText
              sectionId="header"
              fieldId="addText"
              defaultValue="Add Story"
              className="text-2xl uppercase tracking-widest font-bold text-center bg-transparent border-none focus:outline-none w-full"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const SnapSectionsLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#000000"
      defaultTextColor="#ffffff"
      {...props}
    >
      <SnapStoriesContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
