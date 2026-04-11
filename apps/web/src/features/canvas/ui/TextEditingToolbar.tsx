import React, { useState, useRef, useLayoutEffect } from "react";
import { Button } from "@caption-cam/ui/button";
import { Sparkles, Layers, Type } from "lucide-react";
import { cn } from "@caption-cam/core/lib/utils";
import { TextOverlayState } from "@caption-cam/core/types/caption";
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
  onEditClick?: () => void;
}

export const TextEditingToolbar: React.FC<TextEditingToolbarProps> = ({
  overlay,
  onStyleChange,
  onLayoutChange,
  position,
  containerRef,
  elementHeight = 40,
  elementWidth = 100,
  onEditClick,
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
          "absolute pointer-events-auto flex items-center gap-0.5 px-2 py-1",
          "bg-background/70 dark:bg-background/50 backdrop-blur-2xl",
          "border border-border/20 dark:border-white/10 rounded-2xl",
          "shadow-2xl shadow-black/10 dark:shadow-black/30 isolate",
          "transition-opacity duration-150",
          isReady ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        style={{
          left: `${toolbarPosition.x}px`,
          top: `${toolbarPosition.y}px`,
          zIndex: 9999,
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />

        {onEditClick && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="relative h-6 w-6 shrink-0 rounded-xl hover:bg-foreground/5 dark:hover:bg-white/10"
              onClick={onEditClick}
              title="Edit Text Content"
            >
              <Type className="w-3 h-3 text-primary" />
            </Button>
            <div className="w-px h-4 bg-border/20 dark:bg-white/10 mx-0.5" />
          </>
        )}

        <Button
          variant={showDesigns ? "secondary" : "ghost"}
          size="icon"
          className="relative h-6 w-6 shrink-0 rounded-xl hover:bg-foreground/5 dark:hover:bg-white/10"
          onClick={() => setShowDesigns(!showDesigns)}
          title="Text Designs & Animations"
        >
          <Sparkles className="w-3 h-3 text-primary/80" />
        </Button>

        <div className="w-px h-4 bg-border/20 dark:bg-white/10 mx-0.5" />

        <FontControls overlay={overlay} onStyleChange={onStyleChange} />

        <div className="w-px h-4 bg-border/20 dark:bg-white/10 mx-0.5" />

        <ColorControls overlay={overlay} onStyleChange={onStyleChange} />

        <div className="w-px h-4 bg-border/20 dark:bg-white/10 mx-0.5" />

        <TextFormattingControls
          overlay={overlay}
          onStyleChange={onStyleChange}
        />

        {overlay.style.layers && (
          <>
            <div className="w-px h-4 bg-border/20 dark:bg-white/10 mx-0.5" />
            <Button
              variant="ghost"
              size="sm"
              className="relative h-5 px-1.5 text-[9px] text-destructive/80 hover:text-destructive hover:bg-destructive/10 rounded-lg"
              onClick={() => onStyleChange(overlay.id, { layers: null })}
              title="Remove Design"
            >
              Reset
            </Button>
          </>
        )}

        <div className="w-px h-4 bg-border/20 dark:bg-white/10 mx-0.5" />

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative h-6 w-6 shrink-0 rounded-xl hover:bg-foreground/5 dark:hover:bg-white/10",
            overlay.layout.isBehindUser && "bg-primary/15 text-primary"
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
          <Layers className="w-3 h-3" />
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
