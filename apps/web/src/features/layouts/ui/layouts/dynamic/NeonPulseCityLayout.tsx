import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@caption-cam/core/types/caption";
import { cn } from "@caption-cam/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { LayoutControlsPortal } from "./core/LayoutControlsPortal";
import { Info, Plus, Settings2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- Helper: Hex to RGB for Canvas ---
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
    }
    : { r: 0, g: 0, b: 0 };
};

// --- Neon Grid Canvas ---
const NeonGridCanvas: React.FC<{
  className?: string;
  themeColor: string;
  backgroundColor: string;
}> = ({ className, themeColor, backgroundColor }) => {
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

    let offset = 0;
    const rgbAccent = hexToRgb(themeColor);
    const accentString = `${rgbAccent.r}, ${rgbAccent.g}, ${rgbAccent.b}`;

    const animate = () => {
      // Fill background with user selected color (via context, even if controls hidden)
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Perspective Grid
      const horizon = canvas.height * 0.4;
      const centerX = canvas.width / 2;

      // Vertical lines (Vanishing point)
      ctx.strokeStyle = `rgba(${accentString}, 0.3)`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = -20; i <= 20; i++) {
        const x = centerX + i * 100;
        ctx.moveTo(centerX + i * 5, horizon);
        ctx.lineTo(x * 4, canvas.height);
      }
      ctx.stroke();

      // Horizontal moving lines (The "Floor")
      const speed = 2;
      offset = (offset + speed) % 100;
      ctx.strokeStyle = `rgba(${accentString}, 0.5)`;

      for (let i = 0; i < 30; i++) {
        // Exponential spacing for depth perception
        const progress = (i * 100 + offset) / 3000;
        const y = horizon + Math.pow(progress, 2.5) * (canvas.height - horizon);

        if (y > canvas.height) continue;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Glowing Sun/Moon behind grid
      const gradient = ctx.createLinearGradient(
        centerX,
        horizon - 150,
        centerX,
        horizon
      );
      gradient.addColorStop(0, `rgba(${accentString}, 0.8)`);
      gradient.addColorStop(1, "rgba(255, 0, 255, 0)"); // Fade to magenta/transparent
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, horizon - 50, 150, 0, Math.PI * 2);
      ctx.fill();

      // Scanlines Overlay
      ctx.fillStyle = "rgba(0,0,0,0.2)";
      for (let i = 0; i < canvas.height; i += 4) {
        ctx.fillRect(0, i, canvas.width, 2);
      }

      animationRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [themeColor, backgroundColor]);

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

const NeonPulseCityContent: React.FC<{
  sections: CanvasSectionState[];
  onSectionDelete?: (id: string) => void;
  onSectionContentChange?: any;
  [key: string]: any;
}> = (props) => {
  const { sections, onSectionDelete, onSectionContentChange, ...restProps } = props;
  const { editor, layout, onLayoutUpdate, colors } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  // Data & Defaults
  const title = layout.customSectionData?.["header"]?.["title"] || "NEON CITY";
  const subtitle =
    layout.customSectionData?.["header"]?.["subtitle"] || "SYSTEM ONLINE";

  // Theme Colors
  const neonColor =
    colors.textColor !== "#ffffff" ? colors.textColor : "#00ffff"; // Default Cyan Accent
  const bgColor = colors.backgroundColor || "#05050a"; // Default Dark Blue/Black

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = { id: `neon-${Date.now()}`, content: { type: "empty" as const } };
    onLayoutUpdate({ ...layout, sections: [...layout.sections, newSection] });
  };

  return (
    <div
      className="w-full h-full relative font-mono overflow-hidden selection:bg-pink-500 selection:text-white"
      style={{ backgroundColor: bgColor, color: neonColor }}
    >
      <NeonGridCanvas themeColor={neonColor} backgroundColor={bgColor} />

      {/* Main Scroll Container */}
      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div className="flex flex-col items-center min-h-full pb-32">
          {/* Header */}
          <div className="w-full min-h-[50vh] flex flex-col items-center justify-center p-8 text-center">
            <EditableText
              sectionId="header"
              fieldId="title"
              defaultValue="NEON CITY"
              className="text-6xl md:text-9xl font-black italic tracking-widest bg-clip-text text-transparent bg-gradient-to-b from-white to-white/0 uppercase select-none cursor-text"
              style={{
                WebkitTextStroke: `2px ${neonColor}`,
                filter: `drop-shadow(0 0 20px ${neonColor}80)`,
              }}
            />

            <div
              className="mt-6 px-6 py-2 border bg-black/60 backdrop-blur-md text-sm md:text-base tracking-[0.5em] animate-pulse uppercase"
              style={{
                borderColor: neonColor,
                color: neonColor,
                boxShadow: `0 0 15px ${neonColor}40`,
              }}
            >
              <EditableText
                sectionId="header"
                fieldId="subtitle"
                defaultValue="SYSTEM ONLINE"
              />
            </div>
          </div>

          {/* Grid */}
          <div className="w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="group relative aspect-video bg-black/80 border overflow-hidden hover:scale-[1.02] transition-all duration-300"
                style={{
                  borderColor: `${neonColor}40`,
                  boxShadow: `0 0 20px ${neonColor}10`,
                }}
                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                onMouseLeave={() => editor.setHoveredSectionId(null)}
              >
                {/* Inner Dashed Border */}
                <div
                  className="absolute inset-2 border border-dashed opacity-30 pointer-events-none z-20"
                  style={{ borderColor: neonColor }}
                />

                {/* Content */}
                <div className="w-full h-full relative z-10 p-2">
                  <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id }}
                    isHovered={editor.hoveredSectionId === section.id}
                    onSectionDelete={props.onSectionDelete}
                    onSectionContentChange={props.onSectionContentChange}
                    {...props}
                  />
                </div>

                {/* HUD Corners */}
                <div
                  className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 z-20 transition-colors duration-300"
                  style={{ borderColor: neonColor }}
                />
                <div
                  className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 z-20 transition-colors duration-300"
                  style={{ borderColor: neonColor }}
                />
                <div
                  className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 z-20 transition-colors duration-300"
                  style={{ borderColor: neonColor }}
                />
                <div
                  className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 z-20 transition-colors duration-300"
                  style={{ borderColor: neonColor }}
                />

                {/* Hover Glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none z-0"
                  style={{
                    background: `radial-gradient(circle at center, ${neonColor}, transparent)`,
                  }}
                />

                {/* Delete Button */}
                <div
                  className={cn(
                    "absolute top-4 right-4 z-30 transition-all duration-300",
                    editor.hoveredSectionId === section.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                >
                  <DynamicDeleteButton sectionId={section.id} />
                </div>

                {/* Index Label */}
                <div
                  className="absolute bottom-4 left-4 z-30 font-mono text-[10px] tracking-widest opacity-60"
                  style={{ color: neonColor }}
                >
                  NODE_{String(i + 1).padStart(3, "0")}
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
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-black/90 border p-4 rounded-xl shadow-2xl w-64 z-50 backdrop-blur-md"
                style={{ borderColor: `${neonColor}40` }}
              >
                <div
                  className="text-[10px] tracking-widest mb-3 uppercase flex items-center gap-2"
                  style={{ color: neonColor }}
                >
                  <Settings2 className="w-3 h-3" /> System Config
                </div>

                {/* Text Inputs */}
                <div className="flex flex-col gap-2 mb-3">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      editor.handleUpdateText("header", "title", e.target.value)
                    }
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                    placeholder="TITLE"
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
                    className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-white/30 font-mono"
                    placeholder="SUBTITLE"
                  />
                </div>

                <button
                  onClick={handleAddSection}
                  className="w-full py-2 bg-white/5 hover:bg-white/10 border text-xs font-bold tracking-widest transition-all flex justify-center items-center gap-2 uppercase"
                  style={{ borderColor: neonColor, color: neonColor }}
                >
                  <Plus className="w-3 h-3" /> Add Node
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-full h-12 w-12 bg-black/80 border text-white flex items-center justify-center transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)] hover:scale-105"
            style={{
              borderColor: neonColor,
              color: showInfo ? "#000" : neonColor,
              backgroundColor: showInfo ? neonColor : "rgba(0,0,0,0.8)",
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

export const NeonPulseCityLayout: React.FC<any> = (props) => (
  <DynamicLayoutWrapper
    {...props}
    defaultBackgroundColor="#05050a"
    defaultTextColor="#00ffff" // Default Neon Cyan
  >
    <NeonPulseCityContent {...props} />
  </DynamicLayoutWrapper>
);
