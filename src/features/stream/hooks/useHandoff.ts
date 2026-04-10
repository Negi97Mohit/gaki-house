import { handoffStore } from "@caption-cam/handoff-sdk";
import { useHandoffSystem } from "../context/HandoffContext";

export function useHandoff() {
  // Consume the global state from the SDK
  const activeDevice = handoffStore((state) => state.activeDevice);
  const isRelinquishing = handoffStore((state) => state.isRelinquishing);
  const connectionState = handoffStore((state) => state.connectionState);
  const availableDevices = handoffStore((state) => state.availableDevices);

  // Consume the methods from the Context Provider
  const { coordinator, registry, streamManager } = useHandoffSystem();
  const localDeviceId = registry?.currentDevice?.deviceId || "";

  return {
    localDeviceId,
    activeDevice,
    isRelinquishing,
    connectionState,
    availableDevices,
    coordinator,
    streamManager,
    isActiveDevice: localDeviceId === activeDevice,
  };
}
