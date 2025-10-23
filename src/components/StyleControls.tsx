// src/components/StyleControls.tsx

import { CaptionStyle } from "@/types/caption";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";

interface StyleControlsProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}

const FONTS = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Montserrat",
  "Playfair Display",
  "Bebas Neue",
];

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
      {/* Font Family Dropdown */}
      <Label htmlFor="rotation">Rotation: {style.rotation}°</Label>
      <Slider
        id="rotation"
        value={[style.rotation]}
        onValueChange={([value]) => handleValueChange("rotation", value)}
        min={-180}
        max={180}
        step={1}
      />
      <div className="space-y-2">
        <Label htmlFor="font-family">Font Family</Label>
        <Select
          value={style.fontFamily}
          onValueChange={(value) => handleValueChange("fontFamily", value)}
        >
          <SelectTrigger id="font-family">
            <SelectValue placeholder="Select a font" />
          </SelectTrigger>

          {/* Add `portalled` or `position="popper"` depending on your UI lib */}
          <SelectContent position="popper" className="z-[2050]">
            {FONTS.map((font) => (
              <SelectItem key={font} value={font}>
                {font}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Font Size Slider */}
      <div className="space-y-2">
        <Label htmlFor="font-size">Font Size: {style.fontSize}px</Label>
        <Slider
          id="font-size"
          value={[style.fontSize]}
          onValueChange={([value]) => handleValueChange("fontSize", value)}
          min={12}
          max={96}
          step={1}
        />
      </div>

      {/* Color Pickers */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="color">Text Color</Label>
          <Input
            id="color"
            type="color"
            value={style.color}
            onChange={(e) => handleValueChange("color", e.target.value)}
            className="p-1 h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bg-color">Background Color</Label>
          {/* --- THIS IS THE CHANGED LINE --- */}
          <Input
            id="bg-color"
            type="color"
            value={style.backgroundColor.substring(0, 7)} // Use only the hex part for the color picker
            onChange={(e) => handleBackgroundColorChange(e.target.value)}
            className="p-1 h-10"
            disabled={isTransparent}
          />{" "}
        </div>
      </div>
      {/* Background Transparency Toggle (NEW) */}
      <div className="flex items-center space-x-2">
        <Switch
          id="transparent-toggle"
          checked={isTransparent}
          onCheckedChange={handleTransparentToggle}
        />
        <Label htmlFor="transparent-toggle">Transparent Background</Label>
      </div>
      {/* Boolean Toggles */}
      <div className="grid grid-cols-2 gap-y-4 gap-x-2 pt-2">
        <div className="flex items-center space-x-2">
          <Switch
            id="bold-toggle"
            checked={style.bold}
            onCheckedChange={(checked) => handleValueChange("bold", checked)}
          />
          <Label htmlFor="bold-toggle">Bold</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="italic-toggle"
            checked={style.italic}
            onCheckedChange={(checked) => handleValueChange("italic", checked)}
          />
          <Label htmlFor="italic-toggle">Italic</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="underline-toggle"
            checked={style.underline}
            onCheckedChange={(checked) =>
              handleValueChange("underline", checked)
            }
          />
          <Label htmlFor="underline-toggle">Underline</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="shadow-toggle"
            checked={style.shadow}
            onCheckedChange={(checked) => handleValueChange("shadow", checked)}
          />
          <Label htmlFor="shadow-toggle">Shadow</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="border-toggle"
            checked={style.border}
            onCheckedChange={(checked) => handleValueChange("border", checked)}
          />
          <Label htmlFor="border-toggle">Border</Label>
        </div>
        {/* --- ADD THIS ENTIRE SECTION --- */}
        {style.border && (
          <>
            <div className="col-span-2 space-y-2 pt-4 border-t animate-fade-in">
              <Label htmlFor="border-color">Border Color</Label>
              <Input
                id="border-color"
                type="color"
                value={style.borderColor}
                onChange={(e) =>
                  handleValueChange("borderColor", e.target.value)
                }
                className="p-1 h-10"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="border-width">
                Border Width: {style.borderWidth}px
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
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
};
