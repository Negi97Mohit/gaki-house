import React, { useState } from "react";
import { cn } from "@/shared/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/types/layout";
import { useGridResizing } from "@/features/layouts/hooks/useGridResizing";
import { GridSectionWrapper } from "./GridSectionWrapper";

interface StandardGridLayoutProps {
    layout: CanvasLayoutState;
    template: CanvasLayoutTemplate;
    containerRef: React.RefObject<HTMLDivElement>;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
    [key: string]: any;
}

export const StandardGridLayout: React.FC<any> = ({
    layout,
    template,
    containerRef,
    onLayoutUpdate,
    // Props for GridSectionWrapper
    ...wrapperProps
}) => {
    const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

    const { handleResizeStart, getResizeEdges } = useGridResizing({
        layout,
        onLayoutUpdate,
        template,
        containerRef,
    });

    return (
        <div className="relative w-full h-full">
            {template.sections.map((templateSection) => {
                const section =
                    layout.sections.find((s) => s.id === templateSection.id) ||
                    ({
                        id: templateSection.id,
                        content: { type: "empty" },
                    } as CanvasSectionState);

                const sectionStyle =
                    layout.customSectionStyles?.[templateSection.id] ||
                    templateSection.style;

                const edges = getResizeEdges(templateSection.id);

                return (
                    <div
                        key={templateSection.id}
                        className={cn(
                            "overflow-hidden border border-border/20 group transition-all duration-500 ease-in-out absolute",
                            "hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20"
                        )}
                        style={{ ...sectionStyle, overflow: "hidden" }}
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

                            {edges.right && (
                                <div
                                    className="absolute top-0 right-0 w-1 h-full cursor-ew-resize z-50 hover:w-2 hover:bg-primary/40"
                                    onMouseDown={(e) =>
                                        handleResizeStart(templateSection.id, "right", e)
                                    }
                                />
                            )}
                            {edges.bottom && (
                                <div
                                    className="absolute bottom-0 left-0 w-full h-1 cursor-ns-resize z-50 hover:h-2 hover:bg-primary/40"
                                    onMouseDown={(e) =>
                                        handleResizeStart(templateSection.id, "bottom", e)
                                    }
                                />
                            )}
                            {edges.left && (
                                <div
                                    className="absolute top-0 left-0 w-1 h-full cursor-ew-resize z-50 hover:w-2 hover:bg-primary/40"
                                    onMouseDown={(e) =>
                                        handleResizeStart(templateSection.id, "left", e)
                                    }
                                />
                            )}
                            {edges.top && (
                                <div
                                    className="absolute top-0 left-0 w-full h-1 cursor-ns-resize z-50 hover:h-2 hover:bg-primary/40"
                                    onMouseDown={(e) =>
                                        handleResizeStart(templateSection.id, "top", e)
                                    }
                                />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};
