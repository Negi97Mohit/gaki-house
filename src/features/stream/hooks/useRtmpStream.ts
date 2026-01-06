import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { notify } from "@/shared/lib/notify";

const SERVER_URL = "http://localhost:3000";

// Define Electron Window Interface locally to avoid global type mess
interface ElectronWindow extends Window {
  electron?: {
    stream: {
      start: (config: { rtmpUrl: string; key: string }) => void;
      sendData: (chunk: ArrayBuffer) => void;
      stop: () => void;
      onStatus: (callback: (data: { status: string; error?: string }) => void) => void;
      onFfmpegReady: (callback: () => void) => void;
    };
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
  const streamRef = useRef<MediaStream | null>(null);
  const originalDisplayStreamRef = useRef<MediaStream | null>(null);
  const originalUserStreamRef = useRef<MediaStream | null>(null);

  const isElectron = !!(window as ElectronWindow).electron;

  // Persistence
  useEffect(() => {
    const savedUrl = localStorage.getItem("stream_rtmpUrl");
    const savedKey = localStorage.getItem("stream_key");
    if (savedUrl) setRtmpUrl(savedUrl);
    if (savedKey) setStreamKey(savedKey);
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
    };
  }, []);

  const handleStreamOutput = async (event: BlobEvent) => {
    if (event.data.size > 0) {
      if (isElectron) {
        // Electron: Send as ArrayBuffer via IPC
        const buffer = await event.data.arrayBuffer();
        (window as ElectronWindow).electron?.stream.sendData(buffer);
      } else {
        // Web: Send as Blob/Buffer via Socket.io
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
      console.log("--- DEBUG: Starting Stream Process ---");
      setIsConnecting(true);
      setStatus("Initializing...");

      // 1. Capture Screen
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });
      originalDisplayStreamRef.current = displayStream;

      // 2. Capture Mic
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

      // Combine tracks
      const audioContext = new AudioContext();
      const dest = audioContext.createMediaStreamDestination();

      if (userStream && userStream.getAudioTracks().length > 0) {
        const micSource = audioContext.createMediaStreamSource(userStream);
        micSource.connect(dest);
      }

      const combinedStream = new MediaStream([
        ...displayStream.getVideoTracks(),
        ...dest.stream.getAudioTracks(),
      ]);

      streamRef.current = combinedStream;

      displayStream.getVideoTracks()[0].onended = () => {
        stopStreaming();
      };

      // 3. Setup MediaRecorder
      const mimeType = "video/webm; codecs=vp9";
      const options = MediaRecorder.isTypeSupported(mimeType)
        ? { mimeType }
        : { mimeType: "video/webm" };

      const mediaRecorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = handleStreamOutput;

      // 4. Connect & Start (Electron vs Web Branch)
      if (isElectron) {
        setStatus("Connecting to background process...");
        const electron = (window as ElectronWindow).electron!;

        // Listeners
        electron.stream.onStatus((data) => {
          console.log("DEBUG: IPC Status:", data.status);
          if (data.status === "error") {
            notify.error(`Streaming Error: ${data.error}`);
            stopStreaming();
          } else if (data.status === "stopped") {
            setIsStreaming(false);
            setIsConnecting(false);
            setStatus("Stopped");
          } else if (data.status === "started") {
            // Main process confirmed start command received
            // Wait for ffmpeg-ready to actually send data
          }
        });

        electron.stream.onFfmpegReady(() => {
          console.log("DEBUG: FFmpeg (IPC) ready! Starting recorder...");
          if (mediaRecorderRef.current && mediaRecorderRef.current.state === "inactive") {
            mediaRecorderRef.current.start(1000);
            setIsStreaming(true);
            setIsConnecting(false);
            notify.success("Streaming started (Desktop Mode)!");
          }
        });

        // Start Signal
        electron.stream.start({ rtmpUrl: targetUrl, key: targetKey });

      } else {
        // --- WEB / LEGACY SOCKET.IO MODE ---
        setStatus("Connecting to server...");
        socketRef.current = io(SERVER_URL);

        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error("Socket connection timed out"));
          }, 10000);

          if (!socketRef.current) return;

          socketRef.current.on("connect", () => {
            clearTimeout(timeout);
            console.log("DEBUG: Socket Connected");
            setStatus("Connected");
            resolve();
          });
        });

        // Listeners
        socketRef.current.on("stream-status", (msg: string) => {
          console.log("DEBUG: Server Msg:", msg);
          if (msg.startsWith("error")) {
            notify.error(`Streaming Error: ${msg}`);
            stopStreaming();
          } else if (msg === "stopped") {
            setIsStreaming(false);
            setIsConnecting(false);
            setStatus("Stopped");
          }
        });

        socketRef.current.on("ffmpeg-ready", () => {
          console.log("DEBUG: FFmpeg is ready! Starting recorder...");
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "inactive"
          ) {
            mediaRecorderRef.current.start(1000); // 1s chunks
            setIsStreaming(true);
            setIsConnecting(false);
            notify.success("Streaming started!");
          }
        });

        // Signal Server
        console.log("DEBUG: Signaling server to spawn FFmpeg...");
        socketRef.current.emit("start-stream", {
          rtmpUrl: targetUrl,
          key: targetKey,
        });
      }

    } catch (err: any) {
      console.error("--- FATAL ERROR ---", err);
      notify.error(`Failed to start: ${err.message}`);
      stopStreaming();
      setIsConnecting(false);
      setStatus("Error");
    }
  };

  const stopStreaming = () => {
    setCountdown(null);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (originalDisplayStreamRef.current) {
      originalDisplayStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
      originalDisplayStreamRef.current = null;
    }
    if (originalUserStreamRef.current) {
      originalUserStreamRef.current
        .getTracks()
        .forEach((track) => track.stop());
      originalUserStreamRef.current = null;
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
