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
import { TextDesignPreset } from "@/types/textDesign";

interface TextEditingToolbarProps {
  overlay: TextOverlayState;
  onStyleChange: (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => void;
  position: { x: number; y: number };
  containerRef?: React.RefObject<HTMLElement>;
}

const FONT_FAMILIES = [
  "Inter",
  "Arial",
  "Helvetica",
  "Times New Roman",
  "Courier New",
  "Georgia",
  "Verdana",
  "Comic Sans MS",
  "Impact",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Playfair Display",
  "Bebas Neue",
];

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

      const x = position.x - toolbarWidth / 2;
      const y = position.y - toolbarHeight - 16;

      const clampedX = Math.max(
        8,
        Math.min(x, containerRect.width - toolbarWidth - 8)
      );
      const clampedY = Math.max(8, y);

      setToolbarPosition({ x: clampedX, y: clampedY });
    }
  }, [position, containerRef]);

  // --- MODIFIED: All handlers now use document.execCommand ---

  const handleFontSizeChange = (delta: number) => {
    const newSize = Math.max(12, Math.min(300, overlay.style.fontSize + delta));
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
    onStyleChange(overlay.id, {
      fontFamily: design.style.fontFamily,
      fontSize: design.style.fontSize,
      color: design.style.color,
      backgroundColor: design.style.backgroundColor,
      bold: design.style.bold,
      italic: design.style.italic,
      underline: design.style.underline,
      textShadow: design.style.textShadow,
      outline: design.style.outline,
      shadow: design.style.shadow,
      gradient: design.style.gradient,
      border: design.style.border,
      borderColor: design.style.borderColor,
      borderWidth: design.style.borderWidth,
    });
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
        <div className="flex items-center gap-1 flex-wrap max-w-[600px]">
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
              {overlay.style.fontFamily.split(",")[0]}
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
                className={cn(overlay.style.fontFamily === font && "bg-accent")}
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
            {overlay.style.fontSize}
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
            <Button variant="ghost" size="icon" className="h-8 w-8 relative">
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
          className={cn("h-8 w-8", overlay.style.underline && "bg-accent")}
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

        <div className="w-px h-6 bg-border" />

        {/* List Types */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Lists"
            >
              <List className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem
              onClick={() => document.execCommand("insertUnorderedList")}
            >
              <List className="w-4 h-4 mr-2" />
              Bullet List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => document.execCommand("insertOrderedList")}
            >
              <ListOrdered className="w-4 h-4 mr-2" />
              Numbered List
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => document.execCommand("removeFormat")}
            >
              <RemoveFormatting className="w-4 h-4 mr-2" />
              Remove Formatting
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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
          <h3 className="text-sm font-semibold text-foreground">Text Designs</h3>
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
                  {textDesigns
                    .filter((d) => cat.value === "all" || d.category === cat.value)
                    .map((design) => (
                      <button
                        key={design.id}
                        onClick={() => handleApplyDesign(design)}
                        className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105 bg-background"
                      >
                        <div
                          className="w-full h-28 flex items-center justify-center p-3"
                          style={{
                            background: design.thumbnail,
                          }}
                        >
                          <span
                            className="text-2xl font-bold select-none"
                            style={{
                              fontFamily: design.style.fontFamily,
                              color: design.style.color,
                              textShadow: design.style.textShadow || 'none',
                              WebkitTextStroke: design.style.outline ? '1px currentColor' : 'none',
                            }}
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
                    ))}
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
