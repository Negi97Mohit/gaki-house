import React, { useRef, useEffect, useState, useCallback } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

gsap.registerPlugin(ScrollTrigger);

const HauteCoutureStacksContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { colors, editor } = useDynamicLayout();
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Order of sections (indices) - last element is the top card
  const [stackOrder, setStackOrder] = useState<number[]>([]);

  // Drag state
  const dragRef = useRef({
    isDragging: false,
    startX: 0,
    activeCardIndex: -1,
  });

  const [expandedCard, setExpandedCard] = useState<number | null>(null);

  // Initialize stack order when sections change
  useEffect(() => {
    setStackOrder(sections.map((_, i) => i));
  }, [sections.length]);

  // Update visual positions of all cards based on stackOrder
  const updateCardVisuals = useCallback(
    (instant = false) => {
      if (stackOrder.length === 0) return;

      stackOrder.forEach((sectionIndex, visualIndex) => {
        const card = cardsRef.current[sectionIndex];
        if (!card) return;

        // visualIndex 0 is bottom, length-1 is top
        const distFromTop = stackOrder.length - 1 - visualIndex;

        // Visual parameters
        const scale = Math.max(1 - distFromTop * 0.05, 0.5);
        const opacity = Math.max(1 - distFromTop * 0.15, 0);
        // Random-ish but deterministic rotation
        const rotation =
          distFromTop === 0
            ? 0
            : (sectionIndex % 2 === 0 ? 1 : -1) * (2 + distFromTop);
        const zIndex = visualIndex + 10;

        if (instant) {
          gsap.set(card, {
            scale,
            opacity,
            rotation,
            zIndex,
            x: 0,
            y: 0,
            overwrite: "auto",
          });
        } else {
          gsap.to(card, {
            scale,
            opacity,
            rotation,
            zIndex,
            x: 0,
            y: 0,
            duration: 0.5,
            ease: "power3.out",
            overwrite: "auto",
          });
        }
      });
    },
    [stackOrder]
  );

  // Initial setup
  useEffect(() => {
    updateCardVisuals(true);
  }, [updateCardVisuals]);

  // Drag Interaction Logic
  const handlePointerDown = (e: React.PointerEvent, sectionIndex: number) => {
    // Only allow dragging the top card
    if (sectionIndex !== stackOrder[stackOrder.length - 1]) return;
    if (expandedCard !== null) return;

    const card = cardsRef.current[sectionIndex];
    if (!card) return;

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      activeCardIndex: sectionIndex,
    };

    // Lift the card slightly
    gsap.to(card, { scale: 1.05, duration: 0.2, ease: "power2.out" });

    // Capture pointer
    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const card = cardsRef.current[dragRef.current.activeCardIndex];

    if (card) {
      gsap.set(card, {
        x: deltaX,
        rotation: deltaX * 0.05, // Slight rotation with drag
      });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!dragRef.current.isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const absDeltaX = Math.abs(deltaX);
    const card = cardsRef.current[dragRef.current.activeCardIndex];

    const TAP_THRESHOLD = 5; // Pixels: movement less than this is a click
    const SWIPE_THRESHOLD = 150; // Pixels: movement more than this is a swipe

    if (card) {
      if (absDeltaX < TAP_THRESHOLD) {
        // 1. CLICK / TAP ACTION
        // Only if barely moved
        setExpandedCard(dragRef.current.activeCardIndex);

        // Reset scale from the "lift" animation
        gsap.to(card, { scale: 1, duration: 0.3 });
      } else if (absDeltaX > SWIPE_THRESHOLD) {
        // 2. SWIPE SUCCESS ACTION
        const direction = deltaX > 0 ? 1 : -1;
        const endX = window.innerWidth * direction;

        gsap.to(card, {
          x: endX,
          rotation: direction * 45,
          opacity: 0,
          duration: 0.4,
          ease: "power2.in",
          onComplete: () => {
            // Move top card to bottom of stack
            setStackOrder((prev) => {
              const newOrder = [...prev];
              const topCard = newOrder.pop();
              if (topCard !== undefined) newOrder.unshift(topCard);
              return newOrder;
            });
            // Reset position (will be hidden at bottom)
            gsap.set(card, { x: 0, y: 0, opacity: 0 });
          },
        });
      } else {
        // 3. CANCEL ACTION (Spring back)
        gsap.to(card, {
          x: 0,
          rotation: 0,
          scale: 1,
          duration: 0.5,
          ease: "elastic.out(1, 0.5)",
        });
      }
    }

    dragRef.current.isDragging = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
  };

  const handleCloseExpanded = () => {
    setExpandedCard(null);
  };

  return (
    <div
      ref={containerRef}
      className="w-full h-full overflow-hidden relative select-none"
      style={{
        perspective: "1500px",
        touchAction: "none",
      }}
    >
      {/* Elegant pattern background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='${encodeURIComponent(
            colors.textColor
          )}' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col p-6 md:p-12">
        {/* Header */}
        <header className="flex-shrink-0 mb-8 flex justify-between items-end">
          <div>
            <EditableText
              sectionId="header"
              fieldId="brand"
              defaultValue="HAUTE"
              className="text-xs font-light tracking-[0.5em] opacity-50"
              style={{ color: colors.textColor }}
            />
            <EditableText
              sectionId="header"
              fieldId="title"
              defaultValue="COUTURE"
              className="text-5xl md:text-7xl font-extralight tracking-[0.2em]"
              style={{
                color: colors.textColor,
                fontFamily: "'Playfair Display', serif",
              }}
            />
          </div>
          <div className="text-right hidden md:block">
            <EditableText
              sectionId="header"
              fieldId="season"
              defaultValue="SS25"
              className="text-4xl font-extralight"
              style={{ color: colors.textColor }}
            />
          </div>
        </header>

        {/* Runway Cards Stack */}
        <div className="flex-1 flex flex-col items-center justify-center pb-12 relative">
          <div className="relative w-full max-w-md aspect-[3/4]">
            {/* Stack Container */}
            <div className="absolute inset-0">
              {sections.map((section, i) => {
                // Calculate visual order
                const isTop = stackOrder[stackOrder.length - 1] === i;

                return (
                  <div
                    key={section.id}
                    ref={(el) => {
                      cardsRef.current[i] = el;
                    }}
                    className={cn(
                      "absolute inset-0 bg-white shadow-2xl overflow-hidden rounded-xl",
                      // Only the top card gets pointer events
                      isTop
                        ? "cursor-grab active:cursor-grabbing touch-none"
                        : "pointer-events-none"
                    )}
                    onPointerDown={(e) => handlePointerDown(e, i)}
                    onPointerMove={handlePointerMove}
                    onPointerUp={handlePointerUp}
                    onPointerLeave={handlePointerUp}
                    // Removed onClick to prevent conflict
                  >
                    {/* Card content */}
                    <div className="absolute inset-0 pointer-events-none">
                      <GridSectionWrapper
                        section={section}
                        templateSection={{
                          id: section.id,
                          name: `Look-${i + 1}`,
                        }}
                        isHovered={editor.hoveredSectionId === section.id}
                        onSectionDelete={props.onSectionDelete}
                        onSectionContentChange={props.onSectionContentChange}
                        {...props}
                      />
                    </div>

                    {/* Look number badge */}
                    <div className="absolute top-4 left-4 px-3 py-1 bg-white/90 backdrop-blur-sm z-20">
                      <EditableText
                        sectionId={section.id}
                        fieldId="look_number"
                        defaultValue={`LOOK ${String(i + 1).padStart(2, "0")}`}
                        className="text-xs font-light tracking-widest text-black"
                      />
                    </div>

                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20 pointer-events-none" />

                    {/* Delete button (only visible on top card for admin) */}
                    <DynamicDeleteButton
                      sectionId={section.id}
                      className={cn(
                        "absolute top-4 right-4 z-30 pointer-events-auto",
                        isTop && editor.hoveredSectionId === section.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-12 text-center opacity-40">
            <p
              className="text-xs tracking-widest uppercase mb-2"
              style={{ color: colors.textColor }}
            >
              Swipe to Navigate • Tap to Expand
            </p>
            <div className="w-12 h-1 bg-current mx-auto rounded-full opacity-20" />
          </div>
        </div>

        {/* Add Button */}
        <div className="flex-shrink-0 flex justify-center">
          <DynamicAddButton
            defaultValue="+ ADD LOOK"
            className="px-8 py-4 border border-current hover:bg-black/5 text-sm tracking-[0.3em] font-light transition-colors"
            style={{ color: colors.textColor }}
          />
        </div>
      </div>

      {/* Lightbox - Expanded View */}
      {expandedCard !== null && sections[expandedCard] && (
        <div
          className="fixed inset-0 z-[1000] bg-black/95 flex items-center justify-center p-4 md:p-8"
          onClick={handleCloseExpanded}
        >
          <button
            onClick={handleCloseExpanded}
            className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
          >
            <span className="text-white text-2xl">&times;</span>
          </button>

          <div
            className="relative bg-white w-full max-w-5xl h-[85vh] overflow-hidden shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <GridSectionWrapper
              section={sections[expandedCard]}
              templateSection={{
                id: sections[expandedCard].id,
                name: `Look-${expandedCard + 1}`,
              }}
              isHovered={false}
              onSectionDelete={props.onSectionDelete}
              onSectionContentChange={props.onSectionContentChange}
              {...props}
            />
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-white via-white/90 to-transparent">
              <EditableText
                sectionId={sections[expandedCard].id}
                fieldId="title"
                defaultValue={`Silhouette ${expandedCard + 1}`}
                className="text-3xl font-light text-black"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const HauteCoutureStacksLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#f8f8f6"
      defaultTextColor="#1a1a1a"
      {...props}
    >
      <HauteCoutureStacksContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
