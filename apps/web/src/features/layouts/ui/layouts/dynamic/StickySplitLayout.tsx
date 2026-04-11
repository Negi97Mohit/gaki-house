import React, { useState, useEffect, useRef } from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@caption-cam/core/types/caption";
import { cn } from "@caption-cam/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { Trash2 } from "lucide-react";

const StickySplitContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const textRefs = useRef<(HTMLDivElement | null)[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { colors, editor, controlsVisible } = useDynamicLayout();
  const prevSectionCount = useRef(sections.length);

  // Intersection Observer for Scroll Spy
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
        {
          root: scrollContainerRef.current,
          threshold: 0.5,
        }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [sections.length]);

  // Auto-scroll to new section when added
  useEffect(() => {
    if (sections.length > prevSectionCount.current) {
      const lastIndex = sections.length - 1;
      const el = textRefs.current[lastIndex];
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
    prevSectionCount.current = sections.length;
  }, [sections.length]);

  return (
    <div className="w-full h-full flex overflow-hidden">
      {/* Left Column: Scrollable Text */}
      <div ref={scrollContainerRef} className="w-1/2 h-full overflow-y-auto">
        <div className="p-20 flex flex-col gap-[80vh] min-h-screen pb-[50vh]">
          {sections.length === 0 && (
            <div className="h-screen flex items-center justify-center opacity-50">
              Add a section to begin...
            </div>
          )}

          {sections.map((section, index) => (
            <div
              key={section.id}
              ref={(el) => {
                textRefs.current[index] = el;
              }}
              className={cn(
                "transition-opacity duration-500",
                activeSectionIndex === index ? "opacity-100" : "opacity-30"
              )}
            >
              <EditableText
                sectionId={section.id}
                fieldId="title"
                defaultValue={`Chapter 0${index + 1}`}
                className="text-4xl md:text-6xl font-serif mb-8"
              />
              <EditableText
                sectionId={section.id}
                fieldId="desc"
                defaultValue="Minimalism redefined through texture and form."
                // Added max-h-[40vh] to trigger scrollbar when content exceeds this height
                className="text-xl leading-relaxed min-h-[100px] max-h-[40vh]"
                multiline
              />

              {/* Custom "Delete Chapter" text button */}
              <div
                className={cn(
                  "mt-4 transition-opacity duration-500",
                  controlsVisible
                    ? "opacity-100"
                    : "opacity-0 pointer-events-none"
                )}
              >
                <button
                  onClick={(e) => editor.handleDeleteSection(section.id, e)}
                  className="text-red-500 text-sm hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <div onClick={(e) => e.stopPropagation()}>
                    <EditableText
                      sectionId={section.id}
                      fieldId="remove_label"
                      defaultValue="Remove Chapter"
                      className="bg-transparent border-none text-red-500 focus:outline-none"
                    />
                  </div>
                </button>
              </div>
            </div>
          ))}

          <DynamicAddButton defaultValue="Add Chapter" className="h-[200px]" />
        </div>
      </div>

      {/* Right Column: Sticky Media */}
      <div
        className="w-1/2 h-full relative bg-gray-100/5"
        style={{ borderColor: colors.textColor, borderLeftWidth: 1 }}
      >
        <div className="relative w-full h-full">
          {sections.map((section, index) => (
            <div
              key={section.id}
              className={cn(
                "absolute inset-0 transition-opacity duration-700 ease-in-out group",
                activeSectionIndex === index
                  ? "opacity-100 z-10 pointer-events-auto"
                  : "opacity-0 z-0 pointer-events-none"
              )}
              onMouseEnter={() => editor.setHoveredSectionId(section.id)}
              onMouseLeave={() => editor.setHoveredSectionId(null)}
            >
              <GridSectionWrapper
                section={section}
                templateSection={{ id: section.id }}
                onSectionDelete={props.onSectionDelete}
                onSectionContentChange={props.onSectionContentChange}
                isHovered={editor.hoveredSectionId === section.id}
                isSplit={true}
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

export const StickySplitLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#ffffff"
      defaultTextColor="#000000"
      {...props}
    >
      <StickySplitContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
