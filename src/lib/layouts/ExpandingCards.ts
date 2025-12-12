// src/lib/layouts/ExpandingCards.ts
import { CanvasLayoutTemplate } from "@/types/layout";

export const EXPANDING_CARDS_TEMPLATE: CanvasLayoutTemplate = {
  id: "expanding-cards",
  name: "Expanding Cards",
  description: "Interactive timeline with 5 expanding panels",
  sections: [
    {
      id: "card-1",
      name: "Sunrise",
      style: {
        top: "0%",
        left: "0%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "card-2",
      name: "Lavender",
      style: {
        top: "0%",
        left: "20%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "card-3",
      name: "Ocean",
      style: {
        top: "0%",
        left: "40%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "card-4",
      name: "Peach",
      style: {
        top: "0%",
        left: "60%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
        color: "#ffffff",
      },
    },
    {
      id: "card-5",
      name: "Sky",
      style: {
        top: "0%",
        left: "80%",
        width: "20%",
        height: "100%",
        background: "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
        color: "#ffffff",
      },
    },
  ],
};
