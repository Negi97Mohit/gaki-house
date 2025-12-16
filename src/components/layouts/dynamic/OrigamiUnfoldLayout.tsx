import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

const OrigamiUnfoldContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible, layout } = useDynamicLayout();
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                // Initial folded state
                gsap.set(card, {
                    rotateX: -90,
                    transformOrigin: "top center",
                    opacity: 0,
                });

                // Unfold animation
                gsap.to(card, {
                    rotateX: 0,
                    opacity: 1,
                    duration: 1.2,
                    delay: i * 0.2,
                    ease: "power2.out",
                });

                // Subtle floating on hover
                card.addEventListener("mouseenter", () => {
                    gsap.to(card, {
                        rotateY: 5,
                        rotateX: -5,
                        scale: 1.02,
                        boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
                        duration: 0.4,
                        ease: "power2.out",
                    });
                });

                card.addEventListener("mouseleave", () => {
                    gsap.to(card, {
                        rotateY: 0,
                        rotateX: 0,
                        scale: 1,
                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                        duration: 0.4,
                        ease: "power2.out",
                    });
                });
            });
        });
        return () => ctx.revert();
    }, [sections.length]);

    const paperColors = [
        { bg: "#FDFAF6", fold: "#E8E0D5" },
        { bg: "#FFF5F5", fold: "#FFE0E0" },
        { bg: "#F0FFF4", fold: "#C6F6D5" },
        { bg: "#F0F4FF", fold: "#C3DAFE" },
        { bg: "#FFFAF0", fold: "#FEEBC8" },
    ];

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto relative"
            style={{
                perspective: "1500px",
                backgroundColor: colors.backgroundColor,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h100v100H0z' fill='none'/%3E%3Cpath d='M0 50h100M50 0v100' stroke='%23e5e5e5' stroke-width='0.5'/%3E%3C/svg%3E")`,
            }}
        >
            {/* Header */}
            <div className="flex-shrink-0 p-8 md:p-16 text-center">
                <EditableText
                    sectionId="header"
                    fieldId="title"
                    defaultValue="折り紙"
                    className="text-7xl md:text-9xl font-light tracking-wide"
                    style={{ color: colors.textColor }}
                />
                <EditableText
                    sectionId="header"
                    fieldId="subtitle"
                    defaultValue="The Art of Paper Folding"
                    className="text-lg md:text-xl font-light mt-6 tracking-[0.3em] uppercase"
                    style={{ color: colors.textColor, opacity: 0.6 }}
                />
            </div>

            {/* Cards Grid */}
            <div className="px-6 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-5xl mx-auto">
                    {sections.map((section, i) => {
                        const colorSet = paperColors[i % paperColors.length];
                        return (
                            <div
                                key={section.id}
                                ref={(el) => {
                                    if (el) cardsRef.current[i] = el;
                                }}
                                className="relative group"
                                style={{
                                    transformStyle: "preserve-3d",
                                    transform: "rotateX(0deg)",
                                }}
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Paper Card */}
                                <div
                                    className="relative overflow-hidden transition-all duration-500"
                                    style={{
                                        backgroundColor: colorSet.bg,
                                        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                                    }}
                                >
                                    {/* Fold crease effect - top */}
                                    <div
                                        className="absolute top-0 left-0 right-0 h-12"
                                        style={{
                                            background: `linear-gradient(to bottom, ${colorSet.fold}, transparent)`,
                                            opacity: 0.5,
                                        }}
                                    />

                                    {/* Corner fold */}
                                    <div
                                        className="absolute top-0 right-0 w-16 h-16"
                                        style={{
                                            background: `linear-gradient(135deg, transparent 50%, ${colorSet.fold} 50%)`,
                                        }}
                                    >
                                        <div
                                            className="absolute bottom-1 left-1 w-10 h-10"
                                            style={{
                                                background: `linear-gradient(135deg, ${colorSet.bg} 50%, transparent 50%)`,
                                                boxShadow: "-2px 2px 5px rgba(0,0,0,0.1)",
                                            }}
                                        />
                                    </div>

                                    {/* Content area */}
                                    <div className="aspect-[4/3] relative">
                                        <GridSectionWrapper
                                            section={section}
                                            templateSection={{ id: section.id, name: `Origami-${i + 1}` }}
                                            isHovered={editor.hoveredSectionId === section.id}
                                            onSectionDelete={props.onSectionDelete}
                                            onSectionContentChange={props.onSectionContentChange}
                                            {...props}
                                        />
                                    </div>

                                    {/* Bottom section */}
                                    <div className="p-6 border-t border-dashed" style={{ borderColor: colorSet.fold }}>
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="label"
                                            defaultValue={`Fold ${i + 1}`}
                                            className="text-lg font-light tracking-wide"
                                            style={{ color: colors.textColor }}
                                        />
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="description"
                                            defaultValue="Click to unfold this section"
                                            className="text-sm mt-1 opacity-50"
                                            style={{ color: colors.textColor }}
                                        />
                                    </div>

                                    {/* Paper texture overlay */}
                                    <div
                                        className="absolute inset-0 pointer-events-none opacity-10 mix-blend-multiply"
                                        style={{
                                            backgroundImage:
                                                'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.9\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                                        }}
                                    />

                                    {/* Delete Button */}
                                    <DynamicDeleteButton
                                        sectionId={section.id}
                                        className={cn(
                                            "absolute top-14 right-4 transition-opacity duration-300",
                                            editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>

                                {/* Shadow beneath */}
                                <div
                                    className="absolute -bottom-2 left-4 right-4 h-4 bg-black/10 blur-lg"
                                    style={{ transform: "rotateX(90deg)", transformOrigin: "top" }}
                                />
                            </div>
                        );
                    })}

                    {/* Add Button */}
                    <DynamicAddButton
                        defaultValue="+ Add Fold"
                        className="min-h-[300px] border-2 border-dashed hover:border-gray-400 bg-white/50"
                        style={{
                            borderColor: "#e5e5e5",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export const OrigamiUnfoldLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#FAFAF8"
            defaultTextColor="#2D2D2D"
            {...props}
        >
            <OrigamiUnfoldContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
