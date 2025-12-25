import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useSmartCameraSwitcher } from "@/hooks/useSmartCameraSwitcher";
import { useCompositeStream } from "@/hooks/useCompositeStream";
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

  const { compositeStream, isReady: isCompositeReady } = useCompositeStream({
    canvasRef,
    isEnabled: isVirtualCameraEnabled,
    frameRate: 30,
  });

  useEffect(() => {
    if (isCompositeReady && compositeStream) {
      toast.success("🎥 Broadcasting Active!");
    }
  }, [isCompositeReady, compositeStream]);

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
    compositeStream,
  };
};
