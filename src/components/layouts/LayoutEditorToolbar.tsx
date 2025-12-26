import React from "react";
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Bold,
  Italic,
  Type,
  X,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ALL_FONTS } from "@/lib/fonts";

interface LayoutEditorToolbarProps {
  focusedField: {
    id: string;
    rect: DOMRect;
    computedValues?: {
      fontSize: string;
      color: string;
      fontFamily: string;
      textAlign: string;
    };
  } | null;
  toolbarRef: React.RefObject<HTMLDivElement>;
  currentStyle: any;
  onUpdateStyle: (field: string, value: any) => void;
  onClose: () => void;
}

// Helper: Convert Computed RGB to Hex for color input
const rgbToHex = (color: string) => {
  if (!color) return "#000000";
  if (color.startsWith("#")) return color;
  const rgb = color.match(/\d+/g);
  if (!rgb) return "#000000";
  return (
    "#" +
    (
      (1 << 24) +
      (parseInt(rgb[0]) << 16) +
      (parseInt(rgb[1]) << 8) +
      parseInt(rgb[2])
    )
      .toString(16)
      .slice(1)
  );
};

export const LayoutEditorToolbar: React.FC<LayoutEditorToolbarProps> = ({
  focusedField,
  toolbarRef,
  currentStyle,
  onUpdateStyle,
  onClose,
}) => {
  if (!focusedField) return null;

  // Use computed values as fallback if no explicit style is set
  const computedSize = focusedField.computedValues?.fontSize
    ? parseInt(focusedField.computedValues.fontSize, 10).toString()
    : "16";

  const computedColor = rgbToHex(focusedField.computedValues?.color || "");
  const computedFont =
    focusedField.computedValues?.fontFamily
      ?.split(",")[0]
      .replace(/['"]/g, "") || "Inter";

  const currentFontSize = currentStyle?.fontSize || computedSize;
  const currentAlign = currentStyle?.textAlign || "left";
  const isBold = currentStyle?.bold || false;
  const isItalic = currentStyle?.italic || false;
  const currentColor = currentStyle?.color || computedColor;
  const currentFont = currentStyle?.fontFamily || computedFont;

  // Helper to change font size by delta
  const adjustFontSize = (delta: number) => {
    const currentVal = parseInt(currentFontSize) || 16;
    const newVal = Math.max(1, currentVal + delta);
    onUpdateStyle("fontSize", newVal.toString());
  };

  // --- POSITIONING LOGIC FIX ---
  const TOOLBAR_HEIGHT = 60; // Estimated height including padding/shadow
  const GAP = 12; // Gap between element and toolbar
  const MIN_TOP_OFFSET = 10; // Minimum distance from window top

  // Default: Place above the element
  let topPosition = focusedField.rect.top - TOOLBAR_HEIGHT - GAP;

  // If there isn't enough space above, place it below the element
  if (topPosition < MIN_TOP_OFFSET) {
    topPosition = focusedField.rect.bottom + GAP;
  }

  // Ensure it doesn't go off the left/right edges
  const leftPosition = Math.max(
    20,
    Math.min(window.innerWidth - 450, focusedField.rect.left)
  );
  // -----------------------------

  return (
    <div
      ref={toolbarRef}
      className="fixed px-3 py-2 bg-black text-white rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in zoom-in-95 duration-200 border border-white/10"
      style={{
        zIndex: 9999,
        top: topPosition,
        left: leftPosition,
      }}
      onMouseDown={(e) => e.stopPropagation()} // Prevent blur
    >
      {/* Font Family Selector */}
      <Popover>
        <PopoverTrigger asChild>
          <button className="flex items-center gap-1 text-sm font-medium hover:bg-white/10 px-2 py-1 rounded transition-colors max-w-[100px]">
            <span className="truncate">{currentFont}</span>
            <ChevronDown className="w-3 h-3 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-48 p-0 bg-popover" align="start">
          <ScrollArea className="h-64">
            <div className="p-1">
              {ALL_FONTS.map((font) => (
                <button
                  key={font}
                  onClick={() => onUpdateStyle("fontFamily", font)}
                  className={cn(
                    "w-full text-left px-3 py-2 text-sm rounded-md transition-colors hover:bg-accent hover:text-accent-foreground",
                    currentFont === font &&
                      "bg-accent/50 text-accent-foreground"
                  )}
                  style={{ fontFamily: font }}
                >
                  {font}
                </button>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      <div className="w-px h-4 bg-white/20" />

      {/* Font Size with +/- Buttons */}
      <div className="flex items-center gap-1 border-r border-white/20 pr-3 mr-1">
        <Type className="w-3 h-3 text-white/50 mr-1" />

        <div className="flex items-center bg-white/10 rounded-md border border-white/10">
          <button
            onClick={() => adjustFontSize(-1)}
            className="p-1.5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border-r border-white/10 rounded-l-md"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Minus className="w-3 h-3" />
          </button>

          <input
            type="text"
            className="w-10 bg-transparent text-sm font-medium text-white text-center focus:outline-none focus:bg-white/5 h-full py-0.5"
            value={currentFontSize}
            onChange={(e) => {
              const val = e.target.value;
              if (val === "" || /^\d+$/.test(val))
                onUpdateStyle("fontSize", val);
            }}
            onBlur={(e) => {
              if (!e.target.value) onUpdateStyle("fontSize", computedSize);
            }}
          />

          <button
            onClick={() => adjustFontSize(1)}
            className="p-1.5 hover:bg-white/10 text-white/70 hover:text-white transition-colors border-l border-white/10 rounded-r-md"
            onMouseDown={(e) => e.preventDefault()}
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Text Color Picker */}
      <div className="flex items-center relative group">
        <div className="w-6 h-6 rounded-full overflow-hidden border border-white/20 relative cursor-pointer hover:scale-110 transition-transform shadow-sm">
          <input
            type="color"
            value={currentColor}
            onChange={(e) => onUpdateStyle("color", e.target.value)}
            className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 p-0 m-0 cursor-pointer opacity-0"
          />
          <div
            className="w-full h-full pointer-events-none"
            style={{ backgroundColor: currentColor }}
          />
        </div>
      </div>

      <div className="w-px h-4 bg-white/20" />

      {/* Alignment */}
      <div className="flex items-center bg-white/10 rounded-lg p-0.5 gap-0.5">
        <button
          onClick={() => onUpdateStyle("textAlign", "left")}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            currentAlign === "left" ? "bg-white/20" : "hover:bg-white/5"
          )}
        >
          <AlignLeft className="w-3 h-3" />
        </button>
        <button
          onClick={() => onUpdateStyle("textAlign", "center")}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            currentAlign === "center" ? "bg-white/20" : "hover:bg-white/5"
          )}
        >
          <AlignCenter className="w-3 h-3" />
        </button>
        <button
          onClick={() => onUpdateStyle("textAlign", "right")}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            currentAlign === "right" ? "bg-white/20" : "hover:bg-white/5"
          )}
        >
          <AlignRight className="w-3 h-3" />
        </button>
      </div>

      {/* Formatting */}
      <div className="flex items-center gap-1">
        <button
          onClick={() => onUpdateStyle("bold", !isBold)}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            isBold ? "bg-white text-black" : "hover:bg-white/10"
          )}
        >
          <Bold className="w-3 h-3" />
        </button>
        <button
          onClick={() => onUpdateStyle("italic", !isItalic)}
          className={cn(
            "p-1.5 rounded-md transition-colors",
            isItalic ? "bg-white text-black" : "hover:bg-white/10"
          )}
        >
          <Italic className="w-3 h-3" />
        </button>
      </div>

      <button
        onClick={onClose}
        className="ml-auto p-1 hover:bg-white/20 rounded-full text-white/50 hover:text-white transition-colors"
      >
        <X className="w-3 h-3" />
      </button>
    </div>
  );
};
