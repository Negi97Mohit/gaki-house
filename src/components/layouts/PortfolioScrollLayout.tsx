import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { ArrowDown, Plus } from "lucide-react";
import { DynamicLayoutWrapper } from "./dynamic/core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./dynamic/core/DynamicLayoutContext";
import { EditableText } from "./dynamic/core/EditableText";
import { DynamicDeleteButton } from "./dynamic/core/LayoutButtons";

interface PortfolioScrollLayoutProps {
  layout: CanvasLayoutState;
  template: CanvasLayoutTemplate;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

const PortfolioScrollContent: React.FC<any> = ({
  template,
  ...wrapperProps
}) => {
  const { layout, onLayoutUpdate, editor, controlsVisible } =
    useDynamicLayout();

  // Use layout order if available, else template default
  const sectionIds =
    layout.sectionOrder && layout.sectionOrder.length > 0
      ? layout.sectionOrder
      : template.sections.map((s: any) => s.id);

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;

    const newId = `custom-project-${Date.now()}`;
    const newSection: CanvasSectionState = {
      id: newId,
      content: { type: "empty" },
    };

    const bgColors = ["#B21C1B", "#003F66", "#CFCC93", "#333333", "#E6E6E6"];
    const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
    const textColor =
      randomColor === "#E6E6E6" || randomColor === "#CFCC93"
        ? "#000000"
        : "#ffffff";

    const newSections = [...layout.sections, newSection];
    const newOrder = [...sectionIds, newId];

    const newCustomStyles = {
      ...layout.customSectionStyles,
      [newId]: {
        backgroundColor: randomColor,
        color: textColor,
      },
    };

    const newCustomData = {
      ...layout.customSectionData,
      [newId]: {
        name: "New Project",
        description: "Portfolio Item",
        category: "Project No.",
        label: `0${newOrder.length}`,
        date: "2024 Design",
        location: "Paris, FR",
      },
    };

    onLayoutUpdate({
      ...layout,
      sections: newSections,
      sectionOrder: newOrder,
      customSectionData: newCustomData,
      customSectionStyles: newCustomStyles,
    });
  };

  const handleDeleteSection = (idToDelete: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onLayoutUpdate) return;
    if (!confirm("Delete this section?")) return;

    const newSections = layout.sections.filter((s) => s.id !== idToDelete);
    const newOrder = sectionIds.filter((id: string) => id !== idToDelete);

    const newCustomData = { ...layout.customSectionData };
    if (newCustomData[idToDelete]) delete newCustomData[idToDelete];

    const newCustomStyles = { ...layout.customSectionStyles };
    if (newCustomStyles[idToDelete]) delete newCustomStyles[idToDelete];

    onLayoutUpdate({
      ...layout,
      sections: newSections,
      sectionOrder: newOrder,
      customSectionData: newCustomData,
      customSectionStyles: newCustomStyles,
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-white font-sans scroll-smooth snap-y snap-mandatory relative">
      {/* Loop through sections */}
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

        // Resolve style
        const style = layout.customSectionStyles?.[sectionId] ||
          templateSection?.style || {
            backgroundColor: "#f0f0f0",
            color: "#000",
          };

        const textColor = style.color || "#000000";

        // Resolve Default Data
        const defaultName = templateSection?.name ?? "Untitled Project";
        const defaultDescription =
          templateSection?.description ?? "Description";
        const defaultCategory = "Project No.";
        const defaultLabel = `0${index}`;
        const defaultDate = "2024 Design";
        const defaultLocation = "Paris, FR";

        const isHovered = editor.hoveredSectionId === sectionId;
        const isIntro = index === 0;

        return (
          <div
            key={sectionId}
            className="w-full min-h-full snap-start relative flex items-center justify-center p-8 md:p-16 transition-colors duration-500 group"
            style={style}
            onMouseEnter={() => editor.setHoveredSectionId(sectionId)}
            onMouseLeave={() => editor.setHoveredSectionId(null)}
          >
            <div className="w-full max-w-6xl h-[80vh] flex flex-col relative z-10">
              {/* Delete Button */}
              <DynamicDeleteButton
                sectionId={sectionId}
                onDelete={handleDeleteSection}
                className={cn(
                  "absolute top-0 right-0",
                  isHovered || controlsVisible ? "opacity-100" : "opacity-0"
                )}
              />

              {/* Header / Top Bar */}
              <div className="flex justify-between items-end border-b border-current/20 pb-6 mb-8">
                <div className="w-full max-w-3xl">
                  <EditableText
                    sectionId={sectionId}
                    fieldId="name"
                    defaultValue={defaultName}
                    className="w-full text-4xl md:text-6xl font-bold tracking-tighter leading-none placeholder-current/50"
                    style={{ color: textColor }}
                  />
                  <EditableText
                    sectionId={sectionId}
                    fieldId="description"
                    defaultValue={defaultDescription}
                    className="w-full opacity-60 text-lg mt-2 font-light placeholder-current/50"
                    style={{ color: textColor }}
                  />
                </div>

                {!isIntro && (
                  <div className="text-right hidden md:block shrink-0 ml-4">
                    <EditableText
                      sectionId={sectionId}
                      fieldId="category"
                      defaultValue={defaultCategory}
                      className="block text-xs font-bold uppercase tracking-widest opacity-50 text-right w-full"
                      style={{ color: textColor }}
                    />
                    <EditableText
                      sectionId={sectionId}
                      fieldId="label"
                      defaultValue={defaultLabel}
                      className="text-3xl font-mono text-right w-full bg-transparent"
                      style={{ color: textColor }}
                    />
                  </div>
                )}
              </div>

              {/* Main Content Area */}
              <div className="flex-1 relative bg-black/5 rounded-lg overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02]">
                <GridSectionWrapper
                  {...wrapperProps}
                  section={section}
                  templateSection={templateSection || { id: sectionId }}
                  isHovered={isHovered}
                />
              </div>

              {/* Footer */}
              <div className="mt-8 flex justify-between items-center opacity-50 text-sm font-medium uppercase tracking-widest">
                <EditableText
                  sectionId={sectionId}
                  fieldId="date"
                  defaultValue={defaultDate}
                  className="text-left min-w-[100px]"
                  style={{ color: textColor }}
                />

                {index < sectionIds.length - 1 && (
                  <div className="animate-bounce" style={{ color: textColor }}>
                    <ArrowDown className="w-5 h-5" />
                  </div>
                )}

                <EditableText
                  sectionId={sectionId}
                  fieldId="location"
                  defaultValue={defaultLocation}
                  className="text-right min-w-[100px]"
                  style={{ color: textColor }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* FAB */}
      <button
        onClick={handleAddSection}
        className={cn(
          "fixed bottom-8 right-8 z-50 w-14 h-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300",
          !controlsVisible && "opacity-0 pointer-events-none"
        )}
        title="Add New Project"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};

export const PortfolioScrollLayout: React.FC<PortfolioScrollLayoutProps> = ({
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
      <PortfolioScrollContent template={template} {...wrapperProps} />
    </DynamicLayoutWrapper>
  );
};
