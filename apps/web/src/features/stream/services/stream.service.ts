import { io, Socket } from "socket.io-client";
import { notify } from "@gaki/core/lib/notify";
import { useStreamStore } from "@/stores/stream.store";
import { useMediaStore } from "@/stores/media.store";
import { useSceneStore } from "@/stores/scene.store";
import fixWebmDuration from "fix-webm-duration";
import { BroadcastBus } from "@gaki/engine/kernel/engine/BroadcastBus";
import { AudioMixerEngine } from "@gaki/engine/kernel/engine/AudioMixerEngine";
import { BroadcastEncoder } from "@gaki/engine/kernel/engine/BroadcastEncoder";

export const USE_KERNEL_PIPELINE = false;

const SERVER_URL = "http://localhost:3000";

interface ElectronWindow {
  electron?: {
    getDesktopSources: (options: any) => Promise<any[]>;
    getAppWindowId: () => Promise<string | null>;
    stream: {
      start: (config: any) => void;
      sendData: (chunk: ArrayBuffer) => void;
      stop: (config?: any) => void;
      onStatus: (callback: (data: any) => void) => void;
    };
  };
}

class StreamService {
  private static instance: StreamService;

  // Persistent State
  private socket: Socket | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private activeStream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private audioDestination: MediaStreamAudioDestinationNode | null = null;
  // Self-monitoring (sidetone) — routes mic & system audio to local speakers.
  // Defaults to 0 (silent) to prevent feedback loops; user raises via Master Output.
  private monitorGain: GainNode | null = null;
  private _lastMonitorVolume = 0.8; // remembered for unmute

  // New Kernel Pipeline (Phase D)
  private audioMixerEngine: AudioMixerEngine | null = null;
  private broadcastEncoder: BroadcastEncoder | null = null;

  // Internal Pipeline (The "Mixer")
  // We use an intermediate canvas to ensure the stream never "breaks"
  // when we switch input sources (e.g. from Screen -> App Window)
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private animationFrameId: number | null = null;
  private unsubMediaStore: (() => void) | null = null;
  private unsubSceneStore: (() => void) | null = null;

  // Refs to source streams for cleanup
  private currentVideoSource: MediaStream | null = null;
  private micStream: MediaStream | null = null;

  // State flags
  private isPipelineActive = false;
  private countdownInterval: NodeJS.Timeout | null = null;
  private isAppFocused = true;

  // Connection Management
  private verifyingTimers = new Map<string, NodeJS.Timeout>();
  private retryCounts = new Map<string, number>();
  private MAX_RETRIES = 3;
  private isIntentionalStop = false;

  // Audio gate interval IDs — stored so they can be cleared on pipeline stop
  private _gateIntervals: ReturnType<typeof setInterval>[] = [];

  private constructor() {
    // Singleton
  }

  public static getInstance(): StreamService {
    if (!StreamService.instance) {
      StreamService.instance = new StreamService();
    }
    return StreamService.instance;
  }

  // --- 1. MEDIA PIPELINE LOGIC ---

  public async startPipeline(): Promise<MediaStream> {
    if (this.activeStream && this.activeStream.active) {
      return this.activeStream;
    }

    // 1. Initialize the Mixer (Canvas + Video Element)
    this.initMixer();

    // 2. Start Source Management (Auto-Switching logic)
    // This will fetch the initial video source (Screen or App)
    await this.updateVideoSource();

    // Start listening for state changes to trigger switches
    this.startObservingState();

    // 3. Get Mic Audio
    try {
      this.micStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // Disable all voice-call processing — these destroy music and
          // create pumping/breathing artefacts on streams. Streamers want
          // raw mic input routed through a proper audio graph, not a phone call.
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          sampleRate: 48000,
          channelCount: 2,
        },
        video: false,
      });
    } catch (e) {
      console.warn("[StreamService] Mic access denied or not found", e);
    }

    // 4. Audio Mixing Setup
    // ─ 48kHz matches the desktop capture and mic sample rates exactly,
    //   eliminating real-time resampling (a major cause of choppy system audio).
    // ─ 'interactive' latency hint minimises processing buffer depth.
    this.audioContext = new AudioContext({ sampleRate: 48000, latencyHint: 'interactive' });
    this.audioDestination = this.audioContext.createMediaStreamDestination();

    // AudioContext starts suspended in many browsers until a user gesture.
    // Resume it immediately — we are inside a button click handler so this is safe.
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }

    this.mixAudioSources();

    // 5. Create the Final Output Stream from the Mixer Canvas
    // This 'activeStream' is what gets sent to RTMP/Recording
    if (!this.canvas) throw new Error("Canvas mixer failed to initialize");

    const canvasStream = this.canvas.captureStream(30);
    const videoTracks = canvasStream.getVideoTracks();
    const audioTracks = this.audioDestination.stream.getAudioTracks();

    this.activeStream = new MediaStream([...videoTracks, ...audioTracks]);
    this.isPipelineActive = true;

    // Start the render loop to paint video -> canvas
    this.startRenderLoop();

    return this.activeStream;
  }

  /**
   * Creates the invisible HTML elements needed to mix the video
   */
  private initMixer() {
    // Create an invisible canvas to act as our stable stream source
    this.canvas = document.createElement("canvas");
    this.canvas.width = 1920;
    this.canvas.height = 1080;
    this.ctx = this.canvas.getContext("2d", { alpha: false });

    // Create a video element to play the incoming source (Screen or App)
    this.videoElement = document.createElement("video");
    this.videoElement.muted = true; // Prevent feedback loop
    this.videoElement.autoplay = true;
    this.videoElement.playsInline = true;
    this.videoElement.style.display = "none";
    document.body.appendChild(this.videoElement);
  }

  /**
   * Listens to the MediaStore. When 'screenShareMode' changes (User shares screen),
   * we trigger the logic to swap the video source.
   */
  private startObservingState() {
    if (this.unsubMediaStore) this.unsubMediaStore();
    if (this.unsubSceneStore) this.unsubSceneStore();

    this.unsubMediaStore = useMediaStore.subscribe((state, prevState) => {
      if (state.screenShareMode !== prevState.screenShareMode) {
        // We add a small delay to ensure windows have resized/focused
        setTimeout(() => this.updateVideoSource(), 500);
      }
    });

    this.unsubSceneStore = useSceneStore.subscribe((state, prevState) => {
      if (state.canvasLayout !== prevState.canvasLayout) {
        setTimeout(() => this.updateVideoSource(), 500);
      }
    });

    // Track app focus state for dynamic source switching
    window.addEventListener("focus", () => {
      if (!this.isAppFocused) {
        this.isAppFocused = true;
        this.updateVideoSource();
      }
    });

    window.addEventListener("blur", () => {
      if (this.isAppFocused) {
        this.isAppFocused = false;
        this.updateVideoSource();
      }
    });
  }

  private sceneHasScreenShare(sceneStore: any, mediaStore: any): boolean {
    // Check 1: Global screen share mode is active
    if (mediaStore.screenShareMode !== "off") return true;

    // Check 2: Active scene's canvas layout has a "screen" section
    const layout = sceneStore.canvasLayout;
    if (layout?.sections) {
      return layout.sections.some(
        (s: any) => s.content?.type === "screen"
      );
    }

    return false;
  }

  /**
   * THE CORE LOGIC: Determines whether to capture "Raw Screen" or "App Window"
   */
  private async updateVideoSource() {
    try {
      const isElectron = !!(window as ElectronWindow).electron;
      const mediaStore = useMediaStore.getState();
      const sceneStore = useSceneStore.getState();
      const isSharingInternally = mediaStore.screenShareMode !== "off";
      const hasScreenShare = this.sceneHasScreenShare(sceneStore, mediaStore);
      const isLive = useStreamStore.getState().isBroadcasting || useStreamStore.getState().isRecording;

      let newStream: MediaStream | null = null;

      if (isElectron) {
        // --- ELECTRON LOGIC (Automatic) ---
        const electron = (window as ElectronWindow).electron!;
        const sources = await electron.getDesktopSources({
          types: ["window", "screen"],
        });

        let selectedSource: any = null;
        let captureAppWindow = false;

        // Dynamic Source Logic Option A:
        // 1. In App -> Stream App Window
        // 2. Sharing Screen (in App) -> Stream App Window
        // 3. Out of App (Not Sharing) -> Stream Entire Screen
        // 4. Streaming/Recording and Scene has Screen Share -> Stream App Window (always)
        if (isLive && hasScreenShare) {
          captureAppWindow = true;
        } else if (this.isAppFocused) {
          captureAppWindow = true;
        } else {
          if (isSharingInternally) {
            captureAppWindow = true;
          } else {
            captureAppWindow = false;
          }
        }

        if (captureAppWindow) {
          const appWindowId = await electron.getAppWindowId?.();
          if (appWindowId) {
            selectedSource = sources.find((s: any) => s.id === appWindowId) || { id: appWindowId };
          } else {
            console.warn("[StreamService] getAppWindowId not available or null.");
          }
          
          if (!selectedSource) {
            console.warn("[StreamService] Could not find app window by ID!");
            if (isElectron && (window as any).electron?.logger) {
               (window as any).electron.logger.appendLine(`[StreamService] Could not find app window by ID!`);
            }
          }
        }

        if (!selectedSource) {
          // Capture RAW SCREEN
          selectedSource = sources.find((s: any) => s.id.startsWith("screen"));
        }

        if (selectedSource) {
          newStream = await navigator.mediaDevices.getUserMedia({
            // Request system audio alongside the video so the mixer can
            // pick it up via currentVideoSource.getAudioTracks().
            // Gracefully degrades: if the OS/source has no audio tracks the
            // mixer's length-check below handles it silently.
            audio: {
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
                frameRate: { ideal: 30, max: 60 },
              },
            },
          } as any);
        }
      } else {
        // --- WEB LOGIC (Manual/Fallback) ---
        // On Web, we cannot swap sources without a popup.
        // If we don't have a stream yet, we ask for "Entire Screen".
        // If we already have one, we keep it (seamless).
        if (!this.currentVideoSource) {
          newStream = await navigator.mediaDevices.getDisplayMedia({
            video: { width: 1920, height: 1080 },
            audio: false,
          });
        } else {
          // Keep existing stream
          return;
        }
      }

      // Apply the new stream to our mixer
      if (newStream) {
        // 1. Stop old tracks
        if (this.currentVideoSource) {
          this.currentVideoSource.getTracks().forEach((t) => t.stop());
        }

        this.currentVideoSource = newStream;

        // 2. Handle stream ending (User clicks "Stop Sharing" in system UI)
        newStream.getVideoTracks()[0].onended = () => {
          console.log("[StreamService] Source track ended externally.");
          if (useStreamStore.getState().isRecording) {
            this.stopRecording();
          }
          this.stopStreaming();
        };

        // 3. Play stream in hidden video element (which feeds the canvas)
        if (this.videoElement) {
          this.videoElement.srcObject = newStream;
          await this.videoElement
            .play()
            .catch((e) => console.error("Video play failed", e));
        }

        // 4. Re-mix audio (in case new source has system audio)
        this.mixAudioSources();
      }
    } catch (e) {
      console.error("[StreamService] Failed to update video source", e);
      notify.error("Failed to switch stream source");
      throw e;
    }
  }

  /**
   * Renders the video element onto the canvas at 30/60fps.
   * This is what creates the seamless stream.
   */
  private startRenderLoop() {
    const loop = () => {
      if (!this.isPipelineActive) return;

      if (this.ctx && this.videoElement && this.canvas) {
        const { width: canvasWidth, height: canvasHeight } = this.canvas;

        // Draw Black Background
        this.ctx.fillStyle = "#000000";
        this.ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Draw Video Source with Letterboxing (Fit)
        if (this.videoElement.readyState >= 2) {
          // HAVE_CURRENT_DATA
          const videoWidth = this.videoElement.videoWidth;
          const videoHeight = this.videoElement.videoHeight;

          if (videoWidth && videoHeight) {
            const scale = Math.min(
              canvasWidth / videoWidth,
              canvasHeight / videoHeight,
            );

            const drawWidth = videoWidth * scale;
            const drawHeight = videoHeight * scale;

            const offsetX = (canvasWidth - drawWidth) / 2;
            const offsetY = (canvasHeight - drawHeight) / 2;

            this.ctx.drawImage(
              this.videoElement,
              offsetX,
              offsetY,
              drawWidth,
              drawHeight,
            );
          }
        }
      }

      this.animationFrameId = requestAnimationFrame(loop);
    };
    loop();
  }

  private mixAudioSources() {
    if (!this.audioContext || !this.audioDestination) return;

    const ctx = this.audioContext;

    // ─── Peak limiter on the master bus ───────────────────────────────────────
    // Sits between all sources and the stream destination.
    // Prevents digital clipping when combined levels exceed 0 dBFS.
    const masterLimiter = this.createPeakLimiter(ctx);
    masterLimiter.connect(this.audioDestination);

    // ─── Monitor gain (self-hearing / sidetone) ───────────────────────────────
    // ONLY the microphone is routed here.
    // System audio must NOT go through the monitor:
    //   Desktop loopback capture grabs whatever plays on the speakers.
    //   If we also push system audio to speakers via monitorGain, the loopback
    //   re-captures it → doubled/phased audio → choppy broken computer audio.
    //   The user already hears computer audio normally through their speakers;
    //   routing it through the graph as well is redundant AND destructive.
    if (!this.monitorGain) {
      this.monitorGain = ctx.createGain();
      this.monitorGain.gain.value = 0; // silent by default — user raises via Master Output
      this.monitorGain.connect(ctx.destination);
    }

    // ─── 1. Microphone (with full filter chain) ───────────────────────────────
    //    micSource → [notch 60Hz] → [HPF 80Hz] → [noise gate] → masterLimiter
    //    Also tapped to monitorGain so the streamer can hear themselves.
    if (this.micStream && this.micStream.getAudioTracks().length > 0) {
      const micSource = ctx.createMediaStreamSource(this.micStream);
      const micChain  = this.createMicFilterChain(ctx, micSource);

      const micGain = ctx.createGain();
      micGain.gain.value = 1.0;
      micChain.connect(micGain);
      micGain.connect(masterLimiter);  // → outgoing stream (via limiter)
      micChain.connect(this.monitorGain); // → local speakers (sidetone only)
    }

    // ─── 2. System / Computer Audio ───────────────────────────────────────────
    //    → outgoing stream ONLY (viewers hear the streamer's computer audio)
    //    NOT routed to speakers — the OS already plays it there naturally.
    //    A DynamicsCompressorNode smooths amplitude spikes from the loopback
    //    capture's bursty, uneven chunk delivery.
    if (
      this.currentVideoSource &&
      this.currentVideoSource.getAudioTracks().length > 0
    ) {
      const sysSource = ctx.createMediaStreamSource(this.currentVideoSource);

      // 60Hz notch — removes electrical hum from the loopback capture path
      const sysNotch = ctx.createBiquadFilter();
      sysNotch.type = 'notch';
      sysNotch.frequency.value = 60;
      sysNotch.Q.value = 8;

      // Noise gate — cuts static/silence between actual audio.
      // System audio loopback has a higher noise floor than a mic, so we use
      // a slightly higher threshold (-40 dBFS vs -48 dBFS for mic).
      // Fast attack (5ms) so music/game audio isn't chopped at the start.
      // Longer release (200ms) so decaying sounds aren't cut off abruptly.
      const sysGate = this.createAudioGate(ctx, -40, 0.005, 0.200);

      // Compressor evens out the bursty chunks that desktop loopback produces.
      const compressor = ctx.createDynamicsCompressor();
      compressor.threshold.value = -24;
      compressor.knee.value       = 10;
      compressor.ratio.value      = 4;
      compressor.attack.value     = 0.003;
      compressor.release.value    = 0.15;

      const sysGain = ctx.createGain();
      sysGain.gain.value = 0.85;

      // Chain: source → notch → gate → compressor → gain → limiter
      sysSource.connect(sysNotch);
      sysNotch.connect(sysGate.input);
      sysGate.output.connect(compressor);
      compressor.connect(sysGain);
      sysGain.connect(masterLimiter);
      // ✗ NOT connected to monitorGain — prevents the feedback/double-capture loop
    }
  }

  /**
   * Builds the mic processing chain:
   *   micSource → [60Hz notch] → [80Hz HPF] → [noise gate] → output GainNode
   *
   * Returns the output GainNode. Connect it to stream destination and/or monitor.
   */
  private createMicFilterChain(
    ctx: AudioContext,
    micSource: MediaStreamAudioSourceNode,
    thresholdDb: number = -48,
  ): GainNode {
    // 60Hz notch — kills electrical ground-loop hum
    const notch = ctx.createBiquadFilter();
    notch.type = 'notch';
    notch.frequency.value = 60; // change to 50 for EU power grids
    notch.Q.value = 10;

    // 80Hz high-pass — kills low rumble / keyboard / desk thuds
    const hpf = ctx.createBiquadFilter();
    hpf.type = 'highpass';
    hpf.frequency.value = 80;
    hpf.Q.value = 0.707; // Butterworth — flat response above cutoff

    // Noise gate via the shared helper
    const gate = this.createAudioGate(ctx, thresholdDb, 0.010, 0.120);

    // Wire: micSource → notch → hpf → gate.input ; gate.output returned
    micSource.connect(notch);
    notch.connect(hpf);
    hpf.connect(gate.input);

    return gate.output;
  }

  /**
   * Generic noise gate — works for any audio source.
   *
   * Returns { input, output } so the caller can splice it into any chain:
   *   upstream.connect(gate.input);
   *   gate.output.connect(downstream);
   *
   * How it works:
   *   - An AnalyserNode taps the input to measure RMS every 16ms.
   *   - When RMS (in dBFS) rises above thresholdDb the output GainNode
   *     ramps to 1.0 with attackTc time-constant.
   *   - When RMS falls back below the threshold it ramps to 0 with releaseTc.
   *   - This cleanly silences static / loopback hiss between real audio events.
   */
  private createAudioGate(
    ctx: AudioContext,
    thresholdDb: number,  // e.g. -48 for mic, -40 for system audio
    attackTc:  number,    // seconds  (e.g. 0.010)
    releaseTc: number,    // seconds  (e.g. 0.120)
  ): { input: AnalyserNode; output: GainNode } {
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 256;
    const rmsBuffer = new Float32Array(analyser.frequencyBinCount);

    const gateGain = ctx.createGain();
    gateGain.gain.value = 0; // closed by default

    // The analyser node acts as both the measurement tap AND the audio passthrough
    // to gateGain — the gate gain controls whether audio flows out.
    analyser.connect(gateGain);

    let gateOpen = false;
    const id = setInterval(() => {
      if (ctx.state === 'closed') return;
      analyser.getFloatTimeDomainData(rmsBuffer);
      const rms = Math.sqrt(
        rmsBuffer.reduce((sum, v) => sum + v * v, 0) / rmsBuffer.length,
      );
      const dbFS = 20 * Math.log10(Math.max(rms, 1e-10));
      const shouldOpen = dbFS > thresholdDb;

      if (shouldOpen && !gateOpen) {
        gateGain.gain.setTargetAtTime(1, ctx.currentTime, attackTc);
        gateOpen = true;
      } else if (!shouldOpen && gateOpen) {
        gateGain.gain.setTargetAtTime(0, ctx.currentTime, releaseTc);
        gateOpen = false;
      }
    }, 16);

    this._gateIntervals.push(id);

    return { input: analyser, output: gateGain };
  }

  /**
   * Peak limiter on the master bus.
   * Prevents digital clipping when mic + system audio sum above 0 dBFS.
   * High ratio (20:1) approximates a brick-wall limiter.
   */
  private createPeakLimiter(ctx: AudioContext): DynamicsCompressorNode {
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -1.0;  // 1 dBFS below digital ceiling
    limiter.knee.value       = 0;    // hard knee — true limiting behaviour
    limiter.ratio.value      = 20;   // 20:1 ≈ brick-wall
    limiter.attack.value     = 0.001; // 1ms — catches transients before they clip
    limiter.release.value    = 0.1;   // 100ms
    return limiter;
  }

  /**
   * Set the local monitor (sidetone) volume. Called by the UI's Master Output
   * fader. Range: 0.0 (silent) – 1.0 (full). Does NOT affect the outgoing stream.
   */
  public setMonitorVolume(volume: number) {
    const clamped = Math.max(0, Math.min(1, volume));
    if (clamped > 0) this._lastMonitorVolume = clamped;
    if (this.monitorGain && this.audioContext) {
      this.monitorGain.gain.setTargetAtTime(
        clamped,
        this.audioContext.currentTime,
        0.02, // 20ms smooth ramp to avoid clicks
      );
    }
  }

  /**
   * Mute or unmute local monitor without affecting the outgoing stream.
   */
  public setMonitorMuted(muted: boolean) {
    this.setMonitorVolume(muted ? 0 : this._lastMonitorVolume);
  }

  // --- 2. STREAMING CONNECTION LOGIC ---

  public async startStreaming(targets: any[]) {
    try {
      this.isIntentionalStop = false;
      useStreamStore.getState().setConnecting(true);
      useStreamStore.getState().setStreamStatus("Initializing...");

      // Reset Retries
      targets.forEach((t) => this.retryCounts.set(t.id, 0));

      if (USE_KERNEL_PIPELINE) {
        // KNOWN LIMITATION: BroadcastBus is recreated on scene switches because
        // it is instantiated inside CanvasView which remounts per scene.
        // This will cause a brief stream drop during transitions.
        // Fix: move BroadcastBus instantiation up to CanvasContainer in a future refactor.
        // Tracked: Phase D known issue — stream drop on scene switch

        console.log("[StreamService] Using Kernel Pipeline (Phase D)");
        const kernel = BroadcastBus.activeInstance;
        if (!kernel) throw new Error("BroadcastBus active instance not found");

        const canvasStream = kernel.getStream();
        if (!canvasStream) {
          console.warn(
            "[StreamService] Kernel getStream() returned null, stream might fail",
          );
        }

        this.audioMixerEngine = new AudioMixerEngine();
        const audioStream = await this.audioMixerEngine.start();

        const activeTracks: MediaStreamTrack[] = [];
        if (canvasStream) {
          const vTracks = canvasStream.getVideoTracks();
          activeTracks.push(...vTracks);
        }
        if (audioStream) {
          const aTracks = audioStream.getAudioTracks();
          activeTracks.push(...aTracks);
        }

        const finalStream = new MediaStream(activeTracks);

        this.broadcastEncoder = new BroadcastEncoder();
        this.broadcastEncoder.start(finalStream, {
          targets,
          onStatus: (data: any) => this.handleStreamStatus(data),
          onProgress: (data: any) => this.handleStreamProgress(data),
        });
      } else {
        await this.startPipeline();
        
        const isElectron = !!(window as ElectronWindow).electron;
        if (isElectron) {
          if (!this.activeStream) throw new Error("No active stream for recorder");
          this.broadcastEncoder = new BroadcastEncoder();
          this.broadcastEncoder.start(this.activeStream, {
            targets,
            onStatus: (data: any) => this.handleStreamStatus(data),
            onProgress: (data: any) => this.handleStreamProgress(data),
          });
        } else {
          const mimeType = this.setupMediaRecorder();
          await this.connectWeb(targets);
        }
      }
    } catch (err: any) {
      console.error("[StreamService] Start Failed:", err);
      notify.error(`Start failed: ${err.message}`);
      this.stopStreaming();
    }
  }

  private setupMediaRecorder(): string {
    if (this.mediaRecorder && this.mediaRecorder.state === "recording") {
      return this.mediaRecorder.mimeType;
    }

    if (!this.activeStream) throw new Error("No active stream for recorder");

    const mimeType = this.getSupportedMimeType();

    this.mediaRecorder = new MediaRecorder(this.activeStream, {
      mimeType,
      videoBitsPerSecond: 4000000, // 4Mbps
    });

    const isElectron = !!(window as ElectronWindow).electron;

    this.mediaRecorder.ondataavailable = async (e) => {
      if (e.data.size > 0) {
        if (isElectron) {
          const buffer = await e.data.arrayBuffer();
          (window as ElectronWindow).electron?.stream.sendData(buffer);
        } else if (this.socket && this.socket.connected) {
          this.socket.emit("binary-stream", e.data);
        }
      }
    };

    this.mediaRecorder.start(1000); // Send chunks every 1s
    return mimeType;
  }

  private connectElectron(targets: any[], mimeType: string) {
    const electron = (window as ElectronWindow).electron!;

    electron.stream.onStatus((data: any) => {
      this.handleStreamStatus(data);
    });

    targets.forEach((dest) => {
      this.emitStartCommand(dest, mimeType);
    });
  }

  private emitStartCommand(dest: any, mimeType: string) {
    const isElectron = !!(window as ElectronWindow).electron;
    useStreamStore.getState().setDestinationStatus(dest.id, "starting");

    if (isElectron) {
      (window as ElectronWindow).electron!.stream.start({
        id: dest.id,
        rtmpUrl: dest.url,
        key: dest.key,
        mimeType,
      });
    } else if (this.socket) {
      this.socket.emit("start-stream", {
        id: dest.id,
        rtmpUrl: dest.url,
        key: dest.key,
      });
    }
  }

  private async connectWeb(targets: any[]) {
    if (!this.socket) {
      this.socket = io(SERVER_URL);
      this.socket.on("stream-status", (data: any) =>
        this.handleStreamStatus(data),
      );
    }

    if (!this.socket.connected) {
      await new Promise<void>((resolve) =>
        this.socket!.once("connect", () => resolve()),
      );
    }

    targets.forEach((dest) => {
      useStreamStore.getState().setDestinationStatus(dest.id, "starting");
      this.emitStartCommand(dest, "video/webm");
    });
  }

  // --- 3. STATUS HANDLING ---

  private handleStreamStatus(data: any) {
    const { id, status, error } =
      typeof data === "string" ? { status: data } : data;
    const store = useStreamStore.getState();

    if (!id) return;

    if (status === "error") {
      this.handleConnectionError(id, error);
      return;
    }

    if (status === "started") {
      this.startVerification(id);
    } else if (status === "stopped") {
      store.setDestinationStatus(id, "idle");
    }
  }

  private handleStreamProgress(data: any) {
    const { id, fps, kbps } = data;
    if (id && typeof fps === "number") {
      useStreamStore.getState().updateDestination(id, { fps, kbps });
    }
  }

  private startVerification(id: string) {
    useStreamStore.getState().setDestinationStatus(id, "starting");
    useStreamStore.getState().setStreamStatus("Verifying Connection...");

    if (this.verifyingTimers.has(id)) {
      clearTimeout(this.verifyingTimers.get(id)!);
    }

    const timer = setTimeout(() => {
      const store = useStreamStore.getState();
      const currentDest = store.destinations.find((d) => d.id === id);

      if (currentDest && currentDest.status === "starting") {
        store.setDestinationStatus(id, "connected");
        this.retryCounts.set(id, 0);

        const updatedStore = useStreamStore.getState();
        const allConnected = updatedStore.destinations
          .filter((d) => d.enabled)
          .every((d) => d.status === "connected" || d.status === "live");

        if (
          allConnected &&
          !updatedStore.isBroadcasting &&
          !this.countdownInterval
        ) {
          this.startCountdown();
        }
      }
    }, 3000);

    this.verifyingTimers.set(id, timer);
  }

  private handleConnectionError(id: string, errorMsg: string) {
    const store = useStreamStore.getState();

    // 1. ABORT COUNTDOWN / VERIFICATION
    if (this.verifyingTimers.has(id)) {
      clearTimeout(this.verifyingTimers.get(id)!);
      this.verifyingTimers.delete(id);
    }

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
      store.setCountdown(null);
    }

    // Skip retry logic if this was an intentional stop
    if (this.isIntentionalStop) {
      console.log(
        `[StreamService] Skipping retry for ${id} - intentional stop`,
      );
      store.setDestinationStatus(id, "idle");
      return;
    }

    // 2. CHECK RETRY LOGIC
    const currentRetries = this.retryCounts.get(id) || 0;

    if (currentRetries < this.MAX_RETRIES) {
      const nextRetry = currentRetries + 1;
      this.retryCounts.set(id, nextRetry);

      const retryDelay = 2000 * nextRetry;

      console.log(
        `[StreamService] Retry ${nextRetry}/${this.MAX_RETRIES} for ${id} in ${retryDelay}ms`,
      );
      store.setDestinationStatus(id, "error", `Retrying (${nextRetry})...`);
      store.setStreamStatus(`Connection Failed. Retrying...`);

      const dest = store.destinations.find((d) => d.id === id);
      if (dest) {
        setTimeout(() => {
          const mimeType = this.mediaRecorder?.mimeType || "video/webm";
          this.emitStartCommand(dest, mimeType);
        }, retryDelay);
      }
    } else {
      // 3. FINAL FAILURE
      console.error(`[StreamService] Max retries exceeded for ${id}`);
      store.setDestinationStatus(id, "error", errorMsg);
      store.setStreamStatus("Connection Failed");
      store.setConnecting(false);
      store.setBroadcasting(false);

      if (store.setFatalError) {
        store.setFatalError(errorMsg);
      } else {
        notify.error("Critical Stream Error: " + errorMsg);
      }
    }
  }

  private startCountdown() {

    const store = useStreamStore.getState();
    let count = 3;

    store.setCountdown(count);
    store.setStreamStatus("Starting...");

    this.countdownInterval = setInterval(() => {
      count--;
      store.setCountdown(count);

      if (count <= 0) {
        clearInterval(this.countdownInterval!);
        this.countdownInterval = null;
        store.setCountdown(null);
        store.setBroadcasting(true);
        store.setConnecting(false);
        store.setStreamStatus("Live");

        store.destinations.forEach((d) => {
          if (d.status === "connected") {
            store.setDestinationStatus(d.id, "live");
          }
        });
      }
    }, 1000);
  }

  public stopStreaming(specificId?: string) {
    this.isIntentionalStop = true;

    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
      useStreamStore.getState().setCountdown(null);
    }

    this.verifyingTimers.forEach((t) => clearTimeout(t));
    this.verifyingTimers.clear();

    const isElectron = !!(window as ElectronWindow).electron;

    if (specificId) {
      if (USE_KERNEL_PIPELINE || isElectron) {
        this.broadcastEncoder?.stop(specificId);
      } else {
        this.socket?.emit("stop-stream", { id: specificId });
      }
      useStreamStore.getState().setDestinationStatus(specificId, "idle");
    } else {
      if (USE_KERNEL_PIPELINE || isElectron) {
        this.broadcastEncoder?.stop();
      } else {
        this.socket?.emit("stop-stream");

        if (this.mediaRecorder && this.mediaRecorder.state !== "inactive") {
          this.mediaRecorder.stop();
        }
      }

      this.cleanupPipeline();

      const store = useStreamStore.getState();
      store.setBroadcasting(false);
      store.setConnecting(false);
      store.setStreamStatus("Idle");
      store.destinations.forEach((d) =>
        store.setDestinationStatus(d.id, "idle"),
      );
    }

    setTimeout(() => {
      this.isIntentionalStop = false;
    }, 1000);
  }

  private cleanupPipeline() {
    // Determine if we should really cleanup
    // If either broadcasting OR recording is active, we must keep pipeline
    if (
      useStreamStore.getState().isBroadcasting ||
      useStreamStore.getState().isRecording
    ) {
      return;
    }

    this.isPipelineActive = false;

    if (USE_KERNEL_PIPELINE) {
      this.audioMixerEngine?.destroy();
      this.audioMixerEngine = null;
      this.broadcastEncoder = null;
    } else {
      if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
      if (this.unsubMediaStore) this.unsubMediaStore();

      // Stop internal mixer sources
      this.activeStream?.getTracks().forEach((t) => t.stop());
      this.currentVideoSource?.getTracks().forEach((t) => t.stop());
      this.micStream?.getTracks().forEach((t) => t.stop());

      // Clean up DOM elements
      if (this.videoElement) {
        this.videoElement.pause();
        this.videoElement.srcObject = null;
        this.videoElement.remove();
        this.videoElement = null;
      }
      if (this.canvas) {
        this.canvas = null;
      }

      // Disconnect monitor gain before closing context
      this.monitorGain?.disconnect();
      this.monitorGain = null;

      // Clear noise-gate polling intervals before closing context
      this._gateIntervals.forEach(clearInterval);
      this._gateIntervals = [];

      this.audioContext?.close();
      this.activeStream = null;
      this.currentVideoSource = null;
      this.micStream = null;
      this.audioContext = null;
      this.audioDestination = null;
      this.broadcastEncoder = null;
    }
  }

  // --- 4. LOCAL RECORDING LOGIC ---

  // Separate recorder for local file download
  private localRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private recordingStartTime: number | null = null;

  public async startRecording() {
    try {
      useStreamStore.getState().setRecording(true);

      // Ensure pipeline is running (mixer, audio, etc.)
      await this.startPipeline();

      if (!this.activeStream) throw new Error("No active stream for recording");

      this.recordedChunks = [];
      const mimeType = this.getSupportedMimeType();

      this.localRecorder = new MediaRecorder(this.activeStream, {
        mimeType,
        videoBitsPerSecond: 8000000, // Higher quality for local (8Mbps)
      });

      this.localRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.recordedChunks.push(e.data);
        }
      };

      this.localRecorder.onstop = () => {
        this.downloadRecording();
        useStreamStore.getState().setRecording(false);
        // Only cleanup if not broadcasting
        if (!useStreamStore.getState().isBroadcasting) {
          this.cleanupPipeline();
        }
      };

      this.localRecorder.start(1000); // chunk every 1s

      this.recordingStartTime = Date.now();
      // Start duration timer
      this.startRecordingTimer();
    } catch (err: any) {
      console.error("[StreamService] Start Recording Failed:", err);
      notify.error(`Recording failed: ${err.message}`);
      useStreamStore.getState().setRecording(false);
      this.cleanupPipeline();
    }
  }

  public stopRecording() {
    console.log("[StreamService] Stopping Recording...");
    if (this.localRecorder && this.localRecorder.state !== "inactive") {
      this.localRecorder.stop();
    }
    this.stopRecordingTimer();
  }

  private async downloadRecording() {
    if (this.recordedChunks.length === 0) return;

    try {
      const blob = new Blob(this.recordedChunks, {
        type: this.localRecorder?.mimeType || "video/webm",
      });

      // Calculate duration
      const duration = this.recordingStartTime
        ? Date.now() - this.recordingStartTime
        : 0;

      // Fix metadata
      const fixedBlob = await new Promise<Blob>((resolve) => {
        fixWebmDuration(blob, duration, (fixed) => {
          resolve(fixed);
        });
      });

      // Electron specific save or Web download
      const isElectron = !!(window as ElectronWindow).electron;

      if (isElectron) {
        this.triggerBrowserDownload(fixedBlob);
      } else {
        this.triggerBrowserDownload(fixedBlob);
      }

      this.recordedChunks = [];
    } catch (e) {
      console.error("Failed to download recording", e);
      notify.error("Failed to save recording");
    }
  }

  private triggerBrowserDownload(blob: Blob) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.display = "none";
    a.href = url;
    a.download = `recording-${new Date().toISOString().replace(/:/g, "-")}.webm`;
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    notify.success("Recording saved!");
  }

  private recordingTimer: NodeJS.Timeout | null = null;
  private startRecordingTimer() {
    if (this.recordingTimer) clearInterval(this.recordingTimer);
    const startTime = Date.now();
    this.recordingTimer = setInterval(() => {
      useStreamStore
        .getState()
        .setRecordingDuration(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
  }

  private stopRecordingTimer() {
    if (this.recordingTimer) {
      clearInterval(this.recordingTimer);
      this.recordingTimer = null;
      useStreamStore.getState().setRecordingDuration(0);
    }
  }

  // --- Utils ---
  private getSupportedMimeType(): string {
    const types = [
      "video/webm; codecs=h264",
      "video/webm; codecs=vp9",
      "video/webm; codecs=vp8",
      "video/webm",
    ];
    return types.find((t) => MediaRecorder.isTypeSupported(t)) || "video/webm";
  }
}

export const streamService = StreamService.getInstance();
