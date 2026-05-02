import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@gaki/core/types/caption";
import { cn } from "@gaki/core/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { LayoutControlsPortal } from "./core/LayoutControlsPortal";
import { Info, Plus, Settings2, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const DiagonalRushContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const rowsRef = useRef<HTMLDivElement[]>([]);
  const { colors, editor, controlsVisible, layout } = useDynamicLayout();
  const [showInfo, setShowInfo] = useState(false);

  const rushText =
    layout.customSectionData?.["header"]?.["rushText"] ||
    "Break The Grid • Kinetic Motion •";

  useEffect(() => {
    const ctx = gsap.context(() => {
      rowsRef.current.forEach((row, i) => {
        if (!row) return;

        // Determine direction (alternating rows)
        const isLeft = i % 2 === 0;

        gsap.fromTo(
          row,
          {
            xPercent: isLeft ? 0 : -50,
          },
          {
            xPercent: isLeft ? -50 : 0,
            ease: "none",
            duration: 20 + i * 2,
            repeat: -1,
          }
        );
      });
    }, rowsRef);
    return () => ctx.revert();
  }, [rushText]);

  return (
    <div className="w-full h-full overflow-y-auto overflow-x-hidden relative font-sans">
      {/* Central Content */}
      <div className="relative z-20 flex flex-wrap justify-center content-center items-center gap-8 min-h-screen py-20 px-4 w-full">
        {sections.map((section, i) => (
          <div
            key={section.id}
            className={cn(
              "relative border-4 group transition-transform duration-300 hover:scale-105 hover:z-30",
              "w-[300px] h-[400px]"
            )}
            style={{
              backgroundColor: i % 2 === 0 ? "#FACC15" : "#A3E635",
              transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
              borderColor: i % 2 === 0 ? "#FACC15" : "#A3E635",
              boxShadow: `10px 10px 0px ${i % 2 === 0 ? "rgba(250,204,21,0.2)" : "rgba(163,230,53,0.2)"
                }`,
            }}
            onMouseEnter={() => editor.setHoveredSectionId(section.id)}
            onMouseLeave={() => editor.setHoveredSectionId(null)}
          >
            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id, name: `Rush-${i}` }}
              onSectionDelete={props.onSectionDelete}
              onSectionContentChange={props.onSectionContentChange}
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
        ))}
      </div>

      {/* Background Text */}
      <div className="fixed inset-[-50%] w-[200%] h-[200%] rotate-[-5deg] flex flex-col justify-center gap-4 opacity-50 z-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) rowsRef.current[i] = el;
            }}
            className={`flex whitespace-nowrap text-[8vw] font-black uppercase`}
            style={{
              color: i % 2 === 0 ? colors.textColor : "transparent",
              WebkitTextStroke:
                i % 2 !== 0 ? `2px ${colors.textColor}` : "none",
              opacity: i % 2 !== 0 ? 0.5 : 1,
            }}
          >
            {Array.from({ length: 20 }).map((_, j) => (
              <span key={j} className="mx-8 relative">
                {rushText}
              </span>
            ))}
          </div>
        ))}
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
                    Background Text
                  </label>

                  <input
                    type="text"
                    value={rushText}
                    onChange={(e) =>
                      editor.handleUpdateText(
                        "header",
                        "rushText",
                        e.target.value
                      )
                    }
                    className="bg-white/5 border border-white/10 rounded-md px-3 py-2 text-xs text-white/90 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all w-full placeholder:text-white/20"
                  />
                </div>

                {/* Add Stream Button */}
                <button
                  onClick={editor.handleAddSection}
                  className="w-full mt-2 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-medium tracking-wide">
                    ADD STREAM
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

      {/* Grain */}
      <div
        className="fixed inset-0 z-30 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />
    </div>
  );
};

export const DiagonalRushLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#1a1a2e"
      defaultTextColor="#ffffff"
      {...props}
    >
      <DiagonalRushContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
