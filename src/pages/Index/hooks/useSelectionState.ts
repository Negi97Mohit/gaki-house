import { useState, useCallback } from "react";

export const useSelectionState = () => {
  const [selectedBrowserId, setSelectedBrowserId] = useState<string | null>(
    null
  );
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [selectedGeneratedId, setSelectedGeneratedId] = useState<string | null>(
    null
  );

  const handleDeselectAll = useCallback(() => {
    setSelectedBrowserId(null);
    setSelectedFileId(null);
    setSelectedTextId(null);
    setSelectedGeneratedId(null);
  }, []);

  return {
    selectedBrowserId,
    setSelectedBrowserId,
    selectedFileId,
    setSelectedFileId,
    selectedTextId,
    setSelectedTextId,
    selectedGeneratedId,
    setSelectedGeneratedId,
    handleDeselectAll,
  };
};
