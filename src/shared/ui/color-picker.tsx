// src/shared/ui/color-picker.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Slider } from './slider';
import { Input } from './input';
import { ScrollArea } from './scroll-area';
import { Paintbrush, Palette, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { 
    SOLID_COLOR_PRESETS, 
    GRADIENT_PRESETS,
    GRADIENT_DIRECTIONS,
    GRADIENT_PATTERNS,
    RADIAL_POSITIONS,
    parseGradient,
    generateGradient,
    GradientPatternType,
    GradientOptions
} from '@/shared/constants/color-presets';
import { isGradient, addAlpha } from '@/shared/lib/color-utils';

// ============= TYPES =============

export type ColorPickerVariant = 'button' | 'inline' | 'compact' | 'minimal' | 'circle';

export interface ColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    showGradients?: boolean;
    showAlpha?: boolean;
    label?: string;
    className?: string;
    variant?: ColorPickerVariant;
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    showLabel?: boolean;
    customSolidPresets?: string[];
    customGradientPresets?: string[];
    darkMode?: boolean;
}

// ============= HELPER FUNCTIONS =============

const parseColorValue = (color: string): string => {
    if (!color) return '#000000';
    if (color.startsWith('#')) return color.substring(0, 7);
    if (color.startsWith('rgb')) {
        const match = color.match(/\d+/g);
        if (match && match.length >= 3) {
            return '#' + match.slice(0, 3).map(x => parseInt(x).toString(16).padStart(2, '0')).join('');
        }
    }
    return '#000000';
};

const parseAlpha = (color: string): number => {
    if (color.includes('rgba')) {
        const match = color.match(/[\d.]+\)$/);
        if (match) return parseFloat(match[0]);
    }
    return 1;
};

// ============= COMPACT PRESET GRID =============

interface PresetGridProps {
    presets: string[];
    selectedValue: string;
    onSelect: (color: string) => void;
    isGradient?: boolean;
}

const PresetGrid: React.FC<PresetGridProps> = ({ presets, selectedValue, onSelect, isGradient = false }) => (
    <ScrollArea className="w-full">
        <div className={cn(
            "flex gap-1.5 pb-2",
            isGradient ? "flex-wrap" : ""
        )}>
            {presets.map((preset, idx) => (
                <button
                    key={`${preset}-${idx}`}
                    className={cn(
                        "flex-shrink-0 transition-all hover:scale-105 rounded-md border",
                        isGradient ? "w-12 h-8" : "w-6 h-6",
                        selectedValue === preset 
                            ? 'border-primary ring-1 ring-primary/50' 
                            : 'border-border/30 hover:border-border'
                    )}
                    style={{ background: preset }}
                    onClick={() => onSelect(preset)}
                />
            ))}
        </div>
    </ScrollArea>
);

// ============= COMPACT COLOR INPUT =============

interface CompactColorInputProps {
    value: string;
    onChange: (color: string) => void;
    alpha: number;
    onAlphaChange: (alpha: number) => void;
    showAlpha?: boolean;
}

const CompactColorInput: React.FC<CompactColorInputProps> = ({
    value,
    onChange,
    alpha,
    onAlphaChange,
    showAlpha = true
}) => (
    <div className="flex items-center gap-2">
        <input
            type="color"
            value={parseColorValue(value)}
            onChange={(e) => {
                if (showAlpha && alpha < 1) {
                    onChange(addAlpha(e.target.value, alpha));
                } else {
                    onChange(e.target.value);
                }
            }}
            className="w-8 h-8 rounded cursor-pointer border border-border/30 p-0 bg-transparent"
        />
        <Input
            type="text"
            value={parseColorValue(value)}
            onChange={(e) => {
                const val = e.target.value;
                if (val.startsWith('#') && val.length <= 7) {
                    if (showAlpha && alpha < 1) {
                        onChange(addAlpha(val, alpha));
                    } else {
                        onChange(val);
                    }
                }
            }}
            className="flex-1 h-8 text-xs font-mono px-2"
            placeholder="#000000"
        />
        {showAlpha && (
            <div className="flex items-center gap-1.5 min-w-[70px]">
                <Slider
                    value={[alpha]}
                    onValueChange={([val]) => {
                        onAlphaChange(val);
                        onChange(addAlpha(parseColorValue(value), val));
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    className="flex-1"
                />
                <span className="text-[10px] text-muted-foreground w-7 text-right">
                    {Math.round(alpha * 100)}%
                </span>
            </div>
        )}
    </div>
);

// ============= COMPACT GRADIENT EDITOR =============

interface GradientEditorProps {
    value: string;
    onChange: (gradient: string) => void;
}

const GradientEditor: React.FC<GradientEditorProps> = ({ value, onChange }) => {
    const parsed = useMemo(() => parseGradient(value), [value]);
    
    const [colors, setColors] = useState<string[]>(parsed.colors.length >= 2 ? parsed.colors : ['#667eea', '#764ba2']);
    const [patternType, setPatternType] = useState<GradientPatternType>(parsed.type);
    const [angle, setAngle] = useState(parsed.angle);
    const [position, setPosition] = useState(parsed.position || 'center');
    const [spread, setSpread] = useState(20);
    const [expanded, setExpanded] = useState(false);

    const updateGradient = useCallback((
        newColors?: string[],
        newPattern?: GradientPatternType,
        newAngle?: number,
        newOptions?: GradientOptions
    ) => {
        const c = newColors || colors;
        const p = newPattern || patternType;
        const a = newAngle ?? angle;
        const opts: GradientOptions = {
            position: newOptions?.position || position,
            spread: newOptions?.spread ?? spread,
            intensity: newOptions?.intensity ?? 0.7
        };
        const gradient = generateGradient(p, c, a, opts);
        onChange(gradient);
    }, [colors, patternType, angle, position, spread, onChange]);

    const handleColorChange = (index: number, color: string) => {
        const newColors = [...colors];
        newColors[index] = color;
        setColors(newColors);
        updateGradient(newColors);
    };

    const addColor = () => {
        if (colors.length < 5) {
            const newColors = [...colors, '#888888'];
            setColors(newColors);
            updateGradient(newColors);
        }
    };

    const removeColor = (index: number) => {
        if (colors.length > 2) {
            const newColors = colors.filter((_, i) => i !== index);
            setColors(newColors);
            updateGradient(newColors);
        }
    };

    const handlePatternChange = (newPattern: GradientPatternType) => {
        setPatternType(newPattern);
        updateGradient(undefined, newPattern);
    };

    const handleAngleChange = (newAngle: number) => {
        setAngle(newAngle);
        updateGradient(undefined, undefined, newAngle);
    };

    const handlePositionChange = (newPosition: string) => {
        setPosition(newPosition);
        updateGradient(undefined, undefined, undefined, { position: newPosition, spread });
    };

    const handleSpreadChange = (newSpread: number) => {
        setSpread(newSpread);
        updateGradient(undefined, undefined, undefined, { position, spread: newSpread });
    };

    const needsPosition = ['radial', 'conic', 'repeating-radial', 'spotlight'].includes(patternType);
    const needsSpread = ['repeating-linear', 'repeating-radial', 'diagonal-stripes', 'horizontal-stripes', 'vertical-stripes'].includes(patternType);

    return (
        <div className="space-y-3">
            {/* Preview */}
            <div
                className="w-full h-10 rounded-md border border-border/30"
                style={{ background: value }}
            />

            {/* Pattern Type - Horizontal Scroll */}
            <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Pattern</p>
                <ScrollArea className="w-full">
                    <div className="flex gap-1 pb-1">
                        {GRADIENT_PATTERNS.map((pattern) => (
                            <button
                                key={pattern.id}
                                onClick={() => handlePatternChange(pattern.id)}
                                className={cn(
                                    "flex-shrink-0 h-7 px-2 rounded text-xs flex items-center gap-1 transition-all whitespace-nowrap",
                                    patternType === pattern.id
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-muted/50 hover:bg-muted text-foreground"
                                )}
                                title={pattern.label}
                            >
                                <span>{pattern.icon}</span>
                                <span className="text-[10px]">{pattern.label}</span>
                            </button>
                        ))}
                    </div>
                </ScrollArea>
            </div>

            {/* Color Stops */}
            <div>
                <div className="flex items-center justify-between mb-1.5">
                    <p className="text-[10px] font-medium text-muted-foreground uppercase">Colors</p>
                    {colors.length < 5 && (
                        <button
                            onClick={addColor}
                            className="p-0.5 rounded hover:bg-muted transition-colors"
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="flex gap-1.5 flex-wrap">
                    {colors.map((color, index) => (
                        <div key={index} className="relative group">
                            <input
                                type="color"
                                value={parseColorValue(color)}
                                onChange={(e) => handleColorChange(index, e.target.value)}
                                className="w-8 h-8 rounded cursor-pointer border border-border/30 p-0"
                            />
                            {colors.length > 2 && (
                                <button
                                    onClick={() => removeColor(index)}
                                    className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <X className="w-2 h-2" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Expandable Advanced Controls */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                <span>Advanced</span>
                {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            {expanded && (
                <div className="space-y-3 pt-1">
                    {/* Direction (for linear gradients) */}
                    {!needsPosition && (
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Direction</p>
                            <ScrollArea className="w-full">
                                <div className="flex gap-1 pb-1">
                                    {GRADIENT_DIRECTIONS.map((dir) => (
                                        <button
                                            key={dir.value}
                                            onClick={() => handleAngleChange(dir.value)}
                                            className={cn(
                                                "flex-shrink-0 w-7 h-7 rounded text-sm flex items-center justify-center transition-all",
                                                angle === dir.value
                                                    ? "bg-primary text-primary-foreground"
                                                    : "bg-muted/50 hover:bg-muted"
                                            )}
                                            title={dir.name}
                                        >
                                            {dir.label}
                                        </button>
                                    ))}
                                </div>
                            </ScrollArea>
                            <div className="flex items-center gap-2 mt-2">
                                <Slider
                                    value={[angle]}
                                    onValueChange={([val]) => handleAngleChange(val)}
                                    min={0}
                                    max={360}
                                    step={1}
                                    className="flex-1"
                                />
                                <span className="text-[10px] text-muted-foreground w-8 text-right">{angle}°</span>
                            </div>
                        </div>
                    )}

                    {/* Position (for radial gradients) */}
                    {needsPosition && (
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Position</p>
                            <div className="grid grid-cols-3 gap-1">
                                {RADIAL_POSITIONS.map((pos) => (
                                    <button
                                        key={pos.value}
                                        onClick={() => handlePositionChange(pos.value)}
                                        className={cn(
                                            "h-6 rounded text-xs flex items-center justify-center transition-all",
                                            position === pos.value
                                                ? "bg-primary text-primary-foreground"
                                                : "bg-muted/50 hover:bg-muted"
                                        )}
                                        title={pos.value}
                                    >
                                        {pos.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Spread (for repeating patterns) */}
                    {needsSpread && (
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <p className="text-[10px] font-medium text-muted-foreground uppercase">Spread</p>
                                <span className="text-[10px] text-muted-foreground">{spread}px</span>
                            </div>
                            <Slider
                                value={[spread]}
                                onValueChange={([val]) => handleSpreadChange(val)}
                                min={5}
                                max={100}
                                step={1}
                                className="w-full"
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Quick Presets */}
            <div>
                <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Presets</p>
                <ScrollArea className="w-full">
                    <div className="flex gap-1.5 pb-1">
                        {GRADIENT_PRESETS.map((preset, idx) => (
                            <button
                                key={idx}
                                className={cn(
                                    "flex-shrink-0 w-10 h-8 rounded-md border transition-all hover:scale-105",
                                    value === preset 
                                        ? 'border-primary ring-1 ring-primary/50' 
                                        : 'border-border/30 hover:border-border'
                                )}
                                style={{ background: preset }}
                                onClick={() => onChange(preset)}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

// ============= MAIN COLOR PICKER COMPONENT =============

export const ColorPicker: React.FC<ColorPickerProps> = ({
    value,
    onChange,
    showGradients = true,
    showAlpha = true,
    label,
    className,
    variant = 'button',
    size = 'md',
    disabled = false,
    showLabel = true,
    customSolidPresets,
    customGradientPresets,
    darkMode = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>(
        isGradient(value) ? 'gradient' : 'solid'
    );
    const [alpha, setAlpha] = useState(() => parseAlpha(value));

    const solidPresets = customSolidPresets || SOLID_COLOR_PRESETS;

    const handleColorSelect = (color: string) => {
        if (value === color) {
            onChange('transparent');
        } else {
            onChange(color);
        }
    };

    const sizeClasses = {
        sm: 'h-7 px-2 gap-1.5',
        md: 'h-9 px-3 gap-2',
        lg: 'h-11 px-4 gap-3',
    };

    const swatchSizes = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6',
    };

    // ============= RENDER TRIGGER BASED ON VARIANT =============

    const renderTrigger = () => {
        switch (variant) {
            case 'circle':
                return (
                    <button
                        disabled={disabled}
                        className={cn(
                            "relative rounded-full overflow-hidden border-2 transition-all hover:scale-110 shadow-sm",
                            disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                            darkMode ? "border-white/20" : "border-border",
                            swatchSizes[size],
                            className
                        )}
                    >
                        <div className="w-full h-full" style={{ background: value }} />
                    </button>
                );

            case 'minimal':
                return (
                    <div
                        className={cn(
                            "rounded-md border transition-all hover:scale-105 cursor-pointer shadow-sm",
                            disabled ? "opacity-50 cursor-not-allowed" : "",
                            darkMode ? "border-white/20" : "border-border/50",
                            size === 'sm' ? 'w-7 h-7' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8',
                            className
                        )}
                        style={{ background: value }}
                    />
                );

            case 'compact':
                return (
                    <div className={cn("flex items-center gap-2", className)}>
                        <div
                            className={cn(
                                "rounded-md border transition-all hover:scale-105 cursor-pointer shadow-sm",
                                darkMode ? "border-white/20" : "border-border/50",
                                swatchSizes[size]
                            )}
                            style={{ background: value }}
                        />
                        {showLabel && label && (
                            <span className={cn(
                                "text-xs font-medium",
                                darkMode ? "text-white/70" : "text-muted-foreground"
                            )}>{label}</span>
                        )}
                    </div>
                );

            case 'inline':
                return (
                    <div className={cn(
                        "flex items-center gap-2 p-2 rounded-md border transition-all group cursor-pointer",
                        darkMode 
                            ? "bg-white/5 border-white/10 hover:bg-white/10" 
                            : "bg-muted/30 border-border/30 hover:border-border hover:bg-muted/50",
                        className
                    )}>
                        <div
                            className={cn(
                                "rounded-md border shadow-sm transition-transform group-hover:scale-105",
                                darkMode ? "border-white/20" : "border-border/50",
                                size === 'sm' ? 'w-6 h-6' : size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'
                            )}
                            style={{ background: value }}
                        />
                        {showLabel && (
                            <div className="flex flex-col">
                                <span className={cn(
                                    "text-xs font-medium leading-tight",
                                    darkMode ? "text-white" : ""
                                )}>{label || 'Color'}</span>
                                <span className={cn(
                                    "text-[10px] uppercase leading-tight",
                                    darkMode ? "text-white/50" : "text-muted-foreground"
                                )}>
                                    {isGradient(value) ? 'Gradient' : parseColorValue(value)}
                                </span>
                            </div>
                        )}
                    </div>
                );

            case 'button':
            default:
                return (
                    <Button
                        variant="outline"
                        size="sm"
                        disabled={disabled}
                        className={cn(
                            'border transition-colors',
                            darkMode 
                                ? 'bg-white/10 border-white/20 hover:bg-white/20 text-white' 
                                : 'border-border hover:bg-accent',
                            sizeClasses[size],
                            className
                        )}
                    >
                        <div
                            className={cn(
                                "rounded border shadow-sm",
                                darkMode ? "border-white/30" : "border-border",
                                swatchSizes[size]
                            )}
                            style={{ background: value }}
                        />
                        {label && <span className="text-xs">{label}</span>}
                    </Button>
                );
        }
    };

    // ============= POPOVER CONTENT =============

    const renderContent = () => (
        <ScrollArea className="max-h-[60vh]">
            <div className={cn(
                "w-64 p-3",
                darkMode && "bg-zinc-900 text-white"
            )}>
                {showGradients && (
                    <div className="flex gap-1 mb-3">
                        <button
                            onClick={() => setActiveTab('solid')}
                            className={cn(
                                "flex-1 h-8 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                                activeTab === 'solid'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 hover:bg-muted text-foreground"
                            )}
                        >
                            <Paintbrush className="w-3 h-3" />
                            Solid
                        </button>
                        <button
                            onClick={() => setActiveTab('gradient')}
                            className={cn(
                                "flex-1 h-8 rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                                activeTab === 'gradient'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 hover:bg-muted text-foreground"
                            )}
                        >
                            <Palette className="w-3 h-3" />
                            Gradient
                        </button>
                    </div>
                )}

                {activeTab === 'solid' ? (
                    <div className="space-y-3">
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Presets</p>
                            <PresetGrid
                                presets={solidPresets}
                                selectedValue={value}
                                onSelect={handleColorSelect}
                            />
                        </div>
                        <div>
                            <p className="text-[10px] font-medium text-muted-foreground uppercase mb-1.5">Custom</p>
                            <CompactColorInput
                                value={value}
                                onChange={onChange}
                                alpha={alpha}
                                onAlphaChange={setAlpha}
                                showAlpha={showAlpha}
                            />
                        </div>
                    </div>
                ) : (
                    <GradientEditor
                        value={isGradient(value) ? value : GRADIENT_PRESETS[0]}
                        onChange={onChange}
                    />
                )}
            </div>
        </ScrollArea>
    );

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {renderTrigger()}
            </PopoverTrigger>
            <PopoverContent 
                className={cn(
                    "p-0 w-auto z-[10001]",
                    darkMode && "bg-zinc-900 border-white/10"
                )} 
                align="start"
                side="bottom"
                sideOffset={4}
            >
                {renderContent()}
            </PopoverContent>
        </Popover>
    );
};

// ============= INLINE COLOR PICKER (No Popover) =============

export interface InlineColorPickerProps {
    value: string;
    onChange: (value: string) => void;
    showGradients?: boolean;
    showAlpha?: boolean;
    className?: string;
    darkMode?: boolean;
}

export const InlineColorPicker: React.FC<InlineColorPickerProps> = ({
    value,
    onChange,
    showGradients = true,
    showAlpha = true,
    className,
    darkMode = false,
}) => {
    const [activeTab, setActiveTab] = useState<'solid' | 'gradient'>(
        isGradient(value) ? 'gradient' : 'solid'
    );
    const [alpha, setAlpha] = useState(() => parseAlpha(value));

    const handleColorSelect = (color: string) => {
        if (value === color) {
            onChange('transparent');
        } else {
            onChange(color);
        }
    };

    return (
        <ScrollArea className={cn("max-h-[50vh]", className)}>
            <div className="space-y-3 p-1">
                {showGradients && (
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('solid')}
                            className={cn(
                                "flex-1 h-7 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                                activeTab === 'solid'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 hover:bg-muted"
                            )}
                        >
                            <Paintbrush className="w-3 h-3" />
                            Solid
                        </button>
                        <button
                            onClick={() => setActiveTab('gradient')}
                            className={cn(
                                "flex-1 h-7 rounded text-xs font-medium flex items-center justify-center gap-1.5 transition-all",
                                activeTab === 'gradient'
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/50 hover:bg-muted"
                            )}
                        >
                            <Palette className="w-3 h-3" />
                            Gradient
                        </button>
                    </div>
                )}

                {activeTab === 'solid' ? (
                    <div className="space-y-3">
                        <PresetGrid
                            presets={SOLID_COLOR_PRESETS}
                            selectedValue={value}
                            onSelect={handleColorSelect}
                        />
                        <CompactColorInput
                            value={value}
                            onChange={onChange}
                            alpha={alpha}
                            onAlphaChange={setAlpha}
                            showAlpha={showAlpha}
                        />
                    </div>
                ) : (
                    <GradientEditor
                        value={isGradient(value) ? value : GRADIENT_PRESETS[0]}
                        onChange={onChange}
                    />
                )}
            </div>
        </ScrollArea>
    );
};

// ============= EXPORTS =============

export default ColorPicker;
