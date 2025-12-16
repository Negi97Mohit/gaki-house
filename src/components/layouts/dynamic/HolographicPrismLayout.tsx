import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

const HolographicPrismContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible, layout } = useDynamicLayout();
    const cardsRef = useRef<HTMLDivElement[]>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                // Shimmer animation
                gsap.fromTo(
                    card.querySelector(".shimmer-layer"),
                    { backgroundPosition: "-200% 0" },
                    {
                        backgroundPosition: "200% 0",
                        duration: 3,
                        repeat: -1,
                        ease: "linear",
                        delay: i * 0.5,
                    }
                );

                // Subtle rotation
                gsap.to(card, {
                    rotateY: 2,
                    rotateX: -1,
                    duration: 4 + i,
                    yoyo: true,
                    repeat: -1,
                    ease: "sine.inOut",
                });
            });

            // Background prism animation
            gsap.to(".prism-ray", {
                rotation: 360,
                duration: 20,
                repeat: -1,
                ease: "linear",
            });
        });
        return () => ctx.revert();
    }, [sections.length]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-hidden relative"
            style={{
                background: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #0a0a0f 100%)",
            }}
        >
            {/* Prismatic light rays */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
                    <div
                        key={i}
                        className="prism-ray absolute top-1/2 left-1/2 w-[200vw] h-8 opacity-20"
                        style={{
                            transform: `translate(-50%, -50%) rotate(${angle}deg)`,
                            background: `linear-gradient(90deg, 
                transparent 0%, 
                rgba(255,0,0,0.2) 25%, 
                rgba(255,165,0,0.2) 35%, 
                rgba(255,255,0,0.2) 45%, 
                rgba(0,255,0,0.2) 55%, 
                rgba(0,0,255,0.2) 65%, 
                rgba(75,0,130,0.2) 75%, 
                transparent 100%)`,
                        }}
                    />
                ))}
            </div>

            {/* Center glow */}
            <div
                className="absolute top-1/2 left-1/2 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none"
                style={{
                    background:
                        "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                }}
            />

            {/* Content */}
            <div className="relative z-20 w-full h-full flex flex-col" style={{ perspective: "1000px" }}>
                {/* Header */}
                <div className="flex-shrink-0 p-8 md:p-12 text-center">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="HOLOGRAPHIC"
                        className="text-5xl md:text-7xl font-black tracking-wider"
                        style={{
                            background: "linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #ff0080)",
                            backgroundSize: "200% 100%",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            animation: "gradient-shift 3s linear infinite",
                        }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="Prism Light Effects"
                        className="text-xl md:text-2xl font-light tracking-widest mt-4 text-white/60"
                    />
                </div>

                {/* Cards Grid */}
                <div className="flex-1 overflow-y-auto px-6 pb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                ref={(el) => {
                                    if (el) cardsRef.current[i] = el;
                                }}
                                className="relative group"
                                style={{ transformStyle: "preserve-3d" }}
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Holographic Card */}
                                <div
                                    className={cn(
                                        "relative rounded-2xl overflow-hidden transition-all duration-500",
                                        "bg-black/40 backdrop-blur-sm",
                                        "group-hover:scale-[1.02]"
                                    )}
                                    style={{
                                        border: "1px solid transparent",
                                        backgroundImage: `linear-gradient(black, black), 
                      linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #7b68ee, #ff0080)`,
                                        backgroundOrigin: "border-box",
                                        backgroundClip: "padding-box, border-box",
                                    }}
                                >
                                    {/* Holographic shimmer overlay */}
                                    <div
                                        className="shimmer-layer absolute inset-0 pointer-events-none opacity-30 group-hover:opacity-50 transition-opacity"
                                        style={{
                                            background:
                                                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.2) 50%, transparent 55%)",
                                            backgroundSize: "200% 100%",
                                        }}
                                    />

                                    {/* Iridescent overlay */}
                                    <div
                                        className="absolute inset-0 pointer-events-none opacity-20"
                                        style={{
                                            background:
                                                "linear-gradient(135deg, rgba(255,0,128,0.3), rgba(255,140,0,0.3), rgba(64,224,208,0.3), rgba(123,104,238,0.3))",
                                            mixBlendMode: "color-dodge",
                                        }}
                                    />

                                    <div className="aspect-video relative z-10">
                                        <GridSectionWrapper
                                            section={section}
                                            templateSection={{ id: section.id, name: `Prism-${i + 1}` }}
                                            isHovered={editor.hoveredSectionId === section.id}
                                            onSectionDelete={props.onSectionDelete}
                                            onSectionContentChange={props.onSectionContentChange}
                                            {...props}
                                        />
                                    </div>

                                    {/* Label */}
                                    <div className="relative z-10 p-4 border-t border-white/10">
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="label"
                                            defaultValue={`Spectrum ${i + 1}`}
                                            className="text-sm font-medium"
                                            style={{
                                                background: "linear-gradient(90deg, #ff0080, #40e0d0)",
                                                WebkitBackgroundClip: "text",
                                                WebkitTextFillColor: "transparent",
                                            }}
                                        />
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="description"
                                            defaultValue="Light refraction"
                                            className="text-xs text-white/40 mt-1"
                                        />
                                    </div>

                                    {/* Delete Button */}
                                    <DynamicDeleteButton
                                        sectionId={section.id}
                                        className={cn(
                                            "absolute top-3 right-3 z-20 transition-opacity duration-300",
                                            editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>

                                {/* Rainbow reflection */}
                                <div
                                    className="absolute -bottom-4 left-4 right-4 h-8 opacity-40 blur-md"
                                    style={{
                                        background: "linear-gradient(90deg, #ff0080, #ff8c00, #40e0d0, #7b68ee)",
                                    }}
                                />
                            </div>
                        ))}

                        {/* Add Button */}
                        <DynamicAddButton
                            defaultValue="+ Add Prism"
                            className="min-h-[200px] rounded-2xl bg-black/20 backdrop-blur-sm hover:bg-black/30"
                            style={{
                                border: "1px dashed",
                                borderImage: "linear-gradient(135deg, #ff0080, #ff8c00, #40e0d0, #7b68ee) 1",
                            }}
                        />
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          100% { background-position: 200% 50%; }
        }
      `}</style>
        </div>
    );
};

export const HolographicPrismLayout: React.FC<{
    sections: CanvasSectionState[];
    [key: string]: any;
}> = ({ sections, ...props }) => {
    return (
        <DynamicLayoutWrapper
            layout={props.layout}
            onLayoutUpdate={props.onLayoutUpdate}
            sections={sections}
            defaultBackgroundColor="#0a0a0f"
            defaultTextColor="#ffffff"
            {...props}
        >
            <HolographicPrismContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
