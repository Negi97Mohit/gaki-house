import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { notify } from "@/shared/lib/notify";
import { useStreamStore } from "@/stores/stream.store";
import { useMediaPipeline } from "./useMediaPipeline";
import { useLocalRecorder } from "./useLocalRecorder";

const SERVER_URL = "http://localhost:3000";

// Define Electron Window Interface locally
interface ElectronWindow extends Window {
  electron?: {
    stream: {
      start: (config: {
        id: string;
        rtmpUrl: string;
        key: string;
        mimeType?: string;
      }) => void;
      sendData: (chunk: ArrayBuffer) => void;
      stop: (config?: { id?: string }) => void;
      onStatus: (
        callback: (data: {
          id?: string;
          status: string;
          error?: string;
        }) => void
      ) => void;
      onFfmpegReady: (callback: (data: { id?: string }) => void) => void;
    };
  };
}

export const useRtmpStream = () => {
  // Store State
  const {
    destinations,
    isBroadcasting,
    isRecording,
    isConnecting,
    setBroadcasting,
    setConnecting,
    setStreamStatus,
    setCountdown,
    setDestinationStatus,
  } = useStreamStore();

  const [localCountdown, setLocalCountdown] = useState<number | null>(null);

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // --- Hooks (Sub-systems) ---
  const { startPipeline, stopPipeline } = useMediaPipeline();
  const { startLocalRecording, stopLocalRecording, handleRecorderChunk } =
    useLocalRecorder();

  const isElectron = !!(window as ElectronWindow).electron;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.off("stream-status");
        socketRef.current.off("ffmpeg-ready");
      }
    };
  }, []);

  // --- Unified Data Router ---
  // This function receives raw video chunks and decides where to send them
  const handleStreamOutput = async (event: BlobEvent) => {
    if (event.data.size > 0) {
      // 1. Route to RTMP (if live)
      if (useStreamStore.getState().isBroadcasting) {
        if (isElectron) {
          const buffer = await event.data.arrayBuffer();
          (window as ElectronWindow).electron?.stream.sendData(buffer);
        } else {
          if (socketRef.current && socketRef.current.connected) {
            socketRef.current.emit("binary-stream", event.data);
          }
        }
      }

      // 2. Route to Local Recorder (if recording)
      if (useStreamStore.getState().isRecording) {
        handleRecorderChunk(event.data);
      }
    }
  };

  // --- Recorder Lifecycle Management ---
  // Ensures MediaRecorder is running if EITHER broadcasting OR recording is active
  const ensureMediaRecorder = async () => {
    // If we already have a recorder running, return its mimeType
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      return mediaRecorderRef.current.mimeType;
    }

    console.log("[StreamEngine] Starting MediaRecorder...");

    // 1. Get Mixed Stream from Pipeline (Video + Mic + System Audio)
    const combinedStream = await startPipeline();

    // 2. Determine Best Codec
    const getMimeType = () => {
      const types = [
        "video/webm; codecs=h264",
        "video/webm; codecs=vp9",
        "video/webm; codecs=vp8",
        "video/webm",
      ];
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          console.log(`[StreamEngine] Using codec: ${type}`);
          return type;
        }
      }
      return "video/webm";
    };

    const mimeType = getMimeType();

    // 3. Setup Recorder
    const options: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: 3000000, // 6 Mbps target for high quality local recording
    };

    const mediaRecorder = new MediaRecorder(combinedStream, options);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = handleStreamOutput;

    // Start immediately with 1s chunks
    mediaRecorder.start(1000);

    return mimeType;
  };

  const checkAutoStop = () => {
    // If both consumers are inactive, we can shut down the pipeline
    const state = useStreamStore.getState();
    if (!state.isBroadcasting && !state.isRecording) {
      console.log(
        "[StreamEngine] No active consumers. Shutting down pipeline."
      );

      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
      stopPipeline();
      setStreamStatus("Idle");
    }
  };

  // --- Public Action: Manual Record Toggle ---
  const toggleRecording = async () => {
    console.log("--- DEBUG: toggleRecording Called ---");
    const currentlyRecording = useStreamStore.getState().isRecording;
    console.log("Current Recording State:", currentlyRecording);

    if (currentlyRecording) {
      // Stop Recording
      console.log("Action: Stopping Local Recording...");
      await stopLocalRecording();
      checkAutoStop();
    } else {
      // Start Recording
      try {
        console.log("Action: Starting Local Recording...");
        await ensureMediaRecorder();
        await startLocalRecording();
      } catch (err) {
        console.error("FAILED to toggle recording:", err);
        notify.error("Could not start recording");
      }
    }
  };

  // --- Public Action: Start Broadcast ---
  const initiateStreams = async (targetDestinations: typeof destinations) => {
    console.log("[StreamEngine] ========== INITIATE STREAMS CALLED ==========");
    console.log("[StreamEngine] Target destinations:", targetDestinations.length);

    try {
      setConnecting(true);
      setStreamStatus("Initializing...");

      // 1. Ensure Engine is Running
      const mimeType = await ensureMediaRecorder();
      console.log("[StreamEngine] MediaRecorder ensured, mimeType:", mimeType);

      // 2. Manual Recording Control
      // Users can now start/stop recording independently using the record button
      // Recording no longer auto-starts with streaming
      /*
      if (!useStreamStore.getState().isRecording) {
        console.log("[StreamEngine] Auto-starting local recording...");
        await startLocalRecording();
      }
      */

      // 3. Connect RTMP
      if (isElectron) {
        console.log("[StreamEngine] ELECTRON MODE - Connecting to ffmpeg process...");
        setStreamStatus("Connecting to process...");
        const electron = (window as ElectronWindow).electron!;

        // Attach Status Listener
        electron.stream.onStatus((data) => {
          console.log("[StreamEngine] RTMP Status Update:", data);
          if (data.id) {
            setDestinationStatus(data.id, data.status as any, data.error);
          }
          if (data.status === "started") {
            setBroadcasting(true);
            setConnecting(false);
            setStreamStatus("Live");
          }
        });

        // Start Targets
        targetDestinations.forEach((dest) => {
          if (dest.enabled) {
            console.log("[StreamEngine] Starting RTMP stream for:", dest.platform, dest.url);
            setDestinationStatus(dest.id, "starting");
            electron.stream.start({
              id: dest.id,
              rtmpUrl: dest.url,
              key: dest.key,
              mimeType: mimeType as string,
            });
            console.log("[StreamEngine] electron.stream.start() called");
          }
        });
      } else {
        console.log("[StreamEngine] WEB MODE - Connecting to server...");
        // --- WEB MODE ---
        setStreamStatus("Connecting to server...");
        if (!socketRef.current) {
          socketRef.current = io(SERVER_URL);

          socketRef.current.on(
            "stream-status",
            (data: { id: string; status: string; error?: string } | string) => {
              const status = typeof data === "string" ? data : data.status;
              const id = typeof data === "string" ? undefined : data.id;
              const error = typeof data === "string" ? undefined : data.error;

              if (id) setDestinationStatus(id, status as any, error);

              if (status === "started") {
                setBroadcasting(true);
                setConnecting(false);
                setStreamStatus("Live");
              }
            }
          );
        }

        if (!socketRef.current.connected) {
          await new Promise<void>((resolve) =>
            socketRef.current?.once("connect", () => resolve())
          );
        }

        targetDestinations.forEach((dest) => {
          if (dest.enabled) {
            setDestinationStatus(dest.id, "starting");
            socketRef.current?.emit("start-stream", {
              id: dest.id,
              rtmpUrl: dest.url,
              key: dest.key,
            });
          }
        });
      }
    } catch (err: any) {
      console.error("--- FATAL ERROR ---", err);
      notify.error(`Failed to start: ${err.message}`);
      fullStop();
    }
  };

  const startStreaming = async (specificDestId?: string) => {
    console.log("[StreamEngine] ========== START STREAMING CALLED ==========");
    console.log("[StreamEngine] specificDestId:", specificDestId);
    console.log("[StreamEngine] Total destinations in store:", destinations.length);
    console.log("[StreamEngine] All destinations:", JSON.stringify(destinations, null, 2));

    const targets = specificDestId
      ? destinations.filter((d) => d.id === specificDestId)
      : destinations.filter((d) => d.enabled);

    console.log("[StreamEngine] Filtered targets:", targets.length);
    console.log("[StreamEngine] Targets:", JSON.stringify(targets, null, 2));

    if (targets.length === 0) {
      // No destinations configured - notify UI to open configuration
      console.error("[StreamEngine] ❌ No enabled destinations found!");
      console.error("[StreamEngine] Destinations breakdown:");
      destinations.forEach((d, i) => {
        console.error(`  [${i}] ${d.platform} - enabled: ${d.enabled}, url: ${d.url}`);
      });
      notify.info("Please add and enable a stream destination first.");
      return;
    }

    console.log("[StreamEngine] ✅ Proceeding with streaming to", targets.length, "destination(s)");


    // Countdown Logic
    console.log("[StreamEngine] Starting 3-second countdown...");
    setLocalCountdown(3);
    setCountdown(3);
    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      console.log("[StreamEngine] Countdown:", count);
      setLocalCountdown(count);
      setCountdown(count);

      if (count <= 0) {
        console.log("[StreamEngine] Countdown complete! Calling initiateStreams...");
        if (countdownIntervalRef.current)
          clearInterval(countdownIntervalRef.current);
        setLocalCountdown(null);
        setCountdown(null);
        initiateStreams(targets);
      }
    }, 1000);
  };

  const stopStreaming = (specificDestId?: string) => {
    // Clear countdown if active
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setLocalCountdown(null);

    // Stop Specific Destination
    if (specificDestId) {
      if (isElectron) {
        (window as ElectronWindow).electron?.stream.stop({
          id: specificDestId,
        });
      } else {
        socketRef.current?.emit("stop-stream", { id: specificDestId });
      }
      setDestinationStatus(specificDestId, "idle");

      // We don't full stop unless all destinations are idle?
      // For simplicity, if specificId is passed, we assume the user just wants to stop that one.
    } else {
      // STOP ALL BROADCASTING
      if (isElectron) {
        (window as ElectronWindow).electron?.stream.stop();
      } else {
        socketRef.current?.emit("stop-stream");
      }

      setBroadcasting(false);
      setConnecting(false);
      setStreamStatus("Idle");
      destinations.forEach((d) => setDestinationStatus(d.id, "idle"));

      // Note: We do NOT automatically stop recording here.
      // User might want to keep recording the "outro" locally.
      // We only clean up resources if recording is also stopped.
      checkAutoStop();
    }
  };

  const fullStop = async () => {
    // Emergency / Full Stop
    await stopLocalRecording(); // Force stop record if active

    // Force stop streams
    if (isElectron) (window as ElectronWindow).electron?.stream.stop();
    else socketRef.current?.emit("stop-stream");

    setBroadcasting(false);
    setConnecting(false);
    setStreamStatus("Idle");
    destinations.forEach((d) => setDestinationStatus(d.id, "idle"));

    checkAutoStop();
  };

  return {
    destinations,
    isStreaming: isBroadcasting,
    isRecording, // Exposed for UI
    isConnecting,
    status: isBroadcasting ? "Live" : "Idle",
    countdown: localCountdown,

    // Actions
    startStreaming,
    stopStreaming,
    toggleRecording, // Exposed for UI
  };
};
