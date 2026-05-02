import React, { RefObject } from "react";
import {
    SkipBack,
    SkipForward,
    Play,
    Pause,
    Volume2,
    Layers
} from "lucide-react";
import { Button } from "@gaki/ui/button";
import { Slider } from "@gaki/ui/slider";
import { RecordingSession, SessionPlaybackState } from "@gaki/core/types/editor";

interface EditorTimelineProps {
    session: RecordingSession;
    currentTime: number;
    currentTimeMs: number;
    duration: number;
    progress: number;
    isPlaying: boolean;
    volume: number;
    setVolume: (val: number) => void;
    onTogglePlay: () => void;
    onSeek: (time: number) => void;
    timelineRef: RefObject<HTMLDivElement>;
    onTimelineClick: (e: React.MouseEvent<HTMLDivElement>) => void;
    playbackState: SessionPlaybackState;
}

const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

export const EditorTimeline = ({
    session,
    currentTime,
    currentTimeMs,
    duration,
    progress,
    isPlaying,
    volume,
    setVolume,
    onTogglePlay,
    onSeek,
    timelineRef,
    onTimelineClick,
    playbackState
}: EditorTimelineProps) => {
    return (
        <div className="h-56 border-t border-neutral-800 flex flex-col bg-neutral-900/50 backdrop-blur-sm flex-shrink-0">
            {/* Playback Controls */}
            <div className="h-14 border-b border-neutral-800 flex items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSeek(Math.max(0, currentTime - 5))}
                        className="text-neutral-400 hover:text-white"
                    >
                        <SkipBack className="w-4 h-4" />
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onTogglePlay}
                        className="text-white hover:bg-neutral-800"
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSeek(Math.min(duration, currentTime + 5))}
                        className="text-neutral-400 hover:text-white"
                    >
                        <SkipForward className="w-4 h-4" />
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-neutral-400">
                        {formatTime(currentTimeMs)} / {formatTime(session.videoMetadata.duration)}
                    </span>
                    <div className="flex items-center gap-2">
                        <Volume2 className="w-4 h-4 text-neutral-400" />
                        <Slider
                            value={[volume]}
                            onValueChange={(v) => setVolume(v[0])}
                            max={100}
                            step={1}
                            className="w-24"
                        />
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <div className="flex-1 p-4 overflow-y-auto">
                <div
                    ref={timelineRef}
                    onClick={onTimelineClick}
                    className="relative w-full h-16 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-800/80 transition-colors"
                >
                    {/* Progress Bar */}
                    <div
                        className="absolute top-0 left-0 h-full bg-primary/20 rounded-lg pointer-events-none"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Playhead */}
                    <div
                        className="absolute top-0 bottom-0 w-0.5 bg-primary pointer-events-none z-10"
                        style={{ left: `${progress}%` }}
                    >
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-primary rounded-full" />
                    </div>

                    {/* Track Indicators */}
                    {session.htmlOverlayTrack.map((track) => (
                        <div
                            key={track.id}
                            className="absolute top-2 h-2 bg-purple-500/50 rounded"
                            style={{
                                left: `${(track.keyframes[0]?.timestamp / session.videoMetadata.duration) * 100}%`,
                                width: `${((track.keyframes[track.keyframes.length - 1]?.timestamp - track.keyframes[0]?.timestamp) / session.videoMetadata.duration) * 100}%`,
                            }}
                        />
                    ))}
                </div>

                {/* Layer List */}
                <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                        <Layers className="w-3 h-3" />
                        <span>Layers</span>
                    </div>
                    <div className="space-y-1">
                        {playbackState.activeHtmlOverlays.map((overlay) => (
                            <div
                                key={overlay.id}
                                className="h-8 bg-neutral-800 rounded px-3 flex items-center text-xs text-neutral-400 hover:bg-neutral-700 cursor-pointer transition-colors"
                            >
                                {overlay.name}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};
