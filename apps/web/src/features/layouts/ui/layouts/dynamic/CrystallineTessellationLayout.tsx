import React, { useRef, useEffect, useState, useMemo } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@caption-cam/core/types/caption";
import { cn } from "@caption-cam/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

// Voronoi-style tessellation background
const TessellationCanvas: React.FC<{ className?: string; colors: { textColor: string } }> = ({ className, colors }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>(0);
    const pointsRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initPoints();
        };

        const initPoints = () => {
            pointsRef.current = [];
            const numPoints = 30;
            for (let i = 0; i < numPoints; i++) {
                pointsRef.current.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5
                });
            }
        };

        const animate = () => {
            ctx.fillStyle = "rgba(250, 250, 252, 0.1)";
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const points = pointsRef.current;

            // Update points
            points.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;

                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
            });

            // Draw Delaunay-style triangulation
            ctx.strokeStyle = `${colors.textColor}15`;
            ctx.lineWidth = 1;

            for (let i = 0; i < points.length; i++) {
                for (let j = i + 1; j < points.length; j++) {
                    const dx = points[i].x - points[j].x;
                    const dy = points[i].y - points[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < 200) {
                        ctx.beginPath();
                        ctx.moveTo(points[i].x, points[i].y);
                        ctx.lineTo(points[j].x, points[j].y);
                        ctx.stroke();
                    }
                }
            }

            // Draw points
            ctx.fillStyle = `${colors.textColor}30`;
            points.forEach(p => {
                ctx.beginPath();
                ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
                ctx.fill();
            });

            animationRef.current = requestAnimationFrame(animate);
        };

        resize();
        window.addEventListener("resize", resize);
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationRef.current);
        };
    }, [colors.textColor]);

    return <canvas ref={canvasRef} className={cn("absolute inset-0 w-full h-full", className)} />;
};

const CrystallineTessellationContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const cellsRef = useRef<HTMLDivElement[]>([]);
    const [hoveredCell, setHoveredCell] = useState<number | null>(null);

    // Generate clip-path for crystalline shapes
    const getCrystalClipPath = useMemo(() => {
        return (index: number) => {
            const shapes = [
                "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)", // Hexagon
                "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)", // Diamond
                "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)", // Stretched hexagon
                "polygon(0% 0%, 100% 0%, 100% 75%, 50% 100%, 0% 75%)", // Pentagon-ish
                "polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)", // Octagon
            ];
            return shapes[index % shapes.length];
        };
    }, []);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cellsRef.current.forEach((cell, i) => {
                if (!cell) return;

                // Fracture entrance
                gsap.fromTo(cell,
                    {
                        opacity: 0,
                        scale: 0.5,
                        rotation: 15 - Math.random() * 30
                    },
                    {
                        opacity: 1,
                        scale: 1,
                        rotation: 0,
                        duration: 0.6,
                        delay: i * 0.08,
                        ease: "back.out(1.7)"
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, [sections.length]);

    // Handle cell hover with shard effect
    const handleCellHover = (index: number) => {
        setHoveredCell(index);

        cellsRef.current.forEach((cell, i) => {
            if (!cell) return;

            if (i === index) {
                gsap.to(cell, {
                    scale: 1.05,
                    zIndex: 10,
                    boxShadow: `0 20px 40px rgba(0,0,0,0.2)`,
                    duration: 0.3,
                    ease: "power2.out"
                });
            } else {
                const distance = Math.abs(i - index);
                const angle = ((i - index) / Math.max(sections.length, 1)) * 30;
                gsap.to(cell, {
                    rotation: angle,
                    scale: 1 - distance * 0.02,
                    opacity: 1 - distance * 0.1,
                    duration: 0.3,
                    ease: "power2.out"
                });
            }
        });
    };

    const resetCells = () => {
        setHoveredCell(null);
        cellsRef.current.forEach((cell) => {
            if (!cell) return;
            gsap.to(cell, {
                scale: 1,
                rotation: 0,
                opacity: 1,
                zIndex: 1,
                boxShadow: "none",
                duration: 0.3,
                ease: "power2.out"
            });
        });
    };

    return (
        <div ref={containerRef} className="w-full h-full overflow-hidden relative">
            {/* Tessellation Background */}
            <TessellationCanvas colors={colors} />

            {/* Content */}
            <div
                className="relative z-20 w-full h-full flex flex-col p-6 md:p-12"
                onMouseLeave={resetCells}
            >
                {/* Header */}
                <header className="flex-shrink-0 mb-8 text-center">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="CRYSTALLINE"
                        className="text-5xl md:text-7xl font-black tracking-[0.2em]"
                        style={{
                            color: colors.textColor,
                            fontFamily: "'Inter', sans-serif"
                        }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="TESSELLATION"
                        className="text-xl md:text-2xl font-extralight tracking-[0.5em] opacity-50 mt-2"
                        style={{ color: colors.textColor }}
                    />
                </header>

                {/* Crystal Grid */}
                <div className="flex-1 overflow-y-auto">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 p-4">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                ref={(el) => { if (el) cellsRef.current[i] = el; }}
                                className={cn(
                                    "relative group cursor-pointer transition-all duration-300",
                                    i % 7 === 0 && "col-span-2 row-span-2"
                                )}
                                style={{
                                    clipPath: getCrystalClipPath(i),
                                    background: `linear-gradient(135deg, ${colors.backgroundColor}, ${colors.textColor}08)`,
                                    border: `1px solid ${colors.textColor}20`
                                }}
                                onMouseEnter={() => {
                                    editor.setHoveredSectionId(section.id);
                                    handleCellHover(i);
                                }}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                <div className="aspect-square overflow-hidden">
                                    <GridSectionWrapper
                                        section={section}
                                        templateSection={{ id: section.id, name: `Crystal-${i + 1}` }}
                                        isHovered={editor.hoveredSectionId === section.id}
                                        onSectionDelete={props.onSectionDelete}
                                        onSectionContentChange={props.onSectionContentChange}
                                        {...props}
                                    />
                                </div>

                                {/* Crystal facet overlay */}
                                <div
                                    className="absolute inset-0 pointer-events-none opacity-20"
                                    style={{
                                        background: `linear-gradient(${45 + i * 30}deg, transparent 40%, ${colors.textColor}20 50%, transparent 60%)`
                                    }}
                                />

                                {/* Label */}
                                <div className="absolute bottom-2 left-2 right-2 p-2 text-center">
                                    <EditableText
                                        sectionId={section.id}
                                        fieldId="label"
                                        defaultValue={`FACET ${String(i + 1).padStart(2, "0")}`}
                                        className="text-xs font-mono tracking-widest opacity-60"
                                        style={{ color: colors.textColor }}
                                    />
                                </div>

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

                        {/* Add button with crystal shape */}
                        <DynamicAddButton
                            defaultValue="+"
                            className="aspect-square border-2 border-dashed hover:bg-black/5 text-3xl font-extralight"
                            style={{
                                clipPath: getCrystalClipPath(sections.length),
                                borderColor: `${colors.textColor}30`,
                                color: `${colors.textColor}40`
                            }}
                        />
                    </div>
                </div>

                {/* Footer */}
                <footer className="flex-shrink-0 mt-6 pt-4 border-t flex justify-between items-center text-xs font-mono"
                    style={{ borderColor: `${colors.textColor}20`, color: `${colors.textColor}50` }}>
                    <EditableText
                        sectionId="footer"
                        fieldId="left"
                        defaultValue="GEOMETRY: DYNAMIC"
                    />
                    <EditableText
                        sectionId="footer"
                        fieldId="right"
                        defaultValue="FACETS: ACTIVE"
                    />
                </footer>
            </div>
        </div>
    );
};

export const CrystallineTessellationLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#fafafc"
            defaultTextColor="#1a1a2e"
            {...props}
        >
            <CrystallineTessellationContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
