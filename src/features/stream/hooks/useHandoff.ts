import { useState, useEffect, useCallback } from "react";
import { useStore } from "zustand";
import { handoffStore, LiveKitHandoffClient } from "@caption-cam/handoff-sdk";
import { v4 as uuidv4 } from "uuid";

// Keep the client instance outside the React lifecycle so it survives re-renders
let clientInstance: LiveKitHandoffClient | null = null;

export function useHandoff() {
  const activeDeviceId = useStore(
    handoffStore,
    (state) => state.activeDeviceId,
  );
  const isRelinquishing = useStore(
    handoffStore,
    (state) => state.isRelinquishing,
  );
  const connectionState = useStore(
    handoffStore,
    (state) => state.connectionState,
  );

  const [localDeviceId, setLocalDeviceId] = useState<string>("");

  useEffect(() => {
    // Generate or fetch a persistent device ID for this specific browser/app instance
    let storedId = localStorage.getItem("caption-cam-device-id");
    if (!storedId) {
      storedId = uuidv4();
      localStorage.setItem("caption-cam-device-id", storedId);
    }
    setLocalDeviceId(storedId);

    if (!clientInstance) {
      clientInstance = new LiveKitHandoffClient(storedId);
    }
  }, []);

  const takeOverStream = useCallback(
    async (roomName: string, participantName: string) => {
      if (!clientInstance) return;

      try {
        // 1. Fetch token from our handoff microservice
        // Note: In production, point this to your deployed handoff-api URL
        const response = await fetch("http://localhost:3001/join", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ roomName, participantName }),
        });

        if (!response.ok) throw new Error("Failed to fetch token");
        const { token } = await response.json();

        // 2. Connect via SDK
        const liveKitUrl =
          import.meta.env.VITE_LIVEKIT_URL || "ws://localhost:7880";
        await clientInstance.claimStream(liveKitUrl, token);
      } catch (error) {
        console.error("Handoff take over failed:", error);
      }
    },
    [],
  );

  return {
    localDeviceId,
    activeDeviceId,
    isRelinquishing,
    connectionState,
    takeOverStream,
    isActiveDevice: localDeviceId === activeDeviceId,
    clientInstance,
  };
}
