import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

gsap.registerPlugin(ScrollTrigger);

const HauteCoutureStacksContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const [hoveredCard, setHoveredCard] = useState<number | null>(null);
    const [expandedCard, setExpandedCard] = useState<number | null>(null);
    const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Stacked card entrance
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                gsap.fromTo(card,
                    {
                        y: 200,
                        opacity: 0,
                        rotateX: -30
                    },
                    {
                        y: 0,
                        opacity: 1,
                        rotateX: 0,
                        duration: 0.8,
                        delay: i * 0.2,
                        ease: "power3.out"
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, [sections.length]);

    // Hover interaction - swipe card out to reveal more (with delay to prevent accidental triggers)
    const handleCardHover = (index: number) => {
        if (expandedCard !== null) return; // Don't swipe if a card is expanded

        // Clear any pending leave animation
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
            leaveTimeoutRef.current = null;
        }

        // Add delay before swipe to prevent accidental triggers
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }

        hoverTimeoutRef.current = setTimeout(() => {
            setHoveredCard(index);
            const card = cardsRef.current[index];
            if (!card) return;

            // Swipe the hovered card out to the right to reveal it (slower, smoother)
            gsap.to(card, {
                x: 60,
                y: -10,
                scale: 1.02,
                zIndex: 200,
                duration: 0.6, // Slower animation
                ease: "power2.out",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.4)"
            });

            // Slightly dim other cards (slower fade)
            cardsRef.current.forEach((c, i) => {
                if (i !== index && c) {
                    gsap.to(c, {
                        opacity: 0.7,
                        duration: 0.5 // Slower fade
                    });
                }
            });
        }, 150); // 150ms delay before triggering swipe
    };

    // Reset hover state (with delay to allow moving between cards)
    const handleCardLeave = () => {
        if (expandedCard !== null) return; // Don't reset if a card is expanded

        // Clear hover trigger
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
            hoverTimeoutRef.current = null;
        }

        // Add small delay before resetting to allow moving to another card
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
        }

        leaveTimeoutRef.current = setTimeout(() => {
            setHoveredCard(null);

            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                const stackOffset = i * 15;
                const rotation = (i - sections.length / 2) * 2;

                gsap.to(card, {
                    x: 0,
                    y: stackOffset,
                    scale: 1,
                    opacity: 1,
                    rotation: rotation,
                    zIndex: sections.length - i,
                    duration: 0.5, // Slower return animation
                    ease: "power2.inOut",
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                });
            });
        }, 200); // Small delay before reset
    };

    // Click interaction - pop card out to full view
    const handleCardClick = (index: number) => {
        // Clear any pending animations
        if (hoverTimeoutRef.current) {
            clearTimeout(hoverTimeoutRef.current);
        }
        if (leaveTimeoutRef.current) {
            clearTimeout(leaveTimeoutRef.current);
        }
        setExpandedCard(index);
    };

    const handleCloseExpanded = () => {
        setExpandedCard(null);
        // Reset all cards to stack position
        handleCardLeave();
    };

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
            if (leaveTimeoutRef.current) clearTimeout(leaveTimeoutRef.current);
        };
    }, []);

    // Focus the lightbox when it opens to ensure it receives keyboard events
    useEffect(() => {
        if (expandedCard !== null && containerRef.current) {
            // Find the lightbox overlay and focus it
            const overlay = containerRef.current.querySelector('[tabindex="-1"]') as HTMLElement;
            if (overlay) {
                setTimeout(() => overlay.focus(), 0);
            }
        }
    }, [expandedCard]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden relative"
            style={{ perspective: "1500px" }}
        >
            {/* Elegant pattern background */}
            <div
                className="absolute inset-0 opacity-5"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(colors.textColor)}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                }}
            />

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-12">
                {/* Header */}
                <header className="flex-shrink-0 mb-8 flex justify-between items-end">
                    <div>
                        <EditableText
                            sectionId="header"
                            fieldId="brand"
                            defaultValue="HAUTE"
                            className="text-xs font-light tracking-[0.5em] opacity-50"
                            style={{ color: colors.textColor }}
                        />
                        <EditableText
                            sectionId="header"
                            fieldId="title"
                            defaultValue="COUTURE"
                            className="text-5xl md:text-7xl font-extralight tracking-[0.2em]"
                            style={{
                                color: colors.textColor,
                                fontFamily: "'Playfair Display', serif"
                            }}
                        />
                    </div>
                    <div className="text-right">
                        <EditableText
                            sectionId="header"
                            fieldId="season"
                            defaultValue="SS25"
                            className="text-4xl font-extralight"
                            style={{ color: colors.textColor }}
                        />
                        <EditableText
                            sectionId="header"
                            fieldId="collection"
                            defaultValue="COLLECTION"
                            className="text-xs tracking-[0.5em] opacity-50"
                            style={{ color: colors.textColor }}
                        />
                    </div>
                </header>

                {/* Runway Cards Stack */}
                <div className="flex-1 flex items-center justify-center pb-20">
                    <div className="relative w-full max-w-lg h-[500px] md:h-[600px]">
                        {sections.map((section, i) => {
                            const stackOffset = i * 15;
                            const rotation = (i - sections.length / 2) * 2;

                            return (
                                <div
                                    key={section.id}
                                    ref={(el) => { if (el) cardsRef.current[i] = el; }}
                                    className={cn(
                                        "absolute inset-0 cursor-pointer group",
                                        "bg-white shadow-2xl overflow-hidden",
                                        "transition-shadow duration-300"
                                    )}
                                    style={{
                                        zIndex: sections.length - i,
                                        transform: `translateY(${stackOffset}px) rotate(${rotation}deg)`,
                                        transformOrigin: "center bottom"
                                    }}
                                    onClick={() => handleCardClick(i)}
                                    onMouseEnter={() => {
                                        handleCardHover(i);
                                        editor.setHoveredSectionId(section.id);
                                    }}
                                    onMouseLeave={() => {
                                        handleCardLeave();
                                        editor.setHoveredSectionId(null);
                                    }}
                                >
                                    {/* Card content */}
                                    <div className="absolute inset-0">
                                        <GridSectionWrapper
                                            section={section}
                                            templateSection={{ id: section.id, name: `Look-${i + 1}` }}
                                            isHovered={editor.hoveredSectionId === section.id}
                                            onSectionDelete={props.onSectionDelete}
                                            onSectionContentChange={props.onSectionContentChange}
                                            {...props}
                                        />
                                    </div>

                                    {/* Look number */}
                                    <div
                                        className="absolute top-4 left-4 px-3 py-1 text-xs font-light tracking-widest bg-white/90"
                                        style={{ color: "#1a1a1a" }}
                                    >
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="look_number"
                                            defaultValue={`LOOK ${String(i + 1).padStart(2, "0")}`}
                                            className="text-xs font-light tracking-widest"
                                            style={{ color: "#1a1a1a" }}
                                        />
                                    </div>

                                    {/* Hover instruction hint */}
                                    <div className={cn(
                                        "absolute top-4 right-16 px-3 py-1 text-xs font-light tracking-widest bg-black/80 text-white",
                                        "opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                    )}>
                                        <EditableText
                                            sectionId="hints"
                                            fieldId="click_hint"
                                            defaultValue="CLICK TO EXPAND"
                                            className="text-xs font-light tracking-widest text-white"
                                        />
                                    </div>

                                    {/* Info panel */}
                                    <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent">
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="title"
                                            defaultValue={`Silhouette ${i + 1}`}
                                            className="text-lg font-light text-black"
                                        />
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="details"
                                            defaultValue="Silk, Organza"
                                            className="text-xs tracking-widest text-black/50 mt-1"
                                        />
                                    </div>

                                    {/* Delete button */}
                                    <DynamicDeleteButton
                                        sectionId={section.id}
                                        className={cn(
                                            "absolute top-4 right-4 transition-opacity duration-300",
                                            editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Add Button */}
                <div className="flex-shrink-0 flex justify-center">
                    <DynamicAddButton
                        defaultValue="+ ADD LOOK"
                        className="px-8 py-4 border border-current hover:bg-black/5 text-sm tracking-[0.3em] font-light"
                        style={{ color: colors.textColor }}
                    />
                </div>

                {/* Footer */}
                <footer className="flex-shrink-0 mt-8 pt-4 border-t flex justify-between items-center text-xs tracking-widest opacity-40"
                    style={{ borderColor: `${colors.textColor}30`, color: colors.textColor }}>
                    <EditableText
                        sectionId="footer"
                        fieldId="left"
                        defaultValue="PARIS FASHION WEEK"
                    />
                    <EditableText
                        sectionId="footer"
                        fieldId="right"
                        defaultValue="HOVER TO REVEAL"
                    />
                </footer>
            </div>

            {/* Lightbox - Expanded View */}
            {expandedCard !== null && sections[expandedCard] && (
                <div
                    className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-8"
                    onClick={handleCloseExpanded}
                    onKeyDown={(e) => {
                        if (e.key === "Escape") {
                            e.preventDefault();
                            e.stopPropagation();
                            handleCloseExpanded();
                        }
                    }}
                    tabIndex={-1}
                    style={{ outline: 'none' }}
                >
                    {/* Close button */}
                    <button
                        onClick={handleCloseExpanded}
                        className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
                        aria-label="Close expanded view"
                    >
                        <div className="relative w-6 h-6">
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform rotate-45"></div>
                            <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white transform -rotate-45"></div>
                        </div>
                    </button>

                    {/* Expanded card */}
                    <div
                        className="relative bg-white w-full max-w-5xl h-[85vh] overflow-auto shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="w-full h-full">
                            <GridSectionWrapper
                                section={sections[expandedCard]}
                                templateSection={{ id: sections[expandedCard].id, name: `Look-${expandedCard + 1}` }}
                                isHovered={false}
                                onSectionDelete={props.onSectionDelete}
                                onSectionContentChange={props.onSectionContentChange}
                                {...props}
                            />
                        </div>

                        {/* Info overlay in expanded view */}
                        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/98 to-transparent">
                            <div className="text-xs tracking-widest opacity-50 mb-3">
                                <EditableText
                                    sectionId={sections[expandedCard].id}
                                    fieldId="look_number"
                                    defaultValue={`LOOK ${String(expandedCard + 1).padStart(2, "0")}`}
                                    className="text-xs tracking-widest opacity-50"
                                />
                            </div>
                            <EditableText
                                sectionId={sections[expandedCard].id}
                                fieldId="title"
                                defaultValue={`Silhouette ${expandedCard + 1}`}
                                className="text-3xl font-light text-black"
                            />
                            <EditableText
                                sectionId={sections[expandedCard].id}
                                fieldId="details"
                                defaultValue="Silk, Organza"
                                className="text-sm tracking-widest text-black/50 mt-2"
                            />
                        </div>
                    </div>

                    {/* Counter */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white text-sm tracking-widest font-light">
                        {expandedCard + 1} / {sections.length}
                    </div>
                </div>
            )}
        </div>
    );
};

export const HauteCoutureStacksLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#f8f8f6"
            defaultTextColor="#1a1a1a"
            {...props}
        >
            <HauteCoutureStacksContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
