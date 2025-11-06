export interface BackgroundOption {
  id: string;
  name: string;
  type: "image" | "blur";
  thumbnailUrl: string;
  imageUrl?: string;
}

export const BACKGROUND_PRESETS: BackgroundOption[] = [
  {
    id: "none",
    name: "No Background",
    type: "image",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Crect width='200' height='120' fill='%23000'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='14'%3ENone%3C/text%3E%3C/svg%3E",
  },
  {
    id: "blur",
    name: "Blur Background",
    type: "blur",
    thumbnailUrl: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='120'%3E%3Cdefs%3E%3Cfilter id='blur'%3E%3CfeGaussianBlur stdDeviation='10'/%3E%3C/filter%3E%3C/defs%3E%3Crect width='200' height='120' fill='%236366f1' filter='url(%23blur)'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%23fff' font-family='sans-serif' font-size='14'%3EBlur%3C/text%3E%3C/svg%3E",
  },
  {
    id: "office-modern",
    name: "Modern Office",
    type: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=200&h=120&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=1920&h=1080&fit=crop",
  },
  {
    id: "studio-pro",
    name: "Studio Pro",
    type: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=200&h=120&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&h=1080&fit=crop",
  },
  {
    id: "cafe-cozy",
    name: "Cozy Cafe",
    type: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=200&h=120&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1920&h=1080&fit=crop",
  },
  {
    id: "nature-forest",
    name: "Forest Path",
    type: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=200&h=120&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1920&h=1080&fit=crop",
  },
  {
    id: "gradient-abstract",
    name: "Abstract",
    type: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=120&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1920&h=1080&fit=crop",
  },
  {
    id: "city-skyline",
    name: "City Skyline",
    type: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=200&h=120&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=1920&h=1080&fit=crop",
  },
  {
    id: "beach-sunset",
    name: "Beach Sunset",
    type: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&h=120&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&h=1080&fit=crop",
  },
  {
    id: "mountain-peak",
    name: "Mountain Peak",
    type: "image",
    thumbnailUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop",
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&h=1080&fit=crop",
  },
];

export const ASPECT_RATIOS = [
  { id: "16:9", name: "16:9 (Widescreen)", value: 16/9 },
  { id: "9:16", name: "9:16 (Vertical)", value: 9/16 },
  { id: "4:3", name: "4:3 (Standard)", value: 4/3 },
  { id: "1:1", name: "1:1 (Square)", value: 1 },
  { id: "21:9", name: "21:9 (Ultrawide)", value: 21/9 },
  { id: "custom", name: "Custom", value: 0 },
];
