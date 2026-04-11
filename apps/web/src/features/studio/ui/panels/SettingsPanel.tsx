import { ThemeSwitcher } from "@/features/theme";
import { Palette, Monitor, Volume2, Keyboard, Info, Maximize, ZoomIn, Grid3X3 } from "lucide-react";
import { cn } from "@caption-cam/core/lib/utils";
import { useState } from "react";
import { SHORTCUTS } from "@caption-cam/core/lib/shortcuts";
import { Label } from "@caption-cam/ui/label";
import { Slider } from "@caption-cam/ui/slider";
import { Switch } from "@caption-cam/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@caption-cam/ui/select";
import gakiLogo from "/logo_256x256.png";

type SettingsSection = "appearance" | "display" | "audio" | "shortcuts" | "about";

const sections: { id: SettingsSection; label: string; icon: React.ElementType }[] = [
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "display", label: "Display", icon: Monitor },
  { id: "audio", label: "Audio", icon: Volume2 },
  { id: "shortcuts", label: "Shortcuts", icon: Keyboard },
  { id: "about", label: "About", icon: Info },
];

// Organize shortcuts by category
const shortcutCategories = {
  "System & View": ["fullscreen", "settings"],
  "AI Assistant": ["aiAssistant"],
  "Canvas & History": ["undo", "redo", "resetScene", "delete"],
  "Layer Control": ["bringToFront", "sendToBack", "bringForward", "sendBackward"],
  "Media & Stream": ["toggleMic", "toggleCamera", "toggleBroadcast", "smartSwitch", "screenShare"],
  "Scenes & Layouts": ["addScene", "toggleGridLayout"],
  "Element Creation": ["addText", "openAssetLibrary", "toggleDrawing"],
} as const;

const shortcutLabels: Record<string, string> = {
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

export function SettingsPanel() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("appearance");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [showGrid, setShowGrid] = useState(true);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [masterVolume, setMasterVolume] = useState(80);
  const [micVolume, setMicVolume] = useState(100);
  const [audioOutput, setAudioOutput] = useState("default");
  const [audioInput, setAudioInput] = useState("default");
  const [noiseSuppression, setNoiseSuppression] = useState(true);
  const [echoCancellation, setEchoCancellation] = useState(true);

  return (
    <div className="flex flex-col h-full -m-4">
      {/* Section Navigation - Compact */}
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-border/10" style={{ scrollbarWidth: 'none' }}>
        {sections.map((section) => {
          const Icon = section.icon;
          const isActive = activeSection === section.id;
          return (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium transition-all whitespace-nowrap",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground/70 hover:text-foreground hover:bg-foreground/5"
              )}
            >
              <Icon className="w-3 h-3" />
              {section.label}
            </button>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3" style={{ scrollbarWidth: 'none' }}>
        {activeSection === "appearance" && <ThemeSwitcher />}

        {activeSection === "display" && (
          <div className="space-y-4">
            {/* Zoom Level */}
            <div className="p-3 rounded-xl bg-transparent border border-border/10 space-y-3">
              <div className="flex items-center gap-2">
                <ZoomIn className="w-3.5 h-3.5 text-muted-foreground" />
                <Label className="text-[11px] font-medium">Zoom Level</Label>
                <span className="ml-auto text-[10px] text-muted-foreground">{zoomLevel}%</span>
              </div>
              <Slider
                value={[zoomLevel]}
                onValueChange={([v]) => setZoomLevel(v)}
                min={50}
                max={200}
                step={10}
                className="w-full"
              />
            </div>

            {/* Grid Settings */}
            <div className="p-3 rounded-xl bg-transparent border border-border/10 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Grid3X3 className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium">Grid Settings</span>
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Show Grid</Label>
                <Switch checked={showGrid} onCheckedChange={setShowGrid} className="scale-75" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Snap to Grid</Label>
                <Switch checked={snapToGrid} onCheckedChange={setSnapToGrid} className="scale-75" />
              </div>
            </div>

            {/* Fullscreen */}
            <div className="p-3 rounded-xl bg-transparent border border-border/10">
              <div className="flex items-center gap-2">
                <Maximize className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[11px] font-medium">Fullscreen Mode</span>
                <kbd className="ml-auto px-1.5 py-0.5 text-[9px] font-mono bg-muted/50 border border-border/30 rounded text-muted-foreground">
                  F
                </kbd>
              </div>
            </div>
          </div>
        )}

        {activeSection === "audio" && (
          <div className="space-y-4">
            {/* Master Volume */}
            <div className="p-3 rounded-xl bg-transparent border border-border/10 space-y-3">
              <div className="flex items-center gap-2">
                <Volume2 className="w-3.5 h-3.5 text-muted-foreground" />
                <Label className="text-[11px] font-medium">Master Volume</Label>
                <span className="ml-auto text-[10px] text-muted-foreground">{masterVolume}%</span>
              </div>
              <Slider
                value={[masterVolume]}
                onValueChange={([v]) => setMasterVolume(v)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Microphone */}
            <div className="p-3 rounded-xl bg-transparent border border-border/10 space-y-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-medium">Microphone</span>
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] text-muted-foreground">Input Device</Label>
                <Select value={audioInput} onValueChange={setAudioInput}>
                  <SelectTrigger className="h-7 text-[10px]">
                    <SelectValue placeholder="Select microphone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default" className="text-[10px]">System Default</SelectItem>
                    <SelectItem value="builtin" className="text-[10px]">Built-in Microphone</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-[10px] text-muted-foreground">Level</Label>
                <span className="ml-auto text-[10px] text-muted-foreground">{micVolume}%</span>
              </div>
              <Slider
                value={[micVolume]}
                onValueChange={([v]) => setMicVolume(v)}
                min={0}
                max={100}
                step={5}
                className="w-full"
              />
            </div>

            {/* Output */}
            <div className="p-3 rounded-xl bg-transparent border border-border/10 space-y-2">
              <Label className="text-[10px] text-muted-foreground">Output Device</Label>
              <Select value={audioOutput} onValueChange={setAudioOutput}>
                <SelectTrigger className="h-7 text-[10px]">
                  <SelectValue placeholder="Select output" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default" className="text-[10px]">System Default</SelectItem>
                  <SelectItem value="speakers" className="text-[10px]">Speakers</SelectItem>
                  <SelectItem value="headphones" className="text-[10px]">Headphones</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Audio Processing */}
            <div className="p-3 rounded-xl bg-transparent border border-border/10 space-y-3">
              <span className="text-[11px] font-medium">Audio Processing</span>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Noise Suppression</Label>
                <Switch checked={noiseSuppression} onCheckedChange={setNoiseSuppression} className="scale-75" />
              </div>
              <div className="flex items-center justify-between">
                <Label className="text-[10px] text-muted-foreground">Echo Cancellation</Label>
                <Switch checked={echoCancellation} onCheckedChange={setEchoCancellation} className="scale-75" />
              </div>
            </div>
          </div>
        )}

        {activeSection === "shortcuts" && (
          <div className="space-y-3">
            {Object.entries(shortcutCategories).map(([category, keys]) => (
              <div key={category} className="p-3 rounded-xl bg-transparent border border-border/10">
                <h4 className="text-[10px] font-semibold text-muted-foreground mb-2">{category}</h4>
                <div className="space-y-1.5">
                  {keys.map((key) => {
                    const shortcut = SHORTCUTS[key as keyof typeof SHORTCUTS];
                    if (!shortcut) return null;
                    return (
                      <div key={key} className="flex items-center justify-between py-1">
                        <span className="text-[10px] text-foreground/80">{shortcutLabels[key] || key}</span>
                        <kbd className="inline-flex items-center justify-center min-w-[24px] h-5 px-1.5 bg-muted/60 border border-border/40 rounded text-[9px] font-mono font-medium text-muted-foreground">
                          {shortcut.display}
                        </kbd>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeSection === "about" && (
          <div className="space-y-3">
            {/* Logo & Title */}
            <div className="p-4 rounded-xl bg-transparent border border-border/10">
              <div className="flex items-center gap-3 mb-3">
                <img src={gakiLogo} alt="GAKI Logo" className="w-10 h-10 rounded-lg" />
                <div>
                  <h3 className="text-sm font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">GAKI</h3>
                  <p className="text-[10px] text-muted-foreground">House of Video Creation</p>
                </div>
                <span className="ml-auto px-2 py-0.5 text-[9px] font-medium bg-primary/10 text-primary rounded-full">v1.0.0</span>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                A <span className="text-primary font-medium">free multiplatform streaming app</span>. One click and go live everywhere you want,
                with professional stream and video setups.
              </p>
            </div>

            {/* Features */}
            <div className="p-3 rounded-xl bg-transparent border border-border/10">
              <h4 className="text-[10px] font-semibold text-muted-foreground mb-2">Features</h4>
              <ul className="space-y-1.5">
                <li className="flex items-center gap-2 text-[10px] text-foreground/80">
                  <span className="text-primary">✓</span> Multiplatform streaming - go live everywhere
                </li>
                <li className="flex items-center gap-2 text-[10px] text-foreground/80">
                  <span className="text-primary">✓</span> Professional stream & video setups
                </li>
                <li className="flex items-center gap-2 text-[10px] text-foreground/80">
                  <span className="text-primary">✓</span> One-click broadcast
                </li>
                <li className="flex items-center gap-2 text-[10px] text-foreground/80">
                  <span className="text-primary">✓</span> AI-powered features
                </li>
              </ul>
            </div>

            {/* Creator */}
            <div className="p-3 rounded-xl bg-transparent border border-border/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-muted-foreground">Created with love ❤️❤️❤️ by</span>
                  <span className="text-[11px] font-semibold text-foreground">Creator Enji</span>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href="https://www.linkedin.com/in/mohit-singh-negi/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-foreground/5 hover:bg-primary/20 transition-colors group"
                    title="LinkedIn"
                  >
                    <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                  <a
                    href="https://github.com/Negi97Mohit"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-1.5 rounded-lg bg-foreground/5 hover:bg-primary/20 transition-colors group"
                    title="GitHub"
                  >
                    <svg className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
