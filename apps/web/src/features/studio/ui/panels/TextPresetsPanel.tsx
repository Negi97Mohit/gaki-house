// src/features/studio/ui/panels/TextPresetsPanel.tsx
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@gaki/ui/tabs";
import { CaptionStyle } from "@gaki/core/types/caption";
import { DynamicStylesPanel } from "./DynamicStylesPanel";
import { StaticPresetsPanel } from "./StaticPresetsPanel";
import { TextStylePanel } from "./TextStylePanel";
import { Sparkles, Type, Sliders } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

interface TextPresetsPanelProps {
  style: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
  dynamicStyle: string;
  onDynamicStyleChange: (styleId: string) => void;
  activePresetId?: string;
  isHorizontal?: boolean;
}

export const TextPresetsPanel: React.FC<TextPresetsPanelProps> = ({
  style,
  onStyleChange,
  dynamicStyle,
  onDynamicStyleChange,
  activePresetId,
  isHorizontal = false,
}) => {
  const [activeTab, setActiveTab] = useState("dynamic");

  return (
    <div className="space-y-3.5 w-full antialiased">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Capsule Tabs with Border & Underline Indicator */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-white/[0.03] border border-white/[0.08] shadow-sm">
          <TabsList className="w-full grid grid-cols-3 h-9 bg-transparent p-0 gap-1 border-0">
            <TabsTrigger
              value="dynamic"
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-medium tracking-wide transition-all",
                "data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-white data-[state=active]:ring-1 data-[state=active]:ring-primary/40",
                "text-zinc-300 hover:text-white border border-transparent"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Dynamic
              {activeTab === "dynamic" && (
                <span className="absolute -bottom-px left-3 right-3 h-[2px] bg-primary rounded-full shadow-[0_0_6px_var(--primary)]" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="presets"
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-medium tracking-wide transition-all",
                "data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-white data-[state=active]:ring-1 data-[state=active]:ring-primary/40",
                "text-zinc-300 hover:text-white border border-transparent"
              )}
            >
              <Type className="w-3.5 h-3.5" />
              Presets
              {activeTab === "presets" && (
                <span className="absolute -bottom-px left-3 right-3 h-[2px] bg-primary rounded-full shadow-[0_0_6px_var(--primary)]" />
              )}
            </TabsTrigger>

            <TabsTrigger
              value="custom"
              className={cn(
                "relative flex items-center justify-center gap-1.5 rounded-xl text-[11px] font-medium tracking-wide transition-all",
                "data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-white data-[state=active]:ring-1 data-[state=active]:ring-primary/40",
                "text-zinc-300 hover:text-white border border-transparent"
              )}
            >
              <Sliders className="w-3.5 h-3.5" />
              Custom
              {activeTab === "custom" && (
                <span className="absolute -bottom-px left-3 right-3 h-[2px] bg-primary rounded-full shadow-[0_0_6px_var(--primary)]" />
              )}
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="dynamic" className="mt-3.5 focus-visible:outline-none">
          <DynamicStylesPanel
            dynamicStyle={dynamicStyle}
            onDynamicStyleChange={onDynamicStyleChange}
            isHorizontal={isHorizontal}
          />
        </TabsContent>

        <TabsContent value="presets" className="mt-3.5 focus-visible:outline-none">
          <StaticPresetsPanel
            currentStyle={style}
            onStyleChange={onStyleChange}
            activePresetId={activePresetId}
            isHorizontal={isHorizontal}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-3.5 focus-visible:outline-none">
          <TextStylePanel
            style={style}
            onStyleChange={onStyleChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
