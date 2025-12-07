// src/components/AnimationEditor.tsx
import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { AnimationPreset } from "@/types/animation";
import { SmartTextAnimator } from "./SmartTextAnimator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Save,
  RotateCcw,
  Type,
  Palette,
  Zap,
  Settings,
} from "lucide-react";
import { ALL_FONTS } from "@/lib/fonts"; // Assuming you have this from previous context

interface AnimationEditorProps {
  initialPreset: AnimationPreset;
  onSave: (preset: AnimationPreset) => void;
  onCancel: () => void;
}

export const AnimationEditor: React.FC<AnimationEditorProps> = ({
  initialPreset,
  onSave,
  onCancel,
}) => {
  // Local state for the preset being edited
  const [preset, setPreset] = useState<AnimationPreset>(initialPreset);
  const [key, setKey] = useState(0); // Force re-render of preview on changes

  // Helper to update nested properties
  const updatePreset = (
    section: keyof AnimationPreset,
    key: string,
    value: any
  ) => {
    setPreset((prev) => ({
      ...prev,
      [section]: {
        ...prev[section as any],
        [key]: value,
      },
    }));
    // Small delay to let state settle before re-triggering animation
    setTimeout(() => setKey((k) => k + 1), 50);
  };

  // Helper specifically for content updates
  const updateContent = (key: string, value: string) => {
    setPreset((prev) => ({
      ...prev,
      defaultContent: {
        ...prev.defaultContent,
        [key]: value,
      },
    }));
    setTimeout(() => setKey((k) => k + 1), 50);
  };

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h3 className="font-semibold">Edit Animation</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setKey((k) => k + 1)}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Replay
          </Button>
          <Button size="sm" onClick={() => onSave(preset)}>
            <Save className="h-4 w-4 mr-2" /> Save
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Preview Area (Left/Top) */}
        <div className="flex-1 bg-muted/30 flex items-center justify-center p-8 overflow-hidden relative">
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ccc_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
          <div className="w-full max-w-2xl aspect-video bg-card border rounded-xl shadow-sm flex items-center justify-center overflow-hidden relative">
            <SmartTextAnimator
              key={key}
              preset={preset}
              style={{ padding: "2rem" }}
            />
          </div>
        </div>

        {/* Sidebar Controls (Right) */}
        <div className="w-[350px] border-l border-border bg-card flex flex-col">
          <Tabs defaultValue="content" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 rounded-none border-b p-0 h-12">
              <TabsTrigger
                value="content"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              >
                <Type className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="style"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              >
                <Palette className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="motion"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              >
                <Zap className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="settings"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              >
                <Settings className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger
                value="effects"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary h-full"
              >
                <Sparkles className="h-4 w-4" />
              </TabsTrigger>
              <TabsContent value="effects" className="space-y-6 mt-0">
                {/* Text Shadow / Glow */}
                <div className="space-y-3">
                  <Label>Neon Glow / Shadow</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updatePreset("baseStyle", "textShadow", "none")
                      }
                    >
                      None
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updatePreset(
                          "baseStyle",
                          "textShadow",
                          "0 0 10px currentColor"
                        )
                      }
                    >
                      Soft Glow
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updatePreset(
                          "baseStyle",
                          "textShadow",
                          "2px 2px 0px #000"
                        )
                      }
                    >
                      Retro Drop
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        updatePreset(
                          "baseStyle",
                          "textShadow",
                          "0 0 5px #fff, 0 0 10px currentColor, 0 0 20px currentColor"
                        )
                      }
                    >
                      Intense Neon
                    </Button>
                  </div>
                  {/* Custom Shadow Input */}
                  <Input
                    placeholder="e.g. 0 4px 10px rgba(0,0,0,0.5)"
                    value={preset.baseStyle.textShadow || ""}
                    onChange={(e) =>
                      updatePreset("baseStyle", "textShadow", e.target.value)
                    }
                  />
                </div>

                {/* Background & Glass */}
                <div className="space-y-3">
                  <Label>Background & Glass</Label>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Blur</span>
                      <span>{preset.baseStyle.backgroundBlur || 0}px</span>
                    </div>
                    <Slider
                      value={[preset.baseStyle.backgroundBlur || 0]}
                      min={0}
                      max={20}
                      step={1}
                      onValueChange={([val]) =>
                        updatePreset("baseStyle", "backgroundBlur", val)
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Background Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        className="w-8 h-8 p-0 border-0"
                        value={preset.baseStyle.backgroundColor || "#000000"}
                        onChange={(e) =>
                          updatePreset(
                            "baseStyle",
                            "backgroundColor",
                            e.target.value
                          )
                        }
                      />
                      <Input
                        value={preset.baseStyle.backgroundColor || ""}
                        placeholder="rgba(0,0,0,0.5) or #000"
                        onChange={(e) =>
                          updatePreset(
                            "baseStyle",
                            "backgroundColor",
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </div>

                {/* Gradient Text */}
                <div className="space-y-3">
                  <Label>Text Gradient</Label>
                  <Select
                    value={preset.baseStyle.gradient || "none"}
                    onValueChange={(val) =>
                      updatePreset(
                        "baseStyle",
                        "gradient",
                        val === "none" ? undefined : val
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gradient" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Solid Color)</SelectItem>
                      <SelectItem value="linear-gradient(to right, #ff00cc, #333399)">
                        Sunset
                      </SelectItem>
                      <SelectItem value="linear-gradient(to right, #00c6ff, #0072ff)">
                        Ocean
                      </SelectItem>
                      <SelectItem value="linear-gradient(to right, #f857a6, #ff5858)">
                        Cherry
                      </SelectItem>
                      <SelectItem value="linear-gradient(45deg, #ff9a9e 0%, #fad0c4 99%, #fad0c4 100%)">
                        Peach
                      </SelectItem>
                      <SelectItem value="linear-gradient(to right, #43e97b 0%, #38f9d7 100%)">
                        Mint
                      </SelectItem>
                      <SelectItem value="linear-gradient(to right, #fa709a 0%, #fee140 100%)">
                        Gold Pink
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
            </TabsList>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* --- CONTENT TAB --- */}
              <TabsContent value="content" className="space-y-4 mt-0">
                <div className="space-y-4">
                  {Object.entries(preset.defaultContent).map(([key, value]) => (
                    <div key={key} className="space-y-2">
                      <Label className="capitalize">{key}</Label>
                      <Input
                        value={value}
                        onChange={(e) => updateContent(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* --- STYLE TAB --- */}
              <TabsContent value="style" className="space-y-6 mt-0">
                <div className="space-y-3">
                  <Label>Font Family</Label>
                  <Select
                    value={preset.baseStyle.fontFamily}
                    onValueChange={(val) =>
                      updatePreset("baseStyle", "fontFamily", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Assuming ALL_FONTS or a subset is available */}
                      {[
                        "Inter",
                        "Roboto",
                        "Playfair Display",
                        "Bebas Neue",
                        "Courier New",
                      ].map((font) => (
                        <SelectItem
                          key={font}
                          value={font}
                          style={{ fontFamily: font }}
                        >
                          {font}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Font Size ({preset.baseStyle.fontSize}px)</Label>
                  <Slider
                    value={[preset.baseStyle.fontSize]}
                    min={12}
                    max={120}
                    step={1}
                    onValueChange={([val]) =>
                      updatePreset("baseStyle", "fontSize", val)
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Color</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={preset.baseStyle.color}
                        onChange={(e) =>
                          updatePreset("baseStyle", "color", e.target.value)
                        }
                        className="w-10 h-10 p-1 px-1"
                      />
                      <Input
                        value={preset.baseStyle.color}
                        onChange={(e) =>
                          updatePreset("baseStyle", "color", e.target.value)
                        }
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Accent</Label>
                    <div className="flex gap-2">
                      <Input
                        type="color"
                        value={preset.baseStyle.accentColor || "#000000"}
                        onChange={(e) =>
                          updatePreset(
                            "baseStyle",
                            "accentColor",
                            e.target.value
                          )
                        }
                        className="w-10 h-10 p-1 px-1"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label>Alignment</Label>
                  <div className="flex bg-muted rounded-md p-1">
                    {["left", "center", "right"].map((align) => (
                      <button
                        key={align}
                        className={`flex-1 py-1.5 text-xs rounded-sm capitalize transition-all ${
                          preset.baseStyle.alignment === align
                            ? "bg-background shadow-sm font-medium"
                            : "hover:bg-background/50"
                        }`}
                        onClick={() =>
                          updatePreset("baseStyle", "alignment", align)
                        }
                      >
                        {align}
                      </button>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* --- MOTION TAB --- */}
              <TabsContent value="motion" className="space-y-6 mt-0">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Duration</Label>
                    <span className="text-xs text-muted-foreground">
                      {preset.animationConfig.duration}s
                    </span>
                  </div>
                  <Slider
                    value={[preset.animationConfig.duration]}
                    min={0.2}
                    max={5}
                    step={0.1}
                    onValueChange={([val]) =>
                      updatePreset("animationConfig", "duration", val)
                    }
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <Label>Stagger Delay</Label>
                    <span className="text-xs text-muted-foreground">
                      {preset.animationConfig.delay || 0}s
                    </span>
                  </div>
                  <Slider
                    value={[preset.animationConfig.delay || 0]}
                    min={0}
                    max={2}
                    step={0.05}
                    onValueChange={([val]) =>
                      updatePreset("animationConfig", "delay", val)
                    }
                  />
                </div>

                <div className="space-y-3">
                  <Label>Direction</Label>
                  <Select
                    value={preset.animationConfig.direction || "up"}
                    onValueChange={(val) =>
                      updatePreset("animationConfig", "direction", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="up">Up</SelectItem>
                      <SelectItem value="down">Down</SelectItem>
                      <SelectItem value="left">Left</SelectItem>
                      <SelectItem value="right">Right</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label>Easing</Label>
                  <Select
                    value={preset.animationConfig.easing || "smooth"}
                    onValueChange={(val) =>
                      updatePreset("animationConfig", "easing", val)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smooth">Smooth</SelectItem>
                      <SelectItem value="bouncy">Bouncy</SelectItem>
                      <SelectItem value="elastic">Elastic</SelectItem>
                      <SelectItem value="linear">Linear</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>

              {/* --- SETTINGS TAB (Looping) --- */}
              <TabsContent value="settings" className="space-y-6 mt-0">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-0.5">
                    <Label className="text-base">Loop Animation</Label>
                    <p className="text-xs text-muted-foreground">
                      Restart automatically
                    </p>
                  </div>
                  <Switch
                    checked={preset.animationConfig.loop || false}
                    onCheckedChange={(val) =>
                      updatePreset("animationConfig", "loop", val)
                    }
                  />
                </div>

                {preset.animationConfig.loop && (
                  <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between">
                      <Label>Loop Delay (Pause)</Label>
                      <span className="text-xs text-muted-foreground">
                        {preset.animationConfig.loopDelay || 0}s
                      </span>
                    </div>
                    <Slider
                      value={[preset.animationConfig.loopDelay || 0]}
                      min={0}
                      max={10}
                      step={0.5}
                      onValueChange={([val]) =>
                        updatePreset("animationConfig", "loopDelay", val)
                      }
                    />
                    <p className="text-xs text-muted-foreground pt-2">
                      Time to wait before the animation restarts.
                    </p>
                  </div>
                )}
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
