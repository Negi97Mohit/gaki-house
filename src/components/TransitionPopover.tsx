import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  SceneTransition,
  TransitionType,
  TransitionEasing,
  TransitionBlendMode,
} from "@/types/caption";
import {
  X,
  Scissors,
  Blend,
  Moon,
  Sun,
  Film,
  ArrowLeftRight,
  Palette,
  Focus,
  Move,
  Zap,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  ArrowRight,
  Layers,
  Gauge,
  FlipHorizontal,
  Sparkles,
  Flame,
  Grid3X3,
  ScanFace,
  Droplets,
  Columns,
  Rows,
  Clapperboard,
  Eye,
  CircleDot,
  Circle,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TransitionCategory {
  name: string;
  transitions: {
    type: TransitionType;
    name: string;
    icon: React.ReactNode;
  }[];
}

const TRANSITION_CATEGORIES: TransitionCategory[] = [
  {
    name: "Basic",
    transitions: [
      { type: "none", name: "None", icon: <X className="w-4 h-4" /> },
      { type: "hard_cut", name: "Hard Cut", icon: <Scissors className="w-4 h-4" /> },
      { type: "cross_dissolve", name: "Dissolve", icon: <Blend className="w-4 h-4" /> },
      { type: "fade_black", name: "Fade Black", icon: <Moon className="w-4 h-4" /> },
      { type: "fade_white", name: "Fade White", icon: <Sun className="w-4 h-4" /> },
      { type: "j_cut", name: "J-Cut", icon: <Film className="w-4 h-4" /> },
      { type: "l_cut", name: "L-Cut", icon: <Film className="w-4 h-4 rotate-180" /> },
      { type: "match_cut", name: "Match Cut", icon: <ArrowLeftRight className="w-4 h-4" /> },
      { type: "wipe", name: "Wipe", icon: <ArrowRight className="w-4 h-4" /> },
      { type: "dip_color", name: "Dip Color", icon: <Palette className="w-4 h-4" /> },
      { type: "cross_blur", name: "Cross Blur", icon: <Focus className="w-4 h-4" /> },
    ],
  },
  {
    name: "Motion",
    transitions: [
      { type: "pan", name: "Pan", icon: <Move className="w-4 h-4" /> },
      { type: "whip_pan", name: "Whip Pan", icon: <Zap className="w-4 h-4" /> },
      { type: "zoom_in", name: "Zoom In", icon: <ZoomIn className="w-4 h-4" /> },
      { type: "zoom_out", name: "Zoom Out", icon: <ZoomOut className="w-4 h-4" /> },
      { type: "spin", name: "Spin", icon: <RotateCcw className="w-4 h-4" /> },
      { type: "push", name: "Push", icon: <ArrowRight className="w-4 h-4" /> },
      { type: "slide", name: "Slide", icon: <Layers className="w-4 h-4" /> },
      { type: "object_block", name: "Object Block", icon: <ScanFace className="w-4 h-4" /> },
      { type: "speed_ramp", name: "Speed Ramp", icon: <Gauge className="w-4 h-4" /> },
      { type: "mirror", name: "Mirror", icon: <FlipHorizontal className="w-4 h-4" /> },
    ],
  },
  {
    name: "Effects",
    transitions: [
      { type: "glitch", name: "Glitch", icon: <Sparkles className="w-4 h-4" /> },
      { type: "light_leak", name: "Light Leak", icon: <Sun className="w-4 h-4" /> },
      { type: "burn", name: "Burn", icon: <Flame className="w-4 h-4" /> },
      { type: "pixelate", name: "Pixelate", icon: <Grid3X3 className="w-4 h-4" /> },
      { type: "auto_mask", name: "Auto Mask", icon: <ScanFace className="w-4 h-4" /> },
      { type: "liquid", name: "Liquid", icon: <Droplets className="w-4 h-4" /> },
      { type: "banding_h", name: "H-Banding", icon: <Rows className="w-4 h-4" /> },
      { type: "banding_v", name: "V-Banding", icon: <Columns className="w-4 h-4" /> },
      { type: "film_roll", name: "Film Roll", icon: <Clapperboard className="w-4 h-4" /> },
      { type: "reveal", name: "Reveal", icon: <Eye className="w-4 h-4" /> },
      { type: "bloom", name: "Bloom", icon: <CircleDot className="w-4 h-4" /> },
      { type: "iris_wipe", name: "Iris Wipe", icon: <Circle className="w-4 h-4" /> },
      { type: "breaker", name: "Breaker", icon: <Play className="w-4 h-4" /> },
    ],
  },
];

const EASING_OPTIONS: { value: TransitionEasing; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "ease-in", label: "Ease In" },
  { value: "ease-out", label: "Ease Out" },
  { value: "ease-in-out", label: "Ease In-Out" },
];

const BLEND_MODES: { value: TransitionBlendMode; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "multiply", label: "Multiply" },
  { value: "screen", label: "Screen" },
  { value: "overlay", label: "Overlay" },
];

interface TransitionPopoverProps {
  transition: SceneTransition | null;
  onTransitionChange: (
    transitionId: string,
    updates: Partial<SceneTransition>
  ) => void;
  onClose: () => void;
}

export const TransitionPopover: React.FC<TransitionPopoverProps> = ({
  transition,
  onTransitionChange,
  onClose,
}) => {
  if (!transition) return null;

  const [localDuration, setLocalDuration] = useState(transition.durationMs);
  const [activeCategory, setActiveCategory] = useState("Basic");

  const currentCategory = TRANSITION_CATEGORIES.find(c => c.name === activeCategory);

  return (
    <PopoverPrimitive.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <PopoverPrimitive.Anchor asChild>
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 w-0 h-0"
          style={{ zIndex: "var(--z-transition-popover)" }}
        />
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="w-[420px] bg-background border border-border/50 shadow-2xl overflow-hidden"
          align="center"
          side="bottom"
          sideOffset={8}
          style={{ zIndex: "var(--z-transition-popover)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
            <span className="text-sm font-medium tracking-tight">Transition</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
              onClick={onClose}
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Category Tabs */}
          <div className="flex border-b border-border/50 bg-muted/20">
            {TRANSITION_CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => setActiveCategory(cat.name)}
                className={cn(
                  "flex-1 py-2 text-xs font-medium transition-all border-b-2",
                  activeCategory === cat.name
                    ? "border-primary text-primary bg-primary/5"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <ScrollArea className="h-[320px]">
            <div className="p-3 space-y-4">
              {/* Transition Grid */}
              <div className="grid grid-cols-4 gap-1.5">
                {currentCategory?.transitions.map((t) => (
                  <button
                    key={t.type}
                    onClick={() =>
                      onTransitionChange(transition.id, { type: t.type })
                    }
                    className={cn(
                      "flex flex-col items-center gap-1 p-2 rounded transition-all",
                      "hover:bg-muted/80 group",
                      transition.type === t.type
                        ? "bg-primary/10 ring-1 ring-primary/50"
                        : "bg-muted/30"
                    )}
                  >
                    <div
                      className={cn(
                        "w-8 h-8 rounded flex items-center justify-center transition-colors",
                        transition.type === t.type
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:text-foreground"
                      )}
                    >
                      {t.icon}
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-medium text-center leading-tight",
                        transition.type === t.type
                          ? "text-primary"
                          : "text-muted-foreground"
                      )}
                    >
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>

              {/* Duration */}
              <div className="space-y-2 pt-2 border-t border-border/30">
                <div className="flex items-center justify-between">
                  <Label className="text-xs text-muted-foreground">Duration</Label>
                  <span className="text-xs font-mono text-foreground tabular-nums">
                    {localDuration}ms
                  </span>
                </div>
                <Slider
                  value={[localDuration]}
                  onValueChange={(v) => setLocalDuration(v[0])}
                  onValueCommit={(v) =>
                    onTransitionChange(transition.id, { durationMs: v[0] })
                  }
                  min={100}
                  max={3000}
                  step={50}
                  className="w-full"
                />
              </div>

              {/* Easing Controls */}
              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border/30">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">In</Label>
                  <Select
                    value={transition.animationIn}
                    onValueChange={(v) =>
                      onTransitionChange(transition.id, {
                        animationIn: v as TransitionEasing,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: "var(--z-transition-popover-dropdown)" }}>
                      {EASING_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Out</Label>
                  <Select
                    value={transition.animationOut}
                    onValueChange={(v) =>
                      onTransitionChange(transition.id, {
                        animationOut: v as TransitionEasing,
                      })
                    }
                  >
                    <SelectTrigger className="h-8 text-xs bg-muted/50 border-border/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent style={{ zIndex: "var(--z-transition-popover-dropdown)" }}>
                      {EASING_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value} className="text-xs">
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Overlay Toggle */}
              <div className="flex items-center justify-between py-2.5 px-3 rounded bg-muted/30 border border-border/30">
                <div>
                  <Label className="text-xs font-medium">Overlay</Label>
                  <p className="text-[10px] text-muted-foreground">Show both scenes</p>
                </div>
                <Switch
                  checked={transition.overlayEnabled}
                  onCheckedChange={(checked) =>
                    onTransitionChange(transition.id, { overlayEnabled: checked })
                  }
                />
              </div>

              {/* Blend Mode */}
              {transition.overlayEnabled && (
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Blend Mode</Label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {BLEND_MODES.map((mode) => (
                      <button
                        key={mode.value}
                        onClick={() =>
                          onTransitionChange(transition.id, { blendMode: mode.value })
                        }
                        className={cn(
                          "py-1.5 px-2 text-[10px] font-medium rounded transition-all",
                          transition.blendMode === mode.value
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {mode.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
