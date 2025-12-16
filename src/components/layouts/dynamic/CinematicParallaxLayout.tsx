import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

gsap.registerPlugin(ScrollTrigger);

const CinematicParallaxContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({
    sections,
    ...props
}) => {
    const { colors, editor, controlsVisible, layout } = useDynamicLayout();
    const containerRef = useRef<HTMLDivElement>(null);
    const layersRef = useRef<HTMLDivElement[]>([]);
    const cardsRef = useRef<HTMLDivElement[]>([]);

    useEffect(() => {
        if (!containerRef.current) return;

        const ctx = gsap.context(() => {
            // Parallax layers
            layersRef.current.forEach((layer, i) => {
                if (!layer) return;
                const speed = 1 - i * 0.15;

                gsap.to(layer, {
                    yPercent: -30 * speed,
                    ease: "none",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top top",
                        end: "bottom top",
                        scrub: 1,
                    },
                });
            });

            // Card animations
            cardsRef.current.forEach((card, i) => {
                if (!card) return;

                gsap.fromTo(
                    card,
                    {
                        y: 100,
                        opacity: 0,
                        scale: 0.9,
                    },
                    {
                        y: 0,
                        opacity: 1,
                        scale: 1,
                        duration: 1,
                        delay: i * 0.1,
                        ease: "power3.out",
                        scrollTrigger: {
                            trigger: card,
                            start: "top bottom-=100",
                            toggleActions: "play none none reverse",
                        },
                    }
                );
            });
        }, containerRef);

        return () => ctx.revert();
    }, [sections.length]);

    return (
        <div
            ref={containerRef}
            className="w-full h-full overflow-y-auto overflow-x-hidden relative"
            style={{ backgroundColor: colors.backgroundColor }}
        >
            {/* Cinematic Letterbox */}
            <div className="fixed top-0 left-0 right-0 h-[8vh] bg-black z-50" />
            <div className="fixed bottom-0 left-0 right-0 h-[8vh] bg-black z-50" />

            {/* Parallax Background Layers */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                {/* Far background - stars/atmosphere */}
                <div
                    ref={(el) => {
                        if (el) layersRef.current[0] = el;
                    }}
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(ellipse at center, #1a1a2e 0%, #0a0a0f 100%)",
                    }}
                >
                    {/* Stars */}
                    {Array.from({ length: 50 }).map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-white rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                opacity: Math.random() * 0.5 + 0.2,
                                animation: `twinkle ${2 + Math.random() * 3}s infinite`,
                            }}
                        />
                    ))}
                </div>

                {/* Mid-ground - fog/mist */}
                <div
                    ref={(el) => {
                        if (el) layersRef.current[1] = el;
                    }}
                    className="absolute inset-0 opacity-30"
                    style={{
                        background:
                            "linear-gradient(to top, transparent 0%, rgba(100,100,150,0.3) 50%, transparent 100%)",
                    }}
                />

                {/* Foreground mist - blurred for DOF effect */}
                <div
                    ref={(el) => {
                        if (el) layersRef.current[2] = el;
                    }}
                    className="absolute inset-x-0 bottom-0 h-1/3 opacity-50"
                    style={{
                        background: "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
                        filter: "blur(2px)",
                    }}
                />
            </div>

            {/* Film grain overlay */}
            <div
                className="fixed inset-0 z-40 pointer-events-none opacity-10 mix-blend-overlay"
                style={{
                    backgroundImage:
                        'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.8\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
                }}
            />

            {/* Content */}
            <div className="relative z-20 min-h-screen pt-[12vh] pb-[12vh]">
                {/* Hero Section */}
                <div className="h-screen flex flex-col items-center justify-center text-center px-8">
                    <EditableText
                        sectionId="header"
                        fieldId="title"
                        defaultValue="CINEMATIC"
                        className="text-7xl md:text-9xl font-thin tracking-[0.3em]"
                        style={{
                            color: "rgba(255,255,255,0.9)",
                            textShadow: "0 0 60px rgba(255,255,255,0.3)",
                        }}
                    />
                    <EditableText
                        sectionId="header"
                        fieldId="subtitle"
                        defaultValue="Depth of Field"
                        className="text-2xl md:text-3xl font-extralight tracking-[0.5em] mt-6"
                        style={{ color: "rgba(255,255,255,0.5)" }}
                    />
                    <div className="mt-12 animate-bounce">
                        <svg
                            className="w-8 h-8 text-white/30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                            />
                        </svg>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="px-6 pb-16">
                    <div className="max-w-5xl mx-auto space-y-32">
                        {sections.map((section, i) => (
                            <div
                                key={section.id}
                                ref={(el) => {
                                    if (el) cardsRef.current[i] = el;
                                }}
                                className={cn(
                                    "relative group",
                                    i % 2 === 0 ? "ml-0 mr-auto" : "mr-0 ml-auto",
                                    "w-full md:w-[70%]"
                                )}
                                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                                onMouseLeave={() => editor.setHoveredSectionId(null)}
                            >
                                {/* Cinematic frame */}
                                <div
                                    className={cn(
                                        "relative overflow-hidden transition-all duration-700",
                                        "bg-black/40 backdrop-blur-sm border border-white/10",
                                        "group-hover:border-white/20 group-hover:bg-black/50"
                                    )}
                                    style={{
                                        aspectRatio: "2.39/1", // Anamorphic widescreen
                                        boxShadow:
                                            "0 0 60px rgba(0,0,0,0.5), inset 0 0 60px rgba(0,0,0,0.3)",
                                    }}
                                >
                                    <GridSectionWrapper
                                        section={section}
                                        templateSection={{ id: section.id, name: `Scene-${i + 1}` }}
                                        isHovered={editor.hoveredSectionId === section.id}
                                        onSectionDelete={props.onSectionDelete}
                                        onSectionContentChange={props.onSectionContentChange}
                                        {...props}
                                    />

                                    {/* Vignette */}
                                    <div
                                        className="absolute inset-0 pointer-events-none"
                                        style={{
                                            background:
                                                "radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.5) 100%)",
                                        }}
                                    />

                                    {/* Delete Button */}
                                    <DynamicDeleteButton
                                        sectionId={section.id}
                                        className={cn(
                                            "absolute top-4 right-4 transition-opacity duration-300",
                                            editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </div>

                                {/* Scene info */}
                                <div className="mt-6 flex justify-between items-end">
                                    <div>
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="label"
                                            defaultValue={`SCENE ${String(i + 1).padStart(2, "0")}`}
                                            className="text-xs tracking-[0.3em] text-white/40"
                                        />
                                        <EditableText
                                            sectionId={section.id}
                                            fieldId="title"
                                            defaultValue="Untitled Scene"
                                            className="text-2xl font-light text-white/80 mt-2"
                                        />
                                    </div>
                                    <EditableText
                                        sectionId={section.id}
                                        fieldId="timecode"
                                        defaultValue="00:00:00:00"
                                        className="text-xs font-mono text-white/30"
                                    />
                                </div>
                            </div>
                        ))}

                        {/* Add Button */}
                        <div className="flex justify-center pt-16">
                            <DynamicAddButton
                                defaultValue="+ Add Scene"
                                className="w-full md:w-[70%] aspect-[2.39/1] bg-black/20 border border-dashed border-white/20 hover:border-white/40 backdrop-blur-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.8; }
        }
      `}</style>
        </div>
    );
};

export const CinematicParallaxLayout: React.FC<{
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
            <CinematicParallaxContent sections={sections} {...props} />
        </DynamicLayoutWrapper>
    );
};
