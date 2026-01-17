// src/hooks/useVideoStreams.ts
import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";

interface UseVideoStreamsProps {
  isCameraOn: boolean;
  isAudioOn: boolean;
  isScreenSharing: boolean;
  selectedCameraDevice?: string;
  selectedAudioDevice?: string;
  selectedScreenSourceId?: string; // ADDED
  onScreenShareEnd: () => void;
  remoteStream?: MediaStream | null;
}

export const useVideoStreams = ({
  isCameraOn,
  isAudioOn,
  isScreenSharing,
  selectedCameraDevice,
  selectedAudioDevice,
  selectedScreenSourceId, // ADDED
  onScreenShareEnd,
  remoteStream,
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

        if (selectedCameraDevice === "remote-peer") {
          if (remoteStream) {
            console.log("✅ Using Remote Stream");
            setCameraStream(remoteStream);
            // We don't set activeCameraStreamRef here because we don't want to stop the remote tracks
            // when switching devices (we want to keep the connection alive).
            // But we do need to clear the previous local stream if any.
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
  }, [isCameraOn, selectedCameraDevice, stopTracks, remoteStream]);

  // --- Screen Share Logic ---
  useEffect(() => {
    // Determine if we need to switch sources
    const hasSourceChanged = activeScreenStreamRef.current &&
      (activeScreenStreamRef.current as any)._sourceId !== selectedScreenSourceId;

    if (hasSourceChanged) {
      console.log("Source changed, stopping old stream...");
      if (activeScreenStreamRef.current) {
        stopTracks(activeScreenStreamRef.current);
        activeScreenStreamRef.current = null;
        setScreenStream(null);
      }
      isRequestingScreen.current = false; // Reset requesting flag to allow new request
    }

    // CHANGE: require selectedScreenSourceId if trying to share
    if (isScreenSharing && (!screenStream || hasSourceChanged) && !isRequestingScreen.current) {
      // If no source ID, wait for selection
      if (!selectedScreenSourceId) {
        // console.log("Waiting for screen source selection..."); // reduce log spam
        return;
      }

      isRequestingScreen.current = true;
      const getScreenStream = async () => {
        try {
          const constraints = {
            audio: isAudioOn ? {
              mandatory: {
                chromeMediaSource: 'desktop'
              }
            } : false,
            video: {
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: selectedScreenSourceId,
                maxWidth: 1920,
                maxHeight: 1080,
                maxFrameRate: 30
              }
            }
          } as any;

          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          console.log("✅ Screen stream attached via sourceId:", selectedScreenSourceId);

          // Tag the stream with the source ID so we know what it is
          (stream as any)._sourceId = selectedScreenSourceId;

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
  }, [isScreenSharing, onScreenShareEnd, stopTracks, isAudioOn, screenStream, selectedScreenSourceId]);

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
