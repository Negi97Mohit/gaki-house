import { useState, useCallback } from "react";

export const useSelectionState = () => {
  const [selectedBrowserId, setSelectedBrowserIdRaw] = useState<string | null>(
    null
  );
  const [selectedFileId, setSelectedFileIdRaw] = useState<string | null>(null);
  const [selectedTextId, setSelectedTextIdRaw] = useState<string | null>(null);
  const [selectedGeneratedId, setSelectedGeneratedIdRaw] = useState<string | null>(
    null
  );

  // Toggle-aware setters - clicking same item deselects it
  const setSelectedBrowserId = useCallback((id: string | null) => {
    setSelectedBrowserIdRaw(prev => prev === id ? null : id);
  }, []);

  const setSelectedFileId = useCallback((id: string | null) => {
    setSelectedFileIdRaw(prev => prev === id ? null : id);
  }, []);

  const setSelectedTextId = useCallback((id: string | null) => {
    setSelectedTextIdRaw(prev => prev === id ? null : id);
  }, []);

  const setSelectedGeneratedId = useCallback((id: string | null) => {
    setSelectedGeneratedIdRaw(prev => prev === id ? null : id);
  }, []);

  const handleDeselectAll = useCallback(() => {
    setSelectedBrowserIdRaw(null);
    setSelectedFileIdRaw(null);
    setSelectedTextIdRaw(null);
    setSelectedGeneratedIdRaw(null);
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
