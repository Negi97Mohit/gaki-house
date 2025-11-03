// src/components/TextEditingToolbar.tsx
import React, { useState, useRef, useLayoutEffect } from "react";
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
  RemoveFormatting, // ADDED
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TextOverlayState } from "@/types/caption";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TextEditingToolbarProps {
  overlay: TextOverlayState;
  onStyleChange: (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => void; // removed onContentChange
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLElement>;
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

  return (
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
  );
};
