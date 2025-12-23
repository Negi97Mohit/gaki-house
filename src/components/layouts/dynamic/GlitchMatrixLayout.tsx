import React, { useRef, useEffect, useState } from "react";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
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
    : { r: 0, g: 255, b: 0 };
};

// --- Matrix Rain Canvas ---
const MatrixRainCanvas: React.FC<{ className?: string; color: string }> = ({
  className,
  color,
}) => {
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

    const chars = "01XYZ_<>[]";
    const fontSize = 14;
    const columns = canvas.width / fontSize;
    const drops: number[] = new Array(Math.ceil(columns)).fill(1);

    const animate = () => {
      // Fade out
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw chars
      ctx.fillStyle = color;
      ctx.font = fontSize + "px monospace";

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener("resize", resize);
  }, [color]);
  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "fixed inset-0 w-full h-full opacity-30 pointer-events-none",
        className
      )}
    />
  );
};

const GlitchMatrixContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { editor, layout, onLayoutUpdate, colors } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  // Data & Defaults
  const title =
    layout.customSectionData?.["header"]?.["title"] || "SYSTEM_BREACH";

  // Use colors from context
  const systemColor = colors.textColor;
  const bgColor = colors.backgroundColor;

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `glitch-${Date.now()}`,
      content: { type: "empty" as const },
    };
    onLayoutUpdate({ ...layout, sections: [...layout.sections, newSection] });
  };

  return (
    <div
      className="w-full h-full relative font-mono overflow-hidden selection:bg-white selection:text-black transition-colors duration-300"
      style={{ backgroundColor: bgColor, color: systemColor }}
    >
      <MatrixRainCanvas color={systemColor} />

      {/* Scanlines Overlay */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-20 pointer-events-none bg-[length:100%_2px,3px_100%] opacity-20" />

      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div className="flex flex-col items-center min-h-full pb-32">
          {/* Header */}
          <div className="w-full min-h-[40vh] flex flex-col items-center justify-center p-8">
            <EditableText
              sectionId="header"
              fieldId="title"
              defaultValue="SYSTEM_BREACH"
              className="text-6xl md:text-8xl font-bold tracking-tighter mix-blend-screen animate-pulse uppercase select-none cursor-text bg-transparent text-center"
              style={{
                color: systemColor,
                textShadow: `0 0 10px ${systemColor}`,
              }}
            />
            <div
              className="mt-4 px-2 py-1 text-sm font-bold animate-pulse"
              style={{ backgroundColor: systemColor, color: bgColor }}
            >
              ACCESS GRANTED
            </div>
          </div>

          {/* Grid */}
          <div className="w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="group relative border transition-colors duration-200"
                style={{
                  backgroundColor: bgColor,
                  borderColor: `${systemColor}40`,
                }}
                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                onMouseLeave={() => editor.setHoveredSectionId(null)}
              >
                {/* Terminal Header */}
                <div
                  className="px-2 py-1 flex justify-between items-center border-b"
                  style={{
                    backgroundColor: `${systemColor}20`,
                    borderColor: `${systemColor}40`,
                  }}
                >
                  <span className="text-[10px] opacity-80">
                    TERMINAL_{String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500 opacity-50" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500 opacity-50" />
                    <div
                      className="w-2 h-2 rounded-full opacity-80"
                      style={{ backgroundColor: systemColor }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="aspect-video relative overflow-hidden">
                  <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id }}
                    isHovered={editor.hoveredSectionId === section.id}
                    onSectionDelete={props.onSectionDelete}
                    onSectionContentChange={props.onSectionContentChange}
                    {...props}
                  />
                </div>

                {/* Delete Button */}
                <div
                  className={cn(
                    "absolute top-8 right-2 z-20 transition-opacity duration-200",
                    editor.hoveredSectionId === section.id
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                >
                  <DynamicDeleteButton sectionId={section.id} />
                </div>

                {/* Hover Effect: Bright Borders */}
                <div
                  className="absolute inset-0 border-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
                  style={{ borderColor: systemColor }}
                />
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
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-black border p-4 w-64 z-50 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                style={{ borderColor: systemColor }}
              >
                <div
                  className="flex items-center gap-2 mb-3 text-[10px] uppercase font-bold tracking-widest opacity-80"
                  style={{ color: systemColor }}
                >
                  <Settings2 className="w-3 h-3" /> Root Access
                </div>

                <div className="space-y-3 mb-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      editor.handleUpdateText("header", "title", e.target.value)
                    }
                    className="w-full bg-white/5 border rounded px-2 py-1 text-xs focus:outline-none transition-colors font-mono"
                    style={{
                      borderColor: `${systemColor}40`,
                      color: systemColor,
                    }}
                    placeholder="SYSTEM NAME"
                  />
                </div>

                <button
                  onClick={handleAddSection}
                  className="w-full py-2 hover:bg-white/10 font-bold text-xs uppercase transition-colors flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: systemColor,
                    color: bgColor,
                  }}
                >
                  <Plus className="w-3 h-3" /> INIT_NODE
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-none h-10 w-10 bg-black border flex items-center justify-center hover:bg-white/10 transition-colors shadow-lg"
            style={{
              borderColor: systemColor,
              color: systemColor,
            }}
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

export const GlitchMatrixLayout: React.FC<any> = (props) => (
  <DynamicLayoutWrapper
    {...props}
    defaultBackgroundColor="#000000"
    defaultTextColor="#00ff00" // Default Matrix Green
  >
    <GlitchMatrixContent {...props} />
  </DynamicLayoutWrapper>
);
