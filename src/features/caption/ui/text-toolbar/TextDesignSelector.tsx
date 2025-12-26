import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/shared/ui/button";
import { X, Ban } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { useTextDesigns } from "@/hooks/useTextDesigns";
import { MultiLayerTextRenderer } from "@/features/canvas/ui/MultiLayerTextRenderer";
import { TextOverlayState, TextDesignPreset, TextLayer } from "@/types/caption";

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

  const handleApplyDesign = (design: TextDesignPreset) => {
    // 1. Capture CURRENT user settings we want to preserve
    const currentFontSize = overlay.style.fontSize;
    const currentTextAlign = (overlay.style as any).textAlign || "center";
    const currentContent = overlay.content;

    if (design.layers && design.layers.length > 0) {
      const baseTextLayer = design.layers.find((l) => l.type === "text") as
        | TextLayer
        | undefined;
      let appliedBackgroundColor = "transparent";

      // Handle thumbnail background logic
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
      className="absolute pointer-events-auto bg-background/95 backdrop-blur-xl border border-border/50 rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y + 45}px`,
        zIndex: "calc(var(--z-text-toolbar) + 10)",
        width: "320px",
        maxHeight: "400px",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-3 border-b border-border/50 bg-muted/30">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Presets
        </h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
          onClick={onClose}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full flex-1 flex flex-col min-h-0">
        <div className="px-3 pt-3">
          <TabsList className="w-full h-8 bg-muted/50 p-0.5">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.value}
                value={cat.value}
                className="flex-1 text-[10px] h-full data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {CATEGORIES.map((cat) => (
          <TabsContent
            key={cat.value}
            value={cat.value}
            className="flex-1 mt-0 min-h-0"
          >
            <ScrollArea className="h-[300px] w-full">
              <div className="grid grid-cols-2 gap-2 p-3">
                {cat.value === "all" && (
                  <button
                    onClick={() => onStyleChange(overlay.id, { layers: null })}
                    className="flex flex-col items-center justify-center h-20 rounded-lg border-2 border-dashed border-border hover:border-primary/50 hover:bg-accent/50 transition-all gap-2"
                  >
                    <Ban className="w-5 h-5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">None</span>
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

                      let previewBackground = design.thumbnail || "#1A1A1A";
                      if (design.thumbnail?.startsWith("linear-gradient")) {
                        previewBackground = "#1A1A1A";
                      } else if (
                        design.category === "effects" &&
                        !design.thumbnail?.startsWith("#")
                      ) {
                        previewBackground = "#1A1A1A";
                      }

                      const hasLayers =
                        design.layers && design.layers.length > 0;

                      return (
                        <button
                          key={design.id}
                          onClick={() => handleApplyDesign(design)}
                          className="group relative overflow-hidden rounded-lg border border-border hover:border-primary transition-all hover:scale-[1.02] shadow-sm"
                          style={{
                            background: previewBackground,
                          }}
                        >
                          <div className="w-full h-20 flex items-center justify-center p-2">
                            {hasLayers ? (
                              <div className="transform scale-[0.4] origin-center pointer-events-none">
                                <MultiLayerTextRenderer
                                  text="Aa"
                                  layers={design.layers}
                                  scale={1}
                                />
                              </div>
                            ) : (
                              <span
                                className="text-xl font-bold select-none inline-block"
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
                                }}
                              >
                                Aa
                              </span>
                            )}
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-black/60 backdrop-blur-[1px] py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-[10px] text-white font-medium truncate text-center">
                              {design.name}
                            </p>
                          </div>
                        </button>
                      );
                    })}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
