import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Parametric curved path SVG background
const ParametricBackground: React.FC<{ className?: string }> = ({ className }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const pathRefs = useRef<SVGPathElement[]>([]);

    useEffect(() => {
        const paths = pathRefs.current.filter(Boolean);

        paths.forEach((path, i) => {
            const length = path.getTotalLength();
            gsap.set(path, {
                strokeDasharray: length,
                strokeDashoffset: length
            });

            gsap.to(path, {
                strokeDashoffset: 0,
                duration: 3 + i * 0.5,
                ease: "power2.inOut",
                repeat: -1,
                yoyo: true
            });
        });
    }, []);

    const generateCurvedPath = (index: number, total: number) => {
        const yOffset = (index / total) * 100;
        const amplitude = 20 + index * 5;
        return `M 0 ${yOffset} Q 25 ${yOffset - amplitude}, 50 ${yOffset} T 100 ${yOffset}`;
    };

    return (
        <svg
            ref={svgRef}
            className={cn("absolute inset-0 w-full h-full", className)}
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
        >
            <defs>
                <linearGradient id="parametricGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#667eea" stopOpacity="0.3" />
                    <stop offset="50%" stopColor="#764ba2" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#f093fb" stopOpacity="0.3" />
                </linearGradient>
            </defs>
            {[...Array(8)].map((_, i) => (
                <path
                    key={i}
                    ref={el => { if (el) pathRefs.current[i] = el; }}
                    d={generateCurvedPath(i, 8)}
                    fill="none"
                    stroke="url(#parametricGrad)"
                    strokeWidth="0.3"
                    opacity={0.3 + i * 0.05}
                />
            ))}
        </svg>
    );
};

const ParametricFlowContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                // Floating organic motion
                gsap.to(card, {
                    y: `${Math.sin(i) * 10}`,
                    x: `${Math.cos(i) * 5}`,
                    rotation: Math.sin(i * 0.5) * 2,
                    duration: 4 + i * 0.3,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut"
                });

                // Entrance animation
                gsap.fromTo(card,
                    { opacity: 0, scale: 0.8, y: 50 },
                    {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        duration: 0.8,
                        delay: i * 0.1,
                        ease: "power3.out"
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, [sections.length]);

    // Calculate curved positions for panels
    const getCardStyle = (index: number, total: number) => {
        const progress = index / Math.max(total - 1, 1);
        const curve = Math.sin(progress * Math.PI) * 50;
        const rotation = Math.sin(progress * Math.PI * 2) * 5;

        return {
            transform: `translateY(${curve}px) rotate(${rotation}deg)`,
            zIndex: total - Math.abs(index - total / 2)
        };
    };

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden relative">
            {/* Parametric Background */}
            <ParametricBackground />

            {/* Overlay gradient */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: `linear-gradient(135deg, ${colors.backgroundColor}dd 0%, ${colors.backgroundColor}99 50%, ${colors.backgroundColor}dd 100%)`
                }}
            />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col p-8 md:p-16">
                {/* Header */}
                <header className="flex-shrink-0 mb-12">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="Parametric"
                        className="text-6xl md:text-8xl font-extralight tracking-tight"
                        style={{
                            color: colors.textColor,
                            fontFamily: "'Inter', sans-serif"
                        }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="Flow Architecture"
                        className="text-xl md:text-2xl font-light tracking-widest uppercase mt-2 opacity-60"
                        style={{ color: colors.textColor }}
                    />

                    {/* Curved divider */}
                    <svg className="w-full h-8 mt-6" viewBox="0 0 100 10" preserveAspectRatio="none">
                        <path
                            d="M0 5 Q 25 0, 50 5 T 100 5"
                            fill="none"
                            stroke={colors.textColor}
                            strokeWidth="0.2"
                            opacity="0.3"
                        />
                    </svg>
                </header>

                {/* Flowing Cards Container */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden">
                    <div className="flex items-center gap-6 md:gap-10 h-full px-4 min-w-max">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                ref={(el) => { if (el) cardsRef.current[i] = el; }}
                                className={cn(
                                    "relative flex-shrink-0 group transition-all duration-500",
                                    "rounded-3xl overflow-hidden",
                                    "w-[280px] md:w-[350px] h-[400px] md:h-[500px]"
                                )}
                                style={{
                                    ...getCardStyle(i, sections.length),
                                    background: `linear-gradient(145deg, ${colors.backgroundColor}, ${colors.textColor}11)`,
                                    boxShadow: `0 20px 60px rgba(0,0,0,0.15), 
                                               inset 0 1px 0 rgba(255,255,255,0.1)`,
                                    border: `1px solid ${colors.textColor}15`
                                }}
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Card content */}
                                <div className="absolute inset-0">
                                    <GridSectionWrapper
                                        section={section}
                                        templateSection={{ id: section.id, name: `Flow-${i + 1}` }}
                                        isHovered={editor.hoveredSectionId === section.id}
                                        onSectionDelete={props.onSectionDelete}
                                        onSectionContentChange={props.onSectionContentChange}
                                        {...props}
                                    />
                                </div>

                                {/* Overlay info */}
                                <div
                                    className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/60 to-transparent"
                                >
                                    <EditableText
                                        sectionId={section.id}
                                        fieldId="title"
                                        defaultValue={`Curve ${String.fromCharCode(65 + i)}`}
                                        className="text-xl font-light text-white tracking-wide"
                                    />
                                    <EditableText
                                        sectionId={section.id}
                                        fieldId="description"
                                        defaultValue="Organic form language"
                                        className="text-sm text-white/60 mt-1"
                                    />
                                </div>

                                {/* Index indicator */}
                                <div
                                    className="absolute top-4 left-4 w-10 h-10 rounded-full flex items-center justify-center text-sm font-light"
                                    style={{
                                        background: `${colors.textColor}20`,
                                        color: colors.textColor
                                    }}
                                >
                                    {String(i + 1).padStart(2, '0')}
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
                        ))}

                        {/* Add button */}
                        <DynamicAddButton
                            defaultValue="+"
                            className="flex-shrink-0 w-[280px] md:w-[350px] h-[400px] md:h-[500px] rounded-3xl border-2 border-dashed hover:bg-white/5 text-4xl font-extralight"
                            style={{
                                borderColor: `${colors.textColor}30`,
                                color: `${colors.textColor}50`
                            }}
                        />
                    </div>
                </div>

                {/* Footer with flow metrics */}
                <footer className="flex-shrink-0 mt-8 flex justify-between items-center text-sm opacity-40">
                    <EditableText
                        sectionId="footer"
                        fieldId="metrics"
                        defaultValue="Bezier Curves: Active"
                        style={{ color: colors.textColor }}
                    />
                    <EditableText
                        sectionId="footer"
                        fieldId="status"
                        defaultValue="Flow State: Synchronized"
                        style={{ color: colors.textColor }}
                    />
                </footer>
            </div>
        </div>
    );
};

export const ParametricFlowLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#fafafa"
            defaultTextColor="#1a1a2e"
            {...props}
        >
            <ParametricFlowContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
