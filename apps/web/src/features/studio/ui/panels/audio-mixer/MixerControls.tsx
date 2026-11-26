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
export const MixerSection: React.FC<{
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
export interface FaderStripProps {
  label: string;
  icon: React.ReactNode;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteToggle: () => void;
  isActive?: boolean;
  extra?: React.ReactNode;
}

export const FaderStrip: React.FC<FaderStripProps> = ({
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
export const OutputSoundTest: React.FC<{ volume: number; muted: boolean }> = ({ volume, muted }) => {
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
export const InputSoundTest: React.FC<{ deviceId: string }> = ({ deviceId }) => {
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
