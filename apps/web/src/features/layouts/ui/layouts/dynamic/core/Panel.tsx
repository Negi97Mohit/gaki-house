import React, { useState } from "react";
import { CanvasSectionState } from "@gaki/core/types/caption";
import { GridSectionWrapper } from "../../GridSectionWrapper";
import { useDynamicLayout } from "./DynamicLayoutContext";
import { cn } from "@gaki/core/lib/utils";
import { DynamicDeleteButton } from "./LayoutButtons";

interface PanelProps {
    section: CanvasSectionState;
    index: number;
    className?: string;
    style?: React.CSSProperties;
    wrapperProps?: any; // To pass through to GridSectionWrapper
    children?: React.ReactNode;
}

export const Panel: React.FC<PanelProps> = ({
    section,
    index,
    className,
    style,
    wrapperProps,
    children,
}) => {
    const { editor, colors } = useDynamicLayout();
    const [isHovered, setIsHovered] = useState(false);

    return (
        <div
            data-section-id={section.id}
            className={cn("relative group", className)}
            style={style}
            onMouseEnter={() => {
                setIsHovered(true);
                editor.setHoveredSectionId(section.id);
            }}
            onMouseLeave={() => {
                setIsHovered(false);
                editor.setHoveredSectionId(null);
            }}
        >
            {/* Content Wrapper */}
            <div className="relative w-full h-full">
                <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id, name: `Panel ${index + 1}` }}
                    isHovered={isHovered}
                    {...wrapperProps}
                />
            </div>

            {children}

            {/* Centralized Delete for the Panel */}
            <DynamicDeleteButton
                sectionId={section.id}
                className={cn(
                    "absolute top-2 right-2 transition-opacity duration-300",
                    isHovered ? "opacity-100" : "opacity-0"
                )}
            />
        </div>
    );
};
