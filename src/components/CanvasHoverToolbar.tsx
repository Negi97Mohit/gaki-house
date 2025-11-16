import { Paintbrush, Upload, Grid3x3, Search } from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
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
import { getLayoutTemplates, CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssetLibrary, AssetResult } from "./AssetLibrary";
import { CanvasLayoutState } from "@/types/caption";

interface CanvasHoverToolbarProps {
  blankCanvasColor: string;
  onBlankCanvasColorChange: (color: string) => void;
  isVisible: boolean;
  onCanvasBackgroundUpload: (file: File) => void;
  canvasLayout: CanvasLayoutState | null;
  onCanvasLayoutChange?: (layout: CanvasLayoutState) => void;
  onCanvasBackgroundAssetSelect: (asset: AssetResult) => void;
}

export const CanvasHoverToolbar = ({
  blankCanvasColor,
  onBlankCanvasColorChange,
  isVisible,
  onCanvasBackgroundUpload,
  canvasLayout,
  onCanvasBackgroundAssetSelect,
  onCanvasLayoutChange,
}: CanvasHoverToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [layoutTemplates, setLayoutTemplates] = useState<
    CanvasLayoutTemplate[]
  >([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);

  useEffect(() => {
    getLayoutTemplates()
      .then(({ list }) => {
        setLayoutTemplates(list);
      })
      .catch((err) => {
        console.error("Failed to load layout templates", err);
      })
      .finally(() => {
        setTemplatesLoading(false);
      });
  }, []);
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onCanvasBackgroundUpload(file);
    }
  };

  const handleLayoutSelect = (templateId: string) => {
    if (!onCanvasLayoutChange) return;

    const template = layoutTemplates.find((t) => t.id === templateId);
    if (!template) {
      console.error(`Layout template with id ${templateId} not found.`);
      return;
    }

    const newLayout: CanvasLayoutState = {
      templateId,
      sections: template.sections.map((s) => ({
        id: s.id,
        content: { type: "empty" as const },
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
      {!canvasLayout && (
        <>
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
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 h-[400px] p-0"
              style={{ zIndex: "var(--z-asset-popover)" }}
              align="center"
              side="bottom"
            >
              <AssetLibrary onAssetSelect={onCanvasBackgroundAssetSelect} />
            </PopoverContent>
          </Popover>
        </>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="text-xs">
            <Grid3x3 className="h-4 w-4 mr-2" />
            {canvasLayout
              ? layoutTemplates.find((t) => t.id === canvasLayout.templateId)
                  ?.name || "Layout"
              : "Grid"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-[999] bg-background max-h-[400px] overflow-y-auto">
          {templatesLoading && (
            <DropdownMenuItem disabled>Loading layouts...</DropdownMenuItem>
          )}
          {layoutTemplates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleLayoutSelect(template.id)}
            >
              {template.name}
              {canvasLayout?.templateId === template.id && " ✓"}
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
