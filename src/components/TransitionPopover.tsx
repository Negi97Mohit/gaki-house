// src/components/TransitionPopover.tsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  SceneTransition, 
  TransitionType, 
  TransitionEasing,
  TransitionBlendMode 
} from "@/types/caption";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import * as PopoverPrimitive from "@radix-ui/react-popover";

// Mock data for transition options, including URLs from the prompt
const TRANSITION_OPTIONS = [
  {
    name: "None",
    type: "none",
    icon: "https://static.canva.com/web/images/c1d3752055f3dd9727467a61aedbe1af.svg",
  },
  {
    name: "Dissolve",
    type: "dissolve",
    icon: "https://static.canva.com/web/images/f92bd9d9003a11a4b6a7f9403088f861.svg",
  },
  {
    name: "Slide",
    type: "slide",
    icon: "https://static.canva.com/web/images/ebbe273cc23a6791b453e61fd5940c1e.svg",
  },
  {
    name: "Circle Wipe",
    type: "circle_wipe",
    icon: "https://static.canva.com/web/images/8176a64e87bfc9e9615e16a102bfc579.svg",
  },
  {
    name: "Colour Wipe",
    type: "color_wipe",
    icon: "https://static.canva.com/web/images/74d2b4f0782eb2b75e1650848e9c1644.svg",
  },
  {
    name: "Line Wipe",
    type: "line_wipe",
    icon: "https://static.canva.com/web/images/c149f74cacb6894eb927573b8933ce2c.svg",
  },
];

interface TransitionPopoverProps {
  transition: SceneTransition | null;
  onTransitionChange: (transitionId: string, updates: Partial<SceneTransition>) => void;
  onClose: () => void;
}

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

export const TransitionPopover: React.FC<TransitionPopoverProps> = ({
  transition,
  onTransitionChange,
  onClose,
}) => {
  if (!transition) return null;

  const [localDuration, setLocalDuration] = useState(transition.durationMs);

  return (
    <PopoverPrimitive.Root
      open={true}
      onOpenChange={(open) => !open && onClose()}
    >
      <PopoverPrimitive.Anchor asChild>
        <div className="fixed top-16 left-1/2 -translate-x-1/2 w-0 h-0 z-[1030]" />
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="w-96 z-[1030] p-5 bg-background/95 backdrop-blur-md border border-border rounded-xl shadow-2xl"
          align="center"
          side="bottom"
          sideOffset={8}
        >
          <div className="grid gap-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h4 className="font-semibold text-base">Transition Settings</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 hover:bg-[#2596be]/10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Transition Type Grid */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Transition Type</Label>
              <div className="grid grid-cols-3 gap-2">
                {TRANSITION_OPTIONS.map((opt) => (
                  <Button
                    key={opt.type}
                    variant="secondary"
                    className={cn(
                      "h-auto flex-col p-2 gap-1 hover:bg-[#2596be]/10 transition-all",
                      transition.type === opt.type &&
                        "ring-2 border-2 bg-[#2596be]/10"
                    )}
                    style={
                      transition.type === opt.type
                        ? ({
                            borderColor: "#2596be",
                            "--tw-ring-color": "#2596be",
                          } as React.CSSProperties)
                        : undefined
                    }
                    onClick={() =>
                      onTransitionChange(transition.id, { type: opt.type as TransitionType })
                    }
                  >
                    <div
                      className="w-10 h-10 flex items-center justify-center"
                      style={{
                        filter:
                          "brightness(0) saturate(100%) invert(48%) sepia(79%) saturate(489%) hue-rotate(155deg) brightness(95%) contrast(88%)",
                      }}
                    >
                      <img src={opt.icon} alt={opt.name} className="w-10 h-10" />
                    </div>
                    <span className="text-xs">{opt.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {/* Duration Slider */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium text-muted-foreground">Duration</Label>
                <span className="text-xs font-mono text-[#2596be]">{localDuration}ms</span>
              </div>
              <Slider
                value={[localDuration]}
                onValueChange={(value) => setLocalDuration(value[0])}
                onValueCommit={(value) => 
                  onTransitionChange(transition.id, { durationMs: value[0] })
                }
                min={100}
                max={5000}
                step={100}
                className="w-full"
              />
            </div>

            {/* Easing Options */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground">Easing</Label>
              <div className="grid grid-cols-2 gap-2">
                {EASING_OPTIONS.map((easing) => (
                  <Button
                    key={easing.value}
                    variant="secondary"
                    size="sm"
                    className={cn(
                      "text-xs hover:bg-[#2596be]/10 transition-all",
                      transition.easing === easing.value &&
                        "bg-[#2596be]/10 ring-1 ring-[#2596be]"
                    )}
                    onClick={() =>
                      onTransitionChange(transition.id, { easing: easing.value })
                    }
                  >
                    {easing.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Overlay Toggle */}
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="space-y-0.5">
                <Label className="text-xs font-medium">Overlay Scenes</Label>
                <p className="text-xs text-muted-foreground">
                  Show both scenes during transition
                </p>
              </div>
              <Switch
                checked={transition.overlayEnabled}
                onCheckedChange={(checked) =>
                  onTransitionChange(transition.id, { overlayEnabled: checked })
                }
              />
            </div>

            {/* Blend Mode (only when overlay is enabled) */}
            {transition.overlayEnabled && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Blend Mode</Label>
                <div className="grid grid-cols-2 gap-2">
                  {BLEND_MODES.map((mode) => (
                    <Button
                      key={mode.value}
                      variant="secondary"
                      size="sm"
                      className={cn(
                        "text-xs hover:bg-[#2596be]/10 transition-all",
                        transition.blendMode === mode.value &&
                          "bg-[#2596be]/10 ring-1 ring-[#2596be]"
                      )}
                      onClick={() =>
                        onTransitionChange(transition.id, { blendMode: mode.value })
                      }
                    >
                      {mode.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Preview Timeline */}
            <div className="space-y-2 p-3 bg-secondary/30 rounded-lg">
              <Label className="text-xs font-medium text-muted-foreground">Preview</Label>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-8 bg-background/50 rounded flex items-center justify-center text-xs">
                  Scene A
                </div>
                <div 
                  className="h-8 bg-[#2596be]/20 rounded flex items-center justify-center text-xs px-2 border border-[#2596be]/50"
                  style={{ width: `${Math.min(localDuration / 50, 100)}px` }}
                >
                  {transition.type}
                </div>
                <div className="flex-1 h-8 bg-background/50 rounded flex items-center justify-center text-xs">
                  Scene B
                </div>
              </div>
            </div>
          </div>
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
