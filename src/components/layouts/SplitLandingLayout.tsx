import React, { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/types/layout";
import { GridSectionWrapper } from "./GridSectionWrapper";

export const SplitLandingLayout: React.FC<any> = ({
    layout,
    template,
    ...wrapperProps
}) => {
    const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

    return (
        <div className="relative w-full h-full flex overflow-hidden bg-[#333]">
            {template.sections.map((templateSection) => {
                const section =
                    layout.sections.find((s) => s.id === templateSection.id) ||
                    ({
                        id: templateSection.id,
                        content: { type: "empty" },
                    } as CanvasSectionState);

                let widthClass = "basis-1/2";
                if (hoveredSectionId) {
                    if (hoveredSectionId === templateSection.id) {
                        widthClass = "basis-3/4";
                    } else {
                        widthClass = "basis-1/4";
                    }
                }

                return (
                    <div
                        key={templateSection.id}
                        className={cn(
                            "relative h-full transition-all duration-1000 ease-in-out border-none overflow-hidden group",
                            widthClass
                        )}
                        style={{
                            backgroundColor:
                                typeof templateSection.style.backgroundColor === "string"
                                    ? templateSection.style.backgroundColor
                                    : undefined,
                        }}
                        onMouseEnter={() => setHoveredSectionId(templateSection.id)}
                        onMouseLeave={() => setHoveredSectionId(null)}
                    >
                        <GridSectionWrapper
                            {...wrapperProps}
                            section={section}
                            templateSection={templateSection}
                            isHovered={hoveredSectionId === templateSection.id}
                            isSplit={true}
                        />

                        <div
                            className="absolute inset-0 pointer-events-none z-0 opacity-40 transition-opacity duration-300 group-hover:opacity-20"
                            style={{
                                backgroundColor: templateSection.style.backgroundColor,
                            }}
                        />
                    </div>
                );
            })}
        </div>
    );
};
