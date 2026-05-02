import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import {
  CanvasSectionState,
  CanvasLayoutState,
} from "@gaki/core/types/caption";
import { cn } from "@gaki/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { Panel } from "./core/Panel";
import { EditableText } from "./core/EditableText";
import { LayoutControlsPortal } from "./core/LayoutControlsPortal";
import { Plus, Info, X, Settings2 } from "lucide-react";

interface SistineDepthLayoutProps {
  sections: CanvasSectionState[];
  layout: CanvasLayoutState;
  containerRef: React.RefObject<HTMLDivElement>;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

// Spacing between layers in Z-pixels
const LAYER_SPACING = 800;

// --- Helper Component to Fix Hook Rule Violation ---
const DepthIndicator = ({
  index,
  springScrollZ,
  onFocus,
}: {
  index: number;
  springScrollZ: any;
  onFocus: () => void;
}) => {
  const backgroundColor = useTransform(
    springScrollZ,
    [
      index * LAYER_SPACING - 400,
      index * LAYER_SPACING,
      index * LAYER_SPACING + 400,
    ],
    ["rgba(255,255,255,0.2)", "rgba(255,255,255,1)", "rgba(255,255,255,0.2)"]
  );

  return (
    <motion.button
      onClick={onFocus}
      className="w-1.5 h-1.5 rounded-full hover:bg-white transition-colors"
      style={{ backgroundColor }}
    />
  );
};

const FloatingSection = ({
  section,
  index,
  mouseX,
  mouseY,
  scrollZ, // The current scroll position (Z-axis)
  total,
  onFocus,
  ...props
}: {
  section: CanvasSectionState;
  index: number;
  mouseX: any;
  mouseY: any;
  scrollZ: any;
  total: number;
  onFocus: () => void;
  [key: string]: any;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Base Z position for this specific layer
  const baseZ = index * LAYER_SPACING;

  // Calculate dynamic Z position relative to camera (scrollZ)
  const z = useTransform(scrollZ, (currentZ: number) => baseZ - currentZ);

  // Calculate Opacity: Fade in as we approach, fade out if we pass it
  const opacity = useTransform(
    z,
    [-800, -200, 0, 1000, 2000],
    [0, 0.2, 1, 1, 0]
  );

  // Calculate Scale: Get larger as we get closer
  const scale = useTransform(z, [-500, 1500], [1.2, 0.6]);

  // Blur effect for depth of field
  const blur = useTransform(z, [0, 1000], [0, 5]);
  const filter = useTransform(blur, (b) => `blur(${b}px)`);

  // Parallax movement (stronger when closer)
  const x = useTransform(mouseX, [-0.5, 0.5], [-30, 30]);
  const y = useTransform(mouseY, [-0.5, 0.5], [-20, 20]);

  // Rotations
  const rotateX = useTransform(mouseY, [-0.5, 0.5], [3, -3]);
  const rotateY = useTransform(mouseX, [-0.5, 0.5], [-3, 3]);

  return (
    <motion.div
      style={{
        z, // Framer motion handles the 3D transform "translateZ"
        scale,
        opacity,
        filter,
        x,
        y,
        rotateX,
        rotateY,
        zIndex: total - index, // Render order fallback
        position: "absolute",
      }}
      className="w-full h-full flex items-center justify-center pointer-events-none will-change-transform"
    >
      {/* Clickable container */}
      <div
        onClick={(e) => {
          e.stopPropagation();
          onFocus();
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "relative w-[70%] h-[70%] pointer-events-auto transition-all duration-500",
          "cursor-pointer hover:shadow-[0_0_80px_rgba(255,255,255,0.15)]"
        )}
      >
        <div className="absolute -top-16 left-0 flex items-center gap-4 transition-opacity duration-300">
          <EditableText
            sectionId={section.id}
            fieldId="index_label"
            defaultValue={`0${index + 1}`}
            className="text-4xl font-serif text-white/40 font-bold w-auto min-w-[3rem]"
          />
          <div className="h-px w-20 bg-white/20" />
          <EditableText
            sectionId={section.id}
            fieldId="label"
            defaultValue={`DEPTH LAYER`}
            className="text-xs font-mono tracking-[0.2em] text-white/50"
          />
        </div>

        {/* The Panel Content */}
        <Panel
          section={section}
          index={index}
          className="w-full h-full shadow-2xl rounded-sm border border-white/10 overflow-hidden bg-zinc-900"
          style={{
            background: section.style?.background || "#1a1512",
          }}
          wrapperProps={props}
        />
      </div>
    </motion.div>
  );
};

const SistineDepthContent: React.FC<SistineDepthLayoutProps> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { colors, editor } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  // Mouse position state for parallax
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 40, damping: 30 });
  const springY = useSpring(y, { stiffness: 40, damping: 30 });

  // Scroll (Z-axis) state
  const scrollZ = useMotionValue(0);
  const springScrollZ = useSpring(scrollZ, { stiffness: 50, damping: 20 });

  // Handle Mouse Move (Parallax)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const { width, height, left, top } =
      containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - left;
    const mouseY = e.clientY - top;

    // Normalized -0.5 to 0.5
    x.set(mouseX / width - 0.5);
    y.set(mouseY / height - 0.5);
  };

  // Handle Wheel (Z-Axis Movement)
  const handleWheel = (e: React.WheelEvent) => {
    // DeltaY controls Z-depth
    const currentZ = scrollZ.get();
    const maxZ = (sections.length - 1) * LAYER_SPACING;

    // Smoother speed control
    const speed = e.shiftKey ? 5 : 2.5;
    const newZ = currentZ + e.deltaY * speed;

    // Clamp
    const clampedZ = Math.max(-500, Math.min(newZ, maxZ + 500));

    scrollZ.set(clampedZ);
  };

  // Keyboard support for better navigation (Snapping)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentZ = scrollZ.get();
      // Snap to nearest layer
      const currentLayerIndex = Math.round(currentZ / LAYER_SPACING);

      if (e.key === "ArrowDown" || e.key === "ArrowRight") {
        const nextLayer = Math.min(currentLayerIndex + 1, sections.length - 1);
        scrollZ.set(nextLayer * LAYER_SPACING);
      } else if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
        const prevLayer = Math.max(currentLayerIndex - 1, 0);
        scrollZ.set(prevLayer * LAYER_SPACING);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sections.length, scrollZ]);

  // Click to focus a specific layer
  const handleFocusLayer = (index: number) => {
    const targetZ = index * LAYER_SPACING;
    scrollZ.set(targetZ);
  };

  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `sistine-section-${Date.now()}`,
      content: { type: "empty" },
      style: { background: "#1a1512" },
      name: `Layer ${sections.length + 1}`,
    };
    // Auto-scroll to the new section
    setTimeout(() => {
      scrollZ.set(sections.length * LAYER_SPACING);
    }, 100);

    onLayoutUpdate({
      ...layout,
      sections: [...layout.sections, newSection],
    });
  };

  // Background Customization Data
  const bgTextValue =
    layout.customSectionData?.["sistine-global"]?.["bg_title"] ?? "SISTINE";
  const bgFontSize =
    layout.customSectionData?.["sistine-global"]?.["bg_fontSize"] ?? 25;
  const bgColor =
    layout.customSectionData?.["sistine-global"]?.["bg_color"] ?? "#ffffff";
  const bgFontFamily =
    layout.customSectionData?.["sistine-global"]?.["bg_fontFamily"] ??
    "font-serif";
  const bgOpacity =
    layout.customSectionData?.["sistine-global"]?.["bg_opacity"] ?? 0.3;

  // Helpers to update background styles
  const updateBg = (field: string, value: any) => {
    editor.handleUpdateText("sistine-global", field, value);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onWheel={handleWheel}
      className="w-full h-full relative overflow-hidden flex items-center justify-center cursor-move"
      style={{
        backgroundColor: colors.backgroundColor,
        perspective: "1200px", // Essential for 3D effect
      }}
    >
      {/* Decorative Tunnel Grid - MOVED FIRST to render behind content */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at center, transparent 0%, ${colors.backgroundColor} 100%), linear-gradient(${colors.textColor}20 1px, transparent 1px), linear-gradient(90deg, ${colors.textColor}20 1px, transparent 1px)`,
          backgroundSize: "100% 100%, 100px 100px, 100px 100px",
          transform: "perspective(500px) rotateX(20deg)",
          transformOrigin: "center 80%",
        }}
      />

      {/* 3D Scene Container */}
      <div className="relative w-full h-full flex items-center justify-center transform-style-3d">
        {/* Background Ambient Text */}
        <div
          className="absolute flex items-center justify-center pointer-events-auto z-0 w-[90%] min-h-[200px]"
          style={{
            transform: "translateZ(-600px) scale(1)",
            opacity: bgOpacity,
          }}
        >
          {/* Replaced EditableText with direct textarea to guarantee style application */}
          <textarea
            value={bgTextValue}
            onChange={(e) => updateBg("bg_title", e.target.value)}
            className={cn(
              "font-bold leading-[0.9] text-center whitespace-normal break-words w-full bg-transparent resize-none overflow-hidden transition-all duration-300 border-none outline-none focus:outline-none focus:ring-0",
              bgFontFamily
            )}
            style={{
              fontSize: `${bgFontSize}vw`,
              color: bgColor,
              height: "auto",
              minHeight: "200px",
            }}
          />
        </div>

        {/* Render Layers */}
        {sections.map((section, index) => (
          <FloatingSection
            key={section.id}
            section={section}
            index={index}
            total={sections.length}
            mouseX={springX}
            mouseY={springY}
            scrollZ={springScrollZ}
            onFocus={() => handleFocusLayer(index)}
            {...props}
            layout={layout}
            onLayoutUpdate={onLayoutUpdate}
          />
        ))}
      </div>

      {/* Inject controls into Bottom Navigation via Portal */}
      <LayoutControlsPortal>
        <div className="relative">
          {/* Expandable Menu Panel */}
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-black/80 p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl w-80 flex flex-col gap-4 origin-bottom z-50"
              >
                {/* Header / Instructions */}
                <div className="flex flex-col gap-1 items-center pb-2 border-b border-white/5">
                  <div className="text-center text-white/60 font-mono text-[10px] tracking-widest">
                    SCROLL TO NAVIGATE
                  </div>
                  <div className="text-center text-white/40 font-mono text-[10px] tracking-widest">
                    CLICK LAYER TO FOCUS
                  </div>
                </div>

                {/* Background Text Settings */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] text-white/50 uppercase font-mono tracking-wider flex items-center gap-2">
                      <Settings2 className="w-3 h-3" />
                      Background Text
                    </label>
                  </div>

                  <input
                    type="text"
                    value={bgTextValue}
                    onChange={(e) => updateBg("bg_title", e.target.value)}
                    placeholder="Background Text..."
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-full placeholder:text-white/20"
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-white/30 uppercase pl-1">
                        Typography
                      </label>
                      <select
                        value={bgFontFamily}
                        onChange={(e) =>
                          updateBg("bg_fontFamily", e.target.value)
                        }
                        className="w-full bg-white/5 border border-white/10 rounded px-2 py-1.5 text-[10px] text-white/70 focus:outline-none cursor-pointer hover:bg-white/10"
                      >
                        <option value="font-serif">Serif</option>
                        <option value="font-sans">Sans</option>
                        <option value="font-mono">Mono</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[9px] text-white/30 uppercase pl-1">
                        Color
                      </label>
                      <div className="flex items-center h-full">
                        <input
                          type="color"
                          value={bgColor}
                          onChange={(e) => updateBg("bg_color", e.target.value)}
                          className="w-full h-[26px] bg-transparent cursor-pointer rounded overflow-hidden"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 mt-1 bg-black/20 p-3 rounded-lg">
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[9px] text-white/30 uppercase">
                        <span>Size</span>
                        <span>{bgFontSize}vw</span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={bgFontSize}
                        onChange={(e) =>
                          updateBg("bg_fontSize", parseInt(e.target.value))
                        }
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex justify-between text-[9px] text-white/30 uppercase">
                        <span>Opacity</span>
                        <span>{Math.round(bgOpacity * 100)}%</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={bgOpacity}
                        onChange={(e) =>
                          updateBg("bg_opacity", parseFloat(e.target.value))
                        }
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddSection}
                  className="w-full mt-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-medium tracking-wide">
                    ADD NEW LAYER
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Island Toggle Button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              "rounded-full h-10 w-10 hover:bg-background/60 flex items-center justify-center transition-all",
              showInfo ? "bg-white text-black hover:bg-white/90" : "text-white"
            )}
            title="Layout Controls"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </LayoutControlsPortal>

      {/* Depth Indicators (Left Side) */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-50">
        {sections.map((_, i) => (
          <DepthIndicator
            key={i}
            index={i}
            springScrollZ={springScrollZ}
            onFocus={() => handleFocusLayer(i)}
          />
        ))}
      </div>
    </div>
  );
};

export const SistineDepthLayout: React.FC<SistineDepthLayoutProps> = (
  props
) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate!}
      sections={props.sections}
      defaultBackgroundColor="#d3763c"
      defaultTextColor="#ffffff"
    >
      <SistineDepthContent {...props} />
    </DynamicLayoutWrapper>
  );
};
