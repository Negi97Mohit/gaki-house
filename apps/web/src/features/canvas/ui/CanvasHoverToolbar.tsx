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
  SquareDashed,
} from "lucide-react";
import React, { useRef, useState, useEffect } from "react";

import { Button } from "@gaki/ui/button";
import { cn } from "@gaki/core/lib/utils";
import { ColorPicker } from "@gaki/ui/color-picker";
import { DropdownMenuContent } from "@gaki/ui/dropdown-menu";
import { CanvasLayoutTemplate } from "@gaki/core/types/layout";
import { Popover, PopoverContent, PopoverTrigger } from "@gaki/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gaki/ui/tabs";
import { AssetLibrary, AssetResult } from "@/features/assets/ui/AssetLibrary";
import { CanvasLayoutState } from "@gaki/core/types/caption";
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
  onAddEmptyGridPanel?: () => void;
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
      <div className="col-span-3 text-center text-[11px] text-muted-foreground/60 py-8">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {layouts.map((template) => {
        const isActive = activeId === template.id;
        return (
          <div
            key={template.id}
            ref={(el) => (itemRefs.current[template.id] = el)}
            className={cn(
              "group relative flex flex-col items-center gap-1 p-1.5 cursor-pointer rounded-xl transition-all duration-200",
              "border border-transparent",
              isActive
                ? "bg-primary/8 border-primary/30 shadow-[0_0_12px_-4px] shadow-primary/20"
                : "hover:bg-foreground/[0.03] dark:hover:bg-white/[0.04] hover:border-border/30"
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
            {/* Preview container with subtle hover effect */}
            <div className={cn(
              "relative w-full overflow-hidden rounded-lg transition-transform duration-200",
              "group-hover:scale-[1.02]"
            )}>
              <GridLayoutPreview
                sections={template.sections}
                templateId={template.id}
              />
              {/* Active indicator overlay */}
              {isActive && (
                <div className="absolute inset-0 rounded-lg ring-1 ring-primary/40 pointer-events-none" />
              )}
            </div>
            
            {/* Label */}
            <div className="flex items-center gap-1 w-full justify-center px-0.5">
              <span className={cn(
                "text-[9px] font-medium truncate transition-colors",
                isActive ? "text-primary" : "text-muted-foreground/70 group-hover:text-foreground/80"
              )}>
                {template.name}
              </span>
              {isActive && (
                <div className="flex-shrink-0 w-3 h-3 rounded-full bg-primary/15 flex items-center justify-center">
                  <Check className="w-2 h-2 text-primary" />
                </div>
              )}
            </div>
          </div>
        );
      })}
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
  onAddEmptyGridPanel,
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
          "fixed top-3 left-1/2 -translate-x-1/2 z-[20000]",
          "bg-background/60 dark:bg-background/40 backdrop-blur-2xl",
          "border border-border/20 dark:border-white/10 rounded-2xl",
          "shadow-2xl shadow-black/10 dark:shadow-black/30",
          "px-2 py-1 flex items-center gap-0.5",
          "transition-all duration-300 ease-out",
          shouldShow
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-12 pointer-events-none"
        )}
        onMouseEnter={() => setIsHovered(true)}
      >
        {/* Subtle inner glow */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
        {!canvasLayout && (
          <>
            {/* Color Picker */}
            <ColorPicker
              value={blankCanvasColor}
              onChange={onBlankCanvasColorChange}
              variant="circle"
              showGradients={true}
            />

            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all"
              onClick={() => fileInputRef.current?.click()}
              title="Upload Background"
            >
              <Upload className="h-3 w-3" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all"
                  title="Search Assets"
                >
                  <Search className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-72 h-[360px] p-0 rounded-2xl overflow-hidden border-border/20 dark:border-white/10 bg-background/95 backdrop-blur-2xl"
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
                  "relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all",
                  isTextDepthEnabled && "bg-primary/15 text-primary"
                )}
                onClick={() => onTextDepthToggle(!isTextDepthEnabled)}
                title="Toggle Text Behind User"
              >
                <Layers className="h-3 w-3" />
              </Button>
            )}

            <div className="w-px h-4 bg-border/20 dark:bg-white/10 mx-0.5" />
          </>
        )}

        {/* AIChatbot Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all",
            isChatbotOpen && "bg-primary/15 text-primary"
          )}
          onClick={() => {
            if (onToggleChatbot) onToggleChatbot((prev) => !prev);
          }}
          title="AI Chatbot"
        >
          <Sparkles className="h-3 w-3" />
        </Button>

        {/* Add Empty Grid Panel */}
        {onAddEmptyGridPanel && (
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all"
            onClick={onAddEmptyGridPanel}
            title="Add Empty Panel"
          >
            <SquareDashed className="h-3 w-3" />
          </Button>
        )}

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all",
                canvasLayout && "bg-primary/15 text-primary"
              )}
              title="Grid Layout"
            >
              <Grid3x3 className="h-3 w-3" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-[380px] p-0 max-h-[420px] overflow-hidden rounded-2xl border-border/20 dark:border-white/10 bg-background/80 dark:bg-background/60 backdrop-blur-2xl shadow-2xl shadow-black/10 dark:shadow-black/40"
            style={{ zIndex: "var(--z-asset-popover)" }}
            align="center"
            side="bottom"
            sideOffset={8}
          >
            {/* Subtle inner glow */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
            
            {/* Header */}
            <div className="relative px-3 py-2.5 border-b border-border/10 dark:border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Grid3x3 className="w-2.5 h-2.5 text-primary" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-wide">Layouts</span>
                </div>
                {canvasLayout && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-[10px] text-destructive/70 hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => onCanvasLayoutChange?.(null as any)}
                  >
                    <X className="h-2.5 w-2.5 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {templatesLoading && (
              <div className="text-[10px] text-muted-foreground/50 p-6 text-center">
                Loading layouts...
              </div>
            )}

            {(() => {
              const dynamicLayouts = layoutTemplates.filter(
                (t) => t.category === "dynamic"
              );
              const staticLayouts = layoutTemplates.filter(
                (t) => t.category !== "dynamic"
              );

              return (
                <Tabs defaultValue="dynamic" className="w-full">
                  <div className="px-3 pt-2">
                    <TabsList className="w-full grid grid-cols-2 h-7 rounded-xl bg-foreground/[0.03] dark:bg-white/[0.04] p-0.5">
                      <TabsTrigger 
                        value="dynamic" 
                        className="text-[10px] gap-1.5 rounded-lg h-6 font-medium transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
                      >
                        <Zap className="h-2.5 w-2.5" />
                        Dynamic
                      </TabsTrigger>
                      <TabsTrigger 
                        value="static" 
                        className="text-[10px] gap-1.5 rounded-lg h-6 font-medium transition-all data-[state=active]:bg-background dark:data-[state=active]:bg-white/10 data-[state=active]:shadow-sm"
                      >
                        <Layout className="h-2.5 w-2.5" />
                        Static
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-2 max-h-[320px] overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
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
                  </div>
                </Tabs>
              );
            })()}
          </PopoverContent>
        </Popover>

        {/* Dynamic Layout Transformation Controls */}
        {hasTransformations && canvasLayout && (
          <>
            <div className="w-px h-4 bg-border/20 dark:bg-white/10 mx-0.5" />
            {isCarouselLayout && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all"
                  onClick={() => rotateCarousel("left")}
                  title="Rotate carousel left"
                >
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all"
                  onClick={() => rotateCarousel("right")}
                  title="Rotate carousel right"
                >
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </>
            )}

            {layoutId === "magazine-hero" && (
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all"
                onClick={() => transformLayout("swap")}
                title="Swap hero and sidebar"
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            )}

            {(layoutId.includes("bento") || layoutId.includes("staircase")) && (
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all"
                onClick={() => transformLayout("rotate")}
                title="Rotate sections"
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            )}

            {(layoutId === "spotlight-frame" ||
              layoutId === "pip-creative") && (
              <Button
                variant="ghost"
                size="icon"
                className="relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all"
                onClick={() => transformLayout("rotate")}
                title={
                  layoutId === "spotlight-frame" ? "Rotate frame" : "Cycle PiP"
                }
              >
                <RotateCw className="h-3 w-3" />
              </Button>
            )}
          </>
        )}

        {/* Sequence Reorder Popup */}
        {canvasLayout &&
          canvasLayout.sectionOrder &&
          canvasLayout.sectionOrder.length > 0 && (
            <>
              <div className="w-px h-4 bg-border/20 dark:bg-white/10 mx-0.5" />
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-xl h-6 w-6 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all"
                    title="Sequence Order"
                  >
                    <ListOrdered className="h-3 w-3" />
                    <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[8px] rounded-full w-3 h-3 flex items-center justify-center font-medium">
                      {canvasLayout.sectionOrder.length}
                    </span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-56 p-1.5 rounded-2xl border-border/20 dark:border-white/10 bg-background/95 backdrop-blur-2xl"
                  align="center"
                  side="bottom"
                  sideOffset={8}
                >
                  <div className="space-y-1">
                    <h4 className="font-medium text-[10px] text-muted-foreground/70 px-1.5 mb-1.5 uppercase tracking-wider">
                      Screen Order
                    </h4>
                    {canvasLayout.sectionOrder.map((sectionId, idx) => {
                      const isActive = sectionId === activeSequenceId;
                      return (
                        <div
                          key={sectionId}
                          className={cn(
                            "flex items-center justify-between p-1.5 rounded-lg text-[11px] group transition-all",
                            isActive
                              ? "bg-primary/10 border border-primary/20"
                              : "bg-muted/20 hover:bg-muted/30"
                          )}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "font-bold w-3 text-center text-[10px]",
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground/60"
                              )}
                            >
                              {idx + 1}
                            </span>
                            <span className="truncate max-w-[80px]">
                              {sectionId}
                            </span>
                            {isActive && (
                              <span className="ml-1 px-1 py-0.5 rounded-full bg-red-500 text-[7px] font-bold text-white animate-pulse">
                                LIVE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 rounded-md hover:bg-foreground/10"
                              disabled={idx === 0}
                              onClick={() => moveItem(idx, "up")}
                            >
                              <ArrowUp className="h-2.5 w-2.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 rounded-md hover:bg-foreground/10"
                              disabled={
                                idx === canvasLayout.sectionOrder!.length - 1
                              }
                              onClick={() => moveItem(idx, "down")}
                            >
                              <ArrowDown className="h-2.5 w-2.5" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-5 w-5 rounded-md text-destructive/70 hover:text-destructive hover:bg-destructive/10"
                              onClick={() => removeFromOrder(sectionId)}
                            >
                              <X className="h-2.5 w-2.5" />
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
