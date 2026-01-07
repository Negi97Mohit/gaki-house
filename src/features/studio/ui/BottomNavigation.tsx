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

// Decomposed Controls
import { MediaControls } from "./controls/MediaControls";
import { SceneControls } from "./controls/SceneControls";
import { AIControls } from "./controls/AIControls";

import { useShallow } from "zustand/react/shallow";
import { useUiStore } from "@/stores/ui.store";

interface BottomNavigationProps {
  // Complex callbacks and refs that are not yet in stores
  onSaveLayout: () => void;
  onAiCommandSubmit: (text: string, targetId: string | null) => void;
  isAiProcessing: boolean;
  hasAiPopoverAutoOpenedRef: React.RefObject<boolean>;
  portalContainer?: HTMLElement | null;

  // Streaming callbacks (passed to MediaControls)
  // UPDATED: Changed from (url, key) to (config: any) to support multi-target array
  onStartStream?: (config: any) => void;
  onStopStream?: () => void;
  onStreamSettingsSave?: (url: string, key: string) => void;

  // Scene triggers (passed to SceneControls)
  onUndo: () => void;
  onRedo: () => void;
  onResetScene: () => void;

  // Fullscreen toggle
  onToggleFullscreen?: () => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  onSaveLayout,
  onAiCommandSubmit,
  isAiProcessing,
  hasAiPopoverAutoOpenedRef,
  portalContainer,
  onStartStream,
  onStopStream,
  onStreamSettingsSave,
  onUndo,
  onRedo,
  onResetScene,
  onToggleFullscreen,
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

  // Local state
  const [isElectron, setIsElectron] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  useEffect(() => {
    const checkElectron =
      (window as any).electron?.isElectron ||
      /Electron/.test(navigator.userAgent);
    setIsElectron(!!checkElectron);
  }, []);

  const handleFullscreenToggle = () => {
    // Use the passed handler if available (fixes the button in some contexts)
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

  // --- DOWNLOAD LINKS ---
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
        <DialogContent className="sm:max-w-sm bg-background border-border/30 p-6">
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
            <button
              onClick={() => window.open(downloads.mac, "_blank")}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-foreground/80 group-hover:text-foreground transition-colors"
                  fill="currentColor"
                >
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">macOS</div>
                <div className="text-[10px] text-muted-foreground">.dmg</div>
              </div>
            </button>
            <button
              onClick={() => window.open(downloads.linux, "_blank")}
              className="group flex flex-col items-center gap-3 p-4 rounded-xl hover:bg-muted/50 transition-colors"
            >
              <div className="w-12 h-12 flex items-center justify-center">
                <svg
                  viewBox="0 0 24 24"
                  className="w-10 h-10 text-foreground/80 group-hover:text-foreground transition-colors"
                  fill="currentColor"
                >
                  <path d="M12.504 0c-.155 0-.315.008-.48.021-4.226.333-3.105 4.807-3.17 6.298-.076 1.092-.3 1.953-1.05 3.02-.885 1.051-2.127 2.75-2.716 4.521-.278.832-.41 1.684-.287 2.489.117.779.456 1.51 1.028 2.104.59.604 1.331 1.081 2.132 1.42.788.338 1.652.546 2.486.699 1.2.22 2.362.341 3.339.479.908.129 1.664.296 2.164.529.486.226.711.477.711.908 0 .304-.091.577-.257.839-.167.26-.401.5-.695.728-.31.24-.68.458-1.09.659-.53.26-1.133.489-1.772.689-.59.185-1.226.354-1.874.491-.65.137-1.315.242-1.941.323-.64.081-1.241.138-1.759.178-.67.052-1.233.08-1.6.08-.168 0 .317-.004.442-.012-.086-.005.16-.013.221-.023.046-.008.087-.017.118-.03.024-.01.041-.02.053-.033.01-.012.015-.025.013-.042-.002-.019-.014-.041-.036-.068-.024-.03-.061-.063-.11-.1-.056-.042-.127-.088-.213-.137-.1-.057-.218-.117-.35-.18-.266-.127-.589-.262-.948-.404-.364-.145-.771-.297-1.2-.455-.433-.16-.893-.327-1.361-.498-.473-.173-.961-.353-1.441-.538-.484-.187-.963-.379-1.417-.576-.456-.198-.893-.401-1.289-.61-.4-.211-.763-.428-1.077-.651-.315-.225-.588-.458-.803-.699-.215-.242-.378-.495-.48-.759-.1-.263-.141-.539-.122-.832.019-.294.102-.602.251-.932.149-.331.361-.681.636-1.05.274-.368.61-.752 1.003-1.148.393-.397.843-.805 1.345-1.218.502-.413 1.057-.83 1.658-1.246.6-.416 1.247-.83 1.933-1.238.687-.408 1.413-.809 2.17-1.197.758-.388 1.548-.764 2.362-1.122.815-.357 1.656-.697 2.51-1.012.856-.316 1.727-.608 2.602-.873.876-.265 1.757-.503 2.632-.712.876-.21 1.748-.393 2.603-.546.856-.154 1.696-.28 2.508-.376.813-.097 1.6-.165 2.347-.203.748-.039 1.393-.059 1.678-.059z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium">Linux</div>
                <div className="text-[10px] text-muted-foreground">
                  .AppImage
                </div>
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
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full h-10 w-10 hover:bg-background/60"
            onClick={() => setShowSettings(true)}
            title="Settings"
            data-floating-trigger="true"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border/40 mx-1" />

          {/* Decomposed Scene Controls */}
          <SceneControls
            onUndo={onUndo}
            onRedo={onRedo}
            onResetScene={onResetScene}
          />

          <div className="w-px h-6 bg-border/40 mx-1" />

          {/* Decomposed Media Controls */}
          <MediaControls
            onStartStream={onStartStream}
            onStopStream={onStopStream}
            onStreamSettingsSave={onStreamSettingsSave}
          />

          <div className="w-px h-6 bg-border/40 mx-1" />

          <div className="flex items-center gap-0.5">
            {!isElectron && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-10 w-10 hover:bg-background/60 text-blue-500 hover:text-blue-400"
                onClick={() => setIsDownloadOpen(true)}
                title="Download Desktop App"
              >
                <Download className="w-4 h-4" />
              </Button>
            )}

            {/* Decomposed AI Controls */}
            <AIControls
              onAiCommandSubmit={onAiCommandSubmit}
              isAiProcessing={isAiProcessing}
              hasAiPopoverAutoOpenedRef={hasAiPopoverAutoOpenedRef}
              portalContainer={portalContainer}
            />

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
      </div>
    </>
  );
};
