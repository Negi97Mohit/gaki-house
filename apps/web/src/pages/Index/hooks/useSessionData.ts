import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@caption-cam/core/hooks/useLocalStorage";
import { GeneratedOverlay } from "@caption-cam/core/types/caption";

export const useSessionData = () => {
  const navigate = useNavigate();

  const [savedOverlays, setSavedOverlays] = useLocalStorage<GeneratedOverlay[]>(
    "gaki-saved-overlays",
    []
  );

  return {
    savedOverlays,
    setSavedOverlays,
  };
};
