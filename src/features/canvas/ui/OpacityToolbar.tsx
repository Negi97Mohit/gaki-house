import React from "react";
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

/** Pattern preview using opacity gradients (no color, just transparency) */
function getPatternPreview(p: OpacityPattern): React.CSSProperties {
  const base = "hsl(var(--foreground))";
  const transparent = "transparent";
  
  switch (p) {
    case "none":
      return { backgroundColor: base, opacity: 0.8 };
    case "uniform":
      return { backgroundColor: base, opacity: 0.5 };
    case "left-to-right":
      return { background: `linear-gradient(to right, ${base}, ${transparent})` };
    case "right-to-left":
      return { background: `linear-gradient(to left, ${base}, ${transparent})` };
    case "top-to-bottom":
      return { background: `linear-gradient(to bottom, ${base}, ${transparent})` };
    case "bottom-to-top":
      return { background: `linear-gradient(to top, ${base}, ${transparent})` };
    case "center-to-edge":
      return { background: `radial-gradient(ellipse at center, ${base} 20%, ${transparent} 80%)` };
    case "edge-to-center":
      return { background: `radial-gradient(ellipse at center, ${transparent} 20%, ${base} 80%)` };
    case "diagonal-tl-br":
      return { background: `linear-gradient(to bottom right, ${base}, ${transparent})` };
    case "diagonal-tr-bl":
      return { background: `linear-gradient(to bottom left, ${base}, ${transparent})` };
    default:
      return { backgroundColor: transparent };
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
          "flex items-center gap-3 px-4 py-2.5 rounded-full transition-all duration-500 ease-out",
          "backdrop-blur-xl",
          "bg-background/70 dark:bg-background/50",
          "border border-border/10 dark:border-border/5",
          "shadow-[0_4px_24px_-4px_rgba(0,0,0,0.1)]",
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
                "p-2 rounded-full transition-all duration-200",
                isEnabled
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              {isEnabled ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs font-medium">
            {isEnabled ? "Disable" : "Enable"} camera overlay
          </TooltipContent>
        </Tooltip>

        {isEnabled && (
          <>
            {/* Separator */}
            <div className="w-px h-5 bg-border/20" />

            {/* Opacity slider - custom chic design */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-muted-foreground tabular-nums min-w-[2.5rem] text-right">
                {opacity}%
              </span>
              <div className="relative w-24 h-6 flex items-center group">
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={opacity}
                  onChange={(e) => onOpacityChange(Number(e.target.value))}
                  className={cn(
                    "w-full h-1 appearance-none bg-muted/50 rounded-full cursor-pointer",
                    "focus:outline-none",
                    "[&::-webkit-slider-thumb]:appearance-none",
                    "[&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4",
                    "[&::-webkit-slider-thumb]:rounded-full",
                    "[&::-webkit-slider-thumb]:bg-foreground",
                    "[&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.15)]",
                    "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150",
                    "[&::-webkit-slider-thumb]:hover:scale-110",
                    "[&::-moz-range-thumb]:appearance-none",
                    "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4",
                    "[&::-moz-range-thumb]:rounded-full",
                    "[&::-moz-range-thumb]:bg-foreground",
                    "[&::-moz-range-thumb]:border-0",
                    "[&::-moz-range-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.15)]"
                  )}
                  style={{
                    background: `linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--foreground)) ${opacity}%, hsl(var(--muted) / 0.5) ${opacity}%, hsl(var(--muted) / 0.5) 100%)`,
                  }}
                />
              </div>
            </div>

            {/* Separator */}
            <div className="w-px h-5 bg-border/20" />

            {/* Pattern selector - refined thumbnails */}
            <div className="flex items-center gap-1">
              {PATTERNS.map((p) => (
                <Tooltip key={p}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => onPatternChange(p)}
                      className={cn(
                        "w-5 h-5 rounded-md transition-all duration-200 overflow-hidden",
                        "border border-border/10",
                        pattern === p
                          ? "ring-2 ring-foreground/80 ring-offset-1 ring-offset-background scale-110"
                          : "opacity-50 hover:opacity-100 hover:scale-105"
                      )}
                      style={getPatternPreview(p)}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs font-medium">
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