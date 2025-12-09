// src/components/panels/CanvasDesignsPanel.tsx
import React, { useState } from "react";
import { LayoutGrid, Loader2, CloudOff, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { CANVAS_PRESETS, CANVAS_PRESET_CATEGORIES } from "@/lib/canvasPresets";
import { CanvasPreset } from "@/types/canvasPreset";
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
  onCanvasPresetSelect?: (preset: CanvasPreset) => void;
  onSaveCanvasPreset?: (name: string) => void;
  customCanvasPresets?: CanvasPreset[];
  onDeleteCanvasPreset?: (id: string) => void;
  publicPresets?: CanvasPreset[];
  isLoadingPublic?: boolean;
  onShareCanvasPreset?: (preset: CanvasPreset, authorName?: string) => void;
  onUnshareCanvasPreset?: (preset: CanvasPreset) => void;
}

export const CanvasDesignsPanel: React.FC<CanvasDesignsPanelProps> = ({
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
    <div className="space-y-4 font-mono">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-3 border-b border-border">
        <span className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
          Select Layout
        </span>
        {onSaveCanvasPreset && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSaveInput(!showSaveInput)}
            className="text-[10px] h-7 px-3 font-mono tracking-wide border-border hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
          >
            {showSaveInput ? "CANCEL" : "SAVE CURRENT"}
          </Button>
        )}
      </div>

      {/* Save Preset Input */}
      {showSaveInput && onSaveCanvasPreset && (
        <div className="flex gap-2 p-3 bg-card border border-border">
          <Input
            placeholder="Preset name..."
            value={savePresetName}
            onChange={(e) => setSavePresetName(e.target.value)}
            className="flex-1 h-8 text-xs font-mono border-border bg-background focus:border-primary"
            onKeyDown={(e) => {
              if (e.key === "Enter" && savePresetName.trim()) {
                onSaveCanvasPreset(savePresetName.trim());
                setSavePresetName("");
                setShowSaveInput(false);
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
            className="h-8 px-4 text-[10px] font-mono tracking-wide"
          >
            SAVE
          </Button>
        </div>
      )}

      {/* Custom Presets Section */}
      {customCanvasPresets && customCanvasPresets.length > 0 && (
        <div className="mb-4">
          <h4 className="text-[10px] font-medium mb-3 text-primary tracking-widest uppercase">
            Your Presets
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {customCanvasPresets.map((preset) => (
              <div key={preset.id} className="relative group">
                <button
                  onClick={() => onCanvasPresetSelect?.(preset)}
                  className="w-full overflow-hidden border border-primary/50 hover:border-primary transition-all duration-150 bg-card"
                >
                  <div
                    className="w-full aspect-video relative overflow-hidden"
                    style={{
                      background: preset.background.blankCanvasColor,
                    }}
                  >
                    <div
                      className="absolute"
                      style={{
                        left: `${preset.pip.pipPosition?.x || 50}%`,
                        top: `${preset.pip.pipPosition?.y || 50}%`,
                        width: `${preset.pip.pipSize?.width || 40}%`,
                        height: `${preset.pip.pipSize?.height || 40}%`,
                        transform: "translate(-50%, -50%)",
                        borderRadius:
                          preset.pip.cameraShape === "circle"
                            ? "50%"
                            : preset.pip.cameraShape === "rounded"
                            ? "4px"
                            : "0",
                        border: `${preset.pip.pipBorder?.width || 1}px solid ${
                          preset.pip.pipBorder?.color || "#fff"
                        }`,
                        background: "rgba(100, 100, 100, 0.5)",
                      }}
                    />
                  </div>
                  <div className="px-2 py-1.5 bg-card border-t border-border">
                    <p className="text-[10px] font-medium text-foreground truncate tracking-wide">
                      {preset.name.toUpperCase()}
                    </p>
                  </div>
                </button>

                {/* Share/Unshare Buttons */}
                {preset.publicId ? (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 left-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (
                        confirm("Are you sure you want to unshare this preset?")
                      ) {
                        onUnshareCanvasPreset?.(preset);
                      }
                    }}
                    title="Remove from Community"
                  >
                    <CloudOff className="h-2.5 w-2.5" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 left-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      const authorName =
                        prompt("Enter your name (optional):") || "Anonymous";
                      onShareCanvasPreset?.(preset, authorName);
                    }}
                    title="Share to Community"
                  >
                    <Share2 className="h-2.5 w-2.5" />
                  </Button>
                )}

                {/* Delete Button */}
                {onDeleteCanvasPreset && (
                  <Button
                    size="icon"
                    variant="ghost"
                    className="absolute top-1 right-1 h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity bg-card/80 hover:bg-destructive hover:text-destructive-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCanvasPreset(preset.id);
                    }}
                  >
                    <Trash2 className="h-2.5 w-2.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <div className="space-y-2">
        <h4 className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
          Templates
        </h4>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-1 w-max">
            {CANVAS_PRESET_CATEGORIES.map((cat) => {
              const IconComponent = categoryIcons[cat.icon];
              return (
                <Button
                  key={cat.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "text-[9px] font-mono whitespace-nowrap transition-all duration-150 h-7 px-2",
                    "border",
                    selectedCategory === cat.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-transparent"
                  )}
                >
                  {IconComponent && <IconComponent className="w-3 h-3 mr-1" strokeWidth={1.5} />}
                  {cat.name.toUpperCase()}
                </Button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" className="h-1.5" />
        </ScrollArea>
      </div>

      {/* Loading State */}
      {selectedCategory === "community" && isLoadingPublic && (
        <div className="flex items-center justify-center h-32 border border-dashed border-border">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Presets Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[calc(70vh-280px)] overflow-y-auto sharp-scrollbar pr-1">
        {!(selectedCategory === "community" && isLoadingPublic) &&
          filteredCanvasPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onCanvasPresetSelect?.(preset)}
              className="group relative overflow-hidden border border-border hover:border-primary transition-all duration-150 bg-card"
            >
              <div
                className="w-full aspect-video relative overflow-hidden"
                style={{
                  background: preset.background.blankCanvasColor,
                }}
              >
                {/* Mock camera */}
                <div
                  className="absolute transition-transform duration-200 group-hover:scale-105"
                  style={{
                    left: `${preset.pip.pipPosition?.x || 50}%`,
                    top: `${preset.pip.pipPosition?.y || 50}%`,
                    width: `${preset.pip.pipSize?.width || 40}%`,
                    height: `${preset.pip.pipSize?.height || 40}%`,
                    transform: "translate(-50%, -50%)",
                    borderRadius:
                      preset.pip.cameraShape === "circle"
                        ? "50%"
                        : preset.pip.cameraShape === "rounded"
                        ? "4px"
                        : "0",
                    border: `${preset.pip.pipBorder?.width || 1}px solid ${
                      preset.pip.pipBorder?.color || "#fff"
                    }`,
                    boxShadow: preset.pip.pipShadow
                      ? `0 0 ${preset.pip.pipShadow.blur}px ${preset.pip.pipShadow.color}`
                      : "none",
                    background:
                      "linear-gradient(135deg, hsl(var(--primary)) 0%, hsl(var(--accent)) 100%)",
                  }}
                />

                {/* Text overlays preview */}
                {preset.textOverlays.slice(0, 1).map((text) => (
                  <div
                    key={text.id}
                    className="absolute text-center overflow-hidden"
                    style={{
                      left: `${text.layout.position.x}%`,
                      top: `${text.layout.position.y}%`,
                      width: `${text.layout.size.width}%`,
                      height: `${text.layout.size.height}%`,
                      transform: `translate(-50%, -50%) rotate(${text.layout.rotation}deg)`,
                      fontFamily: text.style.fontFamily,
                      fontSize: `${Math.min(text.style.fontSize * 0.12, 10)}px`,
                      color: text.style.color,
                      backgroundColor: text.style.backgroundColor,
                      border: text.style.border,
                      backdropFilter: text.style.backdropFilter,
                      textShadow: text.style.textShadow,
                      fontWeight: text.style.fontWeight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: text.style.textAlign,
                      padding: "1px 2px",
                      lineHeight: 1.2,
                    }}
                  >
                    {text.content
                      .replace(/<[^>]+>/g, " ")
                      .replace(/\s+/g, " ")
                      .trim()}
                  </div>
                ))}
              </div>

              {/* Label overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background/90 to-transparent p-2 pt-4">
                <span className="text-[10px] font-mono font-semibold text-foreground block truncate tracking-wide">
                  {preset.name.toUpperCase()}
                </span>
                {selectedCategory === "community" &&
                  (preset as any).authorName && (
                    <span className="text-[8px] text-muted-foreground block font-mono">
                      BY {(preset as any).authorName.toUpperCase()}
                    </span>
                  )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {preset.styleTags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[8px] px-1.5 py-0.5 bg-primary/20 text-primary font-mono tracking-wide"
                    >
                      {tag.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          ))}
      </div>

      {filteredCanvasPresets.length === 0 && (
        <div className="text-center py-8 text-muted-foreground text-xs font-mono border border-dashed border-border">
          NO DESIGNS FOUND
        </div>
      )}
    </div>
  );
};
