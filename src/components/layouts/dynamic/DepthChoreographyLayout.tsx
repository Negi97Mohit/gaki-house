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

const DepthChoreographyContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<HTMLDivElement[]>([]);
    const [focusedLayer, setFocusedLayer] = useState<number>(0);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Parallax depth effect on scroll
            layersRef.current.forEach((layer, i) => {
                if (!layer) return;

                const depth = (i + 1) / sections.length;

                gsap.to(layer, {
                    scrollTrigger: {
                        trigger: containerRef.current,
                        scroller: containerRef.current,
                        start: "top top",
                        end: "bottom bottom",
                        scrub: 1,
                    },
                    y: `${-30 * depth}%`,
                    ease: "none"
                });
            });
        }, containerRef);

        return () => ctx.revert();
    }, [sections.length]);

    // Handle focus shift animation
    const handleLayerFocus = (index: number) => {
        setFocusedLayer(index);

        layersRef.current.forEach((layer, i) => {
            if (!layer) return;

            const isFocused = i === index;
            const distance = Math.abs(i - index);

            gsap.to(layer, {
                scale: isFocused ? 1.02 : 1 - distance * 0.02,
                filter: isFocused ? "blur(0px)" : `blur(${distance * 3}px)`,
                opacity: isFocused ? 1 : 1 - distance * 0.15,
                duration: 0.6,
                ease: "power2.out"
            });
        });
    };

    // Reset all layers
    const resetLayers = () => {
        layersRef.current.forEach((layer) => {
            if (!layer) return;
            gsap.to(layer, {
                scale: 1,
                filter: "blur(0px)",
                opacity: 1,
                duration: 0.4,
                ease: "power2.out"
            });
        });
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto relative"
            style={{ perspective: "1200px" }}
            onMouseLeave={resetLayers}
        >
            {/* Depth grid background */}
            <div
                className="fixed inset-0 pointer-events-none opacity-10"
                style={{
                    backgroundImage: `
                        linear-gradient(${colors.textColor}20 1px, transparent 1px),
                        linear-gradient(90deg, ${colors.textColor}20 1px, transparent 1px)
                    `,
                    backgroundSize: "50px 50px",
                    transform: "perspective(500px) rotateX(60deg)",
                    transformOrigin: "top center"
                }}
            />

            {/* Vignette */}
            <div
                className="fixed inset-0 pointer-events-none z-50"
                style={{
                    background: `radial-gradient(ellipse at center, transparent 40%, ${colors.backgroundColor} 100%)`
                }}
            />

            {/* Content layers */}
            <div className="relative z-10 min-h-full">
                {/* Header */}
                <header className="sticky top-0 z-40 p-8 md:p-12 bg-gradient-to-b from-black/80 to-transparent">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="DEPTH"
                        className="text-5xl md:text-7xl font-black tracking-[0.2em]"
                        style={{
                            color: colors.textColor,
                            textShadow: `0 0 40px ${colors.backgroundColor}`
                        }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="CHOREOGRAPHY"
                        className="text-xl md:text-2xl font-extralight tracking-[0.5em] opacity-60"
                        style={{ color: colors.textColor }}
                    />
                </header>

                {/* Layered sections */}
                <div className="px-8 md:px-16 pb-32 space-y-8">
                    {sections.map((section, i) => {
                        const depth = i / Math.max(sections.length - 1, 1);
                        const zIndex = sections.length - i;

                        return (
                            <div
                                key={section.id}
                                ref={(el) => { if (el) layersRef.current[i] = el; }}
                                className={cn(
                                    "relative group transition-all duration-500",
                                    "rounded-lg overflow-hidden cursor-pointer"
                                )}
                                style={{
                                    zIndex,
                                    transform: `translateZ(${-depth * 200}px)`,
                                    boxShadow: `
                                        0 ${10 + i * 5}px ${30 + i * 10}px rgba(0,0,0,${0.2 + depth * 0.2}),
                                        inset 0 1px 0 rgba(255,255,255,0.1)
                                    `,
                                    background: colors.backgroundColor
                                }}
                                onClick={() => handleLayerFocus(i)}
                                onMouseEnter={() => {
                                    editor.setHoveredSectionId(section.id);
                                    handleLayerFocus(i);
                                }}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Layer indicator */}
                                <div
                                    className="absolute top-0 left-0 z-20 px-4 py-2 text-xs font-mono tracking-widest"
                                    style={{
                                        background: `linear-gradient(90deg, ${colors.textColor}40, transparent)`,
                                        color: colors.textColor
                                    }}
                                >
                                    LAYER {String(i + 1).padStart(2, "0")} — Z:{zIndex}
                                </div>

                                {/* Content area */}
                                <div className="aspect-[21/9] md:aspect-[3/1]">
                                    <GridSectionWrapper
                                        section={section}
                                        templateSection={{ id: section.id, name: `Depth-${i + 1}` }}
                                        isHovered={editor.hoveredSectionId === section.id}
                                        onSectionDelete={props.onSectionDelete}
                                        onSectionContentChange={props.onSectionContentChange}
                                        {...props}
                                    />
                                </div>

                                {/* Info overlay */}
                                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <EditableText
                                                sectionId={section.id}
                                                fieldId="title"
                                                defaultValue={`Scene ${i + 1}`}
                                                className="text-xl md:text-2xl font-medium text-white"
                                            />
                                            <EditableText
                                                sectionId={section.id}
                                                fieldId="description"
                                                defaultValue="Focus to reveal"
                                                className="text-sm text-white/60 mt-1"
                                            />
                                        </div>
                                        <div className="text-right text-white/40 text-xs font-mono">
                                            <div>DEPTH: {(depth * 100).toFixed(0)}%</div>
                                            <div>FOCUS: {focusedLayer === i ? "ACTIVE" : "STANDBY"}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Corner depth indicators */}
                                <div className="absolute top-4 right-4 flex gap-1">
                                    {[...Array(sections.length)].map((_, j) => (
                                        <div
                                            key={j}
                                            className="w-2 h-2 rounded-full transition-all duration-300"
                                            style={{
                                                background: j === i ? colors.textColor : `${colors.textColor}30`,
                                                transform: j === focusedLayer ? "scale(1.5)" : "scale(1)"
                                            }}
                                        />
                                    ))}
                                </div>

                                {/* Delete button */}
                                <DynamicDeleteButton
                                    sectionId={section.id}
                                    className={cn(
                                        "absolute bottom-4 right-4 transition-opacity duration-300",
                                        editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </div>
                        );
                    })}

                    {/* Add button */}
                    <DynamicAddButton
                        defaultValue="+ NEW LAYER"
                        className="w-full h-32 border-2 border-dashed rounded-lg hover:bg-white/5 font-mono tracking-widest"
                        style={{
                            borderColor: `${colors.textColor}30`,
                            color: `${colors.textColor}50`
                        }}
                    />
                </div>

                {/* Footer */}
                <footer
                    className="sticky bottom-0 p-6 bg-gradient-to-t from-black/80 to-transparent flex justify-between items-center text-xs font-mono"
                    style={{ color: `${colors.textColor}60` }}
                >
                    <EditableText
                        sectionId="footer"
                        fieldId="left"
                        defaultValue="FOCAL PLANE: DYNAMIC"
                        className="tracking-widest"
                    />
                    <EditableText
                        sectionId="footer"
                        fieldId="right"
                        defaultValue="DEPTH OF FIELD: CINEMATIC"
                        className="tracking-widest"
                    />
                </footer>
            </div>
        </div>
    );
};

export const DepthChoreographyLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#0a0a0f"
            defaultTextColor="#e8e8f0"
            {...props}
        >
            <DepthChoreographyContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
