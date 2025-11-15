// src/components/GridSectionToolbar.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import { X, Palette, Image, Camera, Monitor, FileText, Type } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CanvasSectionState } from "@/types/caption";

interface GridSectionToolbarProps {
  section: CanvasSectionState;
  onDelete: () => void;
  onColorChange?: (color: string) => void;
  onImageChange?: (url: string) => void;
  availableFiles?: Array<{ id: string; name: string }>;
  availableTexts?: Array<{ id: string; content: string }>;
  onFileSelect?: (fileId: string) => void;
  onTextSelect?: (textId: string) => void;
}

export const GridSectionToolbar: React.FC<GridSectionToolbarProps> = ({
  section,
  onDelete,
  onColorChange,
  onImageChange,
  availableFiles = [],
  availableTexts = [],
  onFileSelect,
  onTextSelect,
}) => {
  const { content } = section;

  return (
    <div className="absolute top-2 right-2 flex gap-1 z-[100] opacity-90 hover:opacity-100 transition-opacity">
      {/* Type-specific controls */}
      {content.type === "color" && onColorChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/95 backdrop-blur">
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[999] bg-background">
            <div className="p-2">
              <input
                type="color"
                value={content.color || "#000000"}
                onChange={(e) => onColorChange(e.target.value)}
                className="w-full h-8 cursor-pointer"
              />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {content.type === "image" && onImageChange && (
        <Button 
          variant="secondary" 
          size="icon" 
          className="h-8 w-8 bg-background/95 backdrop-blur"
          onClick={() => {
            const url = prompt("Enter image URL:");
            if (url) onImageChange(url);
          }}
        >
          <Image className="h-4 w-4" />
        </Button>
      )}

      {content.type === "file" && availableFiles.length > 0 && onFileSelect && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/95 backdrop-blur">
              <FileText className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[999] bg-background">
            {availableFiles.map((file) => (
              <DropdownMenuItem
                key={file.id}
                onClick={() => onFileSelect(file.id)}
              >
                {file.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {content.type === "text" && availableTexts.length > 0 && onTextSelect && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="h-8 w-8 bg-background/95 backdrop-blur">
              <Type className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="z-[999] bg-background">
            {availableTexts.map((text) => (
              <DropdownMenuItem
                key={text.id}
                onClick={() => onTextSelect(text.id)}
              >
                {text.content.substring(0, 30)}...
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Delete button */}
      <Button
        variant="destructive"
        size="icon"
        className="h-8 w-8 bg-destructive/95 backdrop-blur"
        onClick={onDelete}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};
