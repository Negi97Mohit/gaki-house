// src/components/PipControlsToolbar.tsx
import React, { useRef, useLayoutEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Wand2,
  Minimize2,
  Image,
  RectangleHorizontal,
  Upload,
  Sparkles,
  Droplet,
  Sun,
  Paintbrush,
  Square,
  Settings2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Slider } from "./ui/slider";
import { Input } from "./ui/input";
import { Label } from "@/components/ui/label";
import { FILTER_PRESETS } from "@/lib/filters";
import { BACKGROUND_PRESETS, ASPECT_RATIOS } from "@/lib/backgrounds";

// 1. Define the extensive props interface for all PiP controls
interface PipControlsToolbarProps {
  position: { x: number; y: number };
  containerRef: React.RefObject<HTMLElement>;
  pipBorder?: { color: string; width: number };
  onPipBorderChange: (border: { color: string; width: number }) => void;
  pipShadow?: { blur: number; color: string };
  onPipShadowChange: (shadow: { blur: number; color: string }) => void;
  isAutoFramingEnabled: boolean;
  onAutoFramingChange: (enabled: boolean) => void;
  isBeautifyEnabled: boolean;
  onBeautifyToggle: (enabled: boolean) => void;
  isLowLightEnabled: boolean;
  onLowLightToggle: (enabled: boolean) => void;
  videoFilter: string;
  onVideoFilterChange: (filter: string) => void;
  isNeonEdgeEnabled: boolean;
  onNeonEdgeToggle: (enabled: boolean) => void;
  neonIntensity: number;
  onNeonIntensityChange: (value: number) => void;
  neonEdgeColor?: string;
  onNeonEdgeColorChange: (color: string) => void;
  zoomSensitivity: number;
  onZoomSensitivityChange: (value: number) => void;
  trackingSpeed: number;
  onTrackingSpeedChange: (value: number) => void;
  cameraBackground: "none" | "blur" | "image";
  onCameraBackgroundChange: (bgId: "none" | "blur" | "image") => void;
  onCustomBackgroundUpload: (file: File) => void;
  cameraAspectRatio: string;
  onCameraAspectRatioChange: (ratio: string) => void;
  customAspectRatio: string;
  onCustomAspectRatioChange: (ratio: string) => void;
  isFaceTrackingEnabled: boolean;
  onFaceTrackingToggle: (enabled: boolean) => void;
}

export const PipControlsToolbar: React.FC<PipControlsToolbarProps> = (
  props
) => {
  const toolbarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toolbarPosition, setToolbarPosition] = useState({ x: 0, y: 0 });

  // 2. Positioning logic copied from TextEditingToolbar
  useLayoutEffect(() => {
    if (toolbarRef.current && props.containerRef.current) {
      const toolbarHeight = toolbarRef.current.offsetHeight;
      const toolbarWidth = toolbarRef.current.offsetWidth;
      const containerRect = props.containerRef.current.getBoundingClientRect();
      const parentRect =
        props.containerRef.current.parentElement!.getBoundingClientRect();

      // Position top-center of the PiP element
      const x = props.position.x - toolbarWidth / 2;
      const y = props.position.y - toolbarHeight - 8; // 8px offset above

      // Clamp X relative to the main container (e.g., the video canvas)
      const clampedX = Math.max(
        parentRect.left - containerRect.left + 8,
        Math.min(x, parentRect.right - containerRect.left - toolbarWidth - 8)
      );
      // Clamp Y
      const clampedY = Math.max(8, y);

      setToolbarPosition({ x: clampedX, y: clampedY });
    }
  }, [props.position, props.containerRef]);

  // 3. Helper handlers for nested controls
  const handlePipBorderWidth = (value: number) => {
    props.onPipBorderChange({ ...props.pipBorder!, width: value });
  };
  const handlePipBorderColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onPipBorderChange({ ...props.pipBorder!, color: e.target.value });
  };
  const handlePipShadowBlur = (value: number) => {
    props.onPipShadowChange({ ...props.pipShadow!, blur: value });
  };
  const handlePipShadowColor = (e: React.ChangeEvent<HTMLInputElement>) => {
    props.onPipShadowChange({ ...props.pipShadow!, color: e.target.value });
  };
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      props.onCustomBackgroundUpload(file);
    }
  };

  const pipBorder = props.pipBorder ?? { color: "#FFFFFF", width: 0 };
  const pipShadow = props.pipShadow ?? { blur: 0, color: "rgba(0,0,0,0.5)" };
  const neonEdgeColor = props.neonEdgeColor ?? "#00FF00";

  // 4. Render the toolbar UI
  return (
    <div
      ref={toolbarRef}
      className="absolute bg-background/40 backdrop-blur-xl border border-border/40 rounded-2xl shadow-2xl p-1.5 flex items-center gap-0.5"
      style={{
        left: `${toolbarPosition.x}px`,
        top: `${toolbarPosition.y}px`,
        zIndex: "var(--z-text-toolbar)", // Reuse z-index
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* --- Group 1: Background & Aspect --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-background/60"
            title="Background & Aspect"
          >
            <Image className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="start"
            className="z-[var(--z-text-toolbar)] w-56 max-h-[400px] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuLabel className="text-xs font-semibold">Aspect Ratio</DropdownMenuLabel>
            {ASPECT_RATIOS.map((ratio) => (
              <DropdownMenuCheckboxItem
                key={ratio.id}
                checked={props.cameraAspectRatio === ratio.id}
                onClick={() => props.onCameraAspectRatioChange(ratio.id)}
                className="text-sm"
              >
                {ratio.name}
              </DropdownMenuCheckboxItem>
            ))}
            {props.cameraAspectRatio === "custom" && (
              <div className="p-2">
                <Input
                  type="text"
                  placeholder="e.g., 21:9"
                  value={props.customAspectRatio}
                  onChange={(e) =>
                    props.onCustomAspectRatioChange(e.target.value)
                  }
                  className="h-8 text-sm"
                />
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="text-xs font-semibold">Background</DropdownMenuLabel>
            {BACKGROUND_PRESETS.map((bg) => (
              <DropdownMenuCheckboxItem
                key={bg.id}
                checked={
                  (bg.id === "none" && props.cameraBackground === "none") ||
                  (bg.id === "blur" && props.cameraBackground === "blur") ||
                  (bg.type === "image" && props.cameraBackground === "image")
                }
                onClick={() =>
                  props.onCameraBackgroundChange(
                    bg.id as "none" | "blur" | "image"
                  )
                }
                className="text-sm"
              >
                {bg.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()} className="text-sm">
              <Upload className="w-3.5 h-3.5 mr-2" />
              Upload
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>


      {/* --- Group 2: Effects & Filters --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-xl hover:bg-background/60"
            title="Effects"
          >
            <Wand2 className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="start"
            className="z-[var(--z-text-toolbar)] w-56 max-h-[500px] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuCheckboxItem
              checked={props.isBeautifyEnabled}
              onCheckedChange={props.onBeautifyToggle}
              className="text-sm"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2" />
              Beautify
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={props.isLowLightEnabled}
              onCheckedChange={props.onLowLightToggle}
              className="text-sm"
            >
              <Sun className="w-3.5 h-3.5 mr-2" />
              Enhance Lighting
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={props.isFaceTrackingEnabled}
              onCheckedChange={props.onFaceTrackingToggle}
              className="text-sm"
            >
              <Camera className="w-3.5 h-3.5 mr-2" />
              Face Tracking
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={props.isAutoFramingEnabled}
              onCheckedChange={props.onAutoFramingChange}
              className="text-sm"
            >
              <Minimize2 className="w-3.5 h-3.5 mr-2" />
              Auto Framing
            </DropdownMenuCheckboxItem>
            {props.isAutoFramingEnabled && (
              <div className="p-3 space-y-3 bg-muted/30 rounded-lg m-2">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Zoom {props.zoomSensitivity.toFixed(1)}x
                  </Label>
                  <Slider
                    value={[props.zoomSensitivity]}
                    onValueChange={([v]) => props.onZoomSensitivityChange(v)}
                    min={1}
                    max={10}
                    step={0.1}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">
                    Speed {(props.trackingSpeed * 100).toFixed(0)}%
                  </Label>
                  <Slider
                    value={[props.trackingSpeed]}
                    onValueChange={([v]) => props.onTrackingSpeedChange(v)}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                  />
                </div>
              </div>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger className="text-sm">
                <Droplet className="w-3.5 h-3.5 mr-2" />
                Filters
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                <DropdownMenuSubContent className="z-[var(--z-text-toolbar)] p-2 bg-background/95 backdrop-blur-xl border-border/40">
                  <div className="grid grid-cols-3 gap-2 w-[260px] max-h-[240px] overflow-y-auto pr-1">
                    {FILTER_PRESETS.map((filter) => {
                      const isSelected = props.videoFilter === filter.style;
                      return (
                        <button
                          key={filter.id}
                          onClick={() =>
                            props.onVideoFilterChange(filter.style)
                          }
                          className={cn(
                            "aspect-video rounded-lg border transition-all duration-200 relative overflow-hidden group",
                            isSelected
                              ? "border-primary shadow-md ring-2 ring-primary/30"
                              : "border-border/40 hover:border-border"
                          )}
                          title={filter.name}
                        >
                          <img
                            src="/placeholder.jpeg"
                            alt={filter.name}
                            className="w-full h-full object-cover"
                            style={{ filter: filter.style }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                            <span className="text-white text-[8px] font-semibold truncate block text-center">
                              {filter.name}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </DropdownMenuSubContent>
              </DropdownMenuPortal>
            </DropdownMenuSub>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      {/* --- Group 3: Style --- */}
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
                    <Label className="text-[10px] text-muted-foreground">Width {pipBorder.width}px</Label>
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
                    <Label className="text-[10px] text-muted-foreground">Blur {pipShadow.blur}px</Label>
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
              checked={props.isNeonEdgeEnabled}
              onCheckedChange={props.onNeonEdgeToggle}
              className="text-sm"
            >
              <Settings2 className="w-3.5 h-3.5 mr-2" />
              Neon Edge
            </DropdownMenuCheckboxItem>
            {props.isNeonEdgeEnabled && (
              <div className="p-3 space-y-3 bg-muted/30 rounded-lg m-2">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold">Color</Label>
                  <Input
                    type="color"
                    className="w-full h-9 p-1 rounded-lg cursor-pointer"
                    value={neonEdgeColor}
                    onChange={(e) => props.onNeonEdgeColorChange(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-medium">
                    Intensity {props.neonIntensity}%
                  </Label>
                  <Slider
                    value={[props.neonIntensity]}
                    onValueChange={([v]) => props.onNeonIntensityChange(v)}
                    min={0}
                    max={100}
                    step={1}
                  />
                </div>
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg"
        className="hidden"
        onChange={handleFileUpload}
      />
    </div>
  );
};
