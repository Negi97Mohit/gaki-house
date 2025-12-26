import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useLocalStorage } from "@/shared/hooks/useLocalStorage";
import { RecordingSession } from "@/types/editor";
import { GeneratedOverlay } from "@/types/caption";

export const useSessionData = () => {
  const navigate = useNavigate();

  const [allSessions, setAllSessions] = useLocalStorage<RecordingSession[]>(
    "gaki-recorded-sessions",
    []
  );

  const [savedOverlays, setSavedOverlays] = useLocalStorage<GeneratedOverlay[]>(
    "gaki-saved-overlays",
    []
  );

  const handleRecordingComplete = useCallback(
    (session: RecordingSession) => {
      setAllSessions((prev) => [session, ...prev]);
      setTimeout(() => navigate(`/edit/${session.id}`), 50);
    },
    [navigate, setAllSessions]
  );

  const handleDeleteSession = useCallback(
    (id: string) => {
      setAllSessions((s) => s.filter((x) => x.id !== id));
    },
    [setAllSessions]
  );

  return {
    allSessions,
    setAllSessions,
    savedOverlays,
    setSavedOverlays,
    handleRecordingComplete,
    handleDeleteSession,
  };
};
