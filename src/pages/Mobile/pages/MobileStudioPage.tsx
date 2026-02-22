import React, { useRef, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
    Camera, RefreshCcw, Mic, MicOff, VideoOff, Settings,
    X, Radio, Circle, MonitorPlay, Share2
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { MobileCanvasContainer } from "../components/MobileCanvasContainer";
import { useMediaStore } from "@/stores/media.store";
import { useUiStore } from "@/stores/ui.store";
import { MobileStudioToolsDrawer } from "../components/MobileStudioToolsDrawer";
import { useSceneStore } from "@/stores/scene.store";

// Basic Unified Studio Page for Mobile (Record + Stream)
export const MobileStudioPage: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    // Modes: 'stream' or 'record'
    const mode = searchParams.get("mode") === "stream" ? "stream" : "record";

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const [isStreaming, setIsStreaming] = useState(false);
    const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

    // Tools Drawer State
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Global Store Mappings
    const isAudioOn = useMediaStore((state) => state.isAudioOn);
    const setAudioOn = useMediaStore((state) => state.setAudioOn);
    const isVideoOn = useMediaStore((state) => state.isVideoOn);
    const setVideoOn = useMediaStore((state) => state.setVideoOn);
    const isVideoOff = !isVideoOn;
    const isMuted = !isAudioOn;

    // We don't have physical flipCamera integrated to `facingMode` globally yet, but we'll adapt.
    // For now MobileStudio Tools can handle the visual aspects.

    console.debug(`[MobileStudio] Initialized in mode: ${mode}`);

    // Handle Mic Toggle
    const toggleMute = () => {
        setAudioOn(!isAudioOn);
    };

    // Handle Camera Toggle (Video Mute - Blank Screen)
    const toggleVideo = () => {
        setVideoOn(!isVideoOn);
    };

    // Stub: Physical Camera Flip (Front/Back)
    const flipCamera = () => {
        toast.info("Physical camera flip uses standard settings for now.");
    };

    // Handle Recording State
    const handleRecordToggle = () => {
        // Simplified recording for now, requires actual stream integration in future
        if (isRecording) {
            setIsRecording(false);
            console.debug("[MobileStudio] Recording stopped");
            toast.success("Recording saved!");
        } else {
            setIsRecording(true);
            console.debug("[MobileStudio] Recording started");
            toast.success("Recording started");
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
        <div className="fixed inset-0 z-40 bg-black flex flex-col items-center justify-between text-white overflow-hidden font-sans">

            {/* Global Engine (CanvasView) */}
            <div className="absolute inset-0 z-0">
                <MobileCanvasContainer
                    isDrawerOpen={isSettingsOpen}
                    onDrawerOpenChange={setIsSettingsOpen}
                    layoutManager={{
                        handleCanvasPresetSelect: () => { },
                        handleSaveCanvasPreset: () => { },
                        handleDeleteCanvasPreset: () => { },
                        shareCanvasPreset: () => { },
                        unshareCanvasPreset: () => { },
                        customPresets: [],
                        publicPresets: [],
                        isLoadingPublic: false
                    }}
                    vaultFiles={[]}
                    onAddVaultFiles={() => { }}
                    onRemoveVaultFile={() => { }}
                    onClearVault={() => { }}
                />
            </div>

            {/* Placeholder state for when video is off */}
            <div className={cn("absolute inset-0 z-[5] w-full h-full bg-zinc-900 flex flex-col items-center justify-center transition-opacity", !isVideoOff && "opacity-0 pointer-events-none")}>
                <Camera className="w-16 h-16 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 font-medium">Camera is disabled</p>
            </div>

            {/* Top Toolbar */}
            <div className="w-full relative z-20 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pt-10 pointer-events-none">
                <button
                    onClick={handleExit}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur active:scale-90 transition-transform pointer-events-auto"
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

                <div className="pointer-events-auto">
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur active:scale-90 transition-transform"
                    >
                        <Settings className="w-5 h-5" />
                    </button>
                </div>
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
