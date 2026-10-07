import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeName =
  | "eventHorizon"
  | "silkFilaments"
  | "turingBloom"
  | "radialSpectrum"
  | "liquidMetaballs"
  | "torusKnot"
  | "shapeMorph"
  | "orbitalGlobe"
  | "hypercube"
  | "halftoneTide"
  | "harmonograph"
  | "flowField"
  | "chatCascade"
  | "viewerPulse"
  | "heartsFloat"
  | "hypeTrain"
  | "pixelInvaders"
  | "radarSweep"
  | "checkerRun"
  | "lootPillars"
  | "trackLanes"
  | "bounceArcs"
  | "floodlights"
  | "runway"
  | "satinDrape"
  | "stitchPattern"
  | "archLight"
  | "isoBlocks"
  | "blueprintDraft"
  | "lidarScan"
  | "goldenSpiral"
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
  chatCascade: {
    name: "Chat Cascade",
    description: "Anonymous chat bubbles drifting up the screen",
    colors: { light: "#772ce8", dark: "#a970ff" },
    ambient: {
      type: "chatCascade",
      colors: ["#a970ff", "#c4a1ff", "#772ce8", "#e5d4ff"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#a970ff",
    glow: "rgba(169, 112, 255, 0.3)",
  },
  viewerPulse: {
    name: "Viewer Pulse",
    description: "A live viewer chart with raid spikes",
    colors: { light: "#2fbf0b", dark: "#53fc18" },
    ambient: {
      type: "viewerPulse",
      colors: ["#53fc18", "#2fbf0b", "#d9ffc7"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#53fc18",
    glow: "rgba(83, 252, 24, 0.3)",
  },
  heartsFloat: {
    name: "Hearts Live",
    description: "Reactions floating up from the corner",
    colors: { light: "#dd2a7b", dark: "#f06aa5" },
    ambient: {
      type: "heartsFloat",
      colors: ["#f58529", "#dd2a7b", "#8134af", "#feda77"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#dd2a7b",
    glow: "rgba(221, 42, 123, 0.3)",
  },
  hypeTrain: {
    name: "Hype Train",
    description: "Light capsules racing down slanted rails",
    colors: { light: "#e60026", dark: "#ff4d6d" },
    ambient: {
      type: "hypeTrain",
      colors: ["#ff0033", "#ff6b6b", "#ffffff", "#ffd166"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#ff0033",
    glow: "rgba(255, 0, 51, 0.3)",
  },
  pixelInvaders: {
    name: "Pixel Invaders",
    description: "A marching 8-bit formation under fire",
    colors: { light: "#16a34a", dark: "#39ff14" },
    ambient: {
      type: "pixelInvaders",
      colors: ["#39ff14", "#00e5ff", "#ff2bd6", "#ffe600"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#39ff14",
    glow: "rgba(57, 255, 20, 0.3)",
  },
  radarSweep: {
    name: "Radar Sweep",
    description: "Tactical HUD radar with decaying blips",
    colors: { light: "#0f9d6a", dark: "#3dffa2" },
    ambient: {
      type: "radarSweep",
      colors: ["#3dffa2", "#9dffd1", "#1aa86b"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#3dffa2",
    glow: "rgba(61, 255, 162, 0.3)",
  },
  checkerRun: {
    name: "Checkered Flag",
    description: "A racing floor rushing toward you",
    colors: { light: "#e11d48", dark: "#ff3b30" },
    ambient: {
      type: "checkerRun",
      colors: ["#f4f4f5", "#a1a1aa", "#ff3b30"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#ff3b30",
    glow: "rgba(255, 59, 48, 0.3)",
  },
  lootPillars: {
    name: "Loot Drop",
    description: "Rarity-colored light pillars with rising shards",
    colors: { light: "#7c3aed", dark: "#a855f7" },
    ambient: {
      type: "lootPillars",
      colors: ["#9ca3af", "#22c55e", "#3b82f6", "#a855f7", "#f59e0b"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#f59e0b",
    glow: "rgba(245, 158, 11, 0.3)",
  },
  trackLanes: {
    name: "Track & Field",
    description: "Runners lapping an athletics oval",
    colors: { light: "#e4572e", dark: "#f3a712" },
    ambient: {
      type: "trackLanes",
      colors: ["#e4572e", "#f3a712", "#a8c686", "#669bbc"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#f3a712",
    glow: "rgba(243, 167, 18, 0.3)",
  },
  bounceArcs: {
    name: "Slam Arc",
    description: "Long-exposure ball bounces with strobing trails",
    colors: { light: "#ea580c", dark: "#ff7a1a" },
    ambient: {
      type: "bounceArcs",
      colors: ["#ff7a1a", "#ffd23f", "#ffffff", "#3bceac"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#ff7a1a",
    glow: "rgba(255, 122, 26, 0.3)",
  },
  floodlights: {
    name: "Floodlights",
    description: "Stadium night lights sweeping the pitch",
    colors: { light: "#b08900", dark: "#fff4d6" },
    ambient: {
      type: "floodlights",
      colors: ["#fff4d6", "#cfe8ff", "#ffe7a3", "#e8f1ff"],
      intensity: 0.7,
      speed: 0.9,
    },
    accent: "#ffe7a3",
    glow: "rgba(255, 231, 163, 0.3)",
  },
  runway: {
    name: "Runway",
    description: "A catwalk in perspective with a roaming spotlight",
    colors: { light: "#a8843a", dark: "#c9a962" },
    ambient: {
      type: "runway",
      colors: ["#f5e6c8", "#c9a962", "#ffffff"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#c9a962",
    glow: "rgba(201, 169, 98, 0.3)",
  },
  satinDrape: {
    name: "Satin Drape",
    description: "Slow silk folds with a specular sheen",
    colors: { light: "#6b1d3a", dark: "#f0b7c8" },
    ambient: {
      type: "satinDrape",
      colors: ["#6b1d3a", "#f0b7c8", "#ffffff"],
      intensity: 0.8,
      speed: 0.8,
    },
    accent: "#f0b7c8",
    glow: "rgba(240, 183, 200, 0.25)",
  },
  stitchPattern: {
    name: "Pattern Paper",
    description: "Dashed stitch lines and seam allowances",
    colors: { light: "#e07a5f", dark: "#f4efe6" },
    ambient: {
      type: "stitchPattern",
      colors: ["#f4efe6", "#e07a5f", "#81b29a", "#3d405b"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#e07a5f",
    glow: "rgba(224, 122, 95, 0.25)",
  },
  archLight: {
    name: "Arcade Light",
    description: "Sun patches sliding across an arched colonnade",
    colors: { light: "#c9822f", dark: "#f2b36b" },
    ambient: {
      type: "archLight",
      colors: ["#e9e1d3", "#f2b36b", "#9ec5e8"],
      intensity: 0.7,
      speed: 1,
    },
    accent: "#f2b36b",
    glow: "rgba(242, 179, 107, 0.3)",
  },
  isoBlocks: {
    name: "Iso City",
    description: "Breathing isometric blocks",
    colors: { light: "#6366f1", dark: "#7dd3fc" },
    ambient: {
      type: "isoBlocks",
      colors: ["#7dd3fc", "#a78bfa", "#f472b6", "#fbbf24"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#a78bfa",
    glow: "rgba(167, 139, 250, 0.3)",
  },
  blueprintDraft: {
    name: "Blueprint",
    description: "A floor plan drafting itself wall by wall",
    colors: { light: "#2563eb", dark: "#7fb2ff" },
    ambient: {
      type: "blueprintDraft",
      colors: ["#e6f1ff", "#7fb2ff", "#9ad0ff"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#7fb2ff",
    glow: "rgba(127, 178, 255, 0.3)",
  },
  lidarScan: {
    name: "LiDAR",
    description: "A scan front revealing a point-cloud cityscape",
    colors: { light: "#0d9488", dark: "#5eead4" },
    ambient: {
      type: "lidarScan",
      colors: ["#5eead4", "#38bdf8", "#a78bfa", "#f0abfc"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#5eead4",
    glow: "rgba(94, 234, 212, 0.3)",
  },
  goldenSpiral: {
    name: "Golden Ratio",
    description: "The φ rectangle and its spiral, drawn square by square",
    colors: { light: "#a8843a", dark: "#e8c27a" },
    ambient: {
      type: "goldenSpiral",
      colors: ["#e8c27a", "#f4ead5", "#c9a962", "#7aa2e8"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#e8c27a",
    glow: "rgba(232, 194, 122, 0.3)",
  },
  turingBloom: {
    name: "Turing Bloom",
    description: "Reaction-diffusion coral growing like living ink",
    colors: { light: "#d9467a", dark: "#ff7eb6" },
    ambient: {
      type: "turingBloom",
      colors: ["#ff7eb6", "#ffd6a5", "#c4b5fd"],
      intensity: 0.9,
      speed: 1,
    },
    accent: "#ff7eb6",
    glow: "rgba(255, 126, 182, 0.3)",
  },
  radialSpectrum: {
    name: "Spectrum Halo",
    description: "A beat-driven radial equalizer with burst particles",
    colors: { light: "#7c3aed", dark: "#00f0ff" },
    ambient: {
      type: "radialSpectrum",
      colors: ["#00f0ff", "#7c3aed", "#ff2e93", "#ffd166"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#ff2e93",
    glow: "rgba(255, 46, 147, 0.3)",
  },
  liquidMetaballs: {
    name: "Liquid Light",
    description: "Glossy metaballs with soft halos and bright rims",
    colors: { light: "#e0306a", dark: "#ff3d81" },
    ambient: {
      type: "liquidMetaballs",
      colors: ["#6c5ce7", "#ff3d81", "#ff9e4a", "#ffd93d"],
      intensity: 0.9,
      speed: 1,
    },
    accent: "#ff9e4a",
    glow: "rgba(255, 158, 74, 0.3)",
  },
  torusKnot: {
    name: "Torus Knot",
    description: "A tumbling 3D wireframe tube with depth-shaded strokes",
    colors: { light: "#6366f1", dark: "#7dd3fc" },
    ambient: {
      type: "torusKnot",
      colors: ["#7dd3fc", "#c4b5fd", "#f9a8d4"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#c4b5fd",
    glow: "rgba(196, 181, 253, 0.3)",
  },
  shapeMorph: {
    name: "Shape Morph",
    description: "A swarm that flows between heart, star, loop and bloom",
    colors: { light: "#db2777", dark: "#f472b6" },
    ambient: {
      type: "shapeMorph",
      colors: ["#f472b6", "#fbbf24", "#34d399", "#60a5fa"],
      intensity: 0.8,
      speed: 1,
    },
    accent: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.3)",
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
