import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { GridSectionWrapper } from "./GridSectionWrapper";

export const ExpandingCardsLayout: React.FC<any> = ({
    layout,
    template,
    ...wrapperProps
}) => {
    const [activeCardId, setActiveCardId] = useState<string>("card-1");
    const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full flex items-center justify-center px-4 gap-4 bg-white">
            {template.sections.map((templateSection) => {
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
                                <h3 className="text-xl font-bold text-white drop-shadow-md bg-black/10 px-3 py-1 rounded backdrop-blur-sm">
                                    {templateSection.name}
                                </h3>
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
