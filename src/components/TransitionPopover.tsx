// src/components/TransitionPopover.tsx
import React from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { SceneTransition, TransitionType } from "@/types/caption";
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
  onTransitionChange: (
    transitionId: string,
    newType: TransitionType,
    durationMs: number
  ) => void;
  onClose: () => void;
}

export const TransitionPopover: React.FC<TransitionPopoverProps> = ({
  transition,
  onTransitionChange,
  onClose,
}) => {
  if (!transition) return null;

  return (
    <PopoverPrimitive.Root
      open={true}
      onOpenChange={(open) => !open && onClose()}
    >
      <PopoverPrimitive.Anchor asChild>
        {/* This creates an invisible anchor point at the center top of the screen */}
        <div className="fixed top-16 left-1/2 -translate-x-1/2 w-0 h-0 z-[1030]" />
      </PopoverPrimitive.Anchor>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          className="w-80 z-[1030] p-4 bg-background border border-border rounded-lg shadow-lg"
          align="center"
          side="bottom"
          sideOffset={5}
        >
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold leading-none">Transitions</h4>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
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
                    onTransitionChange(
                      transition.id,
                      opt.type as TransitionType,
                      transition.durationMs
                    )
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
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
};
