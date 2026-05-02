import React, { useRef, useEffect, useState } from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@gaki/core/types/caption";
import { cn } from "@gaki/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { LayoutControlsPortal } from "./core/LayoutControlsPortal";
import { Info, Plus, Settings2, X, Clapperboard } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useSpring,
} from "framer-motion";

// --- Film Grain & Projector Flicker Canvas ---
const FilmGrainCanvas: React.FC<{ className?: string; opacity: number }> = ({
  className,
  opacity,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth / 2; // Low res for performance & chunkier grain
      canvas.height = window.innerHeight / 2;
    };
    resize();
    window.addEventListener("resize", resize);

    let frame = 0;

    const animate = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Random Noise
      const imageData = ctx.createImageData(w, h);
      const buffer = new Uint32Array(imageData.data.buffer);

      for (let i = 0; i < buffer.length; i++) {
        if (Math.random() < 0.1) {
          // 10% noise density
          // Random grey value
          const val = Math.random() * 50;
          buffer[i] = (255 << 24) | (val << 16) | (val << 8) | val;
        }
      }
      ctx.putImageData(imageData, 0, 0);

      // Projector Flicker (Global brightness shift)
      if (frame % 3 === 0) {
        ctx.fillStyle = `rgba(255, 255, 255, ${Math.random() * 0.05})`;
        ctx.fillRect(0, 0, w, h);
      }

      // Occasional "Scratch" line
      if (Math.random() > 0.98) {
        const x = Math.random() * w;
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 w-full h-full pointer-events-none mix-blend-overlay",
        className
      )}
      style={{ opacity }}
    />
  );
};

// --- Cinematic Frame Component (With Focus Pull) ---
const CinemaFrame = ({ section, index, editor, props, textColor }: any) => {
  const ref = useRef<HTMLDivElement>(null);

  // Scroll progress for this specific element relative to viewport
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  // Dynamic Focus Pull Logic:
  // 0.5 is the center of the screen. We want sharpest focus there.
  // As it moves to 0 (top) or 1 (bottom), it blurs.
  const blur = useTransform(
    scrollYProgress,
    [0, 0.3, 0.5, 0.7, 1],
    ["8px", "0px", "0px", "0px", "8px"]
  );
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.5, 0.8, 1],
    [0.3, 1, 1, 1, 0.3]
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.9, 1, 0.9]);

  // Smooth out the values
  const smoothBlur = useSpring(blur, { stiffness: 200, damping: 30 });
  const smoothScale = useSpring(scale, { stiffness: 200, damping: 30 });

  return (
    <motion.div
      ref={ref}
      style={{
        filter: useTransform(smoothBlur, (v) => `blur(${v})`),
        opacity,
        scale: smoothScale,
      }}
      className="group relative w-full aspect-[2.39/1] bg-black border-y-8 border-black overflow-hidden shadow-2xl my-12"
      onMouseEnter={() => editor.setHoveredSectionId(section.id)}
      onMouseLeave={() => editor.setHoveredSectionId(null)}
    >
      {/* Film Strip Sprockets */}
      <div className="absolute top-0 bottom-0 left-0 w-8 bg-[#111] z-20 flex flex-col justify-between py-2 border-r border-white/10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-6 bg-transparent border border-white/20 rounded-sm mx-auto shadow-[inset_0_0_5px_rgba(0,0,0,1)]"
          />
        ))}
      </div>
      <div className="absolute top-0 bottom-0 right-0 w-8 bg-[#111] z-20 flex flex-col justify-between py-2 border-l border-white/10">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="w-4 h-6 bg-transparent border border-white/20 rounded-sm mx-auto shadow-[inset_0_0_5px_rgba(0,0,0,1)]"
          />
        ))}
      </div>

      {/* Main Content Area */}
      <div className="absolute inset-x-8 inset-y-0 bg-[#050505] relative">
        <GridSectionWrapper
          section={section}
          templateSection={{ id: section.id }}
          isHovered={editor.hoveredSectionId === section.id}
          onSectionDelete={props.onSectionDelete}
          onSectionContentChange={props.onSectionContentChange}
          {...props}
        />

        {/* Cinema Scope Letterbox Bars (Simulated overlay) */}
        <div className="absolute top-0 left-0 right-0 h-[10%] bg-black/80 z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-[10%] bg-black/80 z-10 pointer-events-none" />
      </div>

      {/* Metadata Overlay */}
      <div
        className="absolute bottom-4 left-12 z-30 font-mono text-[10px] tracking-widest opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ color: textColor }}
      >
        SCENE_{String(index + 1).padStart(3, "0")} // RAW
      </div>

      <div
        className={cn(
          "absolute top-4 right-12 z-50 transition-all duration-300",
          editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0"
        )}
      >
        <DynamicDeleteButton sectionId={section.id} />
      </div>
    </motion.div>
  );
};

const CinematicParallaxContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { editor, layout, onLayoutUpdate, colors } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  // Defaults
  const title = layout.customSectionData?.["header"]?.["title"] || "CINEMATIC";
  const subtitle =
    layout.customSectionData?.["header"]?.["subtitle"] || "Director's Cut";

  // Colors
  const bgColor = colors.backgroundColor || "#050505";
  const textColor = colors.textColor || "#ffffff";

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `scene-${Date.now()}`,
      content: { type: "empty" as const },
    };
    onLayoutUpdate({ ...layout, sections: [...layout.sections, newSection] });
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden font-sans transition-colors duration-700"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <FilmGrainCanvas opacity={0.4} />

      {/* Vignette */}
      <div className="fixed inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

      {/* Scrollable Content */}
      <div className="relative z-20 w-full h-full overflow-y-auto">
        <div className="flex flex-col items-center min-h-full pb-48">
          {/* Main Title Card */}
          <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8 text-center">
            <div
              className="border-y-2 py-4 mb-4 opacity-30"
              style={{ borderColor: textColor }}
            >
              <Clapperboard className="w-8 h-8 mx-auto" />
            </div>
            <EditableText
              sectionId="header"
              fieldId="title"
              defaultValue="CINEMATIC"
              className="text-7xl md:text-9xl font-serif tracking-widest uppercase select-none cursor-text"
              style={{
                textShadow: `0 0 50px ${textColor}40`,
              }}
            />
            <EditableText
              sectionId="header"
              fieldId="subtitle"
              defaultValue="Director's Cut"
              className="text-xs md:text-sm font-sans tracking-[0.5em] mt-6 uppercase opacity-60"
            />
          </div>

          {/* The Film Strip */}
          <div className="w-full max-w-4xl px-4 flex flex-col items-center">
            {sections.map((section, i) => (
              <CinemaFrame
                key={section.id}
                section={section}
                index={i}
                editor={editor}
                props={props}
                textColor={textColor}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Control Island */}
      <LayoutControlsPortal>
        <div className="relative">
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-4 rounded-md border w-72 z-50 shadow-2xl backdrop-blur-xl"
                style={{
                  backgroundColor: bgColor === "#ffffff" ? "#f5f5f5" : "#111",
                  borderColor: `${textColor}20`,
                }}
              >
                <div
                  className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-wider opacity-60"
                  style={{ color: textColor }}
                >
                  <Settings2 className="w-3 h-3" /> Production Settings
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      editor.handleUpdateText("header", "title", e.target.value)
                    }
                    className="w-full rounded-sm px-3 py-2 text-xs focus:outline-none border-b transition-colors font-serif bg-transparent"
                    style={{
                      borderColor: `${textColor}30`,
                      color: textColor,
                    }}
                    placeholder="Movie Title"
                  />
                  <input
                    type="text"
                    value={subtitle}
                    onChange={(e) =>
                      editor.handleUpdateText(
                        "header",
                        "subtitle",
                        e.target.value
                      )
                    }
                    className="w-full rounded-sm px-3 py-2 text-xs focus:outline-none border-b transition-colors font-sans bg-transparent"
                    style={{
                      borderColor: `${textColor}30`,
                      color: textColor,
                    }}
                    placeholder="Production Tagline"
                  />
                </div>

                <button
                  onClick={handleAddSection}
                  className="w-full py-2.5 font-bold text-[10px] uppercase tracking-widest transition-all hover:bg-white/10 flex items-center justify-center gap-2 border"
                  style={{
                    borderColor: textColor,
                    color: textColor,
                  }}
                >
                  <Plus className="w-3 h-3" /> Add Scene
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-lg border"
            style={{
              backgroundColor: showInfo ? textColor : "transparent",
              borderColor: textColor,
              color: showInfo ? bgColor : textColor,
            }}
          >
            {showInfo ? (
              <X className="w-5 h-5" />
            ) : (
              <Info className="w-5 h-5" />
            )}
          </button>
        </div>
      </LayoutControlsPortal>
    </div>
  );
};

export const CinematicParallaxLayout: React.FC<any> = (props) => (
  <DynamicLayoutWrapper
    {...props}
    defaultBackgroundColor="#050505"
    defaultTextColor="#ffffff"
  >
    <CinematicParallaxContent {...props} />
  </DynamicLayoutWrapper>
);
