// src/features/studio/ui/panels/TextPresetsPanel.tsx
import React, { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@gaki/ui/tabs";
import { CaptionStyle } from "@gaki/core/types/caption";
import { DynamicStylesPanel } from "./DynamicStylesPanel";
import { StaticPresetsPanel } from "./StaticPresetsPanel";
import { TextStylePanel } from "./TextStylePanel";
import { Sparkles, Type, Sliders } from "lucide-react";

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
        <TabsList className="sp-tabs w-full h-auto justify-start rounded-none bg-transparent p-0">
          {[
            { id: "dynamic", label: "Dynamic", Icon: Sparkles },
            { id: "presets", label: "Presets", Icon: Type },
            { id: "custom", label: "Custom", Icon: Sliders },
          ].map(({ id, label, Icon }) => (
            <TabsTrigger
              key={id}
              value={id}
              data-active={activeTab === id}
              className="sp-tab rounded-none border-0 bg-transparent p-0 shadow-none data-[state=active]:bg-transparent data-[state=active]:shadow-none focus-visible:outline-none"
            >
              <Icon className="w-3.5 h-3.5" strokeWidth={1.6} />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent
          value="dynamic"
          className="mt-4 focus-visible:outline-none"
        >
          <DynamicStylesPanel
            dynamicStyle={dynamicStyle}
            onDynamicStyleChange={onDynamicStyleChange}
            isHorizontal={isHorizontal}
          />
        </TabsContent>

        <TabsContent
          value="presets"
          className="mt-4 focus-visible:outline-none"
        >
          <StaticPresetsPanel
            currentStyle={style}
            onStyleChange={onStyleChange}
            activePresetId={activePresetId}
            isHorizontal={isHorizontal}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-4 focus-visible:outline-none">
          <TextStylePanel style={style} onStyleChange={onStyleChange} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
