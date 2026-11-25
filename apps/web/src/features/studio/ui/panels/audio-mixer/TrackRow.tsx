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
export interface TrackRowProps {
  track: SceneAudioTrack;
  scenes: { id: string; name: string }[];
  onUpdate: (id: string, patch: Partial<SceneAudioTrack>) => void;
  onRemove: (id: string) => void;
}

export const TrackRow: React.FC<TrackRowProps> = ({ track, scenes, onUpdate, onRemove }) => {
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
