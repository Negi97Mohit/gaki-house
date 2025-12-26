import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState, CanvasLayoutState } from "@/types/caption";
import { cn } from "@/shared/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { LayoutControlsPortal } from "./core/LayoutControlsPortal";
import { Info, Plus, Settings2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- Helper: Hex to RGBA for Trail Effect ---
const hexToRgba = (hex: string, alpha: number) => {
  let r = 0,
    g = 0,
    b = 0;
  // Handle short #FFF
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  }
  // Handle standard #FFFFFF
  else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  return `rgba(${r},${g},${b},${alpha})`;
};

// --- Aurora Canvas (Background) ---
const AuroraCanvas: React.FC<{ className?: string; baseColor: string }> = ({
  className,
  baseColor,
}) => {
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

    let time = 0;
    const waves = Array.from({ length: 3 }).map((_, i) => ({
      y: canvas.height * (0.4 + i * 0.15),
      amplitude: 80 + Math.random() * 100,
      frequency: 0.001 + Math.random() * 0.002,
      speed: 0.2 + Math.random() * 0.3,
      hue: 140 + i * 40, // Emerald to Teal
    }));

    const animate = () => {
      // Use the user-selected base color with 20% opacity for the trail effect
      ctx.fillStyle = hexToRgba(baseColor, 0.2);
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      waves.forEach((wave) => {
        ctx.beginPath();
        ctx.moveTo(0, wave.y);

        for (let x = 0; x < canvas.width; x += 10) {
          const y =
            wave.y +
            Math.sin((x + time * wave.speed) * wave.frequency) *
            wave.amplitude +
            Math.sin((x * 0.5 + time * wave.speed * 0.5) * wave.frequency * 2) *
            (wave.amplitude * 0.3);
          ctx.lineTo(x, y);
        }

        ctx.lineTo(canvas.width, canvas.height);
        ctx.lineTo(0, canvas.height);
        ctx.closePath();

        const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        // Aurora colors remain static/vibrant to contrast with background
        gradient.addColorStop(0, `hsla(${wave.hue}, 85%, 60%, 0)`);
        gradient.addColorStop(0.5, `hsla(${wave.hue}, 85%, 60%, 0.15)`);
        gradient.addColorStop(1, `hsla(${wave.hue}, 85%, 40%, 0)`);

        ctx.fillStyle = gradient;
        ctx.fill();
      });

      time++;
      animationRef.current = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationRef.current);
    };
  }, [baseColor]); // Re-run effect when baseColor changes

  return (
    <canvas
      ref={canvasRef}
      className={cn("fixed inset-0 w-full h-full", className)}
    />
  );
};

const AuroraBorealisContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { colors, editor, layout, onLayoutUpdate } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  // Customize text data (used for input values in control island)
  const title = layout.customSectionData?.["header"]?.["title"] || "AURORA";
  const subtitle =
    layout.customSectionData?.["header"]?.["subtitle"] || "Borealis Flow";

  // Use the dynamic background color from context/layout
  const bgColor = colors.backgroundColor || "#02060c";

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `aurora-${Date.now()}`,
      content: { type: "empty" },
    };
    onLayoutUpdate({
      ...layout,
      sections: [...layout.sections, newSection],
    });
  };

  // Helper to update background color in layout state
  const handleColorChange = (newColor: string) => {
    if (!onLayoutUpdate) return;
    onLayoutUpdate({
      ...layout,
      customSectionStyles: {
        ...(layout.customSectionStyles || {}),
        _global: {
          ...(layout.customSectionStyles?._global || {}),
          background: newColor,
        },
      },
    });
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden transition-colors duration-500"
      style={{ backgroundColor: bgColor, color: colors.textColor }}
    >
      {/* Background Layers */}
      <AuroraCanvas baseColor={bgColor} />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />

      {/* Main Scroll Container */}
      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div className="min-h-full flex flex-col items-center pb-32">
          {/* Hero Header - Scrolls away */}
          <div className="w-full min-h-[50vh] flex flex-col items-center justify-center text-center p-12">
            {/* Editable Title */}
            <EditableText
              sectionId="header"
              fieldId="title"
              defaultValue="AURORA"
              className="text-8xl md:text-9xl font-thin tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 select-none cursor-text"
              style={{ fontFamily: "'Inter', sans-serif" }}
            />
            {/* Editable Subtitle */}
            <EditableText
              sectionId="header"
              fieldId="subtitle"
              defaultValue="Borealis Flow"
              className="text-xl font-light tracking-[0.5em] text-emerald-200/50 mt-4 uppercase cursor-text"
            />
          </div>

          {/* Grid Content */}
          <div className="w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="group relative aspect-[4/5] rounded-xl overflow-hidden backdrop-blur-md bg-white/5 border border-white/10 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-500 hover:shadow-[0_0_50px_-10px_rgba(16,185,129,0.3)]"
                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                onMouseLeave={() => editor.setHoveredSectionId(null)}
              >
                {/* Inner Content */}
                <div className="absolute inset-0 p-4 pb-16">
                  <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id }}
                    isHovered={editor.hoveredSectionId === section.id}
                    onSectionDelete={props.onSectionDelete}
                    onSectionContentChange={props.onSectionContentChange}
                    {...props}
                  />
                </div>

                {/* Bottom Label - Now Editable */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
                  <EditableText
                    sectionId={section.id}
                    fieldId="label"
                    defaultValue={`0${i + 1} / ${title}`}
                    className="text-xs font-mono text-emerald-300/80 tracking-widest cursor-text"
                  />
                </div>

                {/* Delete Btn */}
                <div
                  className={cn(
                    "absolute top-2 right-2 transition-opacity duration-300",
                    editor.hoveredSectionId === section.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                >
                  <DynamicDeleteButton sectionId={section.id} />
                </div>
              </div>
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
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-black/80 p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl w-72 flex flex-col gap-4 origin-bottom z-50"
              >
                {/* Header Controls */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-white/50 uppercase font-mono tracking-wider flex items-center gap-2">
                    <Settings2 className="w-3 h-3" /> Layout Settings
                  </label>

                  {/* Text Inputs (Sync with on-canvas edits) */}
                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      editor.handleUpdateText("header", "title", e.target.value)
                    }
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="Title"
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
                    className="bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                    placeholder="Subtitle"
                  />

                  {/* Background Color Picker */}
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] text-white/50 uppercase font-mono">
                      Background
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={bgColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-6 h-6 rounded cursor-pointer bg-transparent border-none p-0"
                      />
                      <span className="text-[10px] text-white/40 font-mono">
                        {bgColor}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Separator */}
                <div className="h-px bg-white/10 w-full" />

                {/* Add Button */}
                <button
                  onClick={handleAddSection}
                  className="w-full py-2 rounded-lg bg-emerald-900/30 hover:bg-emerald-800/50 border border-emerald-500/30 text-emerald-100 text-xs font-medium tracking-wide transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-3 h-3" /> ADD PANEL
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              "rounded-full h-10 w-10 flex items-center justify-center transition-all shadow-lg",
              showInfo
                ? "bg-white text-black"
                : "bg-black/60 text-white border border-white/10 hover:bg-black/80"
            )}
          >
            {showInfo ? (
              <X className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </button>
        </div>
      </LayoutControlsPortal>
    </div>
  );
};

export const AuroraBorealisLayout: React.FC<{
  sections: CanvasSectionState[];
  layout: CanvasLayoutState;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}> = (props) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={props.sections}
      defaultBackgroundColor="#02060c"
      defaultTextColor="#fff"
    >
      <AuroraBorealisContent {...props} />
    </DynamicLayoutWrapper>
  );
};
