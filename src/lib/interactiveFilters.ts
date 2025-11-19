// src/lib/interactiveFilters.ts

export interface InteractiveFilterPreset {
  id:
    | "none"
    | "neon-edge"
    | "hologram"
    | "pixel"
    | "comic"
    | "ascii"
    | "thermal"
    | "mirror"
    | "kaleidoscope"
    | "oil-paint"
    | "sketch"
    | "prism"
    | "vhs"
    | "infrared"
    | "xray"
    | "cyberpunk"
    | "dominator"
    | "inspector"
    | "manga"
    | "phantom"
    | "matrix"
    | "sepia"
    | "ocean"
    | "sunset"
    | "gothic"
    | "mint"
    | "golden"
    | "lavender";
  name: string;
  thumbnailUrl: string; // URL to a preview image
}

// Using placehold.co for simple, descriptive previews
export const INTERACTIVE_FILTER_PRESETS: InteractiveFilterPreset[] = [
  {
    id: "none",
    name: "None",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffffff/png?text=None&font=inter",
  },
  {
    id: "neon-edge",
    name: "Neon Edge",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/00ffff/png?text=Neon&font=inter",
  },
  {
    id: "hologram",
    name: "Hologram",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ff00ff/png?text=Hologram&font=inter",
  },
  {
    id: "pixel",
    name: "Pixelated",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffffff/png?text=Pixel&font=inter",
  },
  {
    id: "comic",
    name: "Comic Book",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffff00/png?text=Comic&font=inter",
  },
  {
    id: "ascii",
    name: "ASCII",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/00ff00/png?text=ASCII&font=inter",
  },
  {
    id: "thermal",
    name: "Thermal",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ff8800/png?text=Thermal&font=inter",
  },
  {
    id: "mirror",
    name: "Mirror",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffffff/png?text=Mirror&font=inter",
  },
  {
    id: "kaleidoscope",
    name: "Kaleidoscope",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffffff/png?text=Scope&font=inter",
  },
  {
    id: "oil-paint",
    name: "Oil Paint",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffffff/png?text=Paint&font=inter",
  },
  {
    id: "sketch",
    name: "Sketch",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffffff/png?text=Sketch&font=inter",
  },
  {
    id: "prism",
    name: "Prism",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffffff/png?text=Prism&font=inter",
  },
  {
    id: "vhs",
    name: "VHS",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffffff/png?text=VHS&font=inter",
  },
  {
    id: "infrared",
    name: "Infrared",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ff0000/png?text=Infrared&font=inter",
  },
  {
    id: "xray",
    name: "X-Ray",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ffffff/png?text=X-Ray&font=inter",
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    thumbnailUrl:
      "https://placehold.co/100x60/1a1a1a/ff00ff/png?text=Cyber&font=inter",
  },
  {
    id: "dominator",
    name: "Dominator",
    thumbnailUrl:
      "https://placehold.co/100x60/00ffff/000000/png?text=Dominator&font=inter",
  },
  {
    id: "inspector",
    name: "Inspector",
    thumbnailUrl:
      "https://placehold.co/100x60/ff00ff/000000/png?text=Inspector&font=inter",
  },
  {
    id: "manga",
    name: "Manga",
    thumbnailUrl: "https://placehold.co/100x60/000000/ffffff/png?text=Manga",
  },
  {
    id: "phantom",
    name: "Phantom",
    thumbnailUrl: "https://placehold.co/100x60/1a0000/ff0000/png?text=Phantom",
  },
  {
    id: "matrix",
    name: "Matrix",
    thumbnailUrl: "https://placehold.co/100x60/001a00/00ff00/png?text=Matrix",
  },
  {
    id: "sepia",
    name: "Sepia",
    thumbnailUrl: "https://placehold.co/100x60/2e2115/a68a6d/png?text=Sepia",
  },
  {
    id: "ocean",
    name: "Ocean",
    thumbnailUrl: "https://placehold.co/100x60/000033/0066cc/png?text=Ocean",
  },
  {
    id: "sunset",
    name: "Sunset",
    thumbnailUrl: "https://placehold.co/100x60/2d1b4e/ffbe0b/png?text=Sunset",
  },
  {
    id: "gothic",
    name: "Gothic",
    thumbnailUrl: "https://placehold.co/100x60/0f0f0f/8a0303/png?text=Gothic",
  },
  {
    id: "mint",
    name: "Mint",
    thumbnailUrl: "https://placehold.co/100x60/1c3d35/4fffa3/png?text=Mint",
  },
  {
    id: "golden",
    name: "Golden",
    thumbnailUrl: "https://placehold.co/100x60/2a2200/ffd700/png?text=Golden",
  },
  {
    id: "lavender",
    name: "Lavender",
    thumbnailUrl: "https://placehold.co/100x60/1a0b2e/9d4edd/png?text=Lavender",
  },
];
