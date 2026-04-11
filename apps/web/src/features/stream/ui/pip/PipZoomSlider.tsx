import React, { useState } from "react";
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { Button } from "@caption-cam/ui/button";
import { Slider } from "@caption-cam/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@caption-cam/ui/popover";
import { cn } from "@caption-cam/core/lib/utils";

interface PipZoomSliderProps {
  manualZoom: number; // 1.0 = no zoom, range 0.5 to 3.0
  onManualZoomChange: (zoom: number) => void;
}

export const PipZoomSlider: React.FC<PipZoomSliderProps> = ({
  manualZoom,
  onManualZoomChange,
}) => {
  const isZoomed = manualZoom !== 1.0;
  const zoomPercent = Math.round(manualZoom * 100);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl hover:bg-background/60 relative",
            isZoomed && "text-primary"
          )}
          title={`Zoom: ${zoomPercent}%`}
        >
          <ZoomIn className="w-4 h-4" />
          {isZoomed && (
            <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[7px] font-bold text-primary">
              {zoomPercent}%
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        sideOffset={10}
        className="z-[var(--z-text-toolbar)] w-56 bg-background/95 backdrop-blur-xl border-border/40 p-3"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold">Zoom</span>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground font-mono">
                {zoomPercent}%
              </span>
              {isZoomed && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5 rounded"
                  onClick={() => onManualZoomChange(1.0)}
                  title="Reset Zoom"
                >
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <ZoomOut className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
            <Slider
              value={[manualZoom]}
              min={1.0}
              max={3.0}
              step={0.05}
              onValueChange={([v]) => onManualZoomChange(v)}
              className="flex-1"
            />
            <ZoomIn className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </div>
          <div className="flex gap-1">
            {[1.0, 1.25, 1.5, 2.0, 3.0].map((preset) => (
              <Button
                key={preset}
                variant={manualZoom === preset ? "default" : "outline"}
                size="sm"
                className="flex-1 h-6 text-[9px] px-0"
                onClick={() => onManualZoomChange(preset)}
              >
                {preset}x
              </Button>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
