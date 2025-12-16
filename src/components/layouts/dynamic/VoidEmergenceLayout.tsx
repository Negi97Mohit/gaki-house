import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Void particle canvas
const VoidCanvas: React.FC<{ className?: string }> = ({ className }) => {
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

        const particles: { x: number; y: number; vx: number; vy: number; life: number }[] = [];
        const centerX = () => canvas.width / 2;
        const centerY = () => canvas.height / 2;

        const animate = () => {
            ctx.fillStyle = "rgba(8, 5, 15, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Central void glow
            const gradient = ctx.createRadialGradient(centerX(), centerY(), 0, centerX(), centerY(), 300);
            gradient.addColorStop(0, "rgba(100, 50, 200, 0.3)");
            gradient.addColorStop(0.5, "rgba(50, 30, 100, 0.1)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Emit particles
            if (Math.random() > 0.7) {
                const angle = Math.random() * Math.PI * 2;
                particles.push({
                    x: centerX(),
                    y: centerY(),
                    vx: Math.cos(angle) * (2 + Math.random() * 3),
                    vy: Math.sin(angle) * (2 + Math.random() * 3),
                    life: 1
                });
            }

            // Update and draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.01;

                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.fillStyle = `rgba(150, 100, 255, ${p.life * 0.5})`;
                ctx.arc(p.x, p.y, 2 * p.life, 0, Math.PI * 2);
                ctx.fill();
            }

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

const VoidEmergenceContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections, ...props
}) => {
    const { colors, editor, controlsVisible } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const [emerged, setEmerged] = useState(false);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Emergence from center with physics-like motion
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                const angle = (i / sections.length) * Math.PI * 2;
                const distance = 150 + Math.random() * 100;

                gsap.fromTo(card,
                    { opacity: 0, scale: 0, x: 0, y: 0 },
                    {
                        opacity: 1, scale: 1,
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance,
                        duration: 1,
                        delay: 0.5 + i * 0.1,
                        ease: "elastic.out(1, 0.5)"
                    }
                );
            });
            setEmerged(true);
        }, containerRef);
        return () => ctx.revert();
    }, [sections.length]);

    const triggerEmergence = () => {
        cardsRef.current.forEach((card, i) => {
            if (!card) return;
            const angle = (i / sections.length) * Math.PI * 2;
            const distance = 150 + Math.random() * 100;

            gsap.to(card, {
                x: 0, y: 0, scale: 0.3, opacity: 0.5,
                duration: 0.5, ease: "power2.in",
                onComplete: () => {
                    gsap.to(card, {
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance,
                        scale: 1, opacity: 1,
                        duration: 0.8,
                        ease: "elastic.out(1, 0.5)"
                    });
                }
            });
        });
    };

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden relative">
            <VoidCanvas />

            <div className="relative z-10 w-full h-full flex flex-col p-8">
                <header className="flex-shrink-0 mb-8 text-center">
                    <EditableText sectionId="header" fieldId="title" defaultValue="VOID"
                        className="text-6xl md:text-8xl font-black tracking-[0.3em]"
                        style={{ color: "#a78bfa", textShadow: "0 0 40px rgba(167, 139, 250, 0.5)" }} />
                    <EditableText sectionId="header" fieldId="subtitle" defaultValue="EMERGENCE"
                        className="text-xl tracking-[0.5em] opacity-50 text-purple-300" />
                </header>

                <div className="flex-1 flex items-center justify-center relative">
                    {/* Central void */}
                    <button onClick={triggerEmergence}
                        className="absolute w-24 h-24 rounded-full bg-purple-900/30 border border-purple-500/30 flex items-center justify-center cursor-pointer hover:bg-purple-800/40 transition-all z-20">
                        <span className="text-purple-300 text-xs font-mono">TRIGGER</span>
                    </button>

                    {/* Emerged cards */}
                    {sections.map((section, i) => (
                        <div key={section.id}
                            ref={(el) => { if (el) cardsRef.current[i] = el; }}
                            className="absolute w-48 h-64 md:w-56 md:h-72 cursor-pointer group border border-purple-500/30 bg-black/60 backdrop-blur-sm rounded-lg overflow-hidden"
                            style={{
                                left: "50%", top: "50%",
                                marginLeft: "-6rem", marginTop: "-8rem",
                                boxShadow: "0 0 30px rgba(139, 92, 246, 0.2)"
                            }}
                            onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                            onMouseLeave={() => editor.setHoveredSectionId(null)}>

                            <div className="absolute inset-0">
                                <GridSectionWrapper section={section}
                                    templateSection={{ id: section.id, name: `Entity-${i + 1}` }}
                                    isHovered={editor.hoveredSectionId === section.id}
                                    onSectionDelete={props.onSectionDelete}
                                    onSectionContentChange={props.onSectionContentChange}
                                    {...props} />
                            </div>

                            <div className="absolute top-2 left-2 px-2 py-1 text-[10px] font-mono bg-purple-900/50 text-purple-300">
                                ENTITY {String(i + 1).padStart(2, "0")}
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                                <EditableText sectionId={section.id} fieldId="title" defaultValue={`Form ${i + 1}`}
                                    className="text-sm font-light text-purple-200" />
                            </div>

                            <DynamicDeleteButton sectionId={section.id}
                                className={cn("absolute top-2 right-2", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />
                        </div>
                    ))}
                </div>

                <div className="flex-shrink-0 flex justify-center">
                    <DynamicAddButton defaultValue="+ MANIFEST"
                        className="px-6 py-3 border border-purple-500/40 text-purple-300 text-sm font-mono hover:bg-purple-900/20" />
                </div>

                <footer className="flex-shrink-0 mt-6 text-center text-xs font-mono text-purple-400/40">
                    <EditableText sectionId="footer" fieldId="status" defaultValue="ENTITIES EMERGED FROM THE SINGULARITY" />
                </footer>
            </div>
        </div>
    );
};

export const VoidEmergenceLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper layout={props.layout} onLayoutUpdate={props.onLayoutUpdate}
            sections={sections} defaultBackgroundColor="#08050f" defaultTextColor="#c4b5fd" {...props}>
            <VoidEmergenceContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
