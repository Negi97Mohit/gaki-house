import { useState, useRef, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { notify } from "@/shared/lib/notify";

const SERVER_URL = "http://localhost:3000";

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
      // Using simpler constraints supported by Electron
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
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

      // 3. Connect to Socket Server
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

      // 4. Setup MediaRecorder (But DO NOT START yet)
      const mimeType = "video/webm; codecs=vp9";
      const options = MediaRecorder.isTypeSupported(mimeType)
        ? { mimeType }
        : { mimeType: "video/webm" };

      const mediaRecorder = new MediaRecorder(combinedStream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (
          event.data.size > 0 &&
          socketRef.current &&
          socketRef.current.connected
        ) {
          socketRef.current.emit("binary-stream", event.data);
        }
      };

      // 5. Setup Status Listeners
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

      // --- CRITICAL CHANGE: Wait for FFmpeg Ready Signal ---
      socketRef.current.on("ffmpeg-ready", () => {
        console.log("DEBUG: FFmpeg is ready! Starting recorder...");

        // Now it's safe to start sending the header
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

      // 6. Signal Server to Start FFmpeg
      console.log("DEBUG: Signaling server to spawn FFmpeg...");
      socketRef.current.emit("start-stream", {
        rtmpUrl: targetUrl,
        key: targetKey,
      });
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

    if (socketRef.current) {
      socketRef.current.emit("stop-stream");
      socketRef.current.disconnect();
      socketRef.current = null;
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
