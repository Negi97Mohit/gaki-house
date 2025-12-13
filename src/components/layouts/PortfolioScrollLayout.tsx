import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { ArrowDown, Plus, Trash2 } from "lucide-react";

interface PortfolioScrollLayoutProps {
  layout: CanvasLayoutState;
  template: CanvasLayoutTemplate;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any; // Allow passing through GridSectionWrapper props
}

export const PortfolioScrollLayout: React.FC<PortfolioScrollLayoutProps> = ({
  layout,
  template,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  // Use sectionOrder if available, otherwise default to template sections
  const sectionIds =
    layout.sectionOrder && layout.sectionOrder.length > 0
      ? layout.sectionOrder
      : template.sections.map((s) => s.id);

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;

    const newId = `custom-project-${Date.now()}`;
    const newSection: CanvasSectionState = {
      id: newId,
      content: { type: "empty" },
    };

    // Cycle through some background colors for variety
    const bgColors = ["#B21C1B", "#003F66", "#CFCC93", "#333333", "#E6E6E6"];
    const randomColor = bgColors[Math.floor(Math.random() * bgColors.length)];
    const textColor =
      randomColor === "#E6E6E6" || randomColor === "#CFCC93"
        ? "#000000"
        : "#ffffff";

    const newSections = [...layout.sections, newSection];
    const newOrder = [...sectionIds, newId];

    // Note: We need to store the style for custom sections somewhere.
    // The current implementation of StandardGridLayout uses `layout.customSectionStyles`.
    // We can reuse that or store it in `customSectionData`.
    // Let's use `customSectionStyles` for the visual style (background) if possible,
    // but the template logic usually reads from `templateSection.style`.
    // For now, let's assume we can map custom IDs to a style object we construct on the fly,
    // OR we update `customSectionStyles`.
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

  const handleDeleteSection = (idToDelete: string) => {
    if (!onLayoutUpdate) return;

    const newSections = layout.sections.filter((s) => s.id !== idToDelete);
    const newOrder = sectionIds.filter((id) => id !== idToDelete);
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

  const handleUpdateText = (
    id: string,
    field: "name" | "description",
    value: string
  ) => {
    if (!onLayoutUpdate) return;
    const currentData = layout.customSectionData?.[id] || {};
    const newCustomData = {
      ...layout.customSectionData,
      [id]: {
        ...currentData,
        [field]: value,
      },
    };
    onLayoutUpdate({
      ...layout,
      customSectionData: newCustomData,
    });
  };

  return (
    <div className="w-full h-full overflow-y-auto bg-white font-sans scroll-smooth snap-y snap-mandatory relative">
      {/* Loop through sections */}
      {sectionIds.map((sectionId, index) => {
        const section =
          layout.sections.find((s) => s.id === sectionId) ||
          ({
            id: sectionId,
            content: { type: "empty" },
          } as CanvasSectionState);

        const templateSection = template.sections.find(
          (s) => s.id === sectionId
        );

        // Resolve style: Custom Styles > Template Style > Default
        const style = layout.customSectionStyles?.[sectionId] ||
          templateSection?.style || {
          backgroundColor: "#f0f0f0",
          color: "#000",
        };

        // Resolve Text
        const customData = layout.customSectionData?.[sectionId];
        const displayName =
          customData?.name ?? templateSection?.name ?? "Untitled Project";
        const displayDescription =
          customData?.description ??
          templateSection?.description ??
          "Description";

        const isHovered = hoveredSectionId === sectionId;
        const isIntro = index === 0;

        return (
          <div
            key={sectionId}
            className="w-full min-h-full snap-start relative flex items-center justify-center p-8 md:p-16 transition-colors duration-500 group"
            style={style}
            onMouseEnter={() => setHoveredSectionId(sectionId)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            <div className="w-full max-w-6xl h-[80vh] flex flex-col relative z-10">
              {/* Delete Button */}
              {/* Show for all sections or just custom? Let's show for all to allow full editability */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Delete this section?"))
                    handleDeleteSection(sectionId);
                }}
                className="absolute top-0 right-0 p-3 text-current opacity-0 group-hover:opacity-50 hover:opacity-100 transition-opacity z-50 rounded-full hover:bg-black/10"
                title="Delete Section"
              >
                <Trash2 className="w-5 h-5" />
              </button>

              {/* Header / Top Bar */}
              <div className="flex justify-between items-end border-b border-current/20 pb-6 mb-8">
                <div className="w-full max-w-3xl">
                  {/* Editable Title */}
                  <input
                    className="w-full text-4xl md:text-6xl font-bold tracking-tighter leading-none bg-transparent border-none focus:outline-none focus:ring-0 placeholder-current/50"
                    style={{ color: "currentColor" }}
                    value={displayName}
                    onChange={(e) =>
                      handleUpdateText(sectionId, "name", e.target.value)
                    }
                    placeholder="Project Name"
                  />
                  {/* Editable Description */}
                  <input
                    className="w-full opacity-60 text-lg mt-2 font-light bg-transparent border-none focus:outline-none focus:ring-0"
                    style={{ color: "currentColor" }}
                    value={displayDescription}
                    onChange={(e) =>
                      handleUpdateText(
                        sectionId,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Short description"
                  />
                </div>

                {!isIntro && (
                  <div className="text-right hidden md:block shrink-0 ml-4">
                    <span className="block text-xs font-bold uppercase tracking-widest opacity-50">
                      Project No.
                    </span>
                    <span className="text-3xl font-mono">0{index}</span>
                  </div>
                )}
              </div>

              {/* Main Content Area (The "Card") */}
              {/* This is where the user's video/image content will live */}
              <div className="flex-1 relative bg-black/5 rounded-lg overflow-hidden shadow-2xl transition-transform duration-700 hover:scale-[1.02]">
                <GridSectionWrapper
                  {...wrapperProps}
                  section={section}
                  templateSection={templateSection || { id: sectionId }} // Fallback
                  isHovered={isHovered}
                />
              </div>

              {/* Footer / Navigation Hint */}
              <div className="mt-8 flex justify-between items-center opacity-50 text-sm font-medium uppercase tracking-widest">
                <span>2024 Design</span>
                {index < sectionIds.length - 1 && (
                  <div className="animate-bounce">
                    <ArrowDown className="w-5 h-5" />
                  </div>
                )}
                <span>Paris, FR</span>
              </div>
            </div>
          </div>
        );
      })}

      {/* Add Section Button (Fixed at bottom right or part of the flow?) 
           Since it is a scroll layout, maybe a fixed FAB is better? 
           Or a final section "Add New"? 
           Let's go with a fixed FAB (Floating Action Button) for easy access.
      */}
      <button
        onClick={handleAddSection}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
        title="Add New Project"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
