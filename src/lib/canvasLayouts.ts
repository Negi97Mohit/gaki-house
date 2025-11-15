// src/lib/canvasLayouts.ts
import React from "react";

export interface CanvasLayoutTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  sections: Array<{
    id: string;
    name: string;
    style: React.CSSProperties;
  }>;
}

export const LAYOUT_TEMPLATES: Record<string, CanvasLayoutTemplate> = {
  default: {
    id: "default",
    name: "Full Screen",
    description: "Single full-screen section",
    icon: null,
    sections: [
      {
        id: "main",
        name: "Main",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        },
      },
    ],
  },
  "two-halves": {
    id: "two-halves",
    name: "Two Halves",
    description: "Two equal vertical sections",
    icon: null,
    sections: [
      {
        id: "left",
        name: "Left",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "50%",
          height: "100%",
        },
      },
      {
        id: "right",
        name: "Right",
        style: {
          position: "absolute",
          top: 0,
          left: "50%",
          width: "50%",
          height: "100%",
        },
      },
    ],
  },
  trio: {
    id: "trio",
    name: "Trio",
    description: "Three equal vertical columns",
    icon: null,
    sections: [
      {
        id: "left",
        name: "Left",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "33.333%",
          height: "100%",
        },
      },
      {
        id: "center",
        name: "Center",
        style: {
          position: "absolute",
          top: 0,
          left: "33.333%",
          width: "33.333%",
          height: "100%",
        },
      },
      {
        id: "right",
        name: "Right",
        style: {
          position: "absolute",
          top: 0,
          left: "66.666%",
          width: "33.334%",
          height: "100%",
        },
      },
    ],
  },
  "main-and-corner": {
    id: "main-and-corner",
    name: "Main & Corner",
    description: "Large main section with triangular corner",
    icon: null,
    sections: [
      {
        id: "main",
        name: "Main",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        },
      },
      {
        id: "corner",
        name: "Corner",
        style: {
          position: "absolute",
          top: 0,
          right: 0,
          width: "30%",
          height: "30%",
          clipPath: "polygon(0 0, 100% 0, 100% 100%)",
        },
      },
    ],
  },
  "zigzag": {
    id: "zigzag",
    name: "Zig-Zag",
    description: "Two sections split by diagonal line",
    icon: null,
    sections: [
      {
        id: "top",
        name: "Top",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          clipPath: "polygon(0 0, 100% 0, 70% 100%, 0 100%)",
        },
      },
      {
        id: "bottom",
        name: "Bottom",
        style: {
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          clipPath: "polygon(70% 100%, 100% 0, 100% 100%)",
        },
      },
    ],
  },
};

export const LAYOUT_TEMPLATE_LIST = Object.values(LAYOUT_TEMPLATES);
