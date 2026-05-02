import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { RecordingSession, EMPTY_SESSION } from "@gaki/core/types/editor";
import { useLocalStorage } from "@gaki/core/hooks/useLocalStorage";
import { useSessionPlayback } from "@/features/stream/hooks/useSessionPlayback";

export const useEditSession = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [allSessions] = useLocalStorage<RecordingSession[]>("gaki-recorded-sessions", []);

    // Session State
    const [session, setSession] = useState<RecordingSession | null>(null);

    // Playback State
    const [currentTime, setCurrentTime] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(100);

    // UI State
    const [zoom, setZoom] = useState(100);
    const [showControlPanel, setShowControlPanel] = useState(false);

    // Refs
    const videoRef = useRef<HTMLVideoElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Load Session
    useEffect(() => {
        const foundSession = allSessions.find((s) => s.id === sessionId);
        if (foundSession) {
            setSession(foundSession);
        } else {
            toast.error(`Session not found`);
            navigate("/");
        }
    }, [sessionId, allSessions, navigate]);

    // Video Event Listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const updateTime = () => setCurrentTime(video.currentTime);
        const handlePlay = () => setIsPlaying(true);
        const handlePause = () => setIsPlaying(false);

        video.addEventListener("timeupdate", updateTime);
        video.addEventListener("play", handlePlay);
        video.addEventListener("pause", handlePause);

        return () => {
            video.removeEventListener("timeupdate", updateTime);
            video.removeEventListener("play", handlePlay);
            video.removeEventListener("pause", handlePause);
        };
    }, [session]); // Re-bind if session changes (though ref mostly stable)

    // Handlers
    const handleTogglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (isPlaying) {
            video.pause();
        } else {
            video.play().catch(console.error);
        }
    };

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!timelineRef.current || !session) return;
        const rect = timelineRef.current.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const ratio = Math.max(0, Math.min(1, clickX / rect.width));
        const newTime = (ratio * session.videoMetadata.duration) / 1000;
        handleSeek(newTime);
    };

    const handleExport = () => {
        toast.success("Exporting video...");
    };

    // Derived
    const currentTimeMs = currentTime * 1000;
    // Use EMPTY_SESSION safely if session is null to prevent hook errors, 
    // though we handle null session in UI
    const playbackState = useSessionPlayback(session || EMPTY_SESSION, currentTimeMs);
    const duration = session ? session.videoMetadata.duration / 1000 : 0;
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

    return {
        session,
        currentTime,
        currentTimeMs,
        isPlaying,
        volume,
        setVolume,
        zoom,
        setZoom,
        showControlPanel,
        setShowControlPanel,
        videoRef,
        timelineRef,
        handleTogglePlay,
        handleSeek,
        handleTimelineClick,
        handleExport,
        playbackState,
        duration,
        progress,
        navigate
    };
};
