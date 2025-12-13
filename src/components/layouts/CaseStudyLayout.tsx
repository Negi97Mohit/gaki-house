import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { ChevronRight, Plus } from "lucide-react";

interface CaseStudyLayoutProps {
    layout: CanvasLayoutState;
    template: CanvasLayoutTemplate;
    [key: string]: any;
}

export const CaseStudyLayout: React.FC<CaseStudyLayoutProps> = ({
    layout,
    template,
    ...wrapperProps
}) => {
    const [expandedSectionId, setExpandedSectionId] = useState<string | null>(null);

    const toggleAccordion = (id: string) => {
        setExpandedSectionId(expandedSectionId === id ? null : id);
    };

    return (
        <div className="w-full h-full overflow-y-auto bg-white font-sans text-black">
            <div className="max-w-4xl mx-auto py-12 px-4 flex flex-col gap-24">
                {template.sections.map((templateSection, index) => {
                    const section =
                        layout.sections.find((s) => s.id === templateSection.id) ||
                        ({
                            id: templateSection.id,
                            content: { type: "empty" },
                        } as CanvasSectionState);

                    const isExpanded = expandedSectionId === templateSection.id;

                    return (
                        <div key={templateSection.id} className="relative group">
                            {/* Gallery Section */}
                            <div className="w-full aspect-[16/10] bg-gray-100 rounded-[4px] overflow-hidden mb-4 relative">
                                <GridSectionWrapper
                                    {...wrapperProps}
                                    section={section}
                                    templateSection={templateSection}
                                    isHovered={false}
                                />
                                {/* Fake Carousel Indicators/Navigation for visual fidelity */}
                                <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <div className="absolute top-1/2 left-4 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-white">
                                        <ChevronRight className="w-4 h-4 rotate-180" />
                                    </div>
                                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-8 h-8 bg-white/80 rounded-full flex items-center justify-center pointer-events-auto cursor-pointer hover:bg-white">
                                        <ChevronRight className="w-4 h-4" />
                                    </div>
                                </div>
                            </div>

                            {/* Top Bar Info */}
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center py-4 border-b border-black/10 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="flex gap-1">
                                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300">
                                            <ChevronRight className="w-3 h-3 rotate-180 opacity-50" />
                                        </div>
                                        <div className="w-6 h-6 bg-gray-200 rounded flex items-center justify-center cursor-pointer hover:bg-gray-300">
                                            <ChevronRight className="w-3 h-3 opacity-50" />
                                        </div>
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-medium leading-tight">{templateSection.name}</h2>
                                        <p className="text-sm text-gray-500 font-light">Case Study {index + 1}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 text-sm font-medium">
                                    <span className="uppercase tracking-wide">Brand Identity</span>
                                    <span className="text-gray-400 font-mono">01.{12 + index}</span>
                                    <span className="text-gray-400">2024</span>
                                </div>
                            </div>

                            {/* Accordion / Description */}
                            <div className="border-b border-black/10">
                                <div
                                    className={cn(
                                        "overflow-hidden transition-all duration-500 ease-in-out",
                                        isExpanded ? "max-h-[500px] opacity-100 py-6" : "max-h-0 opacity-0 py-0"
                                    )}
                                >
                                    <p className="text-gray-700 max-w-2xl leading-relaxed">
                                        {templateSection.description || "No description provided for this case study. Add a description in the editor to see it here."}
                                    </p>
                                    <div className="mt-6 flex flex-col gap-1">
                                        <span className="text-xs uppercase font-bold tracking-wider">Credits</span>
                                        <span className="text-sm text-gray-500">Designed by Users</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => toggleAccordion(templateSection.id)}
                                    className="w-full py-2 flex justify-center items-center hover:bg-gray-50 transition-colors"
                                >
                                    <div className={cn("relative w-4 h-4 transition-transform duration-300", isExpanded ? "rotate-45" : "rotate-0")}>
                                        <div className="absolute top-1/2 left-0 w-full h-[1.5px] bg-black -translate-y-1/2" />
                                        <div className="absolute top-0 left-1/2 h-full w-[1.5px] bg-black -translate-x-1/2" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
