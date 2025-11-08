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
  Shadow,
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

  // 4. Render the toolbar UI
  return (
    <div
      ref={toolbarRef}
      className="absolute bg-background/95 backdrop-blur-md border-2 border-border rounded-xl shadow-2xl p-2 flex items-center gap-1"
      style={{
        left: `${toolbarPosition.x}px`,
        top: `${toolbarPosition.y}px`,
        zIndex: "var(--z-text-toolbar)", // Reuse z-index
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
    >
      {/* --- Group 1: Camera Background & Aspect Ratio --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Camera Settings"
          >
            <Camera className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="start"
            className="z-[var(--z-text-toolbar)] max-h-[50vh] overflow-y-auto"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuLabel>Camera Background</DropdownMenuLabel>
            {BACKGROUND_PRESETS.map((bg) => (
              <DropdownMenuCheckboxItem
                key={bg.id}
                checked={
                  (bg.id === "none" && props.cameraBackground === "none") ||
                  (bg.id === "blur" && props.cameraBackground === "blur") ||
                  (bg.type === "image" && props.cameraBackground === "image") // Simplified check
                }
                onClick={() =>
                  props.onCameraBackgroundChange(
                    bg.id as "none" | "blur" | "image"
                  )
                }
              >
                {bg.id === "none" ? (
                  <Image className="w-4 h-4 mr-2" />
                ) : (
                  <Sparkles className="w-4 h-4 mr-2" />
                )}
                {bg.name}
              </DropdownMenuCheckboxItem>
            ))}
            <DropdownMenuItem onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Background
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Aspect Ratio</DropdownMenuLabel>
            {ASPECT_RATIOS.map((ratio) => (
              <DropdownMenuCheckboxItem
                key={ratio.id}
                checked={props.cameraAspectRatio === ratio.id}
                onClick={() => props.onCameraAspectRatioChange(ratio.id)}
              >
                <RectangleHorizontal className="w-4 h-4 mr-2" />
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
                  className="border-primary/30 font-mono text-sm h-8"
                />
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      {/* --- Group 2: Tracking & Framing --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Tracking & Framing"
          >
            <Minimize2 className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="start"
            className="z-[var(--z-text-toolbar)] w-56"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuCheckboxItem
              checked={props.isFaceTrackingEnabled}
              onCheckedChange={props.onFaceTrackingToggle}
            >
              AI Face Tracking
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={props.isAutoFramingEnabled}
              onCheckedChange={props.onAutoFramingChange}
            >
              Auto Framing
            </DropdownMenuCheckboxItem>
            {props.isAutoFramingEnabled && (
              <>
                <DropdownMenuSeparator />
                <div className="p-2 space-y-2">
                  <Label className="text-xs">
                    Zoom: {props.zoomSensitivity.toFixed(1)}
                  </Label>
                  <Slider
                    value={[props.zoomSensitivity]}
                    onValueChange={([v]) => props.onZoomSensitivityChange(v)}
                    min={1}
                    max={10}
                    step={0.1}
                  />
                </div>
                <div className="p-2 space-y-2">
                  <Label className="text-xs">
                    Speed: {props.trackingSpeed.toFixed(2)}
                  </Label>
                  <Slider
                    value={[props.trackingSpeed]}
                    onValueChange={([v]) => props.onTrackingSpeedChange(v)}
                    min={0.01}
                    max={0.5}
                    step={0.01}
                  />
                </div>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>

      {/* --- Group 3: Effects & Filters --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Effects & Filters"
          >
            <Wand2 className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="start"
            className="z-[var(--z-text-toolbar)]"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuCheckboxItem
              checked={props.isBeautifyEnabled}
              onCheckedChange={props.onBeautifyToggle}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Beautify
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={props.isLowLightEnabled}
              onCheckedChange={props.onLowLightToggle}
            >
              <Sun className="w-4 h-4 mr-2" />
              Low Light Enhance
            </DropdownMenuCheckboxItem>
            <DropdownMenuSeparator />
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Droplet className="w-4 h-4 mr-2" />
                Video Filter
              </DropdownMenuSubTrigger>
              <DropdownMenuPortal>
                {/* --- MODIFIED: Replaced text list with visual grid --- */}
                <DropdownMenuSubContent className="z-[var(--z-text-toolbar)] p-2">
                  <div className="grid grid-cols-3 gap-2 w-[240px] max-h-[200px] overflow-y-auto pr-2">
                    {" "}
                    {FILTER_PRESETS.map((filter) => {
                      const isSelected = props.videoFilter === filter.style;
                      return (
                        <button
                          key={filter.id}
                          onClick={() =>
                            props.onVideoFilterChange(filter.style)
                          }
                          className={cn(
                            "aspect-video rounded-md border-2 transition-all duration-200 relative overflow-hidden group",
                            isSelected
                              ? "border-primary shadow-lg"
                              : "border-border hover:border-primary/60"
                          )}
                          title={filter.name}
                        >
                          <img
                            src="/placeholder.jpeg"
                            alt={filter.name}
                            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                            style={{ filter: filter.style }}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 p-1">
                            <span className="text-white text-[9px] font-bold font-cyber truncate block text-center">
                              {filter.name.toUpperCase()}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-primary-foreground" />
                            </div>
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

      {/* --- Group 4: Style & Appearance --- */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Appearance"
          >
            <Paintbrush className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuPortal>
          <DropdownMenuContent
            align="start"
            className="z-[var(--z-text-toolbar)] w-56"
            onCloseAutoFocus={(e) => e.preventDefault()}
          >
            <DropdownMenuLabel>Camera Border</DropdownMenuLabel>
            <div className="p-2 flex gap-2 items-center">
              <Input
                type="color"
                className="w-10 h-10 p-1"
                value={pipBorder.color}
                onChange={handlePipBorderColor}
              />
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Width: {pipBorder.width}px</Label>
                <Slider
                  value={[pipBorder.width]}
                  onValueChange={([v]) => handlePipBorderWidth(v)}
                  min={0}
                  max={20}
                  step={1}
                />
              </div>
            </div>
            <DropdownMenuLabel>Camera Shadow</DropdownMenuLabel>
            <div className="p-2 flex gap-2 items-center">
              <Input
                type="color"
                className="w-10 h-10 p-1"
                value={pipShadow.color}
                onChange={handlePipShadowColor}
              />
              <div className="flex-1 space-y-1">
                <Label className="text-xs">Blur: {pipShadow.blur}px</Label>
                <Slider
                  value={[pipShadow.blur]}
                  onValueChange={([v]) => handlePipShadowBlur(v)}
                  min={0}
                  max={50}
                  step={1}
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuCheckboxItem
              checked={props.isNeonEdgeEnabled}
              onCheckedChange={props.onNeonEdgeToggle}
            >
              <Settings2 className="w-4 h-4 mr-2" />
              Neon Edge
            </DropdownMenuCheckboxItem>
            {props.isNeonEdgeEnabled && (
              <div className="p-2 space-y-2">
                <Label className="text-xs">
                  Intensity: {props.neonIntensity}%
                </Label>
                <Slider
                  value={[props.neonIntensity]}
                  onValueChange={([v]) => props.onNeonIntensityChange(v)}
                  min={0}
                  max={100}
                  step={1}
                />
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
