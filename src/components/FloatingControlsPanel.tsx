// src/components/FloatingControlsPanel.tsx
import React, { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  Zap,
  Paintbrush,
  Palette,
  Sparkles,
  BadgeCheck,
  X,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { CaptionStyle, GeneratedOverlay } from "@/types/caption";
import { CanvasPreset } from "@/types/canvasPreset";
import { SocialBannerDesign, SocialBannerData } from "@/types/socialBanner";
import { AnimatedBannerDesign } from "@/types/animatedBanner";

// Sub-components
import { CanvasDesignsPanel } from "./panels/CanvasDesignsPanel";
import { DynamicStylesPanel } from "./panels/DynamicStylesPanel";
import { StaticPresetsPanel } from "./panels/StaticPresetsPanel";
import { TextStylePanel } from "./panels/TextStylePanel";
import { SavedOverlaysPanel } from "./panels/SavedOverlaysPanel";
import { SocialBannersPanel } from "./panels/SocialBannersPanel";

interface FloatingControlsPanelProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
  dynamicStyle: string;
  onDynamicStyleChange: (styleId: string) => void;
  backgroundEffect: "none" | "blur" | "image";
  onBackgroundEffectChange: (effect: "none" | "blur" | "image") => void;

  savedOverlays: GeneratedOverlay[];
  onAddSavedOverlay: (overlay: GeneratedOverlay) => void;
  onDeleteSavedOverlay: (id: string) => void;
  isMouseActive: boolean;
  isOpen: boolean;
  onClose: () => void;

  canvasAspectRatio: string;
  onCanvasAspectRatioChange: (ratio: string) => void;

  onCanvasPresetSelect?: (preset: CanvasPreset) => void;
  customCanvasPresets?: CanvasPreset[];
  onSaveCanvasPreset?: (name: string) => void;
  onDeleteCanvasPreset?: (id: string) => void;
  publicPresets?: CanvasPreset[];
  isLoadingPublic?: boolean;
  onShareCanvasPreset?: (preset: CanvasPreset, authorName?: string) => void;
  onUnshareCanvasPreset?: (preset: CanvasPreset) => void;
  onAddSocialBanner?: (
    design: SocialBannerDesign,
    data: SocialBannerData
  ) => void;
  onAddAnimatedBanner?: (
    design: AnimatedBannerDesign,
    data: SocialBannerData
  ) => void;
}

export const FloatingControlsPanel = (props: FloatingControlsPanelProps) => {
  const [isOpen, setIsOpen] = [props.isOpen, props.onClose];
  const [activeSection, setActiveSection] = useState<string | null>(
    "canvas-designs"
  );
  const [isHovered, setIsHovered] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement;
        // Don't close if clicking the trigger button
        if (!target.closest("[data-floating-trigger]")) {
          setIsOpen();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, setIsOpen]);

  const sections = [
    {
      id: "canvas-designs",
      icon: LayoutGrid,
      title: "DESIGNS",
      shortTitle: "DSN",
    },
    {
      id: "dynamic-styles",
      icon: Zap,
      title: "DYNAMIC",
      shortTitle: "DYN",
    },
    {
      id: "static-presets",
      icon: Paintbrush,
      title: "PRESETS",
      shortTitle: "PRE",
    },
    {
      id: "base-text",
      icon: Palette,
      title: "TEXT",
      shortTitle: "TXT",
    },
    {
      id: "saved-overlays",
      icon: Sparkles,
      title: "OVERLAYS",
      shortTitle: "OVR",
    },
    {
      id: "social-banners",
      icon: BadgeCheck,
      title: "BANNERS",
      shortTitle: "BNR",
    },
  ];

  const activeTab = sections.find((s) => s.id === activeSection);

  return (
    <>
      <div
        ref={panelRef}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={cn(
          "fixed bottom-16 left-6 overflow-hidden",
          "bg-background border-2 border-primary shadow-[0_0_30px_hsl(50,100%,50%,0.15)]",
          "transition-all duration-200 ease-out flex",
          isOpen && (props.isMouseActive || isHovered)
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
        style={{
          zIndex: "var(--z-floating-panel)",
          height: "80vh",
          maxHeight: "800px",
        }}
      >
        {/* Sharp Sidebar Navigation */}
        <div className="w-14 bg-card border-r-2 border-primary flex flex-col items-center py-2 gap-0.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-full h-14 flex flex-col items-center justify-center transition-all duration-150 relative group",
                "font-mono text-[9px] tracking-wider border-b border-border",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-primary hover:bg-primary/10"
              )}
              title={section.title}
            >
              <section.icon className="w-4 h-4 mb-1" strokeWidth={2} />
              <span className="font-bold">{section.shortTitle}</span>
              
              {/* Active indicator line */}
              {activeSection === section.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-foreground" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex flex-col w-[420px] h-full bg-background">
          {/* Header Bar */}
          <div className="h-10 border-b-2 border-primary flex items-center justify-between px-4 bg-card shrink-0">
            <div className="flex items-center gap-2">
              {activeTab && (
                <>
                  <activeTab.icon className="w-4 h-4 text-primary" strokeWidth={2} />
                  <span className="font-mono text-sm font-bold tracking-wider text-primary">
                    {activeTab.title}
                  </span>
                </>
              )}
            </div>
            <button
              onClick={() => setIsOpen()}
              className="w-7 h-7 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 border border-border hover:border-primary transition-all"
            >
              <X className="w-4 h-4" strokeWidth={2} />
            </button>
          </div>

          {/* Scrollable Content - Full Height */}
          <div className="flex-1 overflow-y-auto p-3 sharp-scrollbar">
            {activeSection === "canvas-designs" && (
              <CanvasDesignsPanel
                onCanvasPresetSelect={props.onCanvasPresetSelect}
                onSaveCanvasPreset={props.onSaveCanvasPreset}
                customCanvasPresets={props.customCanvasPresets}
                onDeleteCanvasPreset={props.onDeleteCanvasPreset}
                publicPresets={props.publicPresets}
                isLoadingPublic={props.isLoadingPublic}
                onShareCanvasPreset={props.onShareCanvasPreset}
                onUnshareCanvasPreset={props.onUnshareCanvasPreset}
              />
            )}

            {activeSection === "dynamic-styles" && (
              <DynamicStylesPanel
                dynamicStyle={props.dynamicStyle}
                onDynamicStyleChange={props.onDynamicStyleChange}
              />
            )}

            {activeSection === "static-presets" && (
              <StaticPresetsPanel
                currentStyle={props.style}
                onStyleChange={props.onStyleChange}
              />
            )}

            {activeSection === "base-text" && (
              <TextStylePanel
                style={props.style}
                onStyleChange={props.onStyleChange}
              />
            )}

            {activeSection === "saved-overlays" && (
              <SavedOverlaysPanel
                savedOverlays={props.savedOverlays}
                onAddSavedOverlay={props.onAddSavedOverlay}
                onDeleteSavedOverlay={props.onDeleteSavedOverlay}
              />
            )}

            {activeSection === "social-banners" && props.onAddSocialBanner && (
              <SocialBannersPanel 
                onAddBanner={props.onAddSocialBanner} 
                onAddAnimatedBanner={props.onAddAnimatedBanner}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};
