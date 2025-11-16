// src/components/BottomNavigation.tsx
import React from "react";
import {
  Mic,
  MicOff,
  Webcam,
  VideoOff,
  ScreenShare,
  Circle,
  Square,
  ChevronUp,
  Check,
  Type,
  Pencil,
  Sun,
  Moon,
  Library,
  Expand,
  Shrink,
  SlidersHorizontal,
  X,
  Monitor,
  Paintbrush,
  Radio,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { LayoutControls } from "@/components/LayoutControls";
import { FloatingAssetSearch } from "@/components/FloatingAssetSearch";
import { InstructionsDialog } from "@/components/InstructionsDialog";
import { AssetResult } from "@/components/AssetLibrary";
import { LayoutMode, CameraShape } from "@/types/caption";
import { useTheme } from "next-themes";
import { ToolsPopover } from "@/components/ToolsPopover";

// Props interface combining all props needed from Index, VideoCanvas, etc.
interface BottomNavigationProps {
  // Scene & Settings Toggles
  onOpenSettings: () => void;
  onOpenSessions: () => void;
  onSaveLayout: () => void;

  // Media Controls
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

  // Screen Share
  screenShareMode: "off" | "screen" | "canvas";
  onScreenShareModeChange: (mode: "off" | "screen" | "canvas") => void;

  // Recording
  isRecording: boolean;
  onRecordingToggle: () => void;

  // Broadcasting
  isBroadcasting: boolean;
  onBroadcastToggle: () => void;

  // Right-side Controls
  onAddTextOverlay: () => void;
  onAssetSelect: (asset: AssetResult) => void;
  setIsDrawing: (isDrawing: boolean) => void;
  onToggleFullscreen: () => void;
  isFullscreen: boolean;

  // Layout Controls
  layoutMode: LayoutMode;
  cameraShape: CameraShape;
  onLayoutModeChange: (mode: LayoutMode) => void;
  onCameraShapeChange: (shape: CameraShape) => void;
  onCustomMaskUpload?: (file: File) => void;
  portalContainer?: HTMLElement | null;

  // Other props for LayoutControls
  splitRatio: number;
  pipPosition: { x: number; y: number };
  pipSize: { width: number; height: number };
  onSplitRatioChange: (ratio: number) => void;
  onPipPositionChange: (position: { x: number; y: number }) => void;
  onPipSizeChange: (size: { width: number; height: number }) => void;
  customMaskUrl?: string;
  isMouseActive: boolean;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  isMouseActive,
  onOpenSettings,
  onOpenSessions,
  onSaveLayout,
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
  ...layoutProps
}) => {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "fixed bottom-4 left-1/2 -translate-x-1/2 bg-background/40 backdrop-blur-xl border border-border/40 rounded-full transition-all duration-300 ease-out shadow-2xl",
        isMouseActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8 pointer-events-none"
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
          className="rounded-full h-10 w-10 hover:bg-background/60"
          onClick={onOpenSessions}
          title="Library"
        >
          <Library className="w-4 h-4" />
        </Button>
        
        <div className="w-px h-6 bg-border/40 mx-1" />
        
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-background/60"
            onClick={() => onAudioToggle(!isAudioOn)}
          >
            {isAudioOn ? (
              <Mic className="h-4 h-4" />
            ) : (
              <MicOff className="h-4 h-4 text-red-500" />
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
              className="bg-background/95 backdrop-blur-xl border-border/40"
              style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
            >
              {audioDevices.map((device, i) => (
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
              ))}
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
              <Webcam className="h-4 h-4" />
            ) : (
              <VideoOff className="h-4 h-4 text-red-500" />
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
              className="bg-background/95 backdrop-blur-xl border-border/40"
              style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
            >
              {videoDevices.map((device, i) => (
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
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

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
              <ScreenShare className="h-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-background/95 backdrop-blur-xl border-border/40"
            style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
          >
            <DropdownMenuItem onClick={() => onScreenShareModeChange("screen")} className="text-sm">
              <Monitor className="w-3.5 h-3.5 mr-2" />
              Screen
              {screenShareMode === "screen" && (
                <Check className="w-3.5 h-3.5 ml-auto" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onScreenShareModeChange("canvas")} className="text-sm">
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

        <Button
          size="icon"
          className={cn(
            "rounded-full h-12 w-12 transition-all shadow-lg",
            isRecording
              ? "bg-red-500 hover:bg-red-600 shadow-red-500/50"
              : "bg-primary hover:bg-primary/90 shadow-primary/30"
          )}
          onClick={onRecordingToggle}
          title={isRecording ? "Stop" : "Record"}
        >
          {isRecording ? (
            <Square className="h-5 w-5" />
          ) : (
            <Circle className="h-5 w-5 fill-current" />
          )}
        </Button>

        <Button
          size="icon"
          className={cn(
            "rounded-full h-11 w-11 transition-all",
            isBroadcasting
              ? "bg-green-500 hover:bg-green-600 shadow-lg shadow-green-500/50"
              : "hover:bg-background/60"
          )}
          variant={isBroadcasting ? "default" : "ghost"}
          onClick={onBroadcastToggle}
          title={isBroadcasting ? "Stop Broadcast" : "Broadcast"}
        >
          <Radio className={cn("h-4 w-4", isBroadcasting && "animate-pulse")} />
        </Button>
        
        <div className="w-px h-6 bg-border/40 mx-1" />

        <ToolsPopover
          onAddTextOverlay={onAddTextOverlay}
          onAssetSelect={onAssetSelect}
          setIsDrawing={setIsDrawing}
          setTheme={setTheme}
          theme={theme}
          portalContainer={layoutProps.portalContainer}
        />
        
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 hover:bg-background/60"
          onClick={onSaveLayout}
          title="Save Layout Preset"
        >
          <Library className="h-4 h-4" />
        </Button>
        
        <LayoutControls {...layoutProps} />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10 hover:bg-background/60"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit" : "Fullscreen"}
        >
          {isFullscreen ? (
            <Shrink className="h-4 h-4" />
          ) : (
            <Expand className="h-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};
