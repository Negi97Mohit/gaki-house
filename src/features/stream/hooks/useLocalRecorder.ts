import { useRef, useCallback } from "react";
import { useStreamStore } from "@/stores/stream.store";
import { notify } from "@/shared/lib/notify";

// Define Electron Interface for Recorder IPC
interface ElectronWindow extends Window {
  electron?: {
    recorder: {
      start: () => Promise<{ filePath: string }>;
      write: (chunk: ArrayBuffer) => Promise<void>;
      stop: () => Promise<{ filePath: string }>;
    };
  };
}

export const useLocalRecorder = () => {
  const { setRecording, setRecordingStatus, setRecordingDuration } =
    useStreamStore();

  const startTimeRef = useRef<number | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recordedBlobsRef = useRef<Blob[]>([]); // For Web Mode
  const isElectron = !!(window as ElectronWindow).electron;

  // --- Timer Logic ---
  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    setRecordingDuration(0);

    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    timerIntervalRef.current = setInterval(() => {
      if (startTimeRef.current) {
        const diff = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordingDuration(diff);
      }
    }, 1000);
  }, [setRecordingDuration]);

  const stopTimer = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    startTimeRef.current = null;
  }, []);

  // --- Actions ---

  const startLocalRecording = useCallback(async () => {
    try {
      console.log("[Recorder] Starting local recording...");
      if (setRecordingStatus) setRecordingStatus("recording");
      setRecording(true);
      startTimer();

      if (isElectron) {
        // Electron: Tell main process to open a write stream
        const electron = (window as ElectronWindow).electron!;
        const { filePath } = await electron.recorder.start();
        notify.success(`Recording started: ${filePath.split("\\").pop()}`);
      } else {
        // Web: Clear previous blobs
        recordedBlobsRef.current = [];
        notify.success("Recording started (Local Cache)");
      }
    } catch (error) {
      console.error("[Recorder] Start failed:", error);
      notify.error("Failed to start recording");
      if (setRecordingStatus) setRecordingStatus("error");
      setRecording(false);
      stopTimer();
    }
  }, [isElectron, setRecording, setRecordingStatus, startTimer, stopTimer]);

  const stopLocalRecording = useCallback(async () => {
    try {
      console.log("[Recorder] Stopping local recording...");
      if (setRecordingStatus) setRecordingStatus("stopping");
      stopTimer();

      if (isElectron) {
        // Electron: Close file stream
        const electron = (window as ElectronWindow).electron!;
        const { filePath } = await electron.recorder.stop();
        notify.success(`Saved to: ${filePath}`);
      } else {
        // Web: Download Blob
        if (recordedBlobsRef.current.length === 0) {
          console.warn("[Recorder] No data recorded");
          if (setRecordingStatus) setRecordingStatus("idle");
          setRecording(false);
          return;
        }

        const blob = new Blob(recordedBlobsRef.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `recording-${new Date().toISOString()}.webm`;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        setTimeout(() => {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
          recordedBlobsRef.current = []; // Free memory
        }, 100);

        notify.success("Recording downloaded!");
      }

      if (setRecordingStatus) setRecordingStatus("saved");
      setRecording(false);

      // Reset status after a moment
      if (setRecordingStatus) {
        setTimeout(() => setRecordingStatus("idle"), 3000);
      }
    } catch (error) {
      console.error("[Recorder] Stop failed:", error);
      notify.error("Failed to save recording");
      if (setRecordingStatus) setRecordingStatus("error");
    }
  }, [isElectron, setRecordingStatus, setRecording, stopTimer]);

  // --- Data Handler ---
  const handleRecorderChunk = useCallback(
    async (blob: Blob) => {
      if (blob.size === 0) return;

      if (isElectron) {
        try {
          const buffer = await blob.arrayBuffer();
          await (window as ElectronWindow).electron?.recorder.write(buffer);
        } catch (e) {
          console.error("[Recorder] Write failed:", e);
        }
      } else {
        recordedBlobsRef.current.push(blob);
      }
    },
    [isElectron]
  );

  return {
    startLocalRecording,
    stopLocalRecording,
    handleRecorderChunk,
  };
};
