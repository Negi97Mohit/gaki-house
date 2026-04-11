import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@caption-cam/core/types/caption";
import { cn } from "@caption-cam/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Starfield canvas
const StarfieldCanvas: React.FC<{ className?: string }> = ({ className }) => {
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

        const stars: { x: number; y: number; z: number; size: number }[] = [];
        for (let i = 0; i < 200; i++) {
            stars.push({
                x: (Math.random() - 0.5) * canvas.width * 2,
                y: (Math.random() - 0.5) * canvas.height * 2,
                z: Math.random() * 1000,
                size: Math.random() * 2 + 0.5
            });
        }

        const animate = () => {
            ctx.fillStyle = "rgba(5, 5, 15, 0.3)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;

            stars.forEach(star => {
                star.z -= 2;
                if (star.z <= 0) {
                    star.z = 1000;
                    star.x = (Math.random() - 0.5) * canvas.width * 2;
                    star.y = (Math.random() - 0.5) * canvas.height * 2;
                }

                const x = (star.x / star.z) * 300 + centerX;
                const y = (star.y / star.z) * 300 + centerY;
                const size = (1 - star.z / 1000) * star.size * 2;

                ctx.beginPath();
                ctx.fillStyle = `rgba(200, 220, 255, ${1 - star.z / 1000})`;
                ctx.arc(x, y, size, 0, Math.PI * 2);
                ctx.fill();
            });

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

const InterstellarDockContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections, ...props
}) => {
    const { colors, editor } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const modulesRef = useRef<HTMLDivElement[]>([]);
    const [dockedModule, setDockedModule] = useState<number>(0);

    useEffect(() => {
        const ctx = gsap.context(() => {
            modulesRef.current.forEach((module, i) => {
                if (!module) return;
                gsap.fromTo(module,
                    { opacity: 0, scale: 0.3, rotateY: -90 },
                    { opacity: 1, scale: 1, rotateY: 0, duration: 1.2, delay: i * 0.2, ease: "power3.out" }
                );
            });
        }, containerRef);
        return () => ctx.revert();
    }, [sections.length]);

    const handleDock = (index: number) => {
        if (index === dockedModule) return;
        modulesRef.current.forEach((module, i) => {
            if (!module) return;
            const newPos = (i - index + sections.length) % sections.length;
            gsap.to(module, {
                z: newPos === 0 ? 100 : -newPos * 50,
                scale: newPos === 0 ? 1.1 : 1 - newPos * 0.05,
                opacity: newPos === 0 ? 1 : 0.7 - newPos * 0.1,
                duration: 0.8
            });
        });
        setDockedModule(index);
    };

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden relative" style={{ perspective: "2000px" }}>
            <StarfieldCanvas />
            <div className="relative z-10 w-full h-full flex flex-col p-8 md:p-12">
                <header className="flex-shrink-0 mb-8 flex justify-between">
                    <div>
                        <EditableText sectionId="header" fieldId="title" defaultValue="INTERSTELLAR"
                            className="text-4xl md:text-6xl font-black tracking-wider text-white" />
                    </div>
                    <div className="text-right font-mono text-xs text-cyan-400">
                        <div>MODULES: {sections.length}</div>
                        <div>DOCKED: {String(dockedModule + 1).padStart(2, "0")}</div>
                    </div>
                </header>

                <div className="flex-1 flex items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
                    <div className="relative w-full max-w-4xl aspect-video" style={{ transformStyle: "preserve-3d" }}>
                        {sections.map((section, i) => {
                            const isDocked = i === dockedModule;
                            return (
                                <div key={section.id}
                                    ref={(el) => { if (el) modulesRef.current[i] = el; }}
                                    className={cn("absolute inset-0 cursor-pointer border-2 bg-black/80 rounded-lg overflow-hidden",
                                        isDocked && "ring-2 ring-cyan-400/50")}
                                    style={{ borderColor: isDocked ? "#4df" : "#4df40" }}
                                    onClick={() => handleDock(i)}
                                    onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                    onMouseLeave={() => editor.setHoveredSectionId(null)}>
                                    <GridSectionWrapper section={section}
                                        templateSection={{ id: section.id, name: `Module-${i + 1}` }}
                                        isHovered={editor.hoveredSectionId === section.id}
                                        onSectionDelete={props.onSectionDelete}
                                        onSectionContentChange={props.onSectionContentChange}
                                        {...props} />
                                    <div className="absolute top-2 left-2 px-3 py-1 text-xs font-mono bg-black/50 text-cyan-400">
                                        MODULE-{String(i + 1).padStart(3, "0")}
                                    </div>
                                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent">
                                        <EditableText sectionId={section.id} fieldId="title" defaultValue={`Bay ${i + 1}`}
                                            className="text-lg font-medium text-white" />
                                    </div>
                                    <DynamicDeleteButton sectionId={section.id}
                                        className={cn("absolute top-2 right-2", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex-shrink-0 flex justify-center gap-2 mb-4">
                    {sections.map((_, i) => (
                        <button key={i} onClick={() => handleDock(i)}
                            className={cn("w-3 h-3 rounded-full", i === dockedModule ? "bg-cyan-400" : "bg-cyan-400/30")} />
                    ))}
                </div>

                <DynamicAddButton defaultValue="+ DEPLOY MODULE"
                    className="mx-auto px-6 py-3 border border-cyan-400/40 text-cyan-400 text-sm font-mono" />
            </div>
        </div>
    );
};

export const InterstellarDockLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper layout={props.layout} onLayoutUpdate={props.onLayoutUpdate}
            sections={sections} defaultBackgroundColor="#05050f" defaultTextColor="#e8f0ff" {...props}>
            <InterstellarDockContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
