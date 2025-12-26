import React, { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/types/layout";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { ArrowUp, ArrowDown } from "lucide-react";

export const VerticalSliderLayout: React.FC<any> = ({
    layout,
    template,
    ...wrapperProps
}) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

    const leftSections = template.sections.filter((s) => s.id.includes("-left"));
    const rightSections = template.sections.filter((s) => s.id.includes("-right"));
    const slideCount = leftSections.length;

    const handleVerticalUp = () => {
        setActiveSlideIndex((prev) => (prev >= slideCount - 1 ? 0 : prev + 1));
    };
    const handleVerticalDown = () => {
        setActiveSlideIndex((prev) => (prev === 0 ? slideCount - 1 : prev - 1));
    };

    return (
        <div className="relative w-full h-[100vh] overflow-hidden bg-background">
            <div
                className="absolute left-0 top-0 w-[35%] h-full transition-transform duration-500 ease-in-out z-20"
                style={{
                    top: `-${(slideCount - 1) * 100}vh`,
                    transform: `translateY(${activeSlideIndex * 100}vh)`,
                }}
            >
                {[...leftSections].reverse().map((templateSection) => {
                    const section =
                        layout.sections.find((s) => s.id === templateSection.id) ||
                        ({
                            id: templateSection.id,
                            content: { type: "empty" },
                        } as CanvasSectionState);

                    return (
                        <div
                            key={templateSection.id}
                            className="h-[100vh] w-full relative"
                            style={{
                                backgroundColor: templateSection.style.backgroundColor,
                            }}
                            onMouseEnter={() => setHoveredSectionId(templateSection.id)}
                            onMouseLeave={() => setHoveredSectionId(null)}
                        >
                            <GridSectionWrapper
                                {...wrapperProps}
                                section={section}
                                templateSection={templateSection}
                                isHovered={hoveredSectionId === templateSection.id}
                                isVertical={true}
                            />
                        </div>
                    );
                })}
            </div>

            <div
                className="absolute left-[35%] top-0 w-[65%] h-full transition-transform duration-500 ease-in-out z-10"
                style={{
                    transform: `translateY(-${activeSlideIndex * 100}vh)`,
                }}
            >
                {rightSections.map((templateSection) => {
                    const section =
                        layout.sections.find((s) => s.id === templateSection.id) ||
                        ({
                            id: templateSection.id,
                            content: { type: "empty" },
                        } as CanvasSectionState);

                    return (
                        <div
                            key={templateSection.id}
                            className="h-[100vh] w-full relative"
                            style={{
                                backgroundColor: templateSection.style.backgroundColor,
                            }}
                            onMouseEnter={() => setHoveredSectionId(templateSection.id)}
                            onMouseLeave={() => setHoveredSectionId(null)}
                        >
                            <GridSectionWrapper
                                {...wrapperProps}
                                section={section}
                                templateSection={templateSection}
                                isHovered={hoveredSectionId === templateSection.id}
                                isVertical={true}
                            />
                        </div>
                    );
                })}
            </div>

            <div className="absolute top-1/2 left-[35%] -translate-x-1/2 -translate-y-1/2 z-50 flex flex-col shadow-lg rounded-lg overflow-hidden bg-white">
                <button
                    className="border-none text-[#aaa] cursor-pointer p-4 hover:text-[#222] focus:outline-none transition-colors border-b border-gray-100"
                    onClick={handleVerticalDown}
                >
                    <ArrowDown className="w-5 h-5" />
                </button>
                <button
                    className="border-none text-[#aaa] cursor-pointer p-4 hover:text-[#222] focus:outline-none transition-colors"
                    onClick={handleVerticalUp}
                >
                    <ArrowUp className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};
