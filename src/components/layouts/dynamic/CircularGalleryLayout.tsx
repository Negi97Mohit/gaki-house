import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";
import { Plus } from "lucide-react";

const CircularGalleryContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({ sections, ...props }) => {
  const wheelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(300);
  const { colors, editor, controlsVisible } = useDynamicLayout();

  // Dynamic Radius Logic
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        // Safer: radius = min(w, h) * 0.30
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
    <div ref={containerRef} className="w-full h-full overflow-hidden flex items-center justify-center relative">
      {/* Background Text */}
      <div className="absolute flex items-center justify-center pointer-events-auto z-0 w-full">
        <EditableText
          sectionId="header"
          fieldId="spinText"
          defaultValue="SPIN"
          className="text-[20vw] font-bold text-center w-full uppercase"
          style={{ opacity: 0.1 }}
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
                backgroundColor: `hsl(${i * 60}, 70%, 25%)` // Rainbow circle
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
              <DynamicDeleteButton sectionId={section.id} className={cn("absolute top-2 right-2", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />
            </div>
          )
        })}
      </div>

      {/* Central Add Button - Auto hide */}
      <div className={cn(
        "absolute z-20 transition-all duration-500",
        controlsVisible ? "opacity-100 scale-100" : "opacity-0 scale-50 pointer-events-none"
      )}>
        <button
          onClick={editor.handleAddSection}
          className="w-20 h-20 rounded-full bg-white text-black flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.5)]"
          style={{ backgroundColor: colors.textColor, color: colors.backgroundColor }}
        >
          <Plus className="w-10 h-10" />
        </button>
      </div>
    </div>
  )
}

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
