import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../LayoutSettingsCtrl";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiagonalRushLayoutProps {
  sections: CanvasSectionState[];
  [key: string]: any;
}

export const DiagonalRushLayout: React.FC<DiagonalRushLayoutProps> = ({
  sections,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rowsRef = useRef<HTMLDivElement[]>([]);
  const [controlsVisible, setControlsVisible] = useState(true);
  const inactiveTimer = useRef<NodeJS.Timeout | null>(null);

  const {
    hoveredSectionId,
    setHoveredSectionId,
    focusedField,
    setFocusedField,
    toolbarRef,
    handleUpdateText,
    handleUpdateStyle,
    handleFocus,
    handleAddSection,
    handleDeleteSection,
    getFieldStyle,
    getGlobalSettings,
    updateGlobalSetting,
  } = useLayoutEditor({
    layout: props.layout,
    onLayoutUpdate: props.onLayoutUpdate,
  });

  const { backgroundColor, textColor } = getGlobalSettings("#111111", "#ffffff");

  const headerData = props.layout.customSectionData?.["header"] || {};
  const rushText = headerData.rushText || "Break The Grid • Kinetic Motion •";

  // Mouse Inactivity Logic
  useEffect(() => {
    const onMouseMove = () => {
      setControlsVisible(true);
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current);
      inactiveTimer.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    };

    window.addEventListener("mousemove", onMouseMove);
    // Init timer
    onMouseMove();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current);
    }
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Animate each row in alternating directions
      rowsRef.current.forEach((row, i) => {
        if (!row) return;
        const direction = i % 2 === 0 ? 1 : -1;

        // Reset
        gsap.set(row, { xPercent: 0 });

        gsap.to(row, {
          xPercent: direction * -50,
          ease: "none",
          duration: 15 + i * 2, // Varying speeds
          repeat: -1,
        });
      });
    }, containerRef);
    return () => ctx.revert();
  }, [rushText]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-y-auto overflow-x-hidden relative font-sans"
      style={{ backgroundColor }}
    >
      <LayoutSettingsCtrl
        backgroundColor={backgroundColor}
        textColor={textColor}
        onUpdate={updateGlobalSetting}
      />
      <LayoutEditorToolbar
        focusedField={focusedField}
        toolbarRef={toolbarRef}
        currentStyle={focusedField ? props.layout.customSectionStyles?.[focusedField.id] : {}}
        onUpdateStyle={(field, value) => focusedField && handleUpdateStyle(focusedField.id, field, value)}
        onClose={() => setFocusedField(null)}
      />

      {/* Central Camera Container - Scrollable Flow */}
      {/* Used min-h-screen to ensure vertical centering when few items, but allows scroll when many */}
      <div className="relative z-20 flex flex-wrap justify-center content-center items-center gap-8 min-h-screen py-20 px-4 w-full">
        {sections.map((section, i) => (
          <div
            key={section.id}
            className={cn(
              "relative border-4 bg-black group transition-transform duration-300 hover:scale-105 hover:z-30",
              "w-[300px] h-[400px]"
            )}
            style={{
              transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
              borderColor: i % 2 === 0 ? "#FACC15" : "#A3E635", // Keep yellow/lime theme or make dynamic? Keeping theme for identity.
              boxShadow: `10px 10px 0px ${i % 2 === 0 ? "rgba(250,204,21,0.2)" : "rgba(163,230,53,0.2)"}`
            }}
            onMouseEnter={() => setHoveredSectionId(section.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            {/* Delete Button - Only show if Hovered AND Controls are "active" (or just hover is enough) */}
            {/* User asked to hide "+ Add Stream", implied general UI cleanup on inactivity. */}

            <GridSectionWrapper
              section={section}
              templateSection={{ id: section.id, name: `Rush-${i}` }}
              onSectionDelete={props.onSectionDelete}
              onSectionContentChange={props.onSectionContentChange}
              {...props}
            />
            {/* Delete Button */}
            <div className={cn("absolute top-2 right-2 flex gap-2 z-50 transition-opacity duration-200", hoveredSectionId === section.id ? "opacity-100" : "opacity-0")}>
              <button
                onClick={(e) => handleDeleteSection(section.id, e)}
                className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {/* Add Button as a card */}
        <div
          onClick={handleAddSection}
          className={cn(
            "w-[300px] h-[400px] border-4 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all duration-500 rotate-2",
            controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
          )}
          style={{ borderColor: textColor }}
        >
          <Plus className="w-12 h-12 mb-2" style={{ color: textColor }} />
          <span className="font-black uppercase text-center" style={{ color: textColor }}>Add Stream</span>
        </div>
      </div>

      {/* Diagonal Text Background - Fixed Position so it stays while scrolling content */}
      <div className="fixed inset-[-50%] w-[200%] h-[200%] rotate-[-5deg] flex flex-col justify-center gap-4 opacity-50 z-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => {
              if (el) rowsRef.current[i] = el;
            }}
            // Add pointer-events-auto if we wanted to select it, but marquee is hard to select.
            // We use the fixed input below instead.
            className={`flex whitespace-nowrap text-[8vw] font-black uppercase`}
            style={{
              color: i % 2 === 0 ? textColor : "transparent",
              WebkitTextStroke: i % 2 !== 0 ? `2px ${textColor}` : "none",
              opacity: i % 2 !== 0 ? 0.5 : 1
            }}
          >
            {Array.from({ length: 8 }).map((_, j) => (
              <span key={j} className="mx-8 relative">
                {rushText}
              </span>
            ))}
          </div>
        ))}
      </div>

      {/* Background Text Input */}
      <div className={cn(
        "fixed bottom-8 left-8 z-40 bg-black/50 p-4 rounded backdrop-blur transition-all duration-500",
        controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}>
        <label className="text-xs text-white/50 uppercase block mb-1">Background Text</label>
        <input
          value={rushText}
          onChange={(e) => handleUpdateText("header", "rushText", e.target.value)}
          className="bg-transparent border-b border-white/30 text-white focus:outline-none w-64"
        />
      </div>

      {/* Decorative Noise / Grain Overlay */}
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
