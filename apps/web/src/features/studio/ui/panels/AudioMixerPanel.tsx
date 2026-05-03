import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Volume2,
  VolumeX,
  Mic,
  Speaker,
  Plus,
  Trash2,
  Play,
  Pause,
  Square,
  Repeat,
  Link,
  Upload,
  Music,
  Tag,
  Check,
  AudioLines,
  ChevronDown,
  ChevronRight,
  Info,
} from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
import { Slider } from "@gaki/ui/slider";
import { Button } from "@gaki/ui/button";
import { Input } from "@gaki/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@gaki/ui/tooltip";
import { useMediaStore } from "@/stores/media.store";
import { useSceneAudioStore } from "@/stores/sceneAudio.store";
import { SceneAudioTrack } from "@gaki/core/types/caption";
import { streamService } from "@/features/stream/services/stream.service";

/* ─── Section Card wrapper ─── */
const MixerSection: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ icon, title, description, badge, action, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-border/30 bg-card/50 overflow-hidden">
      {/* Section header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 hover:bg-accent/5 transition-colors"
      >
        <span className="text-primary/80">{icon}</span>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-foreground">{title}</span>
            {badge && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[10px] text-muted-foreground/70 leading-snug mt-0.5">{description}</p>
        </div>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50 shrink-0" />
        )}
      </button>

      {/* Section content */}
      {open && (
        <div className="px-3 pb-3 space-y-2">
          {action && <div className="flex justify-end">{action}</div>}
          {children}
        </div>
      )}
    </div>
  );
};

/* ─── Fader Strip (for mic/master) ─── */
interface FaderStripProps {
  label: string;
  icon: React.ReactNode;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteToggle: () => void;
  isActive?: boolean;
  extra?: React.ReactNode;
}

const FaderStrip: React.FC<FaderStripProps> = ({
  label,
  icon,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  isActive = true,
  extra,
}) => (
  <div
    className={cn(
      "p-3 rounded-lg bg-background/60 border border-border/20 space-y-2.5 transition-opacity",
      !isActive && "opacity-40 pointer-events-none"
    )}
  >
    <div className="flex items-center gap-2.5">
      <span className="text-muted-foreground/80">{icon}</span>
      <span className="text-[11px] font-medium text-foreground/90 truncate flex-1">{label}</span>
      <button
        onClick={onMuteToggle}
        className={cn(
          "p-1.5 rounded-md transition-all",
          isMuted
            ? "text-destructive bg-destructive/15 hover:bg-destructive/25"
            : "text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground/80"
        )}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
      </button>
    </div>
    <div className="flex items-center gap-3">
      <Slider
        value={[isMuted ? 0 : volume]}
        onValueChange={([v]) => onVolumeChange(v)}
        min={0}
        max={100}
        step={1}
        className="flex-1"
        disabled={!isActive}
      />
      <span className="text-[10px] text-muted-foreground font-medium w-8 text-right tabular-nums">
        {isMuted ? "0" : volume}%
      </span>
    </div>
    {extra && <div className="pt-0.5">{extra}</div>}
  </div>
);

/* ─── Output Sound Test ─── */
const OutputSoundTest: React.FC<{ volume: number; muted: boolean }> = ({ volume, muted }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const oscRef = useRef<OscillatorNode | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);

  const playTestTone = useCallback(() => {
    if (isPlaying) {
      oscRef.current?.stop();
      oscRef.current = null;
      ctxRef.current?.close();
      ctxRef.current = null;
      setIsPlaying(false);
      return;
    }

    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const gainNode = ctx.createGain();
    gainNode.gain.value = muted ? 0 : volume / 100;
    gainNode.connect(ctx.destination);

    const notes = [523.25, 659.25, 783.99, 1046.5];
    let time = ctx.currentTime;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.frequency.value = freq;
      const noteGain = ctx.createGain();
      noteGain.gain.setValueAtTime(0, time + i * 0.3);
      noteGain.gain.linearRampToValueAtTime(0.3, time + i * 0.3 + 0.05);
      noteGain.gain.linearRampToValueAtTime(0, time + i * 0.3 + 0.25);
      osc.connect(noteGain);
      noteGain.connect(gainNode);
      osc.start(time + i * 0.3);
      osc.stop(time + i * 0.3 + 0.3);
      if (i === notes.length - 1) {
        osc.onended = () => {
          setIsPlaying(false);
          ctx.close();
          ctxRef.current = null;
        };
      }
    });

    setIsPlaying(true);
  }, [isPlaying, volume, muted]);

  useEffect(() => {
    return () => {
      oscRef.current?.stop();
      ctxRef.current?.close();
    };
  }, []);

  return (
    <Button
      onClick={playTestTone}
      variant={isPlaying ? "default" : "outline"}
      size="sm"
      className={cn(
        "h-7 text-[10px] gap-1.5",
        isPlaying && "animate-pulse"
      )}
    >
      {isPlaying ? <Square className="w-3 h-3" /> : <Play className="w-3 h-3" />}
      {isPlaying ? "Stop Test" : "Test Speakers"}
    </Button>
  );
};

/* ─── Input Sound Test (Record & Playback) ─── */
const InputSoundTest: React.FC<{ deviceId: string }> = ({ deviceId }) => {
  const [state, setState] = useState<"idle" | "recording" | "playing">("idle");
  const [countdown, setCountdown] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const MAX_DURATION = 5;

  const cleanup = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (recorderRef.current && recorderRef.current.state !== "inactive") {
      recorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  useEffect(() => () => cleanup(), [cleanup]);

  const startRecording = useCallback(async () => {
    cleanup();
    chunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: deviceId === "default" ? true : { deviceId: { exact: deviceId } },
      });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        if (chunksRef.current.length > 0) {
          const blob = new Blob(chunksRef.current, { type: "audio/webm" });
          const url = URL.createObjectURL(blob);
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            setState("idle");
            setCountdown(0);
            URL.revokeObjectURL(url);
          };
          audio.play().catch(() => setState("idle"));
          setState("playing");
          setCountdown(0);
        } else {
          setState("idle");
        }
      };

      recorder.start();
      setState("recording");
      setCountdown(MAX_DURATION);

      let remaining = MAX_DURATION;
      timerRef.current = setInterval(() => {
        remaining -= 1;
        setCountdown(remaining);
        if (remaining <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          if (recorderRef.current && recorderRef.current.state !== "inactive") {
            recorderRef.current.stop();
          }
        }
      }, 1000);
    } catch (err) {
      console.error("[SoundTest] Mic access failed:", err);
      setState("idle");
    }
  }, [deviceId, cleanup]);

  const stop = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (state === "recording" && recorderRef.current?.state !== "inactive") {
      recorderRef.current?.stop();
    } else if (state === "playing") {
      audioRef.current?.pause();
      setState("idle");
      setCountdown(0);
    }
  }, [state]);

  return (
    <Button
      onClick={state === "idle" ? startRecording : stop}
      variant={state === "idle" ? "outline" : state === "recording" ? "destructive" : "default"}
      size="sm"
      className={cn(
        "h-7 text-[10px] gap-1.5",
        state === "recording" && "animate-pulse"
      )}
    >
      {state === "recording" ? (
        <>
          <Square className="w-3 h-3" />
          Recording {countdown}s
        </>
      ) : state === "playing" ? (
        <>
          <Square className="w-3 h-3" />
          Playing back…
        </>
      ) : (
        <>
          <Mic className="w-3 h-3" />
          Test Mic
        </>
      )}
    </Button>
  );
};

/* ─── Format seconds to mm:ss ─── */
const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
};

/* ─── Scene Assignment Popover ─── */
interface SceneAssignmentProps {
  track: SceneAudioTrack;
  scenes: { id: string; name: string }[];
  onUpdate: (id: string, patch: Partial<SceneAudioTrack>) => void;
}

const SceneAssignment: React.FC<SceneAssignmentProps> = ({ track, scenes, onUpdate }) => {
  const [open, setOpen] = useState(false);

  const toggleScene = (sceneId: string) => {
    const current = track.assignedSceneIds;
    const isAssigned = current.includes(sceneId);
    let newIds: string[];
    if (isAssigned) {
      newIds = current.filter((id) => id !== sceneId);
    } else {
      newIds = [...current, sceneId];
    }
    onUpdate(track.id, { assignedSceneIds: newIds });
  };

  const assignAll = () => {
    onUpdate(track.id, { assignedSceneIds: [] });
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors",
          track.assignedSceneIds.length === 0
            ? "text-muted-foreground/60 hover:bg-muted/50 border border-border/20"
            : "text-primary bg-primary/10 border border-primary/20"
        )}
        title="Assign to scenes"
      >
        <Tag className="w-3 h-3" />
        {track.assignedSceneIds.length === 0
          ? "All scenes"
          : `${track.assignedSceneIds.length} scene${track.assignedSceneIds.length > 1 ? "s" : ""}`}
      </button>
    );
  }

  return (
    <div className="p-2.5 rounded-lg bg-muted/30 border border-border/20 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold text-muted-foreground">Assign to Scenes</span>
        <button onClick={() => setOpen(false)} className="text-[10px] text-primary hover:underline font-medium">
          Done
        </button>
      </div>
      <button
        onClick={assignAll}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] transition-colors text-left",
          track.assignedSceneIds.length === 0
            ? "bg-primary/10 text-primary font-medium"
            : "text-muted-foreground hover:bg-muted/50"
        )}
      >
        {track.assignedSceneIds.length === 0 && <Check className="w-3 h-3" />}
        <span>All scenes</span>
      </button>
      {scenes.map((scene) => {
        const isExplicit = track.assignedSceneIds.includes(scene.id);
        return (
          <button
            key={scene.id}
            onClick={() => {
              if (track.assignedSceneIds.length === 0) {
                onUpdate(track.id, { assignedSceneIds: [scene.id] });
              } else {
                toggleScene(scene.id);
              }
            }}
            className={cn(
              "w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] transition-colors text-left",
              isExplicit
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-muted/50"
            )}
          >
            {isExplicit && <Check className="w-3 h-3" />}
            <span>{scene.name}</span>
          </button>
        );
      })}
    </div>
  );
};

/* ─── Scene Audio Track Row ─── */
interface TrackRowProps {
  track: SceneAudioTrack;
  scenes: { id: string; name: string }[];
  onUpdate: (id: string, patch: Partial<SceneAudioTrack>) => void;
  onRemove: (id: string) => void;
}

const TrackRow: React.FC<TrackRowProps> = ({ track, scenes, onUpdate, onRemove }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seekTimerRef = useRef<number | null>(null);
  const [showDucking, setShowDucking] = useState(false);
  const isAudioOn = useMediaStore((s) => s.isAudioOn);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const duckingStreamRef = useRef<MediaStream | null>(null);
  const duckingRafRef = useRef<number | null>(null);
  const isDuckedRef = useRef(false);

  useEffect(() => {
    if (!track.duckingEnabled || !isAudioOn) {
      if (isDuckedRef.current && audioRef.current) {
        audioRef.current.volume = track.isMuted ? 0 : track.volume / 100;
        isDuckedRef.current = false;
      }
      if (duckingRafRef.current) cancelAnimationFrame(duckingRafRef.current);
      if (duckingStreamRef.current) {
        duckingStreamRef.current.getTracks().forEach((t) => t.stop());
        duckingStreamRef.current = null;
      }
      analyserRef.current = null;
      return;
    }

    let cancelled = false;

    const setupDucking = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) { stream.getTracks().forEach((t) => t.stop()); return; }
        duckingStreamRef.current = stream;

        const ctx = new AudioContext();
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.8;
        source.connect(analyser);
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const SPEECH_THRESHOLD = 25;

        const monitorLevel = () => {
          if (cancelled) return;
          analyser.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const val = (dataArray[i] - 128) / 128;
            sum += val * val;
          }
          const rms = Math.sqrt(sum / dataArray.length) * 100;

          const el = audioRef.current;
          if (el) {
            const baseVolume = track.isMuted ? 0 : track.volume / 100;
            if (rms > SPEECH_THRESHOLD) {
              const duckedVolume = baseVolume * (track.duckingLevel / 100);
              el.volume = duckedVolume;
              isDuckedRef.current = true;
            } else if (isDuckedRef.current) {
              el.volume = baseVolume;
              isDuckedRef.current = false;
            }
          }

          duckingRafRef.current = requestAnimationFrame(monitorLevel);
        };
        duckingRafRef.current = requestAnimationFrame(monitorLevel);
      } catch (err) {
        console.error("[Ducking] Failed to get mic:", err);
      }
    };

    setupDucking();

    return () => {
      cancelled = true;
      if (duckingRafRef.current) cancelAnimationFrame(duckingRafRef.current);
      if (duckingStreamRef.current) {
        duckingStreamRef.current.getTracks().forEach((t) => t.stop());
        duckingStreamRef.current = null;
      }
      analyserRef.current = null;
    };
  }, [track.duckingEnabled, isAudioOn, track.volume, track.isMuted, track.duckingLevel]);

  // Initialize audio element
  useEffect(() => {
    const el = new Audio();
    el.preload = "auto";
    if (track.sourceUrl.startsWith("blob:") || track.sourceUrl.startsWith("data:")) {
      el.crossOrigin = "anonymous";
    }

    el.addEventListener("progress", () => {
      if (el.buffered.length > 0 && el.duration > 0) {
        const pct = (el.buffered.end(el.buffered.length - 1) / el.duration) * 100;
        setLoadProgress(Math.round(pct));
      }
    });
    el.addEventListener("canplaythrough", () => {
      setIsLoading(false);
      setLoadProgress(100);
      if (el.duration && isFinite(el.duration)) {
        onUpdate(track.id, { duration: el.duration });
      }
    });
    el.addEventListener("loadedmetadata", () => {
      if (el.duration && isFinite(el.duration)) {
        onUpdate(track.id, { duration: el.duration });
      }
    });
    el.addEventListener("loadstart", () => {
      setIsLoading(true);
      setError(null);
      setLoadProgress(0);
    });
    el.addEventListener("error", () => {
      setIsLoading(false);
      setError("Failed to load audio");
      onUpdate(track.id, { isPlaying: false });
    });
    el.addEventListener("ended", () => {
      if (!el.loop) onUpdate(track.id, { isPlaying: false, currentTime: 0 });
    });

    if (track.currentTime > 0) {
      el.currentTime = track.currentTime;
    }
    el.src = track.sourceUrl;
    audioRef.current = el;

    if (track.isPlaying) {
      el.addEventListener("canplaythrough", function autoResume() {
        el.removeEventListener("canplaythrough", autoResume);
        el.volume = track.isMuted ? 0 : track.volume / 100;
        el.loop = track.isLooping;
        if (track.currentTime > 0) el.currentTime = track.currentTime;
        el.play().catch(() => {});
      }, { once: true });
    }

    const updateTime = () => {
      if (audioRef.current && !audioRef.current.paused) {
        onUpdate(track.id, { currentTime: audioRef.current.currentTime });
      }
      seekTimerRef.current = requestAnimationFrame(updateTime);
    };
    seekTimerRef.current = requestAnimationFrame(updateTime);

    return () => {
      if (seekTimerRef.current) cancelAnimationFrame(seekTimerRef.current);
      el.pause();
      if (el.currentTime > 0) {
        onUpdate(track.id, { currentTime: el.currentTime, isPlaying: false });
      }
      el.removeAttribute("src");
      el.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.sourceUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = track.isMuted ? 0 : track.volume / 100;
      audioRef.current.loop = track.isLooping;
    }
  }, [track.volume, track.isMuted, track.isLooping]);

  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    if (track.isPlaying && el.paused) {
      el.volume = track.isMuted ? 0 : track.volume / 100;
      el.loop = track.isLooping;
      el.play().catch(() => {});
    } else if (!track.isPlaying && !el.paused) {
      el.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.isPlaying]);

  const togglePlay = useCallback(() => {
    const el = audioRef.current;
    if (!el) return;
    if (track.isPlaying) {
      el.pause();
      onUpdate(track.id, { isPlaying: false, currentTime: el.currentTime });
    } else {
      el.volume = track.isMuted ? 0 : track.volume / 100;
      el.loop = track.isLooping;
      el.play().catch((err) => {
        console.error("Playback failed:", err);
        setError("Playback blocked – click again");
      });
      onUpdate(track.id, { isPlaying: true });
    }
  }, [track, onUpdate]);

  const handleSeek = useCallback(
    ([value]: number[]) => {
      const el = audioRef.current;
      if (!el || !isFinite(track.duration)) return;
      const newTime = (value / 100) * track.duration;
      el.currentTime = newTime;
      onUpdate(track.id, { currentTime: newTime });
    },
    [track.id, track.duration, onUpdate]
  );

  const seekPercent = track.duration > 0 ? (track.currentTime / track.duration) * 100 : 0;

  return (
    <div className="p-3 rounded-lg bg-background/60 border border-border/20 space-y-2.5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Music className={cn("w-4 h-4 shrink-0", error ? "text-destructive" : "text-primary/70")} />
        <span className="text-[11px] font-medium text-foreground/90 truncate flex-1" title={error || track.name}>
          {error || track.name}
        </span>

        {/* Transport controls */}
        <div className="flex items-center gap-0.5 shrink-0">
          <button
            onClick={togglePlay}
            className={cn(
              "p-1.5 rounded-md transition-all",
              track.isPlaying
                ? "text-primary bg-primary/15"
                : "text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground/80"
            )}
            title={track.isPlaying ? "Pause" : "Play"}
          >
            {track.isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
          <button
            onClick={() => onUpdate(track.id, { isLooping: !track.isLooping })}
            className={cn(
              "p-1.5 rounded-md transition-all",
              track.isLooping
                ? "text-primary bg-primary/15"
                : "text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground/80"
            )}
            title={track.isLooping ? "Disable loop" : "Enable loop"}
          >
            <Repeat className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdate(track.id, { isMuted: !track.isMuted })}
            className={cn(
              "p-1.5 rounded-md transition-all",
              track.isMuted
                ? "text-destructive bg-destructive/15"
                : "text-muted-foreground/60 hover:bg-muted/80 hover:text-foreground/80"
            )}
            title={track.isMuted ? "Unmute" : "Mute"}
          >
            {track.isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => {
              audioRef.current?.pause();
              onRemove(track.id);
            }}
            className="p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-all"
            title="Remove track"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Loading progress */}
      {isLoading && (
        <div className="flex items-center gap-2.5">
          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary/60 transition-all duration-300 rounded-full"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground font-medium w-8 text-right tabular-nums">
            {loadProgress}%
          </span>
        </div>
      )}

      {/* Seek bar */}
      {track.duration > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground tabular-nums w-9 text-right font-medium">
            {formatTime(track.currentTime)}
          </span>
          <Slider value={[seekPercent]} onValueChange={handleSeek} min={0} max={100} step={0.1} className="flex-1" />
          <span className="text-[10px] text-muted-foreground tabular-nums w-9 font-medium">
            {formatTime(track.duration)}
          </span>
        </div>
      )}

      {/* Volume */}
      <div className="flex items-center gap-3">
        <Volume2 className="w-3 h-3 text-muted-foreground/50 shrink-0" />
        <Slider
          value={[track.isMuted ? 0 : track.volume]}
          onValueChange={([v]) => onUpdate(track.id, { volume: v })}
          min={0}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-[10px] text-muted-foreground font-medium w-8 text-right tabular-nums">
          {track.isMuted ? "0" : track.volume}%
        </span>
      </div>

      {/* Smart Ducking */}
      <div className="space-y-1.5">
        <button
          onClick={() => setShowDucking(!showDucking)}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium transition-colors",
            track.duckingEnabled
              ? "text-primary bg-primary/10 border border-primary/20"
              : "text-muted-foreground/60 hover:bg-muted/50 border border-border/20"
          )}
        >
          <AudioLines className="w-3 h-3" />
          Smart Ducking {track.duckingEnabled ? "On" : "Off"}
        </button>
        {showDucking && (
          <div className="p-2.5 rounded-lg bg-muted/20 border border-border/20 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">Auto-lower when speaking</span>
              <Button
                variant={track.duckingEnabled ? "default" : "outline"}
                size="sm"
                className="h-6 text-[10px] px-2.5"
                onClick={() => onUpdate(track.id, { duckingEnabled: !track.duckingEnabled })}
              >
                {track.duckingEnabled ? "Enabled" : "Disabled"}
              </Button>
            </div>
            {track.duckingEnabled && (
              <div className="space-y-1.5">
                <span className="text-[10px] text-muted-foreground">
                  Volume when speaking: <span className="font-medium text-foreground/80">{track.duckingLevel}%</span>
                </span>
                <Slider
                  value={[track.duckingLevel]}
                  onValueChange={([v]) => onUpdate(track.id, { duckingLevel: v })}
                  min={0}
                  max={100}
                  step={5}
                  className="flex-1"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Scene assignment */}
      {scenes.length > 1 && <SceneAssignment track={track} scenes={scenes} onUpdate={onUpdate} />}
    </div>
  );
};

/* ─── Main Panel ─── */
export function AudioMixerPanel() {
  const audioDevices = useMediaStore((s) => s.audioDevices);
  const isAudioOn = useMediaStore((s) => s.isAudioOn);

  const activeSceneId = useSceneAudioStore((s) => s.activeSceneId);
  const scenes = useSceneAudioStore((s) => s.scenes);
  const allTracks = useSceneAudioStore((s) => s.tracks);
  const addTrack = useSceneAudioStore((s) => s.addTrack);
  const updateTrack = useSceneAudioStore((s) => s.updateTrack);
  const removeTrack = useSceneAudioStore((s) => s.removeTrack);

  const sceneTracks = allTracks.filter(
    (t) => t.assignedSceneIds.length === 0 || t.assignedSceneIds.includes(activeSceneId)
  );

  const [deviceVolumes, setDeviceVolumes] = useState<
    Record<string, { volume: number; muted: boolean }>
  >({});

  const [masterVolume, setMasterVolume] = useState(80);
  const [masterMuted, setMasterMuted] = useState(false);

  // Wire the fader to the live audio graph so the user can
  // control their local self-monitoring (sidetone) volume.
  const handleMasterVolumeChange = (v: number) => {
    setMasterVolume(v);
    streamService.setMonitorVolume(v / 100);
  };

  const handleMasterMuteToggle = () => {
    const nextMuted = !masterMuted;
    setMasterMuted(nextMuted);
    streamService.setMonitorMuted(nextMuted);
  };

  const [showAddTrack, setShowAddTrack] = useState(false);
  const [addMode, setAddMode] = useState<"file" | "url">("file");
  const [urlInput, setUrlInput] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getDeviceVolume = (deviceId: string) =>
    deviceVolumes[deviceId] ?? { volume: 100, muted: false };

  const updateDeviceVolume = (deviceId: string, volume: number) => {
    setDeviceVolumes((prev) => ({
      ...prev,
      [deviceId]: { ...getDeviceVolume(deviceId), volume },
    }));
  };

  const toggleDeviceMute = (deviceId: string) => {
    const current = getDeviceVolume(deviceId);
    setDeviceVolumes((prev) => ({
      ...prev,
      [deviceId]: { ...current, muted: !current.muted },
    }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file);
      const track: SceneAudioTrack = {
        id: crypto.randomUUID(),
        name: file.name,
        sourceType: "file",
        sourceUrl: url,
        volume: 80,
        isMuted: false,
        isLooping: false,
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        assignedSceneIds: activeSceneId ? [activeSceneId] : [],
        duckingEnabled: false,
        duckingLevel: 30,
      };
      addTrack(track);
    });
    setShowAddTrack(false);
    e.target.value = "";
  };

  const isUnsupportedUrl = (url: string): string | null => {
    const lower = url.toLowerCase();
    const blocked = [
      { pattern: /youtube\.com|youtu\.be/, name: "YouTube" },
      { pattern: /spotify\.com/, name: "Spotify" },
      { pattern: /soundcloud\.com/, name: "SoundCloud" },
      { pattern: /music\.apple\.com/, name: "Apple Music" },
      { pattern: /tidal\.com/, name: "Tidal" },
    ];
    for (const { pattern, name } of blocked) {
      if (pattern.test(lower)) return name;
    }
    return null;
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const blocked = isUnsupportedUrl(urlInput.trim());
    if (blocked) {
      setUrlError(
        `${blocked} links aren't direct audio files. Use a direct .mp3/.ogg/.wav URL instead.`
      );
      return;
    }
    setUrlError(null);
    const track: SceneAudioTrack = {
      id: crypto.randomUUID(),
      name: urlInput.split("/").pop() || "Stream",
      sourceType: "url",
      sourceUrl: urlInput.trim(),
      volume: 80,
      isMuted: false,
      isLooping: false,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      assignedSceneIds: activeSceneId ? [activeSceneId] : [],
      duckingEnabled: false,
      duckingLevel: 30,
    };
    addTrack(track);
    setUrlInput("");
    setShowAddTrack(false);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-3">
        {/* ── OUTPUT ── */}
        <MixerSection
          icon={<Speaker className="w-4 h-4" />}
          title="Output"
          description="The final mixed audio your audience hears through speakers or stream"
        >
          <FaderStrip
            label="Master Output"
            icon={<Speaker className="w-4 h-4" />}
            volume={masterVolume}
            isMuted={masterMuted}
            onVolumeChange={handleMasterVolumeChange}
            onMuteToggle={handleMasterMuteToggle}
            extra={<OutputSoundTest volume={masterVolume} muted={masterMuted} />}
          />
        </MixerSection>

        {/* ── INPUT SOURCES ── */}
        <MixerSection
          icon={<Mic className="w-4 h-4" />}
          title="Input Sources"
          description="Microphones and instruments capturing your audio"
          badge={`${audioDevices.length}`}
        >
          {audioDevices.length === 0 ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border/10">
              <Info className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              <span className="text-[11px] text-muted-foreground/70">
                No input devices detected. Connect a microphone to get started.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {audioDevices.map((device) => {
                const dv = getDeviceVolume(device.deviceId);
                return (
                  <FaderStrip
                    key={device.deviceId}
                    label={device.label || `Mic ${device.deviceId.slice(0, 6)}`}
                    icon={<Mic className="w-4 h-4" />}
                    volume={dv.volume}
                    isMuted={dv.muted}
                    onVolumeChange={(v) => updateDeviceVolume(device.deviceId, v)}
                    onMuteToggle={() => toggleDeviceMute(device.deviceId)}
                    isActive={isAudioOn}
                    extra={<InputSoundTest deviceId={device.deviceId} />}
                  />
                );
              })}
            </div>
          )}
        </MixerSection>

        {/* ── SCENE AUDIO ── */}
        <MixerSection
          icon={<Music className="w-4 h-4" />}
          title="Scene Audio"
          description="Background music, sound effects, and audio tracks for your scene"
          badge={sceneTracks.length > 0 ? `${sceneTracks.length}` : undefined}
          action={
            <Button
              variant={showAddTrack ? "default" : "outline"}
              size="sm"
              className="h-7 text-[10px] gap-1.5"
              onClick={() => setShowAddTrack(!showAddTrack)}
            >
              <Plus className="w-3 h-3" />
              Add Track
            </Button>
          }
        >
          {/* Add Track Panel */}
          {showAddTrack && (
            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-3">
              <div className="flex gap-1.5">
                <button
                  onClick={() => setAddMode("file")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all",
                    addMode === "file"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 border border-border/20"
                  )}
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload File
                </button>
                <button
                  onClick={() => setAddMode("url")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 px-2.5 py-2 rounded-lg text-[11px] font-medium transition-all",
                    addMode === "url"
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted/50 border border-border/20"
                  )}
                >
                  <Link className="w-3.5 h-3.5" />
                  URL / Stream
                </button>
              </div>

              {addMode === "file" ? (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="audio/*,.mp3,.wav,.ogg,.flac,.aac,.m4a,.wma,.opus,.webm,.aiff,.mid,.midi"
                    multiple
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full h-9 text-[11px]"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1.5" />
                    Choose Audio Files
                  </Button>
                </>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-1.5">
                    <Input
                      value={urlInput}
                      onChange={(e) => {
                        setUrlInput(e.target.value);
                        setUrlError(null);
                      }}
                      placeholder="https://example.com/audio.mp3"
                      className={cn("h-8 text-[11px] flex-1", urlError && "border-destructive")}
                      onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                    />
                    <Button
                      variant="default"
                      size="sm"
                      className="h-8 px-3 text-[11px]"
                      onClick={handleAddUrl}
                      disabled={!urlInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {urlError && (
                    <p className="text-[10px] text-destructive px-0.5">{urlError}</p>
                  )}
                </div>
              )}
            </div>
          )}

          {sceneTracks.length === 0 && !showAddTrack ? (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/20 border border-border/10">
              <Music className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              <span className="text-[11px] text-muted-foreground/70">
                No audio tracks yet. Add background music or sound effects.
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              {sceneTracks.map((track) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  scenes={scenes}
                  onUpdate={updateTrack}
                  onRemove={removeTrack}
                />
              ))}
            </div>
          )}
        </MixerSection>
      </div>
    </TooltipProvider>
  );
}
