// src/lib/layouts/SimonPortfolio.ts
import { CanvasLayoutTemplate } from "@/types/layout";

export const SIMON_PORTFOLIO_TEMPLATE: CanvasLayoutTemplate = {
  id: "simon-portfolio",
  name: "Simon Daufresne",
  description: "Minimalist portfolio with bold typography and GSAP animations",
  category: "dynamic",
  sections: [
    {
      id: "project-babylone",
      name: "Babylone",
      description: "Art direction & Visual Identity for a luxury perfume brand",
      style: {
        backgroundColor: "#B21C1B",
        color: "#ffffff",
      },
    },
    {
      id: "project-acqua",
      name: "Acqua Di Giò",
      description: "Campaign design for Giorgio Armani fragrance collection",
      style: {
        backgroundColor: "#003F66",
        color: "#ffffff",
      },
    },
    {
      id: "project-epicerie",
      name: "La Grande Épicerie",
      description: "Brand identity refresh for Le Bon Marché food hall",
      style: {
        backgroundColor: "#CFCC93",
        color: "#000000",
      },
    },
    {
      id: "project-editorial",
      name: "Editorial",
      description: "Typography and layout for print publications",
      style: {
        backgroundColor: "#1a1a1a",
        color: "#ffffff",
      },
    },
  ],
};
