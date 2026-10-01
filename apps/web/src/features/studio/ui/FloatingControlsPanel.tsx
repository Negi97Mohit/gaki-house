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
  { id: "canvas-designs", icon: LayoutGrid, label: "Designs", description: "Canvas layout & backgrounds" },
  { id: "animation-library", icon: Library, label: "Animations", description: "Motion graphics & GSAP" },
  { id: "text-presets", icon: Type, label: "Text", description: "Dynamic typography & captions" },
  { id: "saved-overlays", icon: Sparkles, label: "Overlays", description: "Custom stream graphics" },
  { id: "social-banners", icon: BadgeCheck, label: "Banners", description: "Social handles & lower thirds" },
  { id: "file-vault", icon: Archive, label: "Vault", description: "Media assets & dropzone" },
  { id: "tools", icon: Wrench, label: "Tools", description: "Canvas drawing & stickers" },
  { id: "settings", icon: Settings, label: "Settings", description: "Audio DSP, hotkeys & themes" },
];

export const FloatingControlsPanel: React.FC<FloatingControlsPanelProps> = (props) => {
  const { isOpen, onClose: closePanel } = props;
  const [activeSection, setActiveSection] = useState<string>("canvas-designs");
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollNavRef = useRef<HTMLDivElement>(null);

  // Active theme ambient colors for dynamic background glow
  const { theme } = useThemeStore();
  const activeThemeConfig = themes[theme] || themes.eventHorizon;
  const ambientColors = activeThemeConfig.ambient?.colors || ["#ffb45e", "#c8643c"];

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

  const currentTab = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];
  const CurrentIcon = currentTab.icon;

  return (
    <div
      ref={panelRef}
      className={cn(
        "fixed flex flex-col overflow-hidden antialiased",
        "transition-all duration-300 ease-out",
        // Adaptable responsive sizing
        "w-[calc(100vw-2rem)] sm:w-[460px] md:w-[500px] lg:w-[540px]",
        "max-w-[calc(100vw-2rem)]",
        "h-[70vh] sm:h-[68vh] max-h-[640px]",
        // Positioned neatly at bottom-left alongside the canvas
        "bottom-20 left-4 sm:left-6",
        // Chic glass container
        "rounded-3xl",
        "backdrop-blur-3xl bg-zinc-950/90 dark:bg-[#0a0a0f]/95",
        "border border-white/[0.14] dark:border-white/10",
        "shadow-[0_24px_80px_rgba(0,0,0,0.7)]",
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto visible scale-100"
          : "opacity-0 translate-y-5 pointer-events-none invisible scale-[0.97]"
      )}
      style={{
        zIndex: "var(--z-floating-panel)",
      }}
    >
      {/* ─── Ambient Dynamic Theme Glow ─── */}
      <div
        className="pointer-events-none absolute -top-24 -right-24 w-60 h-60 rounded-full blur-[90px] opacity-20 transition-all duration-700"
        style={{ background: ambientColors[0] || "var(--primary)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-24 -left-24 w-60 h-60 rounded-full blur-[90px] opacity-15 transition-all duration-700"
        style={{ background: ambientColors[1] || ambientColors[0] || "var(--primary)" }}
      />

      {/* ─── Top Header: Minimal Elegant Title & Close ─── */}
      <div className="relative z-10 flex-none px-4 py-3 border-b border-white/[0.08] dark:border-white/[0.06] bg-white/[0.02] flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shrink-0">
            <CurrentIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[13px] font-semibold tracking-tight text-white truncate leading-tight">
              {currentTab.label}
            </h3>
            <p className="text-[10px] text-zinc-400 font-normal tracking-wide truncate">
              {currentTab.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-medium text-zinc-400 bg-white/[0.04] border border-white/10 rounded-md">
            ESC
          </kbd>
          <button
            onClick={closePanel}
            className="w-7 h-7 flex items-center justify-center rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-zinc-400 hover:text-white transition-all duration-150"
            title="Close panel (Esc)"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ─── Middle: Slim-Scrollbar Content Area ─── */}
      <div
        className="relative z-10 flex-1 overflow-y-auto p-4 w-full min-h-0 slim-scrollbar"
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
              onCanvasBackgroundAssetSelect={props.onCanvasBackgroundAssetSelect || props.onAssetSelect}
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

      {/* ─── Bottom: HORIZONTALLY SCROLLABLE Section List With Full Border Color + Thin Underline Indicator ─── */}
      <div 
        ref={scrollNavRef}
        className="relative z-10 flex-none px-3 py-2.5 border-t border-white/[0.08] dark:border-white/[0.06] bg-black/60 dark:bg-black/70 backdrop-blur-xl"
      >
        <div 
          className="flex items-center gap-1.5 overflow-x-auto pb-1 -mb-1 select-none slim-scrollbar"
        >
          {SECTIONS.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-[11px] font-medium tracking-wide whitespace-nowrap transition-all duration-200 shrink-0 border",
                  isActive
                    ? "border-primary bg-primary/10 text-white shadow-[0_0_15px_rgba(var(--primary-rgb),0.25)] ring-1 ring-primary/40 font-semibold"
                    : "border-white/10 hover:border-white/25 text-zinc-300 hover:text-white bg-white/[0.03] hover:bg-white/[0.06]"
                )}
              >
                <Icon className={cn("w-3.5 h-3.5 shrink-0 transition-colors", isActive ? "text-primary" : "text-zinc-400")} />
                <span>
                  {section.label}
                </span>

                {/* Elegant Thin Underline Indicator */}
                {isActive && (
                  <span className="absolute -bottom-px left-3 right-3 h-[2px] bg-primary rounded-full shadow-[0_0_8px_var(--primary)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
