import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/shared/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { LayoutControlsPortal } from "./core/LayoutControlsPortal";
import { Info, Plus, Settings2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- Helper: Hex to RGB ---
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : { r: 255, g: 255, b: 255 };
};

// --- Interactive Parallax Starfield ---
const StarfieldCanvas: React.FC<{ className?: string; starColor: string }> = ({
  className,
  starColor,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

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

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = (e.clientX - window.innerWidth / 2) * 0.05;
      mouseRef.current.targetY = (e.clientY - window.innerHeight / 2) * 0.05;
    };
    window.addEventListener("mousemove", handleMouseMove);

    const rgb = hexToRgb(starColor);
    const colorString = `${rgb.r},${rgb.g},${rgb.b}`;

    // Create Stars with depth (z-index simulation)
    const stars = Array.from({ length: 150 }).map(() => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      z: Math.random() * 2 + 0.5, // Depth factor
      size: Math.random() * 1.5,
      blinkSpeed: Math.random() * 0.05,
      blinkOffset: Math.random() * Math.PI * 2,
    }));

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smooth mouse follow
      mouseRef.current.x +=
        (mouseRef.current.targetX - mouseRef.current.x) * 0.1;
      mouseRef.current.y +=
        (mouseRef.current.targetY - mouseRef.current.y) * 0.1;

      stars.forEach((star) => {
        // Parallax movement based on 'z' depth
        const offsetX = mouseRef.current.x * star.z;
        const offsetY = mouseRef.current.y * star.z;

        let x = star.x + offsetX;
        let y = star.y + offsetY;

        // Wrap around
        x = (x + canvas.width) % canvas.width;
        y = (y + canvas.height) % canvas.height;

        // Twinkle
        const opacity =
          0.3 + Math.sin(time * star.blinkSpeed + star.blinkOffset) * 0.3;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${colorString}, ${opacity})`;
        ctx.arc(x, y, star.size * star.z * 0.8, 0, Math.PI * 2);
        ctx.fill();

        // Occasional glow on big stars
        if (star.z > 1.5 && opacity > 0.5) {
          ctx.beginPath();
          ctx.fillStyle = `rgba(${colorString}, ${opacity * 0.1})`;
          ctx.arc(x, y, star.size * 6, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      time++;
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [starColor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 w-full h-full pointer-events-none",
        className
      )}
    />
  );
};

const ParticleUniverseContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { editor, layout, onLayoutUpdate, colors } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);
  const cardsRef = useRef<HTMLDivElement[]>([]);

  // Config
  const title = layout.customSectionData?.["header"]?.["title"] || "UNIVERSE";
  const subtitle =
    layout.customSectionData?.["header"]?.["subtitle"] || "EXPLORE THE VOID";
  const textColor = colors.textColor || "#ffffff";
  const bgColor = colors.backgroundColor || "#0B0B15";

  // Zero-Gravity Float Animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        const duration = 3 + Math.random() * 2;
        const yOffset = 10 + Math.random() * 15;
        const rotation = (Math.random() - 0.5) * 4;

        gsap.to(card, {
          y: yOffset,
          rotation: rotation,
          duration: duration,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.2,
        });
      });
    });
    return () => ctx.revert();
  }, [sections.length]);

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = { id: `orb-${Date.now()}`, content: { type: "empty" as const } };
    onLayoutUpdate({ ...layout, sections: [...layout.sections, newSection] });
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden transition-colors duration-700 font-sans"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Ambient Nebula Layers */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen"
        style={{
          background: `
                        radial-gradient(circle at 20% 30%, ${textColor}15 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, ${textColor}10 0%, transparent 50%)
                     `,
        }}
      />

      <StarfieldCanvas className="z-0" starColor={textColor} />

      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div className="flex flex-col items-center min-h-full pb-32">
          {/* Header */}
          <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
            <EditableText
              sectionId="header"
              fieldId="title"
              defaultValue="UNIVERSE"
              className="text-7xl md:text-9xl font-thin tracking-[0.2em] bg-transparent text-center select-none cursor-text transition-all duration-300 uppercase"
              style={{
                color: textColor,
                textShadow: `0 0 30px ${textColor}40`,
              }}
            />
            <div
              className="h-px w-24 mt-8 opacity-50"
              style={{
                background: `linear-gradient(90deg, transparent, ${textColor}, transparent)`,
              }}
            />
            <EditableText
              sectionId="header"
              fieldId="subtitle"
              defaultValue="EXPLORE THE VOID"
              className="mt-4 text-xs md:text-sm font-light tracking-[0.5em] uppercase opacity-60"
            />
          </div>

          {/* Floating Grid */}
          <div className="w-full max-w-7xl px-6 flex flex-wrap justify-center gap-16">
            {sections.map((section, i) => (
              <div
                key={section.id}
                ref={(el) => {
                  if (el) cardsRef.current[i] = el;
                }}
                className="group relative w-[280px] h-[350px] rounded-[2rem] border bg-white/5 backdrop-blur-md transition-all duration-500 hover:bg-white/10 hover:shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                style={{ borderColor: `${textColor}20` }}
                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                onMouseLeave={() => editor.setHoveredSectionId(null)}
              >
                {/* Content Area */}
                <div className="absolute inset-2 rounded-[1.5rem] overflow-hidden">
                  <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id }}
                    isHovered={editor.hoveredSectionId === section.id}
                    onSectionDelete={props.onSectionDelete}
                    onSectionContentChange={props.onSectionContentChange}
                    {...props}
                  />
                </div>

                {/* Orbital Ring (Decoration) */}
                <div
                  className="absolute -inset-6 border rounded-full opacity-0 group-hover:opacity-20 transition-all duration-700 scale-90 group-hover:scale-100 pointer-events-none"
                  style={{ borderColor: textColor }}
                />

                {/* Controls Overlay */}
                <div
                  className={cn(
                    "absolute top-4 right-4 z-50 transition-all duration-300",
                    editor.hoveredSectionId === section.id
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2"
                  )}
                >
                  <DynamicDeleteButton sectionId={section.id} />
                </div>

                {/* Label */}
                <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none">
                  <span className="text-[10px] tracking-widest opacity-40 uppercase">
                    Orbit {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Controls */}
      <LayoutControlsPortal>
        <div className="relative">
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-[#0B0B15]/95 p-4 rounded-2xl border border-white/10 w-72 z-50 backdrop-blur-xl shadow-2xl"
              >
                <div
                  className="flex items-center gap-2 mb-4 text-[10px] uppercase tracking-widest opacity-60"
                  style={{ color: textColor }}
                >
                  <Settings2 className="w-3 h-3" /> Cosmos Config
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={title}
                      onChange={(e) =>
                        editor.handleUpdateText(
                          "header",
                          "title",
                          e.target.value
                        )
                      }
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-white/30 transition-colors"
                      style={{ color: textColor }}
                      placeholder="Headline"
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
                      className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 text-xs focus:outline-none focus:border-white/30 transition-colors"
                      style={{ color: textColor }}
                      placeholder="Sub-headline"
                    />
                  </div>
                </div>

                <button
                  onClick={handleAddSection}
                  className="w-full py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg transition-colors flex items-center justify-center gap-2 text-xs font-bold tracking-wide group"
                  style={{ color: textColor }}
                >
                  <Plus className="w-3.5 h-3.5 group-hover:rotate-90 transition-transform" />{" "}
                  ADD ORBIT
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-full h-12 w-12 bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all shadow-lg"
            style={{ color: textColor }}
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

export const ParticleUniverseLayout: React.FC<any> = (props) => (
  <DynamicLayoutWrapper
    {...props}
    defaultBackgroundColor="#0B0B15"
    defaultTextColor="#ffffff"
  >
    <ParticleUniverseContent {...props} />
  </DynamicLayoutWrapper>
);
