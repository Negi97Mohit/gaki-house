import React, { useRef, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { Info, Plus, Settings2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

// --- Portal ---
const LayoutControlsPortal = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setMounted(true);
    const el = document.getElementById("layout-controls-slot");
    if (el) setContainer(el);
  }, []);
  if (!mounted || !container) return null;
  return createPortal(children, container);
};

// --- SVG Liquid Filter Definition ---
// This hidden SVG defines the turbulence filter used by CSS
const LiquidFilterDefs = () => (
  <svg style={{ position: "absolute", width: 0, height: 0 }}>
    <defs>
      <filter id="liquid-distortion">
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.01 0.01"
          numOctaves="1"
          result="warp"
        >
          <animate
            attributeName="baseFrequency"
            dur="20s"
            values="0.01 0.01;0.02 0.02;0.01 0.01"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap
          xChannelSelector="R"
          yChannelSelector="G"
          scale="20"
          in="SourceGraphic"
          in2="warp"
        />
      </filter>

      <filter id="liquid-hover">
        <feTurbulence
          type="turbulence"
          baseFrequency="0.05"
          numOctaves="2"
          result="warp"
        >
          <animate
            attributeName="baseFrequency"
            dur="2s"
            values="0.05;0.08;0.05"
            repeatCount="indefinite"
          />
        </feTurbulence>
        <feDisplacementMap
          xChannelSelector="R"
          yChannelSelector="G"
          scale="30"
          in="SourceGraphic"
          in2="warp"
        />
      </filter>
    </defs>
  </svg>
);

// --- Liquid Mirror Background ---
const LiquidMirrorCanvas: React.FC<{
  className?: string;
  bgColor: string;
  textColor: string;
}> = ({ className, bgColor, textColor }) => {
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

    const animate = () => {
      // Fill background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw Chrome ripples
      ctx.lineWidth = 1;
      ctx.strokeStyle = textColor; // Use text color for lines
      ctx.globalAlpha = 0.1;

      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        for (let x = 0; x < canvas.width; x += 20) {
          const y =
            canvas.height / 2 +
            Math.sin(x * 0.002 + t * 0.005 + i) * 100 +
            Math.cos(x * 0.01 + t * 0.01) * 50;
          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      t++;
      requestAnimationFrame(animate);
    };
    animate();
    return () => window.removeEventListener("resize", resize);
  }, [bgColor, textColor]);

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

const LiquidMirrorContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { editor, layout, onLayoutUpdate, colors } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  // Defaults
  const title = layout.customSectionData?.["header"]?.["title"] || "MERCURY";
  const subtitle =
    layout.customSectionData?.["header"]?.["subtitle"] || "Fluid Dynamics";

  // Colors
  const bgColor = colors.backgroundColor || "#0f172a";
  const textColor = colors.textColor || "#ffffff";

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `mirror-${Date.now()}`,
      content: { type: "empty" as const },
    };
    onLayoutUpdate({ ...layout, sections: [...layout.sections, newSection] });
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden font-sans transition-colors duration-500"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      <LiquidFilterDefs />
      <LiquidMirrorCanvas bgColor={bgColor} textColor={textColor} />

      {/* Scrollable Content */}
      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div className="flex flex-col items-center min-h-full pb-32">
          {/* Liquid Header */}
          <div className="w-full min-h-[45vh] flex flex-col items-center justify-center p-8 text-center perspective-[1000px]">
            <div className="relative group cursor-text">
              <EditableText
                sectionId="header"
                fieldId="title"
                defaultValue="MERCURY"
                className="text-8xl md:text-9xl font-black tracking-tighter select-none relative z-10 mix-blend-overlay"
                style={{
                  textShadow: `0 20px 40px ${textColor}60`,
                }}
              />
              {/* Liquid Reflection of Text */}
              <div
                className="absolute top-full left-0 right-0 origin-top opacity-30 pointer-events-none blur-sm scale-y-[-0.8]"
                style={{ filter: "url(#liquid-distortion)" }}
              >
                <h1 className="text-8xl md:text-9xl font-black tracking-tighter text-current">
                  {title}
                </h1>
              </div>
            </div>

            <EditableText
              sectionId="header"
              fieldId="subtitle"
              defaultValue="Fluid Dynamics"
              className="text-lg md:text-xl font-light tracking-[0.5em] mt-8 uppercase opacity-60"
            />
          </div>

          {/* Staggered Liquid Grid */}
          <div className="w-full max-w-7xl px-8 columns-1 md:columns-2 lg:columns-3 gap-12 space-y-12">
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="group relative break-inside-avoid"
                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                onMouseLeave={() => editor.setHoveredSectionId(null)}
              >
                {/* The Liquid Border Container */}
                <div
                  className="relative bg-white/5 backdrop-blur-lg border transition-all duration-500 overflow-hidden"
                  style={{
                    borderColor: `${textColor}40`,
                    borderRadius: "30px 40px 30px 50px", // Organic shape
                    // Apply the liquid filter to the container edges
                    filter:
                      editor.hoveredSectionId === section.id
                        ? "url(#liquid-hover)"
                        : "drop-shadow(0 10px 20px rgba(0,0,0,0.2))",
                  }}
                >
                  <div className="aspect-[3/4] p-4 relative z-10 opacity-90 group-hover:opacity-100 transition-opacity">
                    <GridSectionWrapper
                      section={section}
                      templateSection={{ id: section.id }}
                      isHovered={editor.hoveredSectionId === section.id}
                      onSectionDelete={props.onSectionDelete}
                      onSectionContentChange={props.onSectionContentChange}
                      {...props}
                    />
                  </div>

                  {/* Glossy Sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                </div>

                {/* Floating Label */}
                <div className="absolute -bottom-6 right-4 font-mono text-xs opacity-50 tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                  0{i + 1}
                </div>

                <div
                  className={cn(
                    "absolute -top-3 -right-3 z-50 transition-all duration-300",
                    editor.hoveredSectionId === section.id
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-75"
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
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-4 rounded-[2rem] backdrop-blur-xl border w-72 z-50 shadow-2xl"
                style={{
                  backgroundColor:
                    bgColor === "#ffffff"
                      ? "rgba(255,255,255,0.8)"
                      : "rgba(15,23,42,0.9)",
                  borderColor: `${textColor}30`,
                  // Apply liquid filter to control panel too for consistency
                  filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))",
                }}
              >
                <div
                  className="flex items-center gap-2 mb-3 text-[10px] font-bold uppercase tracking-wider opacity-60"
                  style={{ color: textColor }}
                >
                  <Settings2 className="w-3 h-3" /> Viscosity Settings
                </div>

                <div className="flex flex-col gap-3 mb-4">
                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      editor.handleUpdateText("header", "title", e.target.value)
                    }
                    className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none border transition-colors"
                    style={{
                      backgroundColor: `${textColor}05`,
                      borderColor: `${textColor}10`,
                      color: textColor,
                    }}
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
                    className="w-full rounded-xl px-3 py-2 text-xs focus:outline-none border transition-colors"
                    style={{
                      backgroundColor: `${textColor}05`,
                      borderColor: `${textColor}10`,
                      color: textColor,
                    }}
                    placeholder="Subtitle"
                  />
                </div>

                <button
                  onClick={handleAddSection}
                  className="w-full py-3 font-bold text-xs rounded-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{
                    backgroundColor: textColor,
                    color: bgColor,
                    filter: "url(#liquid-distortion)", // Button is also liquid!
                  }}
                >
                  <Plus className="w-3 h-3" /> ADD DROPLET
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-full h-12 w-12 flex items-center justify-center transition-all shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor: showInfo ? textColor : `${textColor}10`,
              borderColor: `${textColor}30`,
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

export const LiquidMirrorLayout: React.FC<any> = (props) => (
  <DynamicLayoutWrapper
    {...props}
    defaultBackgroundColor="#0f172a"
    defaultTextColor="#ffffff"
  >
    <LiquidMirrorContent {...props} />
  </DynamicLayoutWrapper>
);
