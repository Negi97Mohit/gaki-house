import { useState } from "react";
import { GeneratedLayout } from "@caption-cam/core/types/caption";

export const useDynamicLayoutState = () => {
  const [dynamicLayout, setDynamicLayout] = useState<{
    isActive: boolean;
    mode: "split-vertical" | "split-horizontal" | "pip";
    target: {
      id: string;
      type: string;
      content: any;
      layout: GeneratedLayout;
    } | null;
  }>({ isActive: false, mode: "split-vertical", target: null });

  return {
    dynamicLayout,
    setDynamicLayout,
  };
};
