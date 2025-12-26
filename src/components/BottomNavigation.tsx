import React from "react";
import {
  Mic,
  MicOff,
  Webcam,
  VideoOff,
  ScreenShare,
  ChevronUp,
  Check,
  Library,
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
} from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { AssetResult } from "@/components/AssetLibrary";
import { LayoutMode, CameraShape } from "@/types/caption";
import { useTheme } from "next-themes";
import { ToolsPopover } from "@/components/ToolsPopover";

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
  onAddTextOverlay: () => void;
  onAssetSelect: (asset: AssetResult) => void;
  setIsDrawing: (isDrawing: boolean) => void;
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

  // New Props
  isSmartSwitchEnabled: boolean;
  onSmartSwitchToggle: () => void;
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
  onAddTextOverlay,
  onAssetSelect,
  setIsDrawing,
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
  ..._unusedProps
}) => {
  const { theme, setTheme } = useTheme();

  return (
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

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 hover:bg-background/60 text-primary hover:text-primary"
          onClick={onOpenAnimationLibrary}
          title="Animation Library"
        >
          <Library className="w-4 h-4" />
        </Button>

        <div className="w-px h-6 bg-border/40 mx-1" />

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

        {/* --- Smart Scene Switch Toggle --- */}
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

        {/* Dynamic Layout Controls Slot - This allows active layouts to inject buttons here */}
        <div
          id="layout-controls-slot"
          className="flex items-center gap-1"
        ></div>

        <ToolsPopover
          onAddTextOverlay={onAddTextOverlay}
          onAssetSelect={onAssetSelect}
          setIsDrawing={setIsDrawing}
          setTheme={setTheme}
          theme={theme}
          portalContainer={portalContainer}
        />

        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 hover:bg-background/60"
          onClick={onToggleFullscreen}
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
  );
};
