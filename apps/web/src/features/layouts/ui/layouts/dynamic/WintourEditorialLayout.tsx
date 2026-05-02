import React from "react";
import { motion } from "framer-motion";
import { CanvasLayoutState, CanvasSectionState } from "@gaki/core/types/caption";
import { cn } from "@gaki/core/lib/utils";
import { CanvasLayoutTemplate } from "@gaki/core/types/layout";
import { Plus } from "lucide-react";
import { Panel } from "./core/Panel";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { EditableText } from "./core/EditableText";
import { DynamicAddButton } from "./core/LayoutButtons";

interface WintourEditorialLayoutProps {
  sections: CanvasSectionState[];
  layout: CanvasLayoutState;
  template: CanvasLayoutTemplate;
  containerRef: React.RefObject<HTMLDivElement>;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

export const WintourEditorialLayout: React.FC<WintourEditorialLayoutProps> = ({
  sections,
  layout,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newSection: CanvasSectionState = {
      id: `wintour-section-${Date.now()}`,
      content: { type: "empty" },
      style: { background: "#ffffff", color: "#000000" },
      name: `ISSUE NO. ${sections.length + 1}`,
    };
    onLayoutUpdate({
      ...layout,
      sections: [...layout.sections, newSection],
    });
  };

  return (
    <DynamicLayoutWrapper
      layout={layout}
      onLayoutUpdate={onLayoutUpdate!}
      sections={sections}
      // Enforce a default context if needed, though we override locally
      defaultBackgroundColor="#fdfdfd"
      defaultTextColor="#000000"
    >
      <div className="relative w-full h-full bg-[#fdfdfd] overflow-y-scroll snap-y snap-mandatory scroll-smooth">
        {/* Intro Section - Always present as the cover */}
        <section className="w-full h-full min-h-full snap-start flex relative overflow-hidden bg-black text-white">
          <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center z-10">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "circOut" }}
              className="flex flex-col items-center"
            >
              <div className="relative">
                <EditableText
                  sectionId="intro"
                  fieldId="title"
                  defaultValue="THE ISSUE"
                  className="text-[12vw] font-serif leading-[0.85] mix-blend-difference text-center bg-transparent"
                  multiline
                  // FORCE WHITE TEXT for visibility on black background
                  style={{ color: "#ffffff" }}
                />
              </div>
              <div className="mt-8">
                <EditableText
                  sectionId="intro"
                  fieldId="subtitle"
                  defaultValue="Scroll for Editorials"
                  className="font-mono text-sm tracking-widest uppercase text-center bg-transparent opacity-80"
                  style={{ color: "#ffffff" }}
                />
              </div>
            </motion.div>
          </div>
          {/* Animated decorative lines */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <div className="w-px h-full bg-white absolute left-1/4" />
            <div className="w-px h-full bg-white absolute left-3/4" />
          </div>
        </section>

        {/* Dynamic Sections */}
        {sections.map((section, index) => {
          const isEven = index % 2 === 0;
          // Determine section text color for visibility
          const sectionColor = section.style?.color || "#000000";

          return (
            <section
              key={section.id}
              className="w-full h-full min-h-full snap-start flex flex-col md:flex-row relative group"
              style={{
                background: section.style?.background || "#fdfdfd",
                color: sectionColor,
              }}
            >
              {/* Split Layout: Text/Media vs Media/Text based on index */}
              <div
                className={cn(
                  "w-full md:w-1/2 h-1/2 md:h-full p-8 md:p-12 flex flex-col justify-between border-b md:border-b-0 md:border-r border-black/10 order-2 md:order-1",
                  !isEven && "md:order-2 md:border-r-0 md:border-l"
                )}
                style={{ borderColor: `${sectionColor}20` }} // 20 hex = ~12% opacity
              >
                <div className="flex items-center gap-4 w-full">
                  <EditableText
                    sectionId={section.id}
                    fieldId="title"
                    defaultValue={section.name || `Story 0${index + 1}`}
                    className="text-4xl font-bold tracking-widest uppercase font-serif w-full"
                    style={{ color: sectionColor }}
                  />
                </div>

                <div className="flex-1 mt-8 relative rounded-lg overflow-hidden bg-gray-50 border border-black/5 shadow-inner">
                  <Panel
                    section={section}
                    index={index}
                    className="bg-transparent w-full h-full"
                    wrapperProps={{
                      ...wrapperProps,
                      onLayoutUpdate,
                      layout,
                    }}
                  />
                </div>

                <div className="mt-4 font-mono text-xs flex justify-between uppercase opacity-50 w-full gap-4">
                  <div className="w-auto">
                    <EditableText
                      sectionId={section.id}
                      fieldId="pageLabel"
                      defaultValue={`PAGE ${index + 1}`}
                      className="text-left"
                      style={{ color: sectionColor }}
                    />
                  </div>
                  <div className="w-auto text-right">
                    <EditableText
                      sectionId={section.id}
                      fieldId="date"
                      defaultValue="SEPTEMBER 2024"
                      className="text-right"
                      style={{ color: sectionColor }}
                    />
                  </div>
                </div>
              </div>

              {/* Decorative Side Panel */}
              <div
                className={cn(
                  "w-full md:w-1/2 h-1/2 md:h-full relative overflow-hidden bg-gray-100 flex items-center justify-center order-1 md:order-2",
                  !isEven && "md:order-1"
                )}
              >
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5">
                  <EditableText
                    sectionId={section.id}
                    fieldId="bigIndex"
                    defaultValue={`${index + 1}`}
                    className="text-[20vw] font-serif leading-none select-none text-center w-full bg-transparent"
                    style={{ color: "#000000" }} // Always dark for the watermark
                  />
                </div>
              </div>
            </section>
          );
        })}

        {/* Add Page Button - Final Section */}
        <section className="w-full h-full min-h-full snap-start flex items-center justify-center bg-gray-50 border-t border-black/10">
          <div
            onClick={handleAddSection}
            className="flex flex-col items-center justify-center gap-4 group cursor-pointer"
          >
            <div className="w-32 h-32 rounded-full border-2 border-dashed border-black/20 flex items-center justify-center group-hover:border-black group-hover:bg-white transition-all duration-300">
              <Plus className="w-12 h-12 text-black/20 group-hover:text-black transition-colors" />
            </div>
            <div className="font-serif italic text-xl text-black/50 group-hover:text-black transition-colors">
              <EditableText
                sectionId="ui"
                fieldId="add_button_text"
                defaultValue="Add New Issue Page"
                className="text-center bg-transparent min-w-[200px]"
                style={{ color: "inherit" }} // Inherit hover colors
              />
            </div>
          </div>
        </section>

        {/* Floating Indicators */}
        <div className="fixed bottom-8 left-8 z-50 mix-blend-difference text-white pointer-events-auto">
          <EditableText
            sectionId="ui"
            fieldId="footer_brand"
            defaultValue="VOGUE EDITORIAL"
            className="font-bold tracking-widest text-xs bg-transparent"
            style={{ color: "white" }}
          />
        </div>

        <div className="fixed bottom-8 right-8 z-50 pointer-events-none">
          <div className="flex flex-col gap-1 items-end">
            {sections.map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full bg-black/20 transition-all",
                  i === 0 && "bg-black scale-125"
                )}
              />
            ))}
          </div>
        </div>
      </div>
    </DynamicLayoutWrapper>
  );
};
