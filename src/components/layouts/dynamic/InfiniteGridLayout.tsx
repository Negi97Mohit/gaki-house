import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../LayoutSettingsCtrl";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const InfiniteGridLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
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

  const { backgroundColor, textColor } = getGlobalSettings("#000000", "#ffffff");

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
    onMouseMove();

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (inactiveTimer.current) clearTimeout(inactiveTimer.current);
    }
  }, []);

  useEffect(() => {
    const animateRow = (el: HTMLElement | null, dir: number) => {
      if (!el) return;
      // Kill existing to prevent conflicts
      gsap.killTweensOf(el);

      gsap.to(el, {
        xPercent: dir * -50,
        ease: "none",
        duration: 30, // Slower for usability
        repeat: -1,
      });
    };
    animateRow(row1Ref.current, 1);
    animateRow(row2Ref.current, -1);
  }, [sections.length]); // Reset when sections change

  const items = [...sections];

  // Pause Logic Helper
  const pauseAnimation = () => {
    gsap.getTweensOf(row1Ref.current).forEach(t => t.timeScale(0));
    gsap.getTweensOf(row2Ref.current).forEach(t => t.timeScale(0));
  };
  const resumeAnimation = () => {
    gsap.getTweensOf(row1Ref.current).forEach(t => t.timeScale(1));
    gsap.getTweensOf(row2Ref.current).forEach(t => t.timeScale(1));
  };

  const renderItem = (section: CanvasSectionState | null, index: number, isAddButton = false) => {
    if (isAddButton) {
      return (
        <div
          key={`add-btn-${index}`}
          onClick={handleAddSection}
          className={cn(
            "w-[400px] h-[250px] shrink-0 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all duration-500",
            controlsVisible ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
          style={{ borderColor: textColor }}
          onMouseEnter={pauseAnimation}
          onMouseLeave={resumeAnimation}
        >
          <Plus className="w-12 h-12" style={{ color: textColor }} />
          <span className="mt-2 font-bold uppercase" style={{ color: textColor }}>Add Section</span>
        </div>
      )
    }

    if (!section) return null;

    return (
      <div
        key={`${section.id}-${index}`}
        className="w-[400px] h-[250px] shrink-0 relative group"
        onMouseEnter={() => {
          setHoveredSectionId(section.id);
          pauseAnimation();
        }}
        onMouseLeave={() => {
          setHoveredSectionId(null);
          resumeAnimation();
        }}
      >
        <GridSectionWrapper
          section={section}
          templateSection={{ id: section.id }}
          onSectionDelete={props.onSectionDelete}
          onSectionContentChange={props.onSectionContentChange}
          {...props}
        />
        {/* Delete Button - Only allowed if hovered */}
        <div className={cn("absolute top-2 right-2 flex gap-2 z-50 transition-opacity duration-200", hoveredSectionId === section.id ? "opacity-100" : "opacity-0")}>
          <button
            onClick={(e) => handleDeleteSection(section.id, e)}
            className="bg-red-500 text-white p-2 rounded-full hover:scale-110 shadow-md"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Double the items for the loop
  const displayItems = [...items, { id: 'add-btn', content: { type: 'empty' } } as any];
  const loopItems = [...displayItems, ...displayItems, ...displayItems];

  return (
    <div
      className="w-full h-full flex flex-col justify-center gap-4 overflow-hidden"
      style={{ backgroundColor }}
    // Removed global onMouseEnter/Leave to support granular pause
    >
      <LayoutSettingsCtrl
        backgroundColor={backgroundColor}
        textColor={textColor}
        onUpdate={updateGlobalSetting}
      />
      {/* Search/Filter Bar REMOVED per user request */}

      <div ref={row1Ref} className="flex gap-4 w-fit pl-[10%]">
        {loopItems.map((section, i) => renderItem(section.id === 'add-btn' ? null : section, i, section.id === 'add-btn'))}
      </div>
      <div ref={row2Ref} className="flex gap-4 w-fit -ml-[50%]">
        {loopItems.map((section, i) => renderItem(section.id === 'add-btn' ? null : section, i + 1000, section.id === 'add-btn'))}
      </div>
    </div>
  );
};
