import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { EditableText } from "./core/EditableText";

const KineticStencilContent: React.FC<{ sections: CanvasSectionState[];[key: string]: any }> = ({ sections, ...props }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const { colors } = useDynamicLayout();

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.to(textRef.current, {
        scale: 1.1,
        duration: 4,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  const mainSection = sections[0];

  return (
    <div ref={containerRef} className="w-full h-full relative bg-black overflow-hidden">

      {/* 1. The Video Layer (Full Background) */}
      <div className="absolute inset-0 z-0">
        {mainSection && (
          <GridSectionWrapper
            section={mainSection}
            templateSection={{ id: mainSection.id, name: "Stencil Feed" }}
            {...props}
          />
        )}
      </div>

      {/* 2. The Stencil Mask Layer */}
      <div
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none mix-blend-multiply"
        style={{ backgroundColor: colors.backgroundColor }}
      >
        <div ref={textRef} className="text-center w-full pointer-events-auto">
          <EditableText
            sectionId="header"
            fieldId="line1"
            defaultValue="VISION"
            className="w-full text-center text-[25vw] font-black leading-none tracking-tighter uppercase p-0 m-0"
          />
          <EditableText
            sectionId="header"
            fieldId="line2"
            defaultValue="ARY"
            className="w-full text-center text-[25vw] font-black leading-none tracking-tighter uppercase p-0 m-0 -mt-[5vw]"
          />
        </div>
      </div>

      {/* 3. Overlay Elements (On top of everything) */}
      <div className="absolute inset-0 z-20 pointer-events-none p-12 border-[20px] border-white/10">
        <div className="absolute top-8 left-8 bg-black text-white px-4 py-2 font-mono text-xl uppercase pointer-events-auto">
          <EditableText
            sectionId="header"
            fieldId="badge"
            defaultValue="Live Feed"
            className="text-inherit w-32"
            style={{ color: "white" }} // Override global text color since this is on black badge
          />
        </div>
        <div className="absolute bottom-8 right-8 text-white font-mono text-right pointer-events-auto">
          <EditableText
            sectionId="header"
            fieldId="est"
            defaultValue="EST. 2025"
            className="text-right block w-full mb-1"
            style={{ color: "white" }}
          />
          <EditableText
            sectionId="header"
            fieldId="series"
            defaultValue="KINETIC SERIES"
            className="text-right block w-full"
            style={{ color: "white" }}
          />
        </div>
      </div>
    </div>
  )
}

export const KineticStencilLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#ffffff"
      defaultTextColor="#000000"
      {...props}
    >
      <KineticStencilContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
