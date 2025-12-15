import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";

// Inner component content - now much simpler
const InfiniteGridContent: React.FC<{ sections: CanvasSectionState[], [key: string]: any }> = ({ sections, ...props }) => {
  const row1Ref = useRef<HTMLDivElement>(null);
  const row2Ref = useRef<HTMLDivElement>(null);
  const { colors, editor, controlsVisible } = useDynamicLayout();

  useEffect(() => {
    const animateRow = (el: HTMLElement | null, dir: number) => {
      if (!el) return;
      gsap.killTweensOf(el);
      gsap.to(el, {
        xPercent: dir * -50,
        ease: "none",
        duration: 30,
        repeat: -1,
      });
    };
    animateRow(row1Ref.current, 1);
    animateRow(row2Ref.current, -1);
  }, [sections.length]);

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
        <div key={`add-btn-${index}`} onMouseEnter={pauseAnimation} onMouseLeave={resumeAnimation}>
          <DynamicAddButton className="w-[400px] h-[250px] shrink-0" />
        </div>
      )
    }

    if (!section) return null;

    return (
      <div
        key={`${section.id}-${index}`}
        className="w-[400px] h-[250px] shrink-0 relative group rounded-lg overflow-hidden"
        style={{
          background: index % 2 === 0 ? "linear-gradient(135deg, #FF6B6B 0%, #EE5D5D 100%)" : "linear-gradient(135deg, #4ECDC4 0%, #45B7AF 100%)",
        }}
        onMouseEnter={() => {
          editor.setHoveredSectionId(section.id);
          pauseAnimation();
        }}
        onMouseLeave={() => {
          editor.setHoveredSectionId(null);
          resumeAnimation();
        }}
      >
        <GridSectionWrapper
          section={section}
          templateSection={{ id: section.id }}
          onSectionDelete={props.onSectionDelete}
          onSectionContentChange={props.onSectionContentChange}
          isHovered={editor.hoveredSectionId === section.id}
          {...props}
        />
        <DynamicDeleteButton sectionId={section.id} className={cn("absolute top-2 right-2", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />
      </div>
    );
  }

  const displayItems = [...sections, { id: 'add-btn', content: { type: 'empty' } } as any];
  const loopItems = [...displayItems, ...displayItems, ...displayItems];

  return (
    <div className="w-full h-full flex flex-col justify-center gap-4 overflow-hidden">
      <div ref={row1Ref} className="flex gap-4 w-fit pl-[10%]">
        {loopItems.map((section, i) => renderItem(section.id === 'add-btn' ? null : section, i, section.id === 'add-btn'))}
      </div>
      <div ref={row2Ref} className="flex gap-4 w-fit -ml-[50%]">
        {loopItems.map((section, i) => renderItem(section.id === 'add-btn' ? null : section, i + 1000, section.id === 'add-btn'))}
      </div>
    </div>
  )
}

// The Exported Component now just Wraps the Content
export const InfiniteGridLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#101010"
      defaultTextColor="#ffffff"
      {...props}
    >
      <InfiniteGridContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
