import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Liquid Mirror WebGL Canvas
const LiquidMirrorCanvas: React.FC<{ className?: string }> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const mouseRef = useRef({ x: 0, y: 0 });
    const ripplesRef = useRef<{ x: number; y: number; time: number; strength: number }[]>([]);

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

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };

        const handleClick = (e: MouseEvent) => {
            ripplesRef.current.push({
                x: e.clientX,
                y: e.clientY,
                time: 0,
                strength: 1,
            });
        };

        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("click", handleClick);

        let time = 0;

        const animate = () => {
            // Base gradient
            const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
            gradient.addColorStop(0, "#1a365d");
            gradient.addColorStop(0.5, "#2a4365");
            gradient.addColorStop(1, "#1a365d");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw water waves
            for (let y = 0; y < canvas.height; y += 4) {
                const waveOffset =
                    Math.sin(y * 0.02 + time * 0.03) * 10 +
                    Math.sin(y * 0.01 + time * 0.02) * 5;

                // Mouse influence
                const distToMouse = Math.abs(y - mouseRef.current.y);
                const mouseInfluence = Math.max(0, 100 - distToMouse) / 100;
                const mouseWave = Math.sin((y - mouseRef.current.y) * 0.1) * 20 * mouseInfluence;

                ctx.strokeStyle = `rgba(100, 150, 200, ${0.1 + mouseInfluence * 0.2})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, y);

                for (let x = 0; x < canvas.width; x += 10) {
                    const xWave =
                        Math.sin(x * 0.02 + time * 0.02 + y * 0.01) * 3 +
                        waveOffset +
                        mouseWave * Math.sin(x * 0.05);
                    ctx.lineTo(x, y + xWave);
                }
                ctx.stroke();
            }

            // Draw ripples
            ripplesRef.current = ripplesRef.current.filter((ripple) => {
                ripple.time += 1;
                const radius = ripple.time * 3;
                const alpha = Math.max(0, 1 - ripple.time / 100);

                if (alpha <= 0) return false;

                for (let ring = 0; ring < 3; ring++) {
                    const r = radius + ring * 10;
                    ctx.strokeStyle = `rgba(150, 200, 255, ${alpha * 0.5})`;
                    ctx.lineWidth = 2 - ring * 0.5;
                    ctx.beginPath();
                    ctx.arc(ripple.x, ripple.y, r, 0, Math.PI * 2);
                    ctx.stroke();
                }

                return true;
            });

            // Shimmer highlights
            for (let i = 0; i < 10; i++) {
                const x = (Math.sin(time * 0.01 + i) * 0.5 + 0.5) * canvas.width;
                const y = (Math.cos(time * 0.01 + i * 2) * 0.5 + 0.5) * canvas.height;
                const size = 50 + Math.sin(time * 0.02 + i) * 20;

                const shimmer = ctx.createRadialGradient(x, y, 0, x, y, size);
                shimmer.addColorStop(0, "rgba(255, 255, 255, 0.1)");
                shimmer.addColorStop(1, "rgba(255, 255, 255, 0)");
                ctx.fillStyle = shimmer;
                ctx.beginPath();
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            }

            time++;
            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("click", handleClick);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full", className)} />;
};

const LiquidMirrorContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible, layout } = useDynamicLayout();
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                // Floating animation
                gsap.to(card, {
                    y: "+=15",
                    rotateY: "+=2",
                    rotateX: "+=1",
                    duration: 3 + Math.random() * 2,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut",
                    delay: i * 0.3,
                });
            });
        });
        return () => ctx.revert();
    }, [sections.length]);

    return (
        <div className="w-full h-full overflow-hidden relative">
            {/* Liquid Background */}
            <LiquidMirrorCanvas />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col" style={{ perspective: "1200px" }}>
                {/* Header */}
                <div className="flex-shrink-0 p-8 md:p-12 text-center">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="LIQUID"
                        className="text-6xl md:text-8xl font-thin tracking-[0.3em]"
                        style={{
                            color: "rgba(255,255,255,0.9)",
                            textShadow: "0 0 40px rgba(100,150,255,0.5)",
                        }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="Mirror Surface"
                        className="text-xl md:text-2xl font-extralight tracking-widest mt-4"
                        style={{ color: "rgba(200,220,255,0.7)" }}
                    />
                    <p className="text-sm mt-6 text-white/40">Click anywhere to create ripples</p>
                </div>

                {/* Cards Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                ref={(el) => {
                                    if (el) cardsRef.current[i] = el;
                                }}
                                className="relative group"
                                style={{ transformStyle: "preserve-3d" }}
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Glass Card */}
                                <div
                                    className={cn(
                                        "relative rounded-xl overflow-hidden transition-all duration-500",
                                        "backdrop-blur-xl bg-white/5 border border-white/10",
                                        "group-hover:bg-white/10 group-hover:border-white/20",
                                        "shadow-[0_8px_32px_rgba(0,100,200,0.2)]",
                                        "group-hover:shadow-[0_16px_48px_rgba(0,100,200,0.3)]"
                                    )}
                                >
                                    {/* Reflection effect */}
                                    <div
                                        className="absolute inset-0 opacity-30 pointer-events-none"
                                        style={{
                                            background:
                                                "linear-gradient(180deg, rgba(255,255,255,0.2) 0%, transparent 30%, transparent 70%, rgba(100,150,200,0.1) 100%)",
                                        }}
                                    />

                                    <div className="aspect-video relative">
                                        <GridSectionWrapper
                                            section={section}
                                            templateSection={{ id: section.id, name: `Liquid-${i + 1}` }}
                                            isHovered={editor.hoveredSectionId === section.id}
                                            onSectionDelete={props.onSectionDelete}
                                            onSectionContentChange={props.onSectionContentChange}
                                            {...props}
                                        />
                                    </div>

                                    {/* Label */}
                                    <div className="p-4 border-t border-white/10">
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="label"
                                            defaultValue={`Reflection ${i + 1}`}
                                            className="text-sm font-light text-white/80"
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <DynamicDeleteButton
                                        sectionId={section.id}
                                        className={cn(
                                            "absolute top-3 right-3 transition-opacity duration-300",
                                            editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>

                                {/* Reflection beneath */}
                                <div
                                    className="absolute left-2 right-2 h-20 -bottom-16 rounded-xl opacity-30 blur-sm"
                                    style={{
                                        background: "linear-gradient(to bottom, rgba(100,150,200,0.3), transparent)",
                                        transform: "scaleY(-0.3) rotateX(180deg)",
                                    }}
                                />
                            </div>
                        ))}

                        {/* Add Button */}
                        <DynamicAddButton
                            defaultValue="Add Reflection"
                            className="min-h-[200px] rounded-xl bg-white/5 backdrop-blur-sm border border-dashed border-white/20 hover:border-blue-400/50"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export const LiquidMirrorLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#1a365d"
            defaultTextColor="#ffffff"
            {...props}
        >
            <LiquidMirrorContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
