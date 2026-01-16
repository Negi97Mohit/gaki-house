import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName =
  | "default"
  | "ocean"
  | "forest"
  | "sunset"
  | "cyberpunk"
  | "aurora"
  | "midnight"
  | "sakura"
  | "volcanic"
  | "arctic"
  | "neon"
  | "ethereal"
  | "retro"
  | "monochrome"
  | "obsidian"
  | "champagne"
  | "emeraldNoir"
  | "roseGold"
  | "ultraviolet"
  | "caramelLatte"
  | "iceQueen"
  | "midnightTokyo"
  | "cosmicRing"
  | "hexGrid"
  | "prismWave"
  | "nebulaDust"
  | "matrixCode"
  | "liquidMetal"
  | "crystalCave"
  | "solarFlare"
  | "quantumField"
  | "abyssalDepth"
  | "cosmicRingPulse"
  | "cosmicRingDouble"
  | "cosmicRingSpiral"
  | "cosmicRingEclipse"
  | "cosmicRingAurora"
  | "hexGridHoneycomb"
  | "hexGridCyber"
  | "hexGridNeon"
  | "hexGridOrbit"
  | "hexGridVortex";

export type ThemeMode = "light" | "dark";

export interface ThemeConfig {
  name: string;
  description: string;
  colors: {
    light: string;
    dark: string;
  };
  ambient: {
    type:
      | "gradient"
      | "particles"
      | "waves"
      | "mesh"
      | "aurora"
      | "noise"
      | "glow"
      | "ring"
      | "hexagon"
      | "prism"
      | "nebula"
      | "matrix"
      | "liquid"
      | "crystal"
      | "flare"
      | "quantum"
      | "abyss"
      | "ringPulse"
      | "ringDouble"
      | "ringSpiral"
      | "ringEclipse"
      | "ringAurora"
      | "hexHoneycomb"
      | "hexCyber"
      | "hexNeon"
      | "hexOrbit"
      | "hexVortex";
    colors: string[];
    intensity: number;
    speed: number;
  };
  accent: string;
  glow: string;
}

interface ThemeState {
  theme: ThemeName;
  mode: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      // UPDATED: Default theme is now "iceQueen"
      theme: "iceQueen",
      mode: "dark",
      setTheme: (theme) => {
        set({ theme });
        applyTheme(theme, get().mode);
      },
      setMode: (mode) => {
        set({ mode });
        applyTheme(get().theme, mode);
      },
      toggleMode: () => {
        const newMode = get().mode === "dark" ? "light" : "dark";
        set({ mode: newMode });
        applyTheme(get().theme, newMode);
      },
    }),
    {
      name: "app-theme",
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme, state.mode);
        }
      },
    }
  )
);

function applyTheme(theme: ThemeName, mode: ThemeMode) {
  const root = document.documentElement;

  // Remove all theme classes
  const themeClasses = Object.keys(themes).map((t) => `theme-${t}`);
  root.classList.remove(...themeClasses, "dark", "light");

  // Apply new theme and mode
  root.classList.add(`theme-${theme}`);
  if (mode === "dark") {
    root.classList.add("dark");
  }
}

// Enhanced theme configurations with ambient settings
export const themes: Record<ThemeName, ThemeConfig> = {
  default: {
    name: "Golden Hour",
    description: "Warm amber tones with elegant gold accents",
    colors: { light: "#fbbf24", dark: "#facc15" },
    ambient: {
      type: "gradient",
      colors: ["#fbbf24", "#f59e0b", "#d97706"],
      intensity: 0.3,
      speed: 1,
    },
    accent: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.4)",
  },
  ocean: {
    name: "Deep Ocean",
    description: "Calming ocean depths with bioluminescent highlights",
    colors: { light: "#0ea5e9", dark: "#38bdf8" },
    ambient: {
      type: "waves",
      colors: ["#0ea5e9", "#0284c7", "#0369a1", "#075985"],
      intensity: 0.5,
      speed: 0.8,
    },
    accent: "#0ea5e9",
    glow: "rgba(14, 165, 233, 0.4)",
  },
  forest: {
    name: "Enchanted Forest",
    description: "Mystical greens with dappled light effects",
    colors: { light: "#22c55e", dark: "#4ade80" },
    ambient: {
      type: "particles",
      colors: ["#22c55e", "#16a34a", "#15803d", "#86efac"],
      intensity: 0.4,
      speed: 0.5,
    },
    accent: "#22c55e",
    glow: "rgba(34, 197, 94, 0.4)",
  },
  sunset: {
    name: "Burning Sunset",
    description: "Fiery oranges fading into purple twilight",
    colors: { light: "#f97316", dark: "#fb923c" },
    ambient: {
      type: "gradient",
      colors: ["#f97316", "#ea580c", "#c2410c", "#9a3412"],
      intensity: 0.5,
      speed: 0.6,
    },
    accent: "#f97316",
    glow: "rgba(249, 115, 22, 0.4)",
  },
  cyberpunk: {
    name: "Cyberpunk",
    description: "Neon-drenched dystopia with electric accents",
    colors: { light: "#f0abfc", dark: "#e879f9" },
    ambient: {
      type: "mesh",
      colors: ["#f0abfc", "#e879f9", "#06b6d4", "#22d3ee"],
      intensity: 0.7,
      speed: 1.2,
    },
    accent: "#e879f9",
    glow: "rgba(232, 121, 249, 0.5)",
  },
  aurora: {
    name: "Northern Lights",
    description: "Dancing aurora borealis with ethereal movements",
    colors: { light: "#34d399", dark: "#6ee7b7" },
    ambient: {
      type: "aurora",
      colors: ["#34d399", "#2dd4bf", "#a78bfa", "#c084fc", "#22d3ee"],
      intensity: 0.6,
      speed: 0.4,
    },
    accent: "#34d399",
    glow: "rgba(52, 211, 153, 0.4)",
  },
  midnight: {
    name: "Midnight Blue",
    description: "Deep midnight with starlight sparkles",
    colors: { light: "#6366f1", dark: "#818cf8" },
    ambient: {
      type: "particles",
      colors: ["#6366f1", "#4f46e5", "#4338ca", "#818cf8"],
      intensity: 0.4,
      speed: 0.3,
    },
    accent: "#6366f1",
    glow: "rgba(99, 102, 241, 0.4)",
  },
  sakura: {
    name: "Sakura Bloom",
    description: "Delicate cherry blossom pink with soft petals",
    colors: { light: "#f472b6", dark: "#f9a8d4" },
    ambient: {
      type: "particles",
      colors: ["#f472b6", "#ec4899", "#db2777", "#fce7f3"],
      intensity: 0.5,
      speed: 0.6,
    },
    accent: "#f472b6",
    glow: "rgba(244, 114, 182, 0.4)",
  },
  volcanic: {
    name: "Volcanic Ember",
    description: "Molten lava flows with intense heat radiating",
    colors: { light: "#ef4444", dark: "#f87171" },
    ambient: {
      type: "glow",
      colors: ["#ef4444", "#dc2626", "#b91c1c", "#f97316"],
      intensity: 0.6,
      speed: 0.8,
    },
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.5)",
  },
  arctic: {
    name: "Arctic Frost",
    description: "Crystalline ice with frozen shimmer effects",
    colors: { light: "#67e8f9", dark: "#a5f3fc" },
    ambient: {
      type: "noise",
      colors: ["#67e8f9", "#22d3ee", "#06b6d4", "#e0f2fe"],
      intensity: 0.3,
      speed: 0.2,
    },
    accent: "#67e8f9",
    glow: "rgba(103, 232, 249, 0.4)",
  },
  neon: {
    name: "Neon Nights",
    description: "Electric neon signs glowing in darkness",
    colors: { light: "#a3e635", dark: "#bef264" },
    ambient: {
      type: "glow",
      colors: ["#a3e635", "#84cc16", "#65a30d", "#f0abfc"],
      intensity: 0.7,
      speed: 1.0,
    },
    accent: "#a3e635",
    glow: "rgba(163, 230, 53, 0.5)",
  },
  ethereal: {
    name: "Ethereal Dream",
    description: "Soft pastels floating in a dreamlike haze",
    colors: { light: "#c4b5fd", dark: "#ddd6fe" },
    ambient: {
      type: "aurora",
      colors: ["#c4b5fd", "#a78bfa", "#8b5cf6", "#f0abfc", "#fce7f3"],
      intensity: 0.4,
      speed: 0.3,
    },
    accent: "#c4b5fd",
    glow: "rgba(196, 181, 253, 0.4)",
  },
  retro: {
    name: "Retro Wave",
    description: "80s synthwave with grid lines and chrome",
    colors: { light: "#fb7185", dark: "#fda4af" },
    ambient: {
      type: "mesh",
      colors: ["#fb7185", "#f43f5e", "#06b6d4", "#8b5cf6"],
      intensity: 0.6,
      speed: 0.9,
    },
    accent: "#fb7185",
    glow: "rgba(251, 113, 133, 0.5)",
  },
  monochrome: {
    name: "Monochrome",
    description: "Elegant grayscale with subtle silver accents",
    colors: { light: "#a1a1aa", dark: "#d4d4d8" },
    ambient: {
      type: "noise",
      colors: ["#a1a1aa", "#71717a", "#52525b", "#e4e4e7"],
      intensity: 0.2,
      speed: 0.4,
    },
    accent: "#a1a1aa",
    glow: "rgba(161, 161, 170, 0.3)",
  },
  obsidian: {
    name: "Obsidian Luxe",
    description: "Ultra-dark elegance with platinum highlights",
    colors: { light: "#1c1c1e", dark: "#e5e5e7" },
    ambient: {
      type: "mesh",
      colors: ["#1c1c1e", "#2c2c2e", "#3c3c3e", "#e5e5e7"],
      intensity: 0.15,
      speed: 0.2,
    },
    accent: "#e5e5e7",
    glow: "rgba(229, 229, 231, 0.2)",
  },
  champagne: {
    name: "Champagne Toast",
    description: "Effervescent gold with warm ivory undertones",
    colors: { light: "#c9a962", dark: "#f7e7a3" },
    ambient: {
      type: "particles",
      colors: ["#c9a962", "#e8d5a3", "#f7e7a3", "#fff8e1"],
      intensity: 0.4,
      speed: 0.5,
    },
    accent: "#c9a962",
    glow: "rgba(201, 169, 98, 0.4)",
  },
  emeraldNoir: {
    name: "Emerald Noir",
    description: "Deep forest green with art deco gold accents",
    colors: { light: "#0d4f3c", dark: "#2ecc71" },
    ambient: {
      type: "gradient",
      colors: ["#0d4f3c", "#1a7a5c", "#2ecc71", "#c9a962"],
      intensity: 0.5,
      speed: 0.4,
    },
    accent: "#2ecc71",
    glow: "rgba(46, 204, 113, 0.4)",
  },
  roseGold: {
    name: "Rosé Gold",
    description: "Blush pink meets metallic warmth for timeless glamour",
    colors: { light: "#b76e79", dark: "#e8b4bc" },
    ambient: {
      type: "aurora",
      colors: ["#b76e79", "#d4a5a5", "#e8b4bc", "#fce4ec"],
      intensity: 0.45,
      speed: 0.35,
    },
    accent: "#b76e79",
    glow: "rgba(183, 110, 121, 0.4)",
  },
  ultraviolet: {
    name: "Ultraviolet",
    description: "Electric purple with holographic shimmer",
    colors: { light: "#7c3aed", dark: "#a78bfa" },
    ambient: {
      type: "mesh",
      colors: ["#7c3aed", "#8b5cf6", "#a78bfa", "#c4b5fd", "#06b6d4"],
      intensity: 0.65,
      speed: 1.1,
    },
    accent: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.5)",
  },
  caramelLatte: {
    name: "Caramel Latte",
    description: "Warm espresso browns with creamy caramel swirls",
    colors: { light: "#8b5a2b", dark: "#d4a574" },
    ambient: {
      type: "gradient",
      colors: ["#8b5a2b", "#a67c52", "#d4a574", "#f5e6d3"],
      intensity: 0.35,
      speed: 0.3,
    },
    accent: "#d4a574",
    glow: "rgba(212, 165, 116, 0.4)",
  },
  iceQueen: {
    name: "Ice Queen",
    description: "Frozen crystalline whites with icy blue reflections",
    colors: { light: "#94a3b8", dark: "#e2e8f0" },
    ambient: {
      type: "aurora",
      colors: ["#e2e8f0", "#cbd5e1", "#94a3b8", "#38bdf8"],
      intensity: 0.3,
      speed: 0.25,
    },
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.3)",
  },
  midnightTokyo: {
    name: "Midnight Tokyo",
    description: "Neon-lit streets with deep indigo shadows",
    colors: { light: "#ff2d92", dark: "#ff6eb4" },
    ambient: {
      type: "glow",
      colors: ["#ff2d92", "#ff6eb4", "#00d4ff", "#7c3aed"],
      intensity: 0.7,
      speed: 1.3,
    },
    accent: "#ff2d92",
    glow: "rgba(255, 45, 146, 0.5)",
  },
  cosmicRing: {
    name: "Cosmic Ring",
    description: "Orbital rings of light with cosmic energy",
    colors: { light: "#6366f1", dark: "#a5b4fc" },
    ambient: {
      type: "ring",
      colors: ["#6366f1", "#8b5cf6", "#a855f7", "#22d3ee"],
      intensity: 0.6,
      speed: 0.8,
    },
    accent: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.5)",
  },
  hexGrid: {
    name: "Hex Grid",
    description: "Geometric honeycomb patterns with tech vibes",
    colors: { light: "#10b981", dark: "#34d399" },
    ambient: {
      type: "hexagon",
      colors: ["#10b981", "#059669", "#047857", "#6ee7b7"],
      intensity: 0.5,
      speed: 0.6,
    },
    accent: "#10b981",
    glow: "rgba(16, 185, 129, 0.4)",
  },
  prismWave: {
    name: "Prism Wave",
    description: "Refracted light with rainbow spectrum waves",
    colors: { light: "#f472b6", dark: "#f9a8d4" },
    ambient: {
      type: "prism",
      colors: ["#ef4444", "#f97316", "#eab308", "#22c55e", "#06b6d4", "#8b5cf6"],
      intensity: 0.55,
      speed: 0.7,
    },
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.4)",
  },
  nebulaDust: {
    name: "Nebula Dust",
    description: "Cosmic clouds with scattered stardust particles",
    colors: { light: "#c084fc", dark: "#e879f9" },
    ambient: {
      type: "nebula",
      colors: ["#c084fc", "#a855f7", "#7c3aed", "#ec4899", "#06b6d4"],
      intensity: 0.65,
      speed: 0.4,
    },
    accent: "#a855f7",
    glow: "rgba(168, 85, 247, 0.5)",
  },
  matrixCode: {
    name: "Matrix Code",
    description: "Digital rain with flowing code streams",
    colors: { light: "#22c55e", dark: "#4ade80" },
    ambient: {
      type: "matrix",
      colors: ["#22c55e", "#16a34a", "#15803d", "#86efac"],
      intensity: 0.7,
      speed: 1.5,
    },
    accent: "#22c55e",
    glow: "rgba(34, 197, 94, 0.5)",
  },
  liquidMetal: {
    name: "Liquid Metal",
    description: "Molten chrome with fluid mercury reflections",
    colors: { light: "#71717a", dark: "#a1a1aa" },
    ambient: {
      type: "liquid",
      colors: ["#71717a", "#a1a1aa", "#d4d4d8", "#52525b"],
      intensity: 0.5,
      speed: 0.5,
    },
    accent: "#a1a1aa",
    glow: "rgba(161, 161, 170, 0.4)",
  },
  crystalCave: {
    name: "Crystal Cave",
    description: "Amethyst caverns with prismatic crystal formations",
    colors: { light: "#a855f7", dark: "#c084fc" },
    ambient: {
      type: "crystal",
      colors: ["#a855f7", "#7c3aed", "#6366f1", "#ec4899"],
      intensity: 0.55,
      speed: 0.35,
    },
    accent: "#a855f7",
    glow: "rgba(168, 85, 247, 0.45)",
  },
  solarFlare: {
    name: "Solar Flare",
    description: "Explosive solar energy with plasma bursts",
    colors: { light: "#f59e0b", dark: "#fbbf24" },
    ambient: {
      type: "flare",
      colors: ["#f59e0b", "#f97316", "#ef4444", "#fbbf24"],
      intensity: 0.75,
      speed: 1.2,
    },
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.55)",
  },
  quantumField: {
    name: "Quantum Field",
    description: "Subatomic particles with probability wave patterns",
    colors: { light: "#0ea5e9", dark: "#38bdf8" },
    ambient: {
      type: "quantum",
      colors: ["#0ea5e9", "#06b6d4", "#14b8a6", "#8b5cf6"],
      intensity: 0.6,
      speed: 0.9,
    },
    accent: "#0ea5e9",
    glow: "rgba(14, 165, 233, 0.45)",
  },
  abyssalDepth: {
    name: "Abyssal Depth",
    description: "Deep ocean trenches with bioluminescent creatures",
    colors: { light: "#0369a1", dark: "#0284c7" },
    ambient: {
      type: "abyss",
      colors: ["#0369a1", "#0c4a6e", "#164e63", "#22d3ee"],
      intensity: 0.5,
      speed: 0.3,
    },
    accent: "#0284c7",
    glow: "rgba(2, 132, 199, 0.4)",
  },
};
