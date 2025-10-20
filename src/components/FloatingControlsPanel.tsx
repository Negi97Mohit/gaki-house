import React, { useState, useRef, useEffect } from "react";
import { SlidersHorizontal, X, Trash2, Paintbrush } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { StyleControls } from "./StyleControls";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { DYNAMIC_STYLE_OPTIONS } from "@/lib/dynamicCaptionStyles";
import { FILTER_PRESETS } from "@/lib/filters";
import { CAPTION_PRESETS } from "@/lib/captionPresets";
import { CaptionStyle, GeneratedOverlay } from "@/types/caption";

interface FloatingControlsPanelProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
  dynamicStyle: string;
  onDynamicStyleChange: (styleId: string) => void;
  backgroundEffect: 'none' | 'blur' | 'image';
  onBackgroundEffectChange: (effect: 'none' | 'blur' | 'image') => void;
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
}

export const FloatingControlsPanel = (props: FloatingControlsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);
  const panelRef = useRef<HTMLDivElement>(null);

  const handlePresetSelect = (preset: typeof CAPTION_PRESETS[0]) => {
    const updates: Partial<CaptionStyle> = {
      fontFamily: preset.style.fontFamily,
      fontSize: preset.style.fontSize,
      color: preset.style.color,
      backgroundColor: preset.style.backgroundColor,
    };
    props.onStyleChange({ ...props.style, ...updates });
  };

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        const target = e.target as HTMLElement;
        // Don't close if clicking the trigger button
        if (!target.closest('[data-floating-trigger]')) {
          setIsOpen(false);
        }
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <>
      {/* Trigger Button */}
      <div
        className={cn(
          "transition-opacity duration-300",
          !props.isMouseActive && "opacity-0 pointer-events-none"
        )}
      >
        <Button
          variant="secondary"
          size="icon"
          className="fixed bottom-6 left-6 z-[1000] rounded-full h-14 w-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
          data-floating-trigger
        >
          {isOpen ? <X className="w-6 h-6" /> : <SlidersHorizontal className="w-6 h-6" />}
        </Button>
      </div>

      {/* Floating Panel */}
      <div
        ref={panelRef}
        className={cn(
          "fixed bottom-24 left-6 z-[999] w-[380px] max-h-[70vh] rounded-2xl",
          "bg-background/80 backdrop-blur-xl border border-border shadow-2xl",
          "transition-all duration-300 ease-out flex flex-col",
          isOpen && props.isMouseActive
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        <div className="overflow-y-auto p-4 flex-1">
          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={setOpenSections}
            className="space-y-2"
          >
            {/* Dynamic Styles */}
            <AccordionItem value="dynamic-styles" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-semibold">Dynamic Styles</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <RadioGroup value={props.dynamicStyle} onValueChange={props.onDynamicStyleChange}>
                  <div className="space-y-2">
                    {DYNAMIC_STYLE_OPTIONS.map(option => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <RadioGroupItem value={option.id} id={option.id} />
                        <Label htmlFor={option.id} className="text-sm cursor-pointer">
                          {option.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </AccordionContent>
            </AccordionItem>

            {/* Static Style Presets */}
            <AccordionItem value="static-presets" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <div className="flex items-center gap-2">
                  <Paintbrush className="w-4 h-4" />
                  <span className="text-sm font-semibold">Static Style Presets</span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <div className="grid grid-cols-2 gap-3">
                  {CAPTION_PRESETS.map(preset => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      title={preset.name}
                      className="block w-full rounded-md overflow-hidden border-2 border-transparent hover:border-primary focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                    >
                      <img src={preset.preview} alt={preset.name} className="w-full aspect-video object-cover" />
                    </button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Base Text Style */}
            <AccordionItem value="base-text" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-semibold">Base Text Style</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                <StyleControls
                  style={props.style}
                  onStyleChange={props.onStyleChange}
                />
              </AccordionContent>
            </AccordionItem>

            {/* Video Effects */}
            <AccordionItem value="video-effects" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-semibold">Video Effects</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3 space-y-4">
                {/* Filter */}
                <div className="space-y-2">
                  <Label className="text-xs">Filter</Label>
                  <Select value={props.videoFilter} onValueChange={props.onVideoFilterChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      {FILTER_PRESETS.map(filter => (
                        <SelectItem key={filter.id} value={filter.style}>
                          {filter.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Background Effect */}
                <div className="space-y-2">
                  <Label className="text-xs">Background</Label>
                  <Select value={props.backgroundEffect} onValueChange={props.onBackgroundEffectChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None</SelectItem>
                      <SelectItem value="blur">Blur</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Neon Edge */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Neon Edge</Label>
                    <Switch checked={props.isNeonEdgeEnabled} onCheckedChange={props.onNeonEdgeToggle} />
                  </div>
                  {props.isNeonEdgeEnabled && (
                    <div className="space-y-1">
                      <Label className="text-xs">Intensity: {props.neonIntensity}%</Label>
                      <Slider
                        value={[props.neonIntensity]}
                        onValueChange={([v]) => props.onNeonIntensityChange(v)}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>
                  )}
                </div>

                {/* Auto Framing Controls */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Auto Framing</Label>
                    <Switch checked={props.isAutoFramingEnabled} onCheckedChange={props.onAutoFramingChange} />
                  </div>
                  {props.isAutoFramingEnabled && (
                    <>
                      <div className="space-y-1">
                        <Label className="text-xs">Zoom Sensitivity: {props.zoomSensitivity.toFixed(1)}</Label>
                        <Slider
                          value={[props.zoomSensitivity]}
                          onValueChange={([v]) => props.onZoomSensitivityChange(v)}
                          min={1}
                          max={10}
                          step={0.1}
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">Tracking Speed: {props.trackingSpeed.toFixed(2)}</Label>
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
                </div>

                {/* Other Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Beautify</Label>
                    <Switch checked={props.isBeautifyEnabled} onCheckedChange={props.onBeautifyToggle} />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Low Light Enhance</Label>
                    <Switch checked={props.isLowLightEnabled} onCheckedChange={props.onLowLightToggle} />
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Saved Overlays */}
            <AccordionItem value="saved-overlays" className="border rounded-lg px-3">
              <AccordionTrigger className="hover:no-underline py-3">
                <span className="text-sm font-semibold">Saved Overlays</span>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                {props.savedOverlays.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center p-4">
                    Generated overlays will be saved here for reuse.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {props.savedOverlays.map(overlay => (
                      <div key={overlay.id} className="group relative aspect-square rounded-md bg-secondary/50 flex items-center justify-center overflow-hidden border">
                        <button 
                          className="w-full h-full" 
                          onClick={() => props.onAddSavedOverlay(overlay)}
                          title="Add overlay to canvas"
                        >
                          {overlay.preview ? (
                            <img src={overlay.preview} alt="Overlay preview" className="absolute inset-0 w-full h-full object-contain p-1" />
                          ) : (
                            <span className="text-xs text-muted-foreground">No Preview</span>
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
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </div>
    </>
  );
};
