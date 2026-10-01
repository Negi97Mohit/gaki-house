// Single responsibility: layout compositor for the bottom navigation bar.
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SlidersHorizontal, Expand, Shrink, Home } from "lucide-react";
import { Button } from "@gaki/ui/button";
import { cn } from "@gaki/core/lib/utils";
import { ShortcutTooltip } from "@gaki/ui/shortcut-tooltip";
import { MediaControls } from "./controls/MediaControls";
import { UserMenuControl } from "./controls/UserMenuControl";
import { useShallow } from "zustand/react/shallow";
import { useUiStore, useMouseStore } from "@/stores/ui.store";
import { HandoffControls } from "../../stream/ui/HandoffControls";
import { useScrollEdges } from "./panels/HScrollStrip";

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

// Minimal chic button styling for the floating dock (supports light & dark mode)
const ISLAND_BTN =
  "group relative rounded-xl h-8 w-8 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-transparent hover:border-black/10 dark:hover:border-white/15 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] active:scale-95 transition-all duration-150 flex items-center justify-center";

/** Sleek hairline divider between functional clusters */
const Divider = () => (
  <div className="w-px h-4 bg-black/[0.08] dark:bg-white/[0.08] mx-0.5 shrink-0" aria-hidden="true" />
);

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
  const { isFullscreen, setFullscreen, showSettings, setShowSettings } =
    useUiStore(
      useShallow((state) => ({
        isFullscreen: state.isFullscreen,
        setFullscreen: state.setFullscreen,
        showSettings: state.showSettings,
        setShowSettings: state.setShowSettings,
      })),
    );
  const scrollRef = useRef<HTMLDivElement>(null);
  const { edgeMask } = useScrollEdges(scrollRef);
  const isMouseActive = useMouseStore((state) => state.isMouseActive);
  const [isElectron, setIsElectron] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkElectron =
      (window as any).electron?.isElectron ||
      /Electron/.test(navigator.userAgent);
    setIsElectron(!!checkElectron);
  }, []);

  // Fullscreen toggle handler
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

  // Stay visible while the Studio panel is open
  const isVisible = isMouseActive || showSettings;

  return (
    <div
      className={cn(
        "fixed left-1/2 -translate-x-1/2 w-max max-w-[calc(100vw-1.5rem)]",
        "bottom-[max(1.25rem,env(safe-area-inset-bottom))]",
        "rounded-2xl backdrop-blur-2xl",
        "bg-white/80 dark:bg-[#0c0c11]/85",
        "border border-black/[0.08] dark:border-white/[0.08]",
        "shadow-[0_16px_36px_-8px_rgba(0,0,0,0.08),0_1px_0_0_rgba(255,255,255,0.8)_inset] dark:shadow-[0_20px_48px_-10px_rgba(0,0,0,0.7),0_1px_0_0_rgba(255,255,255,0.06)_inset]",
        "transition-[opacity,transform] duration-300 ease-out",
        "[&_button:focus-visible]:outline-none [&_button:focus-visible]:ring-1 [&_button:focus-visible]:ring-black/20 dark:[&_button:focus-visible]:ring-white/30",
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-4 pointer-events-none",
      )}
      style={{ zIndex: "var(--z-floating-controls)" }}
    >
      {/* Hairline highlight along top edge */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-black/10 dark:via-white/20 to-transparent"
      />
      <div
        ref={scrollRef}
        role="toolbar"
        aria-label="Studio controls"
        className="no-scrollbar flex items-center gap-1 overflow-x-auto overflow-y-hidden overscroll-x-contain snap-x snap-proximity p-1.5"
        style={{ WebkitMaskImage: edgeMask, maskImage: edgeMask }}
      >
        {/* Navigation & Studio Deck */}
        <div className="flex items-center gap-0.5 shrink-0">
          <ShortcutTooltip label="Home">
            <Button
              variant="ghost"
              size="icon"
              className={ISLAND_BTN}
              onClick={() => navigate("/platform")}
              aria-label="Home"
              data-floating-trigger
            >
              <Home className="w-3.5 h-3.5" />
            </Button>
          </ShortcutTooltip>
          <ShortcutTooltip label="Studio Deck" shortcut="settings">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                ISLAND_BTN,
                showSettings &&
                  "border-black/20 dark:border-white/30 text-zinc-950 dark:text-white after:absolute after:bottom-1 after:left-2 after:right-2 after:h-[1.5px] after:bg-zinc-900 dark:after:bg-white after:rounded-full after:shadow-[0_0_4px_rgba(0,0,0,0.2)] dark:after:shadow-[0_0_6px_rgba(255,255,255,0.8)]",
              )}
              onClick={() => setShowSettings((prev) => !prev)}
              aria-label="Studio panel"
              aria-pressed={showSettings}
              data-floating-trigger
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </Button>
          </ShortcutTooltip>
        </div>

        <Divider />

        {/* Inputs: Mic, Camera, Screen Share */}
        <div className="flex items-center shrink-0">
          <MediaControls part="devices" />
        </div>

        <Divider />

        {/* Broadcast: Record & Go Live */}
        <div className="flex items-center shrink-0">
          <MediaControls
            part="broadcast"
            onStartStream={onStartStream}
            onStopStream={onStopStream}
            onToggleRecord={onToggleRecord}
            onStreamSettingsSave={onStreamSettingsSave}
            streamStatus={streamStatus}
            isConnecting={isStreamConnecting}
            isBroadcasting={isStreamBroadcasting}
          />
        </div>

        <Divider />

        {/* Dynamic Layout Slot (if active) */}
        <div
          id="layout-controls-slot"
          className="flex items-center gap-0.5 empty:hidden [&>button]:h-8 [&>button]:w-8 [&>button]:rounded-xl shrink-0"
        />

        {/* Tools: Handoff, Fullscreen */}
        <div className="flex items-center gap-0.5 shrink-0">
          <HandoffControls />
          <ShortcutTooltip
            label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            shortcut="fullscreen"
          >
            <Button
              variant="ghost"
              size="icon"
              className={ISLAND_BTN}
              onClick={handleFullscreenToggle}
              aria-label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Shrink className="h-3.5 w-3.5" />
              ) : (
                <Expand className="h-3.5 w-3.5" />
              )}
            </Button>
          </ShortcutTooltip>
        </div>

        <Divider />

        {/* Account Profile / Auth */}
        <div className="flex items-center shrink-0 px-0.5">
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
        </div>
      </div>
    </div>
  );
};
