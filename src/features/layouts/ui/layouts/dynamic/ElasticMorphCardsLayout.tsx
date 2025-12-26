import React, { useRef, useEffect, useState } from "react";
import { gsap } from "gsap";
import { GridSectionWrapper } from "../GridSectionWrapper";
import { CanvasSectionState } from "@/types/caption";
import { cn } from "@/shared/lib/utils";
import { DynamicLayoutWrapper } from "./core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./core/DynamicLayoutContext";
import { DynamicAddButton, DynamicDeleteButton } from "./core/LayoutButtons";
import { EditableText } from "./core/EditableText";

const ElasticMorphCardsContent: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  const { colors, editor, controlsVisible, layout } = useDynamicLayout();
  const cardsRef = useRef<HTMLDivElement[]>([]);
  const [draggedCard, setDraggedCard] = useState<number | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      cardsRef.current.forEach((card, i) => {
        if (!card) return;

        // Idle breathing animation
        gsap.to(card, {
          scaleX: 1.02,
          scaleY: 0.98,
          duration: 2 + Math.random(),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          delay: i * 0.2,
        });

        // Mouse tracking for elastic effect
        const handleMouseMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;
          const deltaX = (e.clientX - centerX) / rect.width;
          const deltaY = (e.clientY - centerY) / rect.height;

          gsap.to(card, {
            rotateY: deltaX * 10,
            rotateX: -deltaY * 10,
            duration: 0.3,
            ease: "power2.out",
          });
        };

        const handleMouseLeave = () => {
          gsap.to(card, {
            rotateY: 0,
            rotateX: 0,
            scaleX: 1,
            scaleY: 1,
            duration: 0.6,
            ease: "elastic.out(1, 0.3)",
          });
        };

        card.addEventListener("mousemove", handleMouseMove);
        card.addEventListener("mouseleave", handleMouseLeave);

        return () => {
          card.removeEventListener("mousemove", handleMouseMove);
          card.removeEventListener("mouseleave", handleMouseLeave);
        };
      });
    });
    return () => ctx.revert();
  }, [sections.length]);

  const handleDragStart = (e: React.MouseEvent, index: number) => {
    setDraggedCard(index);
    const card = cardsRef.current[index];
    if (card) {
      gsap.to(card, {
        scale: 1.1,
        boxShadow: "0 30px 60px rgba(0,0,0,0.3)",
        duration: 0.2,
      });
    }
  };

  const handleDragEnd = (index: number) => {
    setDraggedCard(null);
    const card = cardsRef.current[index];
    if (card) {
      gsap.to(card, {
        scale: 1,
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
        duration: 0.5,
        ease: "elastic.out(1, 0.4)",
      });
    }
  };

  const cardColors = [
    { bg: "#FF6B6B", accent: "#FF8E8E" },
    { bg: "#4ECDC4", accent: "#6FE5DD" },
    { bg: "#45B7D1", accent: "#67C9DF" },
    { bg: "#96CEB4", accent: "#B4E0CA" },
    { bg: "#FFEAA7", accent: "#FFF3C4" },
    { bg: "#DDA0DD", accent: "#E8B8E8" },
  ];

  return (
    <div
      className="w-full h-full overflow-hidden relative"
      style={{
        background: `linear-gradient(135deg, ${colors.backgroundColor} 0%, ${colors.backgroundColor}dd 100%)`,
      }}
    >
      {/* Decorative blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #FF6B6B, transparent 70%)",
            animation: "blob-float 10s ease-in-out infinite",
          }}
        />
        <div
          className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full opacity-20"
          style={{
            background: "radial-gradient(circle, #4ECDC4, transparent 70%)",
            animation: "blob-float 12s ease-in-out infinite reverse",
          }}
        />
      </div>

      {/* Content */}
      <div
        className="relative z-20 w-full h-full flex flex-col"
        style={{ perspective: "1200px" }}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-8 md:p-12 text-center">
          <EditableText
            sectionId="header"
            fieldId="title"
            defaultValue="ELASTIC"
            className="text-6xl md:text-8xl font-black tracking-tight"
            style={{ color: colors.textColor }}
          />
          <EditableText
            sectionId="header"
            fieldId="subtitle"
            defaultValue="Morph Cards"
            className="text-xl md:text-2xl font-light mt-2"
            style={{ color: colors.textColor, opacity: 0.6 }}
          />
        </div>

        {/* Cards Grid */}
        <div className="flex-1 overflow-y-auto px-6 pb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {sections.map((section, i) => {
              const colorSet = cardColors[i % cardColors.length];
              return (
                <div
                  key={section.id}
                  ref={(el) => {
                    if (el) cardsRef.current[i] = el;
                  }}
                  className="relative group cursor-grab active:cursor-grabbing"
                  style={{
                    transformStyle: "preserve-3d",
                  }}
                  onMouseDown={(e) => handleDragStart(e, i)}
                  onMouseUp={() => handleDragEnd(i)}
                  onMouseEnter={() => editor.setHoveredSectionId(section.id)}
                  onMouseLeave={() => editor.setHoveredSectionId(null)}
                >
                  {/* Elastic Card */}
                  <div
                    className={cn(
                      "relative rounded-3xl overflow-hidden transition-shadow duration-300",
                      "shadow-[0_10px_30px_rgba(0,0,0,0.1)]",
                      "group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.15)]"
                    )}
                    style={{
                      backgroundColor: colorSet.bg,
                      transformStyle: "preserve-3d",
                    }}
                  >
                    {/* Rubber band stretch visual */}
                    <div
                      className="absolute inset-0 opacity-0 group-active:opacity-100 transition-opacity"
                      style={{
                        background: `linear-gradient(135deg, ${colorSet.accent}, ${colorSet.bg})`,
                      }}
                    />

                    {/* Content */}
                    <div className="aspect-[4/3] relative">
                      <GridSectionWrapper
                        section={section}
                        templateSection={{
                          id: section.id,
                          name: `Elastic-${i + 1}`,
                        }}
                        isHovered={editor.hoveredSectionId === section.id}
                        onSectionDelete={props.onSectionDelete}
                        onSectionContentChange={props.onSectionContentChange}
                        {...props}
                      />
                    </div>

                    {/* Label */}
                    <div className="p-5 bg-white/20 backdrop-blur-sm">
                      <EditableText
                        sectionId={section.id}
                        fieldId="label"
                        defaultValue={`Card ${i + 1}`}
                        className="text-lg font-semibold text-white"
                      />
                      <EditableText
                        sectionId={section.id}
                        fieldId="description"
                        defaultValue="Drag me around"
                        className="text-sm text-white/70 mt-1"
                      />
                    </div>

                    {/* Shine effect */}
                    <div
                      className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{
                        background:
                          "linear-gradient(135deg, transparent 40%, rgba(255,255,255,0.2) 50%, transparent 60%)",
                      }}
                    />

                    {/* Delete Button */}
                    <DynamicDeleteButton
                      sectionId={section.id}
                      className={cn(
                        "absolute top-3 right-3 transition-opacity duration-300",
                        editor.hoveredSectionId === section.id
                          ? "opacity-100"
                          : "opacity-0"
                      )}
                    />
                  </div>

                  {/* Soft shadow */}
                  <div
                    className="absolute -bottom-4 left-8 right-8 h-8 rounded-full blur-xl opacity-30"
                    style={{ backgroundColor: colorSet.bg }}
                  />
                </div>
              );
            })}

            {/* Add Button */}
            <DynamicAddButton
              defaultValue="+ Add Card"
              className="min-h-[280px] rounded-3xl bg-white/10 border-2 border-dashed border-gray-300 hover:border-gray-400 hover:bg-white/20 transition-all"
            />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob-float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
      `}</style>
    </div>
  );
};

export const ElasticMorphCardsLayout: React.FC<{
  sections: CanvasSectionState[];
  [key: string]: any;
}> = ({ sections, ...props }) => {
  return (
    <DynamicLayoutWrapper
      layout={props.layout}
      onLayoutUpdate={props.onLayoutUpdate}
      sections={sections}
      defaultBackgroundColor="#f8f9fa"
      defaultTextColor="#1a1a2e"
      {...props}
    >
      <ElasticMorphCardsContent sections={sections} {...props} />
    </DynamicLayoutWrapper>
  );
};
