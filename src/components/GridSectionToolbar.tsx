// src/components/GridSectionToolbar.tsx
import React from "react";
import { Button } from "@/components/ui/button";
import {
  X,
  Palette,
  Image,
  Camera,
  Monitor,
  FileText,
  Type,
  Search,
  Link as LinkIcon,
  Unlink,
  Save,
  LayoutTemplate,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import { CanvasSectionState, DEFAULT_CAMERA_STATE } from "@/types/caption";
import { CANVAS_PRESETS } from "@/lib/canvasPresets";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssetLibrary, AssetResult } from "./AssetLibrary";
import { cn } from "@/lib/utils";

interface GridSectionToolbarProps {
  section: CanvasSectionState;
  onDelete: () => void;
  onColorChange?: (color: string) => void;
  onImageChange?: (url: string) => void;
  onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
  availableFiles?: Array<{ id: string; name: string }>;
  availableTexts?: Array<{ id: string; content: string }>;
  onFileSelect?: (fileId: string) => void;
  onTextSelect?: (textId: string) => void;
  isVisible?: boolean;
  orderIndex?: number; // 1-based index, undefined if not in order
  onToggleOrder?: () => void;
  onSetDefault?: () => void;
  onSectionContentChange?: (
    sectionId: string,
    content: CanvasSectionState["content"]
  ) => void;
}

export const GridSectionToolbar: React.FC<GridSectionToolbarProps> = ({
  section,
  onDelete,
  onColorChange,
  onGridAssetSelect,
  onImageChange,
  availableFiles = [],
  availableTexts = [],
  onFileSelect,
  onTextSelect,
  isVisible = true,
  orderIndex,
  onToggleOrder,
  onSetDefault,
  onSectionContentChange,
}) => {
  const { content } = section;

  return (
    <div
      className={`absolute top-2 right-2 flex items-center gap-1 z-[100] transition-all duration-200 ${isVisible
          ? "opacity-90 hover:opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
    >
      {/* Type-specific controls */}
      {content.type === "color" && onColorChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/95 backdrop-blur"
            >
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
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/95 backdrop-blur"
            >
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

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-background/95 backdrop-blur"
            title="Search for image"
          >
            <Search className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-80 h-[400px] p-0"
          style={{ zIndex: 9999 }}
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <AssetLibrary
            onAssetSelect={(asset) => onGridAssetSelect(section.id, asset)}
          />
        </PopoverContent>
      </Popover>

      {/* Order Toggle */}
      {onToggleOrder && (
        <Button
          variant={orderIndex !== undefined ? "default" : "secondary"}
          size="icon"
          className={cn(
            "h-8 w-8 backdrop-blur",
            orderIndex !== undefined
              ? "bg-primary text-primary-foreground"
              : "bg-background/95"
          )}
          onClick={onToggleOrder}
          title={
            orderIndex !== undefined
              ? "Remove from sequence"
              : "Add to sequence"
          }
        >
          {orderIndex !== undefined ? (
            <span className="font-bold text-xs">{orderIndex}</span>
          ) : (
            <LinkIcon className="h-4 w-4" />
          )}
        </Button>
      )}
      {/* Set Idle Default */}
      {onSetDefault && (
        <Button
          variant="secondary"
          size="icon"
          className="h-8 w-8 bg-background/95 backdrop-blur"
          onClick={onSetDefault}
          title="Save current view as Idle state"
        >
          <Save className="h-4 w-4" />
        </Button>
      )}

      {content.type === "text" && availableTexts.length > 0 && onTextSelect && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="h-8 w-8 bg-background/95 backdrop-blur"
            >
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

      {/* Canvas Design Picker (Only for Camera/Empty) */}
      {(content.type === "camera" || content.type === "empty") &&
        onSectionContentChange && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                size="icon"
                className="h-8 w-8 bg-background/95 backdrop-blur"
                title="Apply Canvas Design"
              >
                <LayoutTemplate className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-[999] bg-background w-56">
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <LayoutTemplate className="h-4 w-4 mr-2" />
                  Canvas Designs
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="max-h-[300px] overflow-y-auto">
                  {CANVAS_PRESETS.map((preset) => (
                    <DropdownMenuItem
                      key={preset.id}
                      onClick={() => {
                        onSectionContentChange(section.id, {
                          type: "camera",
                          settings: {
                            ...DEFAULT_CAMERA_STATE,
                            canvasDesignId: preset.id,
                            layoutMode: "pip",
                            pipPosition: preset.pip.pipPosition,
                            pipSize: preset.pip.pipSize,
                            sectionBackgroundColor:
                              preset.background.blankCanvasColor,
                            // Convert preset text overlays to section text overlays
                            textOverlays: preset.textOverlays.map((t) => ({
                              id: t.id,
                              content: t.content,
                              style: t.style as any,
                              layout: {
                                position: t.layout.position,
                                size: t.layout.size,
                                zIndex: t.layout.zIndex,
                                rotation: t.layout.rotation,
                                layerOrder: t.layout.layerOrder,
                              },
                            })) as any,
                            videoFilter: preset.effects.videoFilter || "none",
                            isBeautifyEnabled:
                              preset.effects.isBeautifyEnabled || false,
                            isNeonEdgeEnabled:
                              preset.effects.isNeonEdgeEnabled || false,
                            neonColor: preset.effects.neonColor || "#00FFFF",
                            neonIntensity: preset.effects.neonIntensity || 20,
                          },
                        });
                      }}
                    >
                      {preset.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>
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
