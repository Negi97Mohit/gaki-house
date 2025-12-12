// src/lib/layouts/DoubleVerticalSlider.ts
import { CanvasLayoutTemplate } from "@/types/layout";

export const VERTICAL_SLIDER_TEMPLATE: CanvasLayoutTemplate = {
  id: "vertical-slider",
  name: "Double Vertical Slider",
  description: "Split screen slider with reverse scrolling",
  sections: [
    // --- PAIR 1 ---
    {
      id: "v-slide-1-left",
      name: "Slide 1 Left",
      style: { backgroundColor: "#FD3555", color: "#ffffff" },
    },
    {
      id: "v-slide-1-right",
      name: "Slide 1 Right",
      style: { backgroundColor: "#FFE4E8", color: "#000000" },
    },
    // --- PAIR 2 ---
    {
      id: "v-slide-2-left",
      name: "Slide 2 Left",
      style: { backgroundColor: "#2A86BA", color: "#ffffff" },
    },
    {
      id: "v-slide-2-right",
      name: "Slide 2 Right",
      style: { backgroundColor: "#D4EFFC", color: "#000000" },
    },
    // --- PAIR 3 ---
    {
      id: "v-slide-3-left",
      name: "Slide 3 Left",
      style: { backgroundColor: "#252E33", color: "#ffffff" },
    },
    {
      id: "v-slide-3-right",
      name: "Slide 3 Right",
      style: { backgroundColor: "#E6E6E6", color: "#000000" },
    },
    // --- PAIR 4 ---
    {
      id: "v-slide-4-left",
      name: "Slide 4 Left",
      style: { backgroundColor: "#FFB866", color: "#ffffff" },
    },
    {
      id: "v-slide-4-right",
      name: "Slide 4 Right",
      style: { backgroundColor: "#FFF0D6", color: "#000000" },
    },
  ],
};
