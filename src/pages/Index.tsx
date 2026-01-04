import React, { useRef, useCallback } from "react";
import { cn } from "@/shared/lib/utils";
import { Loader } from "lucide-react";

// Components
import { BottomNavigation } from "@/features/studio/ui/BottomNavigation";
import { CanvasContainer } from "./Index/components/CanvasContainer";
import { IndexOverlays } from "./Index/components/IndexOverlays";
import { FileVaultModal, useFileVault, usePasteCapture } from "@/features/vault";

// Hooks
import { useEditorOrchestrator } from "./Index/hooks/useEditorOrchestrator";
import { useCanvasAi } from "./Index/hooks/useCanvasAi";
import { useRtmpStream } from "@/features/stream/hooks/useRtmpStream";

const Index = () => {
  // 1. Initialize all state logic in the orchestrator
  const editor = useEditorOrchestrator();

  // Destructure for easier access in the render below
  const {
    activeScene,
    effectiveScene,
    sceneManager,
    ui,
    recording,
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

  // 2. Initialize AI Hook
  const { isProcessingAi, processTranscript } = useCanvasAi({
    activeScene: activeScene!, // Use activeScene for source of truth
    updateActiveScene: sceneManager.updateActiveScene,
    recording,
    setSavedOverlays: sessionData.setSavedOverlays,
  });

  // 3. RTMP Streaming Hook
  const rtmp = useRtmpStream();

  // 4. Ref for AI Popover auto-open behavior
  const hasAiPopoverAutoOpenedRef = useRef(false);

  // 5. File Vault
  const vault = useFileVault();
  
  // Handle paste capture for vault
  const handlePastedFiles = useCallback((files: File[]) => {
    vault.addFiles(files, 'paste');
  }, [vault.addFiles]);
  
  usePasteCapture({
    enabled: true,
    onFilePaste: handlePastedFiles,
  });

  // PHASE 3 FIX: Better Loading State
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
      <CanvasContainer
        activeScene={effectiveScene}
        previousScene={sceneManager.previousScene}
        activeTransition={sceneManager.activeTransition}
        isTransitioning={sceneManager.isTransitioning}
        updateActiveScene={sceneManager.updateActiveScene}
        updateSceneProperty={sceneManager.updateSceneProperty}
        audioDevices={mediaManager.audioDevices}
        videoDevices={mediaManager.videoDevices}
        layoutManager={layoutManager}
        recording={recording}
        onRecordingComplete={sessionData.handleRecordingComplete}
        uiState={{
          isFullscreen: ui.isFullscreen,
          onToggleFullscreen: ui.handleToggleFullscreen,
          isFsSidebarOpen: ui.isFsSidebarOpen,
          onFsSidebarToggle: ui.setIsFsSidebarOpen,
          isMouseActive: ui.isMouseActive,
          onOpenSessions: () => ui.setShowSessionsPanel(true),
          isDrawing: drawing.isDrawing,
          setIsDrawing: drawing.setIsDrawing,
        }}
        savedOverlays={sessionData.savedOverlays}
        setSavedOverlays={sessionData.setSavedOverlays}
        dynamicLayout={dynamicLayout}
        setDynamicLayout={setDynamicLayout}
        selection={selection}
        canvasRef={ui.canvasRef}
        mainContainerRef={ui.mainContainerRef}
        isSettingsOpen={ui.showSettings}
        onSetSettingsOpen={ui.setShowSettings}
        remoteStream={remote.remoteStream}
        isChatbotOpen={ui.isChatbotOpen}
        onChatbotToggle={ui.setIsChatbotOpen}
        vaultFiles={vault.files}
        onAddVaultFiles={vault.addFiles}
        onRemoveVaultFile={vault.removeFile}
        onClearVault={vault.clearVault}
      />

      <IndexOverlays editor={editor} />

      <BottomNavigation
        isMouseActive={ui.isBottomNavVisible}
        onOpenSettings={() => ui.setShowSettings((prev) => !prev)}
        onOpenSessions={() => ui.setShowSessionsPanel(true)}
        onSaveLayout={layoutManager.handleSaveLayout}
        onOpenAnimationLibrary={() => ui.setShowAnimationLibrary(true)}
        isAudioOn={activeScene.isAudioOn}
        onAudioToggle={(val) =>
          sceneManager.updateSceneProperty("isAudioOn", val)
        }
        audioDevices={mediaManager.audioDevices}
        onAudioDeviceSelect={(val) =>
          sceneManager.updateSceneProperty("selectedAudioDevice", val)
        }
        selectedAudioDevice={activeScene.selectedAudioDevice}
        isVideoOn={activeScene.isVideoOn}
        onVideoToggle={(val) => {
          if (
            val &&
            activeScene.selectedVideoDevice === "remote-peer" &&
            !remote.isRemoteConnected
          ) {
            remote.setHasDismissedRemoteModal(false);
            remote.setIsRemoteModalOpen(true);
          }
          sceneManager.updateSceneProperty("isVideoOn", val);
        }}
        videoDevices={mediaManager.videoDevices}
        onVideoDeviceSelect={(val) =>
          sceneManager.updateSceneProperty("selectedVideoDevice", val)
        }
        selectedVideoDevice={activeScene.selectedVideoDevice}
        screenShareMode={activeScene.screenShareMode}
        onScreenShareModeChange={(val) => {
          sceneManager.updateActiveScene((scene) => ({
            ...scene,
            screenShareMode: val,
            layoutMode: val !== "off" ? "pip" : "solo",
          }));
        }}
        isRecording={recording.isRecording}
        onRecordingToggle={() => { }}
        isBroadcasting={rtmp.isStreaming}
        onBroadcastToggle={() => console.log("Toggle Clicked")} // Modal handles action now
        onStartStream={rtmp.startStreaming}
        onStopStream={rtmp.stopStreaming}
        isConnecting={rtmp.isConnecting}
        streamStatus={rtmp.status}
        onToggleFullscreen={ui.handleToggleFullscreen}
        isFullscreen={ui.isFullscreen}
        layoutMode={activeScene.layoutMode}
        cameraShape={activeScene.cameraShape}
        onLayoutModeChange={(val) =>
          sceneManager.updateSceneProperty("layoutMode", val)
        }
        onCameraShapeChange={(val) =>
          sceneManager.updateSceneProperty("cameraShape", val)
        }
        onCustomMaskUpload={(file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (typeof e.target?.result === "string")
              sceneManager.updateSceneProperty(
                "customMaskUrl",
                e.target.result
              );
          };
          reader.readAsDataURL(file);
        }}
        portalContainer={ui.mainContainerRef.current || undefined}
        splitRatio={activeScene.splitRatio}
        pipPosition={activeScene.pipPosition}
        pipSize={activeScene.pipSize}
        onSplitRatioChange={(val) =>
          sceneManager.updateSceneProperty("splitRatio", val)
        }
        onPipPositionChange={(val) =>
          sceneManager.updateSceneProperty("pipPosition", val)
        }
        onPipSizeChange={(val) =>
          sceneManager.updateSceneProperty("pipSize", val)
        }
        customMaskUrl={activeScene.customMaskUrl}
        onUndo={sceneManager.undo}
        onRedo={sceneManager.redo}
        canUndo={sceneManager.canUndo}
        canRedo={sceneManager.canRedo}
        onResetScene={sceneManager.resetScene}
        canvasLayout={activeScene.canvasLayout}
        isSmartSwitchEnabled={broadcast.isSmartSwitchEnabled}
        onSmartSwitchToggle={broadcast.toggleSmartSwitch}
        // AI Props
        onAiCommandSubmit={processTranscript}
        isAiProcessing={isProcessingAi}
        activeOverlays={activeScene.activeOverlays}
        isAiModeEnabled={activeScene.isAiModeEnabled}
        onAiModeToggle={(val) =>
          sceneManager.updateSceneProperty("isAiModeEnabled", val)
        }
        captionsEnabled={activeScene.captionsEnabled}
        onCaptionsToggle={(val) =>
          sceneManager.updateSceneProperty("captionsEnabled", val)
        }
        hasAiPopoverAutoOpenedRef={hasAiPopoverAutoOpenedRef}
      />

      {/* --- File Vault Modal --- */}
      <FileVaultModal
        isOpen={vault.isOpen}
        onClose={vault.closeVault}
        files={vault.files}
        onAddFiles={vault.addFiles}
        onRemoveFile={vault.removeFile}
        onClearVault={vault.clearVault}
      />

      {/* --- RTMP Countdown Overlay --- */}
      {rtmp.countdown !== null && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-3xl z-[9999] animate-in fade-in duration-300"
          style={{ zIndex: 9999 }}
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
    </div>
  );
};

export default Index;
