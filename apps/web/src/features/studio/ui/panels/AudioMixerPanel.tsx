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

import { MixerSection, FaderStrip, OutputSoundTest, InputSoundTest } from "./audio-mixer/MixerControls";
import { TrackRow } from "./audio-mixer/TrackRow";

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
