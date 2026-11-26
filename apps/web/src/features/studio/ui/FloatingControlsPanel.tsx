import React, { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
import { useThemeStore, themes } from "@/features/theme/model/theme.store";
import {
  STUDIO_PANEL_SECTIONS,
  type FloatingControlsPanelProps,
} from "./panels/panelRegistry";

export type { FloatingControlsPanelProps };

export const FloatingControlsPanel: React.FC<FloatingControlsPanelProps> = (
  props,
) => {
  const { isOpen, onClose: closePanel } = props;
  const [activeSection, setActiveSection] = useState<string>("canvas-designs");
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const { theme } = useThemeStore();
  const activeThemeConfig = themes[theme] || themes.eventHorizon;
  const ambientColors = activeThemeConfig.ambient?.colors || [
    "#ffb45e",
    "#c8643c",
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement;
        if (!target.closest("[data-floating-trigger]")) {
          closePanel();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (isOpen && e.key === "Escape") {
        closePanel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, closePanel]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  const currentTab =
    STUDIO_PANEL_SECTIONS.find((s) => s.id === activeSection) ||
    STUDIO_PANEL_SECTIONS[0];
  const renderedSection = currentTab.render(props);

  return (
    <div
      ref={panelRef}
      className={cn(
        "studio-panel fixed flex flex-col overflow-hidden antialiased",
        "transition-[opacity,transform] duration-200 ease-out",
        "w-[calc(100vw-2rem)] sm:w-[460px] md:w-[500px] lg:w-[540px]",
        "max-w-[calc(100vw-2rem)]",
        "h-[70vh] sm:h-[68vh] max-h-[640px]",
        "bottom-20 left-4 sm:left-6",
        "rounded-2xl bg-[#0c0c10]/95 backdrop-blur-2xl",
        "border border-white/[0.08]",
        "shadow-[0_24px_60px_-12px_rgba(0,0,0,0.65)]",
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto visible"
          : "opacity-0 translate-y-3 pointer-events-none invisible",
      )}
      style={{ zIndex: "var(--z-floating-panel)" }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(90% 45% at 100% 0%, ${ambientColors[0] || "#ffb45e"}1a, transparent 70%)`,
        }}
      />

      <div className="relative z-10 flex-none flex items-center justify-between gap-3 pl-5 pr-3 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="min-w-0">
          <h3 className="text-[12.5px] font-sans font-light tracking-wide text-white/90 truncate leading-tight">
            {currentTab.label}
          </h3>
          <p className="mt-0.5 text-[10.5px] font-sans font-light tracking-normal text-white/40 truncate">
            {currentTab.description}
          </p>
        </div>
        <button
          onClick={closePanel}
          className="w-7 h-7 shrink-0 flex items-center justify-center rounded-xl text-white/45 hover:text-white border border-transparent hover:border-white/15 hover:bg-white/[0.04] transition-all duration-150 focus-visible:outline-none"
          title="Close (Esc)"
          aria-label="Close panel"
        >
          <X className="w-3.5 h-3.5" strokeWidth={1.5} />
        </button>
      </div>

      <div
        ref={contentRef}
        className="sp-scroll relative z-10 flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden pl-5 pr-4 py-4 mr-0.5"
      >
        {renderedSection && (
          <div className="animate-in fade-in-50 duration-200 w-full">
            {renderedSection}
          </div>
        )}
      </div>

      <nav
        aria-label="Studio sections"
        className="relative z-10 flex-none flex items-stretch overflow-x-auto select-none border-t border-white/[0.06] bg-[#08080c]/85 backdrop-blur-xl px-1 no-scrollbar"
      >
        {STUDIO_PANEL_SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              aria-current={isActive ? "page" : undefined}
              aria-label={section.label}
              title={`${section.label} — ${section.description}`}
              className={cn(
                "group relative flex-1 min-w-[36px] flex items-center justify-center py-2.5 transition-all duration-150 focus-visible:outline-none",
                isActive
                  ? "text-white"
                  : "text-white/35 hover:text-white/70",
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute top-0 left-3 right-3 h-[1.5px] rounded-full transition-all duration-200",
                  isActive
                    ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-100"
                    : "opacity-0 group-hover:opacity-30 bg-white/40",
                )}
              />
              <Icon
                className={cn(
                  "w-[14px] h-[14px] transition-colors",
                  isActive ? "text-white" : "text-white/35 group-hover:text-white/70",
                )}
                strokeWidth={1.4}
              />
            </button>
          );
        })}
      </nav>
    </div>
  );
};
