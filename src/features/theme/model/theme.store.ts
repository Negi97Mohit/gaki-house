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
  | "hexGridVortex"
  | "plasmaStorm"
  | "laserGrid"
  | "particleNova"
  | "waveformPulse"
  | "holographicShift"
  | "starfieldWarp"
  | "electricArc"
  | "fluidDynamics"
  | "fractalBloom"
  | "gravitationalLens"
  // New Vogue & Chic Themes
  | "marbleVeins"
  | "silkRipple"
  | "moireElegance"
  | "goldLeaf"
  | "inkWash"
  | "pearlEssence"
  | "velvetNight"
  | "crystalFacets"
  | "linearGrace"
  | "zenGarden";

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
      | "hexVortex"
      | "plasmaStorm"
      | "laserGrid"
      | "particleNova"
      | "waveformPulse"
      | "holographicShift"
      | "starfieldWarp"
      | "electricArc"
      | "fluidDynamics"
      | "fractalBloom"
      | "gravitationalLens"
      | "marbleVeins"
      | "silkRipple"
      | "moireElegance"
      | "goldLeaf"
      | "inkWash"
      | "pearlEssence"
      | "velvetNight"
      | "crystalFacets"
      | "linearGrace"
      | "zenGarden";
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
  // Cosmic Ring Variations
  cosmicRingPulse: {
    name: "Cosmic Ring Pulse",
    description: "Pulsating orbital rings with synchronized energy waves",
    colors: { light: "#f472b6", dark: "#f9a8d4" },
    ambient: {
      type: "ringPulse",
      colors: ["#f472b6", "#ec4899", "#db2777", "#f0abfc"],
      intensity: 0.7,
      speed: 1.2,
    },
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.5)",
  },
  cosmicRingDouble: {
    name: "Cosmic Ring Double",
    description: "Intersecting dual ring systems with orbital dynamics",
    colors: { light: "#22d3ee", dark: "#67e8f9" },
    ambient: {
      type: "ringDouble",
      colors: ["#22d3ee", "#06b6d4", "#0891b2", "#a5f3fc"],
      intensity: 0.6,
      speed: 0.7,
    },
    accent: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.45)",
  },
  cosmicRingSpiral: {
    name: "Cosmic Ring Spiral",
    description: "Spiraling galaxy arms with stellar dust trails",
    colors: { light: "#a78bfa", dark: "#c4b5fd" },
    ambient: {
      type: "ringSpiral",
      colors: ["#a78bfa", "#8b5cf6", "#7c3aed", "#ddd6fe"],
      intensity: 0.65,
      speed: 0.5,
    },
    accent: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.5)",
  },
  cosmicRingEclipse: {
    name: "Cosmic Ring Eclipse",
    description: "Solar eclipse corona with dramatic light bending",
    colors: { light: "#fbbf24", dark: "#fcd34d" },
    ambient: {
      type: "ringEclipse",
      colors: ["#fbbf24", "#f59e0b", "#d97706", "#fef3c7"],
      intensity: 0.75,
      speed: 0.4,
    },
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.55)",
  },
  cosmicRingAurora: {
    name: "Cosmic Ring Aurora",
    description: "Northern lights wrapped in celestial ring formations",
    colors: { light: "#34d399", dark: "#6ee7b7" },
    ambient: {
      type: "ringAurora",
      colors: ["#34d399", "#10b981", "#059669", "#a78bfa", "#22d3ee"],
      intensity: 0.6,
      speed: 0.6,
    },
    accent: "#10b981",
    glow: "rgba(16, 185, 129, 0.45)",
  },
  // Hex Grid Variations
  hexGridHoneycomb: {
    name: "Hex Grid Honeycomb",
    description: "Organic honeycomb structures with golden amber glow",
    colors: { light: "#f59e0b", dark: "#fbbf24" },
    ambient: {
      type: "hexHoneycomb",
      colors: ["#f59e0b", "#d97706", "#b45309", "#fcd34d"],
      intensity: 0.55,
      speed: 0.4,
    },
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.45)",
  },
  hexGridCyber: {
    name: "Hex Grid Cyber",
    description: "Cybernetic neural network with electric pulses",
    colors: { light: "#06b6d4", dark: "#22d3ee" },
    ambient: {
      type: "hexCyber",
      colors: ["#06b6d4", "#0891b2", "#0e7490", "#67e8f9", "#f0abfc"],
      intensity: 0.7,
      speed: 1.0,
    },
    accent: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.5)",
  },
  hexGridNeon: {
    name: "Hex Grid Neon",
    description: "Retro-futuristic neon hexagons with vibrant glow",
    colors: { light: "#e879f9", dark: "#f0abfc" },
    ambient: {
      type: "hexNeon",
      colors: ["#e879f9", "#d946ef", "#c026d3", "#f5d0fe", "#22d3ee"],
      intensity: 0.75,
      speed: 0.9,
    },
    accent: "#d946ef",
    glow: "rgba(217, 70, 239, 0.55)",
  },
  hexGridOrbit: {
    name: "Hex Grid Orbit",
    description: "Orbital hexagonal stations with rotating segments",
    colors: { light: "#64748b", dark: "#94a3b8" },
    ambient: {
      type: "hexOrbit",
      colors: ["#64748b", "#475569", "#334155", "#cbd5e1", "#38bdf8"],
      intensity: 0.5,
      speed: 0.6,
    },
    accent: "#64748b",
    glow: "rgba(100, 116, 139, 0.4)",
  },
  hexGridVortex: {
    name: "Hex Grid Vortex",
    description: "Hypnotic vortex of hexagonal dimensions",
    colors: { light: "#ef4444", dark: "#f87171" },
    ambient: {
      type: "hexVortex",
      colors: ["#ef4444", "#dc2626", "#b91c1c", "#fca5a5", "#f97316"],
      intensity: 0.7,
      speed: 1.1,
    },
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.5)",
  },
  // NEW ANIMATED THEMES
  plasmaStorm: {
    name: "Plasma Storm",
    description: "Chaotic plasma energy with electric discharges",
    colors: { light: "#8b5cf6", dark: "#a78bfa" },
    ambient: {
      type: "plasmaStorm",
      colors: ["#8b5cf6", "#7c3aed", "#ec4899", "#06b6d4", "#fbbf24"],
      intensity: 0.8,
      speed: 1.4,
    },
    accent: "#8b5cf6",
    glow: "rgba(139, 92, 246, 0.55)",
  },
  laserGrid: {
    name: "Laser Grid",
    description: "Precision laser beams forming a dynamic 3D grid",
    colors: { light: "#ef4444", dark: "#f87171" },
    ambient: {
      type: "laserGrid",
      colors: ["#ef4444", "#22c55e", "#3b82f6", "#fbbf24"],
      intensity: 0.7,
      speed: 0.8,
    },
    accent: "#ef4444",
    glow: "rgba(239, 68, 68, 0.5)",
  },
  particleNova: {
    name: "Particle Nova",
    description: "Explosive particle bursts radiating from center",
    colors: { light: "#f97316", dark: "#fb923c" },
    ambient: {
      type: "particleNova",
      colors: ["#f97316", "#fbbf24", "#ef4444", "#ec4899"],
      intensity: 0.75,
      speed: 1.0,
    },
    accent: "#f97316",
    glow: "rgba(249, 115, 22, 0.55)",
  },
  waveformPulse: {
    name: "Waveform Pulse",
    description: "Audio-reactive waveform visualizations",
    colors: { light: "#22c55e", dark: "#4ade80" },
    ambient: {
      type: "waveformPulse",
      colors: ["#22c55e", "#06b6d4", "#8b5cf6", "#ec4899"],
      intensity: 0.65,
      speed: 1.2,
    },
    accent: "#22c55e",
    glow: "rgba(34, 197, 94, 0.5)",
  },
  holographicShift: {
    name: "Holographic Shift",
    description: "Iridescent holographic surface with color shifting",
    colors: { light: "#06b6d4", dark: "#22d3ee" },
    ambient: {
      type: "holographicShift",
      colors: ["#06b6d4", "#8b5cf6", "#ec4899", "#22c55e", "#fbbf24"],
      intensity: 0.6,
      speed: 0.7,
    },
    accent: "#06b6d4",
    glow: "rgba(6, 182, 212, 0.45)",
  },
  starfieldWarp: {
    name: "Starfield Warp",
    description: "Hyperspace star trails with motion blur",
    colors: { light: "#f8fafc", dark: "#e2e8f0" },
    ambient: {
      type: "starfieldWarp",
      colors: ["#f8fafc", "#94a3b8", "#3b82f6", "#8b5cf6"],
      intensity: 0.7,
      speed: 1.5,
    },
    accent: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.4)",
  },
  electricArc: {
    name: "Electric Arc",
    description: "High voltage lightning arcs with crackling energy",
    colors: { light: "#3b82f6", dark: "#60a5fa" },
    ambient: {
      type: "electricArc",
      colors: ["#3b82f6", "#06b6d4", "#f8fafc", "#8b5cf6"],
      intensity: 0.8,
      speed: 1.6,
    },
    accent: "#3b82f6",
    glow: "rgba(59, 130, 246, 0.55)",
  },
  fluidDynamics: {
    name: "Fluid Dynamics",
    description: "Smooth flowing liquid with physics simulation",
    colors: { light: "#ec4899", dark: "#f472b6" },
    ambient: {
      type: "fluidDynamics",
      colors: ["#ec4899", "#8b5cf6", "#06b6d4", "#22c55e"],
      intensity: 0.55,
      speed: 0.5,
    },
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.45)",
  },
  fractalBloom: {
    name: "Fractal Bloom",
    description: "Recursive fractal patterns blooming outward",
    colors: { light: "#14b8a6", dark: "#2dd4bf" },
    ambient: {
      type: "fractalBloom",
      colors: ["#14b8a6", "#06b6d4", "#8b5cf6", "#fbbf24"],
      intensity: 0.6,
      speed: 0.6,
    },
    accent: "#14b8a6",
    glow: "rgba(20, 184, 166, 0.45)",
  },
  gravitationalLens: {
    name: "Gravitational Lens",
    description: "Space-time distortion with light bending effects",
    colors: { light: "#1e1b4b", dark: "#312e81" },
    ambient: {
      type: "gravitationalLens",
      colors: ["#1e1b4b", "#4c1d95", "#7c3aed", "#06b6d4", "#fbbf24"],
      intensity: 0.7,
      speed: 0.4,
    },
    accent: "#7c3aed",
    glow: "rgba(124, 58, 237, 0.5)",
  },
  // NEW VOGUE & CHIC MINIMALIST THEMES
  marbleVeins: {
    name: "Marble Veins",
    description: "Elegant marble patterns with flowing gold veins",
    colors: { light: "#d4d4d8", dark: "#e4e4e7" },
    ambient: {
      type: "marbleVeins",
      colors: ["#e4e4e7", "#a1a1aa", "#c9a962", "#f5f5f5", "#71717a"],
      intensity: 0.35,
      speed: 0.25,
    },
    accent: "#c9a962",
    glow: "rgba(201, 169, 98, 0.3)",
  },
  silkRipple: {
    name: "Silk Ripple",
    description: "Luxurious silk fabric with gentle undulating waves",
    colors: { light: "#fce7f3", dark: "#fbcfe8" },
    ambient: {
      type: "silkRipple",
      colors: ["#fce7f3", "#fbcfe8", "#f9a8d4", "#f5d0fe", "#fdf2f8"],
      intensity: 0.4,
      speed: 0.3,
    },
    accent: "#ec4899",
    glow: "rgba(236, 72, 153, 0.25)",
  },
  moireElegance: {
    name: "Moiré Elegance",
    description: "Sophisticated moiré interference patterns",
    colors: { light: "#18181b", dark: "#27272a" },
    ambient: {
      type: "moireElegance",
      colors: ["#27272a", "#3f3f46", "#52525b", "#18181b", "#71717a"],
      intensity: 0.5,
      speed: 0.2,
    },
    accent: "#a1a1aa",
    glow: "rgba(161, 161, 170, 0.3)",
  },
  goldLeaf: {
    name: "Gold Leaf",
    description: "Delicate gold leaf fragments with subtle shimmer",
    colors: { light: "#fef3c7", dark: "#fcd34d" },
    ambient: {
      type: "goldLeaf",
      colors: ["#fcd34d", "#fbbf24", "#f59e0b", "#fef3c7", "#d97706"],
      intensity: 0.45,
      speed: 0.35,
    },
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.35)",
  },
  inkWash: {
    name: "Ink Wash",
    description: "Japanese sumi-e inspired flowing ink gradients",
    colors: { light: "#f5f5f5", dark: "#18181b" },
    ambient: {
      type: "inkWash",
      colors: ["#18181b", "#27272a", "#3f3f46", "#71717a", "#f5f5f5"],
      intensity: 0.55,
      speed: 0.2,
    },
    accent: "#52525b",
    glow: "rgba(82, 82, 91, 0.35)",
  },
  pearlEssence: {
    name: "Pearl Essence",
    description: "Iridescent pearl with soft rainbow reflections",
    colors: { light: "#f8fafc", dark: "#e2e8f0" },
    ambient: {
      type: "pearlEssence",
      colors: ["#f8fafc", "#e2e8f0", "#fce7f3", "#dbeafe", "#dcfce7"],
      intensity: 0.3,
      speed: 0.25,
    },
    accent: "#cbd5e1",
    glow: "rgba(203, 213, 225, 0.3)",
  },
  velvetNight: {
    name: "Velvet Night",
    description: "Deep velvet textures with subtle depth variations",
    colors: { light: "#1e1b4b", dark: "#312e81" },
    ambient: {
      type: "velvetNight",
      colors: ["#1e1b4b", "#312e81", "#3730a3", "#4c1d95", "#581c87"],
      intensity: 0.5,
      speed: 0.2,
    },
    accent: "#6366f1",
    glow: "rgba(99, 102, 241, 0.35)",
  },
  crystalFacets: {
    name: "Crystal Facets",
    description: "Geometric crystal cuts with prismatic light",
    colors: { light: "#f0f9ff", dark: "#e0f2fe" },
    ambient: {
      type: "crystalFacets",
      colors: ["#e0f2fe", "#bae6fd", "#7dd3fc", "#38bdf8", "#f0f9ff"],
      intensity: 0.4,
      speed: 0.35,
    },
    accent: "#0ea5e9",
    glow: "rgba(14, 165, 233, 0.3)",
  },
  linearGrace: {
    name: "Linear Grace",
    description: "Minimalist parallel lines with graceful motion",
    colors: { light: "#fafafa", dark: "#f5f5f5" },
    ambient: {
      type: "linearGrace",
      colors: ["#e5e5e5", "#d4d4d4", "#a3a3a3", "#737373", "#525252"],
      intensity: 0.35,
      speed: 0.3,
    },
    accent: "#737373",
    glow: "rgba(115, 115, 115, 0.25)",
  },
  zenGarden: {
    name: "Zen Garden",
    description: "Serene sand ripples with mindful tranquility",
    colors: { light: "#fef7ed", dark: "#fefce8" },
    ambient: {
      type: "zenGarden",
      colors: ["#fef7ed", "#fde68a", "#d4d4d8", "#a8a29e", "#78716c"],
      intensity: 0.3,
      speed: 0.15,
    },
    accent: "#a8a29e",
    glow: "rgba(168, 162, 158, 0.25)",
  },
};
