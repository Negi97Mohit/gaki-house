import React, { useState, useMemo } from "react";
import {
  Palette,
  Monitor,
  Volume2,
  Keyboard,
  Info,
  Maximize,
  ZoomIn,
  Grid3X3,
  Mic,
  Speaker,
  Sliders,
  CheckCircle2,
  Search,
  ExternalLink,
  VolumeX,
  Volume1,
} from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
import { SHORTCUTS } from "@gaki/core/lib/shortcuts";
import { Label } from "@gaki/ui/label";
import { Slider } from "@gaki/ui/slider";
import { Switch } from "@gaki/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@gaki/ui/select";
import { Input } from "@gaki/ui/input";
import { useMediaStore } from "@/stores/media.store";
import { useUiStore } from "@/stores/ui.store";
import { useThemeStore, themes } from "@/features/theme/model/theme.store";
import { ThemeSwitcher } from "@/features/theme";
import gakiLogo from "/logo_256x256.png";

type SettingsSection =
  | "appearance"
  | "display"
  | "audio"
  | "shortcuts"
  | "about";

interface SectionTab {
  id: SettingsSection;
  label: string;
  icon: React.ElementType;
}

const SECTIONS: SectionTab[] = [
  { id: "appearance", label: "Theme", icon: Palette },
  { id: "display", label: "Display", icon: Monitor },
  { id: "audio", label: "Audio", icon: Volume2 },
  { id: "shortcuts", label: "Hotkeys", icon: Keyboard },
  { id: "about", label: "About", icon: Info },
];

const SHORTCUT_CATEGORIES = {
  "System & View": ["fullscreen", "settings"],
  "AI Assistant": ["aiAssistant"],
  "Canvas & History": ["undo", "redo", "resetScene", "delete"],
  "Layer Control": [
    "bringToFront",
    "sendToBack",
    "bringForward",
    "sendBackward",
  ],
  "Media & Stream": [
    "toggleMic",
    "toggleCamera",
    "toggleBroadcast",
    "smartSwitch",
    "screenShare",
  ],
  "Scenes & Layouts": ["addScene", "toggleGridLayout"],
  "Element Creation": ["addText", "openAssetLibrary", "toggleDrawing"],
} as const;

const SHORTCUT_LABELS: Record<string, string> = {
  fullscreen: "Toggle Fullscreen",
  settings: "Open Settings",
  aiAssistant: "AI Assistant",
  undo: "Undo",
  redo: "Redo",
  resetScene: "Reset Scene",
  delete: "Delete Element",
  bringToFront: "Bring to Front",
  sendToBack: "Send to Back",
  bringForward: "Bring Forward",
  sendBackward: "Send Backward",
  toggleMic: "Toggle Microphone",
  toggleCamera: "Toggle Camera",
  toggleBroadcast: "Toggle Broadcast",
  smartSwitch: "Smart Switch",
  screenShare: "Screen Share",
  addScene: "Add Scene",
  toggleGridLayout: "Toggle Grid Layout",
  addText: "Add Text",
  openAssetLibrary: "Asset Library",
  toggleDrawing: "Toggle Drawing",
};

const ZOOM_PRESETS = [50, 75, 100, 125, 150, 200];

export function SettingsPanel() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("appearance");

  // Stores
  const { isFullscreen, setFullscreen } = useUiStore();
  const { audioDevices, selectedAudioDevice, setSelectedAudioDevice } =
    useMediaStore();
  const { theme } = useThemeStore();

  // Local state
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [snapToGrid, setSnapToGrid] = useState(false);

  const [masterVolume, setMasterVolume] = useState(80);
  const [micLevel, setMicLevel] = useState(100);
  const [selectedOutput, setSelectedOutput] = useState("default");
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);

  // Shortcuts search & category filter
  const [shortcutSearch, setShortcutSearch] = useState("");
  const [selectedShortcutCategory, setSelectedShortcutCategory] =
    useState<string>("all");

  // Filtered devices
  const micDevices = audioDevices.filter((d) => d.kind === "audioinput");
  const outputDevices = audioDevices.filter((d) => d.kind === "audiooutput");

  // Filtered shortcuts
  const filteredShortcuts = useMemo(() => {
    const query = shortcutSearch.trim().toLowerCase();
    const categoriesToSearch =
      selectedShortcutCategory === "all"
        ? Object.entries(SHORTCUT_CATEGORIES)
        : Object.entries(SHORTCUT_CATEGORIES).filter(
            ([cat]) => cat === selectedShortcutCategory,
          );

    const result: {
      category: string;
      items: { key: string; label: string; display: string }[];
    }[] = [];

    for (const [category, keys] of categoriesToSearch) {
      const matchingItems: { key: string; label: string; display: string }[] =
        [];
      for (const key of keys) {
        const shortcutInfo = SHORTCUTS[key as keyof typeof SHORTCUTS];
        const label = SHORTCUT_LABELS[key] || key;
        const display = shortcutInfo?.display || "";

        if (
          !query ||
          label.toLowerCase().includes(query) ||
          display.toLowerCase().includes(query)
        ) {
          matchingItems.push({ key, label, display });
        }
      }
      if (matchingItems.length > 0) {
        result.push({ category, items: matchingItems });
      }
    }

    return result;
  }, [shortcutSearch, selectedShortcutCategory]);

  return (
    <div className="relative flex flex-col gap-3.5 w-full antialiased">
      {/* Sub-navigation */}
      <div className="sp-tabs">
        {SECTIONS.map((sec) => {
          const Icon = sec.icon;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              data-active={activeSection === sec.id}
              className="sp-tab focus-visible:outline-none"
            >
              <Icon className="w-3.5 h-3.5 shrink-0" strokeWidth={1.6} />
              {sec.label}
            </button>
          );
        })}
      </div>

      {/* ─── 1. Appearance Section ─── */}
      {activeSection === "appearance" && (
        <div className="animate-in fade-in-50 duration-200 w-full">
          <ThemeSwitcher />
        </div>
      )}

      {/* ─── 2. Display Section ─── */}
      {activeSection === "display" && (
        <div className="animate-in fade-in-50 duration-200 space-y-3 w-full">
          {/* Zoom Control Card */}
          <div className="rounded-xl p-4 sp-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary">
                  <ZoomIn className="w-4 h-4" />
                </div>
                <div>
                  <Label className="text-[12px] font-medium text-white tracking-tight">
                    Canvas Zoom
                  </Label>
                  <p className="text-[10px] text-white/45 font-normal">
                    Scale studio workspace viewport
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-medium text-primary px-2.5 py-0.5 rounded-lg bg-primary/10 border border-primary/25">
                {zoomLevel}%
              </span>
            </div>

            <div className="pt-1">
              <Slider
                value={[zoomLevel]}
                min={50}
                max={200}
                step={5}
                onValueChange={([v]) => setZoomLevel(v)}
                className="w-full"
              />
            </div>

            <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
              {ZOOM_PRESETS.map((preset) => (
                <button
                  key={preset}
                  onClick={() => setZoomLevel(preset)}
                  className={cn(
                    "flex-1 py-1 rounded-lg text-[10px] font-mono transition-all border text-center font-medium",
                    zoomLevel === preset
                      ? "border-primary text-primary"
                      : "border-white/10 text-white/45 hover:text-white bg-white/[0.02] hover:bg-white/[0.05]",
                  )}
                >
                  {preset}%
                </button>
              ))}
            </div>
          </div>

          {/* Grid Settings & Fullscreen Card */}
          <div className="rounded-xl p-4 sp-card space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary">
                <Grid3X3 className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-[12px] font-medium text-white tracking-tight">
                  Canvas Guides & Display
                </Label>
                <p className="text-[10px] text-white/45 font-normal">
                  Snapping & fullscreen workspace
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl sp-card hover:border-white/15 transition-all">
                <div>
                  <Label className="text-[11px] font-medium text-white cursor-pointer">
                    Show Canvas Grid
                  </Label>
                  <p className="text-[9px] text-white/45">
                    Display coordinate guidelines
                  </p>
                </div>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl sp-card hover:border-white/15 transition-all">
                <div>
                  <Label className="text-[11px] font-medium text-white cursor-pointer">
                    Snap to Grid
                  </Label>
                  <p className="text-[9px] text-white/45">
                    Auto-align dragged elements
                  </p>
                </div>
                <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl sp-card hover:border-white/15 transition-all">
                <div>
                  <Label className="text-[11px] font-medium text-white cursor-pointer">
                    Fullscreen Mode
                  </Label>
                  <p className="text-[9px] text-white/45">
                    Borderless broadcast canvas
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-0.5 text-[9px] font-mono font-medium bg-white/[0.06] border border-white/15 rounded text-white">
                    F
                  </kbd>
                  <Switch
                    checked={isFullscreen}
                    onCheckedChange={setFullscreen}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 3. Audio Section ─── */}
      {activeSection === "audio" && (
        <div className="animate-in fade-in-50 duration-200 space-y-3 w-full">
          {/* Microphone Input Card */}
          <div className="rounded-xl p-4 sp-card space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary">
                <Mic className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-[12px] font-medium text-white tracking-tight">
                  Microphone Input
                </Label>
                <p className="text-[10px] text-white/45 font-normal">
                  Hardware capture device
                </p>
              </div>
            </div>

            <Select
              value={selectedAudioDevice || "default"}
              onValueChange={setSelectedAudioDevice}
            >
              <SelectTrigger className="w-full text-[11px] font-medium h-9 bg-white/[0.04] border border-white/10 hover:border-primary text-white rounded-xl px-3 transition-all">
                <SelectValue placeholder="Select microphone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" className="text-[11px]">
                  System Default Microphone
                </SelectItem>
                {micDevices.map((d) => (
                  <SelectItem
                    key={d.deviceId}
                    value={d.deviceId}
                    className="text-[11px]"
                  >
                    {d.label || `Microphone (${d.deviceId.slice(0, 8)}...)`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/65 font-medium">
                  Input Gain Level
                </span>
                <span className="font-mono text-primary font-medium text-[11px]">
                  {micLevel}%
                </span>
              </div>
              <Slider
                value={[micLevel]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => setMicLevel(v)}
              />
            </div>
          </div>

          {/* Audio Output Card */}
          <div className="rounded-xl p-4 sp-card space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary">
                <Speaker className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-[12px] font-medium text-white tracking-tight">
                  Playback Monitor
                </Label>
                <p className="text-[10px] text-white/45 font-normal">
                  Monitoring destination
                </p>
              </div>
            </div>

            <Select value={selectedOutput} onValueChange={setSelectedOutput}>
              <SelectTrigger className="w-full text-[11px] font-medium h-9 bg-white/[0.04] border border-white/10 hover:border-primary text-white rounded-xl px-3 transition-all">
                <SelectValue placeholder="Select monitor output" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default" className="text-[11px]">
                  System Default Output
                </SelectItem>
                {outputDevices.map((d) => (
                  <SelectItem
                    key={d.deviceId}
                    value={d.deviceId}
                    className="text-[11px]"
                  >
                    {d.label || `Output (${d.deviceId.slice(0, 8)}...)`}
                  </SelectItem>
                ))}
                {outputDevices.length === 0 && (
                  <>
                    <SelectItem value="speakers" className="text-[11px]">
                      Speakers
                    </SelectItem>
                    <SelectItem value="headphones" className="text-[11px]">
                      Headphones
                    </SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-white/65 font-medium flex items-center gap-1.5">
                  {masterVolume === 0 ? (
                    <VolumeX className="w-3.5 h-3.5 text-white/45" />
                  ) : (
                    <Volume1 className="w-3.5 h-3.5 text-primary" />
                  )}
                  Master Volume
                </span>
                <span className="font-mono text-primary font-medium text-[11px]">
                  {masterVolume}%
                </span>
              </div>
              <Slider
                value={[masterVolume]}
                min={0}
                max={100}
                step={5}
                onValueChange={([v]) => setMasterVolume(v)}
              />
            </div>
          </div>

          {/* Audio Processing (DSP Filters) */}
          <div className="rounded-xl p-4 sp-card space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-primary">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <Label className="text-[12px] font-medium text-white tracking-tight">
                  Audio Processing (DSP)
                </Label>
                <p className="text-[10px] text-white/45 font-normal">
                  Acoustic noise suppression & echo gating
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between p-2.5 rounded-xl sp-card hover:border-white/15 transition-all">
                <div>
                  <Label className="text-[11px] font-medium text-white cursor-pointer">
                    Noise Suppression
                  </Label>
                  <p className="text-[9px] text-white/45">
                    Eliminates room & fan hiss
                  </p>
                </div>
                <Switch
                  checked={noiseSuppression}
                  onCheckedChange={setNoiseSuppression}
                />
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl sp-card hover:border-white/15 transition-all">
                <div>
                  <Label className="text-[11px] font-medium text-white cursor-pointer">
                    Echo Cancellation
                  </Label>
                  <p className="text-[9px] text-white/45">
                    Prevents acoustic loopback
                  </p>
                </div>
                <Switch
                  checked={echoCancellation}
                  onCheckedChange={setEchoCancellation}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 4. Shortcuts Section ─── */}
      {activeSection === "shortcuts" && (
        <div className="animate-in fade-in-50 duration-200 space-y-3 w-full">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
            <Input
              placeholder="Search hotkeys (e.g. mic, mute, zoom, undo)..."
              value={shortcutSearch}
              onChange={(e) => setShortcutSearch(e.target.value)}
              className="h-9 pl-9 text-[11px] font-medium bg-white/[0.04] border-white/10 text-white placeholder:text-white/35 rounded-xl focus-visible:ring-primary"
            />
          </div>

          <div className="-mx-1 flex items-center gap-0.5 overflow-x-auto pb-1.5">
            {["all", ...Object.keys(SHORTCUT_CATEGORIES)].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedShortcutCategory(cat)}
                data-active={selectedShortcutCategory === cat}
                className="sp-chip capitalize"
              >
                {cat}
              </button>
            ))}
          </div>

          {filteredShortcuts.length === 0 ? (
            <div className="p-8 text-center rounded-xl bg-white/[0.02] border border-white/10">
              <p className="text-[12px] font-medium text-white/45">
                No matching shortcuts found.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredShortcuts.map(({ category, items }) => (
                <div
                  key={category}
                  className="rounded-xl p-3.5 sp-card space-y-2"
                >
                  <h4 className="text-[10px] font-medium uppercase tracking-wider text-white/45 px-1">
                    {category}
                  </h4>

                  <div className="space-y-1">
                    {items.map(({ key, label, display }) => {
                      const keys = display.split("+");
                      return (
                        <div
                          key={key}
                          className="flex items-center justify-between py-1.5 px-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
                        >
                          <span className="text-[11px] text-white font-medium">
                            {label}
                          </span>
                          <div className="flex items-center gap-1">
                            {keys.map((k, i) => (
                              <kbd
                                key={i}
                                className="inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 bg-white/[0.06] border border-white/15 rounded text-[9px] font-mono font-medium text-white "
                              >
                                {k}
                              </kbd>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── 5. About Section ─── */}
      {activeSection === "about" && (
        <div className="animate-in fade-in-50 duration-200 space-y-3 w-full">
          <div className="rounded-xl p-5 sp-card flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <img
                src={gakiLogo}
                alt="GAKI Studio"
                className="w-16 h-16 rounded-xl border-2 border-white/20"
              />
              <span className="absolute -bottom-1 -right-1 px-2 py-0.5 text-[9px] font-mono font-medium bg-primary text-primary-foreground rounded-full ">
                v1.0
              </span>
            </div>

            <div>
              <h3 className="text-base font-medium text-white tracking-tight">
                GAKI Studio
              </h3>
              <p className="text-[11px] text-white/65 font-medium mt-0.5">
                House of Video Creation
              </p>
            </div>

            <p className="text-[11px] text-white/65 font-normal leading-relaxed max-w-[280px]">
              A free, high-performance browser streaming and recording mixer
              powered by WebRTC & WebCodecs.
            </p>

            <div className="pt-3 border-t border-white/10 w-full flex items-center justify-between text-left">
              <div>
                <span className="text-[9px] text-white/45 font-normal block">
                  Creator
                </span>
                <span className="text-[11px] font-medium text-white">
                  Creator Enji
                </span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.linkedin.com/in/mohit-singh-negi/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[10px] font-medium text-white transition-all flex items-center gap-1.5"
                >
                  LinkedIn <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
                <a
                  href="https://github.com/Negi97Mohit"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-[10px] font-medium text-white transition-all flex items-center gap-1.5"
                >
                  GitHub <ExternalLink className="w-3 h-3 opacity-80" />
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl p-4 sp-card space-y-2.5">
            <h4 className="text-[11px] font-medium uppercase tracking-wider text-white/45">
              Studio Architecture
            </h4>

            <div className="space-y-2 text-[11px]">
              {[
                "Multiplatform streaming (YouTube, Twitch, Kick)",
                "Hardware-accelerated WebGL kernel compositor",
                "Ultra low-latency WebRTC broadcast pipeline",
                "Cross-device mobile camera & deck handoff",
              ].map((feat, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 text-white/80 font-medium"
                >
                  <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                  <span className="leading-snug">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
