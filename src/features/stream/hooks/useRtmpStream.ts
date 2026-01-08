import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { notify } from "@/shared/lib/notify";
import { useMediaStore } from "@/stores/media.store";

const SERVER_URL = "http://localhost:3000";

// Define Electron Window Interface locally to avoid global type mess
interface ElectronWindow extends Window {
  electron?: {
    stream: {
      start: (config: { rtmpUrl: string; key: string; mimeType?: string }) => void;
      sendData: (chunk: ArrayBuffer) => void;
      stop: () => void;
      onStatus: (callback: (data: { status: string; error?: string }) => void) => void;
      onFfmpegReady: (callback: () => void) => void;
    };
    getDesktopSources: (options: any) => Promise<any[]>;
  };
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
  const animationFrameRef = useRef<number | null>(null);

  // Tracks
  const streamRef = useRef<MediaStream | null>(null); // The final canvas stream
  const activeSourceStreamRef = useRef<MediaStream | null>(null); // The current source (Screen or Window)
  const originalUserStreamRef = useRef<MediaStream | null>(null); // Mic

  const isElectron = !!(window as ElectronWindow).electron;

  // Subscribe to store changes WITHOUT triggering re-renders for the whole hook if possible,
  // but we need it for the useEffect dependency.
  const screenShareMode = useMediaStore((state) => state.screenShareMode);

  // Persistence
  useEffect(() => {
    const savedUrl = localStorage.getItem("stream_rtmpUrl");
    const savedKey = localStorage.getItem("stream_key");
    if (savedUrl) setRtmpUrl(savedUrl);
    if (savedKey) setStreamKey(savedKey);

    // Initialize hidden Proxy Elements
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
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      cancelDrawLoop();
    };
  }, []);

  // --- Dynamic Switch Logic ---
  useEffect(() => {
    if (isStreaming) {
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

  const startStreaming = async (url?: string, key?: string) => {
    const targetUrl = url || rtmpUrl;
    const targetKey = key || streamKey;

    if (!targetUrl || !targetKey) {
      notify.error("Please enter both RTMP URL and Stream Key");
      return;
    }

    setRtmpUrl(targetUrl);
    setStreamKey(targetKey);

    try {
      console.log("--- DEBUG: Starting Stream Process (Canvas Proxy Mode) ---");
      setIsConnecting(true);
      setStatus("Initializing...");


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

      // 7. Connect & Start (Electron vs Web Branch)
      if (isElectron) {
        setStatus("Connecting to background process...");
        const electron = (window as ElectronWindow).electron!;

        electron.stream.onStatus((data) => {
          console.log("DEBUG: IPC Status:", data.status);
          if (data.status === "error") {
            notify.error(`Streaming Error: ${data.error}`);
            stopStreaming();
          } else if (data.status === "stopped") {
            setIsStreaming(false);
            setIsConnecting(false);
            setStatus("Stopped");
          }
        });

        electron.stream.onFfmpegReady(() => {
          console.log("DEBUG: FFmpeg (IPC) ready! Starting recorder...");
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
            mediaRecorderRef.current.start(1000);
            setIsStreaming(true);
            setIsConnecting(false);
            notify.success("Streaming started!");
          }
        });

        electron.stream.start({ rtmpUrl: targetUrl, key: targetKey, mimeType });

      } else {
        // --- WEB MODE ---
        setStatus("Connecting to server...");
        socketRef.current = io(SERVER_URL);
        // ... (simplified web logic same as before, essentially) ...
        socketRef.current.on("connect", () => {
          setStatus("Connected");
          socketRef.current?.emit("start-stream", { rtmpUrl: targetUrl, key: targetKey });
        });

        socketRef.current.on("ffmpeg-ready", () => {
          if (mediaRecorderRef.current?.state === "inactive") {
            mediaRecorderRef.current.start(1000);
            setIsStreaming(true);
            setIsConnecting(false);
            notify.success("Streaming started!");
          }
        });
      }

    } catch (err: any) {
      console.error("--- FATAL ERROR ---", err);
      notify.error(`Failed to start: ${err.message}`);
      stopStreaming();
    }
  };

  const stopStreaming = () => {
    setCountdown(null);
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
      (window as ElectronWindow).electron?.stream.stop();
    } else {
      if (socketRef.current) {
        socketRef.current.emit("stop-stream");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    }

    setIsStreaming(false);
    setIsConnecting(false);
    setStatus("Stopped");
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
  };
};
