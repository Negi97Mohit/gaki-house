import { useState, useRef, useEffect } from "react";
import { useMediaStore } from "@/stores/media.store";
import { notify } from "@/shared/lib/notify";

interface ElectronWindow extends Window {
  electron?: {
    getDesktopSources: (options: any) => Promise<any[]>;
  };
}

export const useMediaPipeline = () => {
  // Refs for Media Composition
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const proxyVideoRef = useRef<HTMLVideoElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Stream References
  const mixedStreamRef = useRef<MediaStream | null>(null); // The final Output
  const activeSourceStreamRef = useRef<MediaStream | null>(null); // Screen/Window Capture (Video + System Audio)
  const userMicStreamRef = useRef<MediaStream | null>(null); // Microphone

  // Audio Context Ref (for Mixing)
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioDestinationRef = useRef<MediaStreamAudioDestinationNode | null>(
    null
  );

  const [isPipelineReady, setIsPipelineReady] = useState(false);

  const isElectron = !!(window as ElectronWindow).electron;
  const screenShareMode = useMediaStore((state) => state.screenShareMode);

  // 1. Initialize Proxy Elements (Hidden Canvas & Video)
  useEffect(() => {
    if (!canvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 1920;
      canvas.height = 1080;
      canvasRef.current = canvas;
    }
    if (!proxyVideoRef.current) {
      const video = document.createElement("video");
      video.muted = true; // Mute the proxy video element itself to prevent feedback loop
      video.autoplay = true;
      // @ts-ignore
      video.playsInline = true;
      proxyVideoRef.current = video;
    }

    return () => {
      stopPipeline();
    };
  }, []);

  // 2. React to Screen Share Mode Changes
  useEffect(() => {
    if (isPipelineReady) {
      console.log(
        `[Pipeline] Mode Changed: ${screenShareMode}. Refreshing Source...`
      );
      switchSource();
    }
  }, [screenShareMode]);

  // --- Internal Logic: Drawing Loop ---
  const startDrawLoop = () => {
    if (animationFrameRef.current)
      cancelAnimationFrame(animationFrameRef.current);

    const draw = () => {
      if (canvasRef.current && proxyVideoRef.current) {
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
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    draw();
  };

  const stopDrawLoop = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  // --- Internal Logic: Source Capture (Video + System Audio) ---
  const getSourceStream = async (): Promise<MediaStream> => {
    if (isElectron) {
      try {
        const currentMode = useMediaStore.getState().screenShareMode;
        const electron = (window as ElectronWindow).electron!;
        const sources = await electron.getDesktopSources({
          types: ["window", "screen"],
        });

        let selectedSource: any = null;

        if (currentMode === "off") {
          // Mode OFF -> Capture Desktop
          selectedSource = sources.find((s: any) => s.id.startsWith("screen"));
        } else {
          // Mode ON -> Capture App Window
          selectedSource = sources.find(
            (s: any) =>
              s.name.includes("caption-cam") || s.name.includes("GAKI")
          );
        }

        if (!selectedSource && currentMode !== "off") {
          console.warn(
            "[Pipeline] App Window not found! Fallback to screen 1."
          );
          selectedSource = sources.find((s: any) => s.id.startsWith("screen"));
        }

        if (selectedSource) {
          return await navigator.mediaDevices.getUserMedia({
            audio: {
              // Request System Audio (Loopback)
              // @ts-ignore
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: selectedSource.id,
              },
            },
            video: {
              // @ts-ignore
              mandatory: {
                chromeMediaSource: "desktop",
                chromeMediaSourceId: selectedSource.id,
                minWidth: 1280,
                maxWidth: 1920,
                minHeight: 720,
                maxHeight: 1080,
              },
            },
          } as any);
        }
      } catch (e) {
        console.error("[Pipeline] Electron Capture Failed", e);
      }
    }

    // Web Mode Fallback
    // getDisplayMedia handles prompting for "Share Audio" automatically
    return await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080 },
      audio: true, // Request Audio
    });
  };

  const switchSource = async () => {
    try {
      const newStream = await getSourceStream();

      // Clean up old source track
      if (activeSourceStreamRef.current) {
        activeSourceStreamRef.current.getTracks().forEach((t) => t.stop());
      }

      activeSourceStreamRef.current = newStream;

      if (proxyVideoRef.current) {
        proxyVideoRef.current.srcObject = newStream;
        await proxyVideoRef.current.play();
      }

      // Re-connect audio mixing if pipeline is running
      if (audioContextRef.current && audioDestinationRef.current) {
        mixAudioSources();
      }
    } catch (err) {
      console.error("[Pipeline] Switch Source Failed:", err);
      notify.error("Failed to switch video source.");
    }
  };

  // --- Internal Logic: Audio Mixing ---
  const mixAudioSources = () => {
    if (!audioContextRef.current || !audioDestinationRef.current) return;
    const ctx = audioContextRef.current;
    const dest = audioDestinationRef.current;

    // 1. Connect Microphone
    if (
      userMicStreamRef.current &&
      userMicStreamRef.current.getAudioTracks().length > 0
    ) {
      try {
        // Create new source (this might throw if track already associated, handle gracefully)
        const micSource = ctx.createMediaStreamSource(userMicStreamRef.current);
        // Optional: Gain node for mic volume control
        const micGain = ctx.createGain();
        micGain.gain.value = 1.0; // Default unity gain
        micSource.connect(micGain);
        micGain.connect(dest);
      } catch (e) {
        console.warn("[Pipeline] Error attaching mic source:", e);
      }
    }

    // 2. Connect System Audio (From Screen/Window Capture)
    if (
      activeSourceStreamRef.current &&
      activeSourceStreamRef.current.getAudioTracks().length > 0
    ) {
      try {
        const sysSource = ctx.createMediaStreamSource(
          activeSourceStreamRef.current
        );
        const sysGain = ctx.createGain();
        sysGain.gain.value = 0.8; // Slightly lower system audio to prioritize voice
        sysSource.connect(sysGain);
        sysGain.connect(dest);
        console.log("[Pipeline] System Audio Mixed");
      } catch (e) {
        console.warn("[Pipeline] Error attaching system audio:", e);
      }
    } else {
      console.log("[Pipeline] No System Audio Detected on Source");
    }
  };

  // --- Public: Start Pipeline ---
  const startPipeline = async (): Promise<MediaStream> => {
    if (mixedStreamRef.current && mixedStreamRef.current.active) {
      return mixedStreamRef.current;
    }

    console.log("[Pipeline] Starting Media Pipeline (Video + Audio Mix)...");

    // 1. Get Visual Source (Video + Potential System Audio)
    const visualStream = await getSourceStream();
    activeSourceStreamRef.current = visualStream;

    if (proxyVideoRef.current) {
      proxyVideoRef.current.srcObject = visualStream;
      await proxyVideoRef.current.play();
    }
    startDrawLoop();

    // 2. Get Canvas Stream (Constant FPS Video)
    if (!canvasRef.current) throw new Error("Pipeline not initialized");
    const canvasStream = canvasRef.current.captureStream(30);

    // 3. Get Mic Audio
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      userMicStreamRef.current = micStream;
    } catch (e) {
      console.warn("[Pipeline] Mic access denied or not found");
    }

    // 4. Initialize Audio Mixer
    const audioContext = new AudioContext();
    const audioDest = audioContext.createMediaStreamDestination();
    audioContextRef.current = audioContext;
    audioDestinationRef.current = audioDest;

    // 5. Perform Mix
    mixAudioSources();

    // 6. Combine Final Stream (Canvas Video + Mixed Audio)
    // If no audio tracks exist (no mic, no system), we just send video.
    const mixedAudioTracks = audioDest.stream.getAudioTracks();

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...mixedAudioTracks,
    ]);

    mixedStreamRef.current = combinedStream;
    setIsPipelineReady(true);

    return combinedStream;
  };

  // --- Public: Stop Pipeline ---
  const stopPipeline = () => {
    console.log("[Pipeline] Stopping...");
    stopDrawLoop();

    // Stop Final Mixed Stream
    if (mixedStreamRef.current) {
      mixedStreamRef.current.getTracks().forEach((t) => t.stop());
      mixedStreamRef.current = null;
    }

    // Stop Source (Screen/Window)
    if (activeSourceStreamRef.current) {
      activeSourceStreamRef.current.getTracks().forEach((t) => t.stop());
      activeSourceStreamRef.current = null;
    }

    // Stop Mic
    if (userMicStreamRef.current) {
      userMicStreamRef.current.getTracks().forEach((t) => t.stop());
      userMicStreamRef.current = null;
    }

    // Close Audio Context
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
      audioDestinationRef.current = null;
    }

    // Clear Video Element
    if (proxyVideoRef.current) {
      proxyVideoRef.current.srcObject = null;
    }

    setIsPipelineReady(false);
  };

  return {
    startPipeline,
    stopPipeline,
    isPipelineReady,
    mixedStreamRef,
  };
};
