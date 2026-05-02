import React, { RefObject } from "react";
import {
    Type,
    Image as ImageIcon,
    Sparkles,
    Layers,
    ZoomIn,
    ZoomOut
} from "lucide-react";
import { Button } from "@gaki/ui/button";
import { RecordingSession, SessionPlaybackState } from "@gaki/core/types/editor";

interface EditorCanvasProps {
    session: RecordingSession;
    videoRef: RefObject<HTMLVideoElement>;
    playbackState: SessionPlaybackState;
    zoom: number;
}

export const EditorCanvas = ({
    session,
    videoRef,
    playbackState,
    zoom
}: EditorCanvasProps) => {
    return (
        <div className="flex-1 flex flex-col bg-neutral-950">
            {/* Canvas Toolbar */}
            <div className="h-12 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900/30">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                        <Type className="w-4 h-4 mr-2" />
                        Text
                    </Button>
                    <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                        <ImageIcon className="w-4 h-4 mr-2" />
                        Media
                    </Button>
                    <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Effects
                    </Button>
                    <Button variant="ghost" size="sm" className="text-neutral-400 hover:text-white">
                        <Layers className="w-4 h-4 mr-2" />
                        Layers
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                        <ZoomOut className="w-4 h-4" />
                    </Button>
                    <span className="text-xs text-neutral-400 w-12 text-center">{zoom}%</span>
                    <Button variant="ghost" size="icon" className="text-neutral-400 hover:text-white">
                        <ZoomIn className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Video Preview */}
            <div className="flex-1 flex items-center justify-center p-8 relative">
                <div className="relative max-w-full max-h-full">
                    <video
                        ref={videoRef}
                        src={session.videoMetadata.videoUrl}
                        className="max-h-full max-w-full rounded-lg shadow-2xl"
                        style={{
                            aspectRatio: `${session.videoMetadata.width}/${session.videoMetadata.height}`,
                        }}
                    />

                    {/* Overlay Preview */}
                    {playbackState.captionStyle && (
                        <div className="absolute inset-0 pointer-events-none">
                            <div
                                className="absolute bg-black/80 text-white px-4 py-2 rounded-lg text-sm"
                                style={{
                                    left: `${playbackState.captionStyle.position.x}%`,
                                    top: `${playbackState.captionStyle.position.y}%`,
                                    transform: "translate(-50%, -50%)",
                                }}
                            >
                                [Caption]
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
