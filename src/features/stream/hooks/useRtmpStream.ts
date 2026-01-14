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
  const isCountdownActive = useRef(false);

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
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, []);

  // --- Unified Data Router ---
  const handleStreamOutput = async (event: BlobEvent) => {
    if (event.data.size > 0) {
      const state = useStreamStore.getState();

      // 1. Route to RTMP (if live OR connecting/counting down)
      // IMPORTANT: We send data during 'connecting' so the backend buffer fills up.
      // This prevents "empty stream" errors when ffmpeg finally starts.
      if (state.isBroadcasting || state.isConnecting) {
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
      if (state.isRecording) {
        handleRecorderChunk(event.data);
      }
    }
  };

  // --- Recorder Lifecycle Management ---
  const ensureMediaRecorder = async () => {
    // If we already have a recorder running, return its mimeType
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      return mediaRecorderRef.current.mimeType;
    }

    console.log("[StreamEngine] Starting MediaRecorder...");

    // 1. Get Mixed Stream from Pipeline
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
      videoBitsPerSecond: 3000000,
    };

    const mediaRecorder = new MediaRecorder(combinedStream, options);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = handleStreamOutput;

    // Start immediately with 1s chunks
    mediaRecorder.start(1000);

    return mimeType;
  };

  const checkAutoStop = () => {
    const state = useStreamStore.getState();
    // Only stop if NOT broadcasting AND NOT recording AND NOT connecting
    if (!state.isBroadcasting && !state.isRecording && !state.isConnecting) {
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

  // --- Countdown Logic ---
  const startCountdown = () => {
    if (isCountdownActive.current) {
      console.log("[StreamEngine] Countdown already active, skipping trigger.");
      return;
    }

    console.log(
      "[StreamEngine] >>> Connection established! Starting 3-second countdown... <<<"
    );
    isCountdownActive.current = true;
    setLocalCountdown(3);
    setCountdown(3);
    setStreamStatus("Starting in 3...");

    if (countdownIntervalRef.current)
      clearInterval(countdownIntervalRef.current);

    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      console.log("[StreamEngine] Countdown tick:", count);
      setLocalCountdown(count);
      setCountdown(count);

      if (count > 0) {
        setStreamStatus(`Starting in ${count}...`);
      }

      if (count <= 0) {
        console.log(
          "[StreamEngine] Countdown complete! Transitioning to LIVE."
        );
        if (countdownIntervalRef.current)
          clearInterval(countdownIntervalRef.current);

        setLocalCountdown(null);
        setCountdown(null);
        isCountdownActive.current = false;

        // Transition to Live
        setConnecting(false);
        setBroadcasting(true);
        setStreamStatus("Live");

        // Update any 'connected' destinations to 'live'
        const destinations = useStreamStore.getState().destinations;
        destinations.forEach((d) => {
          if (d.status === "connected") {
            setDestinationStatus(d.id, "live");
          }
        });
      }
    }, 1000);
  };

  // --- Public Action: Start Broadcast ---
  const initiateStreams = async (targetDestinations: typeof destinations) => {
    console.log("[StreamEngine] ========== INITIATE STREAMS CALLED ==========");
    console.log(
      "[StreamEngine] Target destinations count:",
      targetDestinations.length
    );

    try {
      setConnecting(true);
      setStreamStatus("Connecting...");
      isCountdownActive.current = false; // Reset countdown flag

      // 1. Ensure Engine is Running
      console.log("[StreamEngine] Step 1: Ensuring MediaRecorder...");
      const mimeType = await ensureMediaRecorder();
      console.log("[StreamEngine] MediaRecorder ensured, mimeType:", mimeType);

      // 2. Connect RTMP
      if (isElectron) {
        console.log(
          "[StreamEngine] ELECTRON MODE - Connecting to ffmpeg process..."
        );
        const electron = (window as ElectronWindow).electron!;

        // Attach Status Listener
        electron.stream.onStatus((data) => {
          console.log("[StreamEngine] Received RTMP Status:", data);
          if (data.id) {
            // Map 'started' to 'connected' initially
            // 'started' from backend means ffmpeg is running and connected to RTMP server
            let status = data.status;
            if (status === "started") status = "connected";

            console.log(
              `[StreamEngine] Updating Dest [${data.id}] -> ${status}`
            );
            setDestinationStatus(data.id, status as any, data.error);

            // If connection is successful ('started' from backend), trigger countdown
            if (data.status === "started") {
              const state = useStreamStore.getState();

              // Trigger countdown ONLY if we are not already live and countdown hasn't started
              if (!state.isBroadcasting && !isCountdownActive.current) {
                console.log(
                  "[StreamEngine] First successful connection detected. Triggering countdown."
                );
                startCountdown();
              } else if (state.isBroadcasting) {
                // If we are already live (e.g. adding a 2nd destination), just mark it live immediately
                console.log(
                  "[StreamEngine] Already live. Marking new destination as live immediately."
                );
                setDestinationStatus(data.id, "live");
              }
            }
          }
        });

        // Start Targets
        targetDestinations.forEach((dest) => {
          if (dest.enabled) {
            console.log(
              `[StreamEngine] Sending start command for: ${dest.platform} (${dest.id})`
            );
            setDestinationStatus(dest.id, "starting");
            electron.stream.start({
              id: dest.id,
              rtmpUrl: dest.url,
              key: dest.key,
              mimeType: mimeType as string,
            });
          }
        });
      } else {
        console.log("[StreamEngine] WEB MODE - Connecting to server...");

        if (!socketRef.current) {
          console.log("[StreamEngine] Initializing Socket.io connection...");
          socketRef.current = io(SERVER_URL);

          socketRef.current.on(
            "stream-status",
            (data: { id: string; status: string; error?: string } | string) => {
              console.log("[StreamEngine] Web Socket Status:", data);
              const rawStatus = typeof data === "string" ? data : data.status;
              const id = typeof data === "string" ? undefined : data.id;
              const error = typeof data === "string" ? undefined : data.error;

              // Map 'started' to 'connected'
              const status = rawStatus === "started" ? "connected" : rawStatus;

              if (id) setDestinationStatus(id, status as any, error);

              if (rawStatus === "started") {
                const state = useStreamStore.getState();
                if (!state.isBroadcasting && !isCountdownActive.current) {
                  console.log(
                    "[StreamEngine] Web: First connection success. Countdown start."
                  );
                  startCountdown();
                } else if (state.isBroadcasting && id) {
                  setDestinationStatus(id, "live");
                }
              }
            }
          );
        }

        if (!socketRef.current.connected) {
          console.log("[StreamEngine] Waiting for socket connect...");
          await new Promise<void>((resolve) =>
            socketRef.current?.once("connect", () => resolve())
          );
          console.log("[StreamEngine] Socket connected.");
        }

        targetDestinations.forEach((dest) => {
          if (dest.enabled) {
            console.log(
              `[StreamEngine] Web: Emitting start-stream for ${dest.id}`
            );
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
      console.error("--- FATAL ERROR in initiateStreams ---", err);
      notify.error(`Failed to start: ${err.message}`);
      fullStop();
    }
  };

  const startStreaming = async (specificDestId?: string) => {
    console.log(
      "[StreamEngine] ========== START STREAMING BUTTON CLICKED =========="
    );

    const targets = specificDestId
      ? destinations.filter((d) => d.id === specificDestId)
      : destinations.filter((d) => d.enabled);

    if (targets.length === 0) {
      console.warn("[StreamEngine] No enabled destinations found.");
      notify.info("Please add and enable a stream destination first.");
      return;
    }

    // Direct call to initiate connections. Countdown happens AFTER connection callback.
    initiateStreams(targets);
  };

  const stopStreaming = (specificDestId?: string) => {
    console.log(
      "[StreamEngine] Stop Streaming called for:",
      specificDestId || "ALL"
    );

    // Clear countdown if active
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    isCountdownActive.current = false;
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

      checkAutoStop();
    }
  };

  const fullStop = async () => {
    console.log("[StreamEngine] Emergency Full Stop triggered.");
    await stopLocalRecording(); // Force stop record if active

    if (isElectron) (window as ElectronWindow).electron?.stream.stop();
    else socketRef.current?.emit("stop-stream");

    setBroadcasting(false);
    setConnecting(false);
    setStreamStatus("Idle");
    destinations.forEach((d) => setDestinationStatus(d.id, "idle"));

    checkAutoStop();
  };

  // Toggle Recording Wrapper
  const toggleRecording = async () => {
    const currentlyRecording = useStreamStore.getState().isRecording;
    if (currentlyRecording) {
      await stopLocalRecording();
      checkAutoStop();
    } else {
      try {
        await ensureMediaRecorder();
        await startLocalRecording();
      } catch (err) {
        notify.error("Could not start recording");
      }
    }
  };

  return {
    destinations,
    isStreaming: isBroadcasting,
    isRecording,
    isConnecting,
    status: useStreamStore((s) => s.streamStatus),
    countdown: localCountdown,
    startStreaming,
    stopStreaming,
    toggleRecording,
  };
};
