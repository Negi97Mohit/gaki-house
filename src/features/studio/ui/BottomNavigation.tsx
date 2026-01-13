import React, { useEffect, useState } from "react";
import { SlidersHorizontal, Expand, Shrink, Download } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { cn } from "@/shared/lib/utils";
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";
import { MediaControls } from "./controls/MediaControls";
import { SceneControls } from "./controls/SceneControls";
import { AIControls } from "./controls/AIControls";
import { useShallow } from "zustand/react/shallow";
import { useUiStore } from "@/stores/ui.store";

interface BottomNavigationProps {
  onSaveLayout: () => void;
  onAiCommandSubmit: (text: string, targetId: string | null) => void;
  isAiProcessing: boolean;
  hasAiPopoverAutoOpenedRef: React.RefObject<boolean>;
  portalContainer?: HTMLElement | null;
  onStartStream?: (url: string, key: string) => void;
  onStopStream?: () => void;
  onToggleRecord?: () => void;
  onStreamSettingsSave?: (url: string, key: string) => void;
  streamStatus?: string;
  isStreamConnecting?: boolean;
  isStreamBroadcasting?: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onResetScene: () => void;
  onToggleFullscreen?: () => void;
  onConnectRemote?: () => void; // New prop
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onSaveLayout,
  onAiCommandSubmit,
  isAiProcessing,
  hasAiPopoverAutoOpenedRef,
  portalContainer,
  onStartStream,
  onStopStream,
  onToggleRecord,
  onStreamSettingsSave,
  streamStatus,
  isStreamConnecting,
  isStreamBroadcasting,
  onUndo,
  onRedo,
  onResetScene,
  onToggleFullscreen,
  onConnectRemote, // Destructure
}) => {
  const { isMouseActive, isFullscreen, setFullscreen, setShowSettings } =
    useUiStore(
      useShallow((state) => ({
        isMouseActive: state.isMouseActive,
        isFullscreen: state.isFullscreen,
        setFullscreen: state.setFullscreen,
        setShowSettings: state.setShowSettings,
      }))
    );

  const [isElectron, setIsElectron] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  useEffect(() => {
    const checkElectron =
      (window as any).electron?.isElectron ||
      /Electron/.test(navigator.userAgent);
    setIsElectron(!!checkElectron);
  }, []);

  const handleFullscreenToggle = () => {
    if (onToggleFullscreen) {
      onToggleFullscreen();
      return;
    }
    if (isElectron && (window as any).electron?.toggleFullscreen) {
      (window as any).electron.toggleFullscreen();
    } else {
      setFullscreen(!isFullscreen);
    }
  };

  const BASE_URL =
    "https://github.com/Negi97Mohit/caption-cam/releases/latest/download";
  const downloads = {
    windows: `${BASE_URL}/CaptionCam-Studio-Setup-0.0.0.exe`,
    mac: `${BASE_URL}/CaptionCam-Studio-0.0.0-arm64.dmg`,
    linux: `${BASE_URL}/CaptionCam-Studio-0.0.0.AppImage`,
  };

  return (
    <>
      <Dialog open={isDownloadOpen} onOpenChange={setIsDownloadOpen}>
        <DialogContent className="sm:max-w-sm bg-background/70 dark:bg-background/50 backdrop-blur-2xl border border-border/20 dark:border-white/10 rounded-2xl shadow-2xl shadow-black/10 dark:shadow-black/40 p-6 overflow-hidden">
          {/* Subtle inner glow */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
          <DialogHeader className="pb-4">
            <DialogTitle className="text-lg font-medium tracking-tight">
              Download for Desktop
            </DialogTitle>
          </DialogHeader>
          <div className="flex justify-center gap-6 py-6">
            <button
              onClick={() => window.open(downloads.windows, "_blank")}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-foreground/80 group-hover:text-foreground transition-colors"
                  fill="currentColor"
                >
                  <path d="M0 3.449L9.75 2.1v9.451H0m10.949-9.602L24 0v11.4H10.949M0 12.6h9.75v9.451L0 20.699M10.949 12.6H24V24l-12.9-1.801" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">Windows</div>
                <div className="text-[10px] text-muted-foreground">.exe</div>
              </div>
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out",
          "backdrop-blur-2xl rounded-2xl",
          "bg-background/60 dark:bg-background/40",
          "border border-border/20 dark:border-white/[0.08]",
          "shadow-2xl",
          isMouseActive
            ? "opacity-100 translate-y-0 scale-100"
            : "opacity-0 translate-y-4 scale-95 pointer-events-none"
        )}
        style={{ zIndex: "var(--z-floating-controls)" }}
      >
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />

        <div className="relative flex items-center gap-1.5 px-3 py-2">
          <ShortcutTooltip label="Settings" shortcut="settings">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200"
              onClick={() => setShowSettings((prev) => !prev)}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </Button>
          </ShortcutTooltip>

          <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />
          <div
            id="layout-controls-slot"
            className="flex items-center gap-1.5 [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-xl"
          />
          <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />

          <SceneControls
            onUndo={onUndo}
            onRedo={onRedo}
            onResetScene={onResetScene}
          />

          <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />

          <MediaControls
            onStartStream={onStartStream}
            onStopStream={onStopStream}
            onToggleRecord={onToggleRecord}
            onStreamSettingsSave={onStreamSettingsSave}
            streamStatus={streamStatus}
            isConnecting={isStreamConnecting}
            isBroadcasting={isStreamBroadcasting}
          />

          <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />

          <div className="flex items-center gap-1.5">
            {!isElectron && (
              <ShortcutTooltip label="Download Desktop App">
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 text-primary hover:text-primary transition-all duration-200"
                  onClick={() => setIsDownloadOpen(true)}
                >
                  <Download className="w-3.5 h-3.5" />
                </Button>
              </ShortcutTooltip>
            )}

            <AIControls
              onAiCommandSubmit={onAiCommandSubmit}
              isAiProcessing={isAiProcessing}
              hasAiPopoverAutoOpenedRef={hasAiPopoverAutoOpenedRef}
              portalContainer={portalContainer}
            />

            <ShortcutTooltip
              label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              shortcut="fullscreen"
            >
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200"
                onClick={handleFullscreenToggle}
              >
                {isFullscreen ? (
                  <Shrink className="h-3.5 w-3.5" />
                ) : (
                  <Expand className="h-3.5 w-3.5" />
                )}
              </Button>
            </ShortcutTooltip>
          </div>
        </div>
      </div>
    </>
  );
};
