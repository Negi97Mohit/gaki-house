import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@gaki/core/hooks/useLocalStorage";
import { GeneratedOverlay } from "@gaki/core/types/caption";

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
