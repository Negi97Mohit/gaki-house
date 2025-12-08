import React from "react";
import type {
  SocialBannerDesign,
  SocialBannerData,
} from "@/types/socialBanner";
import { UniversalBannerRenderer } from "./banner/UniversalBannerRenderer";
import { BannerElementState } from "@/types/banner";
import { getPlatformIcon as sharedGetPlatformIcon } from "./banner/PlatformIcons";

// Re-export getPlatformIcon for backward compatibility
export const getPlatformIcon = sharedGetPlatformIcon;

interface SocialBannerRendererProps {
  design: SocialBannerDesign;
  data: SocialBannerData;
  scale?: number;
  onClick?: () => void;
  isEditing?: boolean;
  isOverlaySelected?: boolean;
  containerSize?: { width: number; height: number };
  elementStates?: BannerElementState[]; // Use unified type (structural match)
  onElementStatesChange?: (states: BannerElementState[]) => void;
  onContentChange?: (field: keyof SocialBannerData, value: string) => void;
}

export const SocialBannerRenderer: React.FC<SocialBannerRendererProps> = ({
  design,
  data,
  scale = 1,
  onClick,
  isEditing = false,
  isOverlaySelected = false,
  containerSize,
  elementStates,
  onElementStatesChange,
  onContentChange,
}) => {
  // Map SocialBannerData to BannerContentData (Unified)
  // They are mostly identical, but BannerContentData adds optional colors which we can omit for generic social banners
  // or pass defaults if design requires them (usually not for static).

  return (
    <UniversalBannerRenderer
      design={design}
      contentData={data}
      scale={scale}
      onClick={onClick}
      isEditing={isEditing}
      // isOverlaySelected is not directly used by Universal, 
      // but Universal uses internal selection state.
      // If we want to simulate isOverlaySelected behavior (clearing selection), 
      // we might need to handle it via a ref/effect in Universal or pass a prop 'isSelected'
      // But for now, Universal handles selection internally when clicked.
      // The old SocialBannerRenderer cleared selection if isOverlaySelected became false.
      // UniversalBannerRenderer doesn't expose a way to force clear selection from outside easily yet unless we lift the useBannerEditor hook here.
      // However, if isEditing is passed, Universal handles it.
      containerSize={containerSize}
      elementStates={elementStates}
      onElementStatesChange={onElementStatesChange}
      onContentChange={onContentChange as any}
    />
  );
};
