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
        "fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-md border-t border-border transition-opacity duration-300 ease-in-out",
        "shadow-[0_-10px_25px_-15px_rgba(77,203,194,0.6)]", // ADDED: This adds the hue at the top
        isMouseActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      style={{ zIndex: "var(--z-floating-controls)" }}
    >
      {/* === CONSOLIDATED CENTER GROUP === */}
      <div className="flex items-center justify-center h-full px-4 md:px-6 gap-2">
        {/* === MOVED FROM LEFT GROUP === */}
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10"
          onClick={onOpenSettings}
          title="Open Controls Panel"
          data-floating-trigger="true"
        >
          <SlidersHorizontal className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10"
          onClick={onOpenSessions}
          title="Your Recordings"
        >
          <Library className="w-5 h-5" />
        </Button>
        {/* === CENTER GROUP === */}
        <div className="flex items-center bg-muted/50 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => onAudioToggle(!isAudioOn)}
          >
            {isAudioOn ? (
              <Mic className="h-5 w-5" />
            ) : (
              <MicOff className="h-5 w-5 text-red-500" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 mr-1"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
            >
              {audioDevices.map((device, i) => (
                <DropdownMenuItem
                  key={device.deviceId}
                  onClick={() => onAudioDeviceSelect(device.deviceId)}
                >
                  {device.deviceId === selectedAudioDevice && (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {device.label || `Microphone ${i + 1}`}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Video Controls */}
        <div className="flex items-center bg-muted/50 rounded-full">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10"
            onClick={() => onVideoToggle(!isVideoOn)}
          >
            {isVideoOn ? (
              <Webcam className="h-5 w-5" />
            ) : (
              <VideoOff className="h-5 w-5 text-red-500" />
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 mr-1"
              >
                <ChevronUp className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
            >
              {videoDevices.map((device, i) => (
                <DropdownMenuItem
                  key={device.deviceId}
                  onClick={() => onVideoDeviceSelect(device.deviceId)}
                >
                  {device.deviceId === selectedVideoDevice && (
                    <Check className="w-4 h-4 mr-2" />
                  )}
                  {device.label || `Camera ${i + 1}`}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Screen Share */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "rounded-full h-10 w-10 transition-colors bg-muted/50",
                screenShareMode !== "off" && "bg-primary/20 text-primary"
              )}
              title="Share Content"
            >
              <ScreenShare className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            style={{ zIndex: "var(--z-floating-controls-dropdown)" }}
          >
            <DropdownMenuItem onClick={() => onScreenShareModeChange("screen")}>
              <Monitor className="w-4 h-4 mr-2" />
              Share Screen
              {screenShareMode === "screen" && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onScreenShareModeChange("canvas")}>
              <Paintbrush className="w-4 h-4 mr-2" />
              Blank Canvas
              {screenShareMode === "canvas" && (
                <Check className="w-4 h-4 ml-auto" />
              )}
            </DropdownMenuItem>
            {screenShareMode !== "off" && (
              <DropdownMenuItem
                className="text-red-500"
                onClick={() => onScreenShareModeChange("off")}
              >
                <X className="w-4 h-4 mr-2" />
                Stop Sharing
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Record Button */}
        <Button
          size="icon"
          className={cn(
            "rounded-full h-12 w-12 transition-colors",
            isRecording
              ? "bg-red-600 hover:bg-red-700"
              : "bg-primary hover:bg-primary/90"
          )}
          onClick={onRecordingToggle}
          title={isRecording ? "Stop Recording" : "Start Recording"}
        >
          {isRecording ? (
            <Square className="h-6 w-6" />
          ) : (
            <Circle className="h-6 w-6 fill-current" />
          )}
        </Button>

        {/* === NEW TOOLS POPOVER === */}
        <ToolsPopover
          onAddTextOverlay={onAddTextOverlay}
          onAssetSelect={onAssetSelect}
          setIsDrawing={setIsDrawing}
          setTheme={setTheme}
          theme={theme}
          portalContainer={layoutProps.portalContainer}
        />

        {/* === MOVED FROM RIGHT GROUP === */}
        <LayoutControls {...layoutProps} />
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full h-10 w-10"
          onClick={onToggleFullscreen}
          title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
        >
          {isFullscreen ? (
            <Shrink className="h-5 w-5" />
          ) : (
            <Expand className="h-5 w-5" />
          )}
        </Button>
      </div>
    </div>
  );
};
