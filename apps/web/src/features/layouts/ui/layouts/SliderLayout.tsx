import React, { useState } from "react";
import { cn } from "@caption-cam/core/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@caption-cam/core/types/caption";
import { CanvasLayoutTemplate } from "@caption-cam/core/types/layout";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { ArrowLeft, ArrowRight } from "lucide-react";

export const SliderLayout: React.FC<any> = ({
    layout,
    template,
    ...wrapperProps
}) => {
    const [activeSlideIndex, setActiveSlideIndex] = useState(0);
    const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

    const handlePrevSlide = () => {
        setActiveSlideIndex((prev) =>
            prev === 0 ? template.sections.length - 1 : prev - 1
        );
    };
    const handleNextSlide = () => {
        setActiveSlideIndex((prev) => (prev + 1) % template.sections.length);
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center bg-white">
            <div className="relative w-[70vw] h-[70vh] shadow-2xl rounded-xl z-10 overflow-hidden bg-white">
                {template.sections.map((templateSection, index) => {
                    const section =
                        layout.sections.find((s) => s.id === templateSection.id) ||
                        ({
                            id: templateSection.id,
                            content: { type: "empty" },
                        } as CanvasSectionState);

                    const isSlideActive = index === activeSlideIndex;

                    return (
                        <div
                            key={templateSection.id}
                            className={cn(
                                "absolute inset-0 w-full h-full border-none transition-opacity duration-500 ease-in-out",
                                isSlideActive ? "opacity-100 z-10" : "opacity-0 z-0"
                            )}
                            style={{
                                background: templateSection.style.background,
                                overflow: "hidden",
                            }}
                            onMouseEnter={() => setHoveredSectionId(templateSection.id)}
                            onMouseLeave={() => setHoveredSectionId(null)}
                        >
                            <div className="relative w-full h-full">
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

                <button
                    className="absolute left-[30px] top-1/2 -translate-y-1/2 z-50 bg-transparent text-white border border-white p-4 hover:bg-white hover:text-black transition-colors cursor-pointer rounded-sm"
                    onClick={handlePrevSlide}
                >
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <button
                    className="absolute right-[30px] top-1/2 -translate-y-1/2 z-50 bg-transparent text-white border border-white p-4 hover:bg-white hover:text-black transition-colors cursor-pointer rounded-sm"
                    onClick={handleNextSlide}
                >
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};
