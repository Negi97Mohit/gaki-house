import { Paintbrush, Upload } from "lucide-react";
import React, { useRef } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

interface CanvasHoverToolbarProps {
  blankCanvasColor: string;
  onBlankCanvasColorChange: (color: string) => void;
  isVisible: boolean;
  onCanvasBackgroundUpload: (file: File) => void;
}

export const CanvasHoverToolbar = ({
  blankCanvasColor,
  onBlankCanvasColorChange,
  isVisible,
  onCanvasBackgroundUpload,
}: CanvasHoverToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCanvasBackgroundUpload(file);
    }
  };

  return (
    <div
      className={cn(
        "absolute top-2 left-1/2 -translate-x-1/2 z-50",
        "bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg",
        "px-2 py-2 flex items-center gap-1",
        "transition-all duration-300",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
      <div className="flex items-center gap-2 pr-2 border-r border-border">
        <Label htmlFor="canvas-color" className="text-xs whitespace-nowrap">
          BG
        </Label>
        <Input
          id="canvas-color"
          type="color"
          value={blankCanvasColor}
          onChange={(e) => onBlankCanvasColorChange(e.target.value)}
          className="w-16 h-8 cursor-pointer"
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  );
};
