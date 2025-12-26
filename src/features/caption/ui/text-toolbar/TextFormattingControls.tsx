import React from "react";
import { Button } from "@/shared/ui/button";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveHorizontal,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { TextOverlayState } from "@/types/caption";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Slider } from "@/shared/ui/slider";
import { Label } from "@/shared/ui/label";

interface TextFormattingControlsProps {
  overlay: TextOverlayState;
  onStyleChange: (
    id: string,
    style: Partial<TextOverlayState["style"]>
  ) => void;
}

export const TextFormattingControls: React.FC<TextFormattingControlsProps> = ({
  overlay,
  onStyleChange,
}) => {
  const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
    const command =
      alignment === "left"
        ? "justifyLeft"
        : alignment === "center"
        ? "justifyCenter"
        : "justifyRight";
    document.execCommand(command);
    onStyleChange(overlay.id, { textAlign: alignment } as any);
  };

  const handleLetterSpacingChange = (value: number[]) => {
    onStyleChange(overlay.id, { letterSpacing: `${value[0]}px` } as any);
  };

  const currentSpacing = parseFloat(
    (overlay.style as any).letterSpacing || "0"
  );

  return (
    <>
      {/* Text Formatting */}
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", overlay.style.bold && "bg-accent")}
        onClick={() => document.execCommand("bold")}
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", overlay.style.italic && "bg-accent")}
        onClick={() => document.execCommand("italic")}
      >
        <Italic className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", overlay.style.underline && "bg-accent")}
        onClick={() => document.execCommand("underline")}
      >
        <Underline className="w-4 h-4" />
      </Button>

      <div className="w-px h-6 bg-border" />

      {/* Letter Spacing (Text Indent) */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              currentSpacing !== 0 && "bg-accent text-accent-foreground"
            )}
            title="Letter Spacing"
          >
            <MoveHorizontal className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" side="top">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium">Letter Spacing</Label>
              <span className="text-xs text-muted-foreground">
                {currentSpacing}px
              </span>
            </div>
            <Slider
              defaultValue={[currentSpacing]}
              min={-5}
              max={50}
              step={1}
              onValueChange={handleLetterSpacingChange}
            />
          </div>
        </PopoverContent>
      </Popover>

      <div className="w-px h-6 bg-border" />

      {/* Text Alignment */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          (overlay.style as any).textAlign === "left" && "bg-accent"
        )}
        onClick={() => handleAlignmentChange("left")}
      >
        <AlignLeft className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          (overlay.style as any).textAlign === "center" && "bg-accent"
        )}
        onClick={() => handleAlignmentChange("center")}
      >
        <AlignCenter className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-8 w-8",
          (overlay.style as any).textAlign === "right" && "bg-accent"
        )}
        onClick={() => handleAlignmentChange("right")}
      >
        <AlignRight className="w-4 h-4" />
      </Button>
    </>
  );
};
