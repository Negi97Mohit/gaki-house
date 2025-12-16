import React, { useRef, useEffect, useCallback } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Aurora Borealis WebGL Effect
const AuroraCanvas: React.FC<{ className?: string }> = ({ className }) => {
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

        let time = 0;
        const waves: { y: number; amplitude: number; frequency: number; speed: number; hue: number }[] = [];

        // Create aurora waves
        for (let i = 0; i < 5; i++) {
            waves.push({
                y: canvas.height * (0.3 + i * 0.1),
                amplitude: 50 + Math.random() * 100,
                frequency: 0.002 + Math.random() * 0.003,
                speed: 0.5 + Math.random() * 0.5,
                hue: 120 + i * 30, // Green to cyan range
            });
        }

        const animate = () => {
            ctx.fillStyle = "rgba(5, 10, 20, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            waves.forEach((wave) => {
                ctx.beginPath();
                ctx.moveTo(0, wave.y);

                for (let x = 0; x < canvas.width; x += 5) {
                    const y =
                        wave.y +
                        Math.sin((x + time * wave.speed) * wave.frequency) * wave.amplitude +
                        Math.sin((x + time * wave.speed * 0.5) * wave.frequency * 2) * (wave.amplitude * 0.5);
                    ctx.lineTo(x, y);
                }

                ctx.lineTo(canvas.width, canvas.height);
                ctx.lineTo(0, canvas.height);
                ctx.closePath();

                const gradient = ctx.createLinearGradient(0, wave.y - wave.amplitude, 0, wave.y + wave.amplitude * 2);
                gradient.addColorStop(0, `hsla(${wave.hue}, 80%, 60%, 0)`);
                gradient.addColorStop(0.3, `hsla(${wave.hue}, 80%, 60%, 0.3)`);
                gradient.addColorStop(0.5, `hsla(${wave.hue}, 80%, 70%, 0.2)`);
                gradient.addColorStop(1, `hsla(${wave.hue}, 80%, 60%, 0)`);

                ctx.fillStyle = gradient;
                ctx.fill();
            });

            // Add stars
            if (Math.random() > 0.95) {
                ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
                ctx.beginPath();
                ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height * 0.5, Math.random() * 2, 0, Math.PI * 2);
                ctx.fill();
            }

            time++;
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

const AuroraBorealisContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible, layout } = useDynamicLayout();
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                gsap.fromTo(
                    card,
                    { y: 100, opacity: 0, scale: 0.9 },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        delay: i * 0.15,
                        ease: "power3.out",
                    }
                );

                // Floating animation
                gsap.to(card, {
                    y: "+=10",
                    duration: 2 + Math.random(),
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut",
                });
            });
        });
        return () => ctx.revert();
    }, [sections.length]);

    return (
        <div className="w-full h-full overflow-hidden relative">
            {/* Aurora Background */}
            <AuroraCanvas />

            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 z-10" />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 p-8 md:p-12">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="AURORA"
                        className="text-6xl md:text-8xl font-black tracking-tighter text-white/90"
                        style={{ textShadow: "0 0 60px rgba(100, 255, 200, 0.5)" }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="Borealis Flow"
                        className="text-xl md:text-2xl font-light text-emerald-300/80 mt-2"
                    />
                </div>

                {/* Cards Grid */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                ref={(el) => {
                                    if (el) cardsRef.current[i] = el;
                                }}
                                className="relative group"
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Glass Card */}
                                <div
                                    className={cn(
                                        "relative rounded-2xl overflow-hidden",
                                        "backdrop-blur-xl bg-white/10 border border-white/20",
                                        "transition-all duration-500 group-hover:bg-white/15 group-hover:border-emerald-400/40",
                                        "shadow-[0_0_40px_rgba(0,255,200,0.1)] group-hover:shadow-[0_0_60px_rgba(0,255,200,0.2)]"
                                    )}
                                    style={{ aspectRatio: "4/3" }}
                                >
                                    <GridSectionWrapper
                                        section={section}
                                        templateSection={{ id: section.id, name: `Aurora-${i + 1}` }}
                                        isHovered={editor.hoveredSectionId === section.id}
                                        onSectionDelete={props.onSectionDelete}
                                        onSectionContentChange={props.onSectionContentChange}
                                        {...props}
                                    />

                                    {/* Card Label */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="label"
                                            defaultValue={`Panel ${i + 1}`}
                                            className="text-sm font-medium text-white/80"
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
                            defaultValue="Add Aurora Panel"
                            className="min-h-[200px] rounded-2xl backdrop-blur-xl bg-white/5 border border-dashed border-white/20 hover:border-emerald-400/50"
                        />
                    </div>
                </div>
            </div>

            {/* Grain overlay */}
            <div
                className="absolute inset-0 z-30 pointer-events-none opacity-20 mix-blend-overlay"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                }}
            />
        </div>
    );
};

export const AuroraBorealisLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#050a14"
            defaultTextColor="#ffffff"
            {...props}
        >
            <AuroraBorealisContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
