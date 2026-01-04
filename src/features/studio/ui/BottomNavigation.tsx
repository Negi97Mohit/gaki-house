import React, { useEffect, useState } from "react";
import {
  Mic,
  MicOff,
  Webcam,
  VideoOff,
  ScreenShare,
  ChevronUp,
  Check,
  Expand,
  Shrink,
  SlidersHorizontal,
  X,
  Monitor,
  Paintbrush,
  Undo2,
  Redo2,
  RotateCcw,
  ScanFace,
  Download,
  Sparkles,
  Command, // For Mac Icon
  Terminal, // For Linux Icon
  AppWindow, // For Windows Icon
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog"; // Ensure you have this component
import { cn } from "@/shared/lib/utils";
import { LayoutMode, CameraShape, GeneratedOverlay } from "@/types/caption";
import { AICommandPopover } from "@/features/ai-assistant/ui/AICommandPopover";
import { StreamConfigurationModal } from "@/features/stream/ui/StreamConfigurationModal";

interface BottomNavigationProps {
  onOpenSettings: () => void;
  onOpenSessions: () => void;
  onSaveLayout: () => void;
  onOpenAnimationLibrary: () => void;
  isAudioOn: boolean;
  onAudioToggle: (on: boolean) => void;
  audioDevices: MediaDeviceInfo[];
  onAudioDeviceSelect: (deviceId: string) => void;
  selectedAudioDevice: string | undefined;
  isVideoOn: boolean;
  onVideoToggle: (on: boolean) => void;
  videoDevices: MediaDeviceInfo[];
  onVideoDeviceSelect: (deviceId: string) => void;
  selectedVideoDevice: string | undefined;
  screenShareMode: "off" | "screen" | "canvas";
  onScreenShareModeChange: (mode: "off" | "screen" | "canvas") => void;
  isRecording: boolean;
  onRecordingToggle: () => void;
  isBroadcasting: boolean;
  onBroadcastToggle: () => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;
  layoutMode: LayoutMode;
  cameraShape: CameraShape;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onCameraShapeChange: (shape: CameraShape) => void;
  onCustomMaskUpload?: (file: File) => void;
  portalContainer?: HTMLElement | null;
  splitRatio: number;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  onSplitRatioChange: (ratio: number) => void;
  onPipPositionChange: (position: { x: number; y: number }) => void;
  onPipSizeChange: (size: { width: number; height: number }) => void;
  customMaskUrl?: string;
  isMouseActive: boolean;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onResetScene: () => void;
  canvasLayout: any;

  // Smart Switch Props
  isSmartSwitchEnabled: boolean;
  onSmartSwitchToggle: () => void;

  // AI Props
  onAiCommandSubmit: (text: string, targetId: string | null) => void;
  isAiProcessing: boolean;
  activeOverlays: GeneratedOverlay[];
  isAiModeEnabled?: boolean;
  onAiModeToggle?: (enabled: boolean) => void;
  captionsEnabled?: boolean;
  onCaptionsToggle?: (enabled: boolean) => void;
  hasAiPopoverAutoOpenedRef: React.RefObject<boolean>;

  // Optional: Callback for saving stream settings
  onStreamSettingsSave?: (url: string, key: string) => void;
  onStartStream?: (url: string, key: string) => void;
  onStopStream?: () => void;
  isConnecting?: boolean;
  streamStatus?: string;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  isMouseActive,
  onOpenSettings,
  onOpenSessions,
  onSaveLayout,
  onOpenAnimationLibrary,
  isAudioOn,
  onAudioToggle,
  audioDevices,
  onAudioDeviceSelect,
  selectedAudioDevice,
  isVideoOn,
  onVideoToggle,
  videoDevices,
  onVideoDeviceSelect,
  selectedVideoDevice,
  screenShareMode,
  onScreenShareModeChange,
  isRecording,
  onRecordingToggle,
  isBroadcasting,
  onBroadcastToggle,
  onToggleFullscreen,
  isFullscreen,
  portalContainer,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onResetScene,
  canvasLayout,
  layoutMode,
  isSmartSwitchEnabled,
  onSmartSwitchToggle,
  onAiCommandSubmit,
  isAiProcessing,
  activeOverlays,
  isAiModeEnabled,
  onAiModeToggle,
  captionsEnabled,
  onCaptionsToggle,
  hasAiPopoverAutoOpenedRef,
  onStreamSettingsSave,
  onStartStream,
  onStopStream,
  isConnecting,
  streamStatus,
  ..._unusedProps
}) => {
  const [isElectron, setIsElectron] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  useEffect(() => {
    const checkElectron =
      (window as any).electron?.isElectron ||
      /Electron/.test(navigator.userAgent);
    setIsElectron(!!checkElectron);
  }, []);

  const handleFullscreenToggle = () => {
    if (isElectron && (window as any).electron?.toggleFullscreen) {
      (window as any).electron.toggleFullscreen();
    } else {
      onToggleFullscreen();
    }
  };

  // --- DOWNLOAD LINKS ---
  // Note: GitHub "latest/download/" links automatically redirect to the file in the latest release.
  // I updated the filenames to match exactly what you built.
  const BASE_URL =
    "https://github.com/Negi97Mohit/caption-cam/releases/latest/download";

  const downloads = {
    windows: `${BASE_URL}/CaptionCam-Studio-Setup-0.0.0.exe`,
    mac: `${BASE_URL}/CaptionCam-Studio-0.0.0-arm64.dmg`,
    linux: `${BASE_URL}/CaptionCam-Studio-0.0.0.AppImage`,
  };

  return (
    <>
      {/* --- DOWNLOAD MODAL --- */}
      <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
        <DialogContent className="sm:max-w-md bg-background/95 backdrop-blur-xl border-border/50">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold">
              Download Desktop App
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 gap-4 py-4">
            <Button
              variant="outline"
              className="h-14 justify-start gap-4 hover:bg-blue-500/10 hover:text-blue-500 hover:border-blue-500/50 transition-all"
              onClick={() => window.open(downloads.windows, "_blank")}
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <AppWindow className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">Windows</span>
                <span className="text-xs text-muted-foreground">
                  .exe (x64)
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-14 justify-start gap-4 hover:bg-primary/10 hover:border-primary/50 transition-all"
              onClick={() => window.open(downloads.mac, "_blank")}
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <Command className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">macOS</span>
                <span className="text-xs text-muted-foreground">
                  .dmg (Apple Silicon)
                </span>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-14 justify-start gap-4 hover:bg-orange-500/10 hover:text-orange-500 hover:border-orange-500/50 transition-all"
              onClick={() => window.open(downloads.linux, "_blank")}
            >
              <div className="bg-primary/10 p-2 rounded-lg">
                <Terminal className="w-6 h-6" />
              </div>
              <div className="flex flex-col items-start">
                <span className="font-semibold">Linux</span>
                <span className="text-xs text-muted-foreground">.AppImage</span>
              </div>
            </Button>
          </div>
          <div className="text-center text-xs text-muted-foreground pt-2">
            Version 0.0.0 •{" "}
            <a
              href="https://github.com/Negi97Mohit/caption-cam/releases/latest"
              target="_blank"
              className="underline hover:text-primary"
            >
              View Release Notes
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 bg-background/40 backdrop-blur-xl border border-border/40 rounded-full transition-all duration-300 ease-out shadow-2xl",
          isMouseActive
            ? "opacity-100 translate-y-0"
            : "opacity-0 translate-y-8 pointer-events-none"
        )}
        style={{ zIndex: "var(--z-floating-controls)" }}
      >
        <div className="flex items-center gap-1 px-2 py-2">
          {/* --- DOWNLOAD BUTTON (Triggers Modal) --- */}
          {!isElectron && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10 hover:bg-background/60 text-blue-500 hover:text-blue-400"
                onClick={() => setIsDownloadOpen(true)}
                title="Download Desktop App"
              >
                <Download className="w-4 h-4" />
              </Button>
              <div className="w-px h-6 bg-border/40 mx-1" />
            </>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-background/60"
            onClick={onOpenSettings}
            title="Settings"
            data-floating-trigger="true"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border/40 mx-1" />

          {/* ... [Rest of your buttons: Undo, Redo, Reset] ... */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-background/60 disabled:opacity-30"
              onClick={onUndo}
              disabled={!canUndo}
              title="Undo"
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-background/60 disabled:opacity-30"
              onClick={onRedo}
              disabled={!canRedo}
              title="Redo"
            >
              <Redo2 className="w-4 h-4" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-background/60 text-destructive hover:text-destructive"
              onClick={onResetScene}
              title="Reset Scene"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>

          <div className="w-px h-6 bg-border/40 mx-1" />

          {/* ... [Audio Controls] ... */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-background/60"
              onClick={() => onAudioToggle(!isAudioOn)}
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
                      onClick={() => onAudioDeviceSelect(device.deviceId)}
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

          {/* ... [Video Controls] ... */}
          <div className="flex items-center gap-0.5">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-background/60"
              onClick={() => onVideoToggle(!isVideoOn)}
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
                      onClick={() => onVideoDeviceSelect(device.deviceId)}
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
                title="Share"
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
                onClick={() => onScreenShareModeChange("screen")}
                className="text-sm"
              >
                <Monitor className="w-3.5 h-3.5 mr-2" />
                Screen
                {screenShareMode === "screen" && (
                  <Check className="w-3.5 h-3.5 ml-auto" />
                )}
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onScreenShareModeChange("canvas")}
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
                  onClick={() => onScreenShareModeChange("off")}
                >
                  <X className="w-3.5 h-3.5 mr-2" />
                  Stop
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="w-px h-6 bg-border/40 mx-1" />

          <div
            id="layout-controls-slot"
            className="flex items-center gap-1"
          ></div>

          <AICommandPopover
            onSubmit={onAiCommandSubmit}
            isProcessing={isAiProcessing}
            activeOverlays={activeOverlays}
            isFullscreen={isFullscreen}
            isAiModeEnabled={isAiModeEnabled}
            onAiModeToggle={onAiModeToggle}
            captionsEnabled={captionsEnabled}
            onCaptionsToggle={onCaptionsToggle}
            portalContainer={portalContainer}
            hasAiPopoverAutoOpenedRef={hasAiPopoverAutoOpenedRef}
          >
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full h-10 w-10 hover:bg-background/60 text-yellow-500 hover:text-yellow-600"
              title="AI Assistant"
            >
              <Sparkles className="w-4 h-4" />
            </Button>
          </AICommandPopover>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-background/60"
            onClick={handleFullscreenToggle}
            title={isFullscreen ? "Exit" : "Fullscreen"}
          >
            {isFullscreen ? (
              <Shrink className="h-4 w-4" />
            ) : (
              <Expand className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </>
  );
};
