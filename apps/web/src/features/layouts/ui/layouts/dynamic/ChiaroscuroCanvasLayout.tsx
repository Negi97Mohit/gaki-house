import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@caption-cam/core/types/caption";
import { cn } from "@caption-cam/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Dynamic lighting canvas with mouse tracking
const LightingCanvas: React.FC<{
    className?: string;
    mousePos: { x: number; y: number };
    colors: { textColor: string };
}> = ({ className, mousePos, colors }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        // Clear
        ctx.fillStyle = "#0a0806";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Spotlight gradient following mouse
        const gradient = ctx.createRadialGradient(
            mousePos.x, mousePos.y, 0,
            mousePos.x, mousePos.y, 400
        );
        gradient.addColorStop(0, "rgba(255, 220, 180, 0.4)");
        gradient.addColorStop(0.3, "rgba(255, 180, 120, 0.15)");
        gradient.addColorStop(0.7, "rgba(200, 150, 100, 0.05)");
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Secondary ambient light
        const ambient = ctx.createRadialGradient(
            canvas.width * 0.8, canvas.height * 0.2, 0,
            canvas.width * 0.8, canvas.height * 0.2, 600
        );
        ambient.addColorStop(0, "rgba(100, 80, 60, 0.1)");
        ambient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = ambient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, [mousePos, colors]);

    return <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full", className)} />;
};

const ChiaroscuroCanvasContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Track mouse for spotlight effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                // Dramatic emergence from shadow
                gsap.fromTo(card,
                    {
                        opacity: 0,
                        y: 50,
                        filter: "brightness(0)"
                    },
                    {
                        opacity: 1,
                        y: 0,
                        filter: "brightness(1)",
                        duration: 1.2,
                        delay: i * 0.3,
                        ease: "power2.out"
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, [sections.length]);

    // Calculate light intensity based on distance from mouse
    const getLightIntensity = (cardRect: DOMRect | undefined) => {
        if (!cardRect) return 0.3;

        const cardCenterX = cardRect.left + cardRect.width / 2;
        const cardCenterY = cardRect.top + cardRect.height / 2;
        const distance = Math.sqrt(
            Math.pow(mousePos.x - cardCenterX, 2) +
            Math.pow(mousePos.y - cardCenterY, 2)
        );

        return Math.max(0.3, 1 - distance / 600);
    };

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden relative"
        >
            {/* Dynamic Lighting Background */}
            <LightingCanvas mousePos={mousePos} colors={colors} />

            {/* Content */}
            <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-16">
                {/* Header */}
                <header className="flex-shrink-0 mb-12 text-center">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="CHIAROSCURO"
                        className="text-5xl md:text-8xl font-extralight tracking-[0.2em]"
                        style={{
                            color: "#d4a574",
                            fontFamily: "'Playfair Display', serif",
                            textShadow: "0 0 60px rgba(212, 165, 116, 0.3)"
                        }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="Light & Shadow"
                        className="text-lg md:text-xl font-light tracking-[0.5em] uppercase mt-4"
                        style={{ color: "rgba(212, 165, 116, 0.5)" }}
                    />
                </header>

                {/* Gallery Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                        {sections.map((section, i) => {
                            const cardRef = cardsRef.current[i];
                            const rect = cardRef?.getBoundingClientRect();
                            const intensity = getLightIntensity(rect);

                            return (
                                <div
                                    key={section.id}
                                    ref={(el) => { if (el) cardsRef.current[i] = el; }}
                                    className={cn(
                                        "relative group cursor-pointer",
                                        "transition-all duration-500",
                                        i % 4 === 0 && "md:col-span-2"
                                    )}
                                    style={{
                                        filter: `brightness(${0.5 + intensity * 0.5})`,
                                    }}
                                    onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                    onMouseLeave={() => editor.setHoveredSectionId(null)}
                                >
                                    {/* Frame with Renaissance-style border */}
                                    <div
                                        className="relative overflow-hidden"
                                        style={{
                                            boxShadow: `
                                                0 0 ${30 * intensity}px rgba(212, 165, 116, ${intensity * 0.3}),
                                                inset 0 0 100px rgba(0, 0, 0, 0.5)
                                            `,
                                            border: "4px solid #2a2014"
                                        }}
                                    >
                                        {/* Ornate corner decorations */}
                                        <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-amber-600/30 m-2" />
                                        <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-amber-600/30 m-2" />
                                        <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-amber-600/30 m-2" />
                                        <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-amber-600/30 m-2" />

                                        {/* Content */}
                                        <div className={cn("aspect-[4/5]", i % 4 === 0 && "md:aspect-video")}>
                                            <GridSectionWrapper
                                                section={section}
                                                templateSection={{ id: section.id, name: `Canvas-${i + 1}` }}
                                                isHovered={editor.hoveredSectionId === section.id}
                                                onSectionDelete={props.onSectionDelete}
                                                onSectionContentChange={props.onSectionContentChange}
                                                {...props}
                                            />
                                        </div>

                                        {/* Spotlight overlay */}
                                        <div
                                            className="absolute inset-0 pointer-events-none"
                                            style={{
                                                background: `radial-gradient(circle at ${(mousePos.x - (rect?.left || 0)) / (rect?.width || 1) * 100}% ${(mousePos.y - (rect?.top || 0)) / (rect?.height || 1) * 100}%, transparent 20%, rgba(0,0,0,0.6) 80%)`
                                            }}
                                        />
                                    </div>

                                    {/* Plaque */}
                                    <div
                                        className="mt-4 p-4 text-center"
                                        style={{
                                            background: "linear-gradient(180deg, #1a1408 0%, #0d0a04 100%)",
                                            borderTop: "1px solid #3a2a14"
                                        }}
                                    >
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="title"
                                            defaultValue={`Study ${i + 1}`}
                                            className="text-lg font-light"
                                            style={{
                                                color: "#d4a574",
                                                fontFamily: "'Playfair Display', serif"
                                            }}
                                        />
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="medium"
                                            defaultValue="Oil on Canvas"
                                            className="text-xs tracking-widest mt-1"
                                            style={{ color: "rgba(212, 165, 116, 0.4)" }}
                                        />
                                    </div>

                                    {/* Delete button */}
                                    <DynamicDeleteButton
                                        sectionId={section.id}
                                        className={cn(
                                            "absolute top-4 right-4 transition-opacity duration-300 z-10",
                                            editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>
                            );
                        })}

                        {/* Add button */}
                        <DynamicAddButton
                            defaultValue="+ NEW STUDY"
                            className="min-h-[300px] border-2 border-dashed hover:bg-amber-900/10 font-light tracking-[0.3em]"
                            style={{
                                borderColor: "#3a2a14",
                                color: "#d4a574"
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex-shrink-0 mt-12 pt-4 border-t flex justify-center"
                    style={{ borderColor: "#2a2014" }}>
                    <EditableText
                        sectionId="footer"
                        fieldId="quote"
                        defaultValue="The sfumato of the soul lies in the gradation of light"
                        className="text-sm font-light italic tracking-wide text-center max-w-lg"
                        style={{ color: "rgba(212, 165, 116, 0.5)" }}
                    />
                </footer>
            </div>
        </div>
    );
};

export const ChiaroscuroCanvasLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#0a0806"
            defaultTextColor="#d4a574"
            {...props}
        >
            <ChiaroscuroCanvasContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
