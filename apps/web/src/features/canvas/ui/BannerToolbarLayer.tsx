// Single responsibility: inline banner text editing toolbar, shown when a generated overlay is being edited.
import React, { useEffect } from "react";
import { CaptionStyle, TextOverlayState, GeneratedOverlay } from "@caption-cam/core/types/caption";
import { TextEditingToolbar } from "@/features/canvas/ui/TextEditingToolbar";

interface BannerToolbarLayerProps {
  editingBannerText?: {
    overlayId: string;
    currentText: string;
    style: React.CSSProperties;
  } | null;
  generatedOverlays: GeneratedOverlay[];
  sceneRef: React.RefObject<HTMLDivElement>;
  sceneSize: { width: number; height: number };
  liveCaptionStyle: CaptionStyle;
  onBannerTextStyleChange?: (style: React.CSSProperties) => void;
  onOverlayLayoutChange: (id: string, key: string, value: any) => void;
  onUpdateOverlayMetadata?: (id: string, metadata: any) => void;
}

export const BannerToolbarLayer: React.FC<BannerToolbarLayerProps> = ({
  editingBannerText,
  generatedOverlays,
  sceneRef,
  sceneSize,
  liveCaptionStyle,
  onBannerTextStyleChange,
  onOverlayLayoutChange,
  onUpdateOverlayMetadata,
}) => {
  useEffect(() => {
    console.log("[BannerToolbarLayer] mounted");
  }, []);

  if (!editingBannerText || !onBannerTextStyleChange) return null;

  const bannerOverlay = generatedOverlays.find((o) => o.id === editingBannerText.overlayId);
  if (!bannerOverlay) return null;

  const position = {
    x: (bannerOverlay.layout.position.x / 100) * sceneSize.width,
    y: (bannerOverlay.layout.position.y / 100) * sceneSize.height,
  };

  const cssStyle = editingBannerText.style;
  const captionStyle: CaptionStyle = {
    ...liveCaptionStyle,
    fontFamily: (cssStyle.fontFamily as string) || "Inter",
    fontSize: parseInt((cssStyle.fontSize as string) || "24", 10),
    color: (cssStyle.color as string) || "#ffffff",
    backgroundColor: (cssStyle.backgroundColor as string) || "transparent",
    bold: cssStyle.fontWeight === "bold" || cssStyle.fontWeight === 700,
    italic: cssStyle.fontStyle === "italic",
    underline: (cssStyle.textDecoration as string)?.includes("underline") || false,
    textShadow: cssStyle.textShadow as string,
    textAlign: (cssStyle.textAlign as any) || "left",
    position: { x: 0, y: 0 },
    shape: "rectangular",
    animation: "none",
    outline: false,
    shadow: false,
    rotation: 0,
    border: false,
    borderColor: "transparent",
    borderWidth: 0,
  };

  const proxyOverlay: TextOverlayState = {
    id: editingBannerText.overlayId,
    content: editingBannerText.currentText,
    style: captionStyle,
    layout: bannerOverlay.layout,
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: "var(--z-text-toolbar, 9999)" }}
    >
      <div className="pointer-events-auto">
        <TextEditingToolbar
          overlay={proxyOverlay}
          position={position}
          containerRef={sceneRef}
          elementWidth={(bannerOverlay.layout.size.width / 100) * sceneSize.width}
          elementHeight={(bannerOverlay.layout.size.height / 100) * sceneSize.height}
          onLayoutChange={(id: string, partialLayout: any) => {
            if (partialLayout.position) onOverlayLayoutChange(id, "position", partialLayout.position);
            if (partialLayout.size) onOverlayLayoutChange(id, "size", partialLayout.size);
            if (partialLayout.rotation !== undefined) onOverlayLayoutChange(id, "rotation", partialLayout.rotation);
            if (partialLayout.isBehindUser !== undefined) {
              onOverlayLayoutChange(id, "isBehindUser", partialLayout.isBehindUser);
              if (onUpdateOverlayMetadata) {
                onUpdateOverlayMetadata(id, {
                  ...bannerOverlay.metadata,
                  data: { ...bannerOverlay.metadata?.data, isBehindUser: partialLayout.isBehindUser },
                });
              }
            }
          }}
          onStyleChange={(id, partialStyle) => {
            const newCssStyle: React.CSSProperties = {};
            if (partialStyle.fontFamily) newCssStyle.fontFamily = partialStyle.fontFamily;
            if (partialStyle.fontSize) newCssStyle.fontSize = `${partialStyle.fontSize}px`;
            if (partialStyle.color) newCssStyle.color = partialStyle.color;
            if (partialStyle.backgroundColor) newCssStyle.backgroundColor = partialStyle.backgroundColor;
            if (partialStyle.bold !== undefined) newCssStyle.fontWeight = partialStyle.bold ? "bold" : "normal";
            if (partialStyle.italic !== undefined) newCssStyle.fontStyle = partialStyle.italic ? "italic" : "normal";
            if (partialStyle.underline !== undefined)
              newCssStyle.textDecoration = partialStyle.underline ? "underline" : "none";
            if (partialStyle.textShadow !== undefined) newCssStyle.textShadow = partialStyle.textShadow;
            if (partialStyle.textAlign) newCssStyle.textAlign = partialStyle.textAlign;
            onBannerTextStyleChange(newCssStyle);
          }}
        />
      </div>
    </div>
  );
};
