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
  Sparkles,
  Zap,
  Layout,
  Layers,
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";
import { AIChatbot } from "@/features/ai-assistant/ui/AIChatbot";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/lib/utils";
import { DropdownMenuContent } from "@/shared/ui/dropdown-menu";
import { CanvasLayoutTemplate } from "@/types/layout";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { AssetLibrary, AssetResult } from "@/features/assets/ui/AssetLibrary";
import { CanvasLayoutState } from "@/types/caption";
import { GridLayoutPreview } from "@/features/layouts/ui/GridLayoutPreview";
import { useLayoutTemplates } from "@/features/layouts/hooks/useLayoutTemplates";

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
  isTextDepthEnabled?: boolean;
  onTextDepthToggle?: (enabled: boolean) => void;
  isChatbotOpen?: boolean;
  onToggleChatbot?: (open: boolean | ((prev: boolean) => boolean)) => void;
}

// Helper component for auto-scrolling layouts
interface LayoutListProps {
  layouts: CanvasLayoutTemplate[];
  activeId?: string;
  onSelect: (id: string) => void;
  emptyMessage: string;
}
const LayoutList = ({
  layouts,
  activeId,
  onSelect,
  emptyMessage,
}: LayoutListProps) => {
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (activeId && itemRefs.current[activeId]) {
      setTimeout(() => {
        itemRefs.current[activeId]?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 100);
    }
  }, [activeId]);

  if (layouts.length === 0) {
    return (
      <div className="col-span-2 text-center text-sm text-muted-foreground py-4">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {layouts.map((template) => (
        <div
          key={template.id}
          ref={(el) => (itemRefs.current[template.id] = el)}
          className={cn(
            "flex flex-col items-center gap-2 p-3 h-auto cursor-pointer rounded-xl border border-transparent transition-all",
            activeId === template.id
              ? "bg-primary/10 border-primary/50"
              : "hover:bg-muted/70 hover:border-border"
          )}
          onClick={() => onSelect(template.id)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelect(template.id);
            }
          }}
        >
          <GridLayoutPreview
            sections={template.sections}
            templateId={template.id}
          />
          <div className="flex items-center gap-1.5 w-full justify-center">
            <span className="text-xs font-medium truncate">
              {template.name}
            </span>
            {activeId === template.id && (
              <Check className="w-3.5 h-3.5 text-primary shrink-0" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

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
  isTextDepthEnabled,
  onTextDepthToggle,
  isChatbotOpen,
  onToggleChatbot,
}: CanvasHoverToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { layoutTemplates, loading: templatesLoading } = useLayoutTemplates();
  const [isHovered, setIsHovered] = useState(false);
  const toolbarRef = useRef<HTMLDivElement>(null);

  // Proximity detection to replace the blocking invisible div
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Check if mouse is within top 96px (matches previous h-24 trigger zone)
      const isTopZone = e.clientY < 96;

      // Check if interacting with toolbar or its popovers/dialogs
      const target = e.target as HTMLElement;
      const isInteracting =
        toolbarRef.current?.contains(target) ||
        target.closest('[role="dialog"]') !== null ||
        target.closest("[data-radix-popper-content-wrapper]") !== null;

      // Show toolbar if in top zone OR interacting with it
      // This allows clicks to pass through to the canvas when not directly over the toolbar UI
      setIsHovered(isTopZone || !!isInteracting);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
    if (!template) return;

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

  const isCarouselLayout = canvasLayout?.templateId?.includes("carousel");

  const rotateCarousel = (direction: "left" | "right") => {
    if (!canvasLayout || !onCanvasLayoutChange) return;
    const template = layoutTemplates.find(
      (t) => t.id === canvasLayout.templateId
    );
    if (!template) return;

    const sectionIds = template.sections.map((s) => s.id);
    const currentSections = [...canvasLayout.sections];
    const contentMap = new Map(currentSections.map((s) => [s.id, s.content]));

    const rotatedSections = sectionIds.map((id, index) => {
      const sourceIndex =
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

  const layoutId = canvasLayout?.templateId || "";
  const hasTransformations =
    isCarouselLayout ||
    layoutId.includes("magazine") ||
    layoutId.includes("bento") ||
    layoutId.includes("staircase") ||
    layoutId.includes("diagonal") ||
    layoutId.includes("spotlight") ||
    layoutId.includes("pip-creative");

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
    } else if (
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
    } else if (layoutId === "spotlight-frame" && type === "rotate") {
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
    } else if (layoutId === "pip-creative" && type === "rotate") {
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
    } else if (layoutId.includes("staircase") && type === "reverse") {
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
    onCanvasLayoutChange({ ...canvasLayout, sections: transformedSections });
  };

  // Visibility Logic:
  // Show if:
  // 1. isVisible prop is true (global toggle)
  // 2. AND (Chatbot is open OR User is hovering in the top zone/toolbar)
  const shouldShow = isVisible && (isChatbotOpen || isHovered);

  return (
    <>
      {/* REMOVED: The blocking Trigger Zone div has been replaced by the window mousemove listener.
        This fixes the issue where text under the top ~100px of the screen was unselectable.
      */}

      {/* TOOLBAR */}
      <div
        ref={toolbarRef}
        className={cn(
          "fixed top-4 left-1/2 -translate-x-1/2 z-[20000]",
          "bg-background/40 backdrop-blur-xl border border-border/40 rounded-full shadow-lg",
          "px-1.5 py-1 sm:px-2 sm:py-1.5 flex items-center gap-0.5 sm:gap-1",
          "transition-all duration-300 ease-out",
          // Slide up and fade out when hidden
          shouldShow
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-16 pointer-events-none"
        )}
        onMouseEnter={() => setIsHovered(true)}
        // We rely on the window listener for un-hover logic to handle the zone correctly
      >
        {!canvasLayout && (
          <>
            {/* Color Picker */}
            <div className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60 p-0 overflow-hidden"
                title="Background Color"
              >
                <div
                  className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-border/50"
                  style={{ backgroundColor: blankCanvasColor }}
                />
              </Button>
              <Input
                id="canvas-color"
                type="color"
                value={blankCanvasColor}
                onChange={(e) => onBlankCanvasColorChange(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Background"
            >
              <Upload className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60"
                  title="Search Assets"
                >
                  <Search className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 h-[400px] p-0 rounded-2xl overflow-hidden border-border/40"
                style={{ zIndex: "var(--z-asset-popover)" }}
                align="center"
                side="bottom"
                sideOffset={8}
              >
                <AssetLibrary onAssetSelect={onCanvasBackgroundAssetSelect} />
              </PopoverContent>
            </Popover>

            {onTextDepthToggle && (
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60",
                  isTextDepthEnabled && "bg-primary/20 text-primary"
                )}
                onClick={() => onTextDepthToggle(!isTextDepthEnabled)}
                title="Toggle Text Behind User"
              >
                <Layers className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}

            <div className="w-px h-5 sm:h-6 bg-border/40 mx-0.5 sm:mx-1" />
          </>
        )}

        {/* AIChatbot Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60",
            isChatbotOpen && "bg-primary/20 text-primary"
          )}
          onClick={() => {
            if (onToggleChatbot) onToggleChatbot((prev) => !prev);
          }}
          title="AI Chatbot"
        >
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
        <AIChatbot
          isOpen={!!isChatbotOpen}
          onClose={() => {
            if (onToggleChatbot) onToggleChatbot(false);
          }}
        />

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60",
                canvasLayout && "bg-primary/20 text-primary"
              )}
              title="Grid Layout"
            >
              <Grid3x3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[480px] p-3 max-h-[500px] overflow-y-auto rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl"
            style={{ zIndex: "var(--z-asset-popover)" }}
            align="center"
            side="bottom"
            sideOffset={8}
          >
            {templatesLoading && (
              <div className="text-sm text-muted-foreground p-3 text-center">
                Loading layouts...
              </div>
            )}

            {canvasLayout && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-destructive mb-3 rounded-xl hover:bg-destructive/10"
                onClick={() => onCanvasLayoutChange?.(null as any)}
              >
                <X className="h-4 w-4 mr-2" />
                Clear Grid
              </Button>
            )}

            {/* Tabbed Layout Selection */}
            {(() => {
              const dynamicLayouts = layoutTemplates.filter(
                (t) => t.category === "dynamic"
              );
              const staticLayouts = layoutTemplates.filter(
                (t) => t.category !== "dynamic"
              );

              return (
                <Tabs defaultValue="dynamic" className="w-full">
                  <TabsList className="w-full grid grid-cols-2 mb-3">
                    <TabsTrigger value="dynamic" className="text-xs gap-1.5">
                      <Zap className="h-3.5 w-3.5" />
                      Dynamic
                    </TabsTrigger>
                    <TabsTrigger value="static" className="text-xs gap-1.5">
                      <Layout className="h-3.5 w-3.5" />
                      Static
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="dynamic" className="mt-0">
                    <LayoutList
                      layouts={dynamicLayouts}
                      activeId={canvasLayout?.templateId}
                      onSelect={handleLayoutSelect}
                      emptyMessage="No dynamic layouts available"
                    />
                  </TabsContent>

                  <TabsContent value="static" className="mt-0">
                    <LayoutList
                      layouts={staticLayouts}
                      activeId={canvasLayout?.templateId}
                      onSelect={handleLayoutSelect}
                      emptyMessage="No static layouts available"
                    />
                  </TabsContent>
                </Tabs>
              );
            })()}
          </PopoverContent>
        </Popover>

        {/* Dynamic Layout Transformation Controls */}
        {hasTransformations && canvasLayout && (
          <>
            <div className="w-px h-5 sm:h-6 bg-border/40 mx-0.5 sm:mx-1" />
            {isCarouselLayout && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60"
                  onClick={() => rotateCarousel("left")}
                  title="Rotate carousel left"
                >
                  <ChevronLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60"
                  onClick={() => rotateCarousel("right")}
                  title="Rotate carousel right"
                >
                  <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </Button>
              </>
            )}

            {layoutId === "magazine-hero" && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60"
                onClick={() => transformLayout("swap")}
                title="Swap hero and sidebar"
              >
                <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}

            {(layoutId.includes("bento") || layoutId.includes("staircase")) && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60"
                onClick={() => transformLayout("rotate")}
                title="Rotate sections"
              >
                <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}

            {(layoutId === "spotlight-frame" ||
              layoutId === "pip-creative") && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-7 w-7 sm:h-8 sm:w-8 hover:bg-background/60"
                onClick={() => transformLayout("rotate")}
                title={
                  layoutId === "spotlight-frame" ? "Rotate frame" : "Cycle PiP"
                }
              >
                <RotateCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </Button>
            )}
          </>
        )}

        {/* Sequence Reorder Popup */}
        {canvasLayout &&
          canvasLayout.sectionOrder &&
          canvasLayout.sectionOrder.length > 0 && (
            <>
              <div className="w-px h-6 bg-border/40 mx-1" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-background/60 relative"
                    title="Sequence Order"
                  >
                    <ListOrdered className="h-4 w-4" />
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                      {canvasLayout.sectionOrder.length}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-64 p-2 rounded-2xl border-border/40 bg-background/95 backdrop-blur-xl"
                  align="center"
                  side="bottom"
                  sideOffset={8}
                >
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
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground"
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
            </>
          )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>
    </>
  );
};
