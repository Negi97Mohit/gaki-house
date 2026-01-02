// src/components/GSAPAnimationEditor.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";
import { Switch } from "@/shared/ui/switch";
import { X, Save, RotateCcw, Play, Copy } from "lucide-react";
import { GSAPPreset, GSAPAnimationConfig, GSAPAnimationType } from "@/features/animation/lib/gsapAnimations";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ParticleEffectOverlay } from "@/features/banners/ui/ParticleEffectOverlay";
import { EffectType } from "@/lib/particleEffects";
import { generateGSAPHtml } from "@/lib/gsapHtmlGenerator";
import { ColorPicker } from "@/shared/ui/color-picker";

// Map effect animation types to particle effect types
const EFFECT_TYPE_MAP: Record<string, EffectType> = {
  "fire-effect": "fire",
  "water-effect": "water",
  "snow-effect": "snow",
  "confetti-effect": "confetti",
  "graffiti-effect": "graffiti",
  "neon-particles-effect": "neon-particles",
  "electric-effect": "electric",
  "glitch-blocks-effect": "glitch-blocks",
  "rainbow-burst-effect": "rainbow-burst",
  "pulse-rings-effect": "pulse-rings",
  "bounce-balls-effect": "bounce-balls",
  "shake-debris-effect": "shake-debris",
  "glow-orbs-effect": "glow-orbs",
  "float-bubbles-effect": "float-bubbles",
  "flame-sparks-effect": "flame-sparks",
  "ice-crystals-effect": "ice-crystals",
};

interface GSAPAnimationEditorProps {
  preset: GSAPPreset;
  onSave: (preset: GSAPPreset, customText?: string, customColor?: string) => void;
  onCancel: () => void;
}

const ANIMATION_TYPES: { value: GSAPAnimationType; label: string }[] = [
  { value: "cinematic-reveal", label: "Cinematic Reveal" },
  { value: "kinetic-type", label: "Kinetic Type" },
  { value: "morph-glitch", label: "Morph Glitch" },
  { value: "elastic-bounce", label: "Elastic Bounce" },
  { value: "stagger-wave", label: "Stagger Wave" },
  { value: "perspective-flip", label: "Perspective Flip" },
  { value: "liquid-fill", label: "Liquid Fill" },
  { value: "neon-flicker", label: "Neon Flicker" },
  { value: "typewriter", label: "Typewriter" },
  { value: "scramble", label: "Scramble" },
  { value: "magnetic-pull", label: "Magnetic Pull" },
  { value: "rubber-band", label: "Rubber Band" },
  { value: "shatter", label: "Shatter" },
  { value: "ink-reveal", label: "Ink Reveal" },
  { value: "spotlight", label: "Spotlight" },
  { value: "parallax-depth", label: "Parallax Depth" },
  { value: "whip-pan", label: "Whip Pan" },
  { value: "zoom-punch", label: "Zoom Punch" },
  // Effect animations with particles
  { value: "fire-effect", label: "🔥 Fire Effect" },
  { value: "water-effect", label: "💧 Water Effect" },
  { value: "snow-effect", label: "❄️ Snow Effect" },
  { value: "confetti-effect", label: "🎉 Confetti Effect" },
  { value: "graffiti-effect", label: "🎨 Graffiti Effect" },
  { value: "neon-particles-effect", label: "💜 Neon Particles" },
  { value: "electric-effect", label: "⚡ Electric Effect" },
  { value: "glitch-blocks-effect", label: "📺 Glitch Blocks" },
  { value: "rainbow-burst-effect", label: "🌈 Rainbow Burst" },
  { value: "pulse-rings-effect", label: "〰️ Pulse Rings" },
  { value: "bounce-balls-effect", label: "🏀 Bounce Balls" },
  { value: "shake-debris-effect", label: "💥 Shake Debris" },
  { value: "glow-orbs-effect", label: "✨ Glow Orbs" },
  { value: "float-bubbles-effect", label: "🫧 Float Bubbles" },
  { value: "flame-sparks-effect", label: "🔶 Flame Sparks" },
  { value: "ice-crystals-effect", label: "🧊 Ice Crystals" },
];

const EASE_OPTIONS = [
  "none",
  "power1.out",
  "power2.out",
  "power3.out",
  "power4.out",
  "back.out(1.7)",
  "back.out(2.5)",
  "elastic.out(1, 0.5)",
  "elastic.out(1, 0.3)",
  "bounce.out",
  "circ.out",
  "expo.out",
  "sine.inOut",
  "power2.inOut",
];

const DIRECTION_OPTIONS = ["up", "down", "left", "right", "center"];

export const GSAPAnimationEditor: React.FC<GSAPAnimationEditorProps> = ({
  preset: initialPreset,
  onSave,
  onCancel,
}) => {
  const [preset, setPreset] = useState<GSAPPreset>({ ...initialPreset });
  const [previewKey, setPreviewKey] = useState(0);
  const [customText, setCustomText] = useState("Your Text Here");
  const [textColor, setTextColor] = useState("#FFFFFF");
  const [fontSize, setFontSize] = useState(48);
  const [fontFamily, setFontFamily] = useState("Inter");

  const updateConfig = (key: keyof GSAPAnimationConfig, value: any) => {
    setPreset((prev) => ({
      ...prev,
      config: {
        ...prev.config,
        [key]: value,
      },
    }));
  };

  const handlePreview = () => {
    setPreviewKey((k) => k + 1);
  };

  const handleReset = () => {
    setPreset({ ...initialPreset });
    setPreviewKey((k) => k + 1);
  };

  const handleSave = () => {
    // Update preset config with font settings before saving
    const updatedPreset: GSAPPreset = {
      ...preset,
      config: {
        ...preset.config,
        fontFamily,
        fontSize,
        color: textColor,
      },
    };
    // Pass the custom text and color to the parent
    onSave(updatedPreset, customText, textColor);
  };

  const isParticleEffect = !!EFFECT_TYPE_MAP[preset.config.type];

  // Generate live preview HTML
  const previewHtml = useMemo(() => {
    return generateGSAPHtml(preset, customText, undefined, {
      fontFamily,
      fontSize,
      color: textColor,
      backgroundColor: "transparent",
      textAlign: "center",
    });
  }, [preset, customText, fontFamily, fontSize, textColor, previewKey]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">Edit GSAP Animation</h2>
          <span className="text-xs px-2 py-1 rounded bg-primary/20 text-primary">
            {preset.category}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button variant="default" size="sm" onClick={handleSave}>
            <Save className="w-4 h-4 mr-1" />
            Save & Apply
          </Button>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Controls Panel */}
        <ScrollArea className="w-80 border-r border-border p-4">
          <div className="space-y-6">
            {/* Text Content */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Text Content
              </h3>
              <div className="space-y-2">
                <Label>Display Text</Label>
                <Input
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  placeholder="Enter your text..."
                />
              </div>
              <div className="space-y-2">
                <Label>Text Color</Label>
                <ColorPicker
                  value={textColor}
                  onChange={setTextColor}
                  variant="inline"
                  showGradients={true}
                  label="Text"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Font Size</Label>
                  <span className="text-xs text-muted-foreground">{fontSize}px</span>
                </div>
                <Slider
                  value={[fontSize]}
                  min={16}
                  max={120}
                  step={2}
                  onValueChange={([v]) => setFontSize(v)}
                />
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Animation Settings
              </h3>
              <div className="space-y-2">
                <Label>Name</Label>
                <Input
                  value={preset.name}
                  onChange={(e) => setPreset((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Animation Type</Label>
                <Select
                  value={preset.config.type}
                  onValueChange={(v) => updateConfig("type", v as GSAPAnimationType)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ANIMATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Timing */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Timing
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Duration</Label>
                  <span className="text-xs text-muted-foreground">
                    {preset.config.duration?.toFixed(1)}s
                  </span>
                </div>
                <Slider
                  value={[preset.config.duration || 1]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onValueChange={([v]) => updateConfig("duration", v)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Delay</Label>
                  <span className="text-xs text-muted-foreground">
                    {(preset.config.delay || 0).toFixed(1)}s
                  </span>
                </div>
                <Slider
                  value={[preset.config.delay || 0]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([v]) => updateConfig("delay", v)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Stagger</Label>
                  <span className="text-xs text-muted-foreground">
                    {(preset.config.stagger || 0.03).toFixed(2)}s
                  </span>
                </div>
                <Slider
                  value={[preset.config.stagger || 0.03]}
                  min={0}
                  max={0.2}
                  step={0.01}
                  onValueChange={([v]) => updateConfig("stagger", v)}
                />
              </div>
            </div>

            {/* Easing */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Easing
              </h3>
              <div className="space-y-2">
                <Label>Ease Function</Label>
                <Select
                  value={preset.config.ease || "power3.out"}
                  onValueChange={(v) => updateConfig("ease", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EASE_OPTIONS.map((ease) => (
                      <SelectItem key={ease} value={ease}>
                        {ease}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Direction */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Direction
              </h3>
              <div className="space-y-2">
                <Label>Direction</Label>
                <Select
                  value={preset.config.direction || "up"}
                  onValueChange={(v) => updateConfig("direction", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DIRECTION_OPTIONS.map((dir) => (
                      <SelectItem key={dir} value={dir}>
                        {dir.charAt(0).toUpperCase() + dir.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Intensity */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Effects
              </h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Intensity</Label>
                  <span className="text-xs text-muted-foreground">
                    {(preset.config.intensity || 1).toFixed(1)}
                  </span>
                </div>
                <Slider
                  value={[preset.config.intensity || 1]}
                  min={0.1}
                  max={3}
                  step={0.1}
                  onValueChange={([v]) => updateConfig("intensity", v)}
                />
              </div>
              <div className="space-y-2">
                <Label>Effect Color</Label>
                <ColorPicker
                  value={preset.config.color || "#00ffff"}
                  onChange={(color) => updateConfig("color", color)}
                  variant="inline"
                  showGradients={true}
                  label="Effect"
                />
              </div>
            </div>

            {/* Loop */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Loop
              </h3>
              <div className="flex items-center justify-between">
                <Label>Enable Loop</Label>
                <Switch
                  checked={preset.config.loop || false}
                  onCheckedChange={(v) => updateConfig("loop", v)}
                />
              </div>
              {preset.config.loop && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Loop Delay</Label>
                    <span className="text-xs text-muted-foreground">
                      {(preset.config.loopDelay || 2).toFixed(1)}s
                    </span>
                  </div>
                  <Slider
                    value={[preset.config.loopDelay || 2]}
                    min={0.5}
                    max={5}
                    step={0.5}
                    onValueChange={([v]) => updateConfig("loopDelay", v)}
                  />
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        {/* Preview Panel */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-border flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Live Preview</span>
            <Button variant="outline" size="sm" onClick={handlePreview}>
              <Play className="w-4 h-4 mr-1" />
              Replay Animation
            </Button>
          </div>
          <div className="flex-1 bg-black/90 relative overflow-hidden">
            <iframe
              key={previewKey}
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Animation Preview"
              sandbox="allow-scripts"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSAPAnimationEditor;
