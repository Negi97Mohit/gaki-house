import React, { useState, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, RemoveFormatting } from "lucide-react";
import { TextOverlayState } from "@/types/caption";
import { TextFormattingControls } from "@/components/text-toolbar/TextFormattingControls";
import { FontControls } from "@/components/text-toolbar/FontControls";
import { ColorControls } from "@/components/text-toolbar/ColorControls";
import { TextDesignSelector } from "@/components/text-toolbar/TextDesignSelector";

interface TextEditingToolbarProps {
  overlay: TextOverlayState;
  onStyleChange: (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => void;
  position: { x: number; y: number };
  containerRef?: React.RefObject<HTMLElement>;
  elementHeight?: number;
  elementWidth?: number;
}

export const TextEditingToolbar: React.FC<TextEditingToolbarProps> = ({
  overlay,
  onStyleChange,
  position,
  containerRef,
  elementHeight = 40,
  elementWidth = 100,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });
  const [showDesigns, setShowDesigns] = useState(false);

  useLayoutEffect(() => {
    if (toolbarRef.current && containerRef.current) {
      const toolbarHeight = toolbarRef.current.offsetHeight;
      const toolbarWidth = toolbarRef.current.offsetWidth;
      const containerRect = containerRef.current.getBoundingClientRect();

      const gap = 20;
      let x = position.x + elementWidth / 2 - toolbarWidth / 2;
      x = Math.max(8, Math.min(x, containerRect.width - toolbarWidth - 8));

      let y: number;
      const spaceAbove = position.y;
      const spaceBelow = containerRect.height - (position.y + elementHeight);
      const requiredSpaceAbove = toolbarHeight + gap;
      const requiredSpaceBelow = toolbarHeight + gap + 45;

      if (spaceAbove >= requiredSpaceAbove) {
        y = position.y - toolbarHeight - gap;
      } else if (spaceBelow >= requiredSpaceBelow) {
        y = position.y + elementHeight + 45;
      } else {
        y = Math.max(8, position.y - toolbarHeight - gap);
        y = Math.max(8, Math.min(y, containerRect.height - toolbarHeight - 8));
      }

      setToolbarPosition({ x, y });
    }
  }, [position, containerRef, elementHeight, elementWidth]);

  return (
    <>
      <div
        ref={toolbarRef}
        className="absolute bg-background/95 backdrop-blur-md border-2 border-border rounded-xl shadow-2xl p-2"
        style={{
          left: `${toolbarPosition.x}px`,
          top: `${toolbarPosition.y}px`,
          zIndex: "var(--z-text-toolbar)",
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5 flex-wrap max-w-[700px]">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-medium"
            onClick={() => setShowDesigns(!showDesigns)}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Designs
          </Button>

          {overlay.style.layers ? (
            <div className="flex items-center gap-2 p-2">
              <span className="text-xs text-muted-foreground">
                Design applied
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                title="Remove Design / Edit Manually"
                onClick={() => onStyleChange(overlay.id, { layers: null })}
              >
                <RemoveFormatting className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <>
              <div className="w-px h-6 bg-border" />
              <FontControls overlay={overlay} onStyleChange={onStyleChange} />
              <div className="w-px h-6 bg-border" />
              <ColorControls overlay={overlay} onStyleChange={onStyleChange} />
              <div className="w-px h-6 bg-border" />
              <TextFormattingControls
                overlay={overlay}
                onStyleChange={onStyleChange}
              />
            </>
          )}
        </div>
      </div>

      {showDesigns && (
        <TextDesignSelector
          overlay={overlay}
          onStyleChange={onStyleChange}
          onClose={() => setShowDesigns(false)}
          position={toolbarPosition}
        />
      )}
    </>
  );
};
