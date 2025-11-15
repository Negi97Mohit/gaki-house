import { Paintbrush, Upload, Grid3x3 } from "lucide-react";
import React, { useRef, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { LAYOUT_TEMPLATES } from "@/lib/canvasLayouts";
import { CanvasLayoutState } from "@/types/caption";

interface CanvasHoverToolbarProps {
  blankCanvasColor: string;
  onBlankCanvasColorChange: (color: string) => void;
  isVisible: boolean;
  onCanvasBackgroundUpload: (file: File) => void;
  canvasLayout: CanvasLayoutState | null;
  onCanvasLayoutChange?: (layout: CanvasLayoutState) => void;
}

export const CanvasHoverToolbar = ({
  blankCanvasColor,
  onBlankCanvasColorChange,
  isVisible,
  onCanvasBackgroundUpload,
  canvasLayout,
  onCanvasLayoutChange,
}: CanvasHoverToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCanvasBackgroundUpload(file);
    }
  };

  const handleLayoutSelect = (templateId: string) => {
    if (!onCanvasLayoutChange) return;
    
    const template = LAYOUT_TEMPLATES[templateId];
    const newLayout: CanvasLayoutState = {
      templateId,
      sections: template.sections.map(s => ({
        id: s.id,
        content: { type: 'empty' as const },
      })),
    };
    onCanvasLayoutChange(newLayout);
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
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs">
            <Grid3x3 className="h-4 w-4 mr-2" />
            {canvasLayout ? LAYOUT_TEMPLATES[canvasLayout.templateId]?.name || 'Layout' : 'Grid'}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[999] bg-background">
          {Object.values(LAYOUT_TEMPLATES).map(template => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleLayoutSelect(template.id)}
            >
              {template.name}
              {canvasLayout?.templateId === template.id && ' ✓'}
            </DropdownMenuItem>
          ))}
          {canvasLayout && (
            <DropdownMenuItem
              onClick={() => onCanvasLayoutChange?.(null as any)}
              className="text-destructive"
            >
              Clear Grid
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
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
