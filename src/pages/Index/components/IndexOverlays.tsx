import React from "react";
import { SceneTabs } from "@/features/stream/ui/SceneTabs";
import { TransitionPopover } from "@/features/stream/ui/TransitionPopover";
import { AnimationLibraryPanel } from "@/features/animation/ui/AnimationLibraryPanel";
import { SavedSessionsPanel } from "@/features/stream/ui/SavedSessionsPanel";
import { ExcalidrawOverlay } from "@/features/canvas/ui/ExcalidrawOverlay";
import { RemoteConnectModal } from "@/features/studio/ui/RemoteConnectModal";
import { toast } from "sonner";

interface IndexOverlaysProps {
  editor: any; // Return type of useEditorOrchestrator
}

export const IndexOverlays: React.FC<IndexOverlaysProps> = ({ editor }) => {
  const {
    sceneManager,
    ui,
    overlayHandlers,
    sessionData,
    layoutManager,
    drawing,
    remote,
  } = editor;

  return (
    <>
      <SceneTabs
        scenes={sceneManager.scenes}
        activeSceneId={sceneManager.activeSceneId}
        activeSubsceneId={sceneManager.activeSubsceneId}
        transitions={sceneManager.sceneTransitions}
        onSceneSelect={sceneManager.handleSceneSelect}
        onSceneAdd={sceneManager.handleAddScene}
        onSubsceneAdd={sceneManager.handleAddSubscene}
        onTransitionClick={sceneManager.setActiveTransition}
        onSceneClose={sceneManager.handleSceneClose}
        onSubsceneClose={sceneManager.handleSubsceneClose}
        onSceneReorder={sceneManager.handleSceneReorder}
        onSubsceneReorder={sceneManager.handleSubsceneReorder}
        onSceneRename={sceneManager.handleSceneRename}
        onSubsceneRename={sceneManager.handleSubsceneRename}
        onToggleExpand={sceneManager.handleToggleExpand}
        onDuplicateScene={sceneManager.handleDuplicateScene}
        onResetScene={sceneManager.handleResetSceneToDefault}
        isHidden={ui.isSceneTabsHidden}
        onHide={() => ui.setIsSceneTabsHidden(true)}
        isPopoverOpen={sceneManager.activeTransition !== null}
        onApplyStreamStyle={(preset: any) => {
          const newSubscenes = sceneManager.createScenesFromStreamStyle(preset);
          toast.success(
            `Created ${newSubscenes.length} subscenes from "${preset.name}" style!`
          );
        }}
      />

      <TransitionPopover
        transition={sceneManager.activeTransition}
        onClose={() => sceneManager.setActiveTransition(null)}
        onTransitionChange={sceneManager.handleTransitionChange}
      />

      <AnimationLibraryPanel
        isOpen={ui.showAnimationLibrary}
        onClose={() => ui.setShowAnimationLibrary(false)}
        onSelect={overlayHandlers.handleSelectAnimation}
        onSelectGSAP={overlayHandlers.handleSelectGSAPAnimation}
      />

      <SavedSessionsPanel

        presets={layoutManager.presets}
        onDeletePreset={layoutManager.handleDeletePreset}
        onLoadPreset={layoutManager.handleLoadPreset}
        isOpen={ui.showSessionsPanel}
        onClose={() => ui.setShowSessionsPanel(false)}
      />

      <ExcalidrawOverlay
        isVisible={drawing.isDrawing}
        onClose={() => drawing.setIsDrawing(false)}
        initialElements={drawing.excalidrawElements}
        onElementsChange={drawing.setExcalidrawElements}
      />

      <RemoteConnectModal
        isOpen={remote.isRemoteModalOpen}
        onOpenChange={(open: boolean) => {
          remote.setIsRemoteModalOpen(open);
          if (!open) remote.setHasDismissedRemoteModal(true);
        }}
        peerId={remote.peerId}
        isConnected={remote.isRemoteConnected}
      />
    </>
  );
};
