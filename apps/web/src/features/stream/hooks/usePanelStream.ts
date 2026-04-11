import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";

export const usePanelStream = (
  deviceId: string | undefined,
  panelId: string,
  isEnabled: boolean = true
) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeStreamRef = useRef<MediaStream | null>(null);
  
  // Track the current device ID requested so we can ignore stale requests
  const requestedDeviceIdRef = useRef<string | undefined>(deviceId);

  useEffect(() => {
    // If stream is disabled or no specific device is selected, clean up
    if (!isEnabled || !deviceId) {
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((t) => t.stop());
        activeStreamRef.current = null;
        setStream(null);
      }
      return;
    }

    requestedDeviceIdRef.current = deviceId;
    let isCancelled = false;

    const startStream = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            deviceId: { exact: deviceId },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false, // Audio is managed globally
        });

        if (isCancelled || requestedDeviceIdRef.current !== deviceId) {
          newStream.getTracks().forEach((track) => track.stop());
          return;
        }

        if (activeStreamRef.current) {
          activeStreamRef.current.getTracks().forEach((t) => t.stop());
        }

        activeStreamRef.current = newStream;
        setStream(newStream);
      } catch (err: any) {
        if (!isCancelled && requestedDeviceIdRef.current === deviceId) {
          console.error(`[usePanelStream] Error starting stream for panel ${panelId}:`, err);
          setError(err.message || "Failed to access camera");
          if (err.name === "NotAllowedError") {
            toast.error("Camera permission denied.");
          } else {
            toast.error(`Camera error: ${err.message}`);
          }
        }
      } finally {
        if (!isCancelled && requestedDeviceIdRef.current === deviceId) {
          setIsLoading(false);
        }
      }
    };

    startStream();

    return () => {
      isCancelled = true;
      if (activeStreamRef.current) {
        activeStreamRef.current.getTracks().forEach((t) => t.stop());
        activeStreamRef.current = null;
        setStream(null);
      }
    };
  }, [deviceId, panelId, isEnabled]);

  return { stream, isLoading, error };
};
