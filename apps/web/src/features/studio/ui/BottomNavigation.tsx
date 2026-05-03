// Single responsibility: layout compositor for the bottom navigation bar.
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Expand, Shrink, Users, Home } from "lucide-react";
import { Button } from "@gaki/ui/button";
import { cn } from "@gaki/core/lib/utils";
import { ShortcutTooltip } from "@gaki/ui/shortcut-tooltip";
import { MediaControls } from "./controls/MediaControls";
import { SceneControls } from "./controls/SceneControls";
import { AIControls } from "./controls/AIControls";
import { UserMenuControl } from "./controls/UserMenuControl";
import { DownloadControl } from "./controls/DownloadControl";
import { useShallow } from "zustand/react/shallow";
import { useUiStore, useMouseStore } from "@/stores/ui.store";
import { HandoffControls } from "../../stream/ui/HandoffControls";

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
  onImportOBSScenes?: (scenes: import("@/types/caption").SceneState[]) => void;
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
  onImportOBSScenes,
  onOpenAuth,
  onSignOut,
  isSignedIn,
  userAvatarUrl,
  userDisplayName,
  userUid,
  userUsername,
}) => {
  useEffect(() => {
  }, []);

  const { isFullscreen, setFullscreen, setShowSettings } = useUiStore(
    useShallow((state) => ({
      isFullscreen: state.isFullscreen,
      setFullscreen: state.setFullscreen,
      setShowSettings: state.setShowSettings,
    })),
  );
  const isMouseActive = useMouseStore((state) => state.isMouseActive);
  const [isElectron, setIsElectron] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkElectron =
      (window as any).electron?.isElectron ||
      /Electron/.test(navigator.userAgent);
    setIsElectron(!!checkElectron);
  }, []);

  // Fullscreen stays inline: 27 lines, under the 30-line extraction threshold
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

  return (
    <div
      className={cn(
        "fixed bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 ease-out",
        "max-w-[calc(100vw-2rem)]",
        "backdrop-blur-2xl rounded-2xl",
        "bg-background/60 dark:bg-background/40",
        "border border-border/20 dark:border-white/[0.08]",
        "shadow-2xl",
        isMouseActive
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 translate-y-4 scale-95 pointer-events-none",
      )}
      style={{ zIndex: "var(--z-floating-controls)" }}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/[0.08] to-transparent pointer-events-none" />
      <div className="relative flex items-center gap-1.5 px-3 py-2 overflow-x-auto overflow-y-hidden no-scrollbar">
        {/* Home */}
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

        {/* Settings */}
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
          onImportOBSScenes={isElectron ? onImportOBSScenes : undefined}
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
        <HandoffControls />

        <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />
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

        <UserMenuControl
          isSignedIn={isSignedIn}
          userAvatarUrl={userAvatarUrl}
          userDisplayName={userDisplayName}
          userUid={userUid}
          userUsername={userUsername}
          portalContainer={portalContainer}
          onOpenAuth={onOpenAuth}
          onSignOut={onSignOut}
        />

        <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />

        <div className="flex items-center gap-1.5">
          {/* DownloadControl renders null in Electron — no conditional needed here */}
          <DownloadControl isElectron={isElectron} />
          <AIControls
            onAiCommandSubmit={onAiCommandSubmit}
            isAiProcessing={isAiProcessing}
            hasAiPopoverAutoOpenedRef={hasAiPopoverAutoOpenedRef}
            portalContainer={portalContainer}
          />
          {/* Fullscreen: 27 lines — left inline per <30 line rule */}
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
          <div className="w-px h-5 bg-border/20 dark:bg-white/10 mx-1" />
        </div>
      </div>
    </div>
  );
};
