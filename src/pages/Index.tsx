import React, { useRef, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { Loader } from "lucide-react";
import { BottomNavigation } from "@/features/studio/ui/BottomNavigation";
import { CanvasContainer } from "./Index/components/CanvasContainer";
import { IndexOverlays } from "./Index/components/IndexOverlays";
import {
  FileVaultModal,
  useFileVault,
  usePasteCapture,
} from "@/features/vault";
import { useAuth } from "@/pages/platform/context/AuthContext";
import { AuthModal } from "@/pages/platform/components/AuthModal";
import { useEditorOrchestrator } from "./Index/hooks/useEditorOrchestrator";
import { useCanvasAi } from "./Index/hooks/useCanvasAi";
import { useRtmpStream } from "@/features/stream/hooks/useRtmpStream";
import { FatalErrorDialog } from "@/features/stream/ui/FatalErrorDialog"; // NEW IMPORT
import { useOmegleStore } from "@/stores/omegle.store";
import { OmegleMode } from "@/features/omegle/ui/OmegleMode";

const Index = () => {
  const editor = useEditorOrchestrator();

  const {
    activeScene,
    effectiveScene,
    sceneManager,
    ui,
    sessionData,
    layoutManager,
    dynamicLayout,
    setDynamicLayout,
    selection,
    remote,
    broadcast,
    mediaManager,
    drawing,
    overlayHandlers,
  } = editor;

  const { isProcessingAi, processTranscript } = useCanvasAi({
    activeScene: activeScene!,
    updateActiveScene: sceneManager.updateActiveScene,
    setSavedOverlays: sessionData.setSavedOverlays,
  });

  const rtmp = useRtmpStream();
  const hasAiPopoverAutoOpenedRef = useRef(false);
  const vault = useFileVault();
  const { user, openAuthModal, closeAuthModal, isAuthModalOpen, signOut } = useAuth();

  const handlePastedFiles = useCallback(
    (files: File[]) => {
      vault.addFiles(files, "paste");
    },
    [vault.addFiles]
  );

  usePasteCapture({
    enabled: true,
    onFilePaste: handlePastedFiles,
  });

  const { isOmegleMode, enterOmegleMode, exitOmegleMode } = useOmegleStore();

  const handleToggleOmegle = useCallback(() => {
    if (isOmegleMode) {
      exitOmegleMode();
    } else {
      enterOmegleMode();
    }
  }, [isOmegleMode, enterOmegleMode, exitOmegleMode]);

  if (!activeScene || !effectiveScene) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background text-muted-foreground gap-4">
        <Loader className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-medium animate-pulse">
          Initializing Studio...
        </p>
      </div>
    );
  }

  return (
    <div
      ref={ui.mainContainerRef}
      className={cn(
        "h-screen flex bg-background overflow-hidden relative w-full",
        !ui.isMouseActive && "cursor-none"
      )}
    >
      {/* Render Omegle Mode or Normal Studio */}
      {isOmegleMode ? (
        <OmegleMode />
      ) : (
        <>
          <CanvasContainer
            layoutManager={layoutManager}
            remoteStream={remote.remoteStream}
            vaultFiles={vault.files}
            onAddVaultFiles={vault.addFiles}
            onRemoveVaultFile={vault.removeFile}
            onClearVault={vault.clearVault}
          />

          <IndexOverlays editor={editor} />

          <BottomNavigation
            onSaveLayout={layoutManager.handleSaveLayout}
            onAiCommandSubmit={processTranscript}
            isAiProcessing={isProcessingAi}
            hasAiPopoverAutoOpenedRef={hasAiPopoverAutoOpenedRef}
            portalContainer={ui.mainContainerRef.current || undefined}
            onStartStream={rtmp.startStreaming}
            onStopStream={rtmp.stopStreaming}
            onToggleRecord={rtmp.toggleRecording}
            streamStatus={rtmp.status}
            isStreamConnecting={rtmp.isConnecting}
            isStreamBroadcasting={rtmp.isStreaming}
            onUndo={sceneManager.undo}
            onRedo={sceneManager.redo}
            onResetScene={sceneManager.resetScene}
            onToggleFullscreen={ui.handleToggleFullscreen}
            onConnectRemote={() => remote.setIsRemoteModalOpen(true)}
            onToggleOmegle={handleToggleOmegle}
            onOpenAuth={() => openAuthModal("login")}
            onSignOut={signOut}
            isSignedIn={!!user}
          />

          <FileVaultModal
            isOpen={vault.isOpen}
            onClose={vault.closeVault}
            files={vault.files}
            onAddFiles={vault.addFiles}
            onRemoveFile={vault.removeFile}
            onClearVault={vault.clearVault}
          />

          {/* Auth Modal */}
          <AuthModal />

          {/* Fatal Error Popup */}
          <FatalErrorDialog />

          {rtmp.countdown !== null && (
            <div
              className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-3xl z-[10000] animate-in fade-in duration-300"
              style={{ zIndex: 10000 }}
            >
              <div className="flex flex-col items-center gap-8 animate-in zoom-in-95 duration-500">
                <div className="relative">
                  <span className="text-[12rem] font-bold tracking-tighter tabular-nums leading-none text-foreground select-none">
                    {rtmp.countdown}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground uppercase tracking-[0.5em] text-sm font-medium pl-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  Starting Stream
                </div>
              </div>
            </div>
          )}
        </>
      )
      }
    </div >
  );
};

export default Index;
