import { useState, useEffect } from "react";
import { useRemotePeer } from "@/hooks/useRemotePeer";
import { SceneState } from "@/types/editor"; // Assuming this type exists or similar

export const useRemoteConnection = (activeScene: SceneState | null) => {
  const { peerId, remoteStream, isConnected } = useRemotePeer();
  const [isRemoteModalOpen, setIsRemoteModalOpen] = useState(false);
  const [hasDismissedRemoteModal, setHasDismissedRemoteModal] = useState(false);

  // Reset dismissal when switching AWAY from remote peer
  useEffect(() => {
    if (activeScene?.selectedVideoDevice !== "remote-peer") {
      setHasDismissedRemoteModal(false);
    }
  }, [activeScene?.selectedVideoDevice]);

  // Auto-open modal logic
  useEffect(() => {
    if (
      activeScene?.selectedVideoDevice === "remote-peer" &&
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
