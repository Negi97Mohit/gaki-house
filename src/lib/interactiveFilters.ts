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
    | "cyberpunk";
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
];
