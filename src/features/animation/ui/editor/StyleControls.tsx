import React from "react";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { AnimationPreset } from "@/types/animation";
import { ColorPicker } from "@/shared/ui/color-picker";
// import { ALL_FONTS } from "@/lib/fonts"; // Ensuring this import is available or we default

interface StyleControlsProps {
    preset: AnimationPreset;
    updatePreset: (section: keyof AnimationPreset, key: string, value: any) => void;
}

// Fallback if ALL_FONTS not available via prop, but we will import it.
// Or we can define it locally if validation fails.
const FONTS = [
    "Inter",
    "Roboto",
    "Playfair Display",
    "Bebas Neue",
    "Courier New",
    "Montserrat",
    "Open Sans"
];

export const StyleControls: React.FC<StyleControlsProps> = ({ preset, updatePreset }) => {
    return (
        <div className="space-y-6 mt-0">
            <div className="space-y-3">
                <Label>Font Family</Label>
                <Select
                    value={preset.baseStyle.fontFamily}
                    onValueChange={(val) => updatePreset("baseStyle", "fontFamily", val)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {FONTS.map((font) => (
                            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
                                {font}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                <Label>Font Size ({preset.baseStyle.fontSize}px)</Label>
                <Slider
                    value={[preset.baseStyle.fontSize]}
                    min={12}
                    max={120}
                    step={1}
                    onValueChange={([val]) => updatePreset("baseStyle", "fontSize", val)}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Color</Label>
                    <ColorPicker
                        value={preset.baseStyle.color}
                        onChange={(color) => updatePreset("baseStyle", "color", color)}
                        variant="inline"
                        showGradients={true}
                        label="Text"
                    />
                </div>
                <div className="space-y-2">
                    <Label>Accent</Label>
                    <ColorPicker
                        value={preset.baseStyle.accentColor || "#000000"}
                        onChange={(color) => updatePreset("baseStyle", "accentColor", color)}
                        variant="inline"
                        showGradients={true}
                        label="Accent"
                    />
                </div>
            </div>

            <div className="space-y-3">
                <Label>Alignment</Label>
                <div className="flex bg-muted rounded-md p-1">
                    {["left", "center", "right"].map((align) => (
                        <button
                            key={align}
                            className={`flex-1 py-1.5 text-xs rounded-sm capitalize transition-all ${preset.baseStyle.alignment === align
                                    ? "bg-background shadow-sm font-medium"
                                    : "hover:bg-background/50"
                                }`}
                            onClick={() => updatePreset("baseStyle", "alignment", align)}
                        >
                            {align}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};
