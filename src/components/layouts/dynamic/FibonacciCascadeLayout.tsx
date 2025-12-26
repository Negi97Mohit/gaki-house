import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/shared/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Golden ratio constant
const PHI = 1.618033988749;

// Fibonacci spiral canvas background
const FibonacciCanvas: React.FC<{ className?: string }> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            draw();
        };

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Draw Fibonacci spiral
            const centerX = canvas.width * 0.6;
            const centerY = canvas.height * 0.5;
            const scale = Math.min(canvas.width, canvas.height) * 0.4;

            // Golden spiral using Fibonacci sequence
            ctx.strokeStyle = "rgba(212, 175, 55, 0.15)";
            ctx.lineWidth = 2;
            ctx.beginPath();

            const fibSequence = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55];
            let angle = 0;
            let prevX = centerX;
            let prevY = centerY;

            for (let i = 0; i < 400; i++) {
                const r = Math.pow(PHI, (i * 0.05)) * 2;
                angle += 0.1;
                const x = centerX + Math.cos(angle) * r;
                const y = centerY + Math.sin(angle) * r;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.stroke();

            // Draw golden rectangles
            ctx.strokeStyle = "rgba(212, 175, 55, 0.08)";
            ctx.lineWidth = 1;

            let size = scale * 0.5;
            let x = centerX - size / 2;
            let y = centerY - size / 2;

            for (let i = 0; i < 8; i++) {
                ctx.strokeRect(x, y, size, size);

                const nextSize = size / PHI;
                switch (i % 4) {
                    case 0: x += size - nextSize; break;
                    case 1: y += size - nextSize; break;
                    case 2: break;
                    case 3: break;
                }
                size = nextSize;
            }

            // Phi ratio markers
            ctx.fillStyle = "rgba(212, 175, 55, 0.3)";
            ctx.font = "10px monospace";
            ctx.fillText(`φ = ${PHI.toFixed(6)}`, 20, canvas.height - 20);
        };

        resize();
        window.addEventListener("resize", resize);

        return () => window.removeEventListener("resize", resize);
    }, []);

    return <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full", className)} />;
};

const FibonacciCascadeContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
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

                // Entrance along spiral path
                const angle = (i / sections.length) * Math.PI * 2;
                const startX = Math.cos(angle) * 100;
                const startY = Math.sin(angle) * 100;

                gsap.fromTo(card,
                    {
                        opacity: 0,
                        x: startX,
                        y: startY,
                        scale: 0.5,
                        rotation: -10 + i * 5
                    },
                    {
                        opacity: 1,
                        x: 0,
                        y: 0,
                        scale: 1,
                        rotation: 0,
                        duration: 0.8,
                        delay: i * 0.15,
                        ease: "power3.out"
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, [sections.length]);

    // Calculate Fibonacci-based sizes
    const getFibonacciSize = (index: number) => {
        const fib = [1, 1, 2, 3, 5, 8];
        const fibIndex = index % fib.length;
        const baseSize = 150;
        return baseSize * (fib[fibIndex] / 8 + 0.5);
    };

    // Calculate spiral position
    const getSpiralPosition = (index: number, total: number) => {
        const angle = (index / total) * Math.PI * 1.5;
        const radius = 20 + index * 15;
        return {
            transform: `translateX(${Math.cos(angle) * radius}px) translateY(${Math.sin(angle) * radius}px)`,
        };
    };

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden relative">
            {/* Fibonacci Background */}
            <FibonacciCanvas />

            {/* Overlay */}
            <div
                className="absolute inset-0 z-10"
                style={{
                    background: `radial-gradient(ellipse at 60% 50%, transparent 30%, ${colors.backgroundColor}ee 80%)`
                }}
            />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col p-8 md:p-12">
                {/* Header */}
                <header className="flex-shrink-0 mb-8">
                    <div className="flex items-baseline gap-4">
                        <EditableText
                            sectionId="header"
                            fieldId="title"
                            defaultValue="FIBONACCI"
                            className="text-5xl md:text-7xl font-extralight tracking-widest"
                            style={{
                                color: colors.textColor,
                                fontFamily: "'Playfair Display', serif"
                            }}
                        />
                        <span
                            className="text-3xl md:text-5xl font-light opacity-30"
                            style={{ color: "#d4af37" }}
                        >
                            φ
                        </span>
                    </div>
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="The Golden Cascade"
                        className="text-lg md:text-xl font-light tracking-[0.3em] uppercase opacity-50 mt-2"
                        style={{ color: colors.textColor }}
                    />
                </header>

                {/* Fibonacci Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 auto-rows-min">
                        {sections.map((section, i) => {
                            const size = getFibonacciSize(i);
                            const isLarge = i % 5 === 0;
                            const isMedium = i % 3 === 0 && !isLarge;

                            return (
                                <div
                                    key={section.id}
                                    ref={(el) => { if (el) cardsRef.current[i] = el; }}
                                    className={cn(
                                        "relative group transition-all duration-500 hover:z-10",
                                        isLarge && "col-span-2 row-span-2",
                                        isMedium && "col-span-2"
                                    )}
                                    style={{
                                        ...getSpiralPosition(i, sections.length),
                                        aspectRatio: isLarge ? "1" : isMedium ? "2/1" : "1",
                                    }}
                                    onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                    onMouseLeave={() => editor.setHoveredSectionId(null)}
                                >
                                    {/* Golden ratio frame */}
                                    <div
                                        className="absolute inset-0 border transition-all duration-300 group-hover:border-2"
                                        style={{
                                            borderColor: "#d4af37",
                                            opacity: 0.3
                                        }}
                                    />

                                    {/* Content */}
                                    <div className="absolute inset-2 overflow-hidden">
                                        <GridSectionWrapper
                                            section={section}
                                            templateSection={{ id: section.id, name: `Fib-${i + 1}` }}
                                            isHovered={editor.hoveredSectionId === section.id}
                                            onSectionDelete={props.onSectionDelete}
                                            onSectionContentChange={props.onSectionContentChange}
                                            {...props}
                                        />
                                    </div>

                                    {/* Ratio indicator */}
                                    <div
                                        className="absolute top-1 left-1 px-2 py-1 text-[10px] font-mono"
                                        style={{
                                            background: `${colors.backgroundColor}cc`,
                                            color: "#d4af37"
                                        }}
                                    >
                                        {(PHI ** (i % 5)).toFixed(2)}
                                    </div>

                                    {/* Label */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/50 to-transparent">
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="title"
                                            defaultValue={`Sequence ${i + 1}`}
                                            className="text-sm font-light text-white"
                                        />
                                    </div>

                                    {/* Delete button */}
                                    <DynamicDeleteButton
                                        sectionId={section.id}
                                        className={cn(
                                            "absolute top-1 right-1 transition-opacity duration-300",
                                            editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>
                            );
                        })}

                        {/* Add button */}
                        <DynamicAddButton
                            defaultValue="+ φ"
                            className="min-h-[150px] border border-dashed hover:bg-amber-500/5 text-2xl font-extralight"
                            style={{
                                borderColor: "#d4af3740",
                                color: "#d4af37"
                            }}
                        />
                    </div>
                </div>

                {/* Footer with sequence */}
                <footer className="flex-shrink-0 mt-8 pt-4 border-t flex justify-between items-center"
                    style={{ borderColor: `${colors.textColor}20` }}>
                    <EditableText
                        sectionId="footer"
                        fieldId="sequence"
                        defaultValue="1, 1, 2, 3, 5, 8, 13, 21, 34..."
                        className="text-xs font-mono tracking-widest opacity-40"
                        style={{ color: colors.textColor }}
                    />
                    <div className="text-xs font-mono opacity-40" style={{ color: "#d4af37" }}>
                        φ = 1.618...
                    </div>
                </footer>
            </div>
        </div>
    );
};

export const FibonacciCascadeLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#faf8f5"
            defaultTextColor="#2c2418"
            {...props}
        >
            <FibonacciCascadeContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
