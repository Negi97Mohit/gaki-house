import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { CanvasLayoutState, CanvasSectionState } from "@gaki/core/types/caption";
import { CanvasLayoutTemplate } from "@gaki/core/types/layout";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

interface VitruvianMotionLayoutProps {
    sections: CanvasSectionState[];
    layout: CanvasLayoutState;
    template: CanvasLayoutTemplate;
    containerRef: React.RefObject<HTMLDivElement>;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
    [key: string]: any;
}

export const VitruvianMotionLayout: React.FC<VitruvianMotionLayoutProps> = ({
    sections,
    layout,
    onLayoutUpdate,
    containerRef,
    ...wrapperProps
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            // Use container size if available, else window
            const parent = containerRef.current;
            if (parent) {
                // High DPI support
                const dpr = window.devicePixelRatio || 1;
                canvas.width = parent.clientWidth * dpr;
                canvas.height = parent.clientHeight * dpr;
                ctx.scale(dpr, dpr);
                canvas.style.width = `${parent.clientWidth}px`;
                canvas.style.height = `${parent.clientHeight}px`;
            } else {
                canvas.width = window.innerWidth;
                canvas.height = window.innerHeight;
            }
        };
        resize();
        window.addEventListener("resize", resize);

        // Animation Loop logic
        let animationFrameId: number;
        let time = 0;

        const render = () => {
            if (!ctx || !canvas) return;
            const width = canvas.width / (window.devicePixelRatio || 1);
            const height = canvas.height / (window.devicePixelRatio || 1);

            ctx.clearRect(0, 0, width, height);

            // Draw faint grid background
            ctx.strokeStyle = "rgba(0,0,0,0.05)";
            ctx.lineWidth = 1;
            const gridSize = 50;

            ctx.beginPath();
            for (let x = 0; x <= width; x += gridSize) {
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
            }
            for (let y = 0; y <= height; y += gridSize) {
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
            }
            ctx.stroke();

            // Draw animated decorative circles/geometry in random spots
            const cx = width / 2;
            const cy = height / 2;

            time += 0.01;
            const radius = 200 + Math.sin(time) * 20;

            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0,0,0,0.1)";
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(cx, cy, radius * 1.618, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(0,0,0,0.05)";
            ctx.stroke();

            animationFrameId = requestAnimationFrame(render);
        };
        render();

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [containerRef]);

    const handleAddSection = () => {
        if (!onLayoutUpdate) return;
        const newSection: CanvasSectionState = {
            id: `vitruvian-section-${Date.now()}`,
            content: { type: "empty" },
            style: { background: "#ffffff", color: "#333" },
            name: `Sketch ${sections.length + 1}`,
        };
        onLayoutUpdate({
            ...layout,
            sections: [...layout.sections, newSection],
        });
    };

    const handleRemoveSection = (id: string) => {
        if (!onLayoutUpdate) return;
        onLayoutUpdate({
            ...layout,
            sections: sections.filter(s => s.id !== id)
        });
    };

    return (
        <div className="relative w-full h-full bg-[#f5f1eb] font-mono text-zinc-800 overflow-hidden">
            {/* Background Canvas for procedural drawing */}
            <canvas ref={canvasRef} className="absolute inset-0 block z-0 pointer-events-none" />

            {/* Main Content Area */}
            <div className="absolute inset-0 z-10 p-8 md:p-12 overflow-y-auto">

                {/* Header */}
                <header className="flex justify-between items-start border-b border-zinc-400/50 pb-4 mb-12">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tighter">VITRUVIAN</h1>
                        <p className="text-xs uppercase tracking-widest opacity-60 mt-1">Technical Study</p>
                    </div>
                    <div className="text-xs text-right opacity-60">
                        FIG 1.1<br />
                        PROPORTION
                    </div>
                </header>

                {/* Dynamic Grid of sketches */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {sections.map((section, index) => (
                        <div key={section.id} className="aspect-square relative group">
                            {/* Sketch Paper container */}
                            <div
                                className="absolute inset-0 bg-white shadow-sm border border-zinc-200 p-2 transform transition-transform duration-300 group-hover:-rotate-1 group-hover:scale-[1.02]"
                                style={{
                                    background: section.style?.background || "#fff",
                                    color: section.style?.color || "#333"
                                }}
                            >
                                <div className="w-full h-full border border-dashed border-zinc-300 relative overflow-hidden">
                                    <GridSectionWrapper
                                        section={section}
                                        templateSection={{ id: section.id, name: section.name || `Sketch ${index + 1}` }}
                                        {...wrapperProps}
                                        onLayoutUpdate={onLayoutUpdate}
                                        layout={layout}
                                    />
                                </div>
                            </div>

                            {/* Corner Labels */}
                            <div className="absolute -bottom-6 w-full text-center text-[10px] uppercase tracking-widest opacity-50">
                                {section.name || `Fig ${index + 1}`}
                            </div>

                            {/* Delete Button */}
                            <button
                                onClick={() => handleRemoveSection(section.id)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-50 text-xs"
                            >
                                &times;
                            </button>

                            {/* Tape Effect */}
                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-[#f5f1eb] opacity-80 rotate-1 shadow-sm pointer-events-none" />
                        </div>
                    ))}

                    {/* Add Button */}
                    <div className="aspect-square flex items-center justify-center p-4">
                        <button
                            onClick={handleAddSection}
                            className="w-full h-full border-2 border-dashed border-zinc-300 rounded-lg flex flex-col items-center justify-center gap-2 group hover:border-zinc-500 hover:bg-black/5 transition-all"
                        >
                            <Plus className="w-8 h-8 text-zinc-400 group-hover:text-zinc-600" />
                            <span className="text-xs uppercase tracking-widest text-zinc-400 group-hover:text-zinc-600">New Sketch</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
