// src/features/stream/hooks/useVideoStreams.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { useStreamStore } from "@/stores/stream.store";

interface UseVideoStreamsProps {
  isCameraOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  selectedCameraDevice?: string;
  selectedAudioDevice?: string;
  onScreenShareEnd: () => void;
  remoteStream?: MediaStream | null;
}

export const useVideoStreams = ({
  isCameraOn,
  isAudioOn,
  isScreenSharing,
  selectedCameraDevice,
  selectedAudioDevice,
  onScreenShareEnd,
  remoteStream,
}: UseVideoStreamsProps) => {
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const isRequestingScreen = useRef(false);

  // NEW: Connect to the stream store to get the selected source ID
  const { activeSourceId, captureMode } = useStreamStore();
  const isElectron = !!(window as any).electron;

  // Keep refs to the active streams for cleanup
  const activeCameraStreamRef = useRef<MediaStream | null>(null);
  const activeScreenStreamRef = useRef<MediaStream | null>(null);

  const stopTracks = useCallback((stream: MediaStream | null) => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
  }, []);

  // --- Camera Logic (Unchanged) ---
  useEffect(() => {
    if (!isCameraOn) {
      if (activeCameraStreamRef.current) {
        stopTracks(activeCameraStreamRef.current);
        activeCameraStreamRef.current = null;
        setCameraStream(null);
      }
      return;
    }

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
          audio: false,
        };

        if (selectedCameraDevice === "remote-peer") {
          if (remoteStream) {
            console.log("✅ Using Remote Stream");
            setCameraStream(remoteStream);
            if (activeCameraStreamRef.current) {
              stopTracks(activeCameraStreamRef.current);
              activeCameraStreamRef.current = null;
            }
          } else {
            setCameraStream(null);
          }
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia(constraints);

        if (isCancelled) {
          stopTracks(stream);
          return;
        }

        console.log("✅ Camera stream active:", stream.id);

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
    };
  }, [isCameraOn, selectedCameraDevice, stopTracks, remoteStream]);

  // --- REFACTORED: Screen Share Logic ---
  useEffect(() => {
    // 1. If screen sharing is disabled, cleanup
    if (!isScreenSharing) {
      if (screenStream) {
        if (activeScreenStreamRef.current) {
          stopTracks(activeScreenStreamRef.current);
          activeScreenStreamRef.current = null;
        }
        setScreenStream(null);
      }
      return;
    }

    // 2. Prevent redundant requests or loops
    if (isRequestingScreen.current) return;

    // If we already have a stream AND the source ID hasn't changed (or we are in Web mode), skip
    // NOTE: In Electron, if activeSourceId changes, we re-run this effect to fetch the new source
    if (
      screenStream &&
      (!isElectron ||
        (activeScreenStreamRef.current as any)?._sourceId === activeSourceId)
    ) {
      return;
    }

    isRequestingScreen.current = true;

    const getScreenStream = async () => {
      try {
        let stream: MediaStream;

        if (isElectron) {
          // ELECTRON MODE: Use activeSourceId from store
          if (!activeSourceId) {
            console.log("[useVideoStreams] Waiting for source selection...");
            isRequestingScreen.current = false;
            return; // Wait for the picker (controlled by useRtmpStream) to set the ID
          }

          console.log(`[useVideoStreams] Fetching source: ${activeSourceId}`);
          stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              // @ts-ignore
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: activeSourceId,
                minWidth: 1280,
                maxWidth: 1920,
                minHeight: 720,
                maxHeight: 1080,
              },
            },
          } as any);

          // Tag the stream with the ID so we know not to re-fetch it
          (stream as any)._sourceId = activeSourceId;
        } else {
          // WEB MODE: Standard Browser Picker
          stream = await navigator.mediaDevices.getDisplayMedia({
            video: {
              displaySurface: "browser",
              width: { ideal: 1920 },
              height: { ideal: 1080 },
              frameRate: 30,
            },
            audio: isAudioOn,
            // @ts-ignore
            preferCurrentTab: true,
          });
        }

        console.log("✅ Screen stream attached");

        const videoTrack = stream.getVideoTracks()[0];
        videoTrack.onended = () => {
          console.log("🛑 Screen share ended");
          onScreenShareEnd();
          stopTracks(stream);
          toast.info("Screen sharing stopped");
        };

        // Stop previous
        if (activeScreenStreamRef.current) {
          stopTracks(activeScreenStreamRef.current);
        }

        activeScreenStreamRef.current = stream;
        setScreenStream(stream);
      } catch (err) {
        console.error("Screen share error:", err);
        if ((err as Error).name === "NotAllowedError") {
          // Only show error if it wasn't a programmatic switch
          if (!isElectron) toast.error("Screen share permission denied.");
        } else {
          toast.error(`Screen share error: ${(err as Error).message}`);
        }
        onScreenShareEnd();
      } finally {
        isRequestingScreen.current = false;
      }
    };

    getScreenStream();
  }, [
    isScreenSharing,
    onScreenShareEnd,
    stopTracks,
    isAudioOn,
    screenStream,
    activeSourceId,
    isElectron,
  ]);

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
