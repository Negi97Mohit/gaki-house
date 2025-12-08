// src/components/video-canvas/DraggableHtmlOverlay.tsx
import React, { useRef, useEffect } from "react";
import { useTheme } from "next-themes";
import { GeneratedOverlay } from "@/types/caption";
import { generatePreview } from "@/lib/preview";
import { HtmlOverlayRenderer } from "./HtmlOverlayRenderer";
import { UniversalOverlayWrapper } from "./UniversalOverlayWrapper";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";
import { AnimatedBannerRenderer } from "@/components/animated-banners";
import { ANIMATED_BANNER_DESIGNS } from "@/types/animatedBanner";

interface DraggableHtmlOverlayProps {
  overlay: GeneratedOverlay;
  onLayoutChange: (
    id: string,
    key: "position" | "size" | "rotation",
    value: any
  ) => void;
  onRemoveOverlay: (id: string) => void;
  onPreviewGenerated: (id: string, dataUrl: string) => void;
  onSetDynamicLayout: (
    target: { id: string; type: string },
    mode: "pip" | "reset" | "split-horizontal" | "split-vertical"
  ) => void;
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

  if (!containerSize.width || !containerSize.height) return null;

  // Check if this is an animated banner
  const animatedBannerDesign = overlay.metadata?.type === 'animated-banner' 
    ? ANIMATED_BANNER_DESIGNS.find(d => d.id === overlay.metadata?.animatedBannerId)
    : null;

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
      <div ref={elementRef} className="w-full h-full overflow-hidden">
        {animatedBannerDesign ? (
          <AnimatedBannerRenderer design={animatedBannerDesign} className="rounded-lg" />
        ) : (
          <HtmlOverlayRenderer
            key={theme}
            htmlContent={overlay.htmlContent}
            theme={theme}
          />
        )}
      </div>
    </UniversalOverlayWrapper >
  );
};
