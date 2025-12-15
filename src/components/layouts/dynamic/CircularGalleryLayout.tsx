import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../LayoutSettingsCtrl";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const CircularGalleryLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(300);
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

  const { backgroundColor, textColor } = getGlobalSettings("#1a1a1a", "#ffffff");
  const headerData = props.layout.customSectionData?.["header"] || {};
  const spinText = headerData.spinText || "SPIN";

  // Inactivity Logic
  useEffect(() => {
    const onMouseMove = () => {
      setControlsVisible(true);
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current);
      inactiveTimer.current = setTimeout(() => {
        setControlsVisible(false);
      }, 3000);
    };

    window.addEventListener("mousemove", onMouseMove);
    onMouseMove();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current);
    }
  }, []);

  // Dynamic Radius Logic
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Calculate max radius that keeps 300px/200px cards roughly inside
        // We want diameter + card_diagonal to be < screen
        // Safer: radius = min(w, h) * 0.35
        // This generally keeps cards (which are centered on the radius) within bounds unless screen is tiny.
        const minDim = Math.min(width, height);
        setRadius(minDim * 0.30);
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

    return () => { tween.kill(); };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden flex items-center justify-center relative"
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

      {/* Background Text */}
      <div className="absolute flex items-center justify-center pointer-events-auto z-0">
        <input
          value={spinText}
          onChange={(e) => handleUpdateText("header", "spinText", e.target.value)}
          onFocus={(e) => handleFocus("header_spinText", e)}
          style={{
            ...getFieldStyle("header_spinText"),
            color: textColor,
            opacity: 0.1
          }}
          className="bg-transparent border-none text-[20vw] font-bold text-center focus:outline-none w-full uppercase"
        />
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
          // Offset relative to center (radius, radius)
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
                borderColor: textColor
              }}
              onMouseEnter={() => setHoveredSectionId(section.id)}
              onMouseLeave={() => setHoveredSectionId(null)}
            >
              <GridSectionWrapper
                section={section}
                templateSection={{ id: section.id }}
                onSectionDelete={props.onSectionDelete}
                onSectionContentChange={props.onSectionContentChange}
                {...props}
              />
              {/* Delete Button - Auto hide */}
              <div className={cn(
                "absolute top-2 right-2 z-50 transition-opacity duration-200",
                hoveredSectionId === section.id && controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
              )}>
                <button
                  onClick={(e) => handleDeleteSection(section.id, e)}
                  className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Central Add Button - Auto hide */}
      <div className={cn(
        "absolute z-20 transition-all duration-500",
        controlsVisible ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
      )}>
        <button
          onClick={handleAddSection}
          className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.5)]"
          style={{ backgroundColor: textColor, color: backgroundColor }}
        >
          <Plus className="w-10 h-10" />
        </button>
      </div>
    </div>
  );
};
