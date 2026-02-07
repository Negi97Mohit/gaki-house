import React, { useState, useRef, useEffect } from "react";
import {
  OpacityPattern,
  PATTERN_LABELS,
} from "@/features/canvas/hooks/useCameraOpacity";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/shared/ui/tooltip";

interface PanelOpacityToolbarProps {
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

export const PanelOpacityToolbar: React.FC<PanelOpacityToolbarProps> = ({
  isEnabled,
  opacity,
  pattern,
  onToggle,
  onOpacityChange,
  onPatternChange,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    if (!dropdownOpen) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [dropdownOpen]);

  return (
    <TooltipProvider delayDuration={200}>
      <div
        className={cn(
          "inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg",
          "backdrop-blur-xl",
          "bg-background/80 dark:bg-background/60",
          "border border-border/15",
          "shadow-[0_2px_12px_-2px_rgba(0,0,0,0.12)]",
          "transition-all duration-300"
        )}
      >
        {/* Toggle */}
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onToggle}
              className={cn(
                "p-1.5 rounded-md transition-all duration-200",
                isEnabled
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
              )}
            >
              {isEnabled ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
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
            <div className="w-px h-4 bg-border/20" />

            {/* Opacity slider */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground tabular-nums min-w-[1.8rem] text-right">
                {opacity}%
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={opacity}
                onChange={(e) => onOpacityChange(Number(e.target.value))}
                className={cn(
                  "w-16 h-0.5 appearance-none rounded-full cursor-pointer",
                  "focus:outline-none",
                  "[&::-webkit-slider-thumb]:appearance-none",
                  "[&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3",
                  "[&::-webkit-slider-thumb]:rounded-full",
                  "[&::-webkit-slider-thumb]:bg-foreground",
                  "[&::-webkit-slider-thumb]:shadow-sm",
                  "[&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:duration-150",
                  "[&::-webkit-slider-thumb]:hover:scale-110",
                  "[&::-moz-range-thumb]:appearance-none",
                  "[&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3",
                  "[&::-moz-range-thumb]:rounded-full",
                  "[&::-moz-range-thumb]:bg-foreground",
                  "[&::-moz-range-thumb]:border-0"
                )}
                style={{
                  background: `linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--foreground)) ${opacity}%, hsl(var(--muted) / 0.4) ${opacity}%, hsl(var(--muted) / 0.4) 100%)`,
                }}
              />
            </div>

            {/* Separator */}
            <div className="w-px h-4 bg-border/20" />

            {/* Pattern dropdown */}
            <div className="relative" ref={dropdownRef}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setDropdownOpen((v) => !v)}
                    className={cn(
                      "flex items-center gap-1 p-1 rounded-md transition-all duration-200",
                      "hover:bg-muted/30"
                    )}
                  >
                    <div
                      className="w-4 h-4 rounded-sm border border-border/20 overflow-hidden"
                      style={getPatternPreview(pattern)}
                    />
                    <ChevronDown
                      className={cn(
                        "w-2.5 h-2.5 text-muted-foreground transition-transform duration-200",
                        dropdownOpen && "rotate-180"
                      )}
                    />
                  </button>
                </TooltipTrigger>
                {!dropdownOpen && (
                  <TooltipContent side="top" className="text-xs font-medium">
                    {PATTERN_LABELS[pattern]}
                  </TooltipContent>
                )}
              </Tooltip>

              {/* Dropdown menu */}
              {dropdownOpen && (
                <div
                  className={cn(
                    "absolute bottom-full left-1/2 -translate-x-1/2 mb-2",
                    "w-40 py-1.5 rounded-lg",
                    "bg-background border border-border/20",
                    "shadow-[0_8px_32px_-4px_rgba(0,0,0,0.2)]",
                    "z-[100]",
                    "animate-in fade-in-0 slide-in-from-bottom-2 duration-200"
                  )}
                >
                  {PATTERNS.map((p) => (
                    <button
                      key={p}
                      onClick={() => {
                        onPatternChange(p);
                        setDropdownOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-1.5 text-left transition-colors duration-150",
                        "hover:bg-muted/40",
                        pattern === p
                          ? "text-foreground font-medium"
                          : "text-muted-foreground"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-sm border overflow-hidden shrink-0",
                          pattern === p
                            ? "border-foreground/30 ring-1 ring-foreground/20"
                            : "border-border/20"
                        )}
                        style={getPatternPreview(p)}
                      />
                      <span className="text-[11px] truncate">
                        {PATTERN_LABELS[p]}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </TooltipProvider>
  );
};
