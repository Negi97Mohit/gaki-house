import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { X, Ban } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { useTextDesigns, TextDesign } from "@/hooks/useTextDesigns";
import { MultiLayerTextRenderer } from "@/features/canvas/ui/MultiLayerTextRenderer";
import { TextOverlayState } from "@/types/caption";
import { TextLayer } from "@/types/textDesign";
import { cn } from "@/shared/lib/utils";

interface TextDesignSelectorProps {
  overlay: TextOverlayState;
  onStyleChange: (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

const CATEGORIES = [
  { value: "all", label: "All" },
  { value: "animated", label: "Anim" },
  { value: "headlines", label: "Headlines" },
  { value: "modern", label: "Modern" },
  { value: "fun", label: "Fun" },
];

export const TextDesignSelector: React.FC<TextDesignSelectorProps> = ({
  overlay,
  onStyleChange,
  onClose,
  position,
}) => {
  const { textDesigns } = useTextDesigns();
  const panelRef = useRef<HTMLDivElement>(null);

  // Layout Constants
  const PANEL_HEIGHT = 150;
  const PANEL_WIDTH = 520;
  const TOOLBAR_HEIGHT = 44; // Approx height of the parent toolbar

  // Smart Positioning: Place above if user is low on screen, otherwise below
  // We assume 'position' is the top-left of the toolbar
  const showAbove = position.y > 250;

  const calculatedStyle = {
    left: `${position.x}px`, // Align left with toolbar
    // If showing above: Position - Panel Height - Gap
    // If showing below: Position + Toolbar Height + Gap
    top: showAbove
      ? `${position.y - PANEL_HEIGHT - 8}px`
      : `${position.y + TOOLBAR_HEIGHT + 8}px`,
    width: `${PANEL_WIDTH}px`,
    height: `${PANEL_HEIGHT}px`,
    zIndex: "calc(var(--z-text-toolbar) + 10)",
  };

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        panelRef.current?.contains(target) ||
        target.closest("[data-toolbar-control]") ||
        target.closest("[data-text-toolbar]")
      ) {
        return;
      }
      onClose();
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  const handleApplyDesign = (design: TextDesign) => {
    // 1. Capture CURRENT user settings we want to preserve
    const currentFontSize = overlay.style.fontSize;
    const currentTextAlign = (overlay.style as any).textAlign || "center";

    if (design.layers && design.layers.length > 0) {
      const baseTextLayer = design.layers.find((l) => l.type === "text") as
        | TextLayer
        | undefined;
      let appliedBackgroundColor = "transparent";

      // Only apply thumbnail color if it's a valid color string (not an image URL)
      if (
        design.thumbnail &&
        (design.thumbnail.startsWith("#") || design.thumbnail.startsWith("rgb"))
      ) {
        appliedBackgroundColor = design.thumbnail;
      }

      onStyleChange(overlay.id, {
        layers: design.layers,
        // Apply Design Defaults first
        fontFamily: baseTextLayer?.fontFamily || "Inter",
        color: baseTextLayer?.color || "#FFFFFF",
        gradient: baseTextLayer?.gradient || undefined,
        letterSpacing: baseTextLayer?.letterSpacing || "normal",
        // Override with PRESERVED User Settings
        fontSize: currentFontSize, // KEEP SIZE
        textAlign: currentTextAlign, // KEEP ALIGN
        // Reset others to clean state
        backgroundColor: appliedBackgroundColor,
        bold: false,
        italic: false,
        underline: false,
        textShadow: "none",
        outline: false,
        shadow: false,
        border: false,
        borderColor: "#FFFFFF",
        borderWidth: 2,
        padding: "0",
        animation: design.animation,
        animationCSS: design.animationCSS,
      } as any);
    } else if ((design as any).style) {
      const oldStyle = (design as any).style;
      let appliedBackgroundColor = oldStyle.backgroundColor;
      if (
        (!appliedBackgroundColor || appliedBackgroundColor === "transparent") &&
        design.thumbnail &&
        (design.thumbnail.startsWith("#") || design.thumbnail.startsWith("rgb"))
      ) {
        appliedBackgroundColor = design.thumbnail;
      }

      onStyleChange(overlay.id, {
        layers: null,
        fontFamily: oldStyle.fontFamily,
        color: oldStyle.color,
        // Preserve User Settings
        fontSize: currentFontSize,
        textAlign: currentTextAlign,
        // Apply Design
        backgroundColor: appliedBackgroundColor,
        bold: oldStyle.bold,
        italic: oldStyle.italic,
        underline: oldStyle.underline,
        textShadow: oldStyle.textShadow,
        outline: oldStyle.outline,
        shadow: oldStyle.shadow,
        gradient: oldStyle.gradient,
        border: oldStyle.border,
        borderColor: oldStyle.borderColor,
        borderWidth: oldStyle.borderWidth,
        letterSpacing: oldStyle.letterSpacing,
        padding: oldStyle.padding,
      });
    }
  };

  return (
    <div
      ref={panelRef}
      className="absolute pointer-events-auto bg-neutral-900/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={calculatedStyle}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <Tabs defaultValue="all" className="w-full h-full flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5 shrink-0">
          <div className="flex items-center gap-3">
            <h3 className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
              Presets
            </h3>
            <TabsList className="h-6 bg-transparent p-0 gap-0.5">
              {CATEGORIES.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="text-[10px] h-full px-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-neutral-500 rounded-md transition-all"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-5 w-5 hover:bg-white/10 text-neutral-400 hover:text-white"
            onClick={onClose}
          >
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Horizontal Content Area */}
        <div className="flex-1 relative min-h-0 bg-neutral-950/30">
          {CATEGORIES.map((cat) => (
            <TabsContent
              key={cat.value}
              value={cat.value}
              className="absolute inset-0 m-0 data-[state=inactive]:hidden"
            >
              <ScrollArea className="w-full h-full">
                <div className="flex items-center gap-2 p-3 min-w-max">
                  {cat.value === "all" && (
                    <button
                      onClick={() =>
                        onStyleChange(overlay.id, { layers: null })
                      }
                      className="flex flex-col items-center justify-center w-24 h-24 shrink-0 rounded-lg border border-dashed border-white/20 hover:border-white/50 hover:bg-white/5 transition-all gap-2 group"
                    >
                      <Ban className="w-5 h-5 text-neutral-500 group-hover:text-neutral-300" />
                      <span className="text-[10px] text-neutral-500 group-hover:text-neutral-300">
                        None
                      </span>
                    </button>
                  )}

                  {Array.isArray(textDesigns) &&
                    textDesigns
                      .filter(
                        (d) => cat.value === "all" || d.category === cat.value
                      )
                      .map((design) => {
                        const oldStyle = (design as any).style;
                        const baseTextLayer = design.layers?.find(
                          (l): l is TextLayer => l.type === "text"
                        ) as TextLayer | undefined;

                        // Accurate Preview Background Logic:
                        // Only show a background color if the design explicitly has one that is applied.
                        // 1. Check if thumbnail is a Hex/RGB color (this is what apply uses)
                        // 2. Or check if style.backgroundColor is set
                        let previewBackground = "transparent";
                        const thumbIsColor =
                          design.thumbnail &&
                          (design.thumbnail.startsWith("#") ||
                            design.thumbnail.startsWith("rgb"));

                        if (thumbIsColor) {
                          previewBackground = design.thumbnail;
                        } else if (oldStyle?.backgroundColor) {
                          previewBackground = oldStyle.backgroundColor;
                        }

                        // If background is transparent, we might want a dark backing for visibility if text is light
                        // But we don't want to mislead that the design HAS a background.
                        // We'll use a checkerboard or subtle grid for transparency in the future,
                        // but for now, if transparent, just keep it transparent (UI background is dark).

                        const hasLayers =
                          design.layers && design.layers.length > 0;

                        return (
                          <button
                            key={design.id}
                            onClick={() => handleApplyDesign(design)}
                            className="group relative w-24 h-24 shrink-0 overflow-hidden rounded-lg border border-white/10 hover:border-primary/50 hover:ring-1 hover:ring-primary/50 transition-all shadow-sm bg-neutral-900"
                          >
                            {/* Preview Container */}
                            <div
                              className="w-full h-full flex items-center justify-center p-1"
                              style={{
                                background: previewBackground,
                              }}
                            >
                              {hasLayers ? (
                                <div className="transform scale-[0.35] origin-center pointer-events-none">
                                  {/* Ensure text doesn't wrap in preview */}
                                  <div className="whitespace-nowrap">
                                    <MultiLayerTextRenderer
                                      text="Aa"
                                      layers={design.layers}
                                      scale={1}
                                    />
                                  </div>
                                </div>
                              ) : (
                                <span
                                  className="text-2xl font-bold select-none inline-block whitespace-nowrap"
                                  style={{
                                    fontFamily:
                                      baseTextLayer?.fontFamily ||
                                      oldStyle?.fontFamily ||
                                      "Inter",
                                    color:
                                      baseTextLayer?.color ||
                                      oldStyle?.color ||
                                      "#FFFFFF",
                                    WebkitTextStroke:
                                      (baseTextLayer as any)?.[
                                        "-webkit-text-stroke"
                                      ] ||
                                      (oldStyle as any)?.[
                                        "-webkit-text-stroke"
                                      ] ||
                                      "unset",
                                    textShadow: oldStyle?.textShadow,
                                  }}
                                >
                                  Aa
                                </span>
                              )}
                            </div>

                            {/* Hover Label */}
                            <div className="absolute inset-x-0 bottom-0 bg-black/80 backdrop-blur-sm py-1 px-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <p className="text-[9px] text-white font-medium truncate max-w-full">
                                {design.name}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  );
};
