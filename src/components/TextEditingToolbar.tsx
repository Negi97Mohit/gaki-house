// src/components/TextEditingToolbar.tsx
import React, { useState, useRef, useLayoutEffect, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Minus,
  Plus,
  List,
  ListOrdered,
  RemoveFormatting,
  Sparkles,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TextOverlayState } from "@/types/caption";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { loadTextDesigns } from "@/lib/textDesigns";
import { TextDesignPreset, TextLayer } from "@/types/textDesign"; // IMPORT TextLayer
import { ALL_FONTS } from "@/lib/fonts"; // Import expanded font library

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

// Use the expanded font library from fonts.ts
const FONT_FAMILIES = ALL_FONTS;

const PRESET_COLORS = [
  "#FFFFFF",
  "#000000",
  "#FF0000",
  "#00FF00",
  "#0000FF",
  "#FFFF00",
  "#FF00FF",
  "#00FFFF",
  "#FFA500",
  "#800080",
];

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
  const [textDesigns, setTextDesigns] = useState<TextDesignPreset[]>([]);
  const [showDesigns, setShowDesigns] = useState(false);

  useEffect(() => {
    loadTextDesigns().then(setTextDesigns);
  }, []);

  useLayoutEffect(() => {
    if (toolbarRef.current && containerRef.current) {
      const toolbarHeight = toolbarRef.current.offsetHeight;
      const toolbarWidth = toolbarRef.current.offsetWidth;
      const containerRect = containerRef.current.getBoundingClientRect();

      // Gap between toolbar and text element boundaries
      const gap = 20;

      // Center toolbar horizontally relative to the text element center
      // position.x is the top-left of the element
      // We want to center relative to elementWidth
      let x = position.x + elementWidth / 2 - toolbarWidth / 2;

      // Clamp horizontally to stay within container
      x = Math.max(8, Math.min(x, containerRect.width - toolbarWidth - 8));

      // Vertical positioning logic
      let y: number;
      const spaceAbove = position.y;
      const spaceBelow = containerRect.height - (position.y + elementHeight);
      const requiredSpaceAbove = toolbarHeight + gap;
      const requiredSpaceBelow = toolbarHeight + gap + 45; // Extra space for rotation handle

      if (spaceAbove >= requiredSpaceAbove) {
        // Prefer above: Position above the element
        y = position.y - toolbarHeight - gap;
      } else if (spaceBelow >= requiredSpaceBelow) {
        // Fallback below: Position below the element + rotation handle space
        y = position.y + elementHeight + 45;
      } else {
        // If tight on both sides, prefer top of screen or wherever it fits best
        // Try to force it to the top if it fits, otherwise clamp
        y = Math.max(8, position.y - toolbarHeight - gap);
        // Final clamp to container
        y = Math.max(8, Math.min(y, containerRect.height - toolbarHeight - 8));
      }

      setToolbarPosition({ x, y });
    }
  }, [position, containerRef, elementHeight, elementWidth]);

  // --- MODIFIED: All handlers now use document.execCommand ---

  const handleFontSizeChange = (delta: number) => {
    const currentSize = overlay.style.fontSize || 16;
    const newSize = Math.max(12, Math.min(300, currentSize + delta));
    onStyleChange(overlay.id, { fontSize: newSize });
    // Note: execCommand for font size is unreliable (uses 1-7). We'll keep using style prop.
  };

  const handleColorChange = (color: string, isBackground: boolean = false) => {
    if (isBackground) {
      onStyleChange(overlay.id, { backgroundColor: color });
    } else {
      document.execCommand("foreColor", false, color);
      onStyleChange(overlay.id, { color });
    }
  };

  const handleFontFamilyChange = (font: string) => {
    document.execCommand("fontName", false, font);
    onStyleChange(overlay.id, { fontFamily: font });
  };

  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    const command =
      alignment === "left"
        ? "justifyLeft"
        : alignment === "center"
        ? "justifyCenter"
        : "justifyRight";
    document.execCommand(command);
    onStyleChange(overlay.id, { textAlign: alignment } as any);
  };

  const handleApplyDesign = (design: TextDesignPreset) => {
    // --- FIX: Check if design.layers exists. If not, it's an old preset. ---
    if (design.layers && design.layers.length > 0) {
      // --- NEW Multi-Layer Logic ---
      const baseTextLayer = design.layers.find((l) => l.type === "text") as
        | TextLayer
        | undefined;
      // --- NEW: Check thumbnail to apply background color ---
      let appliedBackgroundColor = "transparent";
      if (
        design.thumbnail &&
        (design.thumbnail.startsWith("#") || design.thumbnail.startsWith("rgb"))
      ) {
        appliedBackgroundColor = design.thumbnail;
      }
      // --- END NEW ---

      onStyleChange(overlay.id, {
        layers: design.layers, // Apply the full layer stack
        fontFamily: baseTextLayer?.fontFamily || "Inter",
        fontSize: baseTextLayer?.fontSize || 32,
        color: baseTextLayer?.color || "#FFFFFF",
        gradient: baseTextLayer?.gradient || undefined,
        letterSpacing: baseTextLayer?.letterSpacing || "normal",
        backgroundColor: appliedBackgroundColor, // <-- FIX: Use variable
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
      });
    } else if ((design as any).style) {
      // --- FALLBACK: Convert OLD flat preset to a NEW flat style ---
      const oldStyle = (design as any).style;

      // --- NEW: Also apply thumbnail logic to fallback ---
      let appliedBackgroundColor = oldStyle.backgroundColor; // Default to old style's BG
      if (
        (!appliedBackgroundColor || appliedBackgroundColor === "transparent") &&
        design.thumbnail &&
        (design.thumbnail.startsWith("#") || design.thumbnail.startsWith("rgb"))
      ) {
        appliedBackgroundColor = design.thumbnail;
      }
      // --- END NEW ---

      onStyleChange(overlay.id, {
        layers: null, // <-- Explicitly set layers to null to exit multi-layer mode
        fontFamily: oldStyle.fontFamily,
        fontSize: oldStyle.fontSize,
        color: oldStyle.color,
        backgroundColor: appliedBackgroundColor, // <-- USE THE CHECKED VALUE
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
    } else {
      console.error(
        "Clicked design preset has no 'layers' or 'style' property:",
        design
      );
    }

    setShowDesigns(false);
  };

  const categories = [
    { value: "all", label: "All" },
    { value: "headlines", label: "Headlines" },
    { value: "modern", label: "Modern" },
    { value: "elegant", label: "Elegant" },
    { value: "fun", label: "Fun" },
    { value: "effects", label: "Effects" },
  ];

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
          {/* Design Presets Button */}
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-3 text-xs font-medium"
            onClick={() => setShowDesigns(!showDesigns)}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            Designs
          </Button>

          {/* --- START CONDITIONAL BLOCK --- */}
          {overlay.style.layers ? (
            // --- NEW: Show when a design is applied ---
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
            // --- OLD: Show all flat editors ---
            <>
              <div className="w-px h-6 bg-border" />
              {/* Font Family Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-3 text-xs font-medium"
                  >
                    <Type className="w-3 h-3 mr-1" />
                    {(overlay.style.fontFamily || "Inter").split(",")[0]}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="max-h-64 overflow-y-auto"
                >
                  {FONT_FAMILIES.map((font) => (
                    <DropdownMenuItem
                      key={font}
                      onClick={() => handleFontFamilyChange(font)}
                      className={cn(
                        (overlay.style.fontFamily || "Inter") === font &&
                          "bg-accent"
                      )}
                      style={{ fontFamily: font }}
                    >
                      {font}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-6 bg-border" />

              {/* Font Size Controls */}
              <div className="flex items-center gap-1 bg-muted/50 rounded-md px-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleFontSizeChange(-4)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
                <span className="text-xs font-medium w-10 text-center">
                  {overlay.style.fontSize || 16}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleFontSizeChange(4)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              <div className="w-px h-6 bg-border" />

              {/* Text Color */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 relative"
                  >
                    <Type className="w-4 h-4" />
                    <div
                      className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded"
                      style={{ backgroundColor: overlay.style.color }}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="grid grid-cols-5 gap-2 p-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-md border-2 border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color)}
                      />
                    ))}
                  </div>
                  <div className="p-2 pt-0">
                    <input
                      type="color"
                      value={overlay.style.color}
                      onChange={(e) => handleColorChange(e.target.value)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Background Color */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    title="Background Color"
                  >
                    <div
                      className="w-5 h-5 rounded border-2 border-border"
                      style={{ backgroundColor: overlay.style.backgroundColor }}
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <div className="grid grid-cols-5 gap-2 p-2">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        className="w-8 h-8 rounded-md border-2 border-border hover:scale-110 transition-transform"
                        style={{ backgroundColor: color }}
                        onClick={() => handleColorChange(color, true)}
                      />
                    ))}
                    <button
                      className="w-8 h-8 rounded-md border-2 border-border hover:scale-110 transition-transform bg-transparent"
                      onClick={() => handleColorChange("transparent", true)}
                      title="Transparent"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-red-500 via-transparent to-red-500 opacity-30" />
                    </button>
                  </div>
                  <div className="p-2 pt-0">
                    <input
                      type="color"
                      value={overlay.style.backgroundColor}
                      onChange={(e) => handleColorChange(e.target.value, true)}
                      className="w-full h-8 rounded cursor-pointer"
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="w-px h-6 bg-border" />

              {/* Text Formatting */}
              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", overlay.style.bold && "bg-accent")}
                onClick={() => document.execCommand("bold")}
              >
                <Bold className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", overlay.style.italic && "bg-accent")}
                onClick={() => document.execCommand("italic")}
              >
                <Italic className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  overlay.style.underline && "bg-accent"
                )}
                onClick={() => document.execCommand("underline")}
              >
                <Underline className="w-4 h-4" />
              </Button>

              <div className="w-px h-6 bg-border" />

              {/* Text Alignment */}
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  (overlay.style as any).textAlign === "left" && "bg-accent"
                )}
                onClick={() => handleAlignmentChange("left")}
              >
                <AlignLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  (overlay.style as any).textAlign === "center" && "bg-accent"
                )}
                onClick={() => handleAlignmentChange("center")}
              >
                <AlignCenter className="w-4 h-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "h-8 w-8",
                  (overlay.style as any).textAlign === "right" && "bg-accent"
                )}
                onClick={() => handleAlignmentChange("right")}
              >
                <AlignRight className="w-4 h-4" />
              </Button>
            </>
          )}
          {/* --- END CONDITIONAL BLOCK --- */}
        </div>
      </div>

      {/* Design Library Panel */}
      {showDesigns && (
        <div
          className="absolute bg-background border-2 border-border rounded-xl shadow-2xl p-4"
          style={{
            left: `${toolbarPosition.x}px`,
            top: `${toolbarPosition.y + 60}px`,
            zIndex: "calc(var(--z-text-toolbar) + 1)",
            width: "600px",
            maxHeight: "450px",
          }}
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-foreground">
              Text Designs
            </h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => setShowDesigns(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid grid-cols-6 w-full mb-3 bg-muted">
              {categories.map((cat) => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {categories.map((cat) => (
              <TabsContent key={cat.value} value={cat.value} className="mt-0">
                <ScrollArea className="h-[320px] w-full pr-4">
                  <div className="grid grid-cols-3 gap-3">
                    {/* --- FIX: Ensure textDesigns is an array before mapping --- */}
                    {Array.isArray(textDesigns) &&
                      textDesigns
                        .filter(
                          (d) => cat.value === "all" || d.category === cat.value
                        )
                        .map((design) => {
                          // --- FIX: Safely find the base text layer or fallback to old style ---
                          const oldStyle = (design as any).style;
                          const baseTextLayer = design.layers?.find(
                            (l): l is TextLayer => l.type === "text"
                          ) as TextLayer | undefined;

                          // --- Determine preview style ---
                          const previewStyle: React.CSSProperties = {
                            fontFamily:
                              baseTextLayer?.fontFamily ||
                              oldStyle?.fontFamily ||
                              "Inter",
                            fontSize: "32px",
                            color:
                              baseTextLayer?.color ||
                              oldStyle?.color ||
                              "#FFFFFF",
                            // --- FIX: Add missing style properties for accurate preview ---
                            letterSpacing:
                              baseTextLayer?.letterSpacing ||
                              oldStyle?.letterSpacing ||
                              "normal",
                            WebkitTextStroke:
                              (baseTextLayer as any)?.["-webkit-text-stroke"] ||
                              (oldStyle as any)?.["-webkit-text-stroke"] ||
                              "unset",
                          };
                          // --- FIX: Logic for preview background ---
                          let previewBackground = design.thumbnail;
                          // If thumbnail is a gradient (like Neon), use a dark background
                          // for the preview instead so the text effect is visible.
                          if (design.thumbnail?.startsWith("linear-gradient")) {
                            previewBackground = "#1A1A1A"; // Use a dark background
                          } else if (
                            design.category === "effects" &&
                            !design.thumbnail?.startsWith("#")
                          ) {
                            previewBackground = "#1A1A1A"; // Default dark for effects
                          }

                          return (
                            <button
                              key={design.id}
                              onClick={() => handleApplyDesign(design)}
                              className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105"
                              style={{
                                background: previewBackground,
                              }}
                            >
                              <div className="w-full h-28 flex items-center justify-center p-3">
                                <span
                                  className="text-2xl font-bold select-none inline-block"
                                  style={previewStyle} // Use the safe preview style
                                >
                                  Aa
                                </span>
                              </div>
                              <div className="bg-background border-t border-border p-2">
                                <p className="text-xs font-medium text-center truncate text-foreground">
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
      )}
    </>
  );
};
