import { useState } from "react";

export const useDrawingController = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [excalidrawElements, setExcalidrawElements] = useState<readonly any[]>(
    []
  );

  const toggleDrawing = () => setIsDrawing((prev) => !prev);

  return {
    isDrawing,
    setIsDrawing,
    excalidrawElements,
    setExcalidrawElements,
    toggleDrawing,
  };
};
