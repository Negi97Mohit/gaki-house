// Filter type mapping — mirrors the engine's GLRenderer.ts FILTER_TYPE_MAP
// and effects.ts shader exactly.
//
// Each filter ID maps to a u_filter_type integer consumed by the GLSL shader.
// Filter IDs NOT in this map fall through to type 0 (passthrough) UNLESS
// they are found in AnimeStyles, in which case they get type 6 (tri-tone).

export const FILTER_TYPE_MAP: Record<string, number> = {
  // 1 = Pixelate
  pixel: 1,
  retro: 1,

  // 2 = Hologram (RGB shift + scanlines)
  hologram: 2,
  "hologram-fx": 2,
  holographicGlitch: 2,
  cyberneticAugment: 2,

  // 3 = Neon Edge (Sobel + glow)
  "neon-edge": 3,
  neon: 3,
  cyberpunk: 3,
  neonHorror: 3,
  bioluminescent: 3,

  // 4 = Thermal (heat map LUT)
  thermal: 4,
  thermalImaging: 4,
  predator: 4,
  volcanicMagma: 4,
  radioactiveDecay: 4,

  // 5 = Mirror (horizontal)
  mirror: 5,
  spectralHaunting: 5,

  // 6 = Anime Tri-Tone (handled dynamically via AnimeStyles lookup)
  // Not listed here — see resolveFilterType()

  // 7 = Sketch (pencil on paper)
  sketch: 7,
  noir: 7,
  noirDetective: 7,

  // 8 = Comic (halftone dots)
  comic: 8,
  comicBold: 8,
  manga: 8,

  // 9 = Oil Paint (blur + posterize)
  "oil-paint": 9,
  oilPaint: 9,
  watercolor: 9,

  // 10 = ASCII (dot grid)
  ascii: 10,
  matrix: 10,

  // 11 = VHS (tracking + noise + RGB split)
  vhs: 11,
  glitchPurple: 11,

  // 12 = Prism (strong RGB split)
  prism: 12,

  // 13 = Kaleidoscope (radial mirror)
  kaleidoscope: 13,
  crystalline: 13,

  // 14 = X-Ray (invert + blue bone tint)
  xray: 14,
  xrayVision: 14,
  infrared: 14,
  "infrared-fx": 14,
};

/** Default color overrides per filter (matches GLRenderer.ts logic) */
export function getFilterColor(filterId: string): [number, number, number] {
  if (filterId === "matrix") return [0.0, 1.0, 0.0];
  if (filterId.includes("infrared")) return [1.0, 0.0, 0.0];
  if (filterId === "sketch") return [0.1, 0.1, 0.1];
  return [1.0, 1.0, 1.0];
}
