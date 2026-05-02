import React, { useState } from "react";
import { cn } from "@gaki/core/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@gaki/core/types/caption";
import { CanvasLayoutTemplate } from "@gaki/core/types/layout";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { ChevronRight } from "lucide-react";
import { DynamicLayoutWrapper } from "./dynamic/core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./dynamic/core/DynamicLayoutContext";
import { EditableText } from "./dynamic/core/EditableText";
import {
  DynamicAddButton,
  DynamicDeleteButton,
} from "./dynamic/core/LayoutButtons";

interface CaseStudyLayoutProps {
  layout: CanvasLayoutState;
  template: CanvasLayoutTemplate;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

const CaseStudyContent: React.FC<any> = ({ template, ...wrapperProps }) => {
  const { layout, onLayoutUpdate, editor, controlsVisible } =
    useDynamicLayout();
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    null
  );

  // Use order from layout if available, otherwise default to template order
  const sectionIds =
    layout.sectionOrder && layout.sectionOrder.length > 0
      ? layout.sectionOrder
      : template.sections.map((s: any) => s.id);

  const toggleAccordion = (id: string) => {
    setExpandedSectionId(expandedSectionId === id ? null : id);
  };

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;

    const newId = `custom-case-${Date.now()}`;
    const newSection: CanvasSectionState = {
      id: newId,
      content: { type: "empty" },
    };

    const newSections = [...layout.sections, newSection];
    const newOrder = [...sectionIds, newId];

    const newCustomData = {
      ...layout.customSectionData,
      [newId]: {
        name: "New Case Study",
        description: "Add a description for this project...",
        category: "Brand Identity",
        date: "2024",
        label: `01.${12 + sectionIds.length}`,
        creditsLabel: "Credits",
        creditsValue: "Designed by Users",
      },
    };

    onLayoutUpdate({
      ...layout,
      sections: newSections,
      sectionOrder: newOrder,
      customSectionData: newCustomData,
    });
  };

  const handleDeleteSection = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onLayoutUpdate) return;
    if (!confirm("Delete this section?")) return;

    const newSections = layout.sections.filter((s) => s.id !== idToDelete);
    const newOrder = sectionIds.filter((id: string) => id !== idToDelete);

    const newCustomData = { ...layout.customSectionData };
    if (newCustomData && newCustomData[idToDelete]) {
      delete newCustomData[idToDelete];
    }

    onLayoutUpdate({
      ...layout,
      sections: newSections,
      sectionOrder: newOrder,
      customSectionData: newCustomData,
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-white font-sans text-black">
      <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-24">
        {sectionIds.map((sectionId: string, index: number) => {
          const section =
            layout.sections.find((s) => s.id === sectionId) ||
            ({
              id: sectionId,
              content: { type: "empty" },
            } as CanvasSectionState);

          const templateSection = template.sections.find(
            (s: any) => s.id === sectionId
          );

          // Defaults for EditableText
          const defaultName = templateSection?.name ?? "Untitled Project";
          const defaultDesc =
            templateSection?.description ?? "No description provided.";
          const defaultCategory = "Brand Identity";
          const defaultLabel = `01.${12 + index}`;
          const defaultDate = "2024";
          const defaultLocation = `Case Study ${index + 1}`;

          const isExpanded = expandedSectionId === sectionId;
          const isHovered = editor.hoveredSectionId === sectionId;

          return (
            <div
              key={sectionId}
              className="relative group"
              onMouseEnter={() => editor.setHoveredSectionId(sectionId)}
              onMouseLeave={() => editor.setHoveredSectionId(null)}
            >
              {/* Gallery Section */}
              <div className="w-full aspect-[16/10] bg-gray-100 rounded-[4px] overflow-hidden mb-4 relative shadow-sm hover:shadow-md transition-shadow">
                <GridSectionWrapper
                  {...wrapperProps}
                  section={section}
                  templateSection={templateSection || { id: sectionId }}
                  isHovered={isHovered}
                />

                {/* Standard Delete Button */}
                <DynamicDeleteButton
                  sectionId={sectionId}
                  onDelete={handleDeleteSection}
                  className={cn(
                    "absolute top-4 right-4",
                    isHovered || controlsVisible ? "opacity-100" : "opacity-0"
                  )}
                />
              </div>

              {/* Top Bar Info */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-black/10 gap-4">
                <div className="flex items-center gap-4 w-full md:w-auto flex-1">
                  <div className="flex gap-1 shrink-0">
                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300">
                      <ChevronRight className="w-3 h-3 rotate-180 opacity-50" />
                    </div>
                    <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300">
                      <ChevronRight className="w-3 h-3 opacity-50" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <EditableText
                      sectionId={sectionId}
                      fieldId="name"
                      defaultValue={defaultName}
                      className="text-xl font-medium leading-tight w-full min-w-[200px]"
                    />
                    <EditableText
                      sectionId={sectionId}
                      fieldId="location"
                      defaultValue={defaultLocation}
                      className="text-sm text-gray-500 font-light w-full mt-1"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-4 md:gap-8 text-sm font-medium shrink-0 flex-wrap md:flex-nowrap">
                  <EditableText
                    sectionId={sectionId}
                    fieldId="category"
                    defaultValue={defaultCategory}
                    className="uppercase tracking-wide w-[120px] text-right"
                  />
                  <EditableText
                    sectionId={sectionId}
                    fieldId="label"
                    defaultValue={defaultLabel}
                    className="text-gray-400 font-mono w-[60px] text-right"
                  />
                  <EditableText
                    sectionId={sectionId}
                    fieldId="date"
                    defaultValue={defaultDate}
                    className="text-gray-400 w-[50px] text-right"
                  />
                </div>
              </div>

              {/* Accordion / Description */}
              <div className="border-b border-black/10">
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-500 ease-in-out",
                    isExpanded
                      ? "max-h-[500px] opacity-100 py-6"
                      : "max-h-0 opacity-0 py-0"
                  )}
                >
                  <EditableText
                    sectionId={sectionId}
                    fieldId="description"
                    defaultValue={defaultDesc}
                    multiline
                    className="text-gray-700 max-w-2xl leading-relaxed w-full"
                  />
                  <div className="mt-6 flex flex-col gap-1">
                    <EditableText
                      sectionId={sectionId}
                      fieldId="creditsLabel"
                      defaultValue="Credits"
                      className="text-xs uppercase font-bold tracking-wider w-full"
                    />
                    <EditableText
                      sectionId={sectionId}
                      fieldId="creditsValue"
                      defaultValue="Designed by Users"
                      className="text-sm text-gray-500 w-full"
                    />
                  </div>
                </div>

                <button
                  onClick={() => toggleAccordion(sectionId)}
                  className="w-full py-2 flex justify-center items-center hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={cn(
                      "relative w-4 h-4 transition-transform duration-300",
                      isExpanded ? "rotate-45" : "rotate-0"
                    )}
                  >
                    <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-black -translate-y-1/2" />
                    <div className="absolute top-0 left-1/2 h-full w-[1.5px] bg-black -translate-x-1/2" />
                  </div>
                </button>
              </div>
            </div>
          );
        })}

        {/* Standard Add Section Button */}
        <DynamicAddButton
          onAdd={handleAddSection}
          defaultValue="Add Case Study"
          className="w-full h-32 border-black/20 hover:border-black/40 text-black/50 hover:text-black/80"
          style={{ borderColor: "rgba(0,0,0,0.2)" }}
        />
      </div>
    </div>
  );
};

export const CaseStudyLayout: React.FC<CaseStudyLayoutProps> = ({
  layout,
  template,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  return (
    <DynamicLayoutWrapper
      layout={layout}
      onLayoutUpdate={onLayoutUpdate!}
      sections={layout.sections}
      defaultBackgroundColor="#ffffff"
      defaultTextColor="#000000"
    >
      <CaseStudyContent template={template} {...wrapperProps} />
    </DynamicLayoutWrapper>
  );
};
