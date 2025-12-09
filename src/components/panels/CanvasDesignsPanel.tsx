// src/components/panels/CanvasDesignsPanel.tsx
import React, { useState } from "react";
import { LayoutGrid, Loader2, CloudOff, Share2, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>(null);

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

  // Simplified preview card component
  const PreviewCard = ({ preset, isCustom = false }: { preset: CanvasPreset; isCustom?: boolean }) => {
    const isSelected = selectedPresetId === preset.id;
    
    return (
      <div className="relative group">
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
          {/* Clean Preview Area */}
          <div
            className="w-full aspect-[16/10] relative overflow-hidden"
            style={{
              background: preset.background.blankCanvasColor || "#1a1a1a",
            }}
          >
            {/* Camera Preview - Clean representation */}
            <div
              className="absolute transition-all duration-200"
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
                    ? "8px"
                    : "0",
                border: `2px solid hsl(50, 100%, 50%)`,
                background: "linear-gradient(135deg, hsl(50, 100%, 50%, 0.3) 0%, hsl(50, 100%, 30%, 0.3) 100%)",
              }}
            />

            {/* Selection Indicator */}
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 bg-primary flex items-center justify-center">
                <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
              </div>
            )}
          </div>

          {/* Clean Label */}
          <div className="px-3 py-2 bg-card border-t border-border">
            <p className="text-xs font-bold text-foreground truncate tracking-wider text-left">
              {preset.name.toUpperCase()}
            </p>
          </div>
        </button>

        {/* Action Buttons for Custom Presets */}
        {isCustom && (
          <div className="absolute top-2 left-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {preset.publicId ? (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 bg-card/90 border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm("Unshare this preset?")) {
                    onUnshareCanvasPreset?.(preset);
                  }
                }}
                title="Unshare"
              >
                <CloudOff className="h-3 w-3" />
              </Button>
            ) : (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 bg-card/90 border border-border hover:bg-primary hover:text-primary-foreground hover:border-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  const authorName = prompt("Your name (optional):") || "Anonymous";
                  onShareCanvasPreset?.(preset, authorName);
                }}
                title="Share"
              >
                <Share2 className="h-3 w-3" />
              </Button>
            )}
            {onDeleteCanvasPreset && (
              <Button
                size="icon"
                variant="ghost"
                className="h-6 w-6 bg-card/90 border border-border hover:bg-destructive hover:text-destructive-foreground hover:border-destructive"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteCanvasPreset(preset.id);
                }}
                title="Delete"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full font-mono gap-4">
      {/* Category Filter - Horizontal Tabs */}
      <div className="shrink-0">
        <div className="flex flex-wrap gap-1.5">
          {CANVAS_PRESET_CATEGORIES.map((cat) => {
            const IconComponent = categoryIcons[cat.icon];
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 text-[10px] font-bold tracking-wider uppercase transition-all duration-150",
                  "border-2",
                  isActive
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:border-primary hover:text-primary"
                )}
              >
                {IconComponent && <IconComponent className="w-3 h-3" strokeWidth={2} />}
                {cat.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save Current Button */}
      {onSaveCanvasPreset && (
        <div className="shrink-0">
          {!showSaveInput ? (
            <button
              onClick={() => setShowSaveInput(true)}
              className="w-full py-2 text-xs font-bold tracking-wider uppercase border-2 border-dashed border-primary/50 text-primary hover:border-primary hover:bg-primary/10 transition-all"
            >
              + SAVE CURRENT LAYOUT
            </button>
          ) : (
            <div className="flex gap-2 p-2 bg-card border-2 border-primary">
              <Input
                placeholder="Name..."
                value={savePresetName}
                onChange={(e) => setSavePresetName(e.target.value)}
                className="flex-1 h-8 text-xs font-mono border-2 border-border bg-background focus:border-primary"
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
                className="h-8 px-4 text-[10px] font-bold tracking-wide"
              >
                SAVE
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setShowSaveInput(false);
                  setSavePresetName("");
                }}
                className="h-8 px-2 text-[10px] border-2 border-border"
              >
                ✕
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Custom Presets */}
      {customCanvasPresets && customCanvasPresets.length > 0 && (
        <div className="shrink-0">
          <h4 className="text-[10px] font-bold mb-2 text-primary tracking-widest uppercase flex items-center gap-2">
            <Crown className="w-3 h-3" /> YOUR PRESETS
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {customCanvasPresets.map((preset) => (
              <PreviewCard key={preset.id} preset={preset} isCustom />
            ))}
          </div>
        </div>
      )}

      {/* Loading State */}
      {selectedCategory === "community" && isLoadingPublic && (
        <div className="flex items-center justify-center py-12 border-2 border-dashed border-primary/30">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
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
          <div className="text-center py-12 text-muted-foreground text-xs font-bold tracking-wider border-2 border-dashed border-border">
            NO DESIGNS IN THIS CATEGORY
          </div>
        )}
      </div>
    </div>
  );
};
