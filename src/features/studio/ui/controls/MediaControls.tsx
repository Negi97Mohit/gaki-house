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
  Circle,
  Square,
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
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";

interface MediaControlsProps {
  onStartStream?: (url: string, key: string) => void;
  onStopStream?: () => void;
  onToggleRecord?: () => void;
  onStreamSettingsSave?: (url: string, key: string) => void;
  streamStatus?: string;
  isConnecting?: boolean;
  isBroadcasting?: boolean;
}

const formatDuration = (seconds: number) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s
    .toString()
    .padStart(2, "0")}`;
};

export const MediaControls: React.FC<MediaControlsProps> = ({
  onStartStream,
  onStopStream,
  onToggleRecord,
  onStreamSettingsSave,
  streamStatus: propStreamStatus,
  isConnecting: propIsConnecting,
  isBroadcasting: propIsBroadcasting,
}) => {
  // Local state for Smart Switch
  const [isSmartSwitchEnabled, setIsSmartSwitchEnabled] = useState(false);
  const onSmartSwitchToggle = () => setIsSmartSwitchEnabled((prev) => !prev);

  // Store hooks
  const {
    isAudioOn,
    setAudioOn,
    audioDevices,
    selectedAudioDevice,
    setSelectedAudioDevice,
    isVideoOn,
    setVideoOn,
    videoDevices,
    selectedVideoDevice,
    setSelectedVideoDevice,
    screenShareMode,
    setScreenShareMode,
  } = useMediaStore(
    useShallow((state) => ({
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
    }))
  );

  const {
    isBroadcasting,
    isConnecting,
    streamStatus,
    isRecording,
    recordingDuration,
  } = useStreamStore(
    useShallow((state) => ({
      isBroadcasting: state.isBroadcasting,
      isConnecting: state.isConnecting,
      streamStatus: state.streamStatus,
      isRecording: state.isRecording,
      recordingDuration: state.recordingDuration,
    }))
  );

  // --- DEBUG HANDLER ---
  const handleRecordClick = () => {
    console.log("--- DEBUG: Record Button Clicked ---");
    console.log("isRecording State:", isRecording);

    if (onToggleRecord) {
      console.log("onToggleRecord prop exists. Calling it...");
      onToggleRecord();
    } else {
      console.error(
        "ERROR: onToggleRecord prop is UNDEFINED. Check parent component!"
      );
    }
  };

  return (
    <>
      <div
        className="flex items-center gap-0.5"
        role="group"
        aria-label="Microphone Controls"
      >
        <ShortcutTooltip label={isAudioOn ? "Mute Microphone" : "Unmute Microphone"} shortcut="toggleMic">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-background/60"
            onClick={() => setAudioOn(!isAudioOn)}
          >
            {isAudioOn ? (
              <Mic className="h-4 w-4" />
            ) : (
              <MicOff className="h-4 w-4 text-red-500" />
            )}
          </Button>
        </ShortcutTooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-7 w-7 hover:bg-background/60"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="center"
            className="bg-background/95 backdrop-blur-xl border-border/40 max-h-64 overflow-y-auto"
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
      <div
        className="flex items-center gap-0.5"
        role="group"
        aria-label="Camera Controls"
      >
        <ShortcutTooltip label={isVideoOn ? "Turn Camera Off" : "Turn Camera On"} shortcut="toggleCamera">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-background/60"
            onClick={() => setVideoOn(!isVideoOn)}
          >
            {isVideoOn ? (
              <Webcam className="h-4 w-4" />
            ) : (
              <VideoOff className="h-4 w-4 text-red-500" />
            )}
          </Button>
        </ShortcutTooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-7 w-7 hover:bg-background/60"
            >
              <ChevronUp className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="center"
            className="bg-background/95 backdrop-blur-xl border-border/40 max-h-64 overflow-y-auto"
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

      <div className="w-px h-6 bg-border mx-1" />

      {/* --- RECORDING CONTROL --- */}
      <ShortcutTooltip label={isRecording ? "Stop Recording" : "Start Recording"}>
        <Button
          variant={isRecording ? "destructive" : "ghost"}
          size={isRecording ? "default" : "icon"}
          onClick={handleRecordClick}
          className={cn(
            "rounded-full transition-all duration-300",
            isRecording
              ? "px-3"
              : "h-10 w-10 hover:bg-red-500/10 text-red-500 hover:text-red-600"
          )}
        >
          {isRecording ? (
            <>
              <Square className="w-3.5 h-3.5 mr-2 fill-current" />
              <span className="font-mono text-xs tabular-nums">
                {formatDuration(recordingDuration)}
              </span>
            </>
          ) : (
            <Circle className="w-4 h-4" />
          )}
        </Button>
      </ShortcutTooltip>

      <StreamConfigurationModal
        onStartStream={onStartStream}
        onStopStream={onStopStream}
      />

      <div className="w-px h-6 bg-border mx-1" />

      <ShortcutTooltip label="Smart Scene Switch" shortcut="smartSwitch">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-full h-10 w-10 hover:bg-background/60 transition-colors",
            isSmartSwitchEnabled &&
              "text-primary bg-primary/10 hover:bg-primary/20"
          )}
          onClick={onSmartSwitchToggle}
        >
          <ScanFace className="w-4 h-4" />
        </Button>
      </ShortcutTooltip>

      <DropdownMenu>
        <ShortcutTooltip label="Share Screen or Canvas">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full h-10 w-10 hover:bg-background/60",
                screenShareMode !== "off" && "bg-primary/20 text-primary"
              )}
            >
              <ScreenShare className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
        </ShortcutTooltip>
        <DropdownMenuContent
          side="top"
          align="center"
          className="bg-background/95 backdrop-blur-xl border-border/40"
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
