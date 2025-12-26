// src/components/panels/GSAPAnimationsPanel.tsx
import React, { useState } from "react";
import { GSAP_PRESETS, GSAPPreset } from "@/lib/gsapAnimations";
import { GSAPPresetPreview } from "@/components/GSAPAnimatedBanner";
import { cn } from "@/shared/lib/utils";
import { Sparkles, Zap, Box, Type, Paintbrush, Layers } from "lucide-react";

interface GSAPAnimationsPanelProps {
  onSelectPreset: (preset: GSAPPreset) => void;
  selectedPresetId?: string;
}

const CATEGORIES = [
  { id: "all", name: "All", icon: Sparkles },
  { id: "reveal", name: "Reveal", icon: Layers },
  { id: "kinetic", name: "Kinetic", icon: Zap },
  { id: "glitch", name: "Glitch", icon: Paintbrush },
  { id: "3d", name: "3D", icon: Box },
  { id: "text", name: "Text", icon: Type },
  { id: "stylized", name: "Stylized", icon: Sparkles },
];

export const GSAPAnimationsPanel: React.FC<GSAPAnimationsPanelProps> = ({
  onSelectPreset,
  selectedPresetId,
}) => {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredPresets =
    activeCategory === "all"
      ? GSAP_PRESETS
      : GSAP_PRESETS.filter((p) => p.category === activeCategory);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-border/50">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-foreground">Pro Animations</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
            GSAP
          </span>
        </div>
        <p className="text-xs text-muted-foreground">
          Professional-grade animations powered by GSAP. Hover to preview.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-border/30">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Presets Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-3">
          {filteredPresets.map((preset) => (
            <GSAPPresetPreview
              key={preset.id}
              preset={preset}
              isSelected={selectedPresetId === preset.id}
              onClick={() => onSelectPreset(preset)}
            />
          ))}
        </div>

        {filteredPresets.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
            <Sparkles className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No animations in this category</p>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-border/30 bg-muted/30">
        <p className="text-xs text-muted-foreground text-center">
          {filteredPresets.length} animation{filteredPresets.length !== 1 && "s"} available
        </p>
      </div>
    </div>
  );
};

export default GSAPAnimationsPanel;
