// src/lib/layouts/PortfolioScroll.ts
import { CanvasLayoutTemplate } from "@/types/layout";

export const PORTFOLIO_SCROLL_TEMPLATE: CanvasLayoutTemplate = {
  id: "portfolio-scroll",
  name: "Portfolio Scroll",
  description:
    "Vertical project list with bold typography and colored sections",
  category: "dynamic",
  sections: [
    // Section 1: Intro / Home
    {
      id: "portfolio-intro",
      name: "Introduction",
      description: "Hi! I am an independent graphic designer.",
      style: {
        backgroundColor: "#ffffff",
        color: "#000000",
      },
    },
    // Section 2: Intro (Red)
    {
      id: "project-Intro",
      name: "Intro",
      description: "Selected Project",
      style: {
        backgroundColor: "#B21C1B", // From HTML snippet
        color: "#ffffff",
      },
    },
    // Section 3: Slide1 (Deep Blue)
    {
      id: "project-acqua",
      name: "Slide1",
      description: "Selected Project",
      style: {
        backgroundColor: "#003F66", // From HTML snippet
        color: "#ffffff",
      },
    },
    // Section 4: Slide2 (Beige)
    {
      id: "project-epicerie",
      name: "Slide2",
      description: "Selected Project",
      style: {
        backgroundColor: "#CFCC93", // From HTML snippet
        color: "#000000",
      },
    },
  ],
};
