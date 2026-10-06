import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName =
  | "eventHorizon"
  | "silkFilaments"
  | "orbitalGlobe"
  | "hypercube"
  | "halftoneTide"
  | "harmonograph"
  | "flowField"
  | "plexusDrift"
  | "spectralCurtains"
  | "prismBeams"
  | "inkBloom"
  | "brushStrokes"
  | "ditherField"
  | "stainedGlass"
  | "livePen"
  | "grainMesh"
  | "glitchScan"
  | "kaleidoscope"
  | "paperLayers"
  | "pendulumWave"
  | "moireRings"
  | "bokehDrift"
  | "warpGrid"
  | "ridgeline"
  | "phyllotaxis"
  | "colorField"
  | "rippleRain"
  | "glyphField"
  | "stringArt"
  | "contourTopo";

export type ThemeMode = "light" | "dark";

export interface ThemeConfig {
  name: string;
  description: string;
  colors: { light: string; dark: string };
  ambient: {
    type: ThemeName; // same strings as FuturisticType in futuristic-canvas.tsx
    colors: string[]; // 6-digit hex only
    intensity: number;
    speed: number;
  };
  accent: string;
  glow: string;
}

export type PlatformLayout =
  | "default"
  | "compact"
  | "cozy"
  | "theater"
  | "magazine"
  | "cinematic"
  | "mosaic"
  | "feed"
  | "netflix"
  | "youtube"
  | "hbo"
  | "appletv"
  | "disneyplus"
  | "spotify";

export const PLATFORM_LAYOUTS: {
  id: PlatformLayout;
  label: string;
  description: string;
  category?: string;
}[] = [
  {
    id: "default",
    label: "Default",
    description: "Balanced grid layout",
    category: "Classic",
  },
  {
    id: "compact",
    label: "Compact",
    description: "Dense, more content visible",
    category: "Classic",
  },
  {
    id: "cozy",
    label: "Cozy",
    description: "Larger cards, more spacing",
    category: "Classic",
  },
  {
    id: "theater",
    label: "Theater",
    description: "Wide view, collapsed sidebar",
    category: "Classic",
  },
  {
    id: "magazine",
    label: "Magazine",
    description: "Editorial featured + grid mix",
    category: "Classic",
  },
  {
    id: "cinematic",
    label: "Cinematic",
    description: "Widescreen 16:9 cards",
    category: "Classic",
  },
  {
    id: "mosaic",
    label: "Mosaic",
    description: "Pinterest-style staggered grid",
    category: "Classic",
  },
  {
    id: "feed",
    label: "Feed",
    description: "Single-column social feed",
    category: "Classic",
  },
  {
    id: "netflix",
    label: "Netflix",
    description: "Horizontal rows with big hero banner",
    category: "Streaming",
  },
  {
    id: "youtube",
    label: "YouTube",
    description: "Thumbnail grid with rich info cards",
    category: "Streaming",
  },
  {
    id: "hbo",
    label: "HBO Max",
    description: "Dark cinematic tiles with spotlight hero",
    category: "Streaming",
  },
  {
    id: "appletv",
    label: "Apple TV+",
    description: "Minimal, large artwork with clean type",
    category: "Streaming",
  },
  {
    id: "disneyplus",
    label: "Disney+",
    description: "Rounded cards with category carousels",
    category: "Streaming",
  },
  {
    id: "spotify",
    label: "Spotify",
    description: "Compact rounded cards in tight rows",
    category: "Streaming",
  },
];

export const APP_FONTS = [
  "geist-sans",
  "Inter",
  "DM Sans",
  "Plus Jakarta Sans",
  "Space Grotesk",
  "Outfit",
  "Manrope",
  "Sora",
  "Lexend",
  "Figtree",
  "Onest",
  "Rubik",
  "Nunito",
] as const;

export type AppFont = (typeof APP_FONTS)[number];

export const DEFAULT_THEME: ThemeName = "phyllotaxis";

export const themes: Record<ThemeName, ThemeConfig> = {
  eventHorizon: {
    name: "Event Horizon",
    description: "A lensed accretion disk orbiting a silent black hole",
    colors: { light: "#c8643c", dark: "#ffb45e" },
    ambient: {
      type: "eventHorizon",
      colors: ["#f5d6a8", "#ffb45e", "#c8643c", "#8fb8ff"],
      intensity: 0.7,
      speed: 0.8,
    },
    accent: "#ffb45e",
    glow: "rgba(255, 180, 94, 0.35)",
  },
  pendulumWave: {
    name: "Pendulum Wave",
    description: "A row of dots drifting in and out of phase",
    colors: { light: "#6366f1", dark: "#7dd3fc" },
    ambient: {
      type: "pendulumWave",
      colors: ["#f8fafc", "#7dd3fc", "#c4b5fd", "#fda4af"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#7dd3fc",
    glow: "rgba(125, 211, 252, 0.3)",
  },
  moireRings: {
    name: "Moiré Rings",
    description: "Two ring sets sliding into interference",
    colors: { light: "#6366f1", dark: "#a5b4fc" },
    ambient: {
      type: "moireRings",
      colors: ["#f1f5f9", "#a5b4fc", "#fda4af"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#a5b4fc",
    glow: "rgba(165, 180, 252, 0.3)",
  },
  bokehDrift: {
    name: "Bokeh Drift",
    description: "Pastel lens discs floating out of focus",
    colors: { light: "#e0708f", dark: "#ffadad" },
    ambient: {
      type: "bokehDrift",
      colors: ["#ffd6a5", "#ffadad", "#fdffb6", "#bdb2ff", "#9bf6ff"],
      intensity: 0.7,
      speed: 0.8,
    },
    accent: "#bdb2ff",
    glow: "rgba(189, 178, 255, 0.3)",
  },
  warpGrid: {
    name: "Warp Grid",
    description: "A fine grid bent by invisible gravity",
    colors: { light: "#0284c7", dark: "#38bdf8" },
    ambient: {
      type: "warpGrid",
      colors: ["#a1a1aa", "#e4e4e7", "#38bdf8"],
      intensity: 0.7,
      speed: 0.9,
    },
    accent: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.3)",
  },
  ridgeline: {
    name: "Ridgeline",
    description: "Stacked pulsar-plot waveforms in fine white line",
    colors: { light: "#6366f1", dark: "#ffffff" },
    ambient: {
      type: "ridgeline",
      colors: ["#ffffff", "#a5b4fc", "#f9a8d4"],
      intensity: 0.8,
      speed: 0.8,
    },
    accent: "#a5b4fc",
    glow: "rgba(165, 180, 252, 0.25)",
  },
  phyllotaxis: {
    name: "Sunflower",
    description: "A golden-angle spiral that slowly re-tunes itself",
    colors: { light: "#ea580c", dark: "#fb923c" },
    ambient: {
      type: "phyllotaxis",
      colors: ["#fde68a", "#fb923c", "#f472b6", "#a78bfa"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#fb923c",
    glow: "rgba(251, 146, 60, 0.3)",
  },
  colorField: {
    name: "Color Field",
    description: "Soft breathing fields of pure color",
    colors: { light: "#d1495b", dark: "#edae49" },
    ambient: {
      type: "colorField",
      colors: ["#d1495b", "#edae49", "#30638e", "#00798c"],
      intensity: 0.8,
      speed: 0.8,
    },
    accent: "#edae49",
    glow: "rgba(237, 174, 73, 0.25)",
  },
  rippleRain: {
    name: "Ripple Rain",
    description: "Raindrop rings interfering on still water",
    colors: { light: "#0284c7", dark: "#bae6fd" },
    ambient: {
      type: "rippleRain",
      colors: ["#bae6fd", "#e0f2fe", "#a5b4fc"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#bae6fd",
    glow: "rgba(186, 230, 253, 0.3)",
  },
  glyphField: {
    name: "Glyph Field",
    description: "Typographic plasma built from monospace characters",
    colors: { light: "#16a34a", dark: "#86efac" },
    ambient: {
      type: "glyphField",
      colors: ["#86efac", "#e2e8f0", "#fde68a"],
      intensity: 0.7,
      speed: 0.9,
    },
    accent: "#86efac",
    glow: "rgba(134, 239, 172, 0.3)",
  },
  stringArt: {
    name: "String Art",
    description: "The times-table circle, endlessly morphing",
    colors: { light: "#a855f7", dark: "#c4b5fd" },
    ambient: {
      type: "stringArt",
      colors: ["#f9a8d4", "#c4b5fd", "#93c5fd", "#fde68a"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#c4b5fd",
    glow: "rgba(196, 181, 253, 0.3)",
  },
  inkBloom: {
    name: "Ink Bloom",
    description: "Watercolor pigment blooming into wet paper",
    colors: { light: "#e0708f", dark: "#ff8fab" },
    ambient: {
      type: "inkBloom",
      colors: ["#ff8fab", "#8ecae6", "#ffd6a5", "#cdb4db"],
      intensity: 0.7,
      speed: 0.9,
    },
    accent: "#ff8fab",
    glow: "rgba(255, 143, 171, 0.3)",
  },
  brushStrokes: {
    name: "Oil & Gesture",
    description: "Bristle brush strokes sweeping across the canvas",
    colors: { light: "#c8402f", dark: "#e85d4a" },
    ambient: {
      type: "brushStrokes",
      colors: ["#d94f3d", "#f2c14e", "#2a6f97", "#f4f1ea"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#f2c14e",
    glow: "rgba(242, 193, 78, 0.3)",
  },
  ditherField: {
    name: "Dither Pixel",
    description: "Ordered-dither pixel art plasma",
    colors: { light: "#7b4dff", dark: "#a78bff" },
    ambient: {
      type: "ditherField",
      colors: ["#3a2e6b", "#7b4dff", "#ff6ec7", "#ffe3f1"],
      intensity: 0.9,
      speed: 0.8,
    },
    accent: "#ff6ec7",
    glow: "rgba(255, 110, 199, 0.3)",
  },
  stainedGlass: {
    name: "Stained Glass",
    description: "Drifting jewel-toned panes with dark leading",
    colors: { light: "#2a6f97", dark: "#4ba3d4" },
    ambient: {
      type: "stainedGlass",
      colors: ["#2a6f97", "#b5179e", "#f4a261", "#2a9d8f", "#e76f51"],
      intensity: 0.8,
      speed: 0.8,
    },
    accent: "#f4a261",
    glow: "rgba(244, 162, 97, 0.3)",
  },
  livePen: {
    name: "Live Pen",
    description: "A stylus sketching itself in real time",
    colors: { light: "#4a6cf7", dark: "#7dd3fc" },
    ambient: {
      type: "livePen",
      colors: ["#ffffff", "#7dd3fc", "#fda4af"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#7dd3fc",
    glow: "rgba(125, 211, 252, 0.3)",
  },
  grainMesh: {
    name: "Grain Mesh",
    description: "Soft mesh gradients with analog film grain",
    colors: { light: "#e0605a", dark: "#ff6b6b" },
    ambient: {
      type: "grainMesh",
      colors: ["#ff6b6b", "#4d6bff", "#ffc46b", "#7be0c3"],
      intensity: 0.7,
      speed: 0.8,
    },
    accent: "#ffc46b",
    glow: "rgba(255, 196, 107, 0.3)",
  },
  glitchScan: {
    name: "Glitch Scan",
    description: "RGB-split data bursts over CRT scanlines",
    colors: { light: "#00a9b8", dark: "#00f0ff" },
    ambient: {
      type: "glitchScan",
      colors: ["#00f0ff", "#ff2e93", "#b6ff3b"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#ff2e93",
    glow: "rgba(255, 46, 147, 0.35)",
  },
  kaleidoscope: {
    name: "Kaleidoscope",
    description: "Mirrored wedges of drifting colored glass",
    colors: { light: "#d99a1f", dark: "#f9c74f" },
    ambient: {
      type: "kaleidoscope",
      colors: ["#f9c74f", "#f94144", "#577590", "#90be6d", "#c77dff"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#c77dff",
    glow: "rgba(199, 125, 255, 0.3)",
  },
  paperLayers: {
    name: "Paper Layers",
    description: "Stacked paper-cut waves casting soft shadows",
    colors: { light: "#e07a5f", dark: "#e07a5f" },
    ambient: {
      type: "paperLayers",
      colors: ["#e07a5f", "#3d405b", "#81b29a", "#f2cc8f", "#f4f1de"],
      intensity: 0.7,
      speed: 0.8,
    },
    accent: "#e07a5f",
    glow: "rgba(224, 122, 95, 0.25)",
  },
  contourTopo: {
    name: "Contour Topo",
    description: "Living topographic isolines, like a plotter drawing",
    colors: { light: "#2f9e7a", dark: "#9ae6b4" },
    ambient: {
      type: "contourTopo",
      colors: ["#9ae6b4", "#7dd3fc", "#fde68a", "#e9d5ff"],
      intensity: 0.7,
      speed: 0.9,
    },
    accent: "#9ae6b4",
    glow: "rgba(154, 230, 180, 0.3)",
  },
  silkFilaments: {
    name: "Silk Filaments",
    description: "Braided hairlines of champagne, rose and pearl",
    colors: { light: "#c9a7a0", dark: "#f3e3c3" },
    ambient: {
      type: "silkFilaments",
      colors: ["#f3e3c3", "#e7b7c8", "#b9c6ff", "#ffffff"],
      intensity: 0.6,
      speed: 0.7,
    },
    accent: "#e7b7c8",
    glow: "rgba(231, 183, 200, 0.3)",
  },
  orbitalGlobe: {
    name: "Orbital Atlas",
    description: "Wireframe globe with dotted orbits and satellites",
    colors: { light: "#5a7bd8", dark: "#9fd8ff" },
    ambient: {
      type: "orbitalGlobe",
      colors: ["#9fd8ff", "#e6f4ff", "#6c8cff"],
      intensity: 0.6,
      speed: 1,
    },
    accent: "#9fd8ff",
    glow: "rgba(159, 216, 255, 0.3)",
  },
  hypercube: {
    name: "Hypercube",
    description: "A tesseract folding through four dimensions",
    colors: { light: "#2ba58f", dark: "#7df9e0" },
    ambient: {
      type: "hypercube",
      colors: ["#7df9e0", "#b79cff", "#ffffff", "#ff9ad5"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#7df9e0",
    glow: "rgba(125, 249, 224, 0.35)",
  },
  halftoneTide: {
    name: "Halftone Tide",
    description: "Editorial dot grid swelling with interference waves",
    colors: { light: "#d63a5c", dark: "#ff4d6d" },
    ambient: {
      type: "halftoneTide",
      colors: ["#a1a1aa", "#f4f4f5", "#ff4d6d"],
      intensity: 0.7,
      speed: 0.8,
    },
    accent: "#ff4d6d",
    glow: "rgba(255, 77, 109, 0.3)",
  },
  harmonograph: {
    name: "Harmonograph",
    description: "Precessing gold and indigo Lissajous rosettes",
    colors: { light: "#b8913f", dark: "#e8c27a" },
    ambient: {
      type: "harmonograph",
      colors: ["#e8c27a", "#f4ead5", "#7aa2e8"],
      intensity: 0.6,
      speed: 0.8,
    },
    accent: "#e8c27a",
    glow: "rgba(232, 194, 122, 0.3)",
  },
  flowField: {
    name: "Flow Field",
    description: "Generative ink trails drifting through a vector field",
    colors: { light: "#e0704a", dark: "#ff9a76" },
    ambient: {
      type: "flowField",
      colors: ["#ff9a76", "#ffd6a5", "#7fd1c7", "#e4e4e7"],
      intensity: 0.6,
      speed: 1,
    },
    accent: "#ff9a76",
    glow: "rgba(255, 154, 118, 0.3)",
  },
  plexusDrift: {
    name: "Plexus Drift",
    description: "A quiet neural lattice of drifting light nodes",
    colors: { light: "#5b7bff", dark: "#7aa2ff" },
    ambient: {
      type: "plexusDrift",
      colors: ["#7aa2ff", "#c7d2fe", "#e0e7ff"],
      intensity: 0.6,
      speed: 1,
    },
    accent: "#7aa2ff",
    glow: "rgba(122, 162, 255, 0.3)",
  },
  spectralCurtains: {
    name: "Spectral Curtains",
    description: "Layered aurora sheets with fine ray structure",
    colors: { light: "#2bb6a3", dark: "#5eead4" },
    ambient: {
      type: "spectralCurtains",
      colors: ["#5eead4", "#a78bfa", "#f0abfc", "#93c5fd"],
      intensity: 0.55,
      speed: 0.8,
    },
    accent: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.3)",
  },
  prismBeams: {
    name: "Prism Blades",
    description: "Slow glass blades splitting light into chromatic edges",
    colors: { light: "#0ea5c4", dark: "#22d3ee" },
    ambient: {
      type: "prismBeams",
      colors: ["#22d3ee", "#f472b6", "#fde68a"],
      intensity: 0.6,
      speed: 0.9,
    },
    accent: "#f472b6",
    glow: "rgba(244, 114, 182, 0.3)",
  },
};

interface ThemeState {
  theme: ThemeName;
  mode: ThemeMode;
  fontFamily: AppFont;
  platformLayout: PlatformLayout;
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
  setFontFamily: (font: AppFont) => void;
  setPlatformLayout: (layout: PlatformLayout) => void;
}

function applyFont(font: AppFont) {
  document.documentElement.style.setProperty("--font-app", font);
  document.documentElement.style.fontFamily = `"${font}", system-ui, sans-serif`;
}

function applyTheme(theme: ThemeName, mode: ThemeMode) {
  const root = document.documentElement;
  const themeClasses = Object.keys(themes).map((t) => `theme-${t}`);
  root.classList.remove(...themeClasses, "dark", "light");
  root.classList.add(`theme-${theme}`);
  if (mode === "dark") root.classList.add("dark");
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: DEFAULT_THEME,
      mode: "dark",
      fontFamily: "geist-sans",
      platformLayout: "default",
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
      setFontFamily: (fontFamily) => {
        set({ fontFamily });
        applyFont(fontFamily);
      },
      setPlatformLayout: (platformLayout) => set({ platformLayout }),
    }),
    {
      name: "app-theme",
      version: 3,
      // old saved theme names (iceQueen etc.) no longer exist
      migrate: (persisted: any) => ({
        ...persisted,
        theme: persisted?.theme in themes ? persisted.theme : DEFAULT_THEME,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          const theme = state.theme in themes ? state.theme : DEFAULT_THEME;
          applyTheme(theme, state.mode);
          if (state.fontFamily) applyFont(state.fontFamily);
        }
      },
    },
  ),
);
