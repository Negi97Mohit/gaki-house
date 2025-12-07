// src/pages/index/hooks/useMediaManager.ts
import { useState, useEffect } from "react";

interface UseMediaManagerProps {
  isAudioOn: boolean;
  selectedAudioDevice: string | undefined;
  sceneId: string;
  onAudioToggle: (enabled: boolean) => void;
}

export const useMediaManager = ({
  isAudioOn,
  selectedAudioDevice,
  sceneId,
  onAudioToggle,
}: UseMediaManagerProps) => {
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);

  // Enumerate Devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        // First enumeration
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
          console.warn("Media Devices API not available (requires HTTPS or localhost)");
          return;
        }
        let devices = await navigator.mediaDevices.enumerateDevices();

        // If labels are empty (browser security), trigger a quick permission request
        const hasLabels = devices.some((d) => d.label);
        if (!hasLabels) {
          try {
            const tempStream = await navigator.mediaDevices.getUserMedia({
              audio: true,
              video: true,
            });
            devices = await navigator.mediaDevices.enumerateDevices();
            // Immediately stop the temp stream to free up the device
            tempStream.getTracks().forEach((t) => t.stop());
          } catch (e) {
            console.warn("Permission request failed or cancelled", e);
          }
        }

        setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
        const vDevices = devices.filter((d) => d.kind === "videoinput");
        // Add Remote Camera option
        vDevices.push({
          deviceId: "remote-peer",
          kind: "videoinput",
          label: "📱 Remote Phone Camera",
          groupId: "remote",
          toJSON: () => ({}),
        } as MediaDeviceInfo);

        setVideoDevices(vDevices);
      } catch (err) {
        console.warn("Could not enumerate devices:", err);
      }
    };

    getDevices();

    // Auto-update lists when devices are plugged/unplugged
    const handleDeviceChange = () => {
      getDevices();
    };

    if (navigator.mediaDevices) {
      navigator.mediaDevices.addEventListener("devicechange", handleDeviceChange);
    }

    return () => {
      if (navigator.mediaDevices) {
        navigator.mediaDevices.removeEventListener("devicechange", handleDeviceChange);
      }
    };
  }, []);

  // Note: Actual stream management is now handled centrally in VideoCanvas
  // to avoid race conditions and duplicate streams.

  return {
    audioDevices,
    videoDevices,
  };
};
