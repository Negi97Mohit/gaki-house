import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { ChevronRight, Plus, Trash2 } from "lucide-react";

interface CaseStudyLayoutProps {
    layout: CanvasLayoutState;
    template: CanvasLayoutTemplate;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
    [key: string]: any;
}

export const CaseStudyLayout: React.FC<CaseStudyLayoutProps> = ({
    layout,
    template,
    onLayoutUpdate,
    ...wrapperProps
}) => {
    const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
        null
    );

    const sectionIds =
        layout.sectionOrder && layout.sectionOrder.length > 0
            ? layout.sectionOrder
            : template.sections.map((s) => s.id);

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

    const handleDeleteSection = (idToDelete: string) => {
        if (!onLayoutUpdate) return;

        const newSections = layout.sections.filter(s => s.id !== idToDelete);
        const newOrder = sectionIds.filter(id => id !== idToDelete);

        const newCustomData = { ...layout.customSectionData };
        if (newCustomData && newCustomData[idToDelete]) {
            delete newCustomData[idToDelete];
        }

        onLayoutUpdate({
            ...layout,
            sections: newSections,
            sectionOrder: newOrder,
            customSectionData: newCustomData
        })
    }

    const handleUpdateText = (id: string, field: string, value: string) => {
        if (!onLayoutUpdate) return;

        const currentData = layout.customSectionData?.[id] || {};

        const newCustomData = {
            ...layout.customSectionData,
            [id]: {
                ...currentData,
                [field]: value
            }
        };
        onLayoutUpdate({
            ...layout,
            customSectionData: newCustomData,
        });
    }

    // Helper to make input fields look clean
    const getEditableClass = (customClass = "") =>
        `bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-gray-300 rounded ${customClass}`;

    return (
        <div className="w-full h-full overflow-y-auto bg-white font-sans text-black">
            <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-24">
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

                    // Data Resolution
                    const customData = layout.customSectionData?.[sectionId] || {};

                    const name = customData.name ?? templateSection?.name ?? "Untitled Project";
                    const description = customData.description ?? templateSection?.description ?? "No description provided.";

                    // Additional editable fields
                    const category = customData.category ?? "Brand Identity";
                    const label = customData.label ?? `01.${12 + index}`;
                    const date = customData.date ?? "2024";

                    const creditsLabel = customData.creditsLabel ?? "Credits";
                    const creditsValue = customData.creditsValue ?? "Designed by Users";
                    const subLabel = `Case Study ${index + 1}`; // Keeping this one dynamic based on index is usually better than free text, but let's leave it dynamic-only for now unless user asked? User said "every text".
                    // The "Case Study X" is derived from index, so it changes if we reorder. 
                    // If we make it editable, it becomes static content. 
                    // Let's keep it derived but maybe allow override? nah, index-based is usually expected for "Case Study 1, 2, 3".
                    // Wait, user said "every text". I'll make the "Case Study" prefix editable if I can, but preserving the number auto-increment is nicer.
                    // Let's actually stick to the visual ones being editable. "Case Study X" is a secondary meta-label.
                    // Actually, let's make the "Case Study X" label fully editable but default to that string.
                    const caseStudyLabel = customData.location ?? `Case Study ${index + 1}`; // Using 'location' field as keyspace for this generic label just to save adding a new field or use a generic one? 
                    // Actually I added 'location', let's use it for the "Case Study X" slot or add 'subtitle'?
                    // Let's use 'location' field for "Case Study N" slot just to map it for now since I didn't add 'subtitle'.

                    const isExpanded = expandedSectionId === sectionId;

                    return (
                        <div key={sectionId} className="relative group">
                            {/* Gallery Section */}
                            <div className="w-full aspect-[16/10] bg-gray-100 rounded-[4px] overflow-hidden mb-4 relative shadow-sm hover:shadow-md transition-shadow">
                                <GridSectionWrapper
                                    {...wrapperProps}
                                    section={section}
                                    templateSection={templateSection || { id: sectionId }}
                                    isHovered={false}
                                />

                                {/* Delete Button */}
                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity z-50">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (confirm("Delete this section?")) handleDeleteSection(sectionId);
                                        }}
                                        className="p-2 bg-white/90 text-red-500 rounded-full hover:bg-red-50 shadow-sm"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
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
                                        <input
                                            className={getEditableClass("text-xl font-medium leading-tight w-full")}
                                            value={name}
                                            onChange={(e) => handleUpdateText(sectionId, "name", e.target.value)}
                                            placeholder="Project Name"
                                        />
                                        {/* Using 'location' prop for the secondary subtitle to allow editing "Case Study X" */}
                                        <input
                                            className={getEditableClass("text-sm text-gray-500 font-light w-full")}
                                            value={caseStudyLabel}
                                            onChange={(e) => handleUpdateText(sectionId, "location", e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 md:gap-8 text-sm font-medium shrink-0 flex-wrap md:flex-nowrap">
                                    <input
                                        className={getEditableClass("uppercase tracking-wide w-[120px] text-right")}
                                        value={category}
                                        onChange={(e) => handleUpdateText(sectionId, "category", e.target.value)}
                                    />
                                    <input
                                        className={getEditableClass("text-gray-400 font-mono w-[60px] text-right")}
                                        value={label}
                                        onChange={(e) => handleUpdateText(sectionId, "label", e.target.value)}
                                    />
                                    <input
                                        className={getEditableClass("text-gray-400 w-[50px] text-right")}
                                        value={date}
                                        onChange={(e) => handleUpdateText(sectionId, "date", e.target.value)}
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
                                    <textarea
                                        className={getEditableClass("text-gray-700 max-w-2xl leading-relaxed w-full resize-none")}
                                        value={description}
                                        onChange={(e) => handleUpdateText(sectionId, "description", e.target.value)}
                                        rows={3}
                                        placeholder="Enter description..."
                                    />
                                    <div className="mt-6 flex flex-col gap-1">
                                        <input
                                            className={getEditableClass("text-xs uppercase font-bold tracking-wider w-full")}
                                            value={creditsLabel}
                                            onChange={(e) => handleUpdateText(sectionId, "creditsLabel", e.target.value)}
                                        />
                                        <input
                                            className={getEditableClass("text-sm text-gray-500 w-full")}
                                            value={creditsValue}
                                            onChange={(e) => handleUpdateText(sectionId, "creditsValue", e.target.value)}
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

                {/* Add Section Button */}
                <div className="flex justify-center pb-12">
                    <button
                        onClick={handleAddSection}
                        className="flex items-center gap-2 px-6 py-3 bg-black text-white rounded-full hover:bg-black/80 transition-all transform hover:scale-105 shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Add Case Study</span>
                    </button>
                </div>
            </div>
        </div>
    );
};
