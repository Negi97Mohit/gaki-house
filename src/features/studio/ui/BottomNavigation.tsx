import React, { useEffect, useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SlidersHorizontal, Expand, Shrink, Download, Users, LogIn, LogOut, Home, User, Settings, LayoutDashboard } from "lucide-react";
import { DefaultAvatar } from "@/pages/platform/components/DefaultAvatar";
import { Button } from "@/shared/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
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
  onStartStream?: () => void;
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
  onConnectRemote?: () => void;
  onToggleOmegle?: () => void;
  onOpenAuth?: () => void;
  onSignOut?: () => void;
  isSignedIn?: boolean;
  userAvatarUrl?: string;
  userDisplayName?: string;
  userUid?: string;
  userUsername?: string;
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
  onConnectRemote,
  onToggleOmegle,
  onOpenAuth,
  onSignOut,
  isSignedIn,
  userAvatarUrl,
  userDisplayName,
  userUid,
  userUsername,
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const navigate = useNavigate();

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

  // UPDATED: New GitHub Release URL
  const downloads = {
    windows:
      "https://github.com/Negi97Mohit/gakiVersion/releases/download/v1.0.0/Gaki-House-of-Video-Creation-0.0.0.exe",
    mac: "#",
    linux: "#",
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
            {/* UPDATED: Changed to <a> tag for better direct download behavior */}
            <a
              href={downloads.windows}
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
            </a>
          </div>
        </DialogContent>
      </Dialog>

      <div
        className={cn(
          "fixed bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out",
          "max-w-[calc(100vw-2rem)]", // Ensure it doesn't overflow screen width
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

        <div className="relative flex items-center gap-1.5 px-3 py-2 overflow-x-auto overflow-y-hidden no-scrollbar">
          <ShortcutTooltip label="Home">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200"
              onClick={() => navigate("/platform")}
              data-floating-trigger
            >
              <Home className="w-3.5 h-3.5" />
            </Button>
          </ShortcutTooltip>

          <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />

          <ShortcutTooltip label="Settings" shortcut="settings">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200"
              onClick={() => setShowSettings((prev) => !prev)}
              data-floating-trigger
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

          {/* Omegle Mode Button */}
          {onToggleOmegle && (
            <ShortcutTooltip label="Random Chat (Omegle)">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200"
                onClick={onToggleOmegle}
                data-floating-trigger
              >
                <Users className="w-3.5 h-3.5" />
              </Button>
            </ShortcutTooltip>
          )}

          <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />

          {/* Auth Button / User Menu */}
          {isSignedIn ? (
            <Popover open={isUserMenuOpen} onOpenChange={setIsUserMenuOpen}>
              <PopoverTrigger asChild>
                <button
                  className="rounded-full hover:ring-2 hover:ring-primary/50 transition-all overflow-hidden h-7 w-7 flex items-center justify-center outline-none"
                  data-floating-trigger
                >
                  <DefaultAvatar
                    avatarUrl={userAvatarUrl}
                    name={userDisplayName}
                    uid={userUid}
                    size="sm"
                    className="w-7 h-7"
                  />
                </button>
              </PopoverTrigger>

              <PopoverContent
                side="top"
                align="end"
                sideOffset={24}
                container={portalContainer || undefined}
                className="w-56 p-0 bg-card/95 backdrop-blur-xl border border-border/40 rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
                style={{ zIndex: 100 }}
              >
                {/* User info */}
                <div className="px-4 py-3 border-b border-border/20">
                  <p className="text-sm font-semibold text-foreground truncate">{userDisplayName || "User"}</p>
                  {userUsername && <p className="text-xs text-muted-foreground truncate">@{userUsername}</p>}
                </div>

                <div className="py-1">
                  <Link
                    to={`/platform/profile/${userUsername || "me"}`}
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <User className="w-4 h-4" />
                    My Channel
                  </Link>
                  <Link
                    to="/platform"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Creator Dashboard
                  </Link>
                  <Link
                    to="/platform/settings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                </div>

                <div className="border-t border-border/20 py-1">
                  <button
                    onClick={() => { onSignOut?.(); setIsUserMenuOpen(false); }}
                    className="flex items-center gap-3 w-full px-4 py-2 text-sm text-destructive hover:bg-muted transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <ShortcutTooltip label="Sign In / Sign Up">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 text-primary hover:text-primary transition-all duration-200"
                onClick={onOpenAuth}
                data-floating-trigger
              >
                <LogIn className="w-3.5 h-3.5" />
              </Button>
            </ShortcutTooltip>
          )}

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
