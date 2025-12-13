import { CanvasLayoutTemplate, LayoutCategory } from "@/types/layout";

export const MAGNETISM_GRID_TEMPLATE: CanvasLayoutTemplate = {
  id: "magnetism-layout",
  name: "Magnetism Grid",
  description:
    "A high-end editorial grid layout with a project header and mixed media rows.",
  category: "dynamic" as LayoutCategory,
  sections: [
    {
      id: "header",
      name: "Project Header",
      type: "text",
      content: {
        title: "Global Communication",
        subtitle: "Richard Mille",
      },
      style: { background: "transparent" },
    },
    {
      id: "media-1",
      name: "Media Row 1 (Video)",
      type: "video",
      style: { background: "transparent" },
    },
    {
      id: "media-2-left",
      name: "Media Row 2 Left",
      type: "image",
      style: { background: "transparent" },
    },
    {
      id: "media-2-right",
      name: "Media Row 2 Right",
      type: "image",
      style: { background: "transparent" },
    },
    {
      id: "media-3-left",
      name: "Media Row 3 Left",
      type: "image",
      style: { background: "transparent" },
    },
    {
      id: "media-3-right",
      name: "Media Row 3 Right",
      type: "image",
      style: { background: "transparent" },
    },
    {
      id: "media-4",
      name: "Media Row 4 (Video)",
      type: "video",
      style: { background: "transparent" },
    },
    {
      id: "media-5",
      name: "Media Row 5 (Large)",
      type: "image",
      style: { background: "transparent" },
    },
    {
      id: "media-6-left",
      name: "Media Row 6 Left",
      type: "image",
      style: { background: "transparent" },
    },
    {
      id: "media-6-right",
      name: "Media Row 6 Right",
      type: "image",
      style: { background: "transparent" },
    },
  ],
};
