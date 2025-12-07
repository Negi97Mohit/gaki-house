import { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";

interface UsePictureInPictureProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export const usePictureInPicture = ({
  canvasRef,
}: UsePictureInPictureProps) => {
  const [isPipActive, setIsPipActive] = useState(false);

  // We keep a reference to a detached video element.
  // This element is never added to the DOM, but it can still host a stream and trigger PiP.
  const pipVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize the hidden video element once on mount
  useEffect(() => {
    const video = document.createElement("video");
    video.muted = true; // Required for autoplay without user interaction
    video.autoplay = true;
    video.playsInline = true;

    // Listen for when the user closes PiP via the browser's native UI (X button)
    const handleLeavePip = () => {
      setIsPipActive(false);
      cleanup();
    };

    video.addEventListener("leavepictureinpicture", handleLeavePip);
    pipVideoRef.current = video;

    return () => {
      video.removeEventListener("leavepictureinpicture", handleLeavePip);
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    // Stop the captured stream tracks to free up GPU/CPU resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (pipVideoRef.current) {
      pipVideoRef.current.srcObject = null;
    }
  }, []);

  const togglePiP = useCallback(async () => {
    // 1. Check browser support
    if (!document.pictureInPictureEnabled || !pipVideoRef.current) {
      toast.error(
        "Picture-in-Picture is not supported or disabled in this browser."
      );
      return;
    }

    // 2. If PiP is already active, close it
    if (document.pictureInPictureElement) {
      try {
        await document.exitPictureInPicture();
        // Note: setIsPipActive(false) will be called by the 'leavepictureinpicture' event listener
      } catch (err) {
        console.error("[usePictureInPicture] Failed to exit:", err);
      }
      return;
    }

    // 3. If PiP is inactive, open it
    if (!canvasRef.current) {
      console.warn("[usePictureInPicture] Canvas ref is null");
      return;
    }

    try {
      // Capture the visual state of the canvas as a MediaStream
      // 30 FPS is standard for PiP and saves resources compared to 60
      const stream = canvasRef.current.captureStream(30);
      streamRef.current = stream;

      pipVideoRef.current.srcObject = stream;

      // We must play the video before requesting PiP
      await pipVideoRef.current.play();

      await pipVideoRef.current.requestPictureInPicture();
      setIsPipActive(true);
    } catch (err) {
      console.error("[usePictureInPicture] Failed to enter:", err);
      toast.error("Failed to open Picture-in-Picture.");
      cleanup();
    }
  }, [canvasRef, cleanup]);

  return {
    isPipActive,
    togglePiP,
  };
};
