import React, { useRef, useEffect, useState, useMemo } from "react";
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

// --- Helper: Generate Organic Blob Path ---
// Creates a smooth closed curve based on noise
const createBlobPath = (points: number, size: number, seed: number) => {
  const angleStep = (Math.PI * 2) / points;
  const coords = [];

  for (let i = 0; i < points; i++) {
    const angle = i * angleStep;
    // Simple noise simulation using sine waves
    const noise = Math.sin(i * 1.5 + seed) * Math.cos(i * 2.5 + seed) * 0.3 + 1;
    const radius = (size / 2) * noise;
    const x = Math.cos(angle) * radius + size / 2;
    const y = Math.sin(angle) * radius + size / 2;
    coords.push({ x, y });
  }

  // Catmull-Rom spline or simple quadratic bezier smoothing
  let d = `M ${coords[0].x} ${coords[0].y}`;
  for (let i = 0; i < coords.length; i++) {
    const p0 = coords[i];
    const p1 = coords[(i + 1) % coords.length];
    const midX = (p0.x + p1.x) / 2;
    const midY = (p0.y + p1.y) / 2;
    d += ` Q ${p0.x} ${p0.y} ${midX} ${midY}`;
  }
  d += " Z";
  return d;
};

// --- Animated Blob Component ---
const MovingBlob: React.FC<{ color: string; index: number }> = ({
  color,
  index,
}) => {
  const pathRef = useRef<SVGPathElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!pathRef.current || !containerRef.current) return;

    // 1. Shape Morphing Animation
    const morph = () => {
      const seed = Math.random() * 100;
      const newPath = createBlobPath(8, 400, seed); // 8 points, 400px size

      gsap.to(pathRef.current, {
        attr: { d: newPath },
        duration: 3 + Math.random() * 2,
        ease: "sine.inOut",
        onComplete: morph,
      });
    };
    morph();

    // 2. Floating Position Animation
    const float = () => {
      // Random movement within window bounds
      const x = Math.random() * (window.innerWidth - 400);
      const y = Math.random() * (window.innerHeight - 400);
      const scale = 0.8 + Math.random() * 0.5;
      const rotation = Math.random() * 360;

      gsap.to(containerRef.current, {
        x: x,
        y: y,
        scale: scale,
        rotation: rotation,
        duration: 10 + Math.random() * 10, // Slow, liquid movement
        ease: "sine.inOut",
        onComplete: float,
      });
    };
    // Initial random position
    gsap.set(containerRef.current, {
      x: Math.random() * (window.innerWidth - 400),
      y: Math.random() * (window.innerHeight - 400),
    });
    float();
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute w-[400px] h-[400px] pointer-events-none opacity-60 mix-blend-multiply blur-3xl filter"
    >
      <svg viewBox="0 0 400 400" className="w-full h-full overflow-visible">
        <path ref={pathRef} fill={color} />
      </svg>
    </div>
  );
};

const MorphingBlobContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { editor, layout, onLayoutUpdate, colors } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  // Defaults
  const title = layout.customSectionData?.["header"]?.["title"] || "ORGANIC";
  const subtitle =
    layout.customSectionData?.["header"]?.["subtitle"] || "Flow State";

  // Colors from Context
  const bgColor = colors.backgroundColor || "#fffcf9";
  const textColor = colors.textColor || "#333333";

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = { id: `blob-${Date.now()}`, content: { type: "empty" as const } };
    onLayoutUpdate({ ...layout, sections: [...layout.sections, newSection] });
  };

  return (
    <div
      className="w-full h-full relative overflow-hidden transition-colors duration-500 font-sans"
      style={{ backgroundColor: bgColor, color: textColor }}
    >
      {/* Background Blobs Layer */}
      <div className="fixed inset-0 z-0">
        <MovingBlob color={`${textColor}40`} index={0} />
        <MovingBlob color={`${textColor}20`} index={1} />
        <MovingBlob color={`${textColor}30`} index={2} />
        {/* Accent Blob - Inverted/Complementary logic could go here, for now using light opacity of text color */}
        <MovingBlob
          color={
            textColor === "#ffffff"
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.05)"
          }
          index={3}
        />
      </div>

      {/* Scrollable Content */}
      <div className="relative z-10 w-full h-full overflow-y-auto">
        <div className="min-h-full flex flex-col items-center pb-32">
          {/* Header */}
          <div className="w-full min-h-[40vh] flex flex-col items-center justify-center p-8 text-center">
            <EditableText
              sectionId="header"
              fieldId="title"
              defaultValue="ORGANIC"
              className="text-7xl md:text-9xl font-black tracking-tight mix-blend-overlay select-none cursor-text transition-colors duration-300"
              style={{ color: textColor }}
            />
            <div className="mt-4 px-6 py-2 rounded-full border border-current opacity-40">
              <EditableText
                sectionId="header"
                fieldId="subtitle"
                defaultValue="Flow State"
                className="text-xl md:text-2xl font-light tracking-widest uppercase"
              />
            </div>
          </div>

          {/* Cards Grid */}
          <div className="w-full max-w-7xl px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {sections.map((section, i) => (
              <div
                key={section.id}
                className="group relative aspect-square rounded-[3rem] shadow-[0_20px_40px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_rgba(0,0,0,0.1)] hover:scale-[1.02] transition-all duration-500 overflow-hidden backdrop-blur-xl border border-white/20"
                style={{
                  backgroundColor: `rgba(255,255,255,0.1)`, // Glass effect
                }}
                onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                onMouseLeave={() => editor.setHoveredSectionId(null)}
              >
                {/* Inner Content Container */}
                <div className="absolute inset-4 rounded-[2.5rem] overflow-hidden bg-white/5">
                  <GridSectionWrapper
                    section={section}
                    templateSection={{ id: section.id }}
                    isHovered={editor.hoveredSectionId === section.id}
                    onSectionDelete={props.onSectionDelete}
                    onSectionContentChange={props.onSectionContentChange}
                    {...props}
                  />
                </div>

                {/* Label Badge */}
                <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
                  <span
                    className="px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm backdrop-blur-md"
                    style={{
                      backgroundColor: `${textColor}10`,
                      color: textColor,
                    }}
                  >
                    Blob 0{i + 1}
                  </span>
                </div>

                {/* Delete Button */}
                <div
                  className={cn(
                    "absolute top-6 right-6 transition-all duration-300 z-50",
                    editor.hoveredSectionId === section.id
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 -translate-y-2"
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
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 p-4 rounded-2xl shadow-2xl border w-72 z-50 backdrop-blur-2xl"
                style={{
                  backgroundColor:
                    bgColor === "#000000"
                      ? "rgba(20,20,20,0.9)"
                      : "rgba(255,255,255,0.9)",
                  borderColor: `${textColor}20`,
                }}
              >
                <div className="flex flex-col gap-2 mb-3">
                  <div
                    className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider opacity-50"
                    style={{ color: textColor }}
                  >
                    <Settings2 className="w-3 h-3" /> Labels
                  </div>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) =>
                      editor.handleUpdateText("header", "title", e.target.value)
                    }
                    className="w-full rounded px-2 py-1 text-xs focus:outline-none border"
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
                    className="w-full rounded px-2 py-1 text-xs focus:outline-none border"
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
                  className="w-full py-2 font-bold text-xs rounded-lg shadow-sm transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
                  style={{
                    background: `linear-gradient(135deg, ${textColor}20, ${textColor}40)`,
                    color: textColor,
                  }}
                >
                  <Plus className="w-3 h-3" /> ADD BLOB
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-full h-10 w-10 flex items-center justify-center transition-all shadow-lg border backdrop-blur-md"
            style={{
              backgroundColor:
                bgColor === "#000000"
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(255,255,255,0.8)",
              borderColor: `${textColor}20`,
              color: textColor,
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

export const MorphingBlobLayout: React.FC<any> = (props) => (
  <DynamicLayoutWrapper
    {...props}
    defaultBackgroundColor="#fffcf9"
    defaultTextColor="#333333"
  >
    <MorphingBlobContent {...props} />
  </DynamicLayoutWrapper>
);
