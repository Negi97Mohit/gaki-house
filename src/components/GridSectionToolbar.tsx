import React from "react";
import { Button } from "@/components/ui/button";
import {
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
  MinusCircle,
  Check,
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
import { useCanvasPresets } from "@/hooks/useCanvasPresets";
import { CanvasPreset } from "@/types/canvasPreset";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssetLibrary, AssetResult } from "./AssetLibrary";
import { cn } from "@/lib/utils";
import { SearchButton } from "./layouts/dynamic/core/SearchButton";
import { usePreviewMode } from "./layouts/dynamic/core/PreviewModeContext";

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

// NEW: Helper component to handle scroll-on-mount behavior for the submenu
const CanvasDesignList = ({
  activeId,
  onSelect,
}: {
  activeId?: string;
  onSelect: (preset: CanvasPreset) => void;
}) => {
  const { systemPresets: CANVAS_PRESETS } = useCanvasPresets(); // --- ADDED
  const itemRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  React.useEffect(() => {
    // When the submenu mounts, scroll the active item into view
    if (activeId && itemRefs.current[activeId]) {
      // Small timeout to ensure layout is calculated after mount animation
      setTimeout(() => {
        itemRefs.current[activeId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [activeId]);

  return (
    <>
      {CANVAS_PRESETS.map((preset) => (
        <DropdownMenuItem
          key={preset.id}
          // Attach ref for scrolling
          ref={(el) => (itemRefs.current[preset.id] = el)}
          onClick={() => onSelect(preset)}
          className={cn(
            "flex items-center justify-between gap-2 cursor-pointer",
            activeId === preset.id &&
            "bg-accent text-accent-foreground font-medium"
          )}
        >
          <span>{preset.name}</span>
          {activeId === preset.id && <Check className="w-3 h-3 opacity-70" />}
        </DropdownMenuItem>
      ))}
    </>
  );
};

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
  const isPreview = usePreviewMode();

  // Don't render any toolbar controls in preview mode to avoid nested button issues
  if (isPreview) return null;

  // Common styles for all toolbar buttons to ensure visibility on all backgrounds
  const buttonClass =
    "h-8 w-8 bg-white/90 backdrop-blur border border-black/10 shadow-sm hover:bg-white hover:shadow-md transition-all text-black/80";

  return (
    <div
      className={cn(
        // Moved from 'right-2' to 'left-2' to avoid conflict with DynamicDeleteButton (which is usually top-right)
        "absolute top-2 left-2 flex items-center gap-1 z-[100] transition-all duration-200",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
      {/* Type-specific controls */}
      {content.type === "color" && onColorChange && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className={buttonClass}>
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
          className={buttonClass}
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
            <Button variant="secondary" size="icon" className={buttonClass}>
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

      {/* Centralized Search Button */}
      <SearchButton
        sectionId={section.id}
        onAssetSelect={onGridAssetSelect}
        className={buttonClass}
      />

      {/* Order Toggle */}
      {onToggleOrder && (
        <Button
          variant={orderIndex !== undefined ? "default" : "secondary"}
          size="icon"
          className={cn(
            buttonClass,
            orderIndex !== undefined
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : ""
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
          className={buttonClass}
          onClick={onSetDefault}
          title="Save current view as Idle state"
        >
          <Save className="h-4 w-4" />
        </Button>
      )}

      {content.type === "text" && availableTexts.length > 0 && onTextSelect && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className={buttonClass}>
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
                className={buttonClass}
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
                  {/* REPLACED inline map with CanvasDesignList component */}
                  <CanvasDesignList
                    activeId={
                      content.type === "camera"
                        ? content.settings?.canvasDesignId
                        : undefined
                    }
                    onSelect={(preset) => {
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
                          textOverlays: preset.textOverlays.map((t: any) => ({
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
                  />
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

      {/* Remove Content Button (Only if content is NOT empty) */}
      {content.type !== "empty" && onSectionContentChange && (
        <Button
          variant="secondary"
          size="icon"
          className={cn(
            buttonClass,
            "hover:bg-red-50 hover:text-red-600 hover:border-red-200"
          )}
          onClick={() => onSectionContentChange(section.id, { type: "empty" })}
          title="Clear Content"
        >
          <MinusCircle className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
};
