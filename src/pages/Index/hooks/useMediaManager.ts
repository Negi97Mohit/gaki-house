// src/pages/index/hooks/useMediaManager.ts
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

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
  const [audioStreamForSpeech, setAudioStreamForSpeech] =
    useState<MediaStream | null>(null);

  // Enumerate Devices
  useEffect(() => {
    const getDevices = async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        const devices = await navigator.mediaDevices.enumerateDevices();
        setAudioDevices(devices.filter((d) => d.kind === "audioinput"));
        setVideoDevices(devices.filter((d) => d.kind === "videoinput"));
      } catch (err) {
        console.warn("Could not enumerate devices:", err);
      }
    };
    getDevices();
  }, []);

  // Manage Speech Recognition Audio Stream
  useEffect(() => {
    let dedicatedAudioStream: MediaStream | null = null;

    const manageAudioStream = async () => {
      if (isAudioOn) {
        try {
          const constraints: MediaStreamConstraints = {
            audio: selectedAudioDevice
              ? { deviceId: { exact: selectedAudioDevice } }
              : true,
          };
          dedicatedAudioStream = await navigator.mediaDevices.getUserMedia(
            constraints
          );
          setAudioStreamForSpeech(dedicatedAudioStream);
        } catch (err) {
          console.error(
            "Failed to get dedicated audio stream for captions:",
            err
          );
          toast.error("Could not access microphone for captions.");
          onAudioToggle(false);
        }
      } else {
        if (audioStreamForSpeech) {
          audioStreamForSpeech.getTracks().forEach((track) => track.stop());
          setAudioStreamForSpeech(null);
        }
      }
    };

    manageAudioStream();

    return () => {
      if (dedicatedAudioStream) {
        dedicatedAudioStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isAudioOn, selectedAudioDevice, onAudioToggle, sceneId]);

  return {
    audioDevices,
    videoDevices,
    audioStreamForSpeech,
  };
};
