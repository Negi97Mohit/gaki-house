// src/lib/layouts/SplitLandingPage.ts
import { CanvasLayoutTemplate } from "@/types/layout";

export const SPLIT_LANDING_PAGE_TEMPLATE: CanvasLayoutTemplate = {
  id: "split-landing-page",
  name: "Split Landing Page",
  description: "Interactive split screen with hover expansion",
  sections: [
    {
      id: "split-left",
      name: "", // Cleared text
      description: "", // Cleared description
      style: {
        backgroundColor: "rgba(87, 84, 236, 0.7)",
        color: "#ffffff",
      },
    },
    {
      id: "split-right",
      name: "", // Cleared text
      description: "", // Cleared description
      style: {
        backgroundColor: "rgba(43, 43, 43, 0.8)",
        color: "#ffffff",
      },
    },
  ],
};
