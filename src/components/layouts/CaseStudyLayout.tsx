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

    // Determine the order of sections to render
    // If we have a stored sectionOrder, use that. Otherwise, use the template's default order.
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
        // Initialize custom data for the new section
        const newCustomData = {
            ...layout.customSectionData,
            [newId]: {
                name: "New Case Study",
                description: "Add a description for this project...",
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

    const handleUpdateText = (id: string, field: "name" | "description", value: string) => {
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

    return (
        <div className="w-full h-full overflow-y-auto bg-white font-sans text-black">
            <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-24">
                {sectionIds.map((sectionId, index) => {
                    // 1. Find the section state (content, camera, etc.)
                    const section =
                        layout.sections.find((s) => s.id === sectionId) ||
                        ({
                            id: sectionId,
                            content: { type: "empty" },
                        } as CanvasSectionState);

                    // 2. Find the template definition (for default styles/text) if it exists
                    const templateSection = template.sections.find(
                        (s) => s.id === sectionId
                    );

                    // 3. Determine display text (Custom > Template > Default)
                    const customData = layout.customSectionData?.[sectionId];
                    const displayName = customData?.name ?? templateSection?.name ?? "Untitled Project";
                    const displayDescription = customData?.description ?? templateSection?.description ?? "No description provided.";

                    const isExpanded = expandedSectionId === sectionId;

                    return (
                        <div key={sectionId} className="relative group">
                            {/* Gallery Section */}
                            <div className="w-full aspect-[16/10] bg-gray-100 rounded-[4px] overflow-hidden mb-4 relative shadow-sm hover:shadow-md transition-shadow">
                                <GridSectionWrapper
                                    {...wrapperProps}
                                    section={section}
                                    templateSection={templateSection || { id: sectionId }} // Fallback if fully custom
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
                                <div className="flex items-center gap-4 w-full">
                                    <div className="flex gap-1 shrink-0">
                                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300">
                                            <ChevronRight className="w-3 h-3 rotate-180 opacity-50" />
                                        </div>
                                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300">
                                            <ChevronRight className="w-3 h-3 opacity-50" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <input
                                            className="text-xl font-medium leading-tight bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-gray-300 rounded w-full"
                                            value={displayName}
                                            onChange={(e) => handleUpdateText(sectionId, "name", e.target.value)}
                                            placeholder="Project Name"
                                        />
                                        <p className="text-sm text-gray-500 font-light">
                                            Case Study {index + 1}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 text-sm font-medium shrink-0">
                                    <span className="uppercase tracking-wide hidden sm:block">Brand Identity</span>
                                    <span className="text-gray-400 font-mono">
                                        01.{12 + index}
                                    </span>
                                    <span className="text-gray-400">2024</span>
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
                                        className="text-gray-700 max-w-2xl leading-relaxed w-full bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-gray-300 rounded resize-none"
                                        value={displayDescription}
                                        onChange={(e) => handleUpdateText(sectionId, "description", e.target.value)}
                                        rows={3}
                                        placeholder="Enter description..."
                                    />
                                    <div className="mt-6 flex flex-col gap-1">
                                        <span className="text-xs uppercase font-bold tracking-wider">
                                            Credits
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            Designed by Users
                                        </span>
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
