import React from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SistineDepthLayoutProps {
    sections: CanvasSectionState[];
    layout: CanvasLayoutState;
    template: CanvasLayoutTemplate;
    containerRef: React.RefObject<HTMLDivElement>;
    onLayoutUpdate?: (layout: CanvasLayoutState) => void;
    [key: string]: any;
}

export const SistineDepthLayout: React.FC<SistineDepthLayoutProps> = ({
    sections,
    layout,
    onLayoutUpdate,
    containerRef,
    ...wrapperProps
}) => {
    const { scrollYProgress } = useScroll({ container: containerRef });

    const yBackend = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
    const yMiddle = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
    const scaleFront = useTransform(scrollYProgress, [0, 0.5, 1], [1, 1.2, 1]);

    const handleAddSection = () => {
        if (!onLayoutUpdate) return;
        const newSection: CanvasSectionState = {
            id: `sistine-section-${Date.now()}`,
            content: { type: "empty" },
            style: { background: "#2a2420", color: "#e0c9a6" },
            name: `Fig. ${sections.length + 1}`,
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
            sections: sections.filter((s) => s.id !== id),
        });
    };

    return (
        <div className="relative w-full overflow-x-hidden min-h-[100%] bg-[#1a1512] text-[#e0c9a6]">
            {/* Force scroll container height to enable parallax if content is short */}
            <div className="absolute inset-0 pointer-events-none opacity-0 h-[200vh]" />

            {/* Background Layer */}
            <motion.div
                style={{ y: yBackend }}
                className="fixed inset-0 opacity-30 z-0 pointer-events-none"
            >
                <div className="w-full h-full bg-[radial-gradient(circle_at_center,_#4a3b32_0%,_#1a1512_100%)]"></div>
            </motion.div>

            {/* Content Container */}
            <div className="relative z-10 w-full flex flex-col items-center">
                {/* Hero Title - Parallax */}
                <div className="min-h-[60vh] w-full flex flex-col items-center justify-center relative p-12">
                    <motion.h1
                        style={{ scale: scaleFront }}
                        className="text-[10vw] font-serif text-center leading-none text-transparent bg-clip-text bg-gradient-to-b from-[#e0c9a6] to-[#8f7e68] drop-shadow-2xl"
                    >
                        DIVINE
                        <br />
                        PROPORTION
                    </motion.h1>
                    <motion.div
                        style={{ y: yMiddle }}
                        className="mt-8 text-xl font-light tracking-[0.5em] uppercase text-[#e0c9a6]/80"
                    >
                        The Golden Ratio
                    </motion.div>
                </div>

                {/* Floating Frames Grid */}
                <div className="w-full max-w-[1600px] p-8 md:p-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16 relative">
                    {sections.map((section, i) => (
                        <motion.div
                            key={section.id}
                            initial={{ opacity: 0, y: 100 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ amount: 0.2 }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                            className="aspect-[9/16] relative group"
                        >
                            {/* Classical Arch Frame */}
                            <div
                                className="absolute inset-0 bg-[#2a2420] border border-[#e0c9a6]/20 rounded-t-[1000px] shadow-2xl overflow-hidden transition-all duration-500 group-hover:border-[#e0c9a6]/60 group-hover:shadow-[#e0c9a6]/10"
                                style={{
                                    background: section.style?.background || "#2a2420",
                                }}
                            >
                                <GridSectionWrapper
                                    section={section}
                                    templateSection={{ id: section.id, name: section.name || `Fig. ${i + 1}` }}
                                    {...wrapperProps}
                                    onLayoutUpdate={onLayoutUpdate}
                                    layout={layout}
                                    className="rounded-t-[1000px]"
                                />
                            </div>

                            {/* Caption */}
                            <div className="absolute -bottom-10 left-0 w-full text-center font-serif italic text-sm text-[#e0c9a6]/60">
                                {section.name || `Figure ${i + 1}`}
                            </div>

                            {/* Remove Button */}
                            <button
                                onClick={() => handleRemoveSection(section.id)}
                                className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-red-900/80 text-[#e0c9a6] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-800 z-50 pointer-events-auto"
                            >
                                &times;
                            </button>
                        </motion.div>
                    ))}

                    {/* Add Section Card */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        className="aspect-[9/16] flex items-center justify-center"
                    >
                        <button
                            onClick={handleAddSection}
                            className="w-full h-full border border-dashed border-[#e0c9a6]/20 rounded-t-[1000px] flex flex-col items-center justify-center gap-4 group hover:bg-[#e0c9a6]/5 transition-colors"
                        >
                            <div className="w-16 h-16 rounded-full border border-[#e0c9a6]/30 flex items-center justify-center group-hover:border-[#e0c9a6] transition-colors">
                                <Plus className="w-6 h-6 text-[#e0c9a6]" />
                            </div>
                            <span className="font-serif italic text-[#e0c9a6]/50 group-hover:text-[#e0c9a6]">Add Figure</span>
                        </button>
                    </motion.div>

                </div>

                <div className="h-40" /> {/* Bottom spacer */}
            </div>

            {/* Foreground Particles/Mist */}
            <div className="absolute inset-0 pointer-events-none z-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay fixed"></div>
        </div>
    );
};
