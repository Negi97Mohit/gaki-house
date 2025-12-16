import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    connections: number[];
}

// Particle Universe Canvas
const ParticleUniverseCanvas: React.FC<{ className?: string }> = ({ className }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -1000, y: -1000 });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            particlesRef.current = [];
            const numParticles = Math.min(150, Math.floor((canvas.width * canvas.height) / 15000));

            for (let i = 0; i < numParticles; i++) {
                const hue = 200 + Math.random() * 80; // Blue to purple range
                particlesRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: 1 + Math.random() * 2,
                    color: `hsla(${hue}, 70%, 60%, 0.8)`,
                    connections: [],
                });
            }
        };

        resize();
        window.addEventListener("resize", resize);

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener("mousemove", handleMouseMove);

        const animate = () => {
            ctx.fillStyle = "rgba(5, 5, 20, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;
            const connectionDistance = 120;
            const mouseRadius = 200;

            // Update and draw particles
            particles.forEach((p, i) => {
                // Mouse attraction/repulsion
                const dx = mouse.x - p.x;
                const dy = mouse.y - p.y;
                const distToMouse = Math.sqrt(dx * dx + dy * dy);

                if (distToMouse < mouseRadius) {
                    const force = (mouseRadius - distToMouse) / mouseRadius * 0.02;
                    p.vx += dx * force;
                    p.vy += dy * force;
                }

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Damping
                p.vx *= 0.99;
                p.vy *= 0.99;

                // Wrap around edges
                if (p.x < 0) p.x = canvas.width;
                if (p.x > canvas.width) p.x = 0;
                if (p.y < 0) p.y = canvas.height;
                if (p.y > canvas.height) p.y = 0;

                // Draw connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const connDx = p2.x - p.x;
                    const connDy = p2.y - p.y;
                    const dist = Math.sqrt(connDx * connDx + connDy * connDy);

                    if (dist < connectionDistance) {
                        const alpha = (1 - dist / connectionDistance) * 0.3;
                        ctx.strokeStyle = `rgba(100, 150, 255, ${alpha})`;
                        ctx.lineWidth = 0.5;
                        ctx.beginPath();
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }

                // Draw particle
                const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
                gradient.addColorStop(0, p.color);
                gradient.addColorStop(1, "transparent");
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
                ctx.fill();
            });

            // Draw mouse glow
            if (mouse.x > 0) {
                const mouseGlow = ctx.createRadialGradient(
                    mouse.x,
                    mouse.y,
                    0,
                    mouse.x,
                    mouse.y,
                    100
                );
                mouseGlow.addColorStop(0, "rgba(100, 150, 255, 0.1)");
                mouseGlow.addColorStop(1, "transparent");
                ctx.fillStyle = mouseGlow;
                ctx.beginPath();
                ctx.arc(mouse.x, mouse.y, 100, 0, Math.PI * 2);
                ctx.fill();
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    return <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full", className)} />;
};

const ParticleUniverseContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible, layout } = useDynamicLayout();
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                // Orbit animation
                const angle = (i / sections.length) * Math.PI * 2;
                const radius = 5;

                gsap.to(card, {
                    x: Math.cos(angle + Date.now() * 0.001) * radius,
                    y: Math.sin(angle + Date.now() * 0.001) * radius,
                    duration: 6 + i,
                    repeat: -1,
                    yoyo: true,
                    ease: "sine.inOut",
                });
            });
        });
        return () => ctx.revert();
    }, [sections.length]);

    return (
        <div className="w-full h-full overflow-hidden relative">
            {/* Particle Background */}
            <ParticleUniverseCanvas />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 p-8 md:p-12 text-center">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="UNIVERSE"
                        className="text-6xl md:text-8xl font-thin tracking-[0.5em]"
                        style={{
                            color: "rgba(255,255,255,0.9)",
                            textShadow: "0 0 60px rgba(100,150,255,0.5), 0 0 120px rgba(100,150,255,0.3)",
                        }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="Infinite Particles"
                        className="text-xl md:text-2xl font-extralight tracking-[0.3em] mt-4"
                        style={{ color: "rgba(150,180,255,0.6)" }}
                    />
                </div>

                {/* Cards Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-8">
                    <div className="flex flex-wrap justify-center gap-8 max-w-6xl mx-auto">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                ref={(el) => {
                                    if (el) cardsRef.current[i] = el;
                                }}
                                className="relative group w-[280px] md:w-[320px]"
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Orbital Ring */}
                                <div
                                    className="absolute -inset-4 rounded-full border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                    style={{
                                        animation: "spin 20s linear infinite",
                                    }}
                                />

                                {/* Card */}
                                <div
                                    className={cn(
                                        "relative rounded-2xl overflow-hidden transition-all duration-500",
                                        "backdrop-blur-xl bg-black/40 border border-white/10",
                                        "group-hover:border-blue-400/30 group-hover:bg-black/50",
                                        "shadow-[0_0_40px_rgba(100,150,255,0.1)]",
                                        "group-hover:shadow-[0_0_60px_rgba(100,150,255,0.2)]"
                                    )}
                                >
                                    <div className="aspect-square relative">
                                        <GridSectionWrapper
                                            section={section}
                                            templateSection={{ id: section.id, name: `Star-${i + 1}` }}
                                            isHovered={editor.hoveredSectionId === section.id}
                                            onSectionDelete={props.onSectionDelete}
                                            onSectionContentChange={props.onSectionContentChange}
                                            {...props}
                                        />

                                        {/* Starfield overlay */}
                                        <div
                                            className="absolute inset-0 pointer-events-none opacity-30"
                                            style={{
                                                backgroundImage: `radial-gradient(1px 1px at ${Math.random() * 100}% ${Math.random() * 100}%, white, transparent),
                                          radial-gradient(1px 1px at ${Math.random() * 100}% ${Math.random() * 100}%, white, transparent),
                                          radial-gradient(1px 1px at ${Math.random() * 100}% ${Math.random() * 100}%, white, transparent)`,
                                            }}
                                        />
                                    </div>

                                    {/* Label */}
                                    <div className="p-4 text-center border-t border-white/10">
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="label"
                                            defaultValue={`Star System ${i + 1}`}
                                            className="text-sm font-light text-white/80 tracking-wide"
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
                            </div>
                        ))}

                        {/* Add Button */}
                        <DynamicAddButton
                            defaultValue="+ New Star"
                            className="w-[280px] md:w-[320px] min-h-[280px] md:min-h-[320px] rounded-2xl bg-black/20 backdrop-blur-sm border border-dashed border-white/20 hover:border-blue-400/40"
                        />
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
};

export const ParticleUniverseLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#050514"
            defaultTextColor="#ffffff"
            {...props}
        >
            <ParticleUniverseContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
