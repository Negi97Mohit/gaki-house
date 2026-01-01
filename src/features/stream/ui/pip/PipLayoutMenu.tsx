import React from "react";
import { Layout, Grid3X3 } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { CameraShape } from "@/types/caption";

export interface PipLayoutPreset {
  id: string;
  name: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  shape: CameraShape;
  aspectRatio: string;
  thumbnail: React.ReactNode;
}

// Predefined PIP layout presets
export const PIP_LAYOUT_PRESETS: PipLayoutPreset[] = [
  // Bottom Right Layouts
  {
    id: "br-circle-small",
    name: "Circle Small",
    position: { x: 75, y: 70 },
    size: { width: 20, height: 25 },
    shape: "circle",
    aspectRatio: "1:1",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-primary/60" />
      </div>
    ),
  },
  {
    id: "br-circle-medium",
    name: "Circle Medium",
    position: { x: 65, y: 55 },
    size: { width: 30, height: 35 },
    shape: "circle",
    aspectRatio: "1:1",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute bottom-1 right-1 w-5 h-5 rounded-full bg-primary/60" />
      </div>
    ),
  },
  {
    id: "br-rounded-small",
    name: "Rounded Small",
    position: { x: 72, y: 68 },
    size: { width: 25, height: 28 },
    shape: "rounded",
    aspectRatio: "16:9",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute bottom-1 right-1 w-5 h-3 rounded-sm bg-primary/60" />
      </div>
    ),
  },
  {
    id: "br-rounded-medium",
    name: "Rounded Medium",
    position: { x: 60, y: 55 },
    size: { width: 35, height: 38 },
    shape: "rounded",
    aspectRatio: "16:9",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute bottom-1 right-1 w-6 h-4 rounded-sm bg-primary/60" />
      </div>
    ),
  },
  // Bottom Left Layouts
  {
    id: "bl-circle-small",
    name: "BL Circle",
    position: { x: 5, y: 70 },
    size: { width: 20, height: 25 },
    shape: "circle",
    aspectRatio: "1:1",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute bottom-1 left-1 w-4 h-4 rounded-full bg-primary/60" />
      </div>
    ),
  },
  {
    id: "bl-rounded-small",
    name: "BL Rounded",
    position: { x: 3, y: 68 },
    size: { width: 25, height: 28 },
    shape: "rounded",
    aspectRatio: "16:9",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute bottom-1 left-1 w-5 h-3 rounded-sm bg-primary/60" />
      </div>
    ),
  },
  // Top Right Layouts
  {
    id: "tr-circle-small",
    name: "TR Circle",
    position: { x: 75, y: 5 },
    size: { width: 20, height: 25 },
    shape: "circle",
    aspectRatio: "1:1",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary/60" />
      </div>
    ),
  },
  {
    id: "tr-rounded-small",
    name: "TR Rounded",
    position: { x: 72, y: 3 },
    size: { width: 25, height: 28 },
    shape: "rounded",
    aspectRatio: "16:9",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute top-1 right-1 w-5 h-3 rounded-sm bg-primary/60" />
      </div>
    ),
  },
  // Top Left Layouts
  {
    id: "tl-circle-small",
    name: "TL Circle",
    position: { x: 5, y: 5 },
    size: { width: 20, height: 25 },
    shape: "circle",
    aspectRatio: "1:1",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute top-1 left-1 w-4 h-4 rounded-full bg-primary/60" />
      </div>
    ),
  },
  {
    id: "tl-rounded-small",
    name: "TL Rounded",
    position: { x: 3, y: 3 },
    size: { width: 25, height: 28 },
    shape: "rounded",
    aspectRatio: "16:9",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute top-1 left-1 w-5 h-3 rounded-sm bg-primary/60" />
      </div>
    ),
  },
  // Side Layouts
  {
    id: "left-strip",
    name: "Left Strip",
    position: { x: 2, y: 25 },
    size: { width: 22, height: 50 },
    shape: "rounded",
    aspectRatio: "9:16",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded-sm bg-primary/60" />
      </div>
    ),
  },
  {
    id: "right-strip",
    name: "Right Strip",
    position: { x: 76, y: 25 },
    size: { width: 22, height: 50 },
    shape: "rounded",
    aspectRatio: "9:16",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute right-1 top-1/2 -translate-y-1/2 w-2 h-6 rounded-sm bg-primary/60" />
      </div>
    ),
  },
  // Large/Centered Layouts
  {
    id: "center-large",
    name: "Center Large",
    position: { x: 25, y: 20 },
    size: { width: 50, height: 60 },
    shape: "rounded",
    aspectRatio: "16:9",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute inset-2 rounded-sm bg-primary/60" />
      </div>
    ),
  },
  {
    id: "bottom-bar",
    name: "Bottom Bar",
    position: { x: 15, y: 70 },
    size: { width: 70, height: 25 },
    shape: "rounded",
    aspectRatio: "21:9",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute bottom-1 left-2 right-2 h-2 rounded-sm bg-primary/60" />
      </div>
    ),
  },
  // Split Screen Layouts
  {
    id: "split-right",
    name: "Split Right",
    position: { x: 52, y: 5 },
    size: { width: 45, height: 90 },
    shape: "rectangle",
    aspectRatio: "free",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute right-0 top-0.5 bottom-0.5 w-1/2 bg-primary/60" />
      </div>
    ),
  },
  {
    id: "split-left",
    name: "Split Left",
    position: { x: 3, y: 5 },
    size: { width: 45, height: 90 },
    shape: "rectangle",
    aspectRatio: "free",
    thumbnail: (
      <div className="w-full h-full bg-muted/30 relative">
        <div className="absolute left-0 top-0.5 bottom-0.5 w-1/2 bg-primary/60" />
      </div>
    ),
  },
];

interface PipLayoutMenuProps {
  currentPresetId?: string;
  onPresetSelect: (preset: PipLayoutPreset) => void;
  onPositionChange: (position: { x: number; y: number }) => void;
  onSizeChange: (size: { width: number; height: number }) => void;
  onShapeChange: (shape: CameraShape) => void;
  onAspectRatioChange: (ratio: string) => void;
}

export const PipLayoutMenu: React.FC<PipLayoutMenuProps> = ({
  currentPresetId,
  onPresetSelect,
}) => {
  const handlePresetClick = (preset: PipLayoutPreset) => {
    onPresetSelect(preset);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 rounded-xl hover:bg-background/60"
          title="PIP Layout"
        >
          <Layout className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="start"
          className="z-[var(--z-text-toolbar)] w-80 max-h-[500px] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40 p-2"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          <DropdownMenuLabel className="text-xs font-semibold px-1">
            Corner Layouts
          </DropdownMenuLabel>
          <div className="grid grid-cols-4 gap-1.5 p-1">
            {PIP_LAYOUT_PRESETS.slice(0, 10).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "aspect-video rounded-lg border-2 transition-all hover:scale-105 hover:border-primary overflow-hidden",
                  currentPresetId === preset.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border/40"
                )}
                title={preset.name}
              >
                {preset.thumbnail}
              </button>
            ))}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-semibold px-1">
            Side & Strip Layouts
          </DropdownMenuLabel>
          <div className="grid grid-cols-4 gap-1.5 p-1">
            {PIP_LAYOUT_PRESETS.slice(10, 12).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "aspect-video rounded-lg border-2 transition-all hover:scale-105 hover:border-primary overflow-hidden",
                  currentPresetId === preset.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border/40"
                )}
                title={preset.name}
              >
                {preset.thumbnail}
              </button>
            ))}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuLabel className="text-xs font-semibold px-1">
            Large & Split Layouts
          </DropdownMenuLabel>
          <div className="grid grid-cols-4 gap-1.5 p-1">
            {PIP_LAYOUT_PRESETS.slice(12).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePresetClick(preset)}
                className={cn(
                  "aspect-video rounded-lg border-2 transition-all hover:scale-105 hover:border-primary overflow-hidden",
                  currentPresetId === preset.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-border/40"
                )}
                title={preset.name}
              >
                {preset.thumbnail}
              </button>
            ))}
          </div>

          <DropdownMenuSeparator />

          <div className="p-2">
            <p className="text-[10px] text-muted-foreground text-center">
              Click a layout to apply • Drag PIP to customize
            </p>
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
