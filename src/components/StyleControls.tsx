// src/components/StyleControls.tsx

import { CaptionStyle } from "@/types/caption";
import { Label } from "@/shared/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import { Slider } from "@/shared/ui/slider";
import { Input } from "@/shared/ui/input";
import { Switch } from "@/shared/ui/switch";
import { cn } from "@/shared/lib/utils";
import { ALL_FONTS } from "@/lib/fonts";

interface StyleControlsProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}

// --- REMOVED: FONTS array is now imported from "@/lib/fonts" ---

export const StyleControls = ({ style, onStyleChange }: StyleControlsProps) => {
  // A single, robust handler for all style property updates
  const handleValueChange = <K extends keyof CaptionStyle>(
    key: K,
    value: CaptionStyle[K]
  ) => {
    onStyleChange({ ...style, [key]: value });
  };

  const isTransparent =
    style.backgroundColor.includes("transparent") ||
    style.backgroundColor.endsWith("0)");
  const handleTransparentToggle = (checked: boolean) => {
    if (checked) {
      // Store current color and set transparent
      handleValueChange("backgroundColor", "rgba(0,0,0,0)");
    } else {
      // Revert to a non-transparent black color if it was fully transparent
      handleValueChange(
        "backgroundColor",
        style.backgroundColor === "rgba(0,0,0,0)"
          ? "#000000"
          : style.backgroundColor.replace(/,[01]\)/, ",0.8)")
      );
    }
  };
  const handleBackgroundColorChange = (value: string) => {
    // If setting a color with picker, ensure we have some opacity
    if (isTransparent) {
      handleValueChange(
        "backgroundColor",
        value.length === 7 ? `${value}80` : value
      );
    } else {
      handleValueChange("backgroundColor", value);
    }
  };

  return (
    <div className="space-y-6">
      {/* Rotation Slider */}
      <div className="space-y-3">
        <Label htmlFor="rotation" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Rotation: {style.rotation}°
        </Label>
        <Slider
          id="rotation"
          value={[style.rotation]}
          onValueChange={([value]) => handleValueChange("rotation", value)}
          min={-180}
          max={180}
          step={1}
          className="[&_[role=slider]]:rounded-lg"
        />
      </div>

      {/* Font Family Dropdown with Preview */}
      <div className="space-y-2">
        <Label htmlFor="font-family" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Font Family
        </Label>
        <Select
          value={style.fontFamily}
          onValueChange={(value) => handleValueChange("fontFamily", value)}
        >
          <SelectTrigger id="font-family" className="rounded-xl">
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>

          <SelectContent position="popper" className="z-[2050] rounded-xl">
            {ALL_FONTS.map((font) => (
              <SelectItem
                key={font}
                value={font}
                style={{ fontFamily: font, fontSize: "1.1rem" }}
                className="rounded-lg"
              >
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size Slider */}
      <div className="space-y-3">
        <Label htmlFor="font-size" className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Font Size: {style.fontSize}px
        </Label>
        <Slider
          id="font-size"
          value={[style.fontSize]}
          onValueChange={([value]) => handleValueChange("fontSize", value)}
          min={12}
          max={96}
          step={1}
          className="[&_[role=slider]]:rounded-lg"
        />
      </div>

      {/* Modern Color Pickers */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Colors
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {/* Text Color */}
          <div className="relative group">
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50 transition-all hover:border-border hover:bg-muted/70">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border/50 shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: style.color }}
                />
                <Input
                  id="color"
                  type="color"
                  value={style.color}
                  onChange={(e) => handleValueChange("color", e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">Text</span>
                <span className="text-[10px] text-muted-foreground uppercase">{style.color}</span>
              </div>
            </div>
          </div>

          {/* Background Color */}
          <div className="relative group">
            <div className={cn(
              "flex items-center gap-3 p-3 bg-muted/50 rounded-xl border border-border/50 transition-all",
              isTransparent ? "opacity-50" : "hover:border-border hover:bg-muted/70"
            )}>
              <div className="relative">
                <div
                  className={cn(
                    "w-10 h-10 rounded-lg border-2 border-border/50 shadow-sm transition-transform",
                    isTransparent ? "bg-[repeating-conic-gradient(#80808040_0%_25%,transparent_0%_50%)] bg-[length:8px_8px]" : "group-hover:scale-105"
                  )}
                  style={{ backgroundColor: isTransparent ? undefined : style.backgroundColor.substring(0, 7) }}
                />
                <Input
                  id="bg-color"
                  type="color"
                  value={style.backgroundColor.substring(0, 7)}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isTransparent}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">BG</span>
                <span className="text-[10px] text-muted-foreground uppercase">
                  {isTransparent ? "None" : style.backgroundColor.substring(0, 7)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Transparency Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
        <Label htmlFor="transparent-toggle" className="text-sm font-medium cursor-pointer">
          Transparent Background
        </Label>
        <Switch
          id="transparent-toggle"
          checked={isTransparent}
          onCheckedChange={handleTransparentToggle}
        />
      </div>
      {/* Boolean Toggles */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Text Style
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
            <Label htmlFor="bold-toggle" className="text-sm cursor-pointer">Bold</Label>
            <Switch
              id="bold-toggle"
              checked={style.bold}
              onCheckedChange={(checked) => handleValueChange("bold", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
            <Label htmlFor="italic-toggle" className="text-sm cursor-pointer">Italic</Label>
            <Switch
              id="italic-toggle"
              checked={style.italic}
              onCheckedChange={(checked) => handleValueChange("italic", checked)}
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
            <Label htmlFor="underline-toggle" className="text-sm cursor-pointer">Underline</Label>
            <Switch
              id="underline-toggle"
              checked={style.underline}
              onCheckedChange={(checked) =>
                handleValueChange("underline", checked)
              }
            />
          </div>
          <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
            <Label htmlFor="shadow-toggle" className="text-sm cursor-pointer">Shadow</Label>
            <Switch
              id="shadow-toggle"
              checked={style.shadow}
              onCheckedChange={(checked) => handleValueChange("shadow", checked)}
            />
          </div>
        </div>
      </div>

      {/* Border Toggle & Settings */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
          <Label htmlFor="border-toggle" className="text-sm cursor-pointer">Border</Label>
          <Switch
            id="border-toggle"
            checked={style.border}
            onCheckedChange={(checked) => handleValueChange("border", checked)}
          />
        </div>

        {style.border && (
          <div className="space-y-4 p-4 bg-muted/20 rounded-xl border border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Border Color */}
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div
                  className="w-10 h-10 rounded-lg border-2 border-border/50 shadow-sm transition-transform group-hover:scale-105"
                  style={{ backgroundColor: style.borderColor }}
                />
                <Input
                  id="border-color"
                  type="color"
                  value={style.borderColor}
                  onChange={(e) =>
                    handleValueChange("borderColor", e.target.value)
                  }
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium">Border Color</span>
                <span className="text-[10px] text-muted-foreground uppercase">{style.borderColor}</span>
              </div>
            </div>

            {/* Border Width */}
            <div className="space-y-2">
              <Label htmlFor="border-width" className="text-xs font-medium">
                Width: {style.borderWidth}px
              </Label>
              <Slider
                id="border-width"
                value={[style.borderWidth]}
                onValueChange={([value]) =>
                  handleValueChange("borderWidth", value)
                }
                min={1}
                max={10}
                step={1}
                className="[&_[role=slider]]:rounded-lg"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
