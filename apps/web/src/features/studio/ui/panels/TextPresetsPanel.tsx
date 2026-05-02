// src/features/studio/ui/panels/TextPresetsPanel.tsx
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@gaki/ui/tabs";
import { CaptionStyle } from "@gaki/core/types/caption";
import { DynamicStylesPanel } from "./DynamicStylesPanel";
import { StaticPresetsPanel } from "./StaticPresetsPanel";
import { TextStylePanel } from "./TextStylePanel";

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
    <div className="space-y-4 font-mono">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 h-9 bg-card border border-border">
          <TabsTrigger
            value="dynamic"
            className="text-xs font-mono tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            DYNAMIC
          </TabsTrigger>
          <TabsTrigger
            value="presets"
            className="text-xs font-mono tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            PRESETS
          </TabsTrigger>
          <TabsTrigger
            value="custom"
            className="text-xs font-mono tracking-wide data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
          >
            CUSTOM
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dynamic" className="mt-4">
          <DynamicStylesPanel
            dynamicStyle={dynamicStyle}
            onDynamicStyleChange={onDynamicStyleChange}
            isHorizontal={isHorizontal}
          />
        </TabsContent>

        <TabsContent value="presets" className="mt-4">
          <StaticPresetsPanel
            currentStyle={style}
            onStyleChange={onStyleChange}
            activePresetId={activePresetId}
            isHorizontal={isHorizontal}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-4">
          <TextStylePanel
            style={style}
            onStyleChange={onStyleChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
