// src/components/panels/GSAPAnimationsPanel.tsx
import React, { useState } from "react";
import { GSAP_PRESETS, GSAPPreset } from "@/features/animation/lib/gsapAnimations";
import { GSAPPresetPreview } from "@/features/banners/ui/GSAPAnimatedBanner";
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
    <div className="flex flex-col h-full -m-4">
      {/* Category Tabs - Compact */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-border/10" style={{ scrollbarWidth: 'none' }}>
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium whitespace-nowrap transition-all",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Icon className="w-3 h-3" />
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Presets Grid - Full content area */}
      <div className="flex-1 overflow-y-auto p-2" style={{ scrollbarWidth: 'none' }}>
        <div className="grid grid-cols-2 gap-2">
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
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground/50">
            <Sparkles className="w-6 h-6 mb-2" />
            <p className="text-xs">No animations</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GSAPAnimationsPanel;
