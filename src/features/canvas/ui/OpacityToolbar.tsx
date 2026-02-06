import React from "react";
import { Slider } from "@/shared/ui/slider";
import {
  OpacityPattern,
  PATTERN_LABELS,
} from "@/features/canvas/hooks/useCameraOpacity";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/shared/ui/tooltip";

interface OpacityToolbarProps {
  isEnabled: boolean;
  opacity: number;
  pattern: OpacityPattern;
  onToggle: () => void;
  onOpacityChange: (value: number) => void;
  onPatternChange: (pattern: OpacityPattern) => void;
}

const PATTERNS: OpacityPattern[] = [
  "uniform",
  "left-to-right",
  "right-to-left",
  "top-to-bottom",
  "bottom-to-top",
  "center-to-edge",
  "edge-to-center",
  "diagonal-tl-br",
  "diagonal-tr-bl",
];

/** Small preview gradient thumbnails for each pattern */
function getPatternPreview(p: OpacityPattern): string {
  switch (p) {
    case "uniform":
      return "rgba(255,255,255,0.5)";
    case "left-to-right":
      return "linear-gradient(to right, white, transparent)";
    case "right-to-left":
      return "linear-gradient(to left, white, transparent)";
    case "top-to-bottom":
      return "linear-gradient(to bottom, white, transparent)";
    case "bottom-to-top":
      return "linear-gradient(to top, white, transparent)";
    case "center-to-edge":
      return "radial-gradient(ellipse at center, white 20%, transparent 80%)";
    case "edge-to-center":
      return "radial-gradient(ellipse at center, transparent 20%, white 80%)";
    case "diagonal-tl-br":
      return "linear-gradient(to bottom right, white, transparent)";
    case "diagonal-tr-bl":
      return "linear-gradient(to bottom left, white, transparent)";
    default:
      return "transparent";
  }
}

export const OpacityToolbar: React.FC<OpacityToolbarProps> = ({
  isEnabled,
  opacity,
  pattern,
  onToggle,
  onOpacityChange,
  onPatternChange,
}) => {
  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex items-center gap-3 bg-background/90 backdrop-blur-md border border-border rounded-xl px-4 py-2.5 shadow-lg">
        {/* Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggle}
              className={cn(
                "p-1.5 rounded-lg transition-colors",
                isEnabled
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {isEnabled ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            {isEnabled ? "Disable" : "Enable"} camera overlay
          </TooltipContent>
        </Tooltip>

        {isEnabled && (
          <>
            {/* Separator */}
            <div className="w-px h-6 bg-border" />

            {/* Opacity slider */}
            <div className="flex items-center gap-2 min-w-[140px]">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {opacity}%
              </span>
              <Slider
                value={[opacity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => onOpacityChange(v)}
                className="w-24"
              />
            </div>

            {/* Separator */}
            <div className="w-px h-6 bg-border" />

            {/* Pattern selector */}
            <div className="flex items-center gap-1">
              {PATTERNS.map((p) => (
                <Tooltip key={p}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onPatternChange(p)}
                      className={cn(
                        "w-7 h-7 rounded-md border transition-all overflow-hidden",
                        pattern === p
                          ? "border-primary ring-1 ring-primary/50 scale-110"
                          : "border-border/50 hover:border-border hover:scale-105"
                      )}
                      style={{ background: getPatternPreview(p) }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    {PATTERN_LABELS[p]}
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};
