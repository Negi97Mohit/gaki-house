// GLSL-driven filter parameter map.
//
// Each filter is a set of uniforms consumed by the single fragment shader in
// WebGLVideoCanvas.tsx. Color grading parameters are equivalent to the old CSS
// `filter:` chain (hue-rotate / saturate / contrast / brightness / sepia /
// invert / grayscale / blur). A small `mode` enum unlocks the heavy animated
// effects that used to live in the React DOM overlay (thermal LUT, neon-edge
// Sobel, hologram scanlines, matrix rain).
//
// This replaces the previous CSS-DOM overlay approach, which caused severe lag
// on iOS Safari due to backdrop-filter + mix-blend-mode on a live <video>.

export const FX_MODE = {
  COLOR: 0,        // Standard color grade only
  THERMAL: 1,      // Heatmap LUT applied to luminance
  NEON_EDGE: 2,    // Sobel edge detection + neon glow
  HOLOGRAM: 3,     // Animated scanlines + RGB chroma split + cyan tint
  MATRIX: 4,       // Green tint + falling glyph rain (procedural noise)
  ASCII: 5,        // Quantised luminance, faux-ASCII grid
  PIXEL: 6,        // Pixelation
  MIRROR: 7,       // Horizontal mirror
} as const;
export type FxMode = typeof FX_MODE[keyof typeof FX_MODE];

export interface FilterParams {
  mode: FxMode;
  hueRotate: number;     // radians
  saturate: number;      // 1.0 = identity
  contrast: number;      // 1.0 = identity
  brightness: number;    // 1.0 = identity
  sepia: number;         // 0..1
  invert: number;        // 0..1
  grayscale: number;     // 0..1
  blur: number;          // pixel radius (kept small — 0..2)
  tint: [number, number, number]; // RGB 0..1
  tintAmount: number;    // 0..1, multiply-blend amount
  vignette: number;      // 0..1
}

const deg = (d: number) => (d * Math.PI) / 180;

const base: FilterParams = {
  mode: FX_MODE.COLOR,
  hueRotate: 0,
  saturate: 1,
  contrast: 1,
  brightness: 1,
  sepia: 0,
  invert: 0,
  grayscale: 0,
  blur: 0,
  tint: [1, 1, 1],
  tintAmount: 0,
  vignette: 0,
};

const p = (overrides: Partial<FilterParams>): FilterParams => ({ ...base, ...overrides });

export const INTERACTIVE_FILTER_PARAMS: Record<string, FilterParams> = {
  none: p({}),

  // ---- Special animated modes ---------------------------------------------
  "neon-edge": p({ mode: FX_MODE.NEON_EDGE, saturate: 1.6, contrast: 1.4 }),
  "hologram-fx": p({ mode: FX_MODE.HOLOGRAM, hueRotate: deg(180), saturate: 1.4, brightness: 1.1, tint: [0.4, 0.9, 1.0], tintAmount: 0.25 }),
  hologram: p({ mode: FX_MODE.HOLOGRAM, hueRotate: deg(190), saturate: 1.5, brightness: 1.05, tint: [0.4, 0.95, 1.0], tintAmount: 0.2 }),
  matrix: p({ mode: FX_MODE.MATRIX, hueRotate: deg(90), saturate: 1.4, brightness: 0.85, tint: [0.1, 1.0, 0.2], tintAmount: 0.35 }),
  thermal: p({ mode: FX_MODE.THERMAL, contrast: 1.2 }),
  thermalImaging: p({ mode: FX_MODE.THERMAL, contrast: 1.4, brightness: 1.05 }),
  ascii: p({ mode: FX_MODE.ASCII, contrast: 1.6, brightness: 1.0 }),
  pixel: p({ mode: FX_MODE.PIXEL, contrast: 1.2, saturate: 1.3 }),
  mirror: p({ mode: FX_MODE.MIRROR, saturate: 1.1 }),

  // Infrared / X-ray act like color grades with strong tints.
  "infrared-fx": p({ hueRotate: deg(300), saturate: 2, contrast: 1.3, brightness: 1.05, tint: [1, 0.4, 0.6], tintAmount: 0.25 }),
  infrared: p({ hueRotate: deg(300), saturate: 2, contrast: 1.25, tint: [1, 0.4, 0.5], tintAmount: 0.2 }),
  xray: p({ invert: 1, grayscale: 1, contrast: 1.4, tint: [0.55, 0.78, 1], tintAmount: 0.18, vignette: 0.3 }),
  xrayVision: p({ invert: 1, grayscale: 1, contrast: 1.5, tint: [0.55, 0.78, 1], tintAmount: 0.2, vignette: 0.35 }),

  // ---- Color grading presets ----------------------------------------------
  comic: p({ saturate: 2, contrast: 1.4, brightness: 1.05 }),
  comicBold: p({ saturate: 1.8, contrast: 1.5 }),
  manga: p({ grayscale: 1, contrast: 1.7, brightness: 1.05 }),
  samuraiInk: p({ grayscale: 1, contrast: 1.6, brightness: 1.05 }),
  noirDetective: p({ grayscale: 1, contrast: 1.4, brightness: 0.95 }),
  noirBlue: p({ grayscale: 0.7, hueRotate: deg(210), contrast: 1.2, brightness: 0.95 }),
  sketch: p({ grayscale: 1, contrast: 1.5, brightness: 1.1 }),
  bleach: p({ grayscale: 0.6, contrast: 1.3, brightness: 1.05 }),
  dystopianGrey: p({ grayscale: 0.85, contrast: 1.2, brightness: 0.95 }),

  kaleidoscope: p({ saturate: 1.6, contrast: 1.15, hueRotate: deg(45) }),
  "oil-paint": p({ saturate: 1.3, contrast: 1.15, blur: 0.4 }),
  oilPaint: p({ saturate: 1.4, contrast: 1.2, blur: 0.4 }),
  watercolor: p({ saturate: 0.85, brightness: 1.1, contrast: 0.9, blur: 0.3 }),
  prism: p({ saturate: 1.6, hueRotate: deg(90), contrast: 1.1 }),
  vhs: p({ saturate: 1.4, contrast: 1.1, hueRotate: deg(-10), brightness: 1.05, vignette: 0.4 }),

  cyberpunk: p({ hueRotate: deg(200), saturate: 1.8, contrast: 1.2, tint: [1.0, 0.2, 0.9], tintAmount: 0.15 }),
  cyberneticAugment: p({ hueRotate: deg(205), saturate: 1.6, contrast: 1.2, brightness: 1.05 }),
  dominator: p({ hueRotate: deg(180), saturate: 2, contrast: 1.3, brightness: 1.1 }),
  inspector: p({ hueRotate: deg(290), saturate: 1.7, contrast: 1.2 }),
  phantom: p({ sepia: 0.4, hueRotate: deg(330), saturate: 1.5, contrast: 1.2 }),

  sepia: p({ sepia: 0.85, saturate: 1.1, contrast: 1.05 }),
  ocean: p({ hueRotate: deg(180), saturate: 1.4, brightness: 1.05 }),
  sunset: p({ saturate: 1.5, hueRotate: deg(-15), brightness: 1.05 }),
  gothic: p({ grayscale: 0.4, contrast: 1.4, brightness: 0.85, sepia: 0.2 }),
  mint: p({ hueRotate: deg(110), saturate: 1.4, brightness: 1.08 }),
  golden: p({ sepia: 0.5, saturate: 1.6, brightness: 1.1, hueRotate: deg(-10) }),
  goldenHour: p({ sepia: 0.5, saturate: 1.6, brightness: 1.1, hueRotate: deg(-10) }),
  lavender: p({ hueRotate: deg(260), saturate: 1.4, brightness: 1.05 }),

  ghibliSoft: p({ saturate: 1.15, brightness: 1.08, contrast: 0.95 }),
  ghibliWarm: p({ sepia: 0.25, saturate: 1.3, brightness: 1.05 }),
  arcane: p({ hueRotate: deg(260), saturate: 1.4, contrast: 1.15 }),
  ukiyoe: p({ hueRotate: deg(190), saturate: 1.3, contrast: 1.1 }),
  pixarSoft: p({ saturate: 1.2, brightness: 1.08, contrast: 1.05 }),
  neonHorror: p({ hueRotate: deg(320), saturate: 2, contrast: 1.3, brightness: 0.9, vignette: 0.35 }),

  frostBlue: p({ hueRotate: deg(190), saturate: 1.3, brightness: 1.1 }),
  emerald: p({ hueRotate: deg(130), saturate: 1.5, contrast: 1.1 }),
  demonSlayer: p({ hueRotate: deg(120), saturate: 1.4, contrast: 1.2 }),
  mechaBlue: p({ hueRotate: deg(210), saturate: 1.4, contrast: 1.2, brightness: 0.95 }),
  toxicGreen: p({ hueRotate: deg(95), saturate: 2, contrast: 1.2, brightness: 1.05 }),
  roseGold: p({ sepia: 0.3, hueRotate: deg(-20), saturate: 1.3, brightness: 1.05 }),
  dreamscape: p({ hueRotate: deg(270), saturate: 1.4, brightness: 1.1, contrast: 0.95 }),
  bloodMoon: p({ sepia: 0.5, hueRotate: deg(-30), saturate: 2, contrast: 1.3, brightness: 0.9, vignette: 0.4 }),
  pastelCute: p({ saturate: 1.2, brightness: 1.12, hueRotate: deg(310) }),
  glitchPurple: p({ hueRotate: deg(280), saturate: 1.8, contrast: 1.25, tint: [0.7, 0.1, 1], tintAmount: 0.12 }),
  fireDragon: p({ hueRotate: deg(-20), saturate: 2, contrast: 1.3, brightness: 1.05 }),

  victorianDaguerreotype: p({ sepia: 0.9, contrast: 1.2, brightness: 0.95 }),
  romanFreco: p({ sepia: 0.4, saturate: 1.2, contrast: 1.05, brightness: 1.05 }),
  spartanBronze: p({ sepia: 0.6, saturate: 1.5, hueRotate: deg(-15), brightness: 1.05 }),
  egyptianPapyrus: p({ sepia: 0.7, saturate: 1.2, brightness: 1.1 }),
  medievalIllumination: p({ sepia: 0.4, saturate: 1.4, contrast: 1.15, brightness: 0.95 }),
  xenomorphic: p({ hueRotate: deg(110), saturate: 1.6, contrast: 1.2, brightness: 0.95 }),
  cosmicVoid: p({ hueRotate: deg(260), saturate: 1.5, contrast: 1.25, brightness: 0.9, vignette: 0.3 }),
  abyssalDepth: p({ hueRotate: deg(195), saturate: 1.3, contrast: 1.2, brightness: 0.85, vignette: 0.35 }),
  radioactiveDecay: p({ hueRotate: deg(75), saturate: 2, contrast: 1.25, brightness: 1.05 }),
  renaissanceOil: p({ sepia: 0.45, saturate: 1.3, contrast: 1.15, brightness: 1.02 }),
  byzantineMosaic: p({ sepia: 0.4, saturate: 1.6, contrast: 1.2, brightness: 1.05 }),
  artDeco: p({ sepia: 0.3, saturate: 1.4, contrast: 1.2 }),
  cavePainting: p({ sepia: 0.7, saturate: 1.3, contrast: 1.1, brightness: 0.95 }),
  steampunkBrass: p({ sepia: 0.6, saturate: 1.4, hueRotate: deg(-15), contrast: 1.1 }),
  sovietPropaganda: p({ sepia: 0.5, hueRotate: deg(-25), saturate: 2, contrast: 1.25 }),
  aztecSun: p({ sepia: 0.4, hueRotate: deg(-15), saturate: 1.7, brightness: 1.08 }),
  norseIce: p({ hueRotate: deg(195), saturate: 1.2, contrast: 1.15, brightness: 1.05 }),
  bioluminescent: p({ hueRotate: deg(140), saturate: 2, contrast: 1.25, brightness: 1.05 }),
  volcanicMagma: p({ hueRotate: deg(-15), saturate: 2, contrast: 1.3, brightness: 1.05 }),
  holographicGlitch: p({ mode: FX_MODE.HOLOGRAM, hueRotate: deg(180), saturate: 1.8, contrast: 1.2, brightness: 1.1, tint: [0.5, 0.8, 1], tintAmount: 0.2 }),
  jadeDynasty: p({ hueRotate: deg(120), saturate: 1.5, contrast: 1.15 }),
  spectralHaunting: p({ hueRotate: deg(240), saturate: 0.9, contrast: 1.2, brightness: 0.95, vignette: 0.3 }),
  edoPeriod: p({ sepia: 0.55, saturate: 1.2, contrast: 1.05, brightness: 1.05 }),
  desertMirage: p({ sepia: 0.4, saturate: 1.3, brightness: 1.1, hueRotate: deg(-10) }),
  crystalline: p({ hueRotate: deg(210), saturate: 1.5, contrast: 1.2, brightness: 1.1 }),
};

/** Look up params with a safe fallback to identity. */
export function getFilterParams(id: string | null | undefined): FilterParams {
  if (!id) return INTERACTIVE_FILTER_PARAMS.none;
  return INTERACTIVE_FILTER_PARAMS[id] ?? INTERACTIVE_FILTER_PARAMS.none;
}

export interface InteractiveFilter {
  id: string;
  name: string;
  thumbnailUrl: string;
}
