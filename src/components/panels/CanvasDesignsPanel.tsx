import React, { useState, useEffect, useRef } from "react";
import {
  LayoutGrid,
  Loader2,
  CloudOff,
  Share2,
  Trash2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CANVAS_PRESETS, CANVAS_PRESET_CATEGORIES } from "@/lib/canvasPresets";
import { CanvasPreset, CanvasPresetTextOverlay } from "@/types/canvasPreset";
import { cn } from "@/lib/utils";
import {
  Crown,
  Zap as ZapIcon,
  Minus,
  Cpu,
  Film,
  Shirt,
  Clock,
  Users,
} from "lucide-react";

interface CanvasDesignsPanelProps {
  // NEW: Accept the currently active ID from parent
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

// Accurate preview renderer component
const PresetPreview = ({ preset }: { preset: CanvasPreset }) => {
  return (
    <div
      className="w-full aspect-video relative overflow-hidden"
      style={{
        background: preset.background.blankCanvasColor || "#1a1a1a",
      }}
    >
      {/* Background image if exists */}
      {preset.background.backgroundImageUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50"
          style={{
            backgroundImage: `url(${preset.background.backgroundImageUrl})`,
          }}
        />
      )}

      {/* PIP Camera Preview - Accurate position and size */}
      <div
        className="absolute"
        style={{
          left: `${preset.pip.pipPosition?.x || 50}%`,
          top: `${preset.pip.pipPosition?.y || 50}%`,
          width: `${preset.pip.pipSize?.width || 40}%`,
          height: `${
            preset.pip.cameraShape === "circle"
              ? (preset.pip.pipSize?.width || 40) * (16 / 9)
              : preset.pip.pipSize?.height || 40
          }%`,
          transform: "translate(-50%, -50%)",
          borderRadius:
            preset.pip.cameraShape === "circle"
              ? "50%"
              : preset.pip.cameraShape === "rounded"
              ? "8%"
              : "0",
          border: preset.pip.pipBorder
            ? `${Math.max(1, preset.pip.pipBorder.width * 0.5)}px solid ${
                preset.pip.pipBorder.color
              }`
            : "1px solid rgba(255,255,255,0.3)",
          boxShadow: preset.pip.pipShadow
            ? `0 0 ${preset.pip.pipShadow.blur * 0.3}px ${
                preset.pip.pipShadow.color
              }`
            : "none",
          background: "linear-gradient(145deg, #444 0%, #222 100%)",
        }}
      >
        {/* Camera icon indicator */}
        <div className="absolute inset-0 flex items-center justify-center opacity-40">
          <svg
            viewBox="0 0 24 24"
            className="w-1/3 h-1/3"
            fill="currentColor"
            style={{ color: "rgba(255,255,255,0.5)" }}
          >
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
          </svg>
        </div>
      </div>

      {/* Text Overlays - Accurate rendering */}
      {preset.textOverlays.map((text: CanvasPresetTextOverlay) => (
        <div
          key={text.id}
          className="absolute overflow-hidden pointer-events-none"
          style={{
            left: `${text.layout.position.x}%`,
            top: `${text.layout.position.y}%`,
            width: `${text.layout.size.width}%`,
            height: `${text.layout.size.height}%`,
            transform: `translate(-50%, -50%) rotate(${
              text.layout.rotation || 0
            }deg)`,
            zIndex: text.layout.zIndex || 1,
          }}
        >
          <div
            className="w-full h-full flex items-center overflow-hidden"
            style={{
              fontFamily: text.style.fontFamily || "sans-serif",
              fontSize: `${Math.max(
                6,
                Math.min(text.style.fontSize * 0.08, 12)
              )}px`,
              color: text.style.color || "#fff",
              backgroundColor: text.style.backgroundColor || "transparent",
              textAlign: text.style.textAlign || "center",
              justifyContent:
                text.style.textAlign === "left"
                  ? "flex-start"
                  : text.style.textAlign === "right"
                  ? "flex-end"
                  : "center",
              fontWeight: text.style.fontWeight || 400,
              letterSpacing: text.style.letterSpacing || "normal",
              textTransform: (text.style.textTransform as any) || "none",
              textShadow: text.style.textShadow || "none",
              border: text.style.border || "none",
              backdropFilter: text.style.backdropFilter || "none",
              padding: "2px 4px",
              lineHeight: 1.1,
            }}
          >
            <span className="truncate">
              {text.content
                .replace(/<[^>]+>/g, "")
                .replace(/\s+/g, " ")
                .trim()
                .substring(0, 30)}
            </span>
          </div>
        </div>
      ))}

      {/* Effects indicator */}
      {(preset.effects.isNeonEdgeEnabled ||
        preset.effects.interactiveFilter) && (
        <div className="absolute bottom-1 right-1 px-1 py-0.5 bg-primary/80 text-[6px] font-bold text-primary-foreground">
          FX
        </div>
      )}
    </div>
  );
};

export const CanvasDesignsPanel: React.FC<CanvasDesignsPanelProps> = ({
  activePresetId, // Destructure new prop
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

  // NEW: Sync local state if parent prop changes
  useEffect(() => {
    if (activePresetId) {
      setSelectedPresetId(activePresetId);
    }
  }, [activePresetId]);

  // NEW: Refs for scroll-to-selected
  const presetRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // NEW: Scroll effect
  useEffect(() => {
    if (selectedPresetId && presetRefs.current[selectedPresetId]) {
      const element = presetRefs.current[selectedPresetId];
      if (element) {
        // Small timeout to allow render paint
        setTimeout(() => {
          element.scrollIntoView({
            behavior: "smooth",
            block: "center", // Center it for better visibility in a grid
          });
        }, 100);
      }
    }
  }, [selectedPresetId, selectedCategory]); // Run when selection changes OR category switches

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

  const handlePresetSelect = (preset: CanvasPreset) => {
    setSelectedPresetId(preset.id);
    onCanvasPresetSelect?.(preset);
  };

  // Modified PreviewCard to accept ref
  const PreviewCard = ({
    preset,
    isCustom = false,
  }: {
    preset: CanvasPreset;
    isCustom?: boolean;
  }) => {
    const isSelected = selectedPresetId === preset.id;

    return (
      <div
        // NEW: Attach ref here
        ref={(el) => (presetRefs.current[preset.id] = el)}
        className="relative group"
      >
        <button
          onClick={() => handlePresetSelect(preset)}
          className={cn(
            "w-full overflow-hidden transition-all duration-200 bg-card",
            "border-2",
            isSelected
              ? "border-primary shadow-[0_0_20px_hsl(50,100%,50%,0.4)]"
              : "border-border hover:border-primary/60"
          )}
        >
          {/* Accurate Preview */}
          <PresetPreview preset={preset} />

          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute top-1 right-1 w-5 h-5 bg-primary flex items-center justify-center">
              <Check
                className="w-3 h-3 text-primary-foreground"
                strokeWidth={3}
              />
            </div>
          )}

          {/* Label */}
          <div className="px-2 py-1.5 bg-card border-t border-border">
            <p className="text-[10px] font-bold text-foreground truncate tracking-wider text-left">
              {preset.name.toUpperCase()}
            </p>
          </div>
        </button>

        {/* Action Buttons for Custom Presets */}
        {isCustom && (
          <div className="absolute top-1 left-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {preset.publicId ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 bg-card/90 border border-border hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Unshare?")) onUnshareCanvasPreset?.(preset);
                }}
              >
                <CloudOff className="h-2.5 w-2.5" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 bg-card/90 border border-border hover:bg-primary hover:text-primary-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  const name = prompt("Your name:") || "Anonymous";
                  onShareCanvasPreset?.(preset, name);
                }}
              >
                <Share2 className="h-2.5 w-2.5" />
              </Button>
            )}
            {onDeleteCanvasPreset && (
              <Button
                size="icon"
                variant="ghost"
                className="h-5 w-5 bg-card/90 border border-border hover:bg-destructive hover:text-destructive-foreground"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCanvasPreset(preset.id);
                }}
              >
                <Trash2 className="h-2.5 w-2.5" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

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
                    "flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase transition-all duration-150 whitespace-nowrap",
                    "border-2",
                    isActive
                      ? "bg-primary text-primary-foreground border-primary"
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
              className="w-full py-1.5 text-[10px] font-bold tracking-wider uppercase border-2 border-dashed border-primary/40 text-primary/70 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
            >
              + SAVE CURRENT
            </button>
          ) : (
            <div className="flex gap-2 p-2 bg-card border-2 border-primary">
              <Input
                placeholder="Name..."
                value={savePresetName}
                onChange={(e) => setSavePresetName(e.target.value)}
                className="flex-1 h-7 text-[10px] font-mono border-2 border-border bg-background"
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
                OK
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Custom Presets */}
      {customCanvasPresets && customCanvasPresets.length > 0 && (
        <div className="shrink-0">
          <h4 className="text-[9px] font-bold mb-2 text-primary/80 tracking-widest uppercase">
            YOUR PRESETS
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {customCanvasPresets.map((preset) => (
              <PreviewCard key={preset.id} preset={preset} isCustom />
            ))}
          </div>
        </div>
      )}

      {/* Loading */}
      {selectedCategory === "community" && isLoadingPublic && (
        <div className="flex items-center justify-center py-8 border-2 border-dashed border-primary/30">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      )}

      {/* Presets Grid */}
      <div className="flex-1 overflow-y-auto sharp-scrollbar min-h-0">
        <div className="grid grid-cols-2 gap-2 pb-2">
          {!(selectedCategory === "community" && isLoadingPublic) &&
            filteredCanvasPresets.map((preset) => (
              <PreviewCard key={preset.id} preset={preset} />
            ))}
        </div>

        {filteredCanvasPresets.length === 0 && !isLoadingPublic && (
          <div className="text-center py-8 text-muted-foreground text-[10px] font-bold tracking-wider border-2 border-dashed border-border">
            EMPTY
          </div>
        )}
      </div>
    </div>
  );
};
