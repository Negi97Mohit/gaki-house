// src/components/banner-editor/BannerTextToolbar.tsx
import React from "react";
import { motion } from "framer-motion";
import { Bold, Italic, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BannerTextToolbarProps {
  fontSize: number;
  fontFamily: string;
  color: string;
  fontWeight: string;
  onFontSizeChange: (size: number) => void;
  onFontFamilyChange: (family: string) => void;
  onColorChange: (color: string) => void;
  onFontWeightChange: (weight: string) => void;
  position: { x: number; y: number };
}

const FONT_OPTIONS = [
  { value: "Inter", label: "Inter" },
  { value: "Arial", label: "Arial" },
  { value: "Georgia", label: "Georgia" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times" },
  { value: "Courier New", label: "Courier" },
  { value: "Verdana", label: "Verdana" },
  { value: "Impact", label: "Impact" },
];

export const BannerTextToolbar: React.FC<BannerTextToolbarProps> = ({
  fontSize,
  fontFamily,
  color,
  fontWeight,
  onFontSizeChange,
  onFontFamilyChange,
  onColorChange,
  onFontWeightChange,
  position,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      className="absolute bg-background/95 backdrop-blur-md border border-border rounded-lg shadow-xl p-2 flex items-center gap-2"
      style={{
        left: position.x,
        top: position.y < 60 ? position.y + 20 : position.y - 50, // Flip down if too close to top
        transform: "translateX(-50%)",
        zIndex: 9999, // Ensure it sits on top of everything
        pointerEvents: "auto",
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()} // Critical: Prevents drag initiation
    >
      {/* Font Family */}
      <Select value={fontFamily} onValueChange={onFontFamilyChange}>
        <SelectTrigger className="w-24 h-7 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="z-[9999]">
          {" "}
          {/* Ensure dropdown is on top */}
          {FONT_OPTIONS.map((font) => (
            <SelectItem
              key={font.value}
              value={font.value}
              style={{ fontFamily: font.value }}
            >
              {font.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="w-px h-5 bg-border" />

      {/* Font Size */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onFontSizeChange(Math.max(8, fontSize - 2))}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className="text-xs w-8 text-center">{fontSize}</span>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => onFontSizeChange(Math.min(120, fontSize + 2))}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>

      <div className="w-px h-5 bg-border" />

      {/* Bold */}
      <Button
        variant={fontWeight === "bold" ? "secondary" : "ghost"}
        size="icon"
        className="h-7 w-7"
        onClick={() =>
          onFontWeightChange(fontWeight === "bold" ? "normal" : "bold")
        }
      >
        <Bold className="w-3 h-3" />
      </Button>

      {/* Color */}
      <div className="relative flex items-center justify-center">
        <input
          type="color"
          value={color.startsWith("#") ? color : "#ffffff"}
          onChange={(e) => onColorChange(e.target.value)}
          className="w-6 h-6 p-0 border-0 rounded-full cursor-pointer overflow-hidden"
          style={{ padding: 0 }}
        />
        {/* Custom ring to make the color picker look better */}
        <div className="absolute inset-0 rounded-full border border-border pointer-events-none" />
      </div>
    </motion.div>
  );
};
