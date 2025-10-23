// src/pages/Edit.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { RecordingSession, EMPTY_SESSION } from "@/types/editor";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Video, Edit, X } from "lucide-react";
import { toast } from "sonner";

// Placeholder for the non-linear editing timeline UI
const Timeline: React.FC<{
  session: RecordingSession;
  onSessionUpdate: (session: RecordingSession) => void;
}> = ({ session, onSessionUpdate }) => {
  // Implement draggable timeline markers, keyframe visualization, etc.
  return (
    <div className="w-full bg-neutral-800 p-4 border-t border-border">
      <h3 className="text-lg font-semibold flex items-center gap-2 mb-2">
        <Edit className="w-5 h-5" /> Timeline Editor
      </h3>
      <p className="text-sm text-muted-foreground">
        Total Duration: {(session.videoMetadata.duration / 1000).toFixed(1)}s
      </p>
      {/* Simple representation of tracks */}
      <div className="mt-4 space-y-2">
        <p className="font-medium text-primary">
          Caption Keyframes: {session.captionStyleTrack.keyframes.length}
        </p>
        <p className="font-medium text-purple-400">
          HTML Overlays: {session.htmlOverlayTrack.length} tracks
        </p>
        <p className="font-medium text-cyan-400">
          Browser Overlays: {session.browserOverlayTrack.length} tracks
        </p>
        <p className="font-medium text-green-400">
          File Overlays: {session.fileOverlayTrack.length} tracks
        </p>
        {/* UI for dragging elements and adjusting keyframes would go here */}
      </div>
    </div>
  );
};

const EditPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [allSessions, setAllSessions] = useLocalStorage<RecordingSession[]>(
    "gaki-recorded-sessions",
    []
  );
  const [session, setSession] = useState<RecordingSession | null>(null);

  useEffect(() => {
    const foundSession = allSessions.find((s) => s.id === sessionId);
    if (foundSession) {
      setSession(foundSession);
      toast.success(`Editing session: ${foundSession.name}`);
    } else {
      setSession(null);
      toast.error(`Session ${sessionId} not found.`);
    }
  }, [sessionId, allSessions]);

  const handleSessionUpdate = (updatedSession: RecordingSession) => {
    setAllSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    setSession(updatedSession);
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading or Session Not Found...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Video className="w-6 h-6 text-primary" />
          Editing: {session.name}
        </h1>
        <Button variant="outline" onClick={() => (window.location.href = "/")}>
          <X className="w-4 h-4 mr-2" /> Finish & Back to Live
        </Button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top: Video Player and Preview */}
        <div className="h-2/3 flex items-center justify-center bg-black relative">
          {/* The VideoCanvas for playback would go here, driven by the session.videoUrl and keyframes */}
          <video
            src={session.videoMetadata.videoUrl}
            controls
            className="max-h-full max-w-full"
            style={{
              aspectRatio: `${session.videoMetadata.width}/${session.videoMetadata.height}`,
            }}
          />
          {/* Placeholder for real-time keyframe overlay rendering */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-lg text-white/50 bg-black/50 p-2 rounded">
              Playback Mode (Edit UI Placeholder)
            </p>
          </div>
        </div>

        {/* Bottom: Timeline and Controls */}
        <div className="h-1/3 flex-shrink-0">
          <Timeline session={session} onSessionUpdate={handleSessionUpdate} />
        </div>
      </div>
    </div>
  );
};

export default EditPage;
