// src/components/StyleControls.tsx

import { CaptionStyle } from "@caption-cam/core/types/caption";
import { Label } from "@caption-cam/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@caption-cam/ui/select";
import { Slider } from "@caption-cam/ui/slider";
import { Switch } from "@caption-cam/ui/switch";
import { ColorPicker } from "@caption-cam/ui/color-picker";
import { ALL_FONTS } from "@/lib/fonts";
import { isTransparent } from "@caption-cam/core/lib/color-utils";

interface StyleControlsProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}

export const StyleControls = ({ style, onStyleChange }: StyleControlsProps) => {
  const handleValueChange = <K extends keyof CaptionStyle>(
    key: K,
    value: CaptionStyle[K]
  ) => {
    onStyleChange({ ...style, [key]: value });
  };

  const isTransparentBg = isTransparent(style.backgroundColor);
  
  const handleTransparentToggle = (checked: boolean) => {
    if (checked) {
      handleValueChange("backgroundColor", "rgba(0,0,0,0)");
    } else {
      handleValueChange(
        "backgroundColor",
        style.backgroundColor === "rgba(0,0,0,0)"
          ? "#000000"
          : style.backgroundColor.replace(/,[01]\)/, ",0.8)")
      );
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

      {/* Color Pickers - Using unified ColorPicker */}
      <div className="space-y-3">
        <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Colors
        </Label>
        <div className="grid grid-cols-2 gap-3">
          {/* Text Color */}
          <ColorPicker
            value={style.gradient || style.color}
            onChange={(color) => {
              if (color.includes('gradient')) {
                handleValueChange("color", color);
                handleValueChange("gradient", color);
              } else {
                handleValueChange("color", color);
                handleValueChange("gradient", undefined);
              }
            }}
            variant="inline"
            label="Text"
            showGradients={true}
            showAlpha={false}
          />

          {/* Background Color */}
          <ColorPicker
            value={style.backgroundColor}
            onChange={(color) => handleValueChange("backgroundColor", color)}
            variant="inline"
            label="Background"
            showGradients={true}
            showAlpha={true}
            disabled={isTransparentBg}
          />
        </div>
      </div>

      {/* Background Transparency Toggle */}
      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-xl">
        <Label htmlFor="transparent-toggle" className="text-sm font-medium cursor-pointer">
          Transparent Background
        </Label>
        <Switch
          id="transparent-toggle"
          checked={isTransparentBg}
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
            {/* Border Color - Using unified ColorPicker */}
            <ColorPicker
              value={style.borderColor}
              onChange={(color) => handleValueChange("borderColor", color)}
              variant="inline"
              label="Border Color"
              showGradients={false}
              showAlpha={false}
            />

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