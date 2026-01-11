import { useState, useEffect } from "react";
import { useRemotePeer } from "@/hooks/useRemotePeer";
import { SceneState } from "@/types/editor";
import { useMediaStore } from "@/stores/media.store"; // Import store

export const useRemoteConnection = (activeScene: SceneState | null) => {
  const { peerId, remoteStream, isConnected } = useRemotePeer();
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);
  const [hasDismissedRemoteModal, setHasDismissedRemoteModal] = useState(false);

  // Get selected device from global store as well
  const selectedVideoDevice = useMediaStore((s) => s.selectedVideoDevice);

  // Reset dismissal when switching AWAY from remote peer
  useEffect(() => {
    if (
      activeScene?.selectedVideoDevice !== "remote-peer" &&
      selectedVideoDevice !== "remote-peer"
    ) {
      setHasDismissedRemoteModal(false);
    }
  }, [activeScene?.selectedVideoDevice, selectedVideoDevice]);

  // Auto-open modal logic
  useEffect(() => {
    // Trigger if scene has it saved OR if user just selected it in store
    const isRemoteSelected =
      activeScene?.selectedVideoDevice === "remote-peer" ||
      selectedVideoDevice === "remote-peer";

    if (
      isRemoteSelected &&
      !isConnected &&
      !isRemoteModalOpen &&
      !hasDismissedRemoteModal
    ) {
      setIsRemoteModalOpen(true);
    } else if (isConnected && isRemoteModalOpen) {
      setIsRemoteModalOpen(false);
    }
  }, [
    activeScene?.selectedVideoDevice,
    selectedVideoDevice,
    isConnected,
    isRemoteModalOpen,
    hasDismissedRemoteModal,
  ]);

  return {
    peerId,
    remoteStream,
    isRemoteConnected: isConnected,
    isRemoteModalOpen,
    setIsRemoteModalOpen,
    setHasDismissedRemoteModal,
  };
};
