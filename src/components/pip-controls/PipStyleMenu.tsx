import React from "react";
import {
    Paintbrush,
    Square,
    RectangleHorizontal,
    Circle,
    Sparkles,
    Sun,
    Minimize2,
    Settings2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuCheckboxItem,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CameraShape } from "@/types/caption";

interface PipStyleMenuProps {
    cameraShape?: CameraShape;
    onCameraShapeChange?: (shape: CameraShape) => void;
    pipBorder?: { color: string; width: number };
    onPipBorderChange: (border: { color: string; width: number }) => void;
    pipShadow?: { blur: number; color: string };
    onPipShadowChange: (shadow: { blur: number; color: string }) => void;
    isBeautifyEnabled: boolean;
    onBeautifyToggle: (enabled: boolean) => void;
    isLowLightEnabled: boolean;
    onLowLightToggle: (enabled: boolean) => void;
    isAutoFramingEnabled: boolean;
    onAutoFramingChange: (enabled: boolean) => void;
    zoomSensitivity: number;
    onZoomSensitivityChange: (value: number) => void;
    trackingSpeed: number;
    onTrackingSpeedChange: (value: number) => void;
    isNeonEdgeEnabled: boolean;
    onNeonEdgeToggle: (enabled: boolean) => void;
    neonIntensity: number;
    onNeonIntensityChange: (value: number) => void;
    neonEdgeColor?: string;
    onNeonEdgeColorChange: (color: string) => void;
}

export const PipStyleMenu: React.FC<PipStyleMenuProps> = ({
    cameraShape,
    onCameraShapeChange,
    pipBorder = { color: "#FFFFFF", width: 0 },
    onPipBorderChange,
    pipShadow = { blur: 0, color: "rgba(0,0,0,0.5)" },
    onPipShadowChange,
    isBeautifyEnabled,
    onBeautifyToggle,
    isLowLightEnabled,
    onLowLightToggle,
    isAutoFramingEnabled,
    onAutoFramingChange,
    zoomSensitivity,
    onZoomSensitivityChange,
    trackingSpeed,
    onTrackingSpeedChange,
    isNeonEdgeEnabled,
    onNeonEdgeToggle,
    neonIntensity,
    onNeonIntensityChange,
    neonEdgeColor = "#00FF00",
    onNeonEdgeColorChange,
}) => {
    const handlePipBorderWidth = (value: number) => {
        onPipBorderChange({ ...pipBorder, width: value });
    };
    const handlePipBorderColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        onPipBorderChange({ ...pipBorder, color: e.target.value });
    };
    const handlePipShadowBlur = (value: number) => {
        onPipShadowChange({ ...pipShadow, blur: value });
    };
    const handlePipShadowColor = (e: React.ChangeEvent<HTMLInputElement>) => {
        onPipShadowChange({ ...pipShadow, color: e.target.value });
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-background/60"
                    title="Style"
                >
                    <Paintbrush className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
                <DropdownMenuContent
                    align="start"
                    className="z-[var(--z-text-toolbar)] w-64 max-h-[500px] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    {onCameraShapeChange && (
                        <>
                            <DropdownMenuLabel className="text-xs font-semibold">
                                Shape
                            </DropdownMenuLabel>
                            <div className="grid grid-cols-3 gap-2 p-2">
                                <Button
                                    variant={cameraShape === "rectangle" ? "default" : "outline"}
                                    size="sm"
                                    className="h-8"
                                    onClick={() => onCameraShapeChange?.("rectangle")}
                                    title="Rectangle"
                                >
                                    <Square className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={cameraShape === "rounded" ? "default" : "outline"}
                                    size="sm"
                                    className="h-8"
                                    onClick={() => onCameraShapeChange?.("rounded")}
                                    title="Rounded"
                                >
                                    <RectangleHorizontal className="w-4 h-4" />
                                </Button>
                                <Button
                                    variant={cameraShape === "circle" ? "default" : "outline"}
                                    size="sm"
                                    className="h-8"
                                    onClick={() => onCameraShapeChange?.("circle")}
                                    title="Circle"
                                >
                                    <Circle className="w-4 h-4" />
                                </Button>
                            </div>
                            <DropdownMenuSeparator />
                        </>
                    )}

                    <div className="p-3 space-y-3">
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Border</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="color"
                                    className="w-12 h-9 p-1 rounded-lg cursor-pointer"
                                    value={pipBorder.color}
                                    onChange={handlePipBorderColor}
                                />
                                <div className="flex-1 space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">
                                        Width {pipBorder.width}px
                                    </Label>
                                    <Slider
                                        value={[pipBorder.width]}
                                        onValueChange={([v]) => handlePipBorderWidth(v)}
                                        min={0}
                                        max={20}
                                        step={1}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-xs font-semibold">Shadow</Label>
                            <div className="flex gap-2 items-center">
                                <Input
                                    type="color"
                                    className="w-12 h-9 p-1 rounded-lg cursor-pointer"
                                    value={pipShadow.color}
                                    onChange={handlePipShadowColor}
                                />
                                <div className="flex-1 space-y-1">
                                    <Label className="text-[10px] text-muted-foreground">
                                        Blur {pipShadow.blur}px
                                    </Label>
                                    <Slider
                                        value={[pipShadow.blur]}
                                        onValueChange={([v]) => handlePipShadowBlur(v)}
                                        min={0}
                                        max={50}
                                        step={1}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={isBeautifyEnabled}
                        onCheckedChange={onBeautifyToggle}
                        className="text-sm"
                    >
                        <Sparkles className="w-3.5 h-3.5 mr-2" />
                        Beautify
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                        checked={isLowLightEnabled}
                        onCheckedChange={onLowLightToggle}
                        className="text-sm"
                    >
                        <Sun className="w-3.5 h-3.5 mr-2" />
                        Enhance Lighting
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={isAutoFramingEnabled}
                        onCheckedChange={onAutoFramingChange}
                        className="text-sm"
                    >
                        <Minimize2 className="w-3.5 h-3.5 mr-2" />
                        Auto Framing
                    </DropdownMenuCheckboxItem>
                    {isAutoFramingEnabled && (
                        <div className="p-3 space-y-3 bg-muted/30 rounded-lg m-2">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Zoom {zoomSensitivity.toFixed(1)}x
                                </Label>
                                <Slider
                                    value={[zoomSensitivity]}
                                    onValueChange={([v]) => onZoomSensitivityChange(v)}
                                    min={1}
                                    max={10}
                                    step={0.1}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-xs font-medium">
                                    Speed {(trackingSpeed * 100).toFixed(0)}%
                                </Label>
                                <Slider
                                    value={[trackingSpeed]}
                                    onValueChange={([v]) => onTrackingSpeedChange(v)}
                                    min={0.01}
                                    max={0.5}
                                    step={0.01}
                                />
                            </div>
                        </div>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuCheckboxItem
                        checked={isNeonEdgeEnabled}
                        onCheckedChange={onNeonEdgeToggle}
                        className="text-sm"
                    >
                        <Settings2 className="w-3.5 h-3.5 mr-2" />
                        Neon Edge (Legacy)
                    </DropdownMenuCheckboxItem>
                    {isNeonEdgeEnabled && (
                        <div className="p-3 space-y-3 bg-muted/30 rounded-lg m-2">
                            <div className="space-y-2">
                                <Label className="text-xs font-semibold">Color</Label>
                                <Input
                                    type="color"
                                    className="w-full h-9 p-1 rounded-lg cursor-pointer"
                                    value={neonEdgeColor}
                                    onChange={(e) => onNeonEdgeColorChange(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-xs font-medium">
                                    Intensity {neonIntensity}%
                                </Label>
                                <Slider
                                    value={[neonIntensity]}
                                    onValueChange={([v]) => onNeonIntensityChange(v)}
                                    min={0}
                                    max={100}
                                    step={1}
                                />
                            </div>
                        </div>
                    )}
                    <DropdownMenuSeparator />
                </DropdownMenuContent>
            </DropdownMenuPortal>
        </DropdownMenu>
    );
};
