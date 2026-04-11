import React from "react";
import type { AnimatedBannerDesign } from "@caption-cam/core/types/animatedBanner";
import { UniversalBannerRenderer } from "@/features/banners/ui/banner/UniversalBannerRenderer";
import { BannerContentData, BannerElementState } from "@caption-cam/core/types/banner";

// Re-export shared types for backward compatibility
export type { BannerContentData, BannerElementState };

interface AnimatedBannerRendererProps {
  design: AnimatedBannerDesign;
  className?: string;
  contentData?: BannerContentData;
  isEditing?: boolean;
  onContentChange?: (field: keyof BannerContentData, value: any) => void;
  elementStates?: BannerElementState[];
  onElementStatesChange?: (states: BannerElementState[]) => void;
  containerSize?: { width: number; height: number };
}

export const AnimatedBannerRenderer: React.FC<AnimatedBannerRendererProps> = ({
  design,
  className = "",
  contentData,
  isEditing = false,
  onContentChange,
  elementStates,
  onElementStatesChange,
  containerSize = { width: 400, height: 100 },
}) => {
  // Ensure contentData has required structure if undefined
  const data: BannerContentData = contentData || {
    name: "Your Name",
    tagline: "Creator • Streamer",
    links: [],
    primaryColor: design.particleSettings?.color || "#a855f7",
    secondaryColor: design.particleSettings?.colorVariant || "#3b82f6",
    backgroundColor: design.preview,
  } as BannerContentData;

  return (
    <UniversalBannerRenderer
      design={design}
      contentData={data}
      isEditing={isEditing}
      onClick={() => { }} // Handle click if needed
      containerSize={containerSize}
      elementStates={elementStates}
      onElementStatesChange={onElementStatesChange}
      onContentChange={onContentChange as any}
      className={className}
    />
  );
};
