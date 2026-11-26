import React from "react";
import {
  LayoutGrid,
  Type,
  Sparkles,
  BadgeCheck,
  Library,
  Archive,
  Wrench,
  Settings,
} from "lucide-react";
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
import { GSAPPreset } from "@/features/animation/lib/gsapAnimations";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { CanvasDesignsPanel } from "./CanvasDesignsPanel";
import { TextPresetsPanel } from "./TextPresetsPanel";
import { SavedOverlaysPanel } from "./SavedOverlaysPanel";
import { SocialBannersPanel } from "./SocialBannersPanel";
import { GSAPAnimationsPanel } from "./GSAPAnimationsPanel";
import { FileVaultPanel } from "./FileVaultPanel";
import { ToolsPanel } from "./ToolsPanel";
import { SettingsPanel } from "./SettingsPanel";

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
  onSaveCanvasPreset?: (name: string, layout?: unknown) => void;
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

  onOpenAnimationLibrary?: () => void;
  onAddTextOverlay?: () => void;
  onAssetSelect?: (asset: AssetResult) => void;
  setIsDrawing?: (isDrawing: boolean) => void;
  portalContainer?: HTMLElement | null;
  onSelectGSAPPreset?: (preset: GSAPPreset) => void;
  selectedGSAPPresetId?: string;

  vaultFiles?: VaultFile[];
  onAddVaultFiles?: (
    files: FileList | File[],
    source: VaultFile["source"],
  ) => void;
  onRemoveVaultFile?: (id: string) => void;
  onClearVault?: () => void;
}

export interface StudioPanelSection {
  id: string;
  icon: React.ElementType;
  label: string;
  description: string;
  render: (props: FloatingControlsPanelProps) => React.ReactNode;
}

/** Registry of studio sidebar sections. Add new sidebar panels here. */
export const STUDIO_PANEL_SECTIONS: StudioPanelSection[] = [
  {
    id: "canvas-designs",
    icon: LayoutGrid,
    label: "Designs",
    description: "Canvas layout & backgrounds",
    render: (props) => (
      <CanvasDesignsPanel
        activePresetId={props.style as unknown as string}
        onCanvasPresetSelect={props.onCanvasPresetSelect}
        onSaveCanvasPreset={props.onSaveCanvasPreset}
        customCanvasPresets={props.customCanvasPresets}
        onDeleteCanvasPreset={props.onDeleteCanvasPreset}
        publicPresets={props.publicPresets}
        isLoadingPublic={props.isLoadingPublic}
        onShareCanvasPreset={props.onShareCanvasPreset as unknown as (preset: CanvasPreset, authorName?: string) => void}
        onUnshareCanvasPreset={props.onUnshareCanvasPreset as unknown as (preset: CanvasPreset) => void}
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
    ),
  },
  {
    id: "animation-library",
    icon: Library,
    label: "Animations",
    description: "Motion graphics & GSAP",
    render: (props) => (
      <GSAPAnimationsPanel
        onSelectPreset={props.onSelectGSAPPreset || (() => {})}
        selectedPresetId={props.selectedGSAPPresetId}
      />
    ),
  },
  {
    id: "text-presets",
    icon: Type,
    label: "Text",
    description: "Dynamic typography & captions",
    render: (props) => (
      <TextPresetsPanel
        style={props.style}
        onStyleChange={props.onStyleChange}
        dynamicStyle={props.dynamicStyle}
        onDynamicStyleChange={props.onDynamicStyleChange}
      />
    ),
  },
  {
    id: "saved-overlays",
    icon: Sparkles,
    label: "Overlays",
    description: "Custom stream graphics",
    render: (props) => (
      <SavedOverlaysPanel
        savedOverlays={props.savedOverlays}
        onAddSavedOverlay={props.onAddSavedOverlay}
        onDeleteSavedOverlay={props.onDeleteSavedOverlay}
      />
    ),
  },
  {
    id: "social-banners",
    icon: BadgeCheck,
    label: "Banners",
    description: "Social handles & lower thirds",
    render: (props) =>
      props.onAddSocialBanner ? (
        <SocialBannersPanel
          onAddBanner={props.onAddSocialBanner}
          onAddAnimatedBanner={props.onAddAnimatedBanner}
        />
      ) : null,
  },
  {
    id: "file-vault",
    icon: Archive,
    label: "Vault",
    description: "Media assets & dropzone",
    render: (props) =>
      props.vaultFiles &&
      props.onAddVaultFiles &&
      props.onRemoveVaultFile &&
      props.onClearVault ? (
        <FileVaultPanel
          files={props.vaultFiles}
          onAddFiles={props.onAddVaultFiles}
          onRemoveFile={props.onRemoveVaultFile}
          onClearVault={props.onClearVault}
        />
      ) : null,
  },
  {
    id: "tools",
    icon: Wrench,
    label: "Tools",
    description: "Canvas drawing & stickers",
    render: (props) =>
      props.onAddTextOverlay && props.onAssetSelect && props.setIsDrawing ? (
        <ToolsPanel
          onAddTextOverlay={props.onAddTextOverlay}
          onAssetSelect={props.onAssetSelect}
          setIsDrawing={props.setIsDrawing}
        />
      ) : null,
  },
  {
    id: "settings",
    icon: Settings,
    label: "Settings",
    description: "Audio DSP, hotkeys & themes",
    render: () => <SettingsPanel />,
  },
];
