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
        <DialogContent className="sm:max-w-sm bg-background border-border/30 p-6">
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-medium tracking-tight">
              Download for Desktop
            </DialogTitle>
          </DialogHeader>
          
          <div className="flex justify-center gap-6 py-6">
            {/* Windows */}
            <button
              onClick={() => window.open(downloads.windows, "_blank")}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-foreground/80 group-hover:text-foreground transition-colors" fill="currentColor">
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801"/>
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">Windows</div>
                <div className="text-[10px] text-muted-foreground">.exe</div>
              </div>
            </button>

            {/* macOS */}
            <button
              onClick={() => window.open(downloads.mac, "_blank")}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-foreground/80 group-hover:text-foreground transition-colors" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">macOS</div>
                <div className="text-[10px] text-muted-foreground">.dmg</div>
              </div>
            </button>

            {/* Linux */}
            <button
              onClick={() => window.open(downloads.linux, "_blank")}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-foreground/80 group-hover:text-foreground transition-colors" fill="currentColor">
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489.117.779.456 1.51 1.028 2.104.59.604 1.331 1.081 2.132 1.42.788.338 1.652.546 2.486.699 1.2.22 2.362.341 3.339.479.908.129 1.664.296 2.164.529.486.226.711.477.711.908 0 .304-.091.577-.257.839-.167.26-.401.5-.695.728-.31.24-.68.458-1.09.659-.53.26-1.133.489-1.772.689-.59.185-1.226.354-1.874.491-.65.137-1.315.242-1.941.323-.64.081-1.241.138-1.759.178-.67.052-1.233.08-1.6.08-.168 0-.317-.004-.442-.012-.086-.005-.16-.013-.221-.023-.046-.008-.087-.017-.118-.03-.024-.01-.041-.02-.053-.033-.01-.012-.015-.025-.013-.042.002-.019.014-.041.036-.068.024-.03.061-.063.11-.1.056-.042.127-.088.213-.137.1-.057.218-.117.35-.18.266-.127.589-.262.948-.404.364-.145.771-.297 1.2-.455.433-.16.893-.327 1.361-.498.473-.173.961-.353 1.441-.538.484-.187.963-.379 1.417-.576.456-.198.893-.401 1.289-.61.4-.211.763-.428 1.077-.651.315-.225.588-.458.803-.699.215-.242.378-.495.48-.759.1-.263.141-.539.122-.832-.019-.294-.102-.602-.251-.932-.149-.331-.361-.681-.636-1.05-.274-.368-.61-.752-1.003-1.148-.393-.397-.843-.805-1.345-1.218-.502-.413-1.057-.83-1.658-1.246-.6-.416-1.247-.83-1.933-1.238-.687-.408-1.413-.809-2.17-1.197-.758-.388-1.548-.764-2.362-1.122-.815-.357-1.656-.697-2.51-1.012-.856-.316-1.727-.608-2.602-.873-.876-.265-1.757-.503-2.632-.712-.876-.21-1.748-.393-2.603-.546-.856-.154-1.696-.28-2.508-.376-.813-.097-1.6-.165-2.347-.203C.93.09.285.07 0 .07v-.07h.004c.156 0 .315.008.48.021 4.226.333 3.105 4.807 3.17 6.298.076 1.092.3 1.953 1.05 3.02.885 1.051 2.127 2.75 2.716 4.521.278.832.41 1.684.287 2.489-.117.779-.456 1.51-1.028 2.104-.59.604-1.331 1.081-2.132 1.42-.788.338-1.652.546-2.486.699-1.2.22-2.362.341-3.339.479-.908.129-1.664.296-2.164.529-.486.226-.711.477-.711.908 0 .304.091.577.257.839.167.26.401.5.695.728.31.24.68.458 1.09.659.53.26 1.133.489 1.772.689.59.185 1.226.354 1.874.491.65.137 1.315.242 1.941.323.64.081 1.241.138 1.759.178.67.052 1.233.08 1.6.08.168 0 .317-.004.442-.012.086-.005.16-.013.221-.023.046-.008.087-.017.118-.03.024-.01.041-.02.053-.033.01-.012.015-.025.013-.042-.002-.019-.014-.041-.036-.068-.024-.03-.061-.063-.11-.1-.056-.042-.127-.088-.213-.137-.1-.057-.218-.117-.35-.18-.266-.127-.589-.262-.948-.404-.364-.145-.771-.297-1.2-.455-.433-.16-.893-.327-1.361-.498-.473-.173-.961-.353-1.441-.538-.484-.187-.963-.379-1.417-.576-.456-.198-.893-.401-1.289-.61-.4-.211-.763-.428-1.077-.651-.315-.225-.588-.458-.803-.699-.215-.242-.378-.495-.48-.759-.1-.263-.141-.539-.122-.832.019-.294.102-.602.251-.932.149-.331.361-.681.636-1.05.274-.368.61-.752 1.003-1.148.393-.397.843-.805 1.345-1.218.502-.413 1.057-.83 1.658-1.246.6-.416 1.247-.83 1.933-1.238.687-.408 1.413-.809 2.17-1.197.758-.388 1.548-.764 2.362-1.122.815-.357 1.656-.697 2.51-1.012.856-.316 1.727-.608 2.602-.873.876-.265 1.757-.503 2.632-.712.876-.21 1.748-.393 2.603-.546.856-.154 1.696-.28 2.508-.376.813-.097 1.6-.165 2.347-.203.748-.039 1.393-.059 1.678-.059z"/>
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">Linux</div>
                <div className="text-[10px] text-muted-foreground">.AppImage</div>
              </div>
            </button>
          </div>

          <div className="text-center text-[11px] text-muted-foreground pt-2 border-t border-border/30">
            <span className="opacity-60">v0.0.0</span>
            <span className="mx-2 opacity-30">•</span>
            <a
              href="https://github.com/Negi97Mohit/caption-cam/releases/latest"
              target="_blank"
              className="opacity-60 hover:opacity-100 hover:text-foreground transition-opacity"
            >
              Release Notes
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          "fixed bottom-4 left-1/2 -translate-x-1/2 backdrop-blur-xl rounded-full transition-all duration-300 ease-out shadow-2xl",
          "bg-card/80 border border-border/60 dark:bg-card/70 dark:border-border/40",
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
