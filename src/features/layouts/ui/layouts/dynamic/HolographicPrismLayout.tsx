import React, { useRef, useEffect, useState } from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/shared/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { LayoutControlsPortal } from "./core/LayoutControlsPortal";
import { Info, Plus, Settings2, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useTransform,
  useSpring,
} from "framer-motion";

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

// --- Dynamic Holographic Caustics Background ---
const HoloBackgroundCanvas: React.FC<{
  className?: string;
  themeColor: string;
}> = ({ className, themeColor }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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

    let t = 0;
    const rgb = hexToRgb(themeColor);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // Create shifting spectral light patterns
      for (let i = 0; i < 3; i++) {
        const gradient = ctx.createRadialGradient(
          canvas.width / 2 + Math.sin(t * 0.01 + i) * canvas.width * 0.3,
          canvas.height / 2 + Math.cos(t * 0.015 + i) * canvas.height * 0.2,
          0,
          canvas.width / 2 + Math.sin(t * 0.01 + i) * canvas.width * 0.3,
          canvas.height / 2 + Math.cos(t * 0.02 + i) * canvas.height * 0.2,
          canvas.width * 0.8
        );
        // Blend theme color with prism colors (cyan, magenta, yellow)
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`);
        gradient.addColorStop(
          0.3,
          `rgba(${i === 0 ? 255 : 0}, ${i === 1 ? 255 : 0}, ${i === 2 ? 255 : 0
          }, 0.05)`
        );
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      // Add subtle scanline/interference texture
      ctx.fillStyle = `rgba(${rgb.r},${rgb.g},${rgb.b}, 0.03)`;
      for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y + Math.sin(t * 0.1 + y * 0.01) * 2, canvas.width, 1);
      }

      t++;
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener("resize", resize);
  }, [themeColor]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 w-full h-full pointer-events-none mix-blend-screen",
        className
      )}
    />
  );
};

// --- The Unique 3D Prismatic Card Component ---
const PrismaticCard = ({ section, index, editor, props, themeColor }: any) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // Smooth springs for tilt effect
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [15, -15]), {
    stiffness: 150,
    damping: 20,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-15, 15]), {
    stiffness: 150,
    damping: 20,
  });

  // Refraction effect: move gradient counter to tilt
  const bgX = useSpring(useTransform(x, [-0.5, 0.5], ["20%", "-20%"]), {
    stiffness: 150,
    damping: 20,
  });
  const bgY = useSpring(useTransform(y, [-0.5, 0.5], ["20%", "-20%"]), {
    stiffness: 150,
    damping: 20,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    editor.setHoveredSectionId(null);
  };

  return (
    <motion.div
      ref={cardRef}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative aspect-[4/5] rounded-2xl transition-all duration-300 perspective-1000"
      onMouseMove={handleMouseMove}
      onMouseEnter={() => editor.setHoveredSectionId(section.id)}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Glowing Iridescent Border */}
      <div
        className="absolute -inset-[2px] rounded-2xl bg-[conic-gradient(from_0deg,transparent_0deg,cyan_90deg,magenta_180deg,yellow_270deg,transparent_360deg)] animate-[spin_4s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity blur-sm"
        style={{ zIndex: -2 }}
      />

      {/* 2. Glass Container */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10">
        {/* 3. The Refraction Layer (Moves counter to tilt) */}
        <motion.div
          className="absolute inset-[-50%] opacity-40 mix-blend-overlay pointer-events-none"
          style={{
            x: bgX,
            y: bgY,
            background: `radial-gradient(circle at center, ${themeColor} 0%, transparent 60%), conic-gradient(from 180deg at 50% 50%, #ff0000, #00ff00, #0000ff, #ff0000)`,
          }}
        />

        {/* 4. Content Layer */}
        <div
          className="relative z-10 h-full p-2"
          style={{ transform: "translateZ(20px)" }}
        >
          <GridSectionWrapper
            section={section}
            templateSection={{ id: section.id }}
            isHovered={editor.hoveredSectionId === section.id}
            onSectionDelete={props.onSectionDelete}
            onSectionContentChange={props.onSectionContentChange}
            {...props}
          />
        </div>

        {/* Holographic Sheen Overlay */}
        <div
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-50 transition-opacity duration-500 pointer-events-none"
          style={{ transform: "translateZ(30px)" }}
        />
      </div>

      <div
        className={cn(
          "absolute top-4 right-4 z-50 transition-all duration-300",
          editor.hoveredSectionId === section.id
            ? "opacity-100 scale-100"
            : "opacity-0 scale-90"
        )}
        style={{ transform: "translateZ(40px)" }}
      >
        <DynamicDeleteButton sectionId={section.id} />
      </div>

      {/* Label */}
      <div
        className="absolute bottom-4 left-4 pointer-events-none font-mono text-[10px] uppercase tracking-widest opacity-60"
        style={{ transform: "translateZ(20px)", color: themeColor }}
      >
        Prism 0{index + 1}
      </div>
    </motion.div>
  );
};

const HolographicPrismContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { editor, layout, onLayoutUpdate, colors } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  // Defaults
  const title =
    layout.customSectionData?.["header"]?.["title"] || "HOLOGRAPHIC";
  const subtitle =
    layout.customSectionData?.["header"]?.["subtitle"] ||
    "Prismatic Refraction Engine";

  // Colors
  const bgColor = colors.backgroundColor || "#050505";
  const themeColor = colors.textColor || "#00ffff"; // Default cyan accent

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `prism-${Date.now()}`,
      content: { type: "empty" as const },
    };
    onLayoutUpdate({ ...layout, sections: [...layout.sections, newSection] });
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden font-sans transition-colors duration-500"
      style={{ backgroundColor: bgColor, color: themeColor }}
    >
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#000_100%)] z-0 pointer-events-none opacity-50" />
      <HoloBackgroundCanvas themeColor={themeColor} />

      {/* Scrollable Content */}
      <div
        className="relative z-10 w-full h-full overflow-y-auto"
        style={{ perspective: "2000px" }}
      >
        <div className="flex flex-col items-center min-h-full pb-32">
          {/* Header */}
          <div className="w-full min-h-[45vh] flex flex-col items-center justify-center p-8 text-center">
            <div className="relative">
              {/* Chromatic Aberration Effect behind text */}
              <h1
                className="absolute inset-0 text-8xl md:text-9xl font-black tracking-tighter select-none blur-[1px] opacity-70 animate-pulse"
                aria-hidden="true"
                style={{ color: "red", transform: "translate(-2px, 0)" }}
              >
                {title}
              </h1>
              <h1
                className="absolute inset-0 text-8xl md:text-9xl font-black tracking-tighter select-none blur-[1px] opacity-70 animate-pulse delay-75"
                aria-hidden="true"
                style={{ color: "blue", transform: "translate(2px, 0)" }}
              >
                {title}
              </h1>

              <EditableText
                sectionId="header"
                fieldId="title"
                defaultValue="HOLOGRAPHIC"
                className="relative z-10 text-8xl md:text-9xl font-black tracking-tighter select-none cursor-text bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-transparent"
              />
            </div>

            <EditableText
              sectionId="header"
              fieldId="subtitle"
              defaultValue="Prismatic Refraction Engine"
              className="text-sm md:text-base font-mono tracking-[0.5em] mt-8 uppercase opacity-70 mix-blend-screen"
            />
            <div className="w-px h-16 bg-gradient-to-b from-current to-transparent mt-8 opacity-30" />
          </div>

          {/* 3D Prismatic Grid */}
          <div className="w-full max-w-7xl px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {sections.map((section, i) => (
              <PrismaticCard
                key={section.id}
                section={section}
                index={i}
                editor={editor}
                props={props}
                themeColor={themeColor}
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
                initial={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: 10, scale: 0.95, rotateX: -10 }}
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-4 rounded-xl backdrop-blur-xl border w-72 z-50 shadow-[0_0_30px_rgba(0,0,0,0.3)] origin-bottom"
                style={{
                  backgroundColor: "rgba(5,5,10,0.8)",
                  borderColor: `${themeColor}30`,
                  boxShadow: `0 0 20px ${themeColor}20`,
                }}
              >
                <div
                  className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-wider opacity-80"
                  style={{ color: themeColor }}
                >
                  <Settings2 className="w-3 h-3" /> Holo Emitter
                </div>
                <div className="flex flex-col gap-3 mb-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      editor.handleUpdateText("header", "title", e.target.value)
                    }
                    className="w-full rounded-md px-3 py-2 text-xs focus:outline-none border transition-colors bg-black/20 font-mono"
                    style={{
                      borderColor: `${themeColor}20`,
                      color: themeColor,
                    }}
                    placeholder="HEADER"
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
                    className="w-full rounded-md px-3 py-2 text-xs focus:outline-none border transition-colors bg-black/20 font-mono"
                    style={{
                      borderColor: `${themeColor}20`,
                      color: themeColor,
                    }}
                    placeholder="SUBTITLE"
                  />
                </div>
                <button
                  onClick={handleAddSection}
                  className="w-full py-2.5 font-bold text-xs rounded-md transition-all hover:brightness-110 flex items-center justify-center gap-2 uppercase tracking-wide"
                  style={{
                    background: `linear-gradient(135deg, ${themeColor}, ${themeColor}aa)`,
                    color: bgColor,
                  }}
                >
                  <Plus className="w-3 h-3" /> Project Prism
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-lg border backdrop-blur-md hover:scale-105 active:scale-95"
            style={{
              backgroundColor: showInfo ? themeColor : "rgba(0,0,0,0.3)",
              borderColor: themeColor,
              color: showInfo ? bgColor : themeColor,
              boxShadow: `0 0 15px ${themeColor}40`,
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

export const HolographicPrismLayout: React.FC<any> = (props) => (
  <DynamicLayoutWrapper
    {...props}
    defaultBackgroundColor="#050505"
    defaultTextColor="#00ffff" // Neon Cyan Default
  >
    <HolographicPrismContent {...props} />
  </DynamicLayoutWrapper>
);
