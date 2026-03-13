import React, { useState, useEffect } from "react";
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
import { ScreenSourceSelector } from "@/features/stream/ui/ScreenSourceSelector";
import { useGoLiveStore } from "@/stores/goLive.store";


interface MediaControlsProps {
  onStartStream?: () => void;
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
  // GoLive auto-open support
  const { shouldOpenStreamConfig, clearGoLive } = useGoLiveStore();
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);

  useEffect(() => {
    if (shouldOpenStreamConfig) {
      setGoLiveModalOpen(true);
      clearGoLive();
    }
  }, [shouldOpenStreamConfig, clearGoLive]);

  // Local state for Smart Switch
  const [isSmartSwitchEnabled, setIsSmartSwitchEnabled] = useState(false);
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState(false);
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
    setSelectedScreenSourceId, // ADDED
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
      setSelectedScreenSourceId: state.setSelectedScreenSourceId, // ADDED
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

  // Helper to toggle device selection (select if new, deselect if same)
  const handleAudioSelect = (deviceId: string) => {
    if (selectedAudioDevice === deviceId) {
      setSelectedAudioDevice(undefined as unknown as string); // Cast to allow undefined if strict
    } else {
      setSelectedAudioDevice(deviceId);
    }
  };

  const handleVideoSelect = (deviceId: string) => {
    if (selectedVideoDevice === deviceId) {
      setSelectedVideoDevice(undefined as unknown as string); // Cast to allow undefined if strict
    } else {
      setSelectedVideoDevice(deviceId);
    }
  };

  return (
    <>
      {/* Audio Controls */}
      <div
        className="flex items-center"
        role="group"
        aria-label="Microphone Controls"
      >
        <ShortcutTooltip
          label={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
          shortcut="toggleMic"
        >
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200"
            onClick={() => setAudioOn(!isAudioOn)}
          >
            {isAudioOn ? (
              <Mic className="h-3.5 w-3.5" />
            ) : (
              <MicOff className="h-3.5 w-3.5 text-destructive" />
            )}
          </Button>
        </ShortcutTooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg h-5 w-5 hover:bg-foreground/5 dark:hover:bg-white/10 -ml-1"
            >
              <ChevronUp className="w-2.5 h-2.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="center"
            className="bg-background/95 backdrop-blur-2xl border-border/20 dark:border-white/10 rounded-xl shadow-xl max-h-64 overflow-y-auto"
            style={{ zIndex: 2015 }}
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
                  onClick={() => handleAudioSelect(device.deviceId)}
                  className="text-xs"
                >
                  {device.deviceId === selectedAudioDevice && (
                    <Check className="w-3 h-3 mr-2" />
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
        className="flex items-center"
        role="group"
        aria-label="Camera Controls"
      >
        <ShortcutTooltip
          label={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
          shortcut="toggleCamera"
        >
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200"
            onClick={() => setVideoOn(!isVideoOn)}
          >
            {isVideoOn ? (
              <Webcam className="h-3.5 w-3.5" />
            ) : (
              <VideoOff className="h-3.5 w-3.5 text-destructive" />
            )}
          </Button>
        </ShortcutTooltip>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-lg h-5 w-5 hover:bg-foreground/5 dark:hover:bg-white/10 -ml-1"
            >
              <ChevronUp className="w-2.5 h-2.5 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="top"
            align="center"
            className="bg-background/95 backdrop-blur-2xl border-border/20 dark:border-white/10 rounded-xl shadow-xl max-h-64 overflow-y-auto"
            style={{ zIndex: 2015 }}
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
                  onClick={() => handleVideoSelect(device.deviceId)}
                  className="text-xs"
                >
                  {device.deviceId === selectedVideoDevice && (
                    <Check className="w-3 h-3 mr-2" />
                  )}
                  {device.label || `Camera ${i + 1}`}
                </DropdownMenuItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />

      {/* Recording Control */}
      <ShortcutTooltip
        label={isRecording ? "Stop Recording" : "Start Recording"}
      >
        <Button
          variant={isRecording ? "destructive" : "ghost"}
          size={isRecording ? "sm" : "icon"}
          onClick={handleRecordClick}
          className={cn(
            "rounded-xl transition-all duration-300",
            isRecording
              ? "h-8 px-2.5 gap-1.5"
              : "h-8 w-8 hover:bg-destructive/10 text-destructive hover:text-destructive"
          )}
        >
          {isRecording ? (
            <>
              <Square className="w-3 h-3 fill-current" />
              <span className="font-mono text-[10px] tabular-nums">
                {formatDuration(recordingDuration)}
              </span>
            </>
          ) : (
            <Circle className="w-3.5 h-3.5" />
          )}
        </Button>
      </ShortcutTooltip>

      <StreamConfigurationModal
        onStartStream={onStartStream}
        onStopStream={onStopStream}
      />

      <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />

      {/* Smart Switch */}
      <ShortcutTooltip label="Smart Scene Switch" shortcut="smartSwitch">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200",
            isSmartSwitchEnabled &&
            "text-primary bg-primary/15 hover:bg-primary/20"
          )}
          onClick={onSmartSwitchToggle}
        >
          <ScanFace className="w-3.5 h-3.5" />
        </Button>
      </ShortcutTooltip>

      {/* Screen Share */}
      <DropdownMenu>
        <ShortcutTooltip label="Share Screen or Canvas" shortcut="screenShare">
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200",
                screenShareMode !== "off" && "bg-primary/15 text-primary"
              )}
            >
              <ScreenShare className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
        </ShortcutTooltip>
        <DropdownMenuContent
          side="top"
          align="center"
          className="bg-background/95 backdrop-blur-2xl border-border/20 dark:border-white/10 rounded-xl shadow-xl"
          style={{ zIndex: 2015 }}
        >
          <DropdownMenuItem
            onClick={() => {
              const isElectron = !!(window as any).electron;
              if (isElectron) {
                setIsSourceSelectorOpen(true);
              } else {
                setScreenShareMode("screen");
              }
            }}
            className="text-xs"
          >
            <Monitor className="w-3 h-3 mr-2" />
            Screen
            {screenShareMode === "screen" && (
              <Check className="w-3 h-3 ml-auto" />
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setScreenShareMode("canvas")}
            className="text-xs"
          >
            <Paintbrush className="w-3 h-3 mr-2" />
            Canvas
            {screenShareMode === "canvas" && (
              <Check className="w-3 h-3 ml-auto" />
            )}
          </DropdownMenuItem>
          {screenShareMode !== "off" && (
            <DropdownMenuItem
              className="text-destructive text-xs"
              onClick={() => setScreenShareMode("off")}
            >
              <X className="w-3 h-3 mr-2" />
              Stop Sharing
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <ScreenSourceSelector
        isOpen={isSourceSelectorOpen}
        onOpenChange={setIsSourceSelectorOpen}
        onSelect={(sourceId) => {
          setSelectedScreenSourceId(sourceId);
          setScreenShareMode("screen");
          setIsSourceSelectorOpen(false);
        }}
      />
    </>
  );
};
