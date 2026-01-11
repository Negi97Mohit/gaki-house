import { useState, useRef, useEffect } from "react";
import { useMediaStore } from "@/stores/media.store";
import { notify } from "@/shared/lib/notify";

interface ElectronWindow extends Window {
  electron?: {
    getDesktopSources: (options: any) => Promise<any[]>;
  };
}

export const useMediaPipeline = () => {
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

  // React to Screen Share Mode Changes
  useEffect(() => {
    if (isPipelineReady) {
      console.log(
        `[Pipeline] Mode Changed: ${screenShareMode}. Refreshing Source...`
      );
      switchSource();
    }
  }, [screenShareMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopPipeline();
    };
  }, []);

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
                frameRate: { ideal: 30, max: 60 }, // Optimize FPS constraints
              },
            },
          } as any);
        }
      } catch (e) {
        console.error("[Pipeline] Electron Capture Failed", e);
      }
    }

    // Web Mode Fallback
    return await navigator.mediaDevices.getDisplayMedia({
      video: { width: 1920, height: 1080, frameRate: 30 },
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

      // Update the video track in the active mixed stream without killing connection
      if (mixedStreamRef.current) {
        const oldVideoTrack = mixedStreamRef.current.getVideoTracks()[0];
        const newVideoTrack = newStream.getVideoTracks()[0];

        if (oldVideoTrack && newVideoTrack) {
          mixedStreamRef.current.removeTrack(oldVideoTrack);
          mixedStreamRef.current.addTrack(newVideoTrack);
        }
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
        const micSource = ctx.createMediaStreamSource(userMicStreamRef.current);
        const micGain = ctx.createGain();
        micGain.gain.value = 1.0;
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
        sysGain.gain.value = 0.8;
        sysSource.connect(sysGain);
        sysGain.connect(dest);
      } catch (e) {
        console.warn("[Pipeline] Error attaching system audio:", e);
      }
    }
  };

  // --- Public: Start Pipeline ---
  const startPipeline = async (): Promise<MediaStream> => {
    if (mixedStreamRef.current && mixedStreamRef.current.active) {
      return mixedStreamRef.current;
    }

    console.log("[Pipeline] Starting Efficient Media Pipeline...");

    // 1. Get Visual Source
    const visualStream = await getSourceStream();
    activeSourceStreamRef.current = visualStream;

    // 2. Get Mic Audio
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

    // 3. Initialize Audio Mixer
    const audioContext = new AudioContext();
    const audioDest = audioContext.createMediaStreamDestination();
    audioContextRef.current = audioContext;
    audioDestinationRef.current = audioDest;

    // 4. Perform Mix
    mixAudioSources();

    // 5. Combine Final Stream (Direct Video Track + Mixed Audio)
    // This effectively "passes through" the video without re-rendering
    const mixedAudioTracks = audioDest.stream.getAudioTracks();
    const videoTracks = visualStream.getVideoTracks();

    const combinedStream = new MediaStream([
      ...videoTracks,
      ...mixedAudioTracks,
    ]);

    mixedStreamRef.current = combinedStream;
    setIsPipelineReady(true);

    return combinedStream;
  };

  // --- Public: Stop Pipeline ---
  const stopPipeline = () => {
    console.log("[Pipeline] Stopping...");

    // Stop Final Mixed Stream
    if (mixedStreamRef.current) {
      mixedStreamRef.current.getTracks().forEach((t) => t.stop());
      mixedStreamRef.current = null;
    }

    // Stop Source
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

    setIsPipelineReady(false);
  };

  return {
    startPipeline,
    stopPipeline,
    isPipelineReady,
    mixedStreamRef,
  };
};
