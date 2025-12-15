import React from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { Plus } from "lucide-react"; // Custom icon for the add slide

const SnapStoriesContent: React.FC<{ sections: CanvasSectionState[], [key: string]: any }> = ({ sections, ...props }) => {
  const { colors, editor, controlsVisible } = useDynamicLayout();

  return (
    <div className="w-full h-full overflow-y-scroll snap-y snap-mandatory relative scroll-smooth">
      {sections.map((section, i) => (
        <div
          key={section.id}
          className="w-full h-full snap-start relative flex items-center justify-center group"
          onMouseEnter={() => editor.setHoveredSectionId(section.id)}
          onMouseLeave={() => editor.setHoveredSectionId(null)}
        >
          {/* Background Media */}
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

          {/* Overlay Text */}
          <div className="relative z-30 text-center mix-blend-difference w-full px-8 pointer-events-none">
            <EditableText
              sectionId={section.id}
              fieldId="seq"
              defaultValue={`Story 0${i + 1}`}
              className="text-2xl tracking-[0.5em] uppercase mb-4 text-center"
            />
            <EditableText
              sectionId={section.id}
              fieldId="headline"
              defaultValue="IMMERSE"
              className="text-8xl font-black uppercase text-center"
            />
          </div>

          <DynamicDeleteButton sectionId={section.id} className={cn("absolute top-8 right-8", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />
        </div>
      ))}

      {/* Add New Story Slide - Custom Look but uses editor.handleAddSection */}
      <div className="w-full h-full snap-start flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
        onClick={editor.handleAddSection}
      >
        <div className={cn(
          "flex flex-col items-center gap-4 transition-opacity duration-500",
          controlsVisible ? "opacity-50" : "opacity-0"
        )}>
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
  )
}

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
