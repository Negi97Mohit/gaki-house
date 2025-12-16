import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Matrix Rain Canvas
const MatrixRainCanvas: React.FC<{ className?: string }> = ({ className }) => {
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

        // Matrix characters
        const chars = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ@#$%^&*";
        const charArray = chars.split("");

        const fontSize = 14;
        const columns = Math.floor(canvas.width / fontSize);
        const drops: number[] = new Array(columns).fill(1);

        let glitchTimeout: NodeJS.Timeout;
        let isGlitching = false;

        const triggerGlitch = () => {
            isGlitching = true;
            setTimeout(() => {
                isGlitching = false;
            }, 100 + Math.random() * 200);

            glitchTimeout = setTimeout(triggerGlitch, 2000 + Math.random() * 5000);
        };
        triggerGlitch();

        const animate = () => {
            // Trail effect
            ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            ctx.font = `${fontSize}px monospace`;

            for (let i = 0; i < drops.length; i++) {
                // Random character
                const char = charArray[Math.floor(Math.random() * charArray.length)];

                // Color variation
                const brightness = Math.random();
                if (brightness > 0.98) {
                    ctx.fillStyle = "#fff"; // White flash
                } else if (brightness > 0.9) {
                    ctx.fillStyle = "#90EE90"; // Light green
                } else {
                    ctx.fillStyle = `rgba(0, ${150 + Math.random() * 105}, 0, ${0.8 + Math.random() * 0.2})`;
                }

                const x = i * fontSize;
                const y = drops[i] * fontSize;

                ctx.fillText(char, x, y);

                // Reset drop
                if (y > canvas.height && Math.random() > 0.975) {
                    drops[i] = 0;
                }
                drops[i]++;
            }

            // Glitch effect
            if (isGlitching) {
                const sliceHeight = 20 + Math.random() * 50;
                const y = Math.random() * canvas.height;
                const shift = (Math.random() - 0.5) * 30;

                const imageData = ctx.getImageData(0, y, canvas.width, sliceHeight);
                ctx.putImageData(imageData, shift, y);

                // RGB split
                ctx.globalCompositeOperation = "screen";
                ctx.fillStyle = "rgba(255, 0, 0, 0.1)";
                ctx.fillRect(shift, 0, canvas.width, canvas.height);
                ctx.fillStyle = "rgba(0, 255, 255, 0.1)";
                ctx.fillRect(-shift, 0, canvas.width, canvas.height);
                ctx.globalCompositeOperation = "source-over";
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationRef.current);
            clearTimeout(glitchTimeout);
        };
    }, []);

    return <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full", className)} />;
};

const GlitchMatrixContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible, layout } = useDynamicLayout();
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                // Glitch animation
                const glitch = () => {
                    gsap.to(card, {
                        x: (Math.random() - 0.5) * 10,
                        duration: 0.05,
                        onComplete: () => {
                            gsap.to(card, {
                                x: 0,
                                duration: 0.05,
                            });
                        },
                    });
                };

                const glitchInterval = setInterval(() => {
                    if (Math.random() > 0.7) glitch();
                }, 3000 + Math.random() * 2000);

                return () => clearInterval(glitchInterval);
            });
        });
        return () => ctx.revert();
    }, [sections.length]);

    return (
        <div className="w-full h-full overflow-hidden relative font-mono">
            {/* Matrix Rain Background */}
            <MatrixRainCanvas />

            {/* Scanline overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-10 opacity-30"
                style={{
                    background:
                        "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)",
                }}
            />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col">
                {/* Header */}
                <div className="flex-shrink-0 p-8 md:p-12">
                    <div className="relative inline-block">
                        <EditableText
                            sectionId="header"
                            fieldId="title"
                            defaultValue="SYSTEM_BREACH"
                            className="text-5xl md:text-7xl font-bold tracking-wider glitch-text"
                            style={{
                                color: "#00ff00",
                                textShadow: "0 0 10px #00ff00, 0 0 20px #00ff00, 0 0 40px #00ff00",
                            }}
                        />
                        {/* Glitch layers */}
                        <div
                            className="absolute inset-0 text-5xl md:text-7xl font-bold tracking-wider opacity-50"
                            style={{
                                color: "#ff0000",
                                left: "2px",
                                clipPath: "polygon(0 0, 100% 0, 100% 45%, 0 45%)",
                                animation: "glitch-clip 2s infinite",
                            }}
                        >
                            SYSTEM_BREACH
                        </div>
                    </div>
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="[ACCESS GRANTED]"
                        className="text-lg md:text-xl mt-4 tracking-[0.5em]"
                        style={{ color: "#00ff00", opacity: 0.6 }}
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
                                className="relative group"
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Terminal Card */}
                                <div
                                    className={cn(
                                        "relative overflow-hidden transition-all duration-300",
                                        "bg-black/80 border border-green-500/50",
                                        "group-hover:border-green-400 group-hover:shadow-[0_0_30px_rgba(0,255,0,0.2)]"
                                    )}
                                >
                                    {/* Terminal header */}
                                    <div className="flex items-center gap-2 px-4 py-2 border-b border-green-500/30 bg-black/50">
                                        <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                        <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                        <span className="ml-2 text-xs text-green-500/60">node_{String(i).padStart(3, "0")}.exe</span>
                                    </div>

                                    <div className="aspect-video relative">
                                        <GridSectionWrapper
                                            section={section}
                                            templateSection={{ id: section.id, name: `Matrix-${i + 1}` }}
                                            isHovered={editor.hoveredSectionId === section.id}
                                            onSectionDelete={props.onSectionDelete}
                                            onSectionContentChange={props.onSectionContentChange}
                                            {...props}
                                        />
                                    </div>

                                    {/* Terminal footer */}
                                    <div className="p-4 border-t border-green-500/30">
                                        <div className="flex items-center gap-2">
                                            <span className="text-green-500 animate-pulse">▌</span>
                                            <EditableText
                                                sectionId={section.id}
                                                fieldId="label"
                                                defaultValue={`./execute_stream_${i + 1}`}
                                                className="text-sm text-green-400"
                                            />
                                        </div>
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="status"
                                            defaultValue="STATUS: ACTIVE"
                                            className="text-xs text-green-500/50 mt-1"
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <DynamicDeleteButton
                                        sectionId={section.id}
                                        className={cn(
                                            "absolute top-10 right-2 transition-opacity duration-300",
                                            editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add Button */}
                        <DynamicAddButton
                            defaultValue="> ADD_NODE"
                            className="min-h-[250px] bg-black/60 border border-dashed border-green-500/40 hover:border-green-400 font-mono text-green-500"
                        />
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes glitch-clip {
          0%, 100% { clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%); transform: translate(0); }
          20% { clip-path: polygon(0 15%, 100% 15%, 100% 30%, 0 30%); transform: translate(-5px); }
          40% { clip-path: polygon(0 60%, 100% 60%, 100% 75%, 0 75%); transform: translate(5px); }
          60% { clip-path: polygon(0 35%, 100% 35%, 100% 50%, 0 50%); transform: translate(-3px); }
          80% { clip-path: polygon(0 80%, 100% 80%, 100% 95%, 0 95%); transform: translate(3px); }
        }
      `}</style>
        </div>
    );
};

export const GlitchMatrixLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#000000"
            defaultTextColor="#00ff00"
            {...props}
        >
            <GlitchMatrixContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
