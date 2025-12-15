import React, { useRef, useEffect } from "react";
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

  useEffect(() => {
    const animateRow = (el: HTMLElement | null, dir: number) => {
      if (!el) return;
      // Kill existing to prevent conflicts
      gsap.killTweensOf(el);

      // Calculate width based on children? 
      // For infinite loop with xPercent, we usually need the content to be at least 2x screen width.
      // Here we are duplicating items.

      gsap.to(el, {
        xPercent: dir * -50,
        ease: "none",
        duration: 30, // Slower for usability
        repeat: -1,
      });
    };
    animateRow(row1Ref.current, 1);
    animateRow(row2Ref.current, -1);
  }, [sections]); // Reset when sections change

  // We want to include the "Add Button" in the list of items to display
  // But since we duplicate the list for the infinite effect, the button will appear multiple times.
  // That's acceptable for this layout style.

  const items = [...sections];

  // Helper to render a card or the add button
  const renderItem = (section: CanvasSectionState | null, index: number, isAddButton = false) => {
    if (isAddButton) {
      return (
        <div
          key={`add-btn-${index}`}
          onClick={handleAddSection}
          className="w-[400px] h-[250px] shrink-0 border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-colors"
          style={{ borderColor: textColor }}
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
        {/* Hover controls */}
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
  // We insert the "Add Button" at the end of the original list.
  // Then we duplicate (Items + AddBtn) * 3

  const displayItems = [...items, { id: 'add-btn', content: { type: 'empty' } } as any];
  const loopItems = [...displayItems, ...displayItems, ...displayItems];

  // Hover pauses anmation
  const handleMouseEnter = () => {
    gsap.globalTimeline.timeScale(0);
  };
  const handleMouseLeave = () => {
    gsap.globalTimeline.timeScale(1);
  };
  // Wait, globalTimeScale stops EVERYTHING. Better to control specific tweens.
  // Actually, for this specific component, let's just pause these tweens.
  // But we didn't save the tweens.
  // Let's use CSS group-hover on the container? 
  // GSAP is JS based.
  // Let's use a ref to store tweens?

  // Revised approach: Just make it slow enough to click. 
  // Or:

  // <div onMouseEnter={() => gsap.to([row1Ref.current, row2Ref.current], {timeScale: 0})} ...
  // But we need the Tween instance.

  return (
    <div
      className="w-full h-full flex flex-col justify-center gap-4 overflow-hidden"
      style={{ backgroundColor }}
      onMouseEnter={() => {
        gsap.getTweensOf(row1Ref.current).forEach(t => t.timeScale(0));
        gsap.getTweensOf(row2Ref.current).forEach(t => t.timeScale(0));
      }}
      onMouseLeave={() => {
        gsap.getTweensOf(row1Ref.current).forEach(t => t.timeScale(1));
        gsap.getTweensOf(row2Ref.current).forEach(t => t.timeScale(1));
      }}
    >
      <LayoutSettingsCtrl
        backgroundColor={backgroundColor}
        textColor={textColor}
        onUpdate={updateGlobalSetting}
      />
      {/* Search/Filter Bar (Optional Layout Text) */}
      <div className="absolute top-8 left-0 w-full z-10 flex justify-center pointer-events-none">
        <div className="bg-black/50 backdrop-blur px-8 py-2 rounded-full border border-white/10 pointer-events-auto">
          <input
            value={props.layout.customSectionData?.header?.title || "INFINITE FEED"}
            onChange={(e) => handleUpdateText("header", "title", e.target.value)}
            className="bg-transparent border-none text-center font-bold tracking-widest uppercase focus:outline-none"
            style={{ color: textColor }}
          />
        </div>
      </div>

      <div ref={row1Ref} className="flex gap-4 w-fit pl-[10%]">
        {loopItems.map((section, i) => renderItem(section.id === 'add-btn' ? null : section, i, section.id === 'add-btn'))}
      </div>
      <div ref={row2Ref} className="flex gap-4 w-fit -ml-[50%]">
        {loopItems.map((section, i) => renderItem(section.id === 'add-btn' ? null : section, i + 1000, section.id === 'add-btn'))}
      </div>
    </div>
  );
};
