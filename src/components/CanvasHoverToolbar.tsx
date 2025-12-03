// src/components/CanvasHoverToolbar.tsx
import {
  Paintbrush,
  Upload,
  Grid3x3,
  Search,
  Check,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
} from "lucide-react";
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
import { GridLayoutPreview } from "./GridLayoutPreview";

interface CanvasHoverToolbarProps {
  blankCanvasColor: string;
  onBlankCanvasColorChange: (color: string) => void;
  isVisible: boolean;
  isMouseActive?: boolean;
  onCanvasBackgroundUpload: (file: File) => void;
  canvasLayout: CanvasLayoutState | null;
  onCanvasLayoutChange?: (layout: CanvasLayoutState) => void;
  onCanvasBackgroundAssetSelect: (asset: AssetResult) => void;
  activeSequenceId?: string | null;
}

export const CanvasHoverToolbar = ({
  blankCanvasColor,
  onBlankCanvasColorChange,
  isVisible,
  isMouseActive = true,
  onCanvasBackgroundUpload,
  canvasLayout,
  onCanvasBackgroundAssetSelect,
  onCanvasLayoutChange,
  activeSequenceId,
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
      sectionOrder: [],
    };
    onCanvasLayoutChange(newLayout);
  };

  // Helper to move items in the order array
  const moveItem = (index: number, direction: "up" | "down") => {
    if (!canvasLayout?.sectionOrder || !onCanvasLayoutChange) return;

    const newOrder = [...canvasLayout.sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newOrder.length) return;

    [newOrder[index], newOrder[targetIndex]] = [
      newOrder[targetIndex],
      newOrder[index],
    ];

    onCanvasLayoutChange({
      ...canvasLayout,
      sectionOrder: newOrder,
    });
  };

  const removeFromOrder = (id: string) => {
    if (!canvasLayout?.sectionOrder || !onCanvasLayoutChange) return;
    onCanvasLayoutChange({
      ...canvasLayout,
      sectionOrder: canvasLayout.sectionOrder.filter((x) => x !== id),
    });
  };

  // Check if current layout is a carousel type
  const isCarouselLayout = canvasLayout?.templateId?.includes("carousel");

  // Rotate carousel content (shift section content assignments)
  const rotateCarousel = (direction: "left" | "right") => {
    if (!canvasLayout || !onCanvasLayoutChange) return;

    // Get the current template
    const template = layoutTemplates.find(
      (t) => t.id === canvasLayout.templateId
    );
    if (!template) return;

    const sectionIds = template.sections.map((s) => s.id);
    const currentSections = [...canvasLayout.sections];

    // Create a mapping of section ID to content
    const contentMap = new Map(currentSections.map((s) => [s.id, s.content]));

    // Rotate the content assignments
    const rotatedSections = sectionIds.map((id, index) => {
      let sourceIndex =
        direction === "right"
          ? (index - 1 + sectionIds.length) % sectionIds.length
          : (index + 1) % sectionIds.length;

      const sourceId = sectionIds[sourceIndex];
      const content = contentMap.get(sourceId) || { type: "empty" as const };

      return {
        id,
        content,
        savedCameraSettings: currentSections.find((s) => s.id === sourceId)
          ?.savedCameraSettings,
        defaultContent: currentSections.find((s) => s.id === sourceId)
          ?.defaultContent,
      };
    });

    onCanvasLayoutChange({
      ...canvasLayout,
      sections: rotatedSections,
    });
  };

  // Check if layout has dynamic transformations
  const layoutId = canvasLayout?.templateId || "";
  const hasTransformations =
    isCarouselLayout ||
    layoutId.includes("magazine") ||
    layoutId.includes("bento") ||
    layoutId.includes("staircase") ||
    layoutId.includes("diagonal") ||
    layoutId.includes("spotlight") ||
    layoutId.includes("pip-creative");

  // Generic transformation function
  const transformLayout = (type: "rotate" | "flip" | "swap" | "reverse") => {
    if (!canvasLayout || !onCanvasLayoutChange) return;

    const template = layoutTemplates.find(
      (t) => t.id === canvasLayout.templateId
    );
    if (!template) return;

    const sectionIds = template.sections.map((s) => s.id);
    const currentSections = [...canvasLayout.sections];
    const contentMap = new Map(currentSections.map((s) => [s.id, s.content]));

    let transformedSections = [...currentSections];

    // Magazine Hero: Swap hero with first sidebar
    if (layoutId === "magazine-hero" && type === "swap") {
      const heroContent = contentMap.get("hero");
      const sidebar1Content = contentMap.get("sidebar-1");
      transformedSections = currentSections.map((s) => {
        if (s.id === "hero")
          return {
            ...s,
            content: sidebar1Content || { type: "empty" as const },
          };
        if (s.id === "sidebar-1")
          return { ...s, content: heroContent || { type: "empty" as const } };
        return s;
      });
    }

    // Bento Box / Staircase / Diagonal: Rotate all
    else if (
      (layoutId.includes("bento") ||
        layoutId.includes("staircase") ||
        layoutId.includes("diagonal")) &&
      type === "rotate"
    ) {
      transformedSections = sectionIds.map((id, index) => {
        const sourceIndex = (index + 1) % sectionIds.length;
        const sourceId = sectionIds[sourceIndex];
        const content = contentMap.get(sourceId) || { type: "empty" as const };
        return {
          id,
          content,
          savedCameraSettings: currentSections.find((s) => s.id === sourceId)
            ?.savedCameraSettings,
          defaultContent: currentSections.find((s) => s.id === sourceId)
            ?.defaultContent,
        };
      });
    }

    // Spotlight Frame: Rotate frame positions
    else if (layoutId === "spotlight-frame" && type === "rotate") {
      const frameIds = ["top", "right", "bottom", "left"];
      const frameContents = frameIds.map((id) => contentMap.get(id));
      transformedSections = currentSections.map((s) => {
        const frameIndex = frameIds.indexOf(s.id);
        if (frameIndex !== -1) {
          const nextIndex = (frameIndex + 1) % frameIds.length;
          return {
            ...s,
            content: frameContents[nextIndex] || { type: "empty" as const },
          };
        }
        return s;
      });
    }

    // PiP Creative: Cycle PiP positions
    else if (layoutId === "pip-creative" && type === "rotate") {
      const pipIds = ["pip-1", "pip-2", "pip-3"];
      const pipContents = pipIds.map((id) => contentMap.get(id));
      transformedSections = currentSections.map((s) => {
        const pipIndex = pipIds.indexOf(s.id);
        if (pipIndex !== -1) {
          const nextIndex = (pipIndex + 1) % pipIds.length;
          return {
            ...s,
            content: pipContents[nextIndex] || { type: "empty" as const },
          };
        }
        return s;
      });
    }

    // Staircase: Reverse order
    else if (layoutId.includes("staircase") && type === "reverse") {
      const reversedIds = [...sectionIds].reverse();
      transformedSections = sectionIds.map((id, index) => {
        const sourceId = reversedIds[index];
        const content = contentMap.get(sourceId) || { type: "empty" as const };
        return {
          id,
          content,
          savedCameraSettings: currentSections.find((s) => s.id === sourceId)
            ?.savedCameraSettings,
          defaultContent: currentSections.find((s) => s.id === sourceId)
            ?.defaultContent,
        };
      });
    }

    onCanvasLayoutChange({
      ...canvasLayout,
      sections: transformedSections,
    });
  };

  const shouldShow = isVisible && isMouseActive;

  return (
    <div
      className={cn(
        "absolute top-6 left-1/2 -translate-x-1/2 z-50",
        "bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg",
        "px-2 py-2 flex items-center gap-1",
        "transition-all duration-300",
        shouldShow
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
        <DropdownMenuContent className="z-[999] bg-background max-h-[400px] overflow-y-auto w-64 p-2">
          {templatesLoading && (
            <DropdownMenuItem disabled>Loading layouts...</DropdownMenuItem>
          )}

          {canvasLayout && (
            <DropdownMenuItem
              onClick={() => onCanvasLayoutChange?.(null as any)}
              className="text-destructive mb-1"
            >
              Clear Grid
            </DropdownMenuItem>
          )}

          {layoutTemplates.map((template) => (
            <DropdownMenuItem
              key={template.id}
              onClick={() => handleLayoutSelect(template.id)}
              className="flex flex-col items-start gap-2 p-2 cursor-pointer"
            >
              <GridLayoutPreview sections={template.sections} />
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-medium">{template.name}</span>
                {canvasLayout?.templateId === template.id && (
                  <Check className="w-4 h-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dynamic Layout Transformation Controls */}
      {hasTransformations && canvasLayout && (
        <div className="flex items-center gap-1 border-l pl-2">
          {isCarouselLayout && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2"
                onClick={() => rotateCarousel("left")}
                title="Rotate carousel left"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-8 px-2"
                onClick={() => rotateCarousel("right")}
                title="Rotate carousel right"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {layoutId === "magazine-hero" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => transformLayout("swap")}
              title="Swap hero and sidebar"
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Swap
            </Button>
          )}

          {(layoutId.includes("bento") ||
            layoutId.includes("staircase") ||
            layoutId.includes("diagonal")) && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => transformLayout("rotate")}
              title="Rotate sections"
            >
              <RotateCw className="h-4 w-4 mr-1" />
              Rotate
            </Button>
          )}

          {layoutId.includes("staircase") && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => transformLayout("reverse")}
              title="Reverse order"
            >
              <ChevronLeft className="h-3 w-3" />
              <ChevronRight className="h-3 w-3" />
            </Button>
          )}

          {(layoutId === "spotlight-frame" || layoutId === "pip-creative") && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => transformLayout("rotate")}
              title={
                layoutId === "spotlight-frame" ? "Rotate frame" : "Cycle PiP"
              }
            >
              <RotateCw className="h-4 w-4 mr-1" />
              {layoutId === "spotlight-frame" ? "Frame" : "Cycle"}
            </Button>
          )}
        </div>
      )}

      {/* Sequence Reorder Popup */}
      {canvasLayout &&
        canvasLayout.sectionOrder &&
        canvasLayout.sectionOrder.length > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="text-xs">
                <ListOrdered className="h-4 w-4 mr-2" />
                Sequence
                <span className="ml-1.5 bg-primary text-primary-foreground text-[10px] rounded-full px-1.5 h-4 flex items-center">
                  {canvasLayout.sectionOrder.length}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="center" side="bottom">
              <div className="space-y-2">
                <h4 className="font-medium text-xs text-muted-foreground px-2 mb-2">
                  Screen Order
                </h4>
                {canvasLayout.sectionOrder.map((sectionId, idx) => {
                  const isActive = sectionId === activeSequenceId;
                  return (
                    <div
                      key={sectionId}
                      className={cn(
                        "flex items-center justify-between p-2 rounded-md text-sm group transition-colors",
                        isActive
                          ? "bg-primary/10 border border-primary/20"
                          : "bg-muted/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-bold w-4 text-center",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                        >
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[100px]">
                          {sectionId}
                        </span>
                        {isActive && (
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-red-500 text-[9px] font-bold text-white animate-pulse">
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          disabled={idx === 0}
                          onClick={() => moveItem(idx, "up")}
                        >
                          <ArrowUp className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          disabled={
                            idx === canvasLayout.sectionOrder!.length - 1
                          }
                          onClick={() => moveItem(idx, "down")}
                        >
                          <ArrowDown className="h-3 w-3" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6 text-destructive hover:text-destructive"
                          onClick={() => removeFromOrder(sectionId)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        )}

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
