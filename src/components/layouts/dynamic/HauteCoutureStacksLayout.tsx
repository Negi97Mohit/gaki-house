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
    const [expandedCard, setExpandedCard] = useState<number | null>(null);

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

    // Handle card expansion like opening a lookbook
    const handleCardClick = (index: number) => {
        if (expandedCard === index) {
            // Close
            gsap.to(cardsRef.current[index], {
                scale: 1,
                zIndex: sections.length - index,
                y: 0,
                duration: 0.5,
                ease: "power2.inOut"
            });
            setExpandedCard(null);
        } else {
            // Close previous
            if (expandedCard !== null && cardsRef.current[expandedCard]) {
                gsap.to(cardsRef.current[expandedCard], {
                    scale: 1,
                    zIndex: sections.length - expandedCard,
                    y: 0,
                    duration: 0.3
                });
            }

            // Unfold new card
            gsap.to(cardsRef.current[index], {
                scale: 1.05,
                zIndex: 100,
                y: -20,
                duration: 0.5,
                ease: "power2.out"
            });

            // Push other cards down
            cardsRef.current.forEach((card, i) => {
                if (i !== index && card) {
                    const direction = i < index ? -1 : 1;
                    gsap.to(card, {
                        y: direction * 30,
                        opacity: 0.6,
                        scale: 0.98,
                        duration: 0.4
                    });
                }
            });

            setExpandedCard(index);
        }
    };

    const resetCards = () => {
        cardsRef.current.forEach((card, i) => {
            if (!card) return;
            gsap.to(card, {
                scale: 1,
                y: 0,
                opacity: 1,
                zIndex: sections.length - i,
                duration: 0.3
            });
        });
        setExpandedCard(null);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden relative"
            style={{ perspective: "1500px" }}
            onMouseLeave={resetCards}
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
                                        "bg-white shadow-2xl overflow-hidden"
                                    )}
                                    style={{
                                        zIndex: sections.length - i,
                                        transform: `translateY(${stackOffset}px) rotate(${rotation}deg)`,
                                        transformOrigin: "center bottom"
                                    }}
                                    onClick={() => handleCardClick(i)}
                                    onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                    onMouseLeave={() => editor.setHoveredSectionId(null)}
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
                                        LOOK {String(i + 1).padStart(2, "0")}
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
                        defaultValue="TAP TO REVEAL"
                    />
                </footer>
            </div>
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
