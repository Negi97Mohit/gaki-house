// src/pages/Edit.tsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { RecordingSession, EMPTY_SESSION } from "@/types/editor";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { Button } from "@/components/ui/button";
import { Video, Edit, X, Play, Pause, Rewind, FastForward } from "lucide-react";
import { toast } from "sonner";
import { DraggableBrowser } from "@/components/DraggableBrowser"; // ADDED
import { DraggableFileViewer } from "@/components/DraggableFileViewer"; // ADDED
import { CaptionPreviewRenderer } from "@/components/CaptionPreviewRenderer"; // New preview renderer for editor
import { useSessionPlayback } from "@/hooks/useSessionPlayback";
import { DraggableOverlay } from "@/components/VideoCanvas";
import {
  ComponentTrack,
  GeneratedOverlay,
  CaptionStyle,
} from "@/types/caption";
import { cn } from "@/lib/utils"; // For styling

// Helper for simple timestamp formatting
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const milliseconds = Math.floor((ms % 1000) / 100);
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}:${String(milliseconds)}`;
};

// --- TIMELINE COMPONENT OVERHAUL ---
interface TimelineProps {
  session: RecordingSession;
  currentTime: number; // in seconds
  videoDuration: number; // in milliseconds
  isPlaying: boolean;
  onSeek: (time: number) => void;
  onTogglePlay: () => void;
  onSessionUpdate: (session: RecordingSession) => void;
}

const Timeline: React.FC<TimelineProps> = ({
  session,
  currentTime,
  videoDuration,
  isPlaying,
  onSeek,
  onTogglePlay,
}) => {
  const timelineRef = useRef<HTMLDivElement>(null);
  const currentTimeMs = currentTime * 1000;

  // Combine all relevant tracks for visualization
  const allTracks = useMemo(
    () =>
      [
        session.captionStyleTrack,
        ...session.htmlOverlayTrack,
        ...session.fileOverlayTrack,
        ...session.browserOverlayTrack,
      ].filter((track) => track.keyframes.length > 0) as ComponentTrack<any>[],
    [session]
  );

  // Handler to seek on timeline click
  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));
    const newTimeMs = clickRatio * videoDuration;
    onSeek(newTimeMs / 1000); // Seek in seconds
  };

  // Calculate the scrubber position
  const scrubberPosition = (currentTimeMs / videoDuration) * 100;

  // Function to get a color for a track type
  const getTrackColor = (type: string) => {
    switch (type) {
      case "caption":
        return "bg-blue-500";
      case "html":
        return "bg-purple-500";
      case "file":
        return "bg-green-500";
      case "browser":
        return "bg-yellow-500";
      case "layout":
        return "bg-cyan-500";
      default:
        return "bg-gray-500";
    }
  };

  // Function to calculate track bar position/width (simplified to show full track duration)
  const calculateBarProps = (track: ComponentTrack<any>) => {
    if (track.keyframes.length === 0) return null;

    const startMs = track.keyframes[0].timestamp;
    const endMs = track.keyframes[track.keyframes.length - 1].timestamp;

    const left = (startMs / videoDuration) * 100;
    const width = ((endMs - startMs) / videoDuration) * 100;

    return { left, width, color: getTrackColor(track.type), type: track.type };
  };

  return (
    <div className="flex flex-col h-full bg-neutral-900">
      {/* Control Bar */}
      <div className="flex items-center gap-4 p-3 border-t border-border bg-neutral-900 flex-shrink-0">
        <Button
          size="icon"
          variant="ghost"
          onClick={() => onSeek(Math.max(0, currentTime - 5))}
          title="Rewind 5s"
        >
          <Rewind className="w-5 h-5" />
        </Button>
        <Button
          size="icon"
          variant="default"
          onClick={onTogglePlay}
          title="Play/Pause"
        >
          {isPlaying ? (
            <Pause className="w-6 h-6" />
          ) : (
            <Play className="w-6 h-6" />
          )}
        </Button>
        <Button
          size="icon"
          variant="ghost"
          onClick={() =>
            onSeek(Math.min(videoDuration / 1000, currentTime + 5))
          }
          title="Fast Forward 5s"
        >
          <FastForward className="w-5 h-5" />
        </Button>

        <span className="text-xl font-mono text-primary ml-4">
          {formatTime(currentTimeMs)}
        </span>
        <span className="text-xl text-muted-foreground">/</span>
        <span className="text-xl text-muted-foreground">
          {formatTime(videoDuration)}
        </span>
      </div>

      {/* Timeline Viewport */}
      <div className="flex-1 p-4 overflow-y-auto bg-neutral-900 border-t border-border">
        <div
          ref={timelineRef}
          className="w-full h-8 bg-neutral-800 relative mb-4 cursor-pointer rounded"
          onClick={handleTimelineClick}
        >
          {/* Timeline Scrubber */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 shadow-xl pointer-events-none z-50 transition-transform duration-75 ease-linear"
            style={{
              left: `${scrubberPosition}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="absolute -top-1 w-3 h-3 bg-red-500 rounded-full left-1/2 -translate-x-1/2" />
          </div>
        </div>

        {/* Individual Tracks */}
        <div className="space-y-2">
          {allTracks.map((track) => {
            const barProps = calculateBarProps(track);
            if (!barProps) return null;

            return (
              <div key={track.id} className="text-xs">
                <div className="font-mono text-muted-foreground mb-1 flex justify-between">
                  <span>
                    {track.type === "caption"
                      ? "Live Captions"
                      : track.type.toUpperCase() + " Track"}
                  </span>
                  <span className={barProps.color.replace("bg", "text")}>
                    {track.type.toUpperCase()}
                  </span>
                </div>
                <div className="relative w-full h-4 bg-neutral-800 rounded-sm">
                  <div
                    className={cn(
                      "absolute top-0 bottom-0 rounded-sm cursor-grab",
                      barProps.color
                    )}
                    style={{
                      left: `${barProps.left}%`,
                      width: `${barProps.width}%`,
                      opacity: 0.8,
                    }}
                    title={`${track.id} (${track.type})`}
                  />
                  {/* Placeholder for individual keyframe markers */}
                  {track.keyframes.map((kf) => (
                    <div
                      key={kf.timestamp}
                      className="absolute h-full w-0.5 bg-yellow-300"
                      style={{
                        left: `${(kf.timestamp / videoDuration) * 100}%`,
                        transform: "translateX(-50%)",
                      }}
                      title={`Keyframe at ${formatTime(kf.timestamp)}`}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// --- EDIT PAGE COMPONENT ---
const EditPage = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [allSessions, setAllSessions] = useLocalStorage<RecordingSession[]>(
    "gaki-recorded-sessions",
    []
  );
  const [session, setSession] = useState<RecordingSession | null>(null);
  const [currentTime, setCurrentTime] = useState(0); // Time in seconds
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  // Ensure allSessions is available for the hook
  const navigate = useNavigate();

  useEffect(() => {
    const foundSession = allSessions.find((s) => s.id === sessionId);
    if (foundSession) {
      setSession(foundSession);
      // toast.success(`Editing session: ${foundSession.name}`); // Remove verbose toast
    } else {
      setSession(null);
      toast.error(`Session ${sessionId} not found.`);
    }
  }, [sessionId, allSessions]);

  // Hook to update current time during playback
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("timeupdate", updateTime);
    return () => video.removeEventListener("timeupdate", updateTime);
  }, []);

  // Toggle play/pause
  const handleTogglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  // Hook to update container size for rendering overlays
  useEffect(() => {
    const container = previewContainerRef.current;
    if (!container) return;

    const updateSize = () => {
      setContainerSize({
        width: container.clientWidth,
        height: container.clientHeight,
      });
    };

    const resizeObserver = new ResizeObserver(updateSize);
    resizeObserver.observe(container);
    updateSize();

    return () => resizeObserver.disconnect();
  }, []);

  // Get playback state (keyframes) for current time
  const currentTimeMs = currentTime * 1000;
  const playbackState = useSessionPlayback(
    session || EMPTY_SESSION,
    currentTimeMs
  );

  // Ensure play state is synchronized with video element
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, []);

  const handleSessionUpdate = (updatedSession: RecordingSession) => {
    setAllSessions((prev) =>
      prev.map((s) => (s.id === updatedSession.id ? updatedSession : s))
    );
    setSession(updatedSession);
  };

  // --- Keyframe Creation Logic (The core editing feature) ---
  const handleOverlayLayoutChange = (
    overlayId: string,
    key: "position" | "size" | "rotation",
    value: any
  ) => {
    if (!session) return;

    // 1. Find the correct track (e.g., HTML Overlay Track)
    const trackIndex = session.htmlOverlayTrack.findIndex(
      (t) => t.id === overlayId
    );
    if (trackIndex === -1) return;

    const track = session.htmlOverlayTrack[trackIndex];

    // 2. Determine the new state based on the current keyframe
    const currentState =
      track.keyframes.length > 0
        ? track.keyframes[track.keyframes.length - 1].state
        : playbackState.activeHtmlOverlays.find((o) => o.id === overlayId);

    if (!currentState) return;

    // 3. Create the new keyframe state
    const newKeyframeState: GeneratedOverlay = {
      ...currentState,
      layout: {
        ...currentState.layout,
        [key]: value, // Update the specific property
      },
    };

    // 4. Create the Keyframe object
    const newKeyframe = {
      timestamp: currentTimeMs, // New keyframe is set at the current time
      state: newKeyframeState,
    };

    // 5. Update the session (simpler, non-optimized update: just add to the end of the track)
    const newTrack: ComponentTrack<GeneratedOverlay> = {
      ...track,
      keyframes: [...track.keyframes, newKeyframe].sort(
        (a, b) => a.timestamp - b.timestamp
      ),
    };

    const updatedSession = {
      ...session,
      htmlOverlayTrack: session.htmlOverlayTrack.map((t, i) =>
        i === trackIndex ? newTrack : t
      ),
    };

    handleSessionUpdate(updatedSession);
    toast.info(
      `Keyframe added for ${overlayId} at ${formatTime(currentTimeMs)}`
    );
  };

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading or Session Not Found...
      </div>
    );
  }

  const videoDuration = session.videoMetadata.duration; // in ms
  const { videoUrl, width, height } = session.videoMetadata;

  return (
    <div className="flex flex-col h-screen bg-background">
      <header className="flex items-center justify-between p-4 border-b border-border bg-card">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <Video className="w-6 h-6 text-primary" />
          Editing: <span className="text-muted-foreground">{session.name}</span>
        </h1>
        <Button variant="outline" onClick={() => navigate("/")}>
          <X className="w-4 h-4 mr-2" /> Finish & Back to Live
        </Button>
      </header>

      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Top: Video Player and Preview */}
        <div
          ref={previewContainerRef}
          className="h-2/3 flex items-center justify-center bg-black relative overflow-hidden"
        >
          {/* Video Player */}
          <video
            ref={videoRef}
            src={videoUrl}
            // Remove controls here to manage playback state manually for better scrubbing control
            // We will add custom transport controls via the Timeline component
            className="max-h-full max-w-full"
            style={{ aspectRatio: `${width}/${height}` }}
            // NOTE: Playback/Pause controlled via internal state/buttons
          />

          {/* Overlays rendered based on Keyframes */}
          <div
            className="absolute inset-0 z-40 w-full h-full"
            style={{ pointerEvents: isPlaying ? "none" : "auto" }} // Enable interaction when paused/scrubbing
          >
            {containerSize.width > 0 &&
              playbackState.activeHtmlOverlays.map((overlay) => (
                <DraggableOverlay
                  key={overlay.id}
                  // Pass the current keyframe state to the DraggableOverlay
                  overlay={overlay}
                  onLayoutChange={handleOverlayLayoutChange}
                  onRemoveOverlay={() => {
                    /* Editing logic */
                  }}
                  onPreviewGenerated={() => {
                    /* Preview already generated */
                  }}
                  onSetDynamicLayout={() => {
                    /* Editing logic */
                  }}
                  containerSize={containerSize}
                />
              ))}

            {/* Caption Preview (Rendered at correct keyframe position/style) */}
            {playbackState.captionStyle && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="pointer-events-auto"
                  style={{
                    position: "absolute",
                    left: `${playbackState.captionStyle.position.x}%`,
                    top: `${playbackState.captionStyle.position.y}%`,
                    transform: "translate(-50%, -50%)",
                    width: `${playbackState.captionStyle.width || 80}%`,
                    zIndex: 999, // Ensure it's above other standard elements
                  }}
                >
                  <CaptionPreviewRenderer
                    style={playbackState.captionStyle}
                    text="[Recorded Caption Content]"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom: Timeline and Controls */}
        <div className="h-1/3 flex-shrink-0">
          <Timeline
            session={session}
            currentTime={currentTime}
            videoDuration={videoDuration}
            isPlaying={isPlaying}
            onTogglePlay={handleTogglePlay}
            onSeek={(time) => {
              // Seek video on timeline click
              if (videoRef.current) {
                videoRef.current.currentTime = time;
                setCurrentTime(time);
                if (isPlaying) {
                  videoRef.current.play(); // Continue playing after seek
                } else {
                  videoRef.current.pause(); // Pause after seek if already paused
                }
              }
            }}
            onSessionUpdate={handleSessionUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default EditPage;
