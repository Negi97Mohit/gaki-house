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
  Repeat,
  Link,
  Upload,
  Music,
  Tag,
  Check,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { Slider } from "@/shared/ui/slider";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { useMediaStore } from "@/stores/media.store";
import { useSceneAudioStore } from "@/stores/sceneAudio.store";
import { SceneAudioTrack } from "@/types/caption";

/* ─── Fader Strip (for mic/master) ─── */
interface FaderStripProps {
  label: string;
  icon: React.ReactNode;
  volume: number;
  isMuted: boolean;
  onVolumeChange: (v: number) => void;
  onMuteToggle: () => void;
  isActive?: boolean;
}

const FaderStrip: React.FC<FaderStripProps> = ({
  label,
  icon,
  volume,
  isMuted,
  onVolumeChange,
  onMuteToggle,
  isActive = true,
}) => (
  <div
    className={cn(
      "p-3 rounded-xl bg-foreground/[0.02] border border-border/10 space-y-2",
      !isActive && "opacity-50"
    )}
  >
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground">{icon}</span>
      <span className="text-[11px] font-medium truncate flex-1">{label}</span>
      <button
        onClick={onMuteToggle}
        className={cn(
          "p-1 rounded-lg transition-colors",
          isMuted
            ? "text-destructive bg-destructive/10"
            : "text-muted-foreground hover:bg-foreground/5"
        )}
        title={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          <VolumeX className="w-3.5 h-3.5" />
        ) : (
          <Volume2 className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
    <div className="flex items-center gap-2">
      <Slider
        value={[isMuted ? 0 : volume]}
        onValueChange={([v]) => onVolumeChange(v)}
        min={0}
        max={100}
        step={1}
        className="flex-1"
        disabled={!isActive}
      />
      <span className="text-[9px] text-muted-foreground w-7 text-right tabular-nums">
        {isMuted ? "0" : volume}%
      </span>
    </div>
  </div>
);

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
          "flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] transition-colors",
          track.assignedSceneIds.length === 0
            ? "text-muted-foreground/60 hover:bg-foreground/5"
            : "text-primary bg-primary/10"
        )}
        title="Assign to scenes"
      >
        <Tag className="w-2.5 h-2.5" />
        {track.assignedSceneIds.length === 0
          ? "All scenes"
          : `${track.assignedSceneIds.length} scene${track.assignedSceneIds.length > 1 ? "s" : ""}`}
      </button>
    );
  }

  return (
    <div className="p-2 rounded-lg bg-foreground/[0.03] border border-border/10 space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider">
          Assign to Scenes
        </span>
        <button
          onClick={() => setOpen(false)}
          className="text-[9px] text-primary hover:underline"
        >
          Done
        </button>
      </div>
      <button
        onClick={assignAll}
        className={cn(
          "w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] transition-colors text-left",
          track.assignedSceneIds.length === 0
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-foreground/5"
        )}
      >
        {track.assignedSceneIds.length === 0 && <Check className="w-2.5 h-2.5" />}
        <span>All scenes</span>
      </button>
      {scenes.map((scene) => {
        const isAssigned =
          track.assignedSceneIds.length === 0 || track.assignedSceneIds.includes(scene.id);
        const isExplicit = track.assignedSceneIds.includes(scene.id);
        return (
          <button
            key={scene.id}
            onClick={() => {
              // If currently "all scenes", switch to explicit mode with all except this one toggled
              if (track.assignedSceneIds.length === 0) {
                // Switch to explicit: assign only this scene
                onUpdate(track.id, { assignedSceneIds: [scene.id] });
              } else {
                toggleScene(scene.id);
              }
            }}
            className={cn(
              "w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-[9px] transition-colors text-left",
              isExplicit
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-foreground/5"
            )}
          >
            {isExplicit && <Check className="w-2.5 h-2.5" />}
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

    // Restore position
    if (track.currentTime > 0) {
      el.currentTime = track.currentTime;
    }
    el.src = track.sourceUrl;
    audioRef.current = el;

    // Auto-resume if track was playing before remount (e.g. scene switch)
    if (track.isPlaying) {
      el.addEventListener("canplaythrough", function autoResume() {
        el.removeEventListener("canplaythrough", autoResume);
        el.volume = track.isMuted ? 0 : track.volume / 100;
        el.loop = track.isLooping;
        if (track.currentTime > 0) el.currentTime = track.currentTime;
        el.play().catch(() => {});
      }, { once: true });
    }

    // Start time tracking
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
      // Save position before cleanup
      if (el.currentTime > 0) {
        onUpdate(track.id, { currentTime: el.currentTime, isPlaying: false });
      }
      el.removeAttribute("src");
      el.load();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track.sourceUrl]);

  // Sync volume/mute/loop
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = track.isMuted ? 0 : track.volume / 100;
      audioRef.current.loop = track.isLooping;
    }
  }, [track.volume, track.isMuted, track.isLooping]);

  // Sync play state from store (for scene switching resume)
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

  const seekPercent =
    track.duration > 0 ? (track.currentTime / track.duration) * 100 : 0;

  return (
    <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10 space-y-2">
      {/* Header row */}
      <div className="flex items-center gap-2">
        <Music className={cn("w-3.5 h-3.5", error ? "text-destructive/60" : "text-primary/60")} />
        <span className="text-[10px] font-medium truncate flex-1" title={error || track.name}>
          {error || track.name}
        </span>
        <button
          onClick={togglePlay}
          className="p-1 rounded-lg hover:bg-foreground/5 text-muted-foreground"
          title={track.isPlaying ? "Pause" : "Play"}
        >
          {track.isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
        </button>
        <button
          onClick={() => onUpdate(track.id, { isLooping: !track.isLooping })}
          className={cn(
            "p-1 rounded-lg transition-colors",
            track.isLooping
              ? "text-primary bg-primary/10"
              : "text-muted-foreground hover:bg-foreground/5"
          )}
          title="Loop"
        >
          <Repeat className="w-3 h-3" />
        </button>
        <button
          onClick={() => onUpdate(track.id, { isMuted: !track.isMuted })}
          className={cn(
            "p-1 rounded-lg transition-colors",
            track.isMuted
              ? "text-destructive bg-destructive/10"
              : "text-muted-foreground hover:bg-foreground/5"
          )}
          title={track.isMuted ? "Unmute" : "Mute"}
        >
          {track.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
        </button>
        <button
          onClick={() => {
            audioRef.current?.pause();
            onRemove(track.id);
          }}
          className="p-1 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
          title="Remove"
        >
          <Trash2 className="w-3 h-3" />
        </button>
      </div>

      {/* Loading progress */}
      {isLoading && (
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary/60 transition-all duration-300 rounded-full"
              style={{ width: `${loadProgress}%` }}
            />
          </div>
          <span className="text-[9px] text-muted-foreground w-7 text-right tabular-nums">
            {loadProgress}%
          </span>
        </div>
      )}

      {/* Seek slider */}
      {track.duration > 0 && (
        <div className="flex items-center gap-2">
          <span className="text-[8px] text-muted-foreground tabular-nums w-8 text-right">
            {formatTime(track.currentTime)}
          </span>
          <Slider
            value={[seekPercent]}
            onValueChange={handleSeek}
            min={0}
            max={100}
            step={0.1}
            className="flex-1"
          />
          <span className="text-[8px] text-muted-foreground tabular-nums w-8">
            {formatTime(track.duration)}
          </span>
        </div>
      )}

      {/* Volume slider */}
      <div className="flex items-center gap-2">
        <Slider
          value={[track.isMuted ? 0 : track.volume]}
          onValueChange={([v]) => onUpdate(track.id, { volume: v })}
          min={0}
          max={100}
          step={1}
          className="flex-1"
        />
        <span className="text-[9px] text-muted-foreground w-7 text-right tabular-nums">
          {track.isMuted ? "0" : track.volume}%
        </span>
      </div>

      {/* Scene assignment */}
      {scenes.length > 1 && (
        <SceneAssignment track={track} scenes={scenes} onUpdate={onUpdate} />
      )}
    </div>
  );
};

/* ─── Main Panel ─── */
export function AudioMixerPanel() {
  const audioDevices = useMediaStore((s) => s.audioDevices);
  const isAudioOn = useMediaStore((s) => s.isAudioOn);

  // Scene audio store
  const activeSceneId = useSceneAudioStore((s) => s.activeSceneId);
  const scenes = useSceneAudioStore((s) => s.scenes);
  const allTracks = useSceneAudioStore((s) => s.tracks);
  const addTrack = useSceneAudioStore((s) => s.addTrack);
  const updateTrack = useSceneAudioStore((s) => s.updateTrack);
  const removeTrack = useSceneAudioStore((s) => s.removeTrack);

  // Filter tracks for current scene
  const sceneTracks = allTracks.filter(
    (t) => t.assignedSceneIds.length === 0 || t.assignedSceneIds.includes(activeSceneId)
  );

  // Per-device volumes (local state)
  const [deviceVolumes, setDeviceVolumes] = useState<
    Record<string, { volume: number; muted: boolean }>
  >({});

  // Master output volume
  const [masterVolume, setMasterVolume] = useState(80);
  const [masterMuted, setMasterMuted] = useState(false);

  // Add track dialog
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
    };
    addTrack(track);
    setUrlInput("");
    setShowAddTrack(false);
  };

  return (
    <div className="space-y-4">
      {/* Master Output */}
      <FaderStrip
        label="Master Output"
        icon={<Speaker className="w-3.5 h-3.5" />}
        volume={masterVolume}
        isMuted={masterMuted}
        onVolumeChange={setMasterVolume}
        onMuteToggle={() => setMasterMuted(!masterMuted)}
      />

      {/* Input Devices */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 px-1">
          <Mic className="w-3 h-3 text-muted-foreground" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            Input Sources
          </span>
        </div>
        {audioDevices.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50 px-1">
            No input devices found
          </p>
        ) : (
          audioDevices.map((device) => {
            const dv = getDeviceVolume(device.deviceId);
            return (
              <FaderStrip
                key={device.deviceId}
                label={device.label || `Mic ${device.deviceId.slice(0, 6)}`}
                icon={<Mic className="w-3.5 h-3.5" />}
                volume={dv.volume}
                isMuted={dv.muted}
                onVolumeChange={(v) => updateDeviceVolume(device.deviceId, v)}
                onMuteToggle={() => toggleDeviceMute(device.deviceId)}
                isActive={isAudioOn}
              />
            );
          })
        )}
      </div>

      {/* Scene Audio Tracks */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Music className="w-3 h-3 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
              Scene Audio
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[10px]"
            onClick={() => setShowAddTrack(!showAddTrack)}
          >
            <Plus className="w-3 h-3 mr-1" />
            Add
          </Button>
        </div>

        {/* Add Track Panel */}
        {showAddTrack && (
          <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 space-y-3">
            <div className="flex gap-1">
              <button
                onClick={() => setAddMode("file")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                  addMode === "file"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-foreground/5"
                )}
              >
                <Upload className="w-3 h-3" />
                Upload File
              </button>
              <button
                onClick={() => setAddMode("url")}
                className={cn(
                  "flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                  addMode === "url"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-foreground/5"
                )}
              >
                <Link className="w-3 h-3" />
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
                  className="w-full h-8 text-[10px]"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-3 h-3 mr-1.5" />
                  Choose Audio Files
                </Button>
              </>
            ) : (
              <div className="space-y-1.5">
                <div className="flex gap-1.5">
                  <Input
                    value={urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      setUrlError(null);
                    }}
                    placeholder="https://example.com/audio.mp3"
                    className={cn("h-7 text-[10px] flex-1", urlError && "border-destructive")}
                    onKeyDown={(e) => e.key === "Enter" && handleAddUrl()}
                  />
                  <Button
                    variant="default"
                    size="sm"
                    className="h-7 px-3 text-[10px]"
                    onClick={handleAddUrl}
                    disabled={!urlInput.trim()}
                  >
                    Add
                  </Button>
                </div>
                {urlError && (
                  <p className="text-[9px] text-destructive px-1">{urlError}</p>
                )}
              </div>
            )}
          </div>
        )}

        {sceneTracks.length === 0 && !showAddTrack ? (
          <p className="text-[10px] text-muted-foreground/50 px-1">
            No audio tracks added to this scene
          </p>
        ) : (
          sceneTracks.map((track) => (
            <TrackRow
              key={track.id}
              track={track}
              scenes={scenes}
              onUpdate={updateTrack}
              onRemove={removeTrack}
            />
          ))
        )}
      </div>
    </div>
  );
}
