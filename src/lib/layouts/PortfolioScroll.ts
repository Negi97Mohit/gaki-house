// src/lib/layouts/PortfolioScroll.ts
import { CanvasLayoutTemplate } from "@/types/layout";

export const PORTFOLIO_SCROLL_TEMPLATE: CanvasLayoutTemplate = {
  id: "portfolio-scroll",
  name: "Portfolio Scroll",
  description:
    "Vertical project list with bold typography and colored sections",
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
    // Section 2: Babylone (Red)
    {
      id: "project-babylone",
      name: "Babylone",
      description: "Selected Project",
      style: {
        backgroundColor: "#B21C1B", // From HTML snippet
        color: "#ffffff",
      },
    },
    // Section 3: Acqua Di Giò (Deep Blue)
    {
      id: "project-acqua",
      name: "Acqua Di Giò",
      description: "Selected Project",
      style: {
        backgroundColor: "#003F66", // From HTML snippet
        color: "#ffffff",
      },
    },
    // Section 4: La Grande Épicerie (Beige)
    {
      id: "project-epicerie",
      name: "La Grande Épicerie",
      description: "Selected Project",
      style: {
        backgroundColor: "#CFCC93", // From HTML snippet
        color: "#000000",
      },
    },
  ],
};
