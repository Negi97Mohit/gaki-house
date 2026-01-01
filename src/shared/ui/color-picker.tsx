// src/shared/ui/color-picker.tsx
import React, { useState, useMemo, useCallback } from 'react';
import { Button } from './button';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Slider } from './slider';
import { Input } from './input';
import { Paintbrush, Palette, Plus, Trash2, RotateCcw, Settings2 } from 'lucide-react';
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

// ============= PRESET GRID COMPONENT =============

interface PresetGridProps {
    presets: string[];
    selectedValue: string;
    onSelect: (color: string) => void;
    isGradient?: boolean;
}

const PresetGrid: React.FC<PresetGridProps> = ({ presets, selectedValue, onSelect, isGradient = false }) => (
    <div className={cn(
        "grid gap-1.5",
        isGradient ? "grid-cols-3" : "grid-cols-8"
    )}>
        {presets.map((preset, idx) => (
            <button
                key={`${preset}-${idx}`}
                className={cn(
                    "transition-all hover:scale-110 border-2",
                    isGradient ? "h-10 rounded-lg" : "w-6 h-6 rounded",
                    selectedValue === preset 
                        ? 'border-primary ring-2 ring-primary/30' 
                        : 'border-border/50 hover:border-border'
                )}
                style={{ background: preset }}
                onClick={() => onSelect(preset)}
                title={preset}
            />
        ))}
    </div>
);

// ============= CUSTOM COLOR INPUT COMPONENT =============

interface CustomColorInputProps {
    value: string;
    onChange: (color: string) => void;
    alpha: number;
    onAlphaChange: (alpha: number) => void;
    showAlpha?: boolean;
    darkMode?: boolean;
}

const CustomColorInput: React.FC<CustomColorInputProps> = ({
    value,
    onChange,
    alpha,
    onAlphaChange,
    showAlpha = true,
    darkMode = false
}) => (
    <div className="space-y-3">
        <p className={cn(
            "text-xs font-medium uppercase tracking-wide",
            darkMode ? "text-white/60" : "text-muted-foreground"
        )}>Custom</p>
        <div className="flex gap-2">
            <div className="relative">
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
                    className={cn(
                        "w-12 h-10 rounded-lg cursor-pointer border-0 p-0",
                        darkMode ? "bg-white/10" : "bg-background"
                    )}
                />
            </div>
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
                className={cn(
                    "flex-1 h-10 font-mono text-sm",
                    darkMode && "bg-white/10 border-white/20 text-white"
                )}
                placeholder="#000000"
            />
        </div>
        
        {showAlpha && (
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <p className={cn(
                        "text-xs font-medium uppercase tracking-wide",
                        darkMode ? "text-white/60" : "text-muted-foreground"
                    )}>Opacity</p>
                    <span className={cn(
                        "text-xs",
                        darkMode ? "text-white/60" : "text-muted-foreground"
                    )}>{Math.round(alpha * 100)}%</span>
                </div>
                <Slider
                    value={[alpha]}
                    onValueChange={([val]) => {
                        onAlphaChange(val);
                        onChange(addAlpha(parseColorValue(value), val));
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    className="w-full"
                />
            </div>
        )}
    </div>
);

// ============= GRADIENT EDITOR COMPONENT =============

interface GradientEditorProps {
    value: string;
    onChange: (gradient: string) => void;
    darkMode?: boolean;
}

const GradientEditor: React.FC<GradientEditorProps> = ({ value, onChange, darkMode = false }) => {
    const parsed = useMemo(() => parseGradient(value), [value]);
    
    const [colors, setColors] = useState<string[]>(parsed.colors.length >= 2 ? parsed.colors : ['#667eea', '#764ba2']);
    const [patternType, setPatternType] = useState<GradientPatternType>(parsed.type);
    const [angle, setAngle] = useState(parsed.angle);
    const [position, setPosition] = useState(parsed.position || 'center');
    const [spread, setSpread] = useState(20);
    const [showAdvanced, setShowAdvanced] = useState(false);

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
        <div className="space-y-4">
            {/* Preview */}
            <div
                className="w-full h-16 rounded-lg border border-border/50"
                style={{ background: value }}
            />

            {/* Pattern Type Selector */}
            <div>
                <p className={cn(
                    "text-xs font-medium mb-2 uppercase tracking-wide",
                    darkMode ? "text-white/60" : "text-muted-foreground"
                )}>Pattern</p>
                <div className="grid grid-cols-5 gap-1">
                    {GRADIENT_PATTERNS.map((pattern) => (
                        <button
                            key={pattern.id}
                            onClick={() => handlePatternChange(pattern.id)}
                            className={cn(
                                "h-8 rounded text-xs flex items-center justify-center transition-all",
                                patternType === pattern.id
                                    ? "bg-primary text-primary-foreground"
                                    : darkMode 
                                        ? "bg-white/10 hover:bg-white/20 text-white"
                                        : "bg-muted hover:bg-muted/80"
                            )}
                            title={pattern.label}
                        >
                            <span className="text-sm">{pattern.icon}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Colors */}
            <div>
                <div className="flex items-center justify-between mb-2">
                    <p className={cn(
                        "text-xs font-medium uppercase tracking-wide",
                        darkMode ? "text-white/60" : "text-muted-foreground"
                    )}>Colors</p>
                    {colors.length < 5 && (
                        <button
                            onClick={addColor}
                            className={cn(
                                "p-1 rounded hover:bg-muted transition-colors",
                                darkMode && "hover:bg-white/10"
                            )}
                        >
                            <Plus className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    {colors.map((color, index) => (
                        <div key={index} className="relative group">
                            <input
                                type="color"
                                value={parseColorValue(color)}
                                onChange={(e) => handleColorChange(index, e.target.value)}
                                className="w-10 h-10 rounded-lg cursor-pointer border-2 border-border/50 p-0"
                            />
                            {colors.length > 2 && (
                                <button
                                    onClick={() => removeColor(index)}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                >
                                    <Trash2 className="w-2.5 h-2.5" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Direction (for linear gradients) */}
            {!needsPosition && (
                <div>
                    <p className={cn(
                        "text-xs font-medium mb-2 uppercase tracking-wide",
                        darkMode ? "text-white/60" : "text-muted-foreground"
                    )}>Direction</p>
                    <div className="grid grid-cols-8 gap-1">
                        {GRADIENT_DIRECTIONS.map((dir) => (
                            <button
                                key={dir.value}
                                onClick={() => handleAngleChange(dir.value)}
                                className={cn(
                                    "h-8 rounded text-sm flex items-center justify-center transition-all",
                                    angle === dir.value
                                        ? "bg-primary text-primary-foreground"
                                        : darkMode 
                                            ? "bg-white/10 hover:bg-white/20 text-white"
                                            : "bg-muted hover:bg-muted/80"
                                )}
                                title={dir.name}
                            >
                                {dir.label}
                            </button>
                        ))}
                    </div>
                    {/* Custom angle slider */}
                    <div className="mt-2 flex items-center gap-2">
                        <Slider
                            value={[angle]}
                            onValueChange={([val]) => handleAngleChange(val)}
                            min={0}
                            max={360}
                            step={1}
                            className="flex-1"
                        />
                        <span className={cn(
                            "text-xs w-10 text-right",
                            darkMode ? "text-white/60" : "text-muted-foreground"
                        )}>{angle}°</span>
                    </div>
                </div>
            )}

            {/* Position (for radial gradients) */}
            {needsPosition && (
                <div>
                    <p className={cn(
                        "text-xs font-medium mb-2 uppercase tracking-wide",
                        darkMode ? "text-white/60" : "text-muted-foreground"
                    )}>Position</p>
                    <div className="grid grid-cols-3 gap-1">
                        {RADIAL_POSITIONS.map((pos) => (
                            <button
                                key={pos.value}
                                onClick={() => handlePositionChange(pos.value)}
                                className={cn(
                                    "h-8 rounded text-sm flex items-center justify-center transition-all",
                                    position === pos.value
                                        ? "bg-primary text-primary-foreground"
                                        : darkMode 
                                            ? "bg-white/10 hover:bg-white/20 text-white"
                                            : "bg-muted hover:bg-muted/80"
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
                    <div className="flex items-center justify-between mb-2">
                        <p className={cn(
                            "text-xs font-medium uppercase tracking-wide",
                            darkMode ? "text-white/60" : "text-muted-foreground"
                        )}>Spread</p>
                        <span className={cn(
                            "text-xs",
                            darkMode ? "text-white/60" : "text-muted-foreground"
                        )}>{spread}px</span>
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

            {/* Quick Presets */}
            <div>
                <p className={cn(
                    "text-xs font-medium mb-2 uppercase tracking-wide",
                    darkMode ? "text-white/60" : "text-muted-foreground"
                )}>Presets</p>
                <PresetGrid
                    presets={GRADIENT_PRESETS}
                    selectedValue={value}
                    onSelect={onChange}
                    isGradient
                />
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
    const gradientPresets = customGradientPresets || GRADIENT_PRESETS;

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
                        <div
                            className="w-full h-full"
                            style={{ background: value }}
                        />
                    </button>
                );

            case 'minimal':
                return (
                    <div
                        className={cn(
                            "rounded-lg border transition-all hover:scale-105 cursor-pointer shadow-sm",
                            disabled ? "opacity-50 cursor-not-allowed" : "",
                            darkMode ? "border-white/20" : "border-border/50",
                            size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10',
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
                                "rounded-lg border transition-all hover:scale-105 cursor-pointer shadow-sm",
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
                        "flex items-center gap-3 p-3 rounded-xl border transition-all group",
                        darkMode 
                            ? "bg-white/5 border-white/10 hover:bg-white/10" 
                            : "bg-muted/50 border-border/50 hover:border-border hover:bg-muted/70",
                        className
                    )}>
                        <div className="relative">
                            <div
                                className={cn(
                                    "rounded-lg border-2 shadow-sm transition-transform group-hover:scale-105",
                                    darkMode ? "border-white/20" : "border-border/50",
                                    size === 'sm' ? 'w-8 h-8' : size === 'lg' ? 'w-12 h-12' : 'w-10 h-10'
                                )}
                                style={{ background: value }}
                            />
                        </div>
                        {showLabel && (
                            <div className="flex flex-col gap-0.5">
                                <span className={cn(
                                    "text-xs font-medium",
                                    darkMode ? "text-white" : ""
                                )}>{label || 'Color'}</span>
                                <span className={cn(
                                    "text-[10px] uppercase",
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
        <div className={cn(
            "w-80",
            darkMode && "bg-zinc-900 text-white"
        )}>
            {showGradients ? (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'solid' | 'gradient')}>
                    <TabsList className={cn(
                        "w-full grid grid-cols-2 rounded-none border-b",
                        darkMode && "bg-transparent border-white/10"
                    )}>
                        <TabsTrigger value="solid" className={cn(
                            "gap-2",
                            darkMode && "data-[state=active]:bg-white/10"
                        )}>
                            <Paintbrush className="w-4 h-4" />
                            Solid
                        </TabsTrigger>
                        <TabsTrigger value="gradient" className={cn(
                            "gap-2",
                            darkMode && "data-[state=active]:bg-white/10"
                        )}>
                            <Palette className="w-4 h-4" />
                            Gradient
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="solid" className="p-4 space-y-4 m-0">
                        <div>
                            <p className={cn(
                                "text-xs font-medium mb-2 uppercase tracking-wide",
                                darkMode ? "text-white/60" : "text-muted-foreground"
                            )}>Presets</p>
                            <PresetGrid
                                presets={solidPresets}
                                selectedValue={value}
                                onSelect={handleColorSelect}
                            />
                        </div>
                        <CustomColorInput
                            value={value}
                            onChange={onChange}
                            alpha={alpha}
                            onAlphaChange={setAlpha}
                            showAlpha={showAlpha}
                            darkMode={darkMode}
                        />
                    </TabsContent>

                    <TabsContent value="gradient" className="p-4 m-0">
                        <GradientEditor
                            value={isGradient(value) ? value : GRADIENT_PRESETS[0]}
                            onChange={onChange}
                            darkMode={darkMode}
                        />
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="p-4 space-y-4">
                    <div>
                        <p className={cn(
                            "text-xs font-medium mb-2 uppercase tracking-wide",
                            darkMode ? "text-white/60" : "text-muted-foreground"
                        )}>Presets</p>
                        <PresetGrid
                            presets={solidPresets}
                            selectedValue={value}
                            onSelect={handleColorSelect}
                        />
                    </div>
                    <CustomColorInput
                        value={value}
                        onChange={onChange}
                        alpha={alpha}
                        onAlphaChange={setAlpha}
                        showAlpha={showAlpha}
                        darkMode={darkMode}
                    />
                </div>
            )}
        </div>
    );

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                {renderTrigger()}
            </PopoverTrigger>
            <PopoverContent 
                className={cn(
                    "p-0 z-[10001]",
                    darkMode && "bg-zinc-900 border-white/10"
                )} 
                align="start"
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
        <div className={cn("space-y-4", className)}>
            {showGradients ? (
                <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'solid' | 'gradient')}>
                    <TabsList className={cn(
                        "w-full grid grid-cols-2",
                        darkMode && "bg-white/10"
                    )}>
                        <TabsTrigger value="solid" className="gap-2">
                            <Paintbrush className="w-4 h-4" />
                            Solid
                        </TabsTrigger>
                        <TabsTrigger value="gradient" className="gap-2">
                            <Palette className="w-4 h-4" />
                            Gradient
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="solid" className="space-y-4 mt-4">
                        <PresetGrid
                            presets={SOLID_COLOR_PRESETS}
                            selectedValue={value}
                            onSelect={handleColorSelect}
                        />
                        <CustomColorInput
                            value={value}
                            onChange={onChange}
                            alpha={alpha}
                            onAlphaChange={setAlpha}
                            showAlpha={showAlpha}
                            darkMode={darkMode}
                        />
                    </TabsContent>

                    <TabsContent value="gradient" className="mt-4">
                        <GradientEditor
                            value={isGradient(value) ? value : GRADIENT_PRESETS[0]}
                            onChange={onChange}
                            darkMode={darkMode}
                        />
                    </TabsContent>
                </Tabs>
            ) : (
                <>
                    <PresetGrid
                        presets={SOLID_COLOR_PRESETS}
                        selectedValue={value}
                        onSelect={handleColorSelect}
                    />
                    <CustomColorInput
                        value={value}
                        onChange={onChange}
                        alpha={alpha}
                        onAlphaChange={setAlpha}
                        showAlpha={showAlpha}
                        darkMode={darkMode}
                    />
                </>
            )}
        </div>
    );
};

// ============= EXPORTS =============

export default ColorPicker;
