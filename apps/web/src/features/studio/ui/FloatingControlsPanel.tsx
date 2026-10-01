import React, { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  Type,
  Sparkles,
  BadgeCheck,
  X,
  Library,
  Archive,
  Wrench,
  Settings,
} from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
import {
  CaptionStyle,
  GeneratedOverlay,
  CanvasLayoutState,
} from "@gaki/core/types/caption";
import { CanvasPreset } from "@gaki/core/types/canvasPreset";
import {
  SocialBannerDesign,
  SocialBannerData,
} from "@gaki/core/types/socialBanner";
import { AnimatedBannerDesign } from "@gaki/core/types/animatedBanner";
import { VaultFile } from "@gaki/core/types/vault";
import { useThemeStore, themes } from "@/features/theme/model/theme.store";

// Sub-components
import { CanvasDesignsPanel } from "./panels/CanvasDesignsPanel";
import { TextPresetsPanel } from "./panels/TextPresetsPanel";
import { SavedOverlaysPanel } from "./panels/SavedOverlaysPanel";
import { SocialBannersPanel } from "./panels/SocialBannersPanel";
import { GSAPAnimationsPanel } from "./panels/GSAPAnimationsPanel";
import { FileVaultPanel } from "./panels/FileVaultPanel";
import { ToolsPanel } from "./panels/ToolsPanel";
import { SettingsPanel } from "./panels/SettingsPanel";

import { GSAPPreset } from "@/features/animation/lib/gsapAnimations";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";

export interface FloatingControlsPanelProps {
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
  blankCanvasColor?: string;
  onBlankCanvasColorChange?: (color: string) => void;
  onCanvasBackgroundUpload?: (file: File) => void;
  onCanvasBackgroundAssetSelect?: (asset: AssetResult) => void;
  canvasLayout?: CanvasLayoutState | null;
  onCanvasLayoutChange?: (layout: CanvasLayoutState | null) => void;
  activeSequenceId?: string | null;
  isChatbotOpen?: boolean;
  onToggleChatbot?: (open: boolean | ((prev: boolean) => boolean)) => void;
  onAddEmptyGridPanel?: () => void;
  isTextDepthEnabled?: boolean;
  onTextDepthToggle?: (enabled: boolean) => void;

  onCanvasPresetSelect?: (preset: CanvasPreset) => void;
  customCanvasPresets?: CanvasPreset[];
  onSaveCanvasPreset?: (name: string, layout?: any) => void;
  onDeleteCanvasPreset?: (id: string) => void;
  publicPresets?: CanvasPreset[];
  isLoadingPublic?: boolean;
  onShareCanvasPreset?: (
    preset: CanvasPreset | string,
    authorName?: string,
  ) => void;
  onUnshareCanvasPreset?: (preset: CanvasPreset | string) => void;
  onAddSocialBanner?: (
    design: SocialBannerDesign,
    data: SocialBannerData,
  ) => void;
  onAddAnimatedBanner?: (
    design: AnimatedBannerDesign,
    data: SocialBannerData,
  ) => void;

  // Tools props
  onOpenAnimationLibrary?: () => void;
  onAddTextOverlay?: () => void;
  onAssetSelect?: (asset: AssetResult) => void;
  setIsDrawing?: (isDrawing: boolean) => void;
  portalContainer?: HTMLElement | null;
  onSelectGSAPPreset?: (preset: GSAPPreset) => void;
  selectedGSAPPresetId?: string;

  // Vault props
  vaultFiles?: VaultFile[];
  onAddVaultFiles?: (
    files: FileList | File[],
    source: VaultFile["source"],
  ) => void;
  onRemoveVaultFile?: (id: string) => void;
  onClearVault?: () => void;
}

interface SectionMeta {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
}

const SECTIONS: SectionMeta[] = [
  {
    id: "canvas-designs",
    icon: LayoutGrid,
    label: "Designs",
    description: "Canvas layout & backgrounds",
  },
  {
    id: "animation-library",
    icon: Library,
    label: "Animations",
    description: "Motion graphics & GSAP",
  },
  {
    id: "text-presets",
    icon: Type,
    label: "Text",
    description: "Dynamic typography & captions",
  },
  {
    id: "saved-overlays",
    icon: Sparkles,
    label: "Overlays",
    description: "Custom stream graphics",
  },
  {
    id: "social-banners",
    icon: BadgeCheck,
    label: "Banners",
    description: "Social handles & lower thirds",
  },
  {
    id: "file-vault",
    icon: Archive,
    label: "Vault",
    description: "Media assets & dropzone",
  },
  {
    id: "tools",
    icon: Wrench,
    label: "Tools",
    description: "Canvas drawing & stickers",
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    description: "Audio DSP, hotkeys & themes",
  },
];

export const FloatingControlsPanel: React.FC<FloatingControlsPanelProps> = (
  props,
) => {
  const { isOpen, onClose: closePanel } = props;
  const [activeSection, setActiveSection] = useState<string>("canvas-designs");
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Active theme ambient colors for dynamic background glow
  const { theme } = useThemeStore();
  const activeThemeConfig = themes[theme] || themes.eventHorizon;
  const ambientColors = activeThemeConfig.ambient?.colors || [
    "#ffb45e",
    "#c8643c",
  ];

  // Click outside to close
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

  // Each section starts at the top
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0 });
  }, [activeSection]);

  const currentTab =
    SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];

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
      {/* Single, quiet wash of the active theme's ambient colour */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-[background] duration-700"
        style={{
          background: `radial-gradient(90% 45% at 100% 0%, ${ambientColors[0] || "#ffb45e"}1a, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex-none flex items-center justify-between gap-3 pl-5 pr-3 pt-4 pb-3 border-b border-white/[0.06]">
        <div className="min-w-0">
          <h3 className="text-[12.5px] font-mono uppercase tracking-[0.14em] font-medium text-white/90 truncate leading-tight">
            {currentTab.label}
          </h3>
          <p className="mt-0.5 text-[10.5px] font-normal tracking-wide text-white/45 truncate">
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

      {/* Content: the scrollbar here is a 2px line inset from the rounded edge */}
      <div
        ref={contentRef}
        className="sp-scroll relative z-10 flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden pl-5 pr-4 py-4 mr-0.5"
      >
        {activeSection === "canvas-designs" && (
          <div className="animate-in fade-in-50 duration-200 w-full">
            <CanvasDesignsPanel
              activePresetId={props.style as any}
              onCanvasPresetSelect={props.onCanvasPresetSelect}
              onSaveCanvasPreset={props.onSaveCanvasPreset}
              customCanvasPresets={props.customCanvasPresets}
              onDeleteCanvasPreset={props.onDeleteCanvasPreset}
              publicPresets={props.publicPresets}
              isLoadingPublic={props.isLoadingPublic}
              onShareCanvasPreset={props.onShareCanvasPreset as any}
              onUnshareCanvasPreset={props.onUnshareCanvasPreset as any}
              blankCanvasColor={props.blankCanvasColor}
              onBlankCanvasColorChange={props.onBlankCanvasColorChange}
              onCanvasBackgroundUpload={props.onCanvasBackgroundUpload}
              onCanvasBackgroundAssetSelect={
                props.onCanvasBackgroundAssetSelect || props.onAssetSelect
              }
              canvasLayout={props.canvasLayout}
              onCanvasLayoutChange={props.onCanvasLayoutChange}
              activeSequenceId={props.activeSequenceId}
              isChatbotOpen={props.isChatbotOpen}
              onToggleChatbot={props.onToggleChatbot}
              onAddEmptyGridPanel={props.onAddEmptyGridPanel}
              isTextDepthEnabled={props.isTextDepthEnabled}
              onTextDepthToggle={props.onTextDepthToggle}
            />
          </div>
        )}

        {activeSection === "animation-library" && (
          <div className="animate-in fade-in-50 duration-200 w-full">
            <GSAPAnimationsPanel
              onSelectPreset={props.onSelectGSAPPreset || (() => {})}
              selectedPresetId={props.selectedGSAPPresetId}
            />
          </div>
        )}

        {activeSection === "text-presets" && (
          <div className="animate-in fade-in-50 duration-200 w-full">
            <TextPresetsPanel
              style={props.style}
              onStyleChange={props.onStyleChange}
              dynamicStyle={props.dynamicStyle}
              onDynamicStyleChange={props.onDynamicStyleChange}
            />
          </div>
        )}

        {activeSection === "saved-overlays" && (
          <div className="animate-in fade-in-50 duration-200 w-full">
            <SavedOverlaysPanel
              savedOverlays={props.savedOverlays}
              onAddSavedOverlay={props.onAddSavedOverlay}
              onDeleteSavedOverlay={props.onDeleteSavedOverlay}
            />
          </div>
        )}

        {activeSection === "social-banners" && props.onAddSocialBanner && (
          <div className="animate-in fade-in-50 duration-200 w-full">
            <SocialBannersPanel
              onAddBanner={props.onAddSocialBanner}
              onAddAnimatedBanner={props.onAddAnimatedBanner}
            />
          </div>
        )}

        {activeSection === "file-vault" &&
          props.vaultFiles &&
          props.onAddVaultFiles &&
          props.onRemoveVaultFile &&
          props.onClearVault && (
            <div className="animate-in fade-in-50 duration-200 w-full">
              <FileVaultPanel
                files={props.vaultFiles}
                onAddFiles={props.onAddVaultFiles}
                onRemoveFile={props.onRemoveVaultFile}
                onClearVault={props.onClearVault}
              />
            </div>
          )}

        {activeSection === "tools" &&
          props.onAddTextOverlay &&
          props.onAssetSelect &&
          props.setIsDrawing && (
            <div className="animate-in fade-in-50 duration-200 w-full">
              <ToolsPanel
                onAddTextOverlay={props.onAddTextOverlay}
                onAssetSelect={props.onAssetSelect}
                setIsDrawing={props.setIsDrawing}
              />
            </div>
          )}

        {activeSection === "settings" && (
          <div className="animate-in fade-in-50 duration-200 w-full">
            <SettingsPanel />
          </div>
        )}
      </div>

      {/* Dock */}
      <nav
        aria-label="Studio sections"
        className="relative z-10 flex-none flex items-stretch overflow-x-auto select-none border-t border-white/[0.06] bg-[#08080c]/85 backdrop-blur-xl px-1 no-scrollbar"
      >
        {SECTIONS.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              aria-current={isActive ? "page" : undefined}
              title={section.description}
              className={cn(
                "group relative flex-1 min-w-[56px] flex flex-col items-center gap-1.5 pt-2.5 pb-2 text-[9px] font-mono tracking-[0.14em] uppercase transition-all duration-150 focus-visible:outline-none",
                isActive
                  ? "text-white font-medium"
                  : "text-white/40 hover:text-white/75",
              )}
            >
              {/* Luminous thin line indicator - no solid blocks */}
              <span
                aria-hidden
                className={cn(
                  "absolute top-0 left-2.5 right-2.5 h-[1.5px] rounded-full transition-all duration-200",
                  isActive
                    ? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] opacity-100"
                    : "opacity-0 group-hover:opacity-30 bg-white/40",
                )}
              />
              <Icon
                className={cn(
                  "w-[15px] h-[15px] transition-colors",
                  isActive ? "text-white" : "text-white/40 group-hover:text-white/75",
                )}
                strokeWidth={1.5}
              />
              <span className="truncate max-w-[50px]">{section.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
};
