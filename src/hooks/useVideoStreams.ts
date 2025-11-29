// src/hooks/useVideoStreams.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UseVideoStreamsProps {
  isCameraOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  selectedCameraDevice?: string;
  selectedAudioDevice?: string;
  onScreenShareEnd: () => void;
}

export const useVideoStreams = ({
  isCameraOn,
  isAudioOn,
  isScreenSharing,
  selectedCameraDevice,
  selectedAudioDevice,
  onScreenShareEnd,
}: UseVideoStreamsProps) => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const isRequestingScreen = useRef(false);

  // Keep refs to the active streams for cleanup
  const activeCameraStreamRef = useRef<MediaStream | null>(null);
  const activeScreenStreamRef = useRef<MediaStream | null>(null);

  const stopTracks = useCallback((stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  // --- Camera Logic ---
  useEffect(() => {
    // 1. If camera is off, cleanup and exit
    if (!isCameraOn) {
      if (activeCameraStreamRef.current) {
        stopTracks(activeCameraStreamRef.current);
        activeCameraStreamRef.current = null;
        setCameraStream(null);
      }
      return;
    }

    // 2. If camera is on, request stream
    let isCancelled = false;
    const getCameraStream = async () => {
      try {
        const constraints: MediaStreamConstraints = {
          video: selectedCameraDevice
            ? {
                deviceId: { exact: selectedCameraDevice },
                width: { ideal: 1280 },
                height: { ideal: 720 },
              }
            : { width: { ideal: 1280 }, height: { ideal: 720 } },
          // Explicitly disable audio for camera stream to avoid feedback/conflict
          // Audio is handled separately in VideoCanvas
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (isCancelled) {
          stopTracks(stream);
          return;
        }

        console.log("✅ Camera stream active:", stream.id);

        // Stop previous stream if any (double check)
        if (activeCameraStreamRef.current) {
          stopTracks(activeCameraStreamRef.current);
        }

        activeCameraStreamRef.current = stream;
        setCameraStream(stream);
      } catch (err) {
        console.error("Camera error:", err);
        if (!isCancelled) {
          setCameraStream(null);
          activeCameraStreamRef.current = null;
        }

        if ((err as Error).name === "NotAllowedError") {
          toast.error("Camera permission denied.");
        } else {
          toast.error(`Camera error: ${(err as Error).message}`);
        }
      }
    };

    getCameraStream();

    return () => {
      isCancelled = true;
      // We don't stop tracks here on re-render because we want smooth transitions,
      // but we do stop them if isCameraOn becomes false (handled at start of effect)
      // or if the component unmounts (handled by separate effect).
    };
  }, [isCameraOn, selectedCameraDevice, stopTracks]);

  // --- Screen Share Logic ---
  useEffect(() => {
    if (isScreenSharing && !screenStream && !isRequestingScreen.current) {
      isRequestingScreen.current = true;
      const getScreenStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: { ideal: 1920 }, height: { ideal: 1080 } },
            audio: isAudioOn, // System audio might be desired for screen share
          });
          console.log("✅ Screen stream attached");

          const videoTrack = stream.getVideoTracks()[0];
          videoTrack.onended = () => {
            console.log("🛑 Screen share ended");
            onScreenShareEnd();
            stopTracks(stream);
            toast.info("Screen sharing stopped");
          };

          activeScreenStreamRef.current = stream;
          setScreenStream(stream);
        } catch (err) {
          console.error("Screen share error:", err);
          if ((err as Error).name === "NotAllowedError") {
            toast.error("Screen share permission denied.");
          } else {
            toast.error(`Screen share error: ${(err as Error).message}`);
          }
          onScreenShareEnd();
        } finally {
          isRequestingScreen.current = false;
        }
      };
      getScreenStream();
    } else if (!isScreenSharing && screenStream) {
      if (activeScreenStreamRef.current) {
        stopTracks(activeScreenStreamRef.current);
        activeScreenStreamRef.current = null;
      }
      setScreenStream(null);
    }
  }, [isScreenSharing, onScreenShareEnd, stopTracks, isAudioOn, screenStream]);

  // --- Cleanup on Unmount ---
  useEffect(() => {
    return () => {
      if (activeCameraStreamRef.current)
        stopTracks(activeCameraStreamRef.current);
      if (activeScreenStreamRef.current)
        stopTracks(activeScreenStreamRef.current);
    };
  }, [stopTracks]);

  return { cameraStream, screenStream };
};
