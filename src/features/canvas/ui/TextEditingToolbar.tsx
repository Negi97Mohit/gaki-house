import React, { useState, useRef, useLayoutEffect } from "react";
import { Button } from "@/shared/ui/button";
import { Sparkles, Layers } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { TextOverlayState } from "@/types/caption";
import { TextFormattingControls } from "@/features/caption/ui/text-toolbar/TextFormattingControls";
import { FontControls } from "@/features/caption/ui/text-toolbar/FontControls";
import { ColorControls } from "@/features/caption/ui/text-toolbar/ColorControls";
import { TextDesignSelector } from "@/features/caption/ui/text-toolbar/TextDesignSelector";

interface TextEditingToolbarProps {
  overlay: TextOverlayState;
  onStyleChange: (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => void;
  onLayoutChange: (
    id: string,
    layout: Partial<TextOverlayState["layout"]>
  ) => void;
  position: { x: number; y: number };
  containerRef?: React.RefObject<HTMLElement>;
  elementHeight?: number;
  elementWidth?: number;
}

export const TextEditingToolbar: React.FC<TextEditingToolbarProps> = ({
  overlay,
  onStyleChange,
  onLayoutChange,
  position,
  containerRef,
  elementHeight = 40,
  elementWidth = 100,
}) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const [toolbarPosition, setToolbarPosition] = useState(position);
  const [showDesigns, setShowDesigns] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Smart Positioning Logic
  useLayoutEffect(() => {
    if (toolbarRef.current && containerRef?.current) {
      const toolbarHeight = toolbarRef.current.offsetHeight;
      const toolbarWidth = toolbarRef.current.offsetWidth;
      const containerRect = containerRef.current.getBoundingClientRect();

      let x = position.x + elementWidth / 2 - toolbarWidth / 2;
      x = Math.max(8, Math.min(x, containerRect.width - toolbarWidth - 8));

      const gap = 12;
      let y = position.y - toolbarHeight - gap;

      if (y < 0) {
        y = position.y + elementHeight + gap;
      }

      setToolbarPosition({ x, y });
    }
    setIsReady(true);
  }, [position, containerRef, elementHeight, elementWidth]);

  return (
    <>
      <div
        ref={toolbarRef}
        className={cn(
          "absolute pointer-events-auto flex items-center gap-1 p-1.5 bg-background/95 backdrop-blur-md border border-border/50 rounded-xl shadow-xl isolate",
          isReady
            ? "animate-in fade-in zoom-in-95 duration-200"
            : "opacity-0 pointer-events-none"
        )}
        style={{
          left: `${toolbarPosition.x}px`,
          top: `${toolbarPosition.y}px`,
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Button
          variant={showDesigns ? "secondary" : "ghost"}
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={() => setShowDesigns(!showDesigns)}
          title="Text Designs & Animations"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
        </Button>

        <div className="w-px h-5 bg-border mx-0.5" />

        <FontControls overlay={overlay} onStyleChange={onStyleChange} />

        <div className="w-px h-5 bg-border mx-0.5" />

        <ColorControls overlay={overlay} onStyleChange={onStyleChange} />

        <div className="w-px h-5 bg-border mx-0.5" />

        <TextFormattingControls
          overlay={overlay}
          onStyleChange={onStyleChange}
        />

        {overlay.style.layers && (
          <>
            <div className="w-px h-5 bg-border mx-0.5" />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-[10px] text-destructive hover:bg-destructive/10"
              onClick={() => onStyleChange(overlay.id, { layers: null })}
              title="Remove Design"
            >
              Reset
            </Button>
          </>
        )}

        <div className="w-px h-5 bg-border mx-0.5" />

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 shrink-0",
            overlay.layout.isBehindUser && "bg-primary/20 text-primary"
          )}
          title={
            overlay.layout.isBehindUser ? "Bring to Front" : "Send Behind User"
          }
          onClick={() =>
            onLayoutChange(overlay.id, {
              isBehindUser: !overlay.layout.isBehindUser,
            })
          }
        >
          <Layers className="w-4 h-4" />
        </Button>
      </div>

      {showDesigns && (
        <TextDesignSelector
          overlay={overlay}
          onStyleChange={onStyleChange}
          onClose={() => setShowDesigns(false)}
          // Pass the raw toolbar position; Selector handles its own placement
          position={toolbarPosition}
        />
      )}
    </>
  );
};
