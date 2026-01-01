// src/shared/ui/color-picker.tsx
import React, { useState } from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Slider } from './slider';
import { Input } from './input';
import { Paintbrush, Palette } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { SOLID_COLOR_PRESETS, GRADIENT_PRESETS } from '@/shared/constants/color-presets';
import { isGradient, addAlpha } from '@/shared/lib/color-utils';

export interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    showGradients?: boolean;
    showAlpha?: boolean;
    label?: string;
    className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
    value,
    onChange,
    showGradients = true,
    showAlpha = true,
    label,
    className,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>('solid');
    const [customColor, setCustomColor] = useState(value.startsWith('#') ? value : '#000000');
    const [alpha, setAlpha] = useState(1);

    const handleColorSelect = (color: string) => {
        // Toggle: if same color is selected, deselect it (set to transparent)
        if (value === color) {
            onChange('transparent');
        } else {
            onChange(color);
        }
    };

    const handleCustomColorChange = (newColor: string) => {
        setCustomColor(newColor);
        if (showAlpha && alpha < 1) {
            onChange(addAlpha(newColor, alpha));
        } else {
            onChange(newColor);
        }
    };

    const handleAlphaChange = (newAlpha: number[]) => {
        const alphaValue = newAlpha[0];
        setAlpha(alphaValue);
        onChange(addAlpha(customColor, alphaValue));
    };

    const displayValue = value;
    const isGrad = isGradient(value);

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        'h-9 px-3 gap-2 border border-border hover:bg-accent transition-colors',
                        className
                    )}
                >
                    <div
                        className="w-5 h-5 rounded border border-border shadow-sm"
                        style={{ background: displayValue }}
                    />
                    {label && <span className="text-xs">{label}</span>}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-0 z-[10001]" align="start">
                {showGradients ? (
                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'solid' | 'gradient')}>
                        <TabsList className="w-full grid grid-cols-2 rounded-none border-b">
                            <TabsTrigger value="solid" className="gap-2">
                                <Paintbrush className="w-4 h-4" />
                                Solid
                            </TabsTrigger>
                            <TabsTrigger value="gradient" className="gap-2">
                                <Palette className="w-4 h-4" />
                                Gradient
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent value="solid" className="p-4 space-y-4 m-0">
                            {/* Solid Color Presets */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Presets</p>
                                <div className="grid grid-cols-10 gap-1.5">
                                    {SOLID_COLOR_PRESETS.map((preset) => (
                                        <button
                                            key={preset}
                                            className={cn(
                                                'w-6 h-6 rounded border-2 transition-all hover:scale-110',
                                                value === preset ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                                            )}
                                            style={{ backgroundColor: preset }}
                                            onClick={() => handleColorSelect(preset)}
                                            title={preset}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Custom Color */}
                            <div className="space-y-2">
                                <p className="text-xs font-medium text-muted-foreground">Custom</p>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={customColor}
                                        onChange={(e) => handleCustomColorChange(e.target.value)}
                                        className="w-12 h-10 rounded border border-border cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={customColor}
                                        onChange={(e) => {
                                            if (e.target.value.startsWith('#')) {
                                                handleCustomColorChange(e.target.value);
                                            }
                                        }}
                                        className="flex-1 h-10 font-mono text-sm"
                                        placeholder="#000000"
                                    />
                                </div>
                            </div>

                            {/* Alpha Slider */}
                            {showAlpha && (
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <p className="text-xs font-medium text-muted-foreground">Opacity</p>
                                        <span className="text-xs text-muted-foreground">{Math.round(alpha * 100)}%</span>
                                    </div>
                                    <Slider
                                        value={[alpha]}
                                        onValueChange={handleAlphaChange}
                                        min={0}
                                        max={1}
                                        step={0.01}
                                        className="w-full"
                                    />
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="gradient" className="p-4 space-y-4 m-0">
                            {/* Gradient Presets */}
                            <div>
                                <p className="text-xs font-medium text-muted-foreground mb-2">Gradient Presets</p>
                                <div className="grid grid-cols-3 gap-2">
                                    {GRADIENT_PRESETS.map((preset, idx) => (
                                        <button
                                            key={idx}
                                            className={cn(
                                                'h-12 rounded-lg border-2 transition-all hover:scale-105',
                                                value === preset ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                                            )}
                                            style={{ background: preset }}
                                            onClick={() => handleColorSelect(preset)}
                                        />
                                    ))}
                                </div>
                            </div>
                        </TabsContent>
                    </Tabs>
                ) : (
                    <div className="p-4 space-y-4">
                        {/* Solid-only mode */}
                        <div>
                            <p className="text-xs font-medium text-muted-foreground mb-2">Presets</p>
                            <div className="grid grid-cols-10 gap-1.5">
                                {SOLID_COLOR_PRESETS.map((preset) => (
                                    <button
                                        key={preset}
                                        className={cn(
                                            'w-6 h-6 rounded border-2 transition-all hover:scale-110',
                                            value === preset ? 'border-primary ring-2 ring-primary/20' : 'border-border'
                                        )}
                                        style={{ backgroundColor: preset }}
                                        onClick={() => handleColorSelect(preset)}
                                        title={preset}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-xs font-medium text-muted-foreground">Custom</p>
                            <div className="flex gap-2">
                                <input
                                    type="color"
                                    value={customColor}
                                    onChange={(e) => handleCustomColorChange(e.target.value)}
                                    className="w-12 h-10 rounded border border-border cursor-pointer"
                                />
                                <Input
                                    type="text"
                                    value={customColor}
                                    onChange={(e) => {
                                        if (e.target.value.startsWith('#')) {
                                            handleCustomColorChange(e.target.value);
                                        }
                                    }}
                                    className="flex-1 h-10 font-mono text-sm"
                                    placeholder="#000000"
                                />
                            </div>
                        </div>

                        {showAlpha && (
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <p className="text-xs font-medium text-muted-foreground">Opacity</p>
                                    <span className="text-xs text-muted-foreground">{Math.round(alpha * 100)}%</span>
                                </div>
                                <Slider
                                    value={[alpha]}
                                    onValueChange={handleAlphaChange}
                                    min={0}
                                    max={1}
                                    step={0.01}
                                    className="w-full"
                                />
                            </div>
                        )}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
};
