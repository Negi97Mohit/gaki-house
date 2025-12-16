import React from "react";
import { motion } from "framer-motion";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus } from "lucide-react";

interface WintourEditorialLayoutProps {
    sections: CanvasSectionState[];
    layout: CanvasLayoutState;
    template: CanvasLayoutTemplate;
    containerRef: React.RefObject<HTMLDivElement>;
    onLayoutUpdate: (layout: CanvasLayoutState) => void;
    [key: string]: any;
}

export const WintourEditorialLayout: React.FC<WintourEditorialLayoutProps> = ({
    sections,
    layout,
    onLayoutUpdate,
    ...wrapperProps
}) => {
    const handleAddSection = () => {
        if (!onLayoutUpdate) return;
        const newSection: CanvasSectionState = {
            id: `wintour-section-${Date.now()}`,
            content: { type: "empty" },
            style: { background: "#ffffff", color: "#000000" },
            name: `ISSUE NO. ${sections.length + 1}`,
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
    }

    return (
        <div className="relative w-full h-full bg-[#fdfdfd] overflow-y-scroll snap-y snap-mandatory scroll-smooth">
            {/* Intro Section - Always present as the cover */}
            <section className="w-full h-full min-h-full snap-start flex relative overflow-hidden bg-black text-white">
                <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "circOut" }}
                    >
                        <h2 className="text-[12vw] font-serif leading-[0.85] mix-blend-difference">
                            THE<br />ISSUE
                        </h2>
                        <p className="mt-8 font-mono text-sm tracking-widest uppercase">
                            Scroll for Editorials
                        </p>
                    </motion.div>
                </div>
                {/* Animated decorative lines */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="w-px h-full bg-white absolute left-1/4" />
                    <div className="w-px h-full bg-white absolute left-3/4" />
                </div>
            </section>

            {/* Dynamic Sections */}
            {sections.map((section, index) => {
                const isEven = index % 2 === 0;
                return (
                    <section
                        key={section.id}
                        className="w-full h-full min-h-full snap-start flex flex-col md:flex-row relative group"
                        style={{
                            background: section.style?.background || "#fdfdfd",
                            color: section.style?.color || "#000"
                        }}
                    >
                        {/* Split Layout: Text/Media vs Media/Text based on index */}
                        <div className={cn(
                            "w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black/10 order-2 md:order-1",
                            !isEven && "md:order-2 md:border-r-0 md:border-l"
                        )}>
                            <div className="flex items-center gap-4">
                                <h3 className="text-4xl font-bold tracking-widest uppercase font-serif">
                                    {section.name || `Story 0${index + 1}`}
                                </h3>
                            </div>

                            <div className="flex-1 mt-8 relative rounded-lg overflow-hidden bg-gray-50 border border-black/5 shadow-inner">
                                <GridSectionWrapper
                                    section={section}
                                    templateSection={{ id: section.id, name: section.name || `Edit Content` }}
                                    {...wrapperProps}
                                    onLayoutUpdate={onLayoutUpdate}
                                    layout={layout}
                                    // Force clean styling for editorial look
                                    className="bg-transparent"
                                />
                            </div>

                            <div className="mt-4 font-mono text-xs flex justify-between uppercase opacity-50">
                                <span>PAGE {index + 1}</span>
                                <span>SEPTEMBER 2024</span>
                            </div>
                        </div>

                        {/* Decorative Side Panel */}
                        <div className={cn(
                            "w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-gray-100 flex items-center justify-center order-1 md:order-2",
                            !isEven && "md:order-1"
                        )}>
                            {/*  Ideally this would be another media slot or just aesthetic fill */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent" />
                            <span className="text-[20vw] font-serif opacity-5 leading-none select-none pointer-events-none">
                                {index + 1}
                            </span>
                        </div>

                        {/* Remove Button (Hover only) */}
                        <button
                            onClick={() => handleRemoveSection(section.id)}
                            className="absolute top-4 right-4 z-50 opacity-0 group-hover:opacity-100 w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full transition-all hover:scale-110"
                            title="Remove Page"
                        >
                            &times;
                        </button>
                    </section>
                );
            })}

            {/* Add Page Button - Final Section */}
            <section className="w-full h-full min-h-full snap-start flex items-center justify-center bg-gray-50 border-t border-black/10">
                <button
                    onClick={handleAddSection}
                    className="flex flex-col items-center justify-center gap-4 group"
                >
                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-black/20 flex items-center justify-center group-hover:border-black group-hover:bg-white transition-all duration-300">
                        <Plus className="w-12 h-12 text-black/20 group-hover:text-black transition-colors" />
                    </div>
                    <span className="font-serif italic text-xl text-black/50 group-hover:text-black transition-colors">
                        Add New Issue Page
                    </span>
                </button>
            </section>

            {/* Floating Indicators */}
            <div className="fixed bottom-8 left-8 z-50 pointer-events-none mix-blend-difference text-white">
                <span className="font-bold tracking-widest text-xs">VOGUE EDITORIAL</span>
            </div>
            <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
                <div className="flex flex-col gap-1 items-end">
                    {sections.map((_, i) => (
                        <div key={i} className={cn("w-1.5 h-1.5 rounded-full bg-black/20 transition-all", i === 0 && "bg-black scale-125")} />
                    ))}
                </div>
            </div>
        </div>
    );
};
