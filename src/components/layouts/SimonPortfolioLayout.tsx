import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/types/layout";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { ArrowUpRight, Plus, Info, X } from "lucide-react";
import gsap from "gsap";
import { DynamicLayoutWrapper } from "./dynamic/core/DynamicLayoutWrapper";
import { useDynamicLayout } from "./dynamic/core/DynamicLayoutContext";
import { EditableText } from "./dynamic/core/EditableText";
import { DynamicDeleteButton } from "./dynamic/core/LayoutButtons";
import { LayoutControlsPortal } from "./dynamic/core/LayoutControlsPortal";
import { AnimatePresence, motion } from "framer-motion";

interface SimonPortfolioLayoutProps {
  layout: CanvasLayoutState;
  template: CanvasLayoutTemplate;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

// Animated project title with magnetic hover effect
const AnimatedProjectTitle: React.FC<{
  sectionId: string;
  defaultValue: string;
  index: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ sectionId, defaultValue, index, isActive, onClick }) => {
  const titleRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!titleRef.current) return;

    if (isHovered) {
      gsap.to(titleRef.current, {
        skewX: -3,
        scale: 1.02,
        duration: 0.4,
        ease: "power2.out",
      });
    } else {
      gsap.to(titleRef.current, {
        skewX: 0,
        scale: 1,
        duration: 0.4,
        ease: "power2.out",
      });
    }
  }, [isHovered]);

  return (
    <div
      ref={titleRef}
      className={cn(
        "relative cursor-pointer group transition-opacity duration-300",
        isActive ? "opacity-100" : "opacity-40 hover:opacity-100"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div className="flex items-baseline gap-4 md:gap-8 pointer-events-none">
        <span className="text-sm md:text-base font-light opacity-50 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="pointer-events-auto">
          <EditableText
            sectionId={sectionId}
            fieldId="name"
            defaultValue={defaultValue}
            className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter leading-none uppercase"
          />
        </div>
        <ArrowUpRight
          className={cn(
            "w-6 h-6 md:w-10 md:h-10 transition-all duration-300 opacity-0 -translate-x-4",
            isHovered && "opacity-100 translate-x-0"
          )}
        />
      </div>

      {/* Underline animation */}
      <div
        className={cn(
          "absolute bottom-0 left-12 md:left-16 h-[2px] bg-current transition-all duration-500 origin-left",
          isHovered ? "w-full scale-x-100" : "w-0 scale-x-0"
        )}
      />
    </div>
  );
};

// Loading animation component
const LoadingAnimation: React.FC<{ onComplete: () => void }> = ({
  onComplete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
        // ADD THIS CHECK:
        if (!containerRef.current) return;

        gsap.to(containerRef.current, {
          yPercent: -100,
          duration: 0.8,
          ease: "power3.inOut",
          onComplete,
        });
      },
    });

    // Animate loading text
    const chars = textRef.current.querySelectorAll(".char");
    tl.fromTo(
      chars,
      { y: 100, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.6, ease: "power3.out" }
    );
    tl.to(
      chars,
      { y: -100, opacity: 0, stagger: 0.03, duration: 0.4, ease: "power3.in" },
      "+=0.5"
    );
  }, [onComplete]);

  const text = "LOADING";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
    >
      <div
        ref={textRef}
        className="text-white text-6xl md:text-9xl font-bold tracking-tighter flex overflow-hidden"
      >
        {text.split("").map((char, i) => (
          <span key={i} className="char inline-block">
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

// Project detail view with animations
const ProjectDetail: React.FC<{
  section: CanvasSectionState;
  templateSection: any;
  customData: any;
  style: React.CSSProperties;
  isActive: boolean;
  wrapperProps: any;
  onDelete: (id: string, e: React.MouseEvent) => void;
}> = ({
  section,
  templateSection,
  customData,
  style,
  isActive,
  wrapperProps,
  onDelete,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (isActive) {
      gsap.fromTo(
        containerRef.current.querySelectorAll(".animate-in"),
        { y: 60, opacity: 0 },
        { y: 0, opacity: 1, stagger: 0.1, duration: 0.8, ease: "power3.out" }
      );
    }
  }, [isActive]);

  const name = templateSection?.name ?? "Project Title";
  const description = templateSection?.description ?? "Project Description";

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen flex flex-col relative group"
      style={style}
    >
      {/* Restored Delete Button */}
      <DynamicDeleteButton
        sectionId={section.id}
        onDelete={onDelete}
        className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity z-50"
      />

      {/* Project content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Project info */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="space-y-8">
            {/* Meta info */}
            <div className="animate-in flex gap-8 text-sm uppercase tracking-widest opacity-60">
              <EditableText
                sectionId={section.id}
                fieldId="year"
                defaultValue="2024"
                className="font-mono"
              />
              <EditableText
                sectionId={section.id}
                fieldId="category"
                defaultValue="Design"
              />
            </div>

            {/* Title */}
            <div className="animate-in">
              <EditableText
                sectionId={section.id}
                fieldId="name"
                defaultValue={name}
                className="text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter leading-[0.85] uppercase"
              />
            </div>

            {/* Description */}
            <div className="animate-in">
              <EditableText
                sectionId={section.id}
                fieldId="description"
                defaultValue={description}
                multiline
                className="text-lg md:text-xl font-light opacity-70 max-w-md leading-relaxed"
              />
            </div>

            {/* Client */}
            <div className="animate-in pt-8 border-t border-current/20">
              <span className="text-xs uppercase tracking-widest opacity-40 block mb-2">
                Client
              </span>
              <EditableText
                sectionId={section.id}
                fieldId="client"
                defaultValue="Client Name"
                className="text-lg font-medium"
              />
            </div>
          </div>
        </div>

        {/* Right side - Project media */}
        <div className="w-full md:w-1/2 relative min-h-[50vh] md:min-h-full">
          <div className="absolute inset-4 md:inset-8 bg-black/5 rounded-lg overflow-hidden">
            <GridSectionWrapper
              {...wrapperProps}
              section={section}
              templateSection={templateSection || { id: section.id }}
              isHovered={isActive}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

const SimonPortfolioContent: React.FC<any> = ({
  template,
  ...wrapperProps
}) => {
  const { layout, onLayoutUpdate } = useDynamicLayout();
  const [showLoader, setShowLoader] = useState(true);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const [showInfo, setShowInfo] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const sectionIds = layout.sectionOrder?.length
    ? layout.sectionOrder
    : template.sections.map((s: any) => s.id);

  const handleAddSection = useCallback(() => {
    if (!onLayoutUpdate) return;

    const newId = `project-${Date.now()}`;
    const colors = [
      "#B21C1B",
      "#003F66",
      "#CFCC93",
      "#1a1a1a",
      "#2a4a3f",
      "#4a2a5a",
    ];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const textColor = ["#CFCC93"].includes(randomColor) ? "#000" : "#fff";

    onLayoutUpdate({
      ...layout,
      sections: [...layout.sections, { id: newId, content: { type: "empty" } }],
      sectionOrder: [...sectionIds, newId],
      customSectionData: {
        ...layout.customSectionData,
        [newId]: {
          name: "New Project",
          description: "Project description goes here",
          year: "2024",
          category: "Design",
          client: "Client Name",
        },
      },
      customSectionStyles: {
        ...layout.customSectionStyles,
        [newId]: { backgroundColor: randomColor, color: textColor },
      },
    });
  }, [layout, onLayoutUpdate, sectionIds]);

  const handleDeleteSection = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      if (!onLayoutUpdate) return;
      if (!confirm("Delete this project?")) return;

      const newCustomData = { ...layout.customSectionData };
      delete newCustomData[id];
      const newCustomStyles = { ...layout.customSectionStyles };
      delete newCustomStyles[id];

      onLayoutUpdate({
        ...layout,
        sections: layout.sections.filter((s) => s.id !== id),
        sectionOrder: sectionIds.filter((sid: string) => sid !== id),
        customSectionData: newCustomData,
        customSectionStyles: newCustomStyles,
      });

      if (activeProjectIndex !== null) {
        setActiveProjectIndex(null);
        setViewMode("list");
      }
    },
    [layout, onLayoutUpdate, sectionIds, activeProjectIndex]
  );

  const handleProjectClick = (index: number) => {
    setActiveProjectIndex(index);
    setViewMode("detail");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setActiveProjectIndex(null);
  };

  // Entrance animation for list view
  useEffect(() => {
    if (showLoader || viewMode !== "list" || !containerRef.current) return;

    gsap.fromTo(
      containerRef.current.querySelectorAll(".project-item"),
      { y: 80, opacity: 0 },
      {
        y: 0,
        opacity: 1,
        stagger: 0.15,
        duration: 1,
        ease: "power3.out",
        delay: 0.2,
      }
    );
  }, [showLoader, viewMode]);

  return (
    <div className="w-full h-full overflow-y-auto bg-white text-black font-sans relative">
      {/* Loading animation */}
      {showLoader && (
        <LoadingAnimation onComplete={() => setShowLoader(false)} />
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div
          ref={containerRef}
          className="w-full min-h-screen pt-16 md:pt-24 px-6 md:px-16"
        >
          {/* Hero section */}
          <div className="mb-20 md:mb-32 max-w-4xl">
            <EditableText
              sectionId="_global"
              fieldId="tagline"
              defaultValue="Independent Graphic Designer"
              className="text-3xl md:text-5xl font-light leading-snug"
            />
            <EditableText
              sectionId="_global"
              fieldId="location"
              defaultValue="Paris, France"
              className="text-lg mt-6 opacity-50 block"
            />
          </div>

          {/* Projects list */}
          <div className="space-y-4 md:space-y-6 pb-32">
            {sectionIds.map((sectionId: string, index: number) => {
              const templateSection = template.sections.find(
                (s: any) => s.id === sectionId
              );
              const name = templateSection?.name ?? "Untitled Project";

              return (
                <div key={sectionId} className="project-item">
                  <AnimatedProjectTitle
                    sectionId={sectionId}
                    defaultValue={name}
                    index={index}
                    isActive={activeProjectIndex === index}
                    onClick={() => handleProjectClick(index)}
                  />
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <footer className="fixed bottom-0 left-0 right-0 p-6 md:p-10 flex justify-between items-end text-sm opacity-50 pointer-events-none">
            <span>© {new Date().getFullYear()}</span>
            <span>SCROLL TO EXPLORE</span>
          </footer>
        </div>
      )}

      {/* Detail View */}
      {viewMode === "detail" && activeProjectIndex !== null && (
        <div className="w-full min-h-screen">
          {sectionIds.map((sectionId: string, index: number) => {
            if (index !== activeProjectIndex) return null;

            const section = layout.sections.find((s) => s.id === sectionId) || {
              id: sectionId,
              content: { type: "empty" as const },
            };
            const templateSection = template.sections.find(
              (s: any) => s.id === sectionId
            );
            const style = layout.customSectionStyles?.[sectionId] ||
              templateSection?.style || {
                backgroundColor: "#f0f0f0",
                color: "#000",
              };
            const customData = layout.customSectionData?.[sectionId] || {};

            return (
              <ProjectDetail
                key={sectionId}
                section={section}
                templateSection={templateSection}
                customData={customData}
                style={style}
                isActive={true}
                wrapperProps={wrapperProps}
                onDelete={handleDeleteSection}
              />
            );
          })}

          {/* Back button - bottom-left */}
          <button
            onClick={handleBackToList}
            className="fixed bottom-24 left-6 z-50 px-6 py-2 text-sm font-medium tracking-wide border border-current/40 rounded-full hover:bg-black hover:text-white transition-all duration-300 backdrop-blur-md"
          >
            ← BACK TO LIST
          </button>
        </div>
      )}

      {/* Control Island Portal */}
      <LayoutControlsPortal>
        <div className="relative">
          <AnimatePresence>
            {showInfo && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "circOut" }}
                className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 bg-black/80 p-4 rounded-2xl backdrop-blur-xl border border-white/10 shadow-2xl w-64 flex flex-col gap-4 origin-bottom z-50"
              >
                <div className="text-center text-white/60 font-mono text-[10px] tracking-widest border-b border-white/10 pb-2">
                  SIMON LAYOUT
                </div>

                <button
                  onClick={handleAddSection}
                  className="w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] group"
                >
                  <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform" />
                  <span className="text-xs font-medium tracking-wide">
                    ADD PROJECT
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={cn(
              "rounded-full h-10 w-10 hover:bg-background/60 flex items-center justify-center transition-all",
              showInfo ? "bg-white text-black hover:bg-white/90" : "text-white"
            )}
          >
            {showInfo ? (
              <X className="w-4 h-4" />
            ) : (
              <Info className="w-4 h-4" />
            )}
          </button>
        </div>
      </LayoutControlsPortal>
    </div>
  );
};

export const SimonPortfolioLayout: React.FC<SimonPortfolioLayoutProps> = ({
  layout,
  template,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  return (
    <DynamicLayoutWrapper
      layout={layout}
      onLayoutUpdate={onLayoutUpdate!}
      sections={layout.sections}
      defaultBackgroundColor="#ffffff"
      defaultTextColor="#000000"
    >
      <SimonPortfolioContent template={template} {...wrapperProps} />
    </DynamicLayoutWrapper>
  );
};
