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
    [key: string]: any;
}

export const PortfolioScrollLayout: React.FC<PortfolioScrollLayoutProps> = ({
  layout,
  template,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

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
        label: `0${sectionIds.length}`,
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

  const handleUpdateText = (id: string, field: string, value: string) => {
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

  const getEditableClass = (customClass = "") =>
    `bg-transparent border-none focus:outline-none focus:ring-0 placeholder-current/50 ${customClass}`;


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

        // Resolve style
        const style = layout.customSectionStyles?.[sectionId] ||
          templateSection?.style || {
          backgroundColor: "#f0f0f0",
          color: "#000",
        };

        // Resolve Text
        const customData = layout.customSectionData?.[sectionId] || {};

        const name = customData.name ?? templateSection?.name ?? "Untitled Project";
        const description = customData.description ?? templateSection?.description ?? "Description";

        const category = customData.category ?? "Project No.";
        const label = customData.label ?? `0${index}`; // Auto-index but editable if stored? If editable, it should persist. If not stored, derive from index.
        const date = customData.date ?? "2024 Design";
        const location = customData.location ?? "Paris, FR";

        // Logic: if it's in customData, use it. If not, use default.
        // For label (e.g. 00, 01), we can default to index if customData.label is undefined.
        // But if user edits it, customData.label will be set.

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
                    className={getEditableClass("w-full text-4xl md:text-6xl font-bold tracking-tighter leading-none")}
                    style={{ color: "currentColor" }}
                    value={name}
                    onChange={(e) => handleUpdateText(sectionId, "name", e.target.value)}
                    placeholder="Project Name"
                  />
                  {/* Editable Description */}
                  <input
                    className={getEditableClass("w-full opacity-60 text-lg mt-2 font-light")}
                    style={{ color: "currentColor" }}
                    value={description}
                    onChange={(e) => handleUpdateText(sectionId, "description", e.target.value)}
                    placeholder="Short description"
                  />
                </div>

                {!isIntro && (
                  <div className="text-right hidden md:block shrink-0 ml-4">
                    <input
                      className={getEditableClass("block text-xs font-bold uppercase tracking-widest opacity-50 text-right w-full")}
                      style={{ color: "currentColor" }}
                      value={category}
                      onChange={(e) => handleUpdateText(sectionId, "category", e.target.value)}
                    />
                    <input
                      className={getEditableClass("text-3xl font-mono text-right w-full bg-transparent")}
                      style={{ color: "currentColor" }}
                      value={label}
                      onChange={(e) => handleUpdateText(sectionId, "label", e.target.value)}
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
                <input
                  className={getEditableClass("text-left min-w-[100px]")}
                  style={{ color: "currentColor" }}
                  value={date}
                  onChange={(e) => handleUpdateText(sectionId, "date", e.target.value)}
                />

                {index < sectionIds.length - 1 && (
                  <div className="animate-bounce">
                    <ArrowDown className="w-5 h-5" />
                  </div>
                )}

                <input
                  className={getEditableClass("text-right min-w-[100px]")}
                  style={{ color: "currentColor" }}
                  value={location}
                  onChange={(e) => handleUpdateText(sectionId, "location", e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      })}

      {/* FAB */}
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
