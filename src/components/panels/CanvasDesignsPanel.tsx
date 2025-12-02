// src/components/panels/CanvasDesignsPanel.tsx
import React, { useState } from "react";
import { LayoutGrid, Loader2, CloudOff, Share2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-border/40">
        <div className="flex items-center gap-2">
          <LayoutGrid className="w-5 h-5 text-primary" />
          <h3 className="text-base font-semibold tracking-wide">
            Canvas Designs
          </h3>
        </div>
        {onSaveCanvasPreset && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowSaveInput(!showSaveInput)}
            className="text-xs"
          >
            {showSaveInput ? "Cancel" : "Save Current"}
          </Button>
        )}
      </div>

      {/* Save Preset Input */}
      {showSaveInput && onSaveCanvasPreset && (
        <div className="flex gap-2 mb-4">
          <Input
            placeholder="Preset name..."
            value={savePresetName}
            onChange={(e) => setSavePresetName(e.target.value)}
            className="flex-1"
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
          >
            Save
          </Button>
        </div>
      )}

      {/* Custom Presets Section */}
      {customCanvasPresets && customCanvasPresets.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium mb-3 text-muted-foreground">
            Your Saved Presets
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {customCanvasPresets.map((preset) => (
              <div key={preset.id} className="relative group">
                <button
                  onClick={() => onCanvasPresetSelect?.(preset)}
                  className="w-full rounded-lg overflow-hidden border-2 border-primary/40 hover:border-primary hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-200 bg-background"
                >
                  <div
                    className="w-full aspect-video relative overflow-hidden transition-transform duration-200 group-hover:scale-105"
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
                            ? "12px"
                            : "0",
                        border: `${preset.pip.pipBorder?.width || 2}px solid ${
                          preset.pip.pipBorder?.color || "#fff"
                        }`,
                        background: "rgba(100, 100, 100, 0.3)",
                      }}
                    />
                  </div>
                  <div className="px-3 py-2 bg-background/80 backdrop-blur-sm border-t border-border/20">
                    <p className="text-xs font-medium text-foreground truncate">
                      {preset.name}
                    </p>
                  </div>
                </button>

                {/* Share/Unshare Buttons */}
                {preset.publicId ? (
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
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
                    <CloudOff className="h-3 w-3" />
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    className="absolute top-1 left-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      const authorName =
                        prompt("Enter your name (optional):") || "Anonymous";
                      onShareCanvasPreset?.(preset, authorName);
                    }}
                    title="Share to Community"
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                )}

                {/* Delete Button */}
                {onDeleteCanvasPreset && (
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCanvasPreset(preset.id);
                    }}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category Navigation */}
      <h4 className="text-sm font-medium mb-3 text-muted-foreground">
        Template Presets
      </h4>
      <ScrollArea className="w-full">
        <div className="flex gap-2 pb-3 min-w-max">
          {CANVAS_PRESET_CATEGORIES.map((cat) => {
            const IconComponent = categoryIcons[cat.icon];
            return (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "text-xs font-cyber whitespace-nowrap transition-all duration-200",
                  selectedCategory === cat.id
                    ? "bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.4)] border-none"
                    : "border-violet-500/30 hover:border-violet-500 text-violet-500"
                )}
              >
                {IconComponent && <IconComponent className="w-3 h-3 mr-1.5" />}
                {cat.name.toUpperCase()}
              </Button>
            );
          })}
        </div>
      </ScrollArea>

      {/* Loading State */}
      {selectedCategory === "community" && isLoadingPublic && (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Presets Grid */}
      <div className="grid grid-cols-2 gap-3 max-h-[calc(70vh-200px)] overflow-y-auto pr-2">
        {!(selectedCategory === "community" && isLoadingPublic) &&
          filteredCanvasPresets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => onCanvasPresetSelect?.(preset)}
              className="group relative rounded-lg overflow-hidden border-2 border-violet-500/20 hover:border-violet-500 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] transition-all duration-200 bg-background"
            >
              <div
                className="w-full aspect-video relative overflow-hidden transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: preset.background.blankCanvasColor,
                }}
              >
                {/* Mock camera */}
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
                        ? "12px"
                        : "0",
                    border: `${preset.pip.pipBorder?.width || 2}px solid ${
                      preset.pip.pipBorder?.color || "#fff"
                    }`,
                    boxShadow: preset.pip.pipShadow
                      ? `0 0 ${preset.pip.pipShadow.blur}px ${preset.pip.pipShadow.color}`
                      : "none",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
                      fontSize: `${Math.min(text.style.fontSize * 0.15, 12)}px`,
                      color: text.style.color,
                      backgroundColor: text.style.backgroundColor,
                      border: text.style.border,
                      backdropFilter: text.style.backdropFilter,
                      textShadow: text.style.textShadow,
                      fontWeight: text.style.fontWeight,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: text.style.textAlign,
                      padding: "2px 4px",
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

              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/70 to-transparent p-2 pt-6">
                <span className="text-xs font-semibold font-cyber text-white block truncate">
                  {preset.name}
                </span>
                {selectedCategory === "community" &&
                  (preset as any).authorName && (
                    <span className="text-[9px] text-violet-300 block">
                      by {(preset as any).authorName}
                    </span>
                  )}
                <div className="flex flex-wrap gap-1 mt-1">
                  {preset.styleTags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded-full bg-violet-500/30 text-violet-200 font-cyber"
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
        <div className="text-center py-8 text-muted-foreground text-sm">
          No designs found in this category
        </div>
      )}
    </div>
  );
};
