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

