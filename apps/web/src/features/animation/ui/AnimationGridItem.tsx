// src/components/AnimationGridItem.tsx
import React, { memo } from "react";
import { Play, Edit2, Trash2, Copy } from "lucide-react";
import { Button } from "@caption-cam/ui/button";
import { SmartTextAnimator } from "./SmartTextAnimator";
import { AnimationPreset } from "@caption-cam/core/types/animation";
import { cn } from "@caption-cam/core/lib/utils";

interface AnimationGridItemProps {
  preset: AnimationPreset;
  isPlaying: boolean;
  onHover: (id: string | null) => void;
  onSelect: (preset: AnimationPreset) => void;
  onEdit: (e: React.MouseEvent, preset: AnimationPreset) => void;
  onDuplicate: (e: React.MouseEvent, preset: AnimationPreset) => void;
  onDelete: (e: React.MouseEvent, id: string) => void;
}

export const AnimationGridItem = memo(
  ({
    preset,
    isPlaying,
    onHover,
    onSelect,
    onEdit,
    onDuplicate,
    onDelete,
  }: AnimationGridItemProps) => {
    return (
      <div
        className="group relative flex flex-col gap-2"
        onMouseEnter={() => onHover(preset.id)}
        onMouseLeave={() => onHover(null)}
      >
        {/* Preview Card */}
        <div
          className={cn(
            "aspect-video bg-card border border-border rounded-lg overflow-hidden relative cursor-pointer transition-all shadow-sm",
            isPlaying
              ? "ring-2 ring-primary shadow-md"
              : "hover:ring-1 hover:ring-primary/50"
          )}
          onClick={() => onSelect(preset)}
        >
          {/* Live Preview Engine */}
          <SmartTextAnimator
            preset={preset}
            isPreview={true}
            playing={isPlaying}
          />

          {/* Overlay Actions */}
          <div
            className={cn(
              "absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-2 backdrop-blur-[2px] transition-opacity duration-200",
              isPlaying ? "opacity-100" : "opacity-0"
            )}
          >
            <Button
              size="sm"
              className="gap-2 w-32"
              onClick={(e) => {
                e.stopPropagation();
                onSelect(preset);
              }}
            >
              <Play className="h-4 w-4" /> Use
            </Button>
            <div className="flex gap-2">
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => onEdit(e, preset)}
                title="Edit"
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="icon"
                variant="secondary"
                className="h-8 w-8"
                onClick={(e) => onDuplicate(e, preset)}
                title="Duplicate"
              >
                <Copy className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Custom Badge */}
          {preset.isCustom && (
            <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wide shadow-sm">
              Custom
            </div>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex justify-between items-start px-1">
          <div>
            <h3
              className="font-medium text-sm leading-none mb-1 truncate max-w-[180px]"
              title={preset.name}
            >
              {preset.name}
            </h3>
            <p className="text-xs text-muted-foreground">{preset.category}</p>
          </div>
          {preset.isCustom && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 -mt-1 text-muted-foreground hover:text-destructive"
              onClick={(e) => onDelete(e, preset.id)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    );
  },
  (prev, next) => {
    // Custom comparison to strictly limit re-renders
    return prev.isPlaying === next.isPlaying && prev.preset === next.preset;
  }
);
