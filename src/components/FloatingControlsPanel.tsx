// src/components/FloatingControlsPanel.tsx
import React, { useState, useRef, useEffect } from "react";
import { LayoutGrid, Zap, Paintbrush, Palette, Sparkles, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { CaptionStyle, GeneratedOverlay } from "@/types/caption";
import { CanvasPreset } from "@/types/canvasPreset";
import { SocialBannerDesign, SocialBannerData } from "@/types/socialBanner";

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
  onAddSocialBanner?: (design: SocialBannerDesign, data: SocialBannerData) => void;
}

export const FloatingControlsPanel = (props: FloatingControlsPanelProps) => {
  const [isOpen, setIsOpen] = [props.isOpen, props.onClose];
  const [activeSection, setActiveSection] = useState<string | null>(
    "canvas-designs"
  );
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
      title: "Designs",
    },
    {
      id: "dynamic-styles",
      icon: Zap,
      title: "Caption Dynamic Styles",
    },
    {
      id: "static-presets",
      icon: Paintbrush,
      title: "Style Presets",
    },
    {
      id: "base-text",
      icon: Palette,
      title: "Caption Text Style",
    },
    {
      id: "saved-overlays",
      icon: Sparkles,
      title: "Overlays",
    },
    {
      id: "social-banners",
      icon: BadgeCheck,
      title: "Social Banners",
    },
  ];

  return (
    <>
      <div
        ref={panelRef}
        className={cn(
          "fixed bottom-24 left-6 rounded-2xl overflow-hidden",
          "bg-background/40 backdrop-blur-xl border border-border/40 shadow-2xl",
          "transition-all duration-300 ease-out flex",
          isOpen && props.isMouseActive
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
        style={{
          zIndex: "var(--z-floating-panel)",
          maxHeight: "70vh",
        }}
      >
        {/* Sidebar Navigation */}
        <div className="w-16 bg-background/20 backdrop-blur-sm border-r border-border/30 flex flex-col items-center py-3 gap-1.5">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 group relative",
                activeSection === section.id
                  ? "bg-primary text-primary-foreground shadow-lg scale-105"
                  : "hover:bg-background/40 text-muted-foreground hover:text-foreground"
              )}
              title={section.title}
            >
              <section.icon className="w-5 h-5" />
              {activeSection === section.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-primary rounded-l-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-[420px] max-h-[70vh] overflow-y-auto p-5 bg-background/10 backdrop-blur-sm">
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
            <SocialBannersPanel onAddBanner={props.onAddSocialBanner} />
          )}
        </div>
      </div>
    </>
  );
};
