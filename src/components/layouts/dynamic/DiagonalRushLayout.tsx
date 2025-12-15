import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

const DiagonalRushContent: React.FC<{ sections: CanvasSectionState[], [key: string]: any }> = ({ sections, ...props }) => {
  const rowsRef = useRef<HTMLDivElement[]>([]);
  const { colors, editor, controlsVisible, layout } = useDynamicLayout();

  // The text content is now fetched via loop but we pass a reference "header.rushText" to EditableText
  // But for the background animation we need to READ it.
  // EditableText manages the write.
  // We can read from our context via `layout`
  const rushText = layout.customSectionData?.["header"]?.["rushText"] || "Break The Grid • Kinetic Motion •";

  useEffect(() => {
    const ctx = gsap.context(() => {
      rowsRef.current.forEach((row, i) => {
        if (!row) return;
        const direction = i % 2 === 0 ? 1 : -1;
        gsap.set(row, { xPercent: 0 });
        gsap.to(row, {
          xPercent: direction * -50,
          ease: "none",
          duration: 15 + i * 2,
          repeat: -1,
        });
      });
    }, rowsRef); // Passing ref object not ideal if it's array. Use specific scope if possible or just nothing.
    return () => ctx.revert();
  }, [rushText]); // Re-animate on text change

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
              backgroundColor: i % 2 === 0 ? "#FACC15" : "#A3E635", // Use vibrant backgrounds for the panels themselves if empty
              transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
              borderColor: i % 2 === 0 ? "#FACC15" : "#A3E635",
              boxShadow: `10px 10px 0px ${i % 2 === 0 ? "rgba(250,204,21,0.2)" : "rgba(163,230,53,0.2)"}`
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
            <DynamicDeleteButton sectionId={section.id} className={cn("absolute top-2 right-2", editor.hoveredSectionId === section.id ? "opacity-100" : "opacity-0")} />
          </div>
        ))}

        {/* Add Button */}
        <DynamicAddButton
          defaultValue="Add Stream"
          className="w-[300px] h-[400px] rotate-2"
        />
      </div>

      {/* Background Text */}
      <div className="fixed inset-[-50%] w-[200%] h-[200%] rotate-[-5deg] flex flex-col justify-center gap-4 opacity-50 z-0 pointer-events-none">
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            ref={(el) => { if (el) rowsRef.current[i] = el; }}
            className={`flex whitespace-nowrap text-[8vw] font-black uppercase`}
            style={{
              color: i % 2 === 0 ? colors.textColor : "transparent",
              WebkitTextStroke: i % 2 !== 0 ? `2px ${colors.textColor}` : "none",
              opacity: i % 2 !== 0 ? 0.5 : 1
            }}
          >
            {Array.from({ length: 8 }).map((_, j) => (
              <span key={j} className="mx-8 relative">{rushText}</span>
            ))}
          </div>
        ))}
      </div>

      {/* Editable Input for Background */}
      <div className={cn(
        "fixed bottom-8 left-8 z-40 bg-black/50 p-4 rounded backdrop-blur transition-all duration-500",
        controlsVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"
      )}>
        <label className="text-xs text-white/50 uppercase block mb-1">Background Text</label>
        <EditableText
          sectionId="header"
          fieldId="rushText"
          defaultValue="Break The Grid • Kinetic Motion •"
          className="bg-transparent border-b border-white/30 text-white w-64 text-base"
        />
      </div>

      {/* Grain */}
      <div
        className="fixed inset-0 z-30 pointer-events-none opacity-20 mix-blend-overlay"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")',
        }}
      />
    </div>
  )
}

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
