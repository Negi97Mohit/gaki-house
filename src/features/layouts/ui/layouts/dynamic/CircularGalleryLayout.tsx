import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/shared/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { LayoutControlsPortal } from "./core/LayoutControlsPortal";
import { Plus, Info, X, Settings2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const CircularGalleryContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(300);
  const { colors, editor, controlsVisible, layout } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  // Background Text
  const spinText = layout.customSectionData?.["header"]?.["spinText"] || "SPIN";

  // Dynamic Radius Logic
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Safer: radius = min(w, h) * 0.30
        const minDim = Math.min(width, height);
        setRadius(minDim * 0.3);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const tween = gsap.to(wheelRef.current, {
      rotation: 360,
      duration: 40,
      repeat: -1,
      ease: "none",
    });

    return () => {
      tween.kill();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden flex items-center justify-center relative"
    >
      {/* Background Text - now controlled by island */}
      <div className="absolute flex items-center justify-center pointer-events-auto z-0 w-full">
        <div
          className="text-[20vw] font-bold text-center w-full uppercase pointer-events-none select-none transition-all duration-300"
          style={{ opacity: 0.1, color: colors.textColor }}
        >
          {spinText}
        </div>
      </div>

      <div
        ref={wheelRef}
        className="relative z-10"
        style={{ width: radius * 2, height: radius * 2 }}
        onMouseEnter={() => gsap.globalTimeline.timeScale(0)}
        onMouseLeave={() => gsap.globalTimeline.timeScale(1)}
      >
        {sections.map((section, i) => {
          const angle = (i / sections.length) * 2 * Math.PI;
          const x = Math.cos(angle) * radius + radius;
          const y = Math.sin(angle) * radius + radius;

          return (
            <div
              key={section.id}
              className="absolute w-[300px] h-[200px] -ml-[150px] -mt-[100px] bg-gray-800 border-2 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.2)] group"
              style={{
                left: x,
                top: y,
                transform: `rotate(${angle * (180 / Math.PI) + 90}deg)`,
                borderColor: colors.textColor,
                backgroundColor: `hsl(${i * 60}, 70%, 25%)`,
              }}
              onMouseEnter={() => editor.setHoveredSectionId(section.id)}
              onMouseLeave={() => editor.setHoveredSectionId(null)}
            >
              <GridSectionWrapper
                section={section}
                templateSection={{ id: section.id }}
                onSectionDelete={props.onSectionDelete}
                onSectionContentChange={props.onSectionContentChange}
                isHovered={editor.hoveredSectionId === section.id}
                {...props}
              />
              <DynamicDeleteButton
                sectionId={section.id}
                className={cn(
                  "absolute top-2 right-2",
                  editor.hoveredSectionId === section.id
                    ? "opacity-100"
                    : "opacity-0"
                )}
              />
            </div>
          );
        })}
      </div>

      {/* Control Island Portal */}
      <LayoutControlsPortal>
        <div className="relative">
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-black/80 p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl w-80 flex flex-col gap-4 origin-bottom z-50"
              >
                {/* Background Settings */}
                <div className="flex flex-col gap-3">
                  <label className="text-[10px] text-white/50 uppercase font-mono tracking-wider flex items-center gap-2">
                    <Settings2 className="w-3 h-3" />
                    Center Text
                  </label>

                  <input
                    type="text"
                    value={spinText}
                    onChange={(e) =>
                      editor.handleUpdateText(
                        "header",
                        "spinText",
                        e.target.value
                      )
                    }
                    placeholder="Center Text..."
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-full placeholder:text-white/20"
                  />
                </div>

                {/* Add Item Button */}
                <button
                  onClick={editor.handleAddSection}
                  className="w-full mt-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-medium tracking-wide">
                    ADD ITEM
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              "rounded-full h-10 w-10 hover:bg-background/60 flex items-center justify-center transition-all",
              showInfo ? "bg-white text-black hover:bg-white/90" : "text-white"
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

export const CircularGalleryLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#0F0F0F"
      defaultTextColor="#ffffff"
      {...props}
    >
      <CircularGalleryContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
