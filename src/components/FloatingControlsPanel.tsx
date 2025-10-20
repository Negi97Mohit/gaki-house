import React, { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";
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
import { CaptionStyle } from "@/types/caption";

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
}

export const FloatingControlsPanel = (props: FloatingControlsPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [openSections, setOpenSections] = useState<string[]>([]);

  return (
    <>
      {/* Trigger Button */}
      <Button
        variant="secondary"
        size="icon"
        className="fixed bottom-6 left-6 z-[1000] rounded-full h-14 w-14 shadow-lg"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6" /> : <SlidersHorizontal className="w-6 h-6" />}
      </Button>

      {/* Floating Panel */}
      <div
        className={cn(
          "fixed bottom-24 left-6 z-[999] w-[380px] max-h-[70vh] rounded-2xl",
          "bg-background/80 backdrop-blur-xl border border-border shadow-2xl",
          "overflow-hidden transition-all duration-300 ease-out",
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        <div className="h-full overflow-y-auto p-4">
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

                {/* Other Toggles */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Auto Framing</Label>
                    <Switch checked={props.isAutoFramingEnabled} onCheckedChange={props.onAutoFramingChange} />
                  </div>
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
          </Accordion>
        </div>
      </div>
    </>
  );
};
