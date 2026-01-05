import React, { useState } from "react";
import {
    Mic,
    MicOff,
    Webcam,
    VideoOff,
    ChevronUp,
    Check,
    ScanFace,
    ScreenShare,
    Monitor,
    Paintbrush,
    X,
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { StreamConfigurationModal } from "@/features/stream/ui/StreamConfigurationModal";
import { useMediaStore } from "@/stores/media.store";
import { useStreamStore } from "@/stores/stream.store";
import { useShallow } from "zustand/react/shallow";

interface MediaControlsProps {
    onStartStream?: (url: string, key: string) => void;
    onStopStream?: () => void;
    onStreamSettingsSave?: (url: string, key: string) => void;
}

export const MediaControls: React.FC<MediaControlsProps> = ({
    onStartStream,
    onStopStream,
    onStreamSettingsSave,
}) => {
    // Local state for Smart Switch
    const [isSmartSwitchEnabled, setIsSmartSwitchEnabled] = useState(false);
    const onSmartSwitchToggle = () => setIsSmartSwitchEnabled((prev) => !prev);

    // Store hooks
    const {
        isAudioOn, setAudioOn,
        audioDevices, selectedAudioDevice, setSelectedAudioDevice,
        isVideoOn, setVideoOn,
        videoDevices, selectedVideoDevice, setSelectedVideoDevice,
        screenShareMode, setScreenShareMode
    } = useMediaStore(useShallow((state) => ({
        isAudioOn: state.isAudioOn,
        setAudioOn: state.setAudioOn,
        audioDevices: state.audioDevices,
        selectedAudioDevice: state.selectedAudioDevice,
        setSelectedAudioDevice: state.setSelectedAudioDevice,
        isVideoOn: state.isVideoOn,
        setVideoOn: state.setVideoOn,
        videoDevices: state.videoDevices,
        selectedVideoDevice: state.selectedVideoDevice,
        setSelectedVideoDevice: state.setSelectedVideoDevice,
        screenShareMode: state.screenShareMode,
        setScreenShareMode: state.setScreenShareMode,
    })));

    const {
        isBroadcasting,
        isConnecting,
        streamStatus,
    } = useStreamStore(useShallow((state) => ({
        isBroadcasting: state.isBroadcasting,
        isConnecting: state.isConnecting,
        streamStatus: state.streamStatus,
    })));

    return (
        <>
            <div className="flex items-center gap-0.5" role="group" aria-label="Microphone Controls">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-background/60"
                    onClick={() => setAudioOn(!isAudioOn)}
                    title={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
                    aria-label={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
                    aria-pressed={isAudioOn}
                >
                    {isAudioOn ? (
                        <Mic className="h-4 w-4" />
                    ) : (
                        <MicOff className="h-4 w-4 text-red-500" />
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-7 w-7 hover:bg-background/60"
                            aria-label="Microphone Selection"
                        >
                            <ChevronUp className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="center"
                        className="bg-background/95 backdrop-blur-xl border-border/40 max-h-64 overflow-y-auto"
                        style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
                    >
                        {audioDevices.length === 0 ? (
                            <DropdownMenuItem
                                disabled
                                className="text-xs text-muted-foreground"
                            >
                                No microphones found
                            </DropdownMenuItem>
                        ) : (
                            audioDevices.map((device, i) => (
                                <DropdownMenuItem
                                    key={device.deviceId}
                                    onClick={() => setSelectedAudioDevice(device.deviceId)}
                                    className="text-sm"
                                >
                                    {device.deviceId === selectedAudioDevice && (
                                        <Check className="w-3.5 h-3.5 mr-2" />
                                    )}
                                    {device.label || `Microphone ${i + 1}`}
                                </DropdownMenuItem>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Video Controls */}
            <div className="flex items-center gap-0.5" role="group" aria-label="Camera Controls">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-10 w-10 hover:bg-background/60"
                    onClick={() => setVideoOn(!isVideoOn)}
                    title={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                    aria-label={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
                    aria-pressed={isVideoOn}
                >
                    {isVideoOn ? (
                        <Webcam className="h-4 w-4" />
                    ) : (
                        <VideoOff className="h-4 w-4 text-red-500" />
                    )}
                </Button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full h-7 w-7 hover:bg-background/60"
                            aria-label="Camera Selection"
                        >
                            <ChevronUp className="w-3 h-3" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                        side="top"
                        align="center"
                        className="bg-background/95 backdrop-blur-xl border-border/40 max-h-64 overflow-y-auto"
                        style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
                    >
                        {videoDevices.length === 0 ? (
                            <DropdownMenuItem
                                disabled
                                className="text-xs text-muted-foreground"
                            >
                                No cameras found
                            </DropdownMenuItem>
                        ) : (
                            videoDevices.map((device, i) => (
                                <DropdownMenuItem
                                    key={device.deviceId}
                                    onClick={() => setSelectedVideoDevice(device.deviceId)}
                                    className="text-sm"
                                >
                                    {device.deviceId === selectedVideoDevice && (
                                        <Check className="w-3.5 h-3.5 mr-2" />
                                    )}
                                    {device.label || `Camera ${i + 1}`}
                                </DropdownMenuItem>
                            ))
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <StreamConfigurationModal
                isBroadcasting={isBroadcasting}
                isConnecting={isConnecting}
                status={streamStatus}
                onStartStream={onStartStream}
                onStopStream={onStopStream}
                defaultStreamUrl={
                    typeof window !== "undefined"
                        ? localStorage.getItem("stream_rtmpUrl") || undefined
                        : undefined
                }
                defaultStreamKey={
                    typeof window !== "undefined"
                        ? localStorage.getItem("stream_key") || undefined
                        : undefined
                }
                onSave={(url, key) => {
                    if (onStreamSettingsSave) onStreamSettingsSave(url, key);
                }}
            />

            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "rounded-full h-10 w-10 hover:bg-background/60 transition-colors",
                    isSmartSwitchEnabled &&
                    "text-primary bg-primary/10 hover:bg-primary/20"
                )}
                onClick={onSmartSwitchToggle}
                title={
                    isSmartSwitchEnabled
                        ? "Smart Scene Switch: ON"
                        : "Smart Scene Switch: OFF"
                }
                aria-label={
                    isSmartSwitchEnabled
                        ? "Disable Smart Scene Switch"
                        : "Enable Smart Scene Switch"
                }
                aria-pressed={isSmartSwitchEnabled}
            >
                <ScanFace className="w-4 h-4" />
            </Button>

            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn(
                            "rounded-full h-10 w-10 hover:bg-background/60",
                            screenShareMode !== "off" && "bg-primary/20 text-primary"
                        )}
                        title="Share Screen or Canvas"
                        aria-label="Screen Share Options"
                    >
                        <ScreenShare className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                    side="top"
                    align="center"
                    className="bg-background/95 backdrop-blur-xl border-border/40"
                    style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
                >
                    <DropdownMenuItem
                        onClick={() => setScreenShareMode("screen")}
                        className="text-sm"
                    >
                        <Monitor className="w-3.5 h-3.5 mr-2" />
                        Screen
                        {screenShareMode === "screen" && (
                            <Check className="w-3.5 h-3.5 ml-auto" />
                        )}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => setScreenShareMode("canvas")}
                        className="text-sm"
                    >
                        <Paintbrush className="w-3.5 h-3.5 mr-2" />
                        Canvas
                        {screenShareMode === "canvas" && (
                            <Check className="w-3.5 h-3.5 ml-auto" />
                        )}
                    </DropdownMenuItem>
                    {screenShareMode !== "off" && (
                        <DropdownMenuItem
                            className="text-red-500 text-sm"
                            onClick={() => setScreenShareMode("off")}
                        >
                            <X className="w-3.5 h-3.5 mr-2" />
                            Stop Sharing
                        </DropdownMenuItem>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
