import { useState, useRef, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import { notify } from "@/shared/lib/notify";
import { useMediaStore } from "@/stores/media.store";
import { useStreamStore, DesktopSource } from "@/stores/stream.store";

const SERVER_URL = "http://localhost:3000";

// Define Electron Window Interface locally
interface ElectronWindow extends Window {
  electron?: {
    stream: {
      start: (config: { targets: { url: string; key: string }[] }) => void;
      sendData: (chunk: ArrayBuffer) => void;
      stop: () => void;
      onStatus: (
        callback: (data: { status: string; error?: string }) => void
      ) => void;
      onFfmpegReady: (callback: () => void) => void;
    };
    getDesktopSources: (options: {
      types: string[];
      thumbnailSize?: { width: number; height: number };
    }) => Promise<DesktopSource[]>;
    onWindowFocusChanged: (
      callback: (isFocused: boolean) => void
    ) => (() => void) | undefined;
  };
}

interface StreamTarget {
  url: string;
  key: string;
}

export const useRtmpStream = () => {
  const [rtmpUrl, setRtmpUrl] = useState("");
  const [streamKey, setStreamKey] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [status, setStatus] = useState<string>("Idle");
  const [countdown, setCountdown] = useState<number | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // --- Canvas Proxy Refs ---
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const proxyVideoRef = useRef<HTMLVideoElement | null>(null);

  // FIX: Use interval ref instead of animation frame for background persistence
  const drawIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Tracks
  const streamRef = useRef<MediaStream | null>(null);
  const activeSourceStreamRef = useRef<MediaStream | null>(null);
  const originalUserStreamRef = useRef<MediaStream | null>(null);

  const isElectron = !!(window as any).electron;
  const screenShareMode = useMediaStore((state) => state.screenShareMode);

  // Store Integration
  const {
    activeSourceId,
    setActiveSourceId,
    setPickerOpen,
    setAvailableSources,
    isPickerOpen,
  } = useStreamStore();

  // --- Persistence & Initialization ---
  useEffect(() => {
    const savedUrl = localStorage.getItem("stream_rtmpUrl");
    const savedKey = localStorage.getItem("stream_key");
    if (savedUrl) setRtmpUrl(savedUrl);
    if (savedKey) setStreamKey(savedKey);

    // Create hidden elements
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

  useEffect(() => {
    if (rtmpUrl) localStorage.setItem("stream_rtmpUrl", rtmpUrl);
    if (streamKey) localStorage.setItem("stream_key", streamKey);
  }, [rtmpUrl, streamKey]);

  useEffect(() => {
    return () => {
      if (isStreaming) stopStreaming();
      if (socketRef.current) socketRef.current.disconnect();
      cancelDrawLoop();
    };
  }, []);

  // --- HELPER: Open Source Picker ---
  const openSourcePicker = useCallback(async () => {
    if (!isElectron) return;
    try {
      const electron = (window as ElectronWindow).electron!;
      const sources = await electron.getDesktopSources({
        types: ["window", "screen"],
        thumbnailSize: { width: 400, height: 225 },
      });
      setAvailableSources(sources);
      setPickerOpen(true);
    } catch (e) {
      console.error("Failed to get sources", e);
      notify.error("Failed to load screen sources");
    }
  }, [isElectron, setAvailableSources, setPickerOpen]);

  // --- EFFECT: Handle Screen Share Mode Changes ---
  useEffect(() => {
    if (!isStreaming) return;

    const handleModeChange = async () => {
      // 1. If screen sharing is OFF -> Background Mode
      if (screenShareMode === "off") {
        if (
          isElectron &&
          (!activeSourceId || !activeSourceId.startsWith("screen"))
        ) {
          // Auto-switch to Main Screen to ensure the background isn't black
          try {
            const electron = (window as ElectronWindow).electron!;
            const sources = await electron.getDesktopSources({
              types: ["screen"],
            });
            const mainScreen = sources[0];
            if (mainScreen && activeSourceId !== mainScreen.id) {
              console.log("[Stream] Auto-switching to Background Screen");
              await switchSource(mainScreen.id);
            }
          } catch (e) {
            console.warn(e);
          }
        }
        return;
      }

      // 2. If screen sharing is ON
      // If no valid source selected, open picker.
      if (!activeSourceId) {
        openSourcePicker();
      }
    };

    handleModeChange();
  }, [screenShareMode, isStreaming, activeSourceId, openSourcePicker]);

  // --- CRITICAL FIX: Loop Replacement ---
  // Replaces requestAnimationFrame with setInterval to ensure background execution
  const startDrawLoop = () => {
    if (drawIntervalRef.current) clearInterval(drawIntervalRef.current);

    // 30 FPS target
    const INTERVAL = 1000 / 30;

    drawIntervalRef.current = setInterval(() => {
      if (canvasRef.current && proxyVideoRef.current) {
        if (proxyVideoRef.current.readyState >= 2) {
          // HAVE_CURRENT_DATA
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              proxyVideoRef.current,
              0,
              0,
              canvasRef.current.width,
              canvasRef.current.height
            );
          }
        }
      }
    }, INTERVAL);
  };

  const cancelDrawLoop = () => {
    if (drawIntervalRef.current) {
      clearInterval(drawIntervalRef.current);
      drawIntervalRef.current = null;
    }
  };

  // --- Source Acquisition ---
  const getSourceStream = async (
    specificSourceId?: string
  ): Promise<MediaStream> => {
    if (isElectron) {
      try {
        const electron = (window as ElectronWindow).electron!;
        let sourceId = specificSourceId;

        // Fallback to first screen if no specific ID provided
        if (!sourceId) {
          const sources = await electron.getDesktopSources({
            types: ["screen"],
          });
          sourceId = sources[0]?.id;
        }

        if (sourceId) {
          return await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              // @ts-ignore
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: sourceId,
                minWidth: 1280,
                maxWidth: 1920,
                minHeight: 720,
                maxHeight: 1080,
              },
            },
          } as any);
        }
      } catch (e) {
        console.error("Electron Capture Failed", e);
        throw e;
      }
    }
    // Web Fallback
    return await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: false,
    });
  };

  const switchSource = async (sourceId: string) => {
    try {
      const newStream = await getSourceStream(sourceId);

      if (activeSourceStreamRef.current) {
        activeSourceStreamRef.current.getTracks().forEach((t) => t.stop());
      }
      activeSourceStreamRef.current = newStream;
      setActiveSourceId(sourceId); // Sync with store

      if (proxyVideoRef.current) {
        proxyVideoRef.current.srcObject = newStream;
        await proxyVideoRef.current.play();
      }
    } catch (err) {
      console.error("[Stream] Switch Source Failed:", err);
      notify.error("Failed to switch stream source.");
    }
  };

  // Exposed for UI
  const handleSourceSelect = async (id: string) => {
    await switchSource(id);
    setPickerOpen(false);
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

  const startStreaming = async (input: StreamTarget | StreamTarget[]) => {
    const targets = Array.isArray(input) ? input : [input];
    if (targets.length === 0) {
      notify.error("No targets");
      return;
    }

    setRtmpUrl(targets[0].url);
    setStreamKey(targets[0].key);

    try {
      setIsConnecting(true);
      setStatus("Initializing...");

      // 1. Get Source (defaults to screen if none selected)
      const initialSourceStream = await getSourceStream(
        activeSourceId || undefined
      );
      activeSourceStreamRef.current = initialSourceStream;

      // 2. Setup Proxy
      if (proxyVideoRef.current) {
        proxyVideoRef.current.srcObject = initialSourceStream;
        await proxyVideoRef.current.play();
      }

      // Start robust draw loop
      startDrawLoop();

      // 3. Canvas Stream
      if (!canvasRef.current) throw new Error("Canvas Proxy not initialized");
      const canvasStream = canvasRef.current.captureStream(30);

      // 4. Mic
      let userStream: MediaStream | null = null;
      try {
        userStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        originalUserStreamRef.current = userStream;
      } catch (e) {
        console.warn("Mic not found");
      }

      // 5. Combine
      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();
      if (userStream) {
        const micSource = audioContext.createMediaStreamSource(userStream);
        micSource.connect(dest);
      }
      const combinedStream = new MediaStream([
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);
      streamRef.current = combinedStream;

      // 6. Recorder
      const mediaRecorder = new MediaRecorder(combinedStream, {
        mimeType: "video/webm; codecs=vp9",
      });
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = handleStreamOutput;

      // 7. Connect
      if (isElectron) {
        setStatus("Connecting...");
        const electron = (window as ElectronWindow).electron!;
        electron.stream.onStatus((d) => {
          if (d.status === "error") {
            stopStreaming();
            notify.error(d.error || "Unknown Error");
          }
        });
        electron.stream.onFfmpegReady(() => {
          if (mediaRecorder.state === "inactive") {
            mediaRecorder.start(1000);
            setIsStreaming(true);
            setIsConnecting(false);
          }
        });
        electron.stream.start({ targets });
      } else {
        socketRef.current = io(SERVER_URL);
        socketRef.current.on("connect", () =>
          socketRef.current?.emit("start-stream", { targets })
        );
        socketRef.current.on("ffmpeg-ready", () => {
          if (mediaRecorder.state === "inactive") {
            mediaRecorder.start(1000);
            setIsStreaming(true);
            setIsConnecting(false);
          }
        });
      }
    } catch (err: any) {
      console.error(err);
      stopStreaming();
    }
  };

  const stopStreaming = () => {
    cancelDrawLoop();
    if (mediaRecorderRef.current?.state !== "inactive")
      mediaRecorderRef.current?.stop();

    [streamRef, activeSourceStreamRef, originalUserStreamRef].forEach((ref) => {
      if (ref.current) ref.current.getTracks().forEach((t) => t.stop());
      ref.current = null;
    });
    if (proxyVideoRef.current) proxyVideoRef.current.srcObject = null;

    if (isElectron) (window as ElectronWindow).electron?.stream.stop();
    else socketRef.current?.disconnect();

    setIsStreaming(false);
    setIsConnecting(false);
    setStatus("Stopped");
    setActiveSourceId(null); // Reset source on stop
  };

  return {
    rtmpUrl,
    setRtmpUrl,
    streamKey,
    setStreamKey,
    isStreaming,
    isConnecting,
    status,
    countdown,
    startStreaming,
    stopStreaming,
    handleSourceSelect,
    openSourcePicker,
  };
};
