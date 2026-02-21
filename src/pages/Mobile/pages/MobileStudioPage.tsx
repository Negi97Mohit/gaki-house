import React, { useRef, useEffect, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Camera, RefreshCcw, Mic, MicOff, VideoOff, Settings,
    X, Radio, Circle, MonitorPlay, Share2
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

// Basic Unified Studio Page for Mobile (Record + Stream)
export const MobileStudioPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Modes: 'stream' or 'record'
    const mode = searchParams.get("mode") === "stream" ? "stream" : "record";

    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const [stream, setStream] = useState<MediaStream | null>(null);
    const [isRecording, setIsRecording] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

    console.debug(`[MobileStudio] Initialized in mode: ${mode}`);

    // Clean up function for streams
    const stopMediaTracks = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            console.debug("[MobileStudio] Stopped all media tracks");
        }
    }, [stream]);

    // Initialize Camera
    const startCamera = useCallback(async () => {
        try {
            stopMediaTracks();
            console.debug(`[MobileStudio] Requesting camera access (facingMode: ${facingMode})...`);

            const newStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: facingMode,
                    width: { ideal: 1080 },
                    height: { ideal: 1920 } // Prefer vertical video for mobile
                },
                audio: true,
            });

            setStream(newStream);

            if (videoRef.current) {
                videoRef.current.srcObject = newStream;
            }
            console.debug("[MobileStudio] Camera access granted and stream attached");
        } catch (err) {
            console.error("[MobileStudio] Camera Error:", err);
            toast.error("Could not access camera or microphone. Please check permissions.");
        }
    }, [facingMode, stopMediaTracks]);

    useEffect(() => {
        startCamera();
        return () => {
            stopMediaTracks();
            if (isRecording && mediaRecorderRef.current) {
                mediaRecorderRef.current.stop();
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [facingMode]);

    // Handle Mic Toggle
    const toggleMute = () => {
        if (stream) {
            const audioTrack = stream.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
                console.debug(`[MobileStudio] Microphone muted: ${!audioTrack.enabled}`);
            }
        }
    };

    // Handle Camera Toggle (Video Mute - Blank Screen)
    const toggleVideo = () => {
        if (stream) {
            const videoTrack = stream.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsVideoOff(!videoTrack.enabled);
                console.debug(`[MobileStudio] Camera disabled: ${!videoTrack.enabled}`);
            }
        }
    };

    // Handle Physical Camera Flip (Front/Back)
    const flipCamera = () => {
        console.debug("[MobileStudio] Flipping camera direction");
        setFacingMode(prev => prev === "user" ? "environment" : "user");
    };

    // Handle Recording State
    const handleRecordToggle = () => {
        if (!stream) return;

        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
            console.debug("[MobileStudio] Recording stopped");
            toast.success("Recording saved!");
            // In a real app, processing would happen when dataavailable fires
        } else {
            setRecordedChunks([]);
            const options = { mimeType: 'video/webm; codecs=vp9' };
            try {
                const mediaRecorder = new MediaRecorder(stream, options);
                mediaRecorderRef.current = mediaRecorder;

                mediaRecorder.ondataavailable = (event) => {
                    if (event.data.size > 0) {
                        setRecordedChunks((prev) => [...prev, event.data]);
                    }
                };

                mediaRecorder.start();
                setIsRecording(true);
                console.debug("[MobileStudio] Recording started");
                toast.success("Recording started");
            } catch (e) {
                console.error("[MobileStudio] Failed to start recorder:", e);
                toast.error("Format not supported on this device.");
            }
        }
    };

    // Handle Streaming State
    const handleStreamToggle = () => {
        if (isStreaming) {
            setIsStreaming(false);
            console.debug("[MobileStudio] Multi-Stream stopped");
            toast.info("Stream ended");
        } else {
            setIsStreaming(true);
            console.debug("[MobileStudio] Multi-Stream started");
            toast.success("Going live to connected platforms!");
        }
    };

    // Unified Action Button Click
    const handleMainAction = () => {
        if (mode === "record") {
            handleRecordToggle();
        } else {
            handleStreamToggle();
        }
    };

    // Switch modes safely (can't switch if actively recording/streaming)
    const switchMode = (newMode: "stream" | "record") => {
        if (isRecording || isStreaming) {
            toast.warning(`Please stop ${isRecording ? 'recording' : 'streaming'} before switching modes.`);
            return;
        }
        console.debug(`[MobileStudio] Switched mode via toggle -> ${newMode}`);
        setSearchParams({ mode: newMode }, { replace: true });
    };

    const handleExit = () => {
        if (isRecording || isStreaming) {
            const confirmExit = window.confirm("You are currently " + (isRecording ? "recording" : "streaming") + ". Are you sure you want to stop and exit?");
            if (!confirmExit) return;
        }
        console.debug("[MobileStudio] Exiting Mobile Studio");
        navigate("/m"); // Return back home
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-between text-white overflow-hidden font-sans">

            {/* Camera Preview Background */}
            <video
                ref={videoRef}
                autoPlay
                playsInline
                muted // Always mute local playback to prevent feedback loop
                className={cn(
                    "absolute inset-0 w-full h-full object-cover transition-opacity duration-300",
                    isVideoOff ? "opacity-0" : "opacity-100",
                    facingMode === "user" && "scale-x-[-1]" // mirror front camera
                )}
            />
            {/* Placeholder state for when video is off */}
            <div className={cn("absolute inset-0 w-full h-full bg-zinc-900 flex items-center justify-center -z-10", !isVideoOff && "hidden")}>
                <Camera className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">Camera is disabled</p>
            </div>

            {/* Top Toolbar */}
            <div className="w-full relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-10">
                <button
                    onClick={handleExit}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur active:scale-90 transition-transform"
                >
                    <X className="w-6 h-6" />
                </button>

                {mode === "stream" && isStreaming && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/90 backdrop-blur rounded-full shadow-lg shadow-red-900/50 animate-pulse">
                        <Radio className="w-4 h-4" />
                        <span className="text-sm font-bold tracking-wide uppercase">LIVE</span>
                    </div>
                )}
                {mode === "record" && isRecording && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-red-600/90 backdrop-blur rounded-full shadow-lg shadow-red-900/50">
                        <div className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" />
                        <span className="text-sm font-bold tracking-wide font-mono">REC</span>
                    </div>
                )}

                <button
                    onClick={() => toast.info("Settings panel coming soon")}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur active:scale-90 transition-transform"
                >
                    <Settings className="w-5 h-5" />
                </button>
            </div>

            {/* Main Action Bar (Bottom) */}
            <div className="w-full relative z-20 flex flex-col gap-6 p-6 bg-gradient-to-t from-black/90 via-black/60 to-transparent pb-safe">

                {/* Secondary Actions (Flip, Mic, Video, Layouts) */}
                <div className="flex items-center justify-between px-4">
                    <button
                        onClick={flipCamera}
                        className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                            <RefreshCcw className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-medium text-white/70">Flip</span>
                    </button>
                    <button
                        onClick={toggleMute}
                        className={cn("flex flex-col items-center gap-1 active:scale-90 transition-transform", isMuted && "text-red-400")}
                    >
                        <div className={cn("w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center", isMuted && "bg-red-500/20")}>
                            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-medium text-white/70">{isMuted ? "Unmute" : "Mute"}</span>
                    </button>
                    <button
                        onClick={toggleVideo}
                        className={cn("flex flex-col items-center gap-1 active:scale-90 transition-transform", isVideoOff && "text-red-400")}
                    >
                        <div className={cn("w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center", isVideoOff && "bg-red-500/20")}>
                            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
                        </div>
                        <span className="text-[10px] font-medium text-white/70">{isVideoOff ? "Turn On" : "Turn Off"}</span>
                    </button>
                    <button
                        onClick={() => toast.info("Layout menu coming soon")}
                        className="flex flex-col items-center gap-1 active:scale-90 transition-transform"
                    >
                        <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center">
                            <Share2 className="w-5 h-5" />
                        </div>
                        <span className="text-[10px] font-medium text-white/70">Share</span>
                    </button>
                </div>

                {/* Primary Action Button (Shutter) */}
                <div className="flex items-center justify-center mt-2">
                    <button
                        onClick={handleMainAction}
                        className={cn(
                            "group relative w-[80px] h-[80px] rounded-full flex items-center justify-center transition-all duration-300",
                            mode === "record"
                                ? "border-[6px] border-white/80 hover:border-white"
                                : "border-[6px] border-primary/80 hover:border-primary"
                        )}
                    >
                        {mode === "record" ? (
                            <div className={cn(
                                "bg-red-500 transition-all duration-300 group-hover:bg-red-400",
                                isRecording ? "w-8 h-8 rounded-lg" : "w-[60px] h-[60px] rounded-full"
                            )} />
                        ) : (
                            <div className={cn(
                                "transition-all duration-300 flex items-center justify-center shadow-lg",
                                isStreaming ? "w-10 h-10 bg-red-500 rounded-lg shadow-red-500/50" : "w-[60px] h-[60px] bg-primary rounded-full shadow-primary/50 group-hover:scale-105"
                            )}>
                                {!isStreaming && <Radio className="w-8 h-8 text-primary-foreground ml-1" />}
                            </div>
                        )}
                    </button>
                </div>

                {/* Mode Switcher Pill */}
                <div className="bg-black/60 backdrop-blur-md rounded-full mt-4 p-1 flex items-center self-center shadow-2xl border border-white/10 relative z-30">
                    <button
                        onClick={() => switchMode("record")}
                        className={cn(
                            "px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                            mode === "record" ? "bg-white text-black shadow-sm" : "text-white/60 hover:text-white"
                        )}
                    >
                        <Circle className={cn("w-3 h-3", mode === "record" ? "text-red-500 fill-red-500" : "")} />
                        Record
                    </button>
                    <button
                        onClick={() => switchMode("stream")}
                        className={cn(
                            "px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5",
                            mode === "stream" ? "bg-primary text-primary-foreground shadow-sm" : "text-white/60 hover:text-white"
                        )}
                    >
                        <MonitorPlay className="w-3.5 h-3.5" />
                        Stream
                    </button>
                </div>

            </div>
        </div>
    );
};
