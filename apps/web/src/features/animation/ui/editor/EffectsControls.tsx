import React from "react";
import { Button } from "@caption-cam/ui/button";
import { Input } from "@caption-cam/ui/input";
import { Label } from "@caption-cam/ui/label";
import { Slider } from "@caption-cam/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@caption-cam/ui/select";
import { AnimationPreset } from "@caption-cam/core/types/animation";
import { ColorPicker } from "@caption-cam/ui/color-picker";

interface EffectsControlsProps {
    preset: AnimationPreset;
    updatePreset: (section: keyof AnimationPreset, key: string, value: any) => void;
}

export const EffectsControls: React.FC<EffectsControlsProps> = ({ preset, updatePreset }) => {
    return (
        <div className="space-y-6 mt-0">
            {/* Text Shadow / Glow */}
            <div className="space-y-3">
                <Label>Neon Glow / Shadow</Label>
                <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" size="sm" onClick={() => updatePreset("baseStyle", "textShadow", "none")}>
                        None
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePreset("baseStyle", "textShadow", "0 0 10px currentColor")}
                    >
                        Soft Glow
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updatePreset("baseStyle", "textShadow", "2px 2px 0px #000")}
                    >
                        Retro Drop
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            updatePreset(
                                "baseStyle",
                                "textShadow",
                                "0 0 5px #fff, 0 0 10px currentColor, 0 0 20px currentColor"
                            )
                        }
                    >
                        Intense Neon
                    </Button>
                </div>
                {/* Custom Shadow Input */}
                <Input
                    placeholder="e.g. 0 4px 10px rgba(0,0,0,0.5)"
                    value={preset.baseStyle.textShadow || ""}
                    onChange={(e) => updatePreset("baseStyle", "textShadow", e.target.value)}
                />
            </div>

            {/* Background & Glass */}
            <div className="space-y-3">
                <Label>Background & Glass</Label>
                <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                        <span>Blur</span>
                        <span>{preset.baseStyle.backgroundBlur || 0}px</span>
                    </div>
                    <Slider
                        value={[preset.baseStyle.backgroundBlur || 0]}
                        min={0}
                        max={20}
                        step={1}
                        onValueChange={([val]) => updatePreset("baseStyle", "backgroundBlur", val)}
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-xs">Background Color</Label>
                    <ColorPicker
                        value={preset.baseStyle.backgroundColor || "#000000"}
                        onChange={(color) => updatePreset("baseStyle", "backgroundColor", color)}
                        variant="inline"
                        showGradients={true}
                        showAlpha={true}
                        label="BG"
                    />
                </div>
            </div>

            {/* Gradient Text */}
            <div className="space-y-3">
                <Label>Text Gradient</Label>
                <Select
                    value={preset.baseStyle.gradient || "none"}
                    onValueChange={(val) => updatePreset("baseStyle", "gradient", val === "none" ? undefined : val)}
                >
                    <SelectTrigger>
                        <SelectValue placeholder="Select Gradient" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="none">None (Solid Color)</SelectItem>
                        <SelectItem value="linear-gradient(to right, #ff00cc, #333399)">Sunset</SelectItem>
                        <SelectItem value="linear-gradient(to right, #00c6ff, #0072ff)">Ocean</SelectItem>
                        <SelectItem value="linear-gradient(to right, #f857a6, #ff5858)">Cherry</SelectItem>
                        <SelectItem value="linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)">
                            Peach
                        </SelectItem>
                        <SelectItem value="linear-gradient(to right, #43e97b 0%, #38f9d7 100%)">Mint</SelectItem>
                        <SelectItem value="linear-gradient(to right, #fa709a 0%, #fee140 100%)">Gold Pink</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
