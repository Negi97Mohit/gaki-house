// src/components/video-canvas/DraggableHtmlOverlay.tsx
import React, { useRef, useEffect, useMemo } from "react";
import { useTheme } from "next-themes";
import { GeneratedOverlay } from "@/types/caption";
import { generatePreview } from "@/lib/preview";
import { HtmlOverlayRenderer } from "./HtmlOverlayRenderer";
import { UniversalOverlayWrapper } from "./UniversalOverlayWrapper";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";
import {
  AnimatedBannerRenderer,
  BannerContentData,
  BannerElementState,
} from "@/components/animated-banners";
import animatedBannersData from "@/data/animatedBanners.json";

const ANIMATED_BANNER_DESIGNS = animatedBannersData.designs;

interface DraggableHtmlOverlayProps {
  overlay: GeneratedOverlay;
  onLayoutChange: (
    id: string,
    key: "position" | "size" | "rotation" | "isBehindUser",
    value: any
  ) => void;
  onRemoveOverlay: (id: string) => void;
  onPreviewGenerated: (id: string, dataUrl: string) => void;
  onSetDynamicLayout: (
    target: { id: string; type: string },
    mode: "pip" | "reset" | "split-horizontal" | "split-vertical"
  ) => void;
  onUpdateMetadata?: (id: string, metadata: any) => void;
  containerSize: { width: number; height: number };
  portalContainer?: HTMLElement | null;
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;
  isSelected?: boolean;
  onSelect?: (id: string) => void;
  onDoubleClick?: (id: string, e: React.MouseEvent) => void;
}

export const DraggableHtmlOverlay: React.FC<DraggableHtmlOverlayProps> = ({
  overlay,
  onLayoutChange,
  onRemoveOverlay,
  onPreviewGenerated,
  onSetDynamicLayout,
  onUpdateMetadata,
  containerSize,
  allOverlays,
  onSnapGuidesChange,
  isSelected,
  onSelect,
  onDoubleClick,
}) => {
  const { theme } = useTheme();
  const elementRef = useRef<HTMLDivElement>(null);

  // Generate preview for saved overlays (thumbnail)
  useEffect(() => {
    if (overlay.preview === "" && elementRef.current) {
      const timer = setTimeout(async () => {
        if (elementRef.current) {
          const previewDataUrl = await generatePreview(elementRef.current);
          if (previewDataUrl) {
            onPreviewGenerated(overlay.id, previewDataUrl);
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [overlay.id, overlay.preview, onPreviewGenerated]);

  // Check if this is an animated banner
  const animatedBannerDesign = useMemo(() => {
    if (overlay.metadata?.type === "animated-banner") {
      const found = ANIMATED_BANNER_DESIGNS.find(
        (d) => d.id === overlay.metadata?.animatedBannerId
      );
      return found as import("@/types/animatedBanner").AnimatedBannerDesign | undefined;
    }
    return undefined;
  }, [overlay.metadata]);

  // Extract content data from metadata for animated banners
  const bannerContentData: BannerContentData | undefined = useMemo(() => {
    if (animatedBannerDesign && overlay.metadata?.data) {
      const data = overlay.metadata.data;
      return {
        name: data.name || "Your Name",
        tagline: data.tagline || "Creator • Streamer",
        avatarUrl: data.avatarUrl,
        links:
          data.links?.map((l: any) => ({ platform: l.platform, url: l.url })) ||
          [],
        primaryColor:
          overlay.metadata.customColors?.primary ||
          animatedBannerDesign.particleSettings?.color,
        secondaryColor:
          overlay.metadata.customColors?.secondary ||
          animatedBannerDesign.particleSettings?.colorVariant,
        backgroundColor:
          overlay.metadata.customColors?.background ||
          animatedBannerDesign.preview,
      };
    }
    return undefined;
  }, [animatedBannerDesign, overlay.metadata]);

  // Handle content changes for animated banners
  const handleContentChange = (field: keyof BannerContentData, value: any) => {
    if (onUpdateMetadata && overlay.metadata) {
      const updatedData = {
        ...overlay.metadata.data,
        [field]: value,
      };
      onUpdateMetadata(overlay.id, {
        ...overlay.metadata,
        data: updatedData,
      });
    }
  };

  // Handle element state changes for animated banners
  const handleElementStatesChange = (states: BannerElementState[]) => {
    if (onUpdateMetadata && overlay.metadata) {
      onUpdateMetadata(overlay.id, {
        ...overlay.metadata,
        elementStates: states,
      });
    }
  };

  // Get the actual rendered size of the banner
  const bannerSize = useMemo(() => {
    const sizeW = overlay.layout.size?.width || 400;
    const sizeH = overlay.layout.size?.height || 100;
    return { width: sizeW, height: sizeH };
  }, [overlay.layout.size]);

  // Handle toggling depth
  const handleToggleDepth = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLayoutChange(overlay.id, "isBehindUser", !overlay.layout.isBehindUser);
  };

  if (!containerSize.width || !containerSize.height) return null;

  return (
    <UniversalOverlayWrapper
      id={overlay.id}
      type="html"
      position={overlay.layout.position}
      size={overlay.layout.size}
      rotation={overlay.layout.rotation}
      zIndex={overlay.layout.zIndex}
      containerSize={containerSize}
      isSelected={isSelected || false}
      isEditing={false}
      onSelect={onSelect || (() => { })}
      onRemove={onRemoveOverlay}
      onCommit={(id, layout) => {
        if (layout.position) onLayoutChange(id, "position", layout.position);
        if (layout.size) onLayoutChange(id, "size", layout.size);
        if (layout.rotation !== undefined)
          onLayoutChange(id, "rotation", layout.rotation);
      }}
      onSetDynamicLayout={onSetDynamicLayout}
      allOverlays={allOverlays}
      onSnapGuidesChange={onSnapGuidesChange}
      onDoubleClick={onDoubleClick}
    >
      <div ref={elementRef} className="w-full h-full overflow-hidden relative group">
        {/* Layers Button - Only show when selected */}
        {isSelected && (
          <div
            className="absolute top-2 left-2 z-50 flex gap-1 pointer-events-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleToggleDepth}
              className={`p-1.5 rounded-full shadow-md border border-border/50 backdrop-blur-sm transition-colors ${overlay.layout.isBehindUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground"
                }`}
              title={overlay.layout.isBehindUser ? "Behind User" : "In Front"}
            >
              {/* Inline SVG for Layers icon to avoid import issues if not imported yet */}
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-layers"><path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" /><path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" /><path d="m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65" /></svg>
            </button>
          </div>
        )}

        {animatedBannerDesign ? (
          <AnimatedBannerRenderer
            design={animatedBannerDesign}
            className="rounded-lg"
            contentData={bannerContentData}
            isEditing={isSelected}
            onContentChange={handleContentChange}
            elementStates={overlay.metadata?.elementStates}
            onElementStatesChange={handleElementStatesChange}
            containerSize={bannerSize}
          />
        ) : (
          <HtmlOverlayRenderer
            key={theme}
            htmlContent={overlay.htmlContent}
            theme={theme}
          />
        )}
      </div>
    </UniversalOverlayWrapper>
  );
};
