import React, { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { useLayoutEditor } from "@/hooks/useLayoutEditor";
import { LayoutEditorToolbar } from "../LayoutEditorToolbar";
import { LayoutSettingsCtrl } from "../LayoutSettingsCtrl";

interface KineticStencilLayoutProps {
  sections: CanvasSectionState[];
  [key: string]: any;
}

export const KineticStencilLayout: React.FC<KineticStencilLayoutProps> = ({
  sections,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  const {
    focusedField,
    setFocusedField,
    toolbarRef,
    handleUpdateText,
    handleUpdateStyle,
    handleFocus,
    getFieldStyle,
    getGlobalSettings,
    updateGlobalSetting,
  } = useLayoutEditor({
    layout: props.layout,
    onLayoutUpdate: props.onLayoutUpdate,
  });

  const { backgroundColor, textColor } = getGlobalSettings("#ffffff", "#000000"); // Mask defaults to white, text to black

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Breaths animation for the giant text
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
  const headerData = props.layout.customSectionData?.["header"] || {};

  // Note: For Stencil, the "backgroundColor" is actually the mask color. 
  // The "textColor" is the text color that PUNCHES THROUGH (usually black because mix-blend-multiply on white mask creates transparency where black is).
  // But strictly speaking, in mix-blend-multiply: 
  // White (bg) -> Transparent
  // Black (text) -> Opaque (shows video if underlying is lighter? No wait.)

  // Standard Stencil Trick: 
  // Background: White
  // Text: Black
  // mix-blend-mode: multiply.
  // Result: White becomes transparent (showing video), Black stays black (occluding video). 
  // Wait, no. multiply: Result = Base * Blend.
  // Video * White (1) = Video.
  // Video * Black (0) = Black.

  // So if we want the TEXT to be the hole (seeing video through text):
  // We need 'screen' mode with Black Background and White Text?
  // Video * Black (0) = 0 (Black).
  // Video * White (1) = Video.

  // Let's stick to the user's requested "customization" but warn them visually or just let them experiment.
  // For the existing implementation: 
  // bg-white mix-blend-multiply. 
  // This means the WHITE parts will show the video? No.
  // Multiply: Top layer (White) * Bottom layer (Video). 
  // 1 * C = C. So White shows Video.
  // 0 * C = 0. So Black blocks Video (shows black).

  // So currently: Text is Black (Blocks video), Background is White (Shows video).
  // This means it's a "Reverse Stencil" or just "Text Overlay" effectively?
  // "Giant text mask over video" usually means seeing video IN the text.
  // To see video IN text: Background Black (Opaque), Text White (Transparent/Video).
  // Blend Mode: Screen?
  // Bottom: Video. Top: Black BG, White Text. Screen.
  // Black (0) + C - 0 = C? No. Screen: 1 - (1-Top)(1-Bottom).
  // Top Black (0): 1 - (1)(1-C) = C. Video shows.
  // Top White (1): 1 - (0)(...) = 1. White shows.

  // Let's just expose the colors and let the user handle the "Stencil" logic via colors.

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative bg-black overflow-hidden"
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
        style={{ backgroundColor }} // User controls this. Default white.
      >
        <div ref={textRef} className="text-center w-full pointer-events-auto">
          <input
            value={headerData.line1 ?? "VISION"}
            onChange={(e) => handleUpdateText("header", "line1", e.target.value)}
            onFocus={(e) => handleFocus("header_line1", e)}
            style={{
              ...getFieldStyle("header_line1"),
              color: textColor
            }}
            className="w-full text-center bg-transparent border-none focus:outline-none text-[25vw] font-black leading-none tracking-tighter uppercase p-0 m-0"
          />
          <input
            value={headerData.line2 ?? "ARY"}
            onChange={(e) => handleUpdateText("header", "line2", e.target.value)}
            onFocus={(e) => handleFocus("header_line2", e)}
            style={{
              ...getFieldStyle("header_line2"),
              color: textColor
            }}
            className="w-full text-center bg-transparent border-none focus:outline-none text-[25vw] font-black leading-none tracking-tighter uppercase p-0 m-0 -mt-[5vw]"
          />
        </div>
      </div>

      {/* 3. Overlay Elements (On top of everything) */}
      <div className="absolute inset-0 z-20 pointer-events-none p-12 border-[20px] border-white/10">
        <div className="absolute top-8 left-8 bg-black text-white px-4 py-2 font-mono text-xl uppercase pointer-events-auto">
          <input
            value={headerData.badge ?? "Live Feed"}
            onChange={(e) => handleUpdateText("header", "badge", e.target.value)}
            className="bg-transparent border-none focus:outline-none text-inherit w-32"
          />
        </div>
        <div className="absolute bottom-8 right-8 text-white font-mono text-right pointer-events-auto">
          <input
            value={headerData.est ?? "EST. 2025"}
            onChange={(e) => handleUpdateText("header", "est", e.target.value)}
            className="bg-transparent text-right block w-full mb-1 focus:outline-none"
          />
          <input
            value={headerData.series ?? "KINETIC SERIES"}
            onChange={(e) => handleUpdateText("header", "series", e.target.value)}
            className="bg-transparent text-right block w-full focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
};
