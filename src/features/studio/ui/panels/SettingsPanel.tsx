import { ThemeSwitcher } from "@/features/theme";
import { Palette, Monitor, Volume2, Keyboard, Info, Maximize, ZoomIn, Grid3X3 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useState } from "react";
import { SHORTCUTS } from "@/shared/lib/shortcuts";
import { Label } from "@/shared/ui/label";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/shared/ui/select";

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
            <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10 space-y-3">
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
            <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10 space-y-3">
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
            <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10">
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
            <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10 space-y-3">
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
            <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10 space-y-3">
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
            <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10 space-y-2">
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
            <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10 space-y-3">
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
              <div key={category} className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10">
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
          <div className="p-3 rounded-xl bg-foreground/[0.02] border border-border/10">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">✨</span>
              <div>
                <h3 className="text-xs font-semibold">Streaming Studio</h3>
                <p className="text-[9px] text-muted-foreground/60">v1.0.0</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
