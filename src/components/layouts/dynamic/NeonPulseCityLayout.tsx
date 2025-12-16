import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Neon Grid Canvas
const NeonGridCanvas: React.FC<{ className?: string }> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        let offset = 0;
        const gridSpacing = 60;

        const animate = () => {
            ctx.fillStyle = "rgba(10, 10, 20, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Perspective grid
            const vanishY = canvas.height * 0.4;
            const horizonY = canvas.height * 0.6;

            // Horizontal lines
            ctx.strokeStyle = "rgba(0, 255, 255, 0.3)";
            ctx.lineWidth = 1;

            for (let i = 0; i < 20; i++) {
                const t = (i / 20 + offset * 0.01) % 1;
                const y = horizonY + (canvas.height - horizonY) * Math.pow(t, 1.5);
                const alpha = t * 0.5;

                ctx.beginPath();
                ctx.strokeStyle = `rgba(0, 255, 255, ${alpha})`;
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Vertical lines with perspective
            const numLines = 30;
            for (let i = -numLines / 2; i <= numLines / 2; i++) {
                const x = canvas.width / 2 + i * gridSpacing;
                const topX = canvas.width / 2 + i * gridSpacing * 0.1;

                ctx.beginPath();
                ctx.strokeStyle = `rgba(255, 0, 255, ${0.2 + Math.abs(i) * 0.02})`;
                ctx.moveTo(topX, horizonY);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Glowing sun/moon
            const gradient = ctx.createRadialGradient(
                canvas.width / 2,
                horizonY,
                0,
                canvas.width / 2,
                horizonY,
                200
            );
            gradient.addColorStop(0, "rgba(255, 100, 255, 0.8)");
            gradient.addColorStop(0.3, "rgba(255, 50, 150, 0.4)");
            gradient.addColorStop(1, "rgba(255, 0, 100, 0)");

            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(canvas.width / 2, horizonY, 200, 0, Math.PI * 2);
            ctx.fill();

            // Pulsing lines
            const pulseIntensity = Math.sin(offset * 0.05) * 0.5 + 0.5;
            ctx.strokeStyle = `rgba(0, 255, 255, ${pulseIntensity * 0.5})`;
            ctx.lineWidth = 2 + pulseIntensity * 2;
            ctx.beginPath();
            ctx.moveTo(0, horizonY);
            ctx.lineTo(canvas.width, horizonY);
            ctx.stroke();

            offset++;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full", className)} />;
};

const NeonPulseCityContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible, layout } = useDynamicLayout();
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                // Neon flicker animation
                gsap.to(card, {
                    boxShadow: `0 0 ${20 + Math.random() * 20}px rgba(0, 255, 255, 0.8), 
                      0 0 ${40 + Math.random() * 20}px rgba(255, 0, 255, 0.4),
                      inset 0 0 20px rgba(0, 255, 255, 0.1)`,
                    duration: 0.1 + Math.random() * 0.2,
                    yoyo: true,
                    repeat: -1,
                    repeatDelay: 2 + Math.random() * 3,
                });
            });
        });
        return () => ctx.revert();
    }, [sections.length]);

    return (
        <div className="w-full h-full overflow-hidden relative font-mono">
            {/* Neon Grid Background */}
            <NeonGridCanvas />

            {/* Scanlines overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-10 opacity-20"
                style={{
                    background:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                }}
            />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 p-8 md:p-12 text-center">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="NEON CITY"
                        className="text-6xl md:text-8xl font-black tracking-widest"
                        style={{
                            color: "#0ff",
                            textShadow: "0 0 10px #0ff, 0 0 20px #0ff, 0 0 40px #0ff, 0 0 80px #f0f",
                        }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="2 0 8 9"
                        className="text-2xl md:text-3xl font-light tracking-[1em] mt-4"
                        style={{
                            color: "#f0f",
                            textShadow: "0 0 10px #f0f, 0 0 20px #f0f",
                        }}
                    />
                </div>

                {/* Cards Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                ref={(el) => {
                                    if (el) cardsRef.current[i] = el;
                                }}
                                className={cn(
                                    "relative group transition-transform duration-300 hover:-translate-y-2",
                                    "border-2 border-cyan-400/60 bg-black/60 backdrop-blur-sm"
                                )}
                                style={{
                                    boxShadow: `0 0 20px rgba(0, 255, 255, 0.5), 
                              0 0 40px rgba(255, 0, 255, 0.2),
                              inset 0 0 20px rgba(0, 255, 255, 0.1)`,
                                    clipPath: "polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                                }}
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                <div className="aspect-video">
                                    <GridSectionWrapper
                                        section={section}
                                        templateSection={{ id: section.id, name: `Neon-${i + 1}` }}
                                        isHovered={editor.hoveredSectionId === section.id}
                                        onSectionDelete={props.onSectionDelete}
                                        onSectionContentChange={props.onSectionContentChange}
                                        {...props}
                                    />
                                </div>

                                {/* Neon Label */}
                                <div className="p-4 border-t border-cyan-400/30">
                                    <EditableText
                                        sectionId={section.id}
                                        fieldId="label"
                                        defaultValue={`NODE_${String(i + 1).padStart(2, "0")}`}
                                        className="text-sm font-mono uppercase tracking-widest"
                                        style={{ color: "#0ff", textShadow: "0 0 5px #0ff" }}
                                    />
                                    <EditableText
                                        sectionId={section.id}
                                        fieldId="description"
                                        defaultValue="SYSTEM ONLINE"
                                        className="text-xs font-mono mt-1 opacity-60"
                                        style={{ color: "#f0f" }}
                                    />
                                </div>

                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-400" />
                                <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-magenta-400 border-pink-400" />
                                <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-pink-400" />
                                <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-400" />

                                {/* Delete Button */}
                                <DynamicDeleteButton
                                    sectionId={section.id}
                                    className={cn(
                                        "absolute top-2 right-2 transition-opacity duration-300",
                                        editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </div>
                        ))}

                        {/* Add Button */}
                        <DynamicAddButton
                            defaultValue="+ ADD_NODE"
                            className="min-h-[200px] border-2 border-dashed border-cyan-400/40 bg-black/40 backdrop-blur-sm hover:border-cyan-400/80 font-mono"
                            style={{
                                clipPath: "polygon(0 10px, 10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)",
                            }}
                        />
                    </div>
                </div>
            </div>

            {/* CRT effect overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-30 opacity-5"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.8) 100%)",
                }}
            />
        </div>
    );
};

export const NeonPulseCityLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#0a0a14"
            defaultTextColor="#00ffff"
            {...props}
        >
            <NeonPulseCityContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
