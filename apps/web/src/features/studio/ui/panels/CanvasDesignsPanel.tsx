import React, { useState, useRef, useCallback, memo } from "react";
import {
  Check,
  Crown,
  Zap as ZapIcon,
  Minus,
  Cpu,
  Film,
  Shirt,
  Clock,
  Users,
  Upload,
  Search,
  Sparkles,
  Grid3x3,
  Plus,
  X,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Layers,
  SquareDashed,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  Layout,
  Zap,
  LayoutGrid,
} from "lucide-react";
import { Button } from "@gaki/ui/button";
import { Input } from "@gaki/ui/input";
import { ColorPicker } from "@gaki/ui/color-picker";
import { Popover, PopoverContent, PopoverTrigger } from "@gaki/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gaki/ui/tabs";
import { CANVAS_PRESET_CATEGORIES } from "@/lib/canvasPresets";
import { useCanvasPresets } from "@/features/canvas/hooks/useCanvasPresets";
import { CanvasPreset } from "@gaki/core/types/canvasPreset";
import { CanvasLayoutState } from "@gaki/core/types/caption";
import { cn } from "@gaki/core/lib/utils";
import { AssetLibrary, AssetResult } from "@/features/assets/ui/AssetLibrary";
import { useLayoutTemplates } from "@/features/layouts/hooks/useLayoutTemplates";
import { GridLayoutPreview } from "@/features/layouts/ui/GridLayoutPreview";

export interface CanvasDesignsPanelProps {
  activePresetId?: string;
  onCanvasPresetSelect?: (preset: CanvasPreset) => void;
  onSaveCanvasPreset?: (name: string) => void;
  customCanvasPresets?: CanvasPreset[];
  onDeleteCanvasPreset?: (id: string) => void;
  publicPresets?: CanvasPreset[];
  isLoadingPublic?: boolean;
  onShareCanvasPreset?: (preset: CanvasPreset, authorName?: string) => void;
  onUnshareCanvasPreset?: (preset: CanvasPreset) => void;
  isHorizontal?: boolean;

  // Canvas background controls (from retired toolbar)
  blankCanvasColor?: string;
  onBlankCanvasColorChange?: (color: string) => void;
  onCanvasBackgroundUpload?: (file: File) => void;
  onCanvasBackgroundAssetSelect?: (asset: AssetResult) => void;

  // Layout controls (from retired toolbar)
  canvasLayout?: CanvasLayoutState | null;
  onCanvasLayoutChange?: (layout: CanvasLayoutState | null) => void;
  activeSequenceId?: string | null;

  // Extra toolbar controls
  isChatbotOpen?: boolean;
  onToggleChatbot?: (open: boolean | ((prev: boolean) => boolean)) => void;
  onAddEmptyGridPanel?: () => void;
  isTextDepthEnabled?: boolean;
  onTextDepthToggle?: (enabled: boolean) => void;
}

// --- Lightweight CSS-only preset preview (no DOM layout rendering) ---
const PresetCard = memo(({ preset, isSelected, onSelect }: {
  preset: CanvasPreset;
  isSelected: boolean;
  onSelect: (preset: CanvasPreset) => void;
}) => {
  const bgColor = preset.background?.blankCanvasColor || "#000";
  const bgImage = preset.background?.backgroundImageUrl;
  const isGradient = bgColor.includes("gradient") || bgColor.includes("linear");
  const hasPip = preset.pip?.layoutMode === "pip";
  const hasLayout = !!preset.canvasLayout;

  const bgStyle: React.CSSProperties = {};
  if (bgImage) {
    bgStyle.backgroundImage = `url(${bgImage})`;
    bgStyle.backgroundSize = "cover";
    bgStyle.backgroundPosition = "center";
  } else if (isGradient) {
    bgStyle.backgroundImage = bgColor;
  } else {
    bgStyle.backgroundColor = bgColor;
  }

  return (
    <button
      onClick={() => onSelect(preset)}
      className={cn(
        "group relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-200",
        "border bg-zinc-900/40 hover:bg-zinc-900/70",
        isSelected
          ? "border-primary ring-1 ring-primary/30 shadow-lg shadow-primary/10"
          : "border-white/[0.06] hover:border-white/15",
      )}
    >
      {/* CSS-only 16:9 preview */}
      <div className="aspect-video relative overflow-hidden" style={bgStyle}>
        {/* Layout indicator shapes */}
        {hasLayout && (
          <div className="absolute inset-1 grid grid-cols-2 grid-rows-2 gap-0.5 opacity-40">
            <div className="rounded-sm bg-white/20" />
            <div className="rounded-sm bg-white/15" />
            <div className="rounded-sm bg-white/10" />
            <div className="rounded-sm bg-white/20" />
          </div>
        )}
        {hasPip && !hasLayout && (
          <div className="absolute bottom-1 right-1 w-[30%] h-[30%] rounded-sm bg-white/20 border border-white/10" />
        )}
        {/* Text overlay indicators */}
        {preset.textOverlays && preset.textOverlays.length > 0 && (
          <div className="absolute bottom-1 left-1 flex gap-0.5">
            {preset.textOverlays.slice(0, 3).map((t) => (
              <div key={t.id} className="h-1 w-4 rounded-full bg-white/30" />
            ))}
          </div>
        )}
        {/* Selection check */}
        {isSelected && (
          <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <Check className="w-2.5 h-2.5 text-primary-foreground stroke-[3]" />
          </div>
        )}
      </div>

      {/* Name + tag */}
      <div className="flex items-center justify-between px-2 py-1.5">
        <span className="text-[10px] font-medium text-zinc-300 truncate">
          {preset.name}
        </span>
        <span className="text-[9px] text-zinc-500 font-mono uppercase tracking-wider">
          {preset.styleTags?.[0] || ""}
        </span>
      </div>
    </button>
  );
});

export const CanvasDesignsPanel: React.FC<CanvasDesignsPanelProps> = ({
  activePresetId,
  onCanvasPresetSelect,
  onSaveCanvasPreset,
  customCanvasPresets,
  onDeleteCanvasPreset,
  publicPresets,
  isLoadingPublic,
  onShareCanvasPreset,
  onUnshareCanvasPreset,
  blankCanvasColor = "#000000",
  onBlankCanvasColorChange,
  onCanvasBackgroundUpload,
  onCanvasBackgroundAssetSelect,
  canvasLayout,
  onCanvasLayoutChange,
  activeSequenceId,
  isChatbotOpen,
  onToggleChatbot,
  onAddEmptyGridPanel,
  isTextDepthEnabled,
  onTextDepthToggle,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [savePresetName, setSavePresetName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { layoutTemplates } = useLayoutTemplates();
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(activePresetId || null);
  const { systemPresets: CANVAS_PRESETS } = useCanvasPresets();

  // Sync external selection
  React.useEffect(() => {
    setSelectedPresetId(activePresetId || null);
  }, [activePresetId]);

  const handleSelect = useCallback((preset: CanvasPreset) => {
    setSelectedPresetId(preset.id);
    onCanvasPresetSelect?.(preset);
  }, [onCanvasPresetSelect]);

  const handleLayoutTemplateSelect = useCallback((templateId: string) => {
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
  }, [onCanvasLayoutChange, layoutTemplates]);

  // --- Layout Transformation Logic (from retired toolbar) ---
  const layoutId = canvasLayout?.templateId || "";
  const isCarouselLayout = layoutId.includes("carousel");
  const hasTransformations = isCarouselLayout || layoutId.includes("magazine") ||
    layoutId.includes("bento") || layoutId.includes("staircase") ||
    layoutId.includes("diagonal") || layoutId.includes("spotlight") ||
    layoutId.includes("pip-creative");

  const rotateCarousel = (direction: "left" | "right") => {
    if (!canvasLayout || !onCanvasLayoutChange) return;
    const template = layoutTemplates.find((t) => t.id === canvasLayout.templateId);
    if (!template) return;
    const sectionIds = template.sections.map((s) => s.id);
    const currentSections = [...canvasLayout.sections];
    const contentMap = new Map(currentSections.map((s) => [s.id, s.content]));
    const rotatedSections = sectionIds.map((id, index) => {
      const sourceIndex = direction === "right"
        ? (index - 1 + sectionIds.length) % sectionIds.length
        : (index + 1) % sectionIds.length;
      const sourceId = sectionIds[sourceIndex];
      return {
        id,
        content: contentMap.get(sourceId) || { type: "empty" as const },
        savedCameraSettings: currentSections.find((s) => s.id === sourceId)?.savedCameraSettings,
        defaultContent: currentSections.find((s) => s.id === sourceId)?.defaultContent,
      };
    });
    onCanvasLayoutChange({ ...canvasLayout, sections: rotatedSections });
  };

  const transformLayout = (type: "rotate" | "swap") => {
    if (!canvasLayout || !onCanvasLayoutChange) return;
    const template = layoutTemplates.find((t) => t.id === canvasLayout.templateId);
    if (!template) return;
    const sectionIds = template.sections.map((s) => s.id);
    const currentSections = [...canvasLayout.sections];
    const contentMap = new Map(currentSections.map((s) => [s.id, s.content]));
    let transformedSections = [...currentSections];

    if (layoutId === "magazine-hero" && type === "swap") {
      const heroContent = contentMap.get("hero");
      const sidebar1Content = contentMap.get("sidebar-1");
      transformedSections = currentSections.map((s) => {
        if (s.id === "hero") return { ...s, content: sidebar1Content || { type: "empty" as const } };
        if (s.id === "sidebar-1") return { ...s, content: heroContent || { type: "empty" as const } };
        return s;
      });
    } else if ((layoutId.includes("bento") || layoutId.includes("staircase") || layoutId.includes("diagonal")) && type === "rotate") {
      transformedSections = sectionIds.map((id, index) => {
        const sourceIndex = (index + 1) % sectionIds.length;
        const sourceId = sectionIds[sourceIndex];
        return {
          id,
          content: contentMap.get(sourceId) || { type: "empty" as const },
          savedCameraSettings: currentSections.find((s) => s.id === sourceId)?.savedCameraSettings,
          defaultContent: currentSections.find((s) => s.id === sourceId)?.defaultContent,
        };
      });
    } else if (layoutId === "spotlight-frame" && type === "rotate") {
      const frameIds = ["top", "right", "bottom", "left"];
      const frameContents = frameIds.map((id) => contentMap.get(id));
      transformedSections = currentSections.map((s) => {
        const frameIndex = frameIds.indexOf(s.id);
        if (frameIndex !== -1) {
          const nextIndex = (frameIndex + 1) % frameIds.length;
          return { ...s, content: frameContents[nextIndex] || { type: "empty" as const } };
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
          return { ...s, content: pipContents[nextIndex] || { type: "empty" as const } };
        }
        return s;
      });
    }
    onCanvasLayoutChange({ ...canvasLayout, sections: transformedSections });
  };

  const moveSequenceItem = (index: number, direction: "up" | "down") => {
    if (!canvasLayout?.sectionOrder || !onCanvasLayoutChange) return;
    const newOrder = [...canvasLayout.sectionOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newOrder.length) return;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    onCanvasLayoutChange({ ...canvasLayout, sectionOrder: newOrder });
  };

  const removeFromOrder = (id: string) => {
    if (!canvasLayout?.sectionOrder || !onCanvasLayoutChange) return;
    onCanvasLayoutChange({ ...canvasLayout, sectionOrder: canvasLayout.sectionOrder.filter((x) => x !== id) });
  };

  // Category filter logic
  const categoryIcons: Record<string, React.ElementType> = {
    LayoutGrid, Crown, Zap: ZapIcon, Minus, Cpu, Film, Shirt, Clock, Users,
  };
  const filteredCanvasPresets = selectedCategory === "all"
    ? CANVAS_PRESETS
    : selectedCategory === "community"
      ? publicPresets || []
      : CANVAS_PRESETS.filter((p) => p.styleTags.includes(selectedCategory));

  // Separate dynamic vs static templates
  const dynamicTemplates = layoutTemplates.filter((t) => t.category === "dynamic" || !t.category);
  const staticTemplates = layoutTemplates.filter((t) => t.category === "static");

  return (
    <div className="flex flex-col gap-3">
      {/* ─── Section 1: Quick Actions Bar (from retired toolbar) ─── */}
      <div className="flex items-center gap-1 flex-wrap">
        {/* Background color */}
        {onBlankCanvasColorChange && (
          <ColorPicker
            value={blankCanvasColor}
            onChange={onBlankCanvasColorChange}
            variant="circle"
            showGradients={true}
          />
        )}

        {/* Upload bg */}
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => {
          const file = e.target.files?.[0];
          if (file && onCanvasBackgroundUpload) onCanvasBackgroundUpload(file);
        }} />
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5" onClick={() => fileInputRef.current?.click()} title="Upload Background">
          <Upload className="h-3.5 w-3.5" />
        </Button>

        {/* Asset search */}
        {onCanvasBackgroundAssetSelect && (
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5" title="Search Assets">
                <Search className="h-3.5 w-3.5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-80 h-[380px] p-0 rounded-2xl overflow-hidden border border-white/10 bg-zinc-950/95 backdrop-blur-2xl shadow-2xl"
              side="right" align="start" sideOffset={12}
              style={{ zIndex: "var(--z-asset-popover)" }}
            >
              <AssetLibrary onAssetSelect={onCanvasBackgroundAssetSelect} />
            </PopoverContent>
          </Popover>
        )}

        {/* Text depth toggle */}
        {onTextDepthToggle && (
          <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-lg", isTextDepthEnabled ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5")} onClick={() => onTextDepthToggle(!isTextDepthEnabled)} title="Text Behind User">
            <Layers className="h-3.5 w-3.5" />
          </Button>
        )}

        <div className="w-px h-5 bg-border/20 mx-0.5" />

        {/* AI Chatbot */}
        {onToggleChatbot && (
          <Button variant="ghost" size="icon" className={cn("h-7 w-7 rounded-lg", isChatbotOpen ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-foreground/5")} onClick={() => onToggleChatbot((prev: boolean) => !prev)} title="AI Chatbot">
            <Sparkles className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Add empty panel */}
        {onAddEmptyGridPanel && (
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-foreground/5" onClick={onAddEmptyGridPanel} title="Add Empty Panel">
            <SquareDashed className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>

      {/* ─── Section 2: Grid Layouts (from retired toolbar) ─── */}
      <div className="rounded-xl border border-white/[0.06] bg-foreground/[0.02] p-2.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Grid3x3 className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[11px] font-medium text-muted-foreground">Layouts</span>
          </div>
          {canvasLayout && canvasLayout.templateId && (
            <Button variant="ghost" size="sm" className="h-5 px-1.5 text-[10px] text-muted-foreground hover:text-foreground gap-1" onClick={() => onCanvasLayoutChange?.(null as any)}>
              <X className="w-3 h-3" /> Clear
            </Button>
          )}
        </div>

        {/* Solo view quick button */}
        <Button
          variant={!canvasLayout || !canvasLayout.templateId ? "secondary" : "ghost"}
          size="sm"
          onClick={() => onCanvasLayoutChange?.({ templateId: "", sections: [], sectionOrder: [] } as any)}
          className="w-full h-7 text-[11px] font-medium rounded-lg justify-start gap-2"
        >
          <Layout className="w-3 h-3" /> Solo View
        </Button>

        {/* Dynamic / Static tabs */}
        <Tabs defaultValue="dynamic" className="w-full">
          <TabsList className="w-full h-7 bg-foreground/[0.03] rounded-lg p-0.5">
            <TabsTrigger value="dynamic" className="flex-1 h-6 text-[10px] font-medium rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Zap className="w-3 h-3" /> Dynamic
            </TabsTrigger>
            <TabsTrigger value="static" className="flex-1 h-6 text-[10px] font-medium rounded-md gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm">
              <Layout className="w-3 h-3" /> Static
            </TabsTrigger>
          </TabsList>
          <TabsContent value="dynamic" className="mt-2">
            <div className="grid grid-cols-3 gap-1.5">
              {dynamicTemplates.map((template) => {
                const isActive = canvasLayout?.templateId === template.id;
                return (
                  <button
                    key={template.id}
                    className={cn(
                      "group relative flex flex-col items-center gap-1 p-1.5 cursor-pointer rounded-lg transition-all duration-150",
                      "border",
                      isActive
                        ? "bg-primary/8 border-primary/30 shadow-sm shadow-primary/10"
                        : "border-transparent hover:bg-foreground/[0.03] hover:border-border/20",
                    )}
                    onClick={() => handleLayoutTemplateSelect(template.id)}
                  >
                    <div className={cn("relative w-full overflow-hidden rounded", isActive && "ring-1 ring-primary/30")}>
                      <GridLayoutPreview sections={template.sections} templateId={template.id} />
                    </div>
                    <span className={cn("text-[9px] font-medium truncate w-full text-center", isActive ? "text-primary" : "text-muted-foreground/60")}>
                      {template.name}
                    </span>
                    {isActive && (
                      <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-primary/15 flex items-center justify-center">
                        <Check className="w-2 h-2 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>
          <TabsContent value="static" className="mt-2">
            <div className="grid grid-cols-3 gap-1.5">
              {staticTemplates.map((template) => {
                const isActive = canvasLayout?.templateId === template.id;
                return (
                  <button
                    key={template.id}
                    className={cn(
                      "group relative flex flex-col items-center gap-1 p-1.5 cursor-pointer rounded-lg transition-all duration-150",
                      "border",
                      isActive
                        ? "bg-primary/8 border-primary/30 shadow-sm shadow-primary/10"
                        : "border-transparent hover:bg-foreground/[0.03] hover:border-border/20",
                    )}
                    onClick={() => handleLayoutTemplateSelect(template.id)}
                  >
                    <div className={cn("relative w-full overflow-hidden rounded", isActive && "ring-1 ring-primary/30")}>
                      <GridLayoutPreview sections={template.sections} templateId={template.id} />
                    </div>
                    <span className={cn("text-[9px] font-medium truncate w-full text-center", isActive ? "text-primary" : "text-muted-foreground/60")}>
                      {template.name}
                    </span>
                    {isActive && (
                      <div className="absolute top-1 right-1 w-3 h-3 rounded-full bg-primary/15 flex items-center justify-center">
                        <Check className="w-2 h-2 text-primary" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Layout Transformation Controls (context-sensitive) */}
        {canvasLayout && canvasLayout.templateId && hasTransformations && (
          <div className="flex items-center gap-1 pt-1 border-t border-white/[0.06]">
            {isCarouselLayout && (
              <>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground" onClick={() => rotateCarousel("left")} title="Rotate left">
                  <ChevronLeft className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground" onClick={() => rotateCarousel("right")} title="Rotate right">
                  <ChevronRight className="h-3 w-3" />
                </Button>
              </>
            )}
            {layoutId === "magazine-hero" && (
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground" onClick={() => transformLayout("swap")} title="Swap hero and sidebar">
                <RotateCw className="h-3 w-3" />
              </Button>
            )}
            {(layoutId.includes("bento") || layoutId.includes("staircase") || layoutId.includes("diagonal") || layoutId === "spotlight-frame" || layoutId === "pip-creative") && (
              <Button variant="ghost" size="icon" className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground" onClick={() => transformLayout("rotate")} title="Rotate sections">
                <RotateCw className="h-3 w-3" />
              </Button>
            )}
            <span className="text-[9px] text-muted-foreground/50 ml-auto">Transform</span>
          </div>
        )}

        {/* Sequence Order Controls */}
        {canvasLayout?.sectionOrder && canvasLayout.sectionOrder.length > 0 && (
          <div className="pt-1 border-t border-white/[0.06] space-y-1">
            <div className="flex items-center gap-1.5">
              <ListOrdered className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground">Sequence Order</span>
              <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{canvasLayout.sectionOrder.length}</span>
            </div>
            {canvasLayout.sectionOrder.map((sectionId, index) => (
              <div key={sectionId} className="flex items-center gap-1 h-6 px-1.5 rounded-md bg-foreground/[0.02] border border-white/[0.04]">
                <span className="text-[9px] font-mono text-muted-foreground w-4">{index + 1}.</span>
                <span className="text-[10px] text-foreground/80 truncate flex-1">{sectionId}</span>
                {activeSequenceId === sectionId && (
                  <span className="text-[8px] font-bold text-green-400 animate-pulse">LIVE</span>
                )}
                <Button variant="ghost" size="icon" className="h-4 w-4 rounded" onClick={() => moveSequenceItem(index, "up")} disabled={index === 0}>
                  <ArrowUp className="w-2.5 h-2.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-4 w-4 rounded" onClick={() => moveSequenceItem(index, "down")} disabled={index === canvasLayout.sectionOrder!.length - 1}>
                  <ArrowDown className="w-2.5 h-2.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-4 w-4 rounded text-muted-foreground hover:text-destructive" onClick={() => removeFromOrder(sectionId)}>
                  <X className="w-2.5 h-2.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── Section 3: Canvas Presets ─── */}
      <div className="flex flex-col gap-2">
        {/* Category filter pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5" style={{ scrollbarWidth: "none" }}>
          <button
            onClick={() => setSelectedCategory("all")}
            className={cn(
              "px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all duration-150 shrink-0",
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-foreground/5",
            )}
          >
            All
          </button>
          {CANVAS_PRESET_CATEGORIES.map((cat) => {
            const Icon = categoryIcons[cat.icon] || LayoutGrid;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all duration-150 shrink-0",
                  selectedCategory === cat.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground/60 hover:text-foreground hover:bg-foreground/5",
                )}
              >
                <Icon className="w-3 h-3" />
                {cat.name}
              </button>
            );
          })}
          <button
            onClick={() => setSelectedCategory("community")}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 text-[10px] font-medium rounded-lg transition-all duration-150 shrink-0",
              selectedCategory === "community"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground/60 hover:text-foreground hover:bg-foreground/5",
            )}
          >
            <Users className="w-3 h-3" />
            Community
          </button>
        </div>

        {/* Preset cards grid — lightweight CSS-only previews */}
        <div className="grid grid-cols-2 gap-2">
          {filteredCanvasPresets.map((preset) => (
            <PresetCard
              key={preset.id}
              preset={preset}
              isSelected={selectedPresetId === preset.id}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>

      {/* ─── Section 4: Save Preset ─── */}
      {onSaveCanvasPreset && (
        <div className="shrink-0 border-t border-white/[0.06] pt-2.5">
          {showSaveInput ? (
            <div className="flex items-center gap-1.5">
              <Input
                placeholder="Preset name..."
                value={savePresetName}
                onChange={(e) => setSavePresetName(e.target.value)}
                className="h-7 text-[11px] bg-transparent border-white/10 rounded-lg"
                autoFocus
              />
              <Button size="sm" className="h-7 text-[11px] px-2.5 rounded-lg" onClick={() => {
                if (savePresetName.trim()) {
                  onSaveCanvasPreset(savePresetName.trim());
                  setSavePresetName("");
                  setShowSaveInput(false);
                }
              }}>Save</Button>
              <Button variant="ghost" size="sm" className="h-7 text-[11px] px-2 rounded-lg" onClick={() => setShowSaveInput(false)}>Cancel</Button>
            </div>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSaveInput(true)}
              className="w-full h-7 text-[11px] border-dashed border-white/15 hover:border-primary text-muted-foreground hover:text-foreground gap-1.5 rounded-lg"
            >
              <Plus className="w-3 h-3" /> Save Current as Preset
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
