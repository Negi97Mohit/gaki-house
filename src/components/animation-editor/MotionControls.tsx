import React from "react";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { AnimationPreset } from "@/types/animation";

interface MotionControlsProps {
    preset: AnimationPreset;
    updatePreset: (section: keyof AnimationPreset, key: string, value: any) => void;
}

export const MotionControls: React.FC<MotionControlsProps> = ({ preset, updatePreset }) => {
    return (
        <div className="space-y-6 mt-0">
            <div className="space-y-3">
                <div className="flex justify-between">
                    <Label>Duration</Label>
                    <span className="text-xs text-muted-foreground">
                        {preset.animationConfig.duration}s
                    </span>
                </div>
                <Slider
                    value={[preset.animationConfig.duration]}
                    min={0.2}
                    max={5}
                    step={0.1}
                    onValueChange={([val]) => updatePreset("animationConfig", "duration", val)}
                />
            </div>

            <div className="space-y-3">
                <div className="flex justify-between">
                    <Label>Stagger Delay</Label>
                    <span className="text-xs text-muted-foreground">
                        {preset.animationConfig.delay || 0}s
                    </span>
                </div>
                <Slider
                    value={[preset.animationConfig.delay || 0]}
                    min={0}
                    max={2}
                    step={0.05}
                    onValueChange={([val]) => updatePreset("animationConfig", "delay", val)}
                />
            </div>

            <div className="space-y-3">
                <Label>Direction</Label>
                <Select
                    value={preset.animationConfig.direction || "up"}
                    onValueChange={(val) => updatePreset("animationConfig", "direction", val)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="up">Up</SelectItem>
                        <SelectItem value="down">Down</SelectItem>
                        <SelectItem value="left">Left</SelectItem>
                        <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                <Label>Easing</Label>
                <Select
                    value={preset.animationConfig.easing || "smooth"}
                    onValueChange={(val) => updatePreset("animationConfig", "easing", val)}
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="smooth">Smooth</SelectItem>
                        <SelectItem value="bouncy">Bouncy</SelectItem>
                        <SelectItem value="elastic">Elastic</SelectItem>
                        <SelectItem value="linear">Linear</SelectItem>
                    </SelectContent>
                </Select>
            </div>
        </div>
    );
};
