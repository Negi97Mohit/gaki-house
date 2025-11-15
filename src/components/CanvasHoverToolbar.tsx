import { Paintbrush } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { cn } from "@/lib/utils";

interface CanvasHoverToolbarProps {
  blankCanvasColor: string;
  onBlankCanvasColorChange: (color: string) => void;
  isVisible: boolean;
}

export const CanvasHoverToolbar = ({
  blankCanvasColor,
  onBlankCanvasColorChange,
  isVisible,
}: CanvasHoverToolbarProps) => {
  return (
    <div
      className={cn(
        "absolute top-2 left-1/2 -translate-x-1/2 z-50",
        "bg-background/95 backdrop-blur-sm border rounded-lg shadow-lg",
        "px-3 py-2 flex items-center gap-3",
        "transition-all duration-300",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
      <Paintbrush className="h-4 w-4 text-muted-foreground" />
      <div className="flex items-center gap-2">
        <Label htmlFor="canvas-color" className="text-xs whitespace-nowrap">
          Canvas Color
        </Label>
        <Input
          id="canvas-color"
          type="color"
          value={blankCanvasColor}
          onChange={(e) => onBlankCanvasColorChange(e.target.value)}
          className="w-16 h-8 cursor-pointer"
        />
      </div>
    </div>
  );
};
