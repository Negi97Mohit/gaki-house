import React, { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { EditableText } from "@/features/layouts/ui/layouts/dynamic/core/EditableText";
import { DynamicLayoutWrapper } from "./dynamic/core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./dynamic/core/DynamicLayoutContext";

const ExpandingCardsContent: React.FC<any> = ({
  template,
  ...wrapperProps
}) => {
  const { layout } = useDynamicLayout();
  const [activeCardId, setActiveCardId] = useState<string>("card-1");
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  return (
    <div className="relative w-full h-full flex items-center justify-center px-4 gap-4 bg-white">
      {template.sections.map((templateSection: any) => {
        const section =
          layout.sections.find((s) => s.id === templateSection.id) ||
          ({
            id: templateSection.id,
            content: { type: "empty" },
          } as CanvasSectionState);

        const isActiveCard = activeCardId === section.id;

        return (
          <div
            key={templateSection.id}
            className={cn(
              "overflow-hidden border border-border/20 group transition-all duration-500 ease-in-out",
              "relative rounded-[24px] cursor-pointer shadow-md h-[90%]",
              isActiveCard ? "flex-[5]" : "flex-[0.5]",
              !isActiveCard && "opacity-90 hover:opacity-100"
            )}
            style={{
              background: templateSection.style.background,
              overflow: "hidden",
              position: "relative",
            }}
            onClick={() => setActiveCardId(section.id)}
            onMouseEnter={() => setHoveredSectionId(templateSection.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            <div className="relative w-full h-full">
              <div
                className={cn(
                  "absolute bottom-6 left-6 z-20 transition-opacity duration-300 delay-200 pointer-events-none",
                  isActiveCard ? "opacity-100" : "opacity-0"
                )}
              >
                <EditableText
                  sectionId={section.id}
                  fieldId="cardTitle"
                  defaultValue={templateSection.name}
                  // Removed bg-black/10, backdrop-blur-sm, px-3, py-1, rounded
                  className="text-xl font-bold text-white drop-shadow-md pointer-events-auto min-w-[120px]"
                />
              </div>

              <GridSectionWrapper
                {...wrapperProps}
                section={section}
                templateSection={templateSection}
                isHovered={hoveredSectionId === templateSection.id}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const ExpandingCardsLayout: React.FC<any> = ({
  layout,
  template,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  return (
    <DynamicLayoutWrapper
      layout={layout}
      onLayoutUpdate={onLayoutUpdate}
      sections={layout.sections}
    >
      <ExpandingCardsContent template={template} {...wrapperProps} />
    </DynamicLayoutWrapper>
  );
};
