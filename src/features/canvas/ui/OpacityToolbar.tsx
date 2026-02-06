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
import { useUiStore } from "@/stores/ui.store";
import { useShallow } from "zustand/react/shallow";

interface OpacityToolbarProps {
  isEnabled: boolean;
  opacity: number;
  pattern: OpacityPattern;
  onToggle: () => void;
  onOpacityChange: (value: number) => void;
  onPatternChange: (pattern: OpacityPattern) => void;
}

const PATTERNS: OpacityPattern[] = [
  "none",
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
    case "none":
      return "rgba(255,255,255,0.7)";
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
  const { isMouseActive } = useUiStore(
    useShallow((state) => ({
      isMouseActive: state.isMouseActive,
    }))
  );

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-500 ease-out",
          "backdrop-blur-2xl",
          "bg-background/60 dark:bg-background/40",
          "border border-border/20 dark:border-white/[0.08]",
          "shadow-lg",
          isMouseActive
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        {/* Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggle}
              className={cn(
                "p-1.5 rounded-lg transition-all duration-200",
                isEnabled
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {isEnabled ? (
                <Eye className="w-3.5 h-3.5" />
              ) : (
                <EyeOff className="w-3.5 h-3.5" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            {isEnabled ? "Disable" : "Enable"} camera overlay
          </TooltipContent>
        </Tooltip>

        {isEnabled && (
          <>
            {/* Separator */}
            <div className="w-px h-4 bg-border/30 dark:bg-white/10" />

            {/* Opacity slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground tabular-nums w-6 text-right">
                {opacity}%
              </span>
              <Slider
                value={[opacity]}
                min={0}
                max={100}
                step={1}
                onValueChange={([v]) => onOpacityChange(v)}
                className="w-20"
              />
            </div>

            {/* Separator */}
            <div className="w-px h-4 bg-border/30 dark:bg-white/10" />

            {/* Pattern selector */}
            <div className="flex items-center gap-0.5">
              {PATTERNS.map((p) => (
                <Tooltip key={p}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onPatternChange(p)}
                      className={cn(
                        "w-5 h-5 rounded transition-all duration-200 overflow-hidden",
                        pattern === p
                          ? "ring-1 ring-primary ring-offset-1 ring-offset-background scale-110"
                          : "opacity-60 hover:opacity-100 hover:scale-105"
                      )}
                      style={{ background: getPatternPreview(p) }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">
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
