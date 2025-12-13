// src/lib/layouts/GradientSlider.ts
import { CanvasLayoutTemplate } from "@/types/layout";

export const SLIDER_TEMPLATE: CanvasLayoutTemplate = {
  id: "slider-layout",
  name: "Gradient Slider",
  description: "Clean slider with gradient backgrounds",
  category: "dynamic",
  sections: [
    {
      id: "slide-1",
      name: "Deep Purple",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "slide-2",
      name: "Sunset Orange",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background:
          "linear-gradient(135deg, #ff9a9e 0%, #fecfef 99%, #fecfef 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "slide-3",
      name: "Ocean Blue",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(120deg, #89f7fe 0%, #66a6ff 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "slide-4",
      name: "Lush Green",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(120deg, #84fab0 0%, #8fd3f4 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "slide-5",
      name: "Midnight",
      style: {
        top: "0%",
        left: "0%",
        width: "100%",
        height: "100%",
        background: "linear-gradient(to top, #30cfd0 0%, #330867 100%)",
        color: "#ffffff",
      },
    },
  ],
};
