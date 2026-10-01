import React, { useState, useEffect } from "react";
import {
  Mic,
  MicOff,
  Webcam,
  VideoOff,
  ChevronUp,
  Check,
  ScreenShare,
  Monitor,
  Paintbrush,
  X,
  Settings,
} from "lucide-react";
import { Button } from "@gaki/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@gaki/ui/dropdown-menu";
import { cn } from "@gaki/core/lib/utils";
import { StreamConfigurationModal } from "@/features/stream/ui/StreamConfigurationModal";
import { useMediaStore } from "@/stores/media.store";
import { useStreamStore } from "@/stores/stream.store";
import { useShallow } from "zustand/react/shallow";
import { ShortcutTooltip } from "@gaki/ui/shortcut-tooltip";
import { ScreenSourceSelector } from "@/features/stream/ui/ScreenSourceSelector";
import { useGoLiveStore } from "@/stores/goLive.store";
import { AudioSettingsDialog } from "./AudioSettingsDialog";
import { VideoSettingsDialog } from "./VideoSettingsDialog";

interface MediaControlsProps {
  onStartStream?: () => void;
  onStopStream?: () => void;
  onToggleRecord?: () => void;
  onStreamSettingsSave?: (url: string, key: string) => void;
  streamStatus?: string;
  isConnecting?: boolean;
  isBroadcasting?: boolean;
  /**
   * Which slice of the controls to render, so the host can place the device
   * controls and the broadcast controls in separate groups.
   * Render each part at most once.
   */
  part?: "all" | "devices" | "broadcast";
}

export const MediaControls: React.FC<MediaControlsProps> = ({
  onStartStream,
  onStopStream,
  onToggleRecord,
  onStreamSettingsSave,
  streamStatus: propStreamStatus,
  isConnecting: propIsConnecting,
  isBroadcasting: propIsBroadcasting,
  part = "all",
}) => {
  const showDevices = part === "all" || part === "devices";
  const showBroadcast = part === "all" || part === "broadcast";
  // GoLive auto-open support
  const { shouldOpenStreamConfig, clearGoLive } = useGoLiveStore();
  const [goLiveModalOpen, setGoLiveModalOpen] = useState(false);

  useEffect(() => {
    if (showBroadcast && shouldOpenStreamConfig) {
      clearGoLive();
      setGoLiveModalOpen(true);
    }
  }, [shouldOpenStreamConfig, clearGoLive, showBroadcast]);

  // Local state
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState(false);
  const [isAudioSettingsOpen, setIsAudioSettingsOpen] = useState(false);
  const [isVideoSettingsOpen, setIsVideoSettingsOpen] = useState(false);

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
    })),
  );

  const {
    isBroadcasting,
    isConnecting,
    streamStatus,
  } = useStreamStore(
    useShallow((state) => ({
      isBroadcasting: state.isBroadcasting,
      isConnecting: state.isConnecting,
      streamStatus: state.streamStatus,
    })),
  );

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
      {showDevices && (
        <div className="flex items-center gap-1.5" role="group" aria-label="Input Sources">
          {/* Audio Controls Capsule */}
          <div
            className={cn(
              "flex items-center h-8 rounded-xl border transition-all duration-200",
              isAudioOn
                ? "bg-transparent border-black/[0.08] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white"
                : "bg-red-500/[0.04] border-red-500/40 text-red-500 dark:text-red-400 hover:border-red-500/60 shadow-[0_0_8px_-2px_rgba(239,68,68,0.35)]"
            )}
            role="group"
            aria-label="Microphone Controls"
          >
            <ShortcutTooltip
              label={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
              shortcut="toggleMic"
            >
              <button
                type="button"
                className="h-full px-2 rounded-l-xl flex items-center justify-center transition-colors focus-visible:outline-none"
                onClick={() => setAudioOn(!isAudioOn)}
                aria-label={isAudioOn ? "Mute Microphone" : "Unmute Microphone"}
              >
                {isAudioOn ? (
                  <Mic className="w-3.5 h-3.5" />
                ) : (
                  <MicOff className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                )}
              </button>
            </ShortcutTooltip>
            <div className={cn("w-px h-3.5", isAudioOn ? "bg-black/[0.08] dark:bg-white/[0.08]" : "bg-red-500/30")} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-full px-1.5 rounded-r-xl flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none"
                  aria-label="Microphone options"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="center"
                className="bg-white/95 dark:bg-[#0f0f14]/95 backdrop-blur-2xl border border-zinc-200 dark:border-white/[0.1] rounded-xl shadow-2xl max-h-64 overflow-y-auto text-zinc-900 dark:text-white"
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
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-white/[0.08]" />
                <DropdownMenuItem
                  onClick={() => setIsAudioSettingsOpen(true)}
                  className="text-xs"
                >
                  <Settings className="w-3 h-3 mr-2" />
                  Audio Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Video Controls Capsule */}
          <div
            className={cn(
              "flex items-center h-8 rounded-xl border transition-all duration-200",
              isVideoOn
                ? "bg-transparent border-black/[0.08] dark:border-white/[0.08] hover:border-black/20 dark:hover:border-white/20 text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white"
                : "bg-red-500/[0.04] border-red-500/40 text-red-500 dark:text-red-400 hover:border-red-500/60 shadow-[0_0_8px_-2px_rgba(239,68,68,0.35)]"
            )}
            role="group"
            aria-label="Camera Controls"
          >
            <ShortcutTooltip
              label={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
              shortcut="toggleCamera"
            >
              <button
                type="button"
                className="h-full px-2 rounded-l-xl flex items-center justify-center transition-colors focus-visible:outline-none"
                onClick={() => setVideoOn(!isVideoOn)}
                aria-label={isVideoOn ? "Turn Camera Off" : "Turn Camera On"}
              >
                {isVideoOn ? (
                  <Webcam className="w-3.5 h-3.5" />
                ) : (
                  <VideoOff className="w-3.5 h-3.5 text-red-500 dark:text-red-400" />
                )}
              </button>
            </ShortcutTooltip>
            <div className={cn("w-px h-3.5", isVideoOn ? "bg-black/[0.08] dark:bg-white/[0.08]" : "bg-red-500/30")} />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="h-full px-1.5 rounded-r-xl flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity focus-visible:outline-none"
                  aria-label="Camera options"
                >
                  <ChevronUp className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="top"
                align="center"
                className="bg-white/95 dark:bg-[#0f0f14]/95 backdrop-blur-2xl border border-zinc-200 dark:border-white/[0.1] rounded-xl shadow-2xl max-h-64 overflow-y-auto text-zinc-900 dark:text-white"
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
                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-white/[0.08]" />
                <DropdownMenuItem
                  onClick={() => setIsVideoSettingsOpen(true)}
                  className="text-xs"
                >
                  <Settings className="w-3 h-3 mr-2" />
                  Video Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Screen Share */}
          <DropdownMenu>
            <ShortcutTooltip
              label="Share Screen or Canvas"
              shortcut="screenShare"
            >
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "group relative rounded-xl h-8 w-8 transition-all duration-200",
                    screenShareMode !== "off"
                      ? "border border-primary/50 text-primary bg-transparent after:absolute after:bottom-1 after:left-2 after:right-2 after:h-[1.5px] after:bg-primary after:rounded-full after:shadow-[0_0_6px_rgba(var(--primary),0.8)]"
                      : "text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-transparent hover:border-black/10 dark:hover:border-white/15 hover:bg-black/[0.04] dark:hover:bg-white/[0.04]",
                  )}
                >
                  <ScreenShare className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
            </ShortcutTooltip>
            <DropdownMenuContent
              side="top"
              align="center"
              className="bg-white/95 dark:bg-[#0f0f14]/95 backdrop-blur-2xl border border-zinc-200 dark:border-white/[0.1] rounded-xl shadow-2xl text-zinc-900 dark:text-white"
              style={{ zIndex: 2015 }}
            >
              <DropdownMenuItem
                onClick={() => {
                  const isElectron = !!(window as any).electron;
                  if (isElectron) {
                    setTimeout(() => setIsSourceSelectorOpen(true), 0);
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
            onOpenChange={(open) => setIsSourceSelectorOpen(open)}
            onSelect={(sourceId) => {
              setSelectedScreenSourceId(sourceId);
              setScreenShareMode("screen");
              setIsSourceSelectorOpen(false);
            }}
          />

          <AudioSettingsDialog
            open={isAudioSettingsOpen}
            onOpenChange={setIsAudioSettingsOpen}
          />
          <VideoSettingsDialog
            open={isVideoSettingsOpen}
            onOpenChange={setIsVideoSettingsOpen}
          />
        </div>
      )}

      {showBroadcast && (
        <div className="flex items-center shrink-0" role="group" aria-label="Broadcast Actions">
          <StreamConfigurationModal
            onStartStream={onStartStream}
            onStopStream={onStopStream}
            externalOpen={goLiveModalOpen}
            onOpenChange={setGoLiveModalOpen}
          />
        </div>
      )}
    </>
  );
};
