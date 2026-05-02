// Single responsibility: draggable, resizable live-caption positioning layer.
import React, { useEffect } from "react";
import { Rnd } from "react-rnd";
import { CaptionRenderer } from "@/features/canvas/ui/CaptionRenderer";
import { CaptionStyle } from "@gaki/core/types/caption";

interface CaptionLayerProps {
  captionsEnabled: boolean;
  fullTranscript: string;
  interimTranscript: string;
  sceneSize: { width: number; height: number };
  liveCaptionStyle: CaptionStyle & {
    fontFamily: string;
    fontSize: number;
    color: string;
    bold: boolean;
    italic: boolean;
    underline: boolean;
    textShadow: string;
    width?: number;
    position: { x: number; y: number };
  };
  dynamicStyle: string;
  onCaptionLayoutChange: (layout: { position?: { x: number; y: number }; size?: { width: number; height: number } }) => void;
}

export const CaptionLayer: React.FC<CaptionLayerProps> = ({
  captionsEnabled,
  fullTranscript,
  interimTranscript,
  sceneSize,
  liveCaptionStyle,
  dynamicStyle,
  onCaptionLayoutChange,
}) => {
  useEffect(() => {
    console.log("[CaptionLayer] mounted");
  }, []);

  if (!captionsEnabled || (!fullTranscript && !interimTranscript) || sceneSize.width === 0) {
    return null;
  }

  const captionWidthPercent = liveCaptionStyle.width || 50;
  const captionWidth = (sceneSize.width * captionWidthPercent) / 100;

  const baseStyle: React.CSSProperties = {
    fontFamily: liveCaptionStyle.fontFamily,
    fontSize: `${liveCaptionStyle.fontSize}px`,
    color: liveCaptionStyle.color,
    fontWeight: liveCaptionStyle.bold ? "bold" : "normal",
    fontStyle: liveCaptionStyle.italic ? "italic" : "normal",
    textDecoration: liveCaptionStyle.underline ? "underline" : "none",
    textShadow: liveCaptionStyle.textShadow,
  };

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: "var(--z-caption)" }}
    >
      <Rnd
        key={`${sceneSize.width}-${captionWidthPercent}`}
        size={{ width: captionWidth, height: "auto" }}
        position={{
          x: (sceneSize.width * liveCaptionStyle.position.x) / 100 - captionWidth / 2,
          y: (sceneSize.height * liveCaptionStyle.position.y) / 100 - 50,
        }}
        enableResizing={{ top: false, right: true, bottom: false, left: true, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
        className="pointer-events-auto border-2 border-transparent hover:border-primary/50 transition-colors rounded-lg"
        style={{ position: "absolute" }}
        onDragStop={(e, d) => {
          const rect = d.node.getBoundingClientRect();
          const centerX = d.x + captionWidth / 2;
          const centerY = d.y + rect.height / 2;
          onCaptionLayoutChange({
            position: {
              x: (centerX / sceneSize.width) * 100,
              y: (centerY / sceneSize.height) * 100,
            },
          });
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          const newWidthPx = parseInt(ref.style.width, 10);
          const newWidthPercent = (newWidthPx / sceneSize.width) * 100;
          const newCenterX = position.x + newWidthPx / 2;
          const newXPercent = (newCenterX / sceneSize.width) * 100;
          const rect = ref.getBoundingClientRect();
          const newCenterY = position.y + rect.height / 2;
          const newYPercent = (newCenterY / sceneSize.height) * 100;
          onCaptionLayoutChange({
            size: { width: newWidthPercent, height: 0 },
            position: { x: newXPercent, y: newYPercent },
          });
        }}
      >
        <CaptionRenderer
          text=""
          fullTranscript={fullTranscript}
          interimTranscript={interimTranscript}
          activeStyleId={dynamicStyle}
          captionStyle={liveCaptionStyle as any}
          baseStyle={baseStyle}
        />
      </Rnd>
    </div>
  );
};
