import React, { useState, useEffect, useRef, useCallback, memo } from "react";
import {
  LayoutGrid,
  Loader2,
  CloudOff,
  Share2,
  Trash2,
  Check,
  Crown,
  Zap as ZapIcon,
  Minus,
  Cpu,
  Film,
  Shirt,
  Clock,
  Users,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { CANVAS_PRESET_CATEGORIES } from "@/lib/canvasPresets";
import { useCanvasPresets } from "@/features/canvas/hooks/useCanvasPresets";
import { CanvasPreset } from "@/types/canvasPreset";
import { cn } from "@/shared/lib/utils";

// Import the actual renderer for dynamic layouts
import { CanvasGridLayout } from "@/features/layouts/ui/CanvasGridLayout";
import { PreviewModeProvider } from "@/features/layouts/ui/layouts/dynamic/core/PreviewModeContext";

interface CanvasDesignsPanelProps {
  activePresetId?: string;
  onCanvasPresetSelect?: (preset: CanvasPreset) => void;
  onSaveCanvasPreset?: (name: string) => void;
  customCanvasPresets?: CanvasPreset[];
  onDeleteCanvasPreset?: (id: string) => void;
  publicPresets?: CanvasPreset[];
  isLoadingPublic?: boolean;
  onShareCanvasPreset?: (preset: CanvasPreset, authorName?: string) => void;
  onUnshareCanvasPreset?: (preset: CanvasPreset) => void;
}

// --- EXACT PREVIEW RENDERER (Memoized) ---
const BASE_WIDTH = 1920;
const BASE_HEIGHT = 1080;

const PresetPreview = memo(
  ({ preset }: { preset: CanvasPreset }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(0.15); // Initial safe guess

    useEffect(() => {
      // Debounce the resize observer to prevent thrashing
      let frameId: number;
      const updateScale = () => {
        if (containerRef.current) {
          const { width } = containerRef.current.getBoundingClientRect();
          setScale(width / BASE_WIDTH);
        }
      };

      updateScale();

      const observer = new ResizeObserver(() => {
        cancelAnimationFrame(frameId);
        frameId = requestAnimationFrame(updateScale);
      });

      if (containerRef.current) observer.observe(containerRef.current);

      return () => {
        observer.disconnect();
        cancelAnimationFrame(frameId);
      };
    }, []);

    // --- 1. Dynamic Layout Preview ---
    if (preset.canvasLayout) {
      return (
        <div
          ref={containerRef}
          className="w-full aspect-video relative overflow-hidden bg-muted/20"
        >
          <div
            style={{
              width: BASE_WIDTH,
              height: BASE_HEIGHT,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
              pointerEvents: "none", // Critical for performance in lists
            }}
          >
            {/* PreviewModeProvider stops interactive elements from hijacking events */}
            <PreviewModeProvider isPreview={true}>
              <CanvasGridLayout
                layout={preset.canvasLayout}
                cameraStream={null} // No real stream for previews (heavy)
                screenStream={null}
                fileOverlays={[]}
                textOverlays={[]}
                blankCanvasColor={preset.background.blankCanvasColor || "#000"}
                backgroundImageUrl={preset.background.backgroundImageUrl}
                onSectionContentChange={() => {}}
                onGridAssetSelect={() => {}}
                layoutMode="pip"
                cameraShape="rectangle"
                pipSize={{ width: 20, height: 20 }}
                backgroundEffect="none"
                onSectionCameraSettingsChange={() => {}}
                // Force low-power mode if available in your renderer
                videoDevices={[]}
              />
            </PreviewModeProvider>
          </div>
        </div>
      );
    }

    // --- 2. Static (PIP + Overlay) Preview ---
    const bgStyle: React.CSSProperties = {
      backgroundColor: preset.background.blankCanvasColor || "#000000",
    };

    if (preset.background.backgroundImageUrl) {
      bgStyle.backgroundImage = `url(${preset.background.backgroundImageUrl})`;
      bgStyle.backgroundSize = "cover";
      bgStyle.backgroundPosition = "center";
    }

    const pip = preset.pip || {
      layoutMode: "pip",
      pipPosition: { x: 0, y: 0 },
      pipSize: { width: 0, height: 0 },
    };
    const pipStyle: React.CSSProperties = {
      left: `${pip.pipPosition?.x || 0}%`,
      top: `${pip.pipPosition?.y || 0}%`,
      width: `${pip.pipSize?.width || 0}%`,
      height: `${pip.pipSize?.height || 0}%`,
      position: "absolute",
      overflow: "hidden",
      boxShadow: pip.pipShadow
        ? `0 0 ${pip.pipShadow.blur}px ${pip.pipShadow.color}`
        : "none",
      border: pip.pipBorder
        ? `${pip.pipBorder.width}px solid ${pip.pipBorder.color}`
        : "none",
    };

    if (pip.cameraShape === "circle") pipStyle.borderRadius = "50%";
    else if (pip.cameraShape === "rounded") pipStyle.borderRadius = "24px";
    else pipStyle.borderRadius = "0px";

    return (
      <div
        ref={containerRef}
        className="w-full aspect-video relative overflow-hidden bg-card"
      >
        <div
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            ...bgStyle,
          }}
          className="relative"
        >
          {pip.layoutMode === "pip" && (
            <div style={pipStyle}>
              <div className="w-full h-full bg-gradient-to-br from-neutral-800 to-neutral-900 flex items-center justify-center relative">
                <div className="text-white/10">
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-32 h-32"
                  >
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          {preset.textOverlays?.map((text) => (
            <div
              key={text.id}
              style={{
                position: "absolute",
                left: `${text.layout.position.x}%`,
                top: `${text.layout.position.y}%`,
                width: `${text.layout.size.width}%`,
                height: `${text.layout.size.height}%`,
                transform: `rotate(${text.layout.rotation || 0}deg)`,
                zIndex: text.layout.zIndex,
                display: "flex",
                alignItems: "center",
                justifyContent:
                  text.style.textAlign === "right"
                    ? "flex-end"
                    : text.style.textAlign === "center"
                    ? "center"
                    : "flex-start",
              }}
            >
              <div
                style={{
                  fontFamily: text.style.fontFamily,
                  fontSize: `${text.style.fontSize}px`,
                  color: text.style.color,
                  fontWeight: text.style.fontWeight,
                  fontStyle: text.style.fontStyle,
                  textDecoration: text.style.textDecoration,
                  textAlign: text.style.textAlign as any,
                  backgroundColor: text.style.backgroundColor,
                  textShadow: text.style.textShadow,
                  lineHeight: 1.2,
                  whiteSpace: "pre-wrap",
                  width: "100%",
                }}
                dangerouslySetInnerHTML={{ __html: text.content }}
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
  (prev, next) => prev.preset.id === next.preset.id
); // Strict equality check for performance

// --- ISOLATED CARD COMPONENT ---
// This prevents re-rendering the whole list when parent state changes
interface PreviewCardProps {
  preset: CanvasPreset;
  isSelected: boolean;
  isCustom?: boolean;
  onSelect: (preset: CanvasPreset) => void;
  onShare?: (preset: CanvasPreset, name: string) => void;
  onUnshare?: (preset: CanvasPreset) => void;
  onDelete?: (id: string) => void;
  setRef?: (el: HTMLDivElement | null) => void;
}

const PreviewCard = memo(
  ({
    preset,
    isSelected,
    isCustom = false,
    onSelect,
    onShare,
    onUnshare,
    onDelete,
    setRef,
  }: PreviewCardProps) => {
    return (
      <div ref={setRef} className="relative group">
        {/* CHANGED: Used div instead of button to avoid DOM nesting issues */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect(preset)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              onSelect(preset);
            }
          }}
          className={cn(
            "w-full overflow-hidden transition-all duration-200 bg-card rounded-md cursor-pointer",
            "border-2",
            isSelected
              ? "border-primary shadow-[0_0_0_2px_rgba(var(--primary),0.2)]"
              : "border-border hover:border-primary/60"
          )}
        >
          <PresetPreview preset={preset} />

          {isSelected && (
            <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md z-10">
              <Check
                className="w-3.5 h-3.5 text-primary-foreground"
                strokeWidth={3}
              />
            </div>
          )}

          <div className="px-3 py-2 bg-card/95 border-t border-border">
            <p className="text-[10px] font-bold text-foreground truncate tracking-wider text-left">
              {preset.name.toUpperCase()}
            </p>
          </div>
        </div>

        {isCustom && (
          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            {preset.publicId ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:text-destructive-foreground rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Unshare?")) onUnshare?.(preset);
                }}
              >
                <CloudOff className="h-3 w-3" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 bg-background/80 backdrop-blur-sm border border-border hover:bg-primary hover:text-primary-foreground rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  const name = prompt("Your name:") || "Anonymous";
                  onShare?.(preset, name);
                }}
              >
                <Share2 className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 bg-background/80 backdrop-blur-sm border border-border hover:bg-destructive hover:text-destructive-foreground rounded-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(preset.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }
);
PreviewCard.displayName = "PreviewCard";

// --- MAIN PANEL COMPONENT ---

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
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [savePresetName, setSavePresetName] = useState("");
  const [showSaveInput, setShowSaveInput] = useState(false);

  // Initialize with prop if available
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(
    activePresetId || null
  );

  const { systemPresets: CANVAS_PRESETS } = useCanvasPresets();

  // Sync local state with parent prop
  useEffect(() => {
    setSelectedPresetId(activePresetId || null);
  }, [activePresetId]);

  const presetRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Memoized Handlers to prevent card re-renders
  const handleSelect = useCallback(
    (preset: CanvasPreset) => {
      setSelectedPresetId(preset.id);
      onCanvasPresetSelect?.(preset);
    },
    [onCanvasPresetSelect]
  );

  const handleShare = useCallback(
    (preset: CanvasPreset, name: string) => {
      onShareCanvasPreset?.(preset, name);
    },
    [onShareCanvasPreset]
  );

  const handleUnshare = useCallback(
    (preset: CanvasPreset) => {
      onUnshareCanvasPreset?.(preset);
    },
    [onUnshareCanvasPreset]
  );

  const handleDelete = useCallback(
    (id: string) => {
      onDeleteCanvasPreset?.(id);
    },
    [onDeleteCanvasPreset]
  );

  // Scroll effect
  useEffect(() => {
    if (selectedPresetId && presetRefs.current[selectedPresetId]) {
      const element = presetRefs.current[selectedPresetId];
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }
  }, [selectedPresetId, selectedCategory]);

  const categoryIcons: Record<string, React.ElementType> = {
    LayoutGrid,
    Crown,
    Zap: ZapIcon,
    Minus,
    Cpu,
    Film,
    Shirt,
    Clock,
    Users,
  };

  const filteredCanvasPresets =
    selectedCategory === "all"
      ? CANVAS_PRESETS
      : selectedCategory === "community"
      ? publicPresets || []
      : CANVAS_PRESETS.filter((p) => p.styleTags.includes(selectedCategory));

  return (
    <div className="flex flex-col h-full font-mono gap-3">
      {/* Horizontally Scrollable Categories */}
      <div className="shrink-0">
        <ScrollArea className="w-full">
          <div className="flex gap-1.5 pb-2">
            {CANVAS_PRESET_CATEGORIES.map((cat) => {
              const IconComponent = categoryIcons[cat.icon];
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase transition-all duration-150 whitespace-nowrap rounded-sm",
                    "border-2",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm"
                      : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
                  )}
                >
                  {IconComponent && (
                    <IconComponent className="w-3 h-3" strokeWidth={2} />
                  )}
                  {cat.name}
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </div>

      {/* Save Current */}
      {onSaveCanvasPreset && (
        <div className="shrink-0">
          {!showSaveInput ? (
            <button
              onClick={() => setShowSaveInput(true)}
              className="w-full py-2 text-[10px] font-bold tracking-wider uppercase border-2 border-dashed border-primary/40 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all rounded-sm"
            >
              + SAVE CURRENT LOOK
            </button>
          ) : (
            <div className="flex gap-2 p-2 bg-muted/20 border-2 border-primary/50 rounded-sm">
              <Input
                placeholder="Name your preset..."
                value={savePresetName}
                onChange={(e) => setSavePresetName(e.target.value)}
                className="flex-1 h-7 text-[10px] font-mono border-border bg-background"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter" && savePresetName.trim()) {
                    onSaveCanvasPreset(savePresetName.trim());
                    setSavePresetName("");
                    setShowSaveInput(false);
                  }
                  if (e.key === "Escape") {
                    setShowSaveInput(false);
                    setSavePresetName("");
                  }
                }}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (savePresetName.trim()) {
                    onSaveCanvasPreset(savePresetName.trim());
                    setSavePresetName("");
                    setShowSaveInput(false);
                  }
                }}
                disabled={!savePresetName.trim()}
                className="h-7 px-3 text-[9px] font-bold"
              >
                SAVE
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Custom Presets */}
      {customCanvasPresets && customCanvasPresets.length > 0 && (
        <div className="shrink-0">
          <h4 className="text-[9px] font-bold mb-2 text-primary/80 tracking-widest uppercase flex items-center gap-2">
            <span className="w-1 h-1 rounded-full bg-primary" />
            YOUR SAVED PRESETS
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {customCanvasPresets.map((preset) => (
              <PreviewCard
                key={preset.id}
                preset={preset}
                isCustom={true}
                isSelected={selectedPresetId === preset.id}
                onSelect={handleSelect}
                onShare={handleShare}
                onUnshare={handleUnshare}
                onDelete={handleDelete}
                setRef={(el) => (presetRefs.current[preset.id] = el)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {selectedCategory === "community" && isLoadingPublic && (
        <div className="flex items-center justify-center py-12 border-2 border-dashed border-border rounded-lg bg-muted/10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {/* Presets Grid */}
      <div className="flex-1 overflow-y-auto sharp-scrollbar min-h-0 pr-1">
        <div className="grid grid-cols-2 gap-3 pb-4">
          {!(selectedCategory === "community" && isLoadingPublic) &&
            filteredCanvasPresets.map((preset) => (
              <PreviewCard
                key={preset.id}
                preset={preset}
                isCustom={false}
                isSelected={selectedPresetId === preset.id}
                onSelect={handleSelect}
                setRef={(el) => (presetRefs.current[preset.id] = el)}
              />
            ))}
        </div>

        {filteredCanvasPresets.length === 0 && !isLoadingPublic && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border rounded-lg bg-muted/5">
            <LayoutGrid className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-[10px] font-bold tracking-wider">
              NO PRESETS FOUND
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
