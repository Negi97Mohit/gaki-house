// src/components/panels/GSAPAnimationsPanel.tsx
import React, { useState } from "react";
import {
  GSAP_PRESETS,
  GSAPPreset,
} from "@/features/animation/lib/gsapAnimations";
import { GSAPPresetPreview } from "@/features/banners/ui/GSAPAnimatedBanner";

interface GSAPAnimationsPanelProps {
  onSelectPreset: (preset: GSAPPreset) => void;
  selectedPresetId?: string;
}

const CATEGORIES = [
  { id: "all", name: "All" },
  { id: "reveal", name: "Reveal" },
  { id: "kinetic", name: "Kinetic" },
  { id: "glitch", name: "Glitch" },
  { id: "3d", name: "3D" },
  { id: "text", name: "Text" },
  { id: "stylized", name: "Stylized" },
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
    <div className="flex flex-col gap-4 w-full antialiased">
      {/* Category filter */}
      <div className="-mx-1 flex items-center gap-0.5 overflow-x-auto pb-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            data-active={activeCategory === cat.id}
            className="sp-chip"
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filteredPresets.map((preset) => (
          <div
            key={preset.id}
            className="sp-tile"
            data-active={selectedPresetId === preset.id}
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
        <div className="py-12 text-center">
          <p className="text-[12px] text-white/45">
            No animations in this category yet.
          </p>
        </div>
      )}
    </div>
  );
};

export default GSAPAnimationsPanel;
