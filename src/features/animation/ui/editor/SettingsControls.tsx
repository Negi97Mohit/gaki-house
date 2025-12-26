import React from "react";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { AnimationPreset } from "@/types/animation";

interface SettingsControlsProps {
    preset: AnimationPreset;
    updatePreset: (section: keyof AnimationPreset, key: string, value: any) => void;
}

export const SettingsControls: React.FC<SettingsControlsProps> = ({ preset, updatePreset }) => {
    return (
        <div className="space-y-6 mt-0">
            <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-0.5">
                    <Label className="text-base">Loop Animation</Label>
                    <p className="text-xs text-muted-foreground">Restart automatically</p>
                </div>
                <Switch
                    checked={preset.animationConfig.loop || false}
                    onCheckedChange={(val) => updatePreset("animationConfig", "loop", val)}
                />
            </div>

            {preset.animationConfig.loop && (
                <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between">
                        <Label>Loop Delay (Pause)</Label>
                        <span className="text-xs text-muted-foreground">{preset.animationConfig.loopDelay || 0}s</span>
                    </div>
                    <Slider
                        value={[preset.animationConfig.loopDelay || 0]}
                        min={0}
                        max={10}
                        step={0.5}
                        onValueChange={([val]) => updatePreset("animationConfig", "loopDelay", val)}
                    />
                    <p className="text-xs text-muted-foreground pt-2">
                        Time to wait before the animation restarts.
                    </p>
                </div>
            )}
        </div>
    );
};
