import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { notify } from "@/shared/lib/notify";
import { useMediaStore } from "@/stores/media.store";
import { useStreamStore } from "@/stores/stream.store";

const SERVER_URL = "http://localhost:3000";

// Define Electron Window Interface locally to avoid global type mess
interface ElectronWindow extends Window {
  electron?: {
    stream: {
      start: (config: { id: string; rtmpUrl: string; key: string; mimeType?: string }) => void;
      sendData: (chunk: ArrayBuffer) => void;
      stop: (config?: { id?: string }) => void;
      onStatus: (callback: (data: { id?: string; status: string; error?: string }) => void) => void;
      onFfmpegReady: (callback: (data: { id?: string }) => void) => void;
    };
    getDesktopSources: (options: any) => Promise<any[]>;
  };
}

export const useRtmpStream = () => {
  // Store State
  const {
    destinations,
    isBroadcasting,
    isConnecting,
    setBroadcasting,
    setConnecting,
    setStreamStatus,
    setCountdown,
    setDestinationStatus
  } = useStreamStore();

  const [localCountdown, setLocalCountdown] = useState<number | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // --- Canvas Proxy Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const proxyVideoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null); // Safety ref for countdown

  // Tracks
  const streamRef = useRef<MediaStream | null>(null); // The final canvas stream
  const activeSourceStreamRef = useRef<MediaStream | null>(null); // The current source (Screen or Window)
  const originalUserStreamRef = useRef<MediaStream | null>(null); // Mic

  const isElectron = !!(window as ElectronWindow).electron;

  // Subscribe to store changes WITHOUT triggering re-renders for the whole hook if possible,
  // but we need it for the useEffect dependency.
  const screenShareMode = useMediaStore((state) => state.screenShareMode);

  // Initialize hidden Proxy Elements (One-time)
  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      canvasRef.current = canvas;
    }
    if (!proxyVideoRef.current) {
      const video = document.createElement("video");
      video.muted = true;
      video.autoplay = true;
      video.playsInline = true;
      proxyVideoRef.current = video;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // If we unmount, we should probably stop everything? 
      // Or maybe keep it running if it's a global hook?
      // Assuming it's used in a way that unmount = close app/component, lets be safe but check needs.
      // For now, let's NOT automatically stop streaming on unmount to allow navigation,
      // UNLESS the user explicitly stopped it. 
      // Actually, if we navigate away, we want streaming to continue.
      // Cleaning up listeners is good though.
      if (socketRef.current) {
        socketRef.current.off("stream-status");
        socketRef.current.off("ffmpeg-ready");
      }
      // cancelDrawLoop(); // Don't cancel loop if we want to persist across nav?
      // But this hook might be re-mounted. The global store holds state.
      // If this hook is re-used, we need to re-attach listeners.
    };
  }, []);

  // --- Dynamic Switch Logic ---
  useEffect(() => {
    if (isBroadcasting) {
      console.log(`[Stream] Detect Mode Change -> ${screenShareMode}. Switching Source...`);
      switchSource();
    }
  }, [screenShareMode]);

  // --- Render Loop ---
  const startDrawLoop = () => {
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);

    const draw = () => {
      if (canvasRef.current && proxyVideoRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) {
          ctx.drawImage(proxyVideoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const cancelDrawLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // --- Source Acquisition ---
  const getSourceStream = async (): Promise<MediaStream> => {
    if (isElectron) {
      try {
        // Re-fetch state to be sure, though prop is robust
        const currentMode = useMediaStore.getState().screenShareMode;
        const electron = (window as ElectronWindow).electron!;
        const sources = await electron.getDesktopSources({ types: ["window", "screen"] });

        let selectedSource: any = null;

        if (currentMode === "off") {
          // Mode OFF -> Capture Desktop
          selectedSource = sources.find((s: any) => s.id.startsWith("screen"));
          console.log("[Stream] Selecting Desktop Source:", selectedSource?.name);
        } else {
          // Mode ON -> Capture App Window
          // Search for our app name. "caption-cam" or "GAKI"
          selectedSource = sources.find((s: any) =>
            (s.name.includes("caption-cam") || s.name.includes("GAKI"))
          );
          console.log("[Stream] Selecting App Window Source:", selectedSource?.name);
        }

        if (!selectedSource && currentMode !== "off") {
          // Fallback: If we can't find app window, maybe try screen?
          // For now, let's try screen 1 as safety net logic
          console.warn("[Stream] App Window not found! Fallback to screen 1.");
          selectedSource = sources.find((s: any) => s.id.startsWith("screen"));
        }

        if (selectedSource) {
          return await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              // @ts-ignore
              mandatory: {
                chromeMediaSource: 'desktop',
                chromeMediaSourceId: selectedSource.id,
                minWidth: 1280, maxWidth: 1920,
                minHeight: 720, maxHeight: 1080
              }
            }
          } as any);
        }
      } catch (e) {
        console.error("Electron Capture Failed", e);
      }
    }

    // Fallback / Web Mode
    return await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080 },
      audio: false
    });
  };

  const switchSource = async () => {
    try {
      const newStream = await getSourceStream();

      // Stop old tracks (important to release resource)
      if (activeSourceStreamRef.current) {
        activeSourceStreamRef.current.getTracks().forEach(t => t.stop());
      }

      activeSourceStreamRef.current = newStream;

      if (proxyVideoRef.current) {
        proxyVideoRef.current.srcObject = newStream;
        await proxyVideoRef.current.play();
      }
    } catch (err) {
      console.error("[Stream] Switch Source Failed:", err);
      notify.error("Failed to switch stream source.");
    }
  };


  const handleStreamOutput = async (event: BlobEvent) => {
    if (event.data.size > 0) {
      if (isElectron) {
        const buffer = await event.data.arrayBuffer();
        (window as ElectronWindow).electron?.stream.sendData(buffer);
      } else {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("binary-stream", event.data);
        }
      }
    }
  };

  const ensureMediaRecorder = async () => {
    // If we already have a recorder running, we don't need to restart it
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      return true;
    }

    console.log("--- DEBUG: Starting Media Recorder Process ---");

    // 1. Get Initial Source
    const initialSourceStream = await getSourceStream();
    activeSourceStreamRef.current = initialSourceStream;

    // 2. Setup Proxy
    if (proxyVideoRef.current) {
      proxyVideoRef.current.srcObject = initialSourceStream;
      await proxyVideoRef.current.play();
    }
    startDrawLoop();

    // 3. Get Canvas Stream (The Constant Stream)
    if (!canvasRef.current) throw new Error("Canvas Proxy not initialized");
    const canvasStream = canvasRef.current.captureStream(30);

    // 4. Capture Mic
    let userStream: MediaStream | null = null;
    try {
      userStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
      originalUserStreamRef.current = userStream;
    } catch (e) {
      console.warn("Mic access denied or not found");
    }

    // 5. Combine (Canvas Video + Mic Audio)
    const audioContext = new AudioContext();
    const dest = audioContext.createMediaStreamDestination();

    if (userStream && userStream.getAudioTracks().length > 0) {
      const micSource = audioContext.createMediaStreamSource(userStream);
      micSource.connect(dest);
    }

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...dest.stream.getAudioTracks(),
    ]);

    streamRef.current = combinedStream;

    // 6. Setup MediaRecorder
    const getMimeType = () => {
      const types = [
        "video/webm; codecs=h264",
        "video/webm; codecs=vp9",
        "video/webm; codecs=vp8",
        "video/webm"
      ];
      for (const type of types) {
        if (MediaRecorder.isTypeSupported(type)) {
          console.log(`[Stream] Using codec: ${type}`);
          return type;
        }
      }
      return "video/webm";
    };

    const mimeType = getMimeType();
    const options: MediaRecorderOptions = {
      mimeType,
      videoBitsPerSecond: 4500000 // 4.5 Mbps target for recorder
    };

    const mediaRecorder = new MediaRecorder(combinedStream, options);
    mediaRecorderRef.current = mediaRecorder;
    mediaRecorder.ondataavailable = handleStreamOutput;

    return mimeType;
  };

  const initiateStreams = async (targetDestinations: typeof destinations) => {
    try {
      setConnecting(true);
      setStreamStatus("Initializing...");

      // Ensure recorder is ready
      const mimeType = await ensureMediaRecorder();

      // 7. Connect & Start (Electron vs Web Branch)
      if (isElectron) {
        setStreamStatus("Connecting to background process...");
        const electron = (window as ElectronWindow).electron!;

        // Setup Listeners ONCE
        // We might be adding listeners multiple times if not careful? 
        // Electron event listeners usually stack. We should clear or simple rely on the fact that we handle by ID.
        // Ideally we setup listeners in a useEffect, but we need closure over the current state/handlers.
        // Let's do it here, but maybe check if valid?
        // Actually, for simplicity in this refactor, we'll re-attach safe handlers or assume existing ones work if we used a consistent callback.
        // But for clarity, we'll define the callback to handle updates.

        electron.stream.onStatus((data: { id?: string, status: string, error?: string }) => {
          console.log("DEBUG: IPC Status:", data);

          if (data.id) {
            // Update individual destination status
            setDestinationStatus(data.id, data.status as any, data.error);
          }

          // General Aggregate Status
          // If any is streaming, we are broadcasting
          // If all stopped, we are stopped
          // If data.id match, we update specifically.

          // NOTE: We'll do a check logic in the store or here later?
          // For now, let's just ensure if at least one started, we are broadcasting.
          if (data.status === 'started') {
            setBroadcasting(true);
            setConnecting(false);
            setStreamStatus("Live");
          }
        });

        electron.stream.onFfmpegReady((data) => {
          console.log("DEBUG: FFmpeg (IPC) ready for", data.id);
          // Start recorder if not already
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
            mediaRecorderRef.current.start(1000);
            notify.success("Streaming started!");
          }
        });

        // Start ALL targets
        targetDestinations.forEach(dest => {
          if (dest.enabled) {
            setDestinationStatus(dest.id, 'starting');
            electron.stream.start({ id: dest.id, rtmpUrl: dest.url, key: dest.key, mimeType: mimeType as string });
          }
        });

      } else {
        // --- WEB MODE ---
        setStreamStatus("Connecting to server...");
        if (!socketRef.current) {
          socketRef.current = io(SERVER_URL);

          socketRef.current.on("stream-status", (data: { id: string, status: string, error?: string } | string) => {
            // Handle legacy string or object
            const status = typeof data === 'string' ? data : data.status;
            const id = typeof data === 'string' ? undefined : data.id;
            const error = typeof data === 'string' ? undefined : data.error;

            console.log("Web Status:", id, status);

            if (id) {
              setDestinationStatus(id, status as any, error);
            }

            if (status === 'started') {
              setBroadcasting(true);
              setConnecting(false);
              setStreamStatus("Live");
            }
            if (status === 'stopped' && !id) {
              // All stopped
              setBroadcasting(false);
            }
          });

          socketRef.current.on("ffmpeg-ready", (data) => {
            if (mediaRecorderRef.current?.state === "inactive") {
              mediaRecorderRef.current.start(1000);
              notify.success("Streaming started!");
            }
          });
        }

        // Wait for connection?
        if (!socketRef.current.connected) {
          await new Promise<void>((resolve) => {
            socketRef.current?.once('connect', () => resolve());
          });
        }

        // Start Targets
        targetDestinations.forEach(dest => {
          if (dest.enabled) {
            setDestinationStatus(dest.id, 'starting');
            socketRef.current?.emit("start-stream", { id: dest.id, rtmpUrl: dest.url, key: dest.key });
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
    // If specific ID, start just that one
    // Else start all enabled
    const targets = specificDestId
      ? destinations.filter(d => d.id === specificDestId)
      : destinations.filter(d => d.enabled);

    if (targets.length === 0) {
      notify.error("No enabled destinations found.");
      return;
    }

    // Prepare Countdown
    setLocalCountdown(3);
    setCountdown(3);

    // Clear any existing interval just in case
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    let count = 3;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      setLocalCountdown(count);
      setCountdown(count);

      if (count <= 0) {
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        setLocalCountdown(null);
        setCountdown(null);
        initiateStreams(targets);
      }
    }, 1000);
  };

  const stopStreaming = (specificDestId?: string) => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setCountdown(null);
    setLocalCountdown(null);

    // If specific, stop just that one
    if (specificDestId) {
      if (isElectron) {
        (window as ElectronWindow).electron?.stream.stop({ id: specificDestId });
      } else {
        socketRef.current?.emit("stop-stream", { id: specificDestId });
      }
      setDestinationStatus(specificDestId, 'idle');

      // Check if any others are still live?
      const othersLive = destinations.some(d => d.id !== specificDestId && (d.status === 'live' || d.status === 'starting'));
      if (!othersLive) {
        fullStop();
      }
    } else {
      fullStop();
    }
  };

  const fullStop = () => {
    // Stop EVERYTHING
    cancelDrawLoop();

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }

    // Stop Final Stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Stop Active Source Stream
    if (activeSourceStreamRef.current) {
      activeSourceStreamRef.current.getTracks().forEach(t => t.stop());
      activeSourceStreamRef.current = null;
    }

    // Stop Mic
    if (originalUserStreamRef.current) {
      originalUserStreamRef.current.getTracks().forEach((track) => track.stop());
      originalUserStreamRef.current = null;
    }

    // Clear Proxy Video
    if (proxyVideoRef.current) {
      proxyVideoRef.current.srcObject = null;
    }

    if (isElectron) {
      (window as ElectronWindow).electron?.stream.stop(); // Stop All
    } else {
      if (socketRef.current) {
        socketRef.current.emit("stop-stream"); // Stop All
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    setBroadcasting(false);
    setConnecting(false);
    setStreamStatus("Stopped");

    // Reset all dest statuses
    destinations.forEach(d => setDestinationStatus(d.id, 'idle'));
  };

  return {
    destinations,
    isStreaming: isBroadcasting, // Compat alias
    isConnecting,
    status: isBroadcasting ? "Live" : "Idle", // Compat
    countdown: localCountdown,
    startStreaming,
    stopStreaming,
  };
};
