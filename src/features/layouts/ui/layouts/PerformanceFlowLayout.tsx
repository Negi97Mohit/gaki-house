import React, { useRef, useState, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { motion, AnimatePresence, useMotionValue } from "framer-motion";
import { Plus, Trash2 } from "lucide-react";
import { DynamicLayoutWrapper } from "./dynamic/core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./dynamic/core/DynamicLayoutContext";
import { EditableText } from "./dynamic/core/EditableText";

const PerformanceFlowContent: React.FC<any> = ({
  layout,
  template,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const { colors } = useDynamicLayout();
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Motion value for horizontal scroll
  const x = useMotionValue(0);

  // Resizing State
  const [isResizing, setIsResizing] = useState(false);
  const resizingRef = useRef<{
    startX: number;
    startWidth: number;
    sectionId: string;
  } | null>(null);

  // Resolve sections based on order or template defaults
  const sectionIds =
    layout.sectionOrder && layout.sectionOrder.length > 0
      ? layout.sectionOrder
      : template.sections.map((s: any) => s.id);

  // Custom Add Section with specific default data
  const handleAddSection = () => {
    if (!onLayoutUpdate) return;
    const newId = `flow-${Date.now()}`;

    // Create new section state
    const newSection: CanvasSectionState = {
      id: newId,
      content: { type: "empty" },
    };

    const newSections = [...layout.sections, newSection];
    const newOrder = [...sectionIds, newId];

    const newCustomData = {
      ...layout.customSectionData,
      [newId]: {
        name: "New Feature",
        subtitle: "Performance Class '23",
      },
    };

    onLayoutUpdate({
      ...layout,
      sections: newSections,
      sectionOrder: newOrder,
      customSectionData: newCustomData,
    });
  };

  const handleDeleteSection = (idToDelete: string) => {
    if (!onLayoutUpdate) return;
    if (!confirm("Delete this panel?")) return;

    const newSections = layout.sections.filter((s: any) => s.id !== idToDelete);
    const newOrder = sectionIds.filter((id: string) => id !== idToDelete);

    const newCustomData = { ...layout.customSectionData };
    delete newCustomData[idToDelete];

    onLayoutUpdate({
      ...layout,
      sections: newSections,
      sectionOrder: newOrder,
      customSectionData: newCustomData,
    });
  };

  // Resizing Logic
  const handleResizeStart = (
    e: React.MouseEvent,
    sectionId: string,
    currentWidth: number
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizingRef.current = {
      startX: e.clientX,
      startWidth: currentWidth,
      sectionId,
    };

    document.body.style.cursor = "col-resize";
    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd);
  };

  const handleResizeMove = useCallback(
    (e: MouseEvent) => {
      if (!resizingRef.current || !onLayoutUpdate) return;

      const { startX, startWidth, sectionId } = resizingRef.current;
      const diff = e.clientX - startX;
      const newWidth = Math.max(300, startWidth + diff); // Minimum 300px

      // Update layout with new width in customSectionStyles
      const newStyles = {
        ...layout.customSectionStyles,
        [sectionId]: {
          ...layout.customSectionStyles?.[sectionId],
          width: `${newWidth}px`,
        },
      };

      onLayoutUpdate({
        ...layout,
        customSectionStyles: newStyles,
      });
    },
    [layout, onLayoutUpdate]
  );

  const handleResizeEnd = useCallback(() => {
    setIsResizing(false);
    resizingRef.current = null;
    document.body.style.cursor = "";
    document.removeEventListener("mousemove", handleResizeMove);
    document.removeEventListener("mouseup", handleResizeEnd);
  }, [handleResizeMove]);

  // Handle Wheel for Horizontal Scroll
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      // Map vertical scroll (deltaY) to horizontal movement
      if (Math.abs(e.deltaY) === 0) return;

      const currentX = x.get();
      // Invert deltaY so scrolling down moves right, scrolling up moves left
      const newX = currentX - e.deltaY;

      if (trackRef.current && containerRef.current) {
        const trackWidth = trackRef.current.scrollWidth;
        const containerWidth = containerRef.current.clientWidth;

        // If content fits, don't scroll
        if (trackWidth <= containerWidth) {
          x.set(0);
          return;
        }

        // Calculate constraints:
        // Max X is 0 (left edge)
        // Min X is containerWidth - trackWidth (right edge)
        const minX = containerWidth - trackWidth;
        const maxX = 0;

        // Clamp value
        if (newX > maxX) x.set(maxX);
        else if (newX < minX) x.set(minX);
        else x.set(newX);
      } else {
        x.set(newX);
      }
    },
    [x]
  );

  return (
    <div
      className="w-full h-full flex items-center overflow-hidden relative transition-colors duration-500"
      style={{ backgroundColor: colors.backgroundColor }}
      ref={containerRef}
      onWheel={handleWheel}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10" />

      <motion.div
        ref={trackRef}
        className="flex gap-4 px-[10vw] h-[80vh] items-center cursor-grab active:cursor-grabbing"
        style={{ x }} // Bind motion value
        drag="x"
        dragConstraints={containerRef}
        whileTap={{ cursor: isResizing ? "col-resize" : "grabbing" }}
        dragListener={!isResizing} // Disable drag when resizing
      >
        <AnimatePresence mode="popLayout">
          {sectionIds.map((sectionId: string, index: number) => {
            const section =
              layout.sections.find((s: any) => s.id === sectionId) ||
              ({
                id: sectionId,
                content: { type: "empty" },
              } as CanvasSectionState);

            const templateSection = template.sections.find(
              (s: any) => s.id === sectionId
            ) || { id: sectionId };
            const customData = layout.customSectionData?.[sectionId] || {};
            const customStyle = layout.customSectionStyles?.[sectionId] || {};

            const widthString = customStyle.width as string;
            const width = widthString ? parseInt(widthString) : 400; // Default 400px

            const isHovered = hoveredSectionId === sectionId;

            return (
              <motion.div
                key={sectionId}
                layout={!isResizing} // disable layout animation during resize to prevent jitter
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                className={cn(
                  "relative h-full bg-black/40 rounded-sm overflow-hidden border border-white/10 group",
                  "flex-shrink-0 transition-all duration-300 ease-out"
                )}
                style={{ width: `${width}px`, minWidth: `${width}px` }}
                onMouseEnter={() => setHoveredSectionId(sectionId)}
                onMouseLeave={() => setHoveredSectionId(null)}
                whileHover={{
                  zIndex: 10,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                {/* Resize Handle */}
                <div
                  className="absolute right-0 top-0 bottom-0 w-4 z-50 cursor-col-resize flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
                  onMouseDown={(e) => handleResizeStart(e, sectionId, width)}
                  // Prevent dragging parent
                  onPointerDown={(e) => e.stopPropagation()}
                >
                  <div className="w-[2px] h-8 bg-white/30 rounded-full" />
                </div>

                {/* Overlay Gradient for Text Readability */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-20 pointer-events-none" />

                <div className="absolute top-4 left-4 z-30 opacity-70 group-hover:opacity-100 transition-opacity flex justify-between w-full pr-8">
                  <span className="text-xs font-mono uppercase tracking-widest text-white/60 border border-white/20 px-2 py-1 rounded-full pointer-events-none select-none">
                    {index < 9 ? `0${index + 1}` : index + 1}
                  </span>

                  {/* Delete Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSection(sectionId);
                    }}
                    className="p-1.5 bg-red-500/20 text-red-400 rounded-full hover:bg-red-500 hover:text-white transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3 H-3" />
                  </button>
                </div>

                <div className="absolute bottom-6 left-6 z-30 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 w-[90%]">
                  <EditableText
                    sectionId={sectionId}
                    fieldId="name"
                    defaultValue={templateSection.name ?? "Featured Item"}
                    className="text-2xl font-bold mb-1 leading-tight tracking-tight w-full"
                    style={{ color: "white" }}
                  />
                  <EditableText
                    sectionId={sectionId}
                    fieldId="subtitle"
                    defaultValue={
                      customData.subtitle ?? "Performance Class '23"
                    }
                    className="text-white/60 text-sm font-light tracking-wide uppercase w-full"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  />
                </div>

                <div className="w-full h-full relative">
                  <GridSectionWrapper
                    {...wrapperProps}
                    section={section}
                    templateSection={templateSection}
                    isHovered={isHovered}
                  />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {/* Add Section Button */}
        <motion.button
          layout
          onClick={handleAddSection}
          className="min-w-[100px] h-full flex flex-col items-center justify-center border border-dashed border-white/20 rounded-sm hover:bg-white/5 hover:border-white/40 transition-colors text-white/50 hover:text-white group flex-shrink-0"
          whileHover={{ scale: 0.98 }}
          whileTap={{ scale: 0.95 }}
        >
          <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6" />
          </div>
          <span className="text-sm font-medium uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
            Add Panel
          </span>
        </motion.button>

        {/* Padding to ensure last item is visible/draggable fully */}
        <div className="min-w-[10vw]" />
      </motion.div>
    </div>
  );
};

export const PerformanceFlowLayout: React.FC<any> = (props) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={props.layout.sections}
      defaultBackgroundColor="#1a1a1a"
      defaultTextColor="#ffffff"
      {...props}
    >
      <PerformanceFlowContent {...props} />
    </DynamicLayoutWrapper>
  );
};
