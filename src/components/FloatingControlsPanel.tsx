// src/components/FloatingControlsPanel.tsx

import React, { useState, useRef, useEffect } from "react";
import {
  SlidersHorizontal,
  X,
  Trash2,
  Paintbrush,
  Zap,
  Palette,
  Droplets,
  Sparkles,
  Square,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { StyleControls } from "./StyleControls";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { DYNAMIC_STYLES } from "@/lib/dynamicCaptionStyles";
import { FILTER_PRESETS } from "@/lib/filters";
import { CAPTION_PRESETS } from "@/lib/captionPresets";
import { CaptionStyle, GeneratedOverlay } from "@/types/caption";
import { Input } from "./ui/input";

interface FloatingControlsPanelProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
  dynamicStyle: string;
  onDynamicStyleChange: (styleId: string) => void;
  backgroundEffect: "none" | "blur" | "image";
  onBackgroundEffectChange: (effect: "none" | "blur" | "image") => void;
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
  savedOverlays: GeneratedOverlay[];
  onAddSavedOverlay: (overlay: GeneratedOverlay) => void;
  onDeleteSavedOverlay: (id: string) => void;
  zoomSensitivity: number;
  onZoomSensitivityChange: (value: number) => void;
  trackingSpeed: number;
  onTrackingSpeedChange: (value: number) => void;
  isMouseActive: boolean;
  blankCanvasColor: string;
  onBlankCanvasColorChange: (color: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const FloatingControlsPanel = (props: FloatingControlsPanelProps) => {
  const [isOpen, setIsOpen] = [props.isOpen, props.onClose];
  const [activeSection, setActiveSection] = useState<string | null>(
    "dynamic-styles"
  );
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePresetSelect = (preset: (typeof CAPTION_PRESETS)[0]) => {
    const updates: Partial<CaptionStyle> = {
      fontFamily: preset.style.fontFamily,
      fontSize: preset.style.fontSize,
      color: preset.style.color,
      backgroundColor: preset.style.backgroundColor,
    };
    props.onStyleChange({ ...props.style, ...updates });
  };

  // --- ADDED: State and Effect for looping previews ---
  const [previewKey, setPreviewKey] = useState(0);

  useEffect(() => {
    // Only run the animation interval when this section is visible
    if (activeSection === "dynamic-styles") {
      const interval = setInterval(() => {
        setPreviewKey((prevKey) => prevKey + 1);
      }, 3000); // Loop every 3 seconds
      return () => clearInterval(interval);
    }
  }, [activeSection]);
  // --- END ADDED ---

  // --- ADDED: Base style for animated previews ---
  const previewBaseStyle: React.CSSProperties = {
    fontSize: "18px",
    fontFamily: "Inter, sans-serif",
    color: "hsl(var(--foreground))",
    fontWeight: "600",
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        isOpen &&
        panelRef.current &&
        !panelRef.current.contains(e.target as Node)
      ) {
        const target = e.target as HTMLElement;
        // Don't close if clicking the trigger button
        if (!target.closest("[data-floating-trigger]")) {
          setIsOpen();
        }
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, setIsOpen]);

  const sections = [
    {
      id: "dynamic-styles",
      icon: Zap,
      title: "Dynamic Styles",
      color: "from-yellow-500 to-amber-500",
    },
    {
      id: "static-presets",
      icon: Paintbrush,
      title: "Style Presets",
      color: "from-pink-500 to-rose-500",
    },
    {
      id: "base-text",
      icon: Palette,
      title: "Text Style",
      color: "from-blue-500 to-cyan-500",
    },
    {
      id: "video-effects",
      icon: Droplets,
      title: "Effects",
      color: "from-cyan-500 to-teal-500",
    },
    {
      id: "saved-overlays",
      icon: Sparkles,
      title: "Overlays",
      color: "from-purple-500 to-violet-500",
    },
  ];

  return (
    <>
      {/* Floating Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed bottom-24 left-6 rounded-xl overflow-hidden",
          "bg-background border-2 border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]",
          "transition-all duration-300 ease-out flex",
          isOpen && props.isMouseActive
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
        style={{
          zIndex: "var(--z-floating-panel)",
          maxHeight: "70vh",
        }}
      >
        {/* Sidebar Navigation */}
        <div className="w-20 bg-gradient-to-b from-background to-background/95 border-r-2 border-yellow-500/30 flex flex-col items-center py-4 gap-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "w-14 h-14 rounded-lg flex flex-col items-center justify-center gap-1 transition-all duration-200 group relative",
                activeSection === section.id
                  ? "bg-gradient-to-br " +
                      section.color +
                      " shadow-[0_0_20px_rgba(234,179,8,0.4)] scale-110"
                  : "bg-background/50 hover:bg-background border-2 border-yellow-500/20 hover:border-yellow-500/50"
              )}
              title={section.title}
            >
              <section.icon
                className={cn(
                  "w-5 h-5 transition-colors",
                  activeSection === section.id
                    ? "text-black"
                    : "text-yellow-500"
                )}
              />
              <span
                className={cn(
                  "text-[9px] font-bold uppercase tracking-wider font-cyber",
                  activeSection === section.id
                    ? "text-black"
                    : "text-yellow-500/70"
                )}
              >
                {section.title.split(" ")[0]}
              </span>
              {activeSection === section.id && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-yellow-500 rounded-l-full" />
              )}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-[420px] max-h-[70vh] overflow-y-auto p-6 bg-gradient-to-br from-background via-background to-background/95">
          {activeSection === "dynamic-styles" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-yellow-500/30">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="text-lg font-bold font-cyber text-yellow-500 tracking-wider">
                  DYNAMIC STYLES
                </h3>
              </div>
              <RadioGroup
                value={props.dynamicStyle}
                onValueChange={props.onDynamicStyleChange}
                className="grid grid-cols-2 gap-3"
              >
                {/* --- MODIFIED: Iterate over DYNAMIC_STYLES to get components --- */}
                {Object.values(DYNAMIC_STYLES).map((styleDef) => {
                  const isSelected = props.dynamicStyle === styleDef.id;
                  const Component = styleDef.component;

                  return (
                    <div
                      key={styleDef.id}
                      className={cn(
                        "relative rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer group",
                        isSelected
                          ? "border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]"
                          : "border-yellow-500/20 hover:border-yellow-500/60"
                      )}
                      onClick={() => props.onDynamicStyleChange(styleDef.id)}
                    >
                      <RadioGroupItem
                        value={styleDef.id}
                        id={styleDef.id}
                        className="sr-only"
                      />
                      <Label
                        htmlFor={styleDef.id}
                        className="block cursor-pointer"
                      >
                        <div className="aspect-video bg-gradient-to-br from-background to-muted flex items-center justify-center p-4 relative overflow-hidden">
                          <div className="absolute inset-0 bg-grid-yellow-500/10" />
                          {/* --- REPLACED: Static text with live component preview --- */}
                          <div
                            key={`${styleDef.id}-${previewKey}`}
                            className="relative z-10 w-full text-center"
                            style={
                              isSelected
                                ? {
                                    ...previewBaseStyle,
                                    color: "hsl(var(--primary))",
                                  }
                                : previewBaseStyle
                            }
                          >
                            <Component
                              text="This is a preview"
                              fullTranscript="This is a preview"
                              interimTranscript=""
                              baseStyle={
                                isSelected
                                  ? {
                                      ...previewBaseStyle,
                                      color: "hsl(var(--primary))",
                                    }
                                  : previewBaseStyle
                              }
                            />
                          </div>
                        </div>
                        <div
                          className={cn(
                            "p-2 text-center text-xs font-semibold font-cyber transition-colors",
                            isSelected
                              ? "bg-yellow-500 text-black"
                              : "bg-background/80 text-foreground"
                          )}
                        >
                          {styleDef.name}
                        </div>
                      </Label>
                    </div>
                  );
                })}
              </RadioGroup>
            </div>
          )}

          {activeSection === "static-presets" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-pink-500/30">
                <Paintbrush className="w-5 h-5 text-pink-500" />
                <h3 className="text-lg font-bold font-cyber text-pink-500 tracking-wider">
                  STYLE PRESETS
                </h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {CAPTION_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => handlePresetSelect(preset)}
                    title={preset.name}
                    className="group relative rounded-lg overflow-hidden border-2 border-pink-500/20 hover:border-pink-500 hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] transition-all duration-200"
                  >
                    <img
                      src={preset.preview}
                      alt={preset.name}
                      className="w-full aspect-video object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                      <span className="text-xs font-semibold font-cyber text-white">
                        {preset.name}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeSection === "base-text" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-blue-500/30">
                <Palette className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-bold font-cyber text-blue-500 tracking-wider">
                  TEXT STYLE
                </h3>
              </div>
              <StyleControls
                style={props.style}
                onStyleChange={props.onStyleChange}
              />
            </div>
          )}

          {activeSection === "video-effects" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-cyan-500/30">
                <Droplets className="w-5 h-5 text-cyan-500" />
                <h3 className="text-lg font-bold font-cyber text-cyan-500 tracking-wider">
                  VIDEO EFFECTS
                </h3>
              </div>

              {/* Filters */}
              <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-cyan-500/20">
                <Label className="text-xs font-cyber text-cyan-500 tracking-wider">
                  FILTER
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {FILTER_PRESETS.map((filter) => {
                    const isSelected = props.videoFilter === filter.style;
                    return (
                      <button
                        key={filter.id}
                        onClick={() => props.onVideoFilterChange(filter.style)}
                        className={cn(
                          "aspect-video rounded-lg border-2 transition-all duration-200 relative overflow-hidden group",
                          isSelected
                            ? "border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                            : "border-cyan-500/20 hover:border-cyan-500/60"
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
                          <span className="text-white text-[10px] font-bold font-cyber truncate block text-center">
                            {filter.name.toUpperCase()}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Canvas Color */}
              <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-cyan-500/20">
                <Label className="text-xs font-cyber text-cyan-500 tracking-wider flex items-center gap-1.5">
                  <Square className="w-3 h-3" />
                  CANVAS COLOR
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="color"
                    className="w-20 h-10 p-1 cursor-pointer border-2 border-cyan-500/30"
                    value={props.blankCanvasColor}
                    onChange={(e) =>
                      props.onBlankCanvasColorChange(e.target.value)
                    }
                  />
                  <Input
                    type="text"
                    className="flex-1 font-mono text-sm border-2 border-cyan-500/30"
                    value={props.blankCanvasColor}
                    onChange={(e) =>
                      props.onBlankCanvasColorChange(e.target.value)
                    }
                  />
                </div>
              </div>

              {/* Neon Edge */}
              <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-cyber text-cyan-500 tracking-wider">
                    NEON EDGE
                  </Label>
                  <Switch
                    checked={props.isNeonEdgeEnabled}
                    onCheckedChange={props.onNeonEdgeToggle}
                  />
                </div>
                {props.isNeonEdgeEnabled && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      Intensity: {props.neonIntensity}%
                    </Label>
                    <Slider
                      value={[props.neonIntensity]}
                      onValueChange={([v]) => props.onNeonIntensityChange(v)}
                      min={0}
                      max={100}
                      step={1}
                      className="[&_[role=slider]]:border-cyan-500"
                    />
                  </div>
                )}
              </div>

              {/* Auto Framing */}
              <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-cyber text-cyan-500 tracking-wider">
                    AUTO FRAMING
                  </Label>
                  <Switch
                    checked={props.isAutoFramingEnabled}
                    onCheckedChange={props.onAutoFramingChange}
                  />
                </div>
                {props.isAutoFramingEnabled && (
                  <>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Zoom Sensitivity: {props.zoomSensitivity.toFixed(1)}
                      </Label>
                      <Slider
                        value={[props.zoomSensitivity]}
                        onValueChange={([v]) =>
                          props.onZoomSensitivityChange(v)
                        }
                        min={1}
                        max={10}
                        step={0.1}
                        className="[&_[role=slider]]:border-cyan-500"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Tracking Speed: {props.trackingSpeed.toFixed(2)}
                      </Label>
                      <Slider
                        value={[props.trackingSpeed]}
                        onValueChange={([v]) => props.onTrackingSpeedChange(v)}
                        min={0.01}
                        max={0.5}
                        step={0.01}
                        className="[&_[role=slider]]:border-cyan-500"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Other Toggles */}
              <div className="space-y-3 p-4 rounded-lg bg-background/50 border border-cyan-500/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-cyber text-cyan-500 tracking-wider">
                    BEAUTIFY
                  </Label>
                  <Switch
                    checked={props.isBeautifyEnabled}
                    onCheckedChange={props.onBeautifyToggle}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-cyber text-cyan-500 tracking-wider">
                    LOW LIGHT ENHANCE
                  </Label>
                  <Switch
                    checked={props.isLowLightEnabled}
                    onCheckedChange={props.onLowLightToggle}
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === "saved-overlays" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-purple-500/30">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="text-lg font-bold font-cyber text-purple-500 tracking-wider">
                  SAVED OVERLAYS
                </h3>
              </div>
              {props.savedOverlays.length === 0 ? (
                <div className="text-center p-8 rounded-lg bg-background/50 border-2 border-purple-500/20">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-purple-500/50" />
                  <p className="text-sm text-muted-foreground font-cyber">
                    Generated overlays will be saved here for reuse.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {props.savedOverlays.map((overlay) => (
                    <div
                      key={overlay.id}
                      className="group relative aspect-square rounded-lg bg-background/50 border-2 border-purple-500/20 hover:border-purple-500 flex items-center justify-center overflow-hidden transition-all duration-200 hover:shadow-[0_0_20px_rgba(168,85,247,0.4)]"
                    >
                      <button
                        className="w-full h-full"
                        onClick={() => props.onAddSavedOverlay(overlay)}
                        title="Add overlay to canvas"
                      >
                        {overlay.preview ? (
                          <img
                            src={overlay.preview}
                            alt="Overlay preview"
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-xs text-muted-foreground font-cyber">
                            NO PREVIEW
                          </span>
                        )}
                      </button>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => props.onDeleteSavedOverlay(overlay.id)}
                        title="Delete saved overlay"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
