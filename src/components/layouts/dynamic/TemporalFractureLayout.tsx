import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Cinematic time-fragmentation canvas background
const TemporalCanvas: React.FC<{ className?: string }> = ({ className }) => {
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
        const fragments: { x: number; y: number; size: number; speed: number; opacity: number }[] = [];
        
        // Initialize fragments
        for (let i = 0; i < 50; i++) {
            fragments.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: Math.random() * 3 + 1,
                speed: Math.random() * 0.5 + 0.1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }

        const animate = () => {
            ctx.fillStyle = "rgba(10, 12, 18, 0.15)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Time distortion waves
            const numWaves = 5;
            for (let w = 0; w < numWaves; w++) {
                const waveOffset = (time * 0.02 + w * 0.5) % (Math.PI * 2);
                ctx.beginPath();
                ctx.strokeStyle = `rgba(100, 150, 255, ${0.1 - w * 0.015})`;
                ctx.lineWidth = 1;
                
                for (let x = 0; x < canvas.width; x += 5) {
                    const y = canvas.height / 2 + 
                        Math.sin(x * 0.01 + waveOffset) * 50 +
                        Math.sin(x * 0.02 - waveOffset * 0.5) * 30;
                    if (x === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Floating fragments (time particles)
            fragments.forEach(f => {
                ctx.beginPath();
                ctx.fillStyle = `rgba(180, 200, 255, ${f.opacity})`;
                ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
                ctx.fill();

                // Move fragments in time-warped pattern
                f.y -= f.speed;
                f.x += Math.sin(time * 0.01 + f.y * 0.01) * 0.5;
                
                if (f.y < -10) {
                    f.y = canvas.height + 10;
                    f.x = Math.random() * canvas.width;
                }
            });

            // Clock-like circular elements
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            
            for (let r = 0; r < 3; r++) {
                const radius = 150 + r * 80;
                ctx.beginPath();
                ctx.strokeStyle = `rgba(100, 150, 255, ${0.1 - r * 0.02})`;
                ctx.lineWidth = 1;
                ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
                ctx.stroke();

                // Time markers
                for (let i = 0; i < 12; i++) {
                    const angle = (i / 12) * Math.PI * 2 - Math.PI / 2 + time * 0.001 * (r + 1);
                    const markerX = centerX + Math.cos(angle) * radius;
                    const markerY = centerY + Math.sin(angle) * radius;
                    ctx.beginPath();
                    ctx.fillStyle = `rgba(180, 200, 255, 0.3)`;
                    ctx.arc(markerX, markerY, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
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

const TemporalFractureContent: React.FC<{ sections: CanvasSectionState[]; [key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const [activeFragment, setActiveFragment] = useState<number | null>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Initial staggered entrance
            cardsRef.current.forEach((card, i) => {
                if (!card) return;
                
                gsap.fromTo(card, 
                    { 
                        opacity: 0, 
                        y: 100, 
                        rotateX: -15,
                        scale: 0.9 
                    },
                    { 
                        opacity: 1, 
                        y: 0, 
                        rotateX: 0,
                        scale: 1,
                        duration: 0.8,
                        delay: i * 0.15,
                        ease: "power3.out"
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, [sections.length]);

    const handleFragmentClick = (index: number) => {
        if (activeFragment === index) {
            // Collapse back
            gsap.to(cardsRef.current[index], {
                scale: 1,
                zIndex: 1,
                duration: 0.5,
                ease: "power2.out"
            });
            setActiveFragment(null);
        } else {
            // Expand with temporal effect
            if (activeFragment !== null && cardsRef.current[activeFragment]) {
                gsap.to(cardsRef.current[activeFragment], {
                    scale: 1,
                    zIndex: 1,
                    duration: 0.3
                });
            }
            
            gsap.to(cardsRef.current[index], {
                scale: 1.1,
                zIndex: 50,
                duration: 0.5,
                ease: "power2.out"
            });
            
            // Time-warp effect on other cards
            cardsRef.current.forEach((card, i) => {
                if (i !== index && card) {
                    gsap.to(card, {
                        opacity: 0.5,
                        filter: "blur(2px)",
                        duration: 0.3
                    });
                }
            });
            
            setActiveFragment(index);
        }
    };

    const resetFragments = () => {
        cardsRef.current.forEach((card) => {
            if (card) {
                gsap.to(card, {
                    opacity: 1,
                    filter: "blur(0px)",
                    scale: 1,
                    zIndex: 1,
                    duration: 0.3
                });
            }
        });
        setActiveFragment(null);
    };

    return (
        <div 
            ref={containerRef}
            className="w-full h-full overflow-hidden relative"
            style={{ perspective: "1500px" }}
            onMouseLeave={resetFragments}
        >
            {/* Temporal Background */}
            <TemporalCanvas />

            {/* Vignette overlay */}
            <div 
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)"
                }}
            />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col p-6 md:p-12">
                {/* Header */}
                <header className="flex-shrink-0 mb-8 text-center">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="TEMPORAL"
                        className="text-5xl md:text-7xl font-black tracking-[0.3em] text-white/90"
                        style={{ textShadow: "0 0 30px rgba(100, 150, 255, 0.5)" }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="FRACTURE"
                        className="text-2xl md:text-4xl font-light tracking-[0.5em] text-blue-300/70 mt-2"
                    />
                </header>

                {/* Fragmented Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                ref={(el) => { if (el) cardsRef.current[i] = el; }}
                                className={cn(
                                    "relative group cursor-pointer transition-all duration-500",
                                    "border border-white/10 bg-black/40 backdrop-blur-sm",
                                    i % 5 === 0 && "md:col-span-2 md:row-span-2"
                                )}
                                style={{
                                    transformStyle: "preserve-3d",
                                    boxShadow: activeFragment === i 
                                        ? "0 0 40px rgba(100, 150, 255, 0.4), inset 0 0 20px rgba(100, 150, 255, 0.1)"
                                        : "0 0 20px rgba(0, 0, 0, 0.5)"
                                }}
                                onClick={() => handleFragmentClick(i)}
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                <div className={cn("aspect-video", i % 5 === 0 && "md:aspect-square")}>
                                    <GridSectionWrapper
                                        section={section}
                                        templateSection={{ id: section.id, name: `Fragment-${i + 1}` }}
                                        isHovered={editor.hoveredSectionId === section.id}
                                        onSectionDelete={props.onSectionDelete}
                                        onSectionContentChange={props.onSectionContentChange}
                                        {...props}
                                    />
                                </div>

                                {/* Fragment label */}
                                <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                                    <EditableText
                                        sectionId={section.id}
                                        fieldId="label"
                                        defaultValue={`T-${String(i + 1).padStart(3, "0")}`}
                                        className="text-xs font-mono text-blue-300/80 tracking-widest"
                                    />
                                    <EditableText
                                        sectionId={section.id}
                                        fieldId="timestamp"
                                        defaultValue="00:00:00"
                                        className="text-[10px] font-mono text-white/40"
                                    />
                                </div>

                                {/* Corner accents */}
                                <div className="absolute top-0 left-0 w-4 h-4 border-t border-l border-blue-400/50" />
                                <div className="absolute top-0 right-0 w-4 h-4 border-t border-r border-blue-400/50" />
                                <div className="absolute bottom-0 left-0 w-4 h-4 border-b border-l border-blue-400/50" />
                                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-blue-400/50" />

                                {/* Delete button */}
                                <DynamicDeleteButton
                                    sectionId={section.id}
                                    className={cn(
                                        "absolute top-2 right-2 transition-opacity duration-300",
                                        editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                    )}
                                />
                            </div>
                        ))}

                        {/* Add button */}
                        <DynamicAddButton
                            defaultValue="+ NEW FRAGMENT"
                            className="min-h-[150px] border border-dashed border-blue-400/30 bg-black/30 backdrop-blur-sm hover:border-blue-400/60 hover:bg-black/50 font-mono text-blue-300/60"
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex-shrink-0 mt-8 pt-4 border-t border-white/10 flex justify-between items-center text-white/40 text-xs font-mono">
                    <EditableText
                        sectionId="footer"
                        fieldId="left"
                        defaultValue="TIMELINE: ACTIVE"
                        className="tracking-widest"
                    />
                    <EditableText
                        sectionId="footer"
                        fieldId="right"
                        defaultValue="FRAGMENTS: SYNCHRONIZED"
                        className="tracking-widest"
                    />
                </footer>
            </div>
        </div>
    );
};

export const TemporalFractureLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#0a0c12"
            defaultTextColor="#e0e8ff"
            {...props}
        >
            <TemporalFractureContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
