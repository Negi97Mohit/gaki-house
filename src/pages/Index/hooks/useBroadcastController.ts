import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSmartCameraSwitcher } from "@/features/stream/hooks/useSmartCameraSwitcher";
import { useCompositeStream } from "@/features/stream/hooks/useCompositeStream";
import { SceneState } from "@/types/caption";

interface UseBroadcastControllerProps {
  scenes: SceneState[];
  activeSceneId: string;
  onSceneSelect: (id: string) => void;
  remoteStream: MediaStream | undefined;
  videoDevices: MediaDeviceInfo[];
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const useBroadcastController = ({
  scenes,
  activeSceneId,
  onSceneSelect,
  remoteStream,
  videoDevices,
  canvasRef,
}: UseBroadcastControllerProps) => {
  const [isSmartSwitchEnabled, setIsSmartSwitchEnabled] = useState(false);
  const [isVirtualCameraEnabled, setIsVirtualCameraEnabled] = useState(false);

  useSmartCameraSwitcher({
    scenes,
    activeSceneId,
    onSceneSelect,
    isEnabled: isSmartSwitchEnabled,
    remoteStream,
    videoDevices,
  });

  const { outputStream, isReady: isCompositeReady, audioMixer } = useCompositeStream({
    enabled: isVirtualCameraEnabled,
    fps: 30,
  });

  useEffect(() => {
    if (isCompositeReady && outputStream) {
      toast.success("🎥 Broadcasting Active!");
    }
  }, [isCompositeReady, outputStream]);

  const toggleSmartSwitch = () => {
    setIsSmartSwitchEnabled((prev) => !prev);
    toast.info(
      isSmartSwitchEnabled
        ? "Smart Scene Switch: OFF"
        : "Smart Scene Switch: ON"
    );
  };

  const toggleBroadcast = () => setIsVirtualCameraEnabled((p) => !p);

  return {
    isSmartSwitchEnabled,
    setIsSmartSwitchEnabled,
    isVirtualCameraEnabled,
    setIsVirtualCameraEnabled,
    toggleSmartSwitch,
    toggleBroadcast,
    compositeStream: outputStream,
    audioMixer,
  };
};
