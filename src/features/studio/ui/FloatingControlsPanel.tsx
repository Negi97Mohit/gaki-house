// src/components/FloatingControlsPanel.tsx
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
import { cn } from "@/shared/lib/utils";
import { CaptionStyle, GeneratedOverlay } from "@/types/caption";
import { CanvasPreset } from "@/types/canvasPreset";
import { SocialBannerDesign, SocialBannerData } from "@/types/socialBanner";
import { AnimatedBannerDesign } from "@/types/animatedBanner";
import { VaultFile } from "@/types/vault";
import { useIsMobile } from "@/shared/hooks/use-mobile";

// Sub-components
import { CanvasDesignsPanel } from "./panels/CanvasDesignsPanel";
import { TextPresetsPanel } from "./panels/TextPresetsPanel";
import { SavedOverlaysPanel } from "./panels/SavedOverlaysPanel";
import { SocialBannersPanel } from "./panels/SocialBannersPanel";
import { GSAPAnimationsPanel } from "./panels/GSAPAnimationsPanel";
import { FileVaultPanel } from "./panels/FileVaultPanel";
import { ToolsPanel } from "./panels/ToolsPanel";
import { SettingsPanel } from "./panels/SettingsPanel";
import { AudioMixerPanel } from "./panels/AudioMixerPanel";
import { GSAPPreset } from "@/features/animation/lib/gsapAnimations";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";

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

  // New props for moved buttons
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

const sections = [
  { id: "canvas-designs", icon: LayoutGrid, label: "Designs" },
  { id: "animation-library", icon: Library, label: "Animations" },
  { id: "text-presets", icon: Type, label: "Text" },
  { id: "saved-overlays", icon: Sparkles, label: "Overlays" },
  { id: "social-banners", icon: BadgeCheck, label: "Banners" },
  { id: "file-vault", icon: Archive, label: "Vault" },
  { id: "tools", icon: Wrench, label: "Tools" },
  { id: "settings", icon: Settings, label: "Settings" },
];

export const FloatingControlsPanel = (props: FloatingControlsPanelProps) => {
  const isMobile = useIsMobile();
  const isOpen = props.isOpen;
  const closePanel = props.onClose;
  const [activeSection, setActiveSection] = useState<string | null>(
    "canvas-designs",
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
        if (!target.closest("[data-floating-trigger]")) {
          closePanel();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, closePanel]);

  const activeTab = sections.find((s) => s.id === activeSection);

  return (
    <div
      ref={panelRef}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        "fixed overflow-hidden flex",
        isMobile ? "inset-x-2 bottom-20 flex-col" : "bottom-16 left-6 flex-row",
        "bg-background/70 dark:bg-background/50 backdrop-blur-2xl",
        "border border-border/20 dark:border-white/10 rounded-2xl",
        "shadow-2xl shadow-black/10 dark:shadow-black/40",
        "transition-all duration-300 ease-out",
        isOpen && (props.isMouseActive || isHovered)
          ? "opacity-100 translate-y-0 pointer-events-auto visible" // Added visible
          : "opacity-0 translate-y-4 pointer-events-none invisible", // Added invisible
      )}
      style={{
        zIndex: "var(--z-floating-panel)",
        height: isMobile ? "65vh" : "75vh",
        maxHeight: "720px",
      }}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

      {/* Minimal Sidebar Navigation */}
      <div className={cn(
        "relative bg-foreground/[0.02] dark:bg-white/[0.02] flex items-center gap-1",
        isMobile ? "w-full border-b border-border/10 dark:border-white/5 flex-row overflow-x-auto no-scrollbar px-3 py-2 flex-shrink-0" : "w-12 border-r border-border/10 dark:border-white/5 flex-col py-3"
      )}>
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;

          return (
            <ShortcutTooltip label={section.label} side="right">
              <button
                key={section.id}
                onClick={() =>
                  setActiveSection((prev) =>
                    prev === section.id ? null : section.id,
                  )
                }
                className={cn(
                  "group relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 flex-shrink-0",
                  isActive
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-foreground/5 dark:hover:bg-white/5",
                )}
              >
                <Icon className="w-4 h-4" strokeWidth={1.5} />

                {/* Active indicator */}
                {isActive && (
                  <div className={cn(
                    "absolute bg-primary",
                    isMobile ? "bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-5 rounded-t-full" : "left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                  )} />
                )}
              </button>
            </ShortcutTooltip>
          );
        })}
      </div>

      {/* Content Area */}
      <div className={cn(
        "relative flex flex-col h-full",
        isMobile ? "w-full flex-1 min-h-0" : "w-[380px]"
      )}>
        {/* Minimal Header - just close button */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border/10 dark:border-white/5">
          <span className="text-[10px] font-medium text-muted-foreground/70">
            {activeTab?.label}
          </span>
          <button
            onClick={closePanel}
            className="w-5 h-5 flex items-center justify-center rounded-lg text-muted-foreground/40 hover:text-foreground hover:bg-foreground/5 transition-all"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div
          className="flex-1 overflow-y-auto p-4"
          style={{ scrollbarWidth: "none" }}
        >
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

          {activeSection === "animation-library" && (
            <GSAPAnimationsPanel
              onSelectPreset={props.onSelectGSAPPreset || (() => { })}
              selectedPresetId={props.selectedGSAPPresetId}
            />
          )}

          {activeSection === "text-presets" && (
            <TextPresetsPanel
              style={props.style}
              onStyleChange={props.onStyleChange}
              dynamicStyle={props.dynamicStyle}
              onDynamicStyleChange={props.onDynamicStyleChange}
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

          {activeSection === "file-vault" &&
            props.vaultFiles &&
            props.onAddVaultFiles &&
            props.onRemoveVaultFile &&
            props.onClearVault && (
              <FileVaultPanel
                files={props.vaultFiles}
                onAddFiles={props.onAddVaultFiles}
                onRemoveFile={props.onRemoveVaultFile}
                onClearVault={props.onClearVault}
              />
            )}

          {activeSection === "tools" &&
            props.onAddTextOverlay &&
            props.onAssetSelect &&
            props.setIsDrawing && (
              <ToolsPanel
                onAddTextOverlay={props.onAddTextOverlay}
                onAssetSelect={props.onAssetSelect}
                setIsDrawing={props.setIsDrawing}
              />
            )}

          

          {activeSection === "settings" && <SettingsPanel />}
        </div>
      </div>
    </div>
  );
};
