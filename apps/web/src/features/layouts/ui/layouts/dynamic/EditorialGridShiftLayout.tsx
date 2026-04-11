import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { Flip } from "gsap/Flip";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@caption-cam/core/types/caption";
import { cn } from "@caption-cam/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

gsap.registerPlugin(Flip);

const EditorialGridShiftContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const gridRef = useRef<HTMLDivElement>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [gridLayout, setGridLayout] = useState<number[]>([]);

    // Initialize grid layout order
    useEffect(() => {
        setGridLayout(sections.map((_, i) => i));
    }, [sections.length]);

    // Handle click to shift grid clockwise
    const handlePanelClick = useCallback((clickedIndex: number) => {
        if (!gridRef.current || sections.length < 2) return;

        // Capture current state
        const state = Flip.getState(gridRef.current.querySelectorAll(".grid-panel"));

        // Rotate the layout array to shift positions clockwise
        const newLayout = [...gridLayout];

        // Find the clicked item's current position in the layout
        const clickedPosition = gridLayout.indexOf(clickedIndex);

        // Rotate array so clicked item becomes first (featured)
        const rotated = [
            ...newLayout.slice(clickedPosition),
            ...newLayout.slice(0, clickedPosition)
        ];

        setGridLayout(rotated);
        setActiveIndex(clickedIndex);

        // Animate the flip
        requestAnimationFrame(() => {
            Flip.from(state, {
                duration: 0.8,
                ease: "power2.inOut",
                stagger: 0.05,
                absolute: true,
                onComplete: () => {
                    // Subtle pulse on the new featured item
                    const featured = gridRef.current?.querySelector(".grid-panel.featured");
                    if (featured) {
                        gsap.fromTo(featured,
                            { boxShadow: `0 0 0 rgba(0,0,0,0)` },
                            {
                                boxShadow: `0 0 40px ${colors.textColor}40`,
                                duration: 0.3,
                                yoyo: true,
                                repeat: 1
                            }
                        );
                    }
                }
            });
        });
    }, [gridLayout, sections.length, colors.textColor]);

    // Get the ordered sections based on gridLayout
    const getOrderedSections = () => {
        if (gridLayout.length !== sections.length) return sections;
        return gridLayout.map(i => sections[i]).filter(Boolean);
    };

    const orderedSections = getOrderedSections();
    const featuredSection = orderedSections[0];
    const smallSections = orderedSections.slice(1);

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden relative">
            {/* Background pattern */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                        0deg,
                        ${colors.textColor} 0px,
                        ${colors.textColor} 1px,
                        transparent 1px,
                        transparent 40px
                    ),
                    repeating-linear-gradient(
                        90deg,
                        ${colors.textColor} 0px,
                        ${colors.textColor} 1px,
                        transparent 1px,
                        transparent 40px
                    )`
                }}
            />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col p-6 md:p-10">
                {/* Header */}
                <header className="flex-shrink-0 mb-6 flex justify-between items-end border-b-2 pb-4"
                    style={{ borderColor: colors.textColor }}>
                    <div>
                        <EditableText
                            sectionId="header"
                            fieldId="title"
                            defaultValue="EDITORIAL"
                            className="text-4xl md:text-6xl font-black tracking-tighter uppercase"
                            style={{ color: colors.textColor }}
                        />
                        <EditableText
                            sectionId="header"
                            fieldId="subtitle"
                            defaultValue="GRID SHIFT"
                            className="text-lg md:text-xl font-light tracking-[0.5em] uppercase opacity-60"
                            style={{ color: colors.textColor }}
                        />
                    </div>
                    <EditableText
                        sectionId="header"
                        fieldId="edition"
                        defaultValue="ISSUE 01"
                        className="text-sm font-bold tracking-widest"
                        style={{ color: colors.textColor }}
                    />
                </header>

                {/* Instruction */}
                <div className={cn(
                    "mb-4 text-xs font-mono tracking-widest uppercase transition-opacity duration-300",
                    controlsVisible ? "opacity-40" : "opacity-0"
                )} style={{ color: colors.textColor }}>
                    Click any panel to shift grid clockwise
                </div>

                {/* Editorial Grid - 2 columns with 1 large + 2 small stacked */}
                <div
                    ref={gridRef}
                    className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0"
                >
                    {/* Featured (Large) Panel */}
                    {featuredSection && (
                        <div
                            data-flip-id={`panel-${featuredSection.id}`}
                            className={cn(
                                "grid-panel featured relative cursor-pointer group",
                                "md:col-span-2 md:row-span-2",
                                "border-2 transition-all duration-300 hover:border-opacity-100"
                            )}
                            style={{
                                borderColor: colors.textColor,
                                background: colors.backgroundColor
                            }}
                            onClick={() => handlePanelClick(sections.indexOf(featuredSection))}
                            onMouseEnter={() => editor.setHoveredSectionId(featuredSection.id)}
                            onMouseLeave={() => editor.setHoveredSectionId(null)}
                        >
                            <div className="absolute inset-0">
                                <GridSectionWrapper
                                    section={featuredSection}
                                    templateSection={{ id: featuredSection.id, name: "Featured" }}
                                    isHovered={editor.hoveredSectionId === featuredSection.id}
                                    onSectionDelete={props.onSectionDelete}
                                    onSectionContentChange={props.onSectionContentChange}
                                    {...props}
                                />
                            </div>

                            {/* Featured label */}
                            <div
                                className="absolute top-0 left-0 px-4 py-2 font-bold text-xs uppercase tracking-widest"
                                style={{ background: colors.textColor, color: colors.backgroundColor }}
                            >
                                <EditableText
                                    sectionId={featuredSection.id}
                                    fieldId="label"
                                    defaultValue="FEATURED"
                                    className="text-inherit"
                                />
                            </div>

                            {/* Caption */}
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
                                <EditableText
                                    sectionId={featuredSection.id}
                                    fieldId="title"
                                    defaultValue="Cover Story"
                                    className="text-xl md:text-2xl font-bold text-white"
                                />
                                <EditableText
                                    sectionId={featuredSection.id}
                                    fieldId="description"
                                    defaultValue="Click to shift"
                                    className="text-sm text-white/70 mt-1"
                                />
                            </div>

                            <DynamicDeleteButton
                                sectionId={featuredSection.id}
                                className={cn(
                                    "absolute top-2 right-2 transition-opacity duration-300",
                                    editor.hoveredSectionId === featuredSection.id ? "opacity-100" : "opacity-0"
                                )}
                            />
                        </div>
                    )}

                    {/* Small Panels - Stacked vertically */}
                    {smallSections.map((section, i) => (
                        <div
                            key={section.id}
                            data-flip-id={`panel-${section.id}`}
                            className={cn(
                                "grid-panel relative cursor-pointer group",
                                "border transition-all duration-300 hover:border-opacity-100"
                            )}
                            style={{
                                borderColor: `${colors.textColor}80`,
                                background: colors.backgroundColor
                            }}
                            onClick={() => handlePanelClick(sections.indexOf(section))}
                            onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                            onMouseLeave={() => editor.setHoveredSectionId(null)}
                        >
                            <div className="absolute inset-0">
                                <GridSectionWrapper
                                    section={section}
                                    templateSection={{ id: section.id, name: `Panel-${i + 2}` }}
                                    isHovered={editor.hoveredSectionId === section.id}
                                    onSectionDelete={props.onSectionDelete}
                                    onSectionContentChange={props.onSectionContentChange}
                                    {...props}
                                />
                            </div>

                            {/* Panel number */}
                            <div
                                className="absolute top-2 left-2 w-8 h-8 flex items-center justify-center text-xs font-bold"
                                style={{
                                    background: `${colors.textColor}20`,
                                    color: colors.textColor
                                }}
                            >
                                {String(i + 2).padStart(2, '0')}
                            </div>

                            {/* Title overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                                <EditableText
                                    sectionId={section.id}
                                    fieldId="title"
                                    defaultValue={`Section ${i + 2}`}
                                    className="text-sm font-medium text-white"
                                />
                            </div>

                            <DynamicDeleteButton
                                sectionId={section.id}
                                className={cn(
                                    "absolute top-2 right-2 transition-opacity duration-300 z-10",
                                    editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                )}
                            />
                        </div>
                    ))}

                    {/* Add button */}
                    <DynamicAddButton
                        defaultValue="+ ADD PANEL"
                        className="min-h-[120px] border-2 border-dashed hover:bg-black/5 font-bold text-sm tracking-widest"
                        style={{
                            borderColor: `${colors.textColor}40`,
                            color: `${colors.textColor}60`
                        }}
                    />
                </div>

                {/* Footer */}
                <footer className="flex-shrink-0 mt-6 pt-4 border-t flex justify-between items-center text-xs"
                    style={{ borderColor: `${colors.textColor}30`, color: `${colors.textColor}60` }}>
                    <EditableText
                        sectionId="footer"
                        fieldId="left"
                        defaultValue="CLICK TO SHIFT"
                        className="font-mono tracking-widest"
                    />
                    <EditableText
                        sectionId="footer"
                        fieldId="right"
                        defaultValue="PANELS: DYNAMIC"
                        className="font-mono tracking-widest"
                    />
                </footer>
            </div>
        </div>
    );
};

export const EditorialGridShiftLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#ffffff"
            defaultTextColor="#000000"
            {...props}
        >
            <EditorialGridShiftContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
