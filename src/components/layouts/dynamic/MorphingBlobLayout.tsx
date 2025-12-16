import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Generate organic blob path
const generateBlobPath = (seed: number, radius: number = 100): string => {
    const points: { x: number; y: number }[] = [];
    const numPoints = 8;
    const angleStep = (Math.PI * 2) / numPoints;

    for (let i = 0; i < numPoints; i++) {
        const angle = i * angleStep;
        const variance = 0.3 + Math.sin(seed + i) * 0.2;
        const r = radius * (0.8 + variance * 0.4);
        points.push({
            x: Math.cos(angle) * r + radius,
            y: Math.sin(angle) * r + radius,
        });
    }

    // Create smooth bezier path
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length; i++) {
        const p0 = points[i];
        const p1 = points[(i + 1) % points.length];
        const midX = (p0.x + p1.x) / 2;
        const midY = (p0.y + p1.y) / 2;
        path += ` Q ${p0.x} ${p0.y} ${midX} ${midY}`;
    }
    path += " Z";
    return path;
};

// Animated Blob Component
const AnimatedBlob: React.FC<{
    color1: string;
    color2: string;
    size: number;
    delay?: number;
    className?: string;
}> = ({ color1, color2, size, delay = 0, className }) => {
    const pathRef = useRef<SVGPathElement>(null);
    const [seed, setSeed] = useState(Math.random() * 100);

    useEffect(() => {
        if (!pathRef.current) return;

        const animate = () => {
            const newSeed = Math.random() * 100;
            const newPath = generateBlobPath(newSeed, size / 2);

            gsap.to(pathRef.current, {
                attr: { d: newPath },
                duration: 4 + Math.random() * 2,
                ease: "sine.inOut",
                onComplete: animate,
            });
        };

        const timeout = setTimeout(animate, delay * 1000);
        return () => clearTimeout(timeout);
    }, [size, delay]);

    return (
        <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className={cn("absolute", className)}
            style={{ filter: "blur(0px)" }}
        >
            <defs>
                <linearGradient id={`blobGrad-${delay}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={color1} />
                    <stop offset="100%" stopColor={color2} />
                </linearGradient>
            </defs>
            <path
                ref={pathRef}
                d={generateBlobPath(seed, size / 2)}
                fill={`url(#blobGrad-${delay})`}
                opacity="0.7"
            />
        </svg>
    );
};

const MorphingBlobContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible, layout } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);

    const blobColors = [
        { c1: "#FF6B6B", c2: "#FF8E53" },
        { c1: "#4ECDC4", c2: "#45B7D1" },
        { c1: "#A78BFA", c2: "#EC4899" },
        { c1: "#34D399", c2: "#10B981" },
        { c1: "#FBBF24", c2: "#F59E0B" },
    ];

    return (
        <div className="w-full h-full overflow-hidden relative" ref={containerRef}>
            {/* Background Blobs */}
            <div className="absolute inset-0 overflow-hidden">
                {blobColors.map((bc, i) => (
                    <AnimatedBlob
                        key={i}
                        color1={bc.c1}
                        color2={bc.c2}
                        size={300 + i * 50}
                        delay={i * 0.5}
                        className={cn(
                            "transition-transform duration-1000",
                            i === 0 && "top-[-10%] left-[-5%]",
                            i === 1 && "top-[20%] right-[-10%]",
                            i === 2 && "bottom-[-15%] left-[30%]",
                            i === 3 && "top-[50%] left-[-10%]",
                            i === 4 && "bottom-[10%] right-[-5%]"
                        )}
                    />
                ))}
            </div>

            {/* Gooey Filter Effect - Applied to content */}
            <svg className="absolute" style={{ width: 0, height: 0 }}>
                <defs>
                    <filter id="gooey">
                        <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
                        <feColorMatrix
                            in="blur"
                            mode="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
                            result="gooey"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col backdrop-blur-sm">
                {/* Header */}
                <div className="flex-shrink-0 p-8 md:p-12 text-center">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="ORGANIC FLOW"
                        className="text-5xl md:text-7xl font-black tracking-tight"
                        style={{ color: colors.textColor }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="Morphing Blob Grid"
                        className="text-lg md:text-xl font-light mt-2 opacity-70"
                        style={{ color: colors.textColor }}
                    />
                </div>

                {/* Cards Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                className="relative group"
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Card with blob-like border radius */}
                                <div
                                    className={cn(
                                        "relative overflow-hidden transition-all duration-700",
                                        "bg-white/80 dark:bg-black/40 backdrop-blur-md",
                                        "border-2 border-white/50 shadow-2xl",
                                        "group-hover:scale-[1.02] group-hover:shadow-3xl"
                                    )}
                                    style={{
                                        borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                                        aspectRatio: "1/1",
                                    }}
                                >
                                    <GridSectionWrapper
                                        section={section}
                                        templateSection={{ id: section.id, name: `Blob-${i + 1}` }}
                                        isHovered={editor.hoveredSectionId === section.id}
                                        onSectionDelete={props.onSectionDelete}
                                        onSectionContentChange={props.onSectionContentChange}
                                        {...props}
                                    />

                                    {/* Floating label */}
                                    <div
                                        className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-sm"
                                    >
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="label"
                                            defaultValue={`Blob ${i + 1}`}
                                            className="text-sm font-medium text-white whitespace-nowrap"
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <DynamicDeleteButton
                                        sectionId={section.id}
                                        className={cn(
                                            "absolute top-4 right-4 transition-opacity duration-300",
                                            editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add Button */}
                        <DynamicAddButton
                            defaultValue="Add Blob"
                            className="min-h-[250px] bg-white/30 backdrop-blur-sm border-2 border-dashed border-white/40 hover:border-purple-400/60"
                            style={{
                                borderRadius: "30% 70% 70% 30% / 30% 30% 70% 70%",
                            }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const MorphingBlobLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#fef3f2"
            defaultTextColor="#1f2937"
            {...props}
        >
            <MorphingBlobContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
