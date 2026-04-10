import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { db, auth } from "@/lib/firebase"; // Your existing Firebase client
import {
  DeviceRegistry,
  StreamManager,
  HandoffCoordinator,
  DevicePlatform,
} from "@caption-cam/handoff-sdk";

interface HandoffContextValue {
  registry: DeviceRegistry | null;
  coordinator: HandoffCoordinator | null;
  streamManager: StreamManager | null;
}

const HandoffContext = createContext<HandoffContextValue>({
  registry: null,
  coordinator: null,
  streamManager: null,
});

export const HandoffProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [instances, setInstances] = useState<HandoffContextValue>({
    registry: null,
    coordinator: null,
    streamManager: null,
  });

  // Use a ref to ensure the cleanup function always has the latest instances
  const instancesRef = useRef<HandoffContextValue>({
    registry: null,
    coordinator: null,
    streamManager: null,
  });

  useEffect(() => {
    // Wait for Firebase Auth to resolve
    const unsubscribeAuth = auth.onAuthStateChanged(async (user) => {
      // 1. Disconnect previous instances before creating new ones (Fixes Ghost Devices on hot-reload)
      instancesRef.current.registry?.disconnect();
      instancesRef.current.coordinator?.disconnect();

      if (!user) {
        // Cleanup if logged out
        const emptyState = {
          registry: null,
          coordinator: null,
          streamManager: null,
        };
        setInstances(emptyState);
        instancesRef.current = emptyState;
        return;
      }

      // 1. Identify current platform
      const isElectron = navigator.userAgent.toLowerCase().includes("electron");
      const platform: DevicePlatform = isElectron ? "desktop" : "web";

      // Retrieve or generate a persistent unique ID for this specific browser/app instance
      let deviceId = localStorage.getItem("gaki-device-id");
      if (!deviceId) {
        deviceId = `${platform}-${Math.random().toString(36).substr(2, 9)}`;
        localStorage.setItem("gaki-device-id", deviceId);
      }

      // 2. Initialize Stream Manager
      const apiUrl =
        import.meta.env.VITE_HANDOFF_API_URL || "http://localhost:3001";
      const streamManager = new StreamManager(deviceId, apiUrl, async () => {
        const token = await auth.currentUser?.getIdToken();
        if (!token) throw new Error("Not authenticated");
        return token;
      });

      // 3. Initialize Registry (Firestore Discovery)
      const registry = new DeviceRegistry(db, user.uid, deviceId, platform);
      await registry.initialize();

      // 4. Initialize Coordinator (Signaling)
      const coordinator = new HandoffCoordinator(
        db,
        user.uid,
        deviceId,
        streamManager,
      );
      coordinator.listenForSignals();
      const newInstances = { registry, coordinator, streamManager };
      instancesRef.current = newInstances;
      setInstances(newInstances);
    });

    return () => {
      unsubscribeAuth();
      instancesRef.current.registry?.disconnect();
      instancesRef.current.coordinator?.disconnect();
    };
  }, []);

  return (
    <HandoffContext.Provider value={instances}>
      {children}
    </HandoffContext.Provider>
  );
};

export const useHandoffSystem = () => useContext(HandoffContext);
