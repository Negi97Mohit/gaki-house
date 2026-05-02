import React from "react";
import { Button } from "@gaki/ui/button";
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveHorizontal,
} from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
import { TextOverlayState } from "@gaki/core/types/caption";
import { Popover, PopoverContent, PopoverTrigger } from "@gaki/ui/popover";
import { Slider } from "@gaki/ui/slider";
import { Label } from "@gaki/ui/label";

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
        onClick={() => onStyleChange(overlay.id, { bold: !overlay.style.bold })}
      >
        <Bold className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", overlay.style.italic && "bg-accent")}
        onClick={() =>
          onStyleChange(overlay.id, { italic: !overlay.style.italic })
        }
      >
        <Italic className="w-4 h-4" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", overlay.style.underline && "bg-accent")}
        onClick={() =>
          onStyleChange(overlay.id, { underline: !overlay.style.underline })
        }
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

      {/* Corner Radius */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              (overlay.style.borderRadius || 0) > 0 &&
              "bg-accent text-accent-foreground"
            )}
            title="Corner Radius"
          >
            <div className="w-4 h-4 border-2 border-current rounded-md" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" side="top">
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label className="text-xs font-medium">Corner Radius</Label>
              <span className="text-xs text-muted-foreground">
                {overlay.style.borderRadius || 0}px
              </span>
            </div>
            <Slider
              defaultValue={[overlay.style.borderRadius || 0]}
              min={0}
              max={50}
              step={1}
              onValueChange={(val) =>
                onStyleChange(overlay.id, { borderRadius: val[0] })
              }
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
