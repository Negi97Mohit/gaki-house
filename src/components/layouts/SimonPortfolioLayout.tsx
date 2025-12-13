// src/components/layouts/SimonPortfolioLayout.tsx
// Faithful recreation of simondaufresne.com with full GSAP animations and editable text

import React, { useState, useRef, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import { CanvasLayoutState, CanvasSectionState } from "@/types/caption";
import { CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { GridSectionWrapper } from "./GridSectionWrapper";
import { Plus, Trash2, ArrowUpRight, Menu, X } from "lucide-react";
import gsap from "gsap";

interface SimonPortfolioLayoutProps {
  layout: CanvasLayoutState;
  template: CanvasLayoutTemplate;
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  [key: string]: any;
}

// Editable text component with inline editing
const EditableText: React.FC<{
  value: string;
  onChange: (value: string) => void;
  className?: string;
  style?: React.CSSProperties;
  placeholder?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
}> = ({ value, onChange, className, style, placeholder, as = "span" }) => {
  const Tag = as;
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => onChange(e.currentTarget.textContent || "")}
      className={cn(
        "outline-none focus:bg-white/5 transition-colors cursor-text",
        className
      )}
      style={style}
      data-placeholder={placeholder}
    >
      {value}
    </Tag>
  );
};

// Animated project title with magnetic hover effect
const AnimatedProjectTitle: React.FC<{
  title: string;
  onChange: (value: string) => void;
  index: number;
  isActive: boolean;
  onClick: () => void;
}> = ({ title, onChange, index, isActive, onClick }) => {
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
      <div className="flex items-baseline gap-4 md:gap-8">
        <span className="text-sm md:text-base font-light opacity-50 tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
        <EditableText
          value={title}
          onChange={onChange}
          className="text-4xl md:text-6xl lg:text-8xl font-bold tracking-tighter leading-none uppercase"
          as="h2"
        />
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
const LoadingAnimation: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current || !textRef.current) return;

    const tl = gsap.timeline({
      onComplete: () => {
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
    tl.to(chars, { y: -100, opacity: 0, stagger: 0.03, duration: 0.4, ease: "power3.in" }, "+=0.5");
  }, [onComplete]);

  const text = "LOADING";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 bg-black z-[9999] flex items-center justify-center"
    >
      <div ref={textRef} className="text-white text-6xl md:text-9xl font-bold tracking-tighter flex overflow-hidden">
        {text.split("").map((char, i) => (
          <span key={i} className="char inline-block">
            {char}
          </span>
        ))}
      </div>
    </div>
  );
};

// Navigation header
const NavigationHeader: React.FC<{
  siteName: string;
  onSiteNameChange: (value: string) => void;
  menuItems: string[];
  onMenuItemChange: (index: number, value: string) => void;
  textColor: string;
}> = ({ siteName, onSiteNameChange, menuItems, onMenuItemChange, textColor }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header 
        className="fixed top-0 left-0 right-0 z-50 p-6 md:p-10 flex justify-between items-start mix-blend-difference"
        style={{ color: "#fff" }}
      >
        <EditableText
          value={siteName}
          onChange={onSiteNameChange}
          className="text-lg md:text-xl font-bold tracking-tight"
          as="h1"
        />
        
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-lg font-medium tracking-wide hover:opacity-60 transition-opacity flex items-center gap-2"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          <span className="hidden md:inline">{menuOpen ? "CLOSE" : "MENU"}</span>
        </button>
      </header>

      {/* Full screen menu overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black z-40 flex flex-col items-center justify-center gap-8 transition-all duration-500",
          menuOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
        )}
      >
        {menuItems.map((item, i) => (
          <EditableText
            key={i}
            value={item}
            onChange={(v) => onMenuItemChange(i, v)}
            className="text-white text-4xl md:text-6xl font-bold tracking-tighter hover:opacity-60 transition-opacity cursor-pointer"
          />
        ))}
      </div>
    </>
  );
};

// Project detail view with animations
const ProjectDetail: React.FC<{
  section: CanvasSectionState;
  templateSection: any;
  customData: any;
  style: React.CSSProperties;
  onUpdateText: (field: string, value: string) => void;
  onDelete: () => void;
  isActive: boolean;
  wrapperProps: any;
}> = ({ section, templateSection, customData, style, onUpdateText, onDelete, isActive, wrapperProps }) => {
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

  const name = customData?.name ?? templateSection?.name ?? "Project Title";
  const description = customData?.description ?? templateSection?.description ?? "Project Description";
  const year = customData?.year ?? "2024";
  const category = customData?.category ?? "Design";
  const client = customData?.client ?? "Client Name";

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen flex flex-col relative group"
      style={style}
    >
      {/* Delete button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("Delete this project?")) onDelete();
        }}
        className="absolute top-6 right-6 p-3 opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity z-50 rounded-full hover:bg-black/10"
        title="Delete Project"
      >
        <Trash2 className="w-5 h-5" />
      </button>

      {/* Project content */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* Left side - Project info */}
        <div className="w-full md:w-1/2 p-8 md:p-16 flex flex-col justify-center">
          <div className="space-y-8">
            {/* Meta info */}
            <div className="animate-in flex gap-8 text-sm uppercase tracking-widest opacity-60">
              <EditableText
                value={year}
                onChange={(v) => onUpdateText("year", v)}
                className="font-mono"
              />
              <EditableText
                value={category}
                onChange={(v) => onUpdateText("category", v)}
              />
            </div>

            {/* Title */}
            <EditableText
              value={name}
              onChange={(v) => onUpdateText("name", v)}
              className="animate-in text-5xl md:text-7xl lg:text-9xl font-bold tracking-tighter leading-[0.85] uppercase"
              as="h2"
            />

            {/* Description */}
            <EditableText
              value={description}
              onChange={(v) => onUpdateText("description", v)}
              className="animate-in text-lg md:text-xl font-light opacity-70 max-w-md leading-relaxed"
              as="p"
            />

            {/* Client */}
            <div className="animate-in pt-8 border-t border-current/20">
              <span className="text-xs uppercase tracking-widest opacity-40 block mb-2">Client</span>
              <EditableText
                value={client}
                onChange={(v) => onUpdateText("client", v)}
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

export const SimonPortfolioLayout: React.FC<SimonPortfolioLayoutProps> = ({
  layout,
  template,
  onLayoutUpdate,
  ...wrapperProps
}) => {
  const [showLoader, setShowLoader] = useState(true);
  const [activeProjectIndex, setActiveProjectIndex] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "detail">("list");
  const containerRef = useRef<HTMLDivElement>(null);

  const sectionIds = layout.sectionOrder?.length
    ? layout.sectionOrder
    : template.sections.map((s) => s.id);

  // Global settings from customSectionData["_global"]
  const globalData = layout.customSectionData?.["_global"] || {};
  const siteName = globalData.siteName ?? "SIMON DAUFRESNE";
  const tagline = globalData.tagline ?? "Independent Graphic Designer";
  const location = globalData.location ?? "Paris, France";
  const menuItems = globalData.menuItems ?? ["WORK", "ABOUT", "CONTACT"];

  const handleUpdateGlobal = useCallback((field: string, value: any) => {
    if (!onLayoutUpdate) return;
    onLayoutUpdate({
      ...layout,
      customSectionData: {
        ...layout.customSectionData,
        _global: {
          ...globalData,
          [field]: value,
        },
      },
    });
  }, [layout, onLayoutUpdate, globalData]);

  const handleUpdateText = useCallback((id: string, field: string, value: string) => {
    if (!onLayoutUpdate) return;
    const currentData = layout.customSectionData?.[id] || {};
    onLayoutUpdate({
      ...layout,
      customSectionData: {
        ...layout.customSectionData,
        [id]: {
          ...currentData,
          [field]: value,
        },
      },
    });
  }, [layout, onLayoutUpdate]);

  const handleAddSection = useCallback(() => {
    if (!onLayoutUpdate) return;

    const newId = `project-${Date.now()}`;
    const colors = ["#B21C1B", "#003F66", "#CFCC93", "#1a1a1a", "#2a4a3f", "#4a2a5a"];
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

  const handleDeleteSection = useCallback((id: string) => {
    if (!onLayoutUpdate) return;
    
    const newCustomData = { ...layout.customSectionData };
    delete newCustomData[id];
    const newCustomStyles = { ...layout.customSectionStyles };
    delete newCustomStyles[id];

    onLayoutUpdate({
      ...layout,
      sections: layout.sections.filter((s) => s.id !== id),
      sectionOrder: sectionIds.filter((sid) => sid !== id),
      customSectionData: newCustomData,
      customSectionStyles: newCustomStyles,
    });

    if (activeProjectIndex !== null) {
      setActiveProjectIndex(null);
      setViewMode("list");
    }
  }, [layout, onLayoutUpdate, sectionIds, activeProjectIndex]);

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
      { y: 0, opacity: 1, stagger: 0.15, duration: 1, ease: "power3.out", delay: 0.2 }
    );
  }, [showLoader, viewMode]);

  return (
    <div className="w-full h-full overflow-hidden bg-white text-black font-sans relative">
      {/* Loading animation */}
      {showLoader && <LoadingAnimation onComplete={() => setShowLoader(false)} />}

      {/* Navigation */}
      <NavigationHeader
        siteName={siteName}
        onSiteNameChange={(v) => handleUpdateGlobal("siteName", v)}
        menuItems={menuItems}
        onMenuItemChange={(i, v) => {
          const newItems = [...menuItems];
          newItems[i] = v;
          handleUpdateGlobal("menuItems", newItems);
        }}
        textColor={viewMode === "detail" ? "#fff" : "#000"}
      />

      {/* List View */}
      {viewMode === "list" && (
        <div ref={containerRef} className="w-full min-h-screen pt-32 md:pt-40 px-6 md:px-16">
          {/* Hero section */}
          <div className="mb-20 md:mb-32 max-w-4xl">
            <EditableText
              value={tagline}
              onChange={(v) => handleUpdateGlobal("tagline", v)}
              className="text-3xl md:text-5xl font-light leading-snug"
              as="p"
            />
            <EditableText
              value={location}
              onChange={(v) => handleUpdateGlobal("location", v)}
              className="text-lg mt-6 opacity-50"
            />
          </div>

          {/* Projects list */}
          <div className="space-y-4 md:space-y-6 pb-32">
            {sectionIds.map((sectionId, index) => {
              const templateSection = template.sections.find((s) => s.id === sectionId);
              const customData = layout.customSectionData?.[sectionId] || {};
              const name = customData.name ?? templateSection?.name ?? "Untitled Project";

              return (
                <div key={sectionId} className="project-item">
                  <AnimatedProjectTitle
                    title={name}
                    onChange={(v) => handleUpdateText(sectionId, "name", v)}
                    index={index}
                    isActive={activeProjectIndex === index}
                    onClick={() => handleProjectClick(index)}
                  />
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <footer className="fixed bottom-0 left-0 right-0 p-6 md:p-10 flex justify-between items-end text-sm opacity-50">
            <span>© {new Date().getFullYear()}</span>
            <span>SCROLL TO EXPLORE</span>
          </footer>
        </div>
      )}

      {/* Detail View */}
      {viewMode === "detail" && activeProjectIndex !== null && (
        <div className="w-full min-h-screen">
          {/* Back button */}
          <button
            onClick={handleBackToList}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-2 text-sm font-medium tracking-wide border border-current/20 rounded-full hover:bg-black hover:text-white transition-all duration-300 mix-blend-difference text-white"
          >
            BACK TO LIST
          </button>

          {sectionIds.map((sectionId, index) => {
            if (index !== activeProjectIndex) return null;

            const section = layout.sections.find((s) => s.id === sectionId) || {
              id: sectionId,
              content: { type: "empty" as const },
            };
            const templateSection = template.sections.find((s) => s.id === sectionId);
            const style = layout.customSectionStyles?.[sectionId] ||
              templateSection?.style || { backgroundColor: "#f0f0f0", color: "#000" };
            const customData = layout.customSectionData?.[sectionId] || {};

            return (
              <ProjectDetail
                key={sectionId}
                section={section}
                templateSection={templateSection}
                customData={customData}
                style={style}
                onUpdateText={(field, value) => handleUpdateText(sectionId, field, value)}
                onDelete={() => handleDeleteSection(sectionId)}
                isActive={true}
                wrapperProps={wrapperProps}
              />
            );
          })}

          {/* Navigation arrows */}
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 z-50 mix-blend-difference">
            <button
              onClick={() => setActiveProjectIndex(Math.max(0, activeProjectIndex - 1))}
              disabled={activeProjectIndex === 0}
              className="px-4 py-2 text-white text-sm disabled:opacity-30 hover:opacity-60 transition-opacity"
            >
              ← PREV
            </button>
            <span className="text-white text-sm opacity-50">
              {activeProjectIndex + 1} / {sectionIds.length}
            </span>
            <button
              onClick={() => setActiveProjectIndex(Math.min(sectionIds.length - 1, activeProjectIndex + 1))}
              disabled={activeProjectIndex === sectionIds.length - 1}
              className="px-4 py-2 text-white text-sm disabled:opacity-30 hover:opacity-60 transition-opacity"
            >
              NEXT →
            </button>
          </div>
        </div>
      )}

      {/* FAB to add project */}
      <button
        onClick={handleAddSection}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-black text-white rounded-full shadow-xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300"
        title="Add New Project"
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
};
