// src/components/AnimationEditor.tsx
import React, { useState, useEffect } from "react";
import { Sparkles } from "lucide-react";
import { AnimationPreset } from "@/types/animation";
import { SmartTextAnimator } from "./SmartTextAnimator";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
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
import { EffectsControls } from "@/features/animation/ui/editor/EffectsControls";
import { MotionControls } from "@/features/animation/ui/editor/MotionControls";
import { SettingsControls } from "@/features/animation/ui/editor/SettingsControls";
import { StyleControls } from "@/features/animation/ui/editor/StyleControls";

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
    setPreset((prev) => {
      const sectionValue = prev[section];
      if (sectionValue && typeof sectionValue === 'object') {
        return {
          ...prev,
          [section]: {
            ...sectionValue,
            [key]: value,
          },
        };
      }
      return prev;
    });
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
                <EffectsControls preset={preset} updatePreset={updatePreset} />
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
                <StyleControls preset={preset} updatePreset={updatePreset} />
              </TabsContent>

              {/* --- MOTION TAB --- */}
              <TabsContent value="motion" className="space-y-6 mt-0">
                <MotionControls preset={preset} updatePreset={updatePreset} />
              </TabsContent>

              {/* --- SETTINGS TAB (Looping) --- */}
              <TabsContent value="settings" className="space-y-6 mt-0">
                <SettingsControls preset={preset} updatePreset={updatePreset} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
