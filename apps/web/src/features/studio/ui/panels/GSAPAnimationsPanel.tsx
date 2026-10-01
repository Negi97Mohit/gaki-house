// src/components/panels/GSAPAnimationsPanel.tsx
import React, { useState } from "react";
import { GSAP_PRESETS, GSAPPreset } from "@/features/animation/lib/gsapAnimations";
import { GSAPPresetPreview } from "@/features/banners/ui/GSAPAnimatedBanner";
import { cn } from "@gaki/core/lib/utils";
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
    <div className="flex flex-col gap-3.5 w-full antialiased">
      {/* Category Pills - Horizontal Scroll With Underline Indicator */}
      <div 
        className="flex items-center gap-1.5 overflow-x-auto pb-1 slim-scrollbar" 
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "relative flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-medium tracking-wide whitespace-nowrap transition-all duration-150 border shrink-0",
                isActive
                  ? "border-primary bg-primary/10 text-white shadow-sm ring-1 ring-primary/40"
                  : "border-white/10 hover:border-white/20 text-zinc-300 hover:text-white bg-white/[0.02]"
              )}
            >
              <Icon className={cn("w-3 h-3 transition-colors", isActive ? "text-primary" : "text-zinc-400")} />
              <span>{cat.name}</span>

              {isActive && (
                <span className="absolute -bottom-px left-2 right-2 h-[1.5px] bg-primary rounded-full shadow-[0_0_6px_var(--primary)]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Presets Grid - Responsive Multi-Column Layout */}
      <div className="grid grid-cols-2 gap-2.5">
        {filteredPresets.map((preset) => (
          <div 
            key={preset.id}
            className="rounded-xl overflow-hidden border border-white/10 hover:border-primary/50 transition-all duration-150 shadow-sm"
          >
            <GSAPPresetPreview
              preset={preset}
              isSelected={selectedPresetId === preset.id}
              onClick={() => onSelectPreset(preset)}
            />
          </div>
        ))}
      </div>

      {filteredPresets.length === 0 && (
        <div className="flex flex-col items-center justify-center p-10 text-center rounded-2xl bg-white/[0.02] border border-white/10">
          <Sparkles className="w-8 h-8 mb-2 text-zinc-400" />
          <p className="text-[12px] font-medium text-zinc-300">No animations found in this category.</p>
        </div>
      )}
    </div>
  );
};

export default GSAPAnimationsPanel;
