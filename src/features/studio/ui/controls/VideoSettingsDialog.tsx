import React, { useEffect, useRef, useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Check, Webcam, Sparkles, Sun, Zap, Wand2, Clapperboard, X, Search } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useMediaStore } from "@/stores/media.store";
import { useSceneStore } from "@/stores/scene.store";
import { useShallow } from "zustand/react/shallow";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import { useFilters } from "@/hooks/useFilters";
import { useWebGLRenderLoop } from "@/features/canvas/hooks/useWebGLRenderLoop";
import { INTERACTIVE_FILTER_PRESETS } from "@/lib/interactiveFilters";
import {
  CinematicEffect,
  CINEMATIC_PRESETS,
  CINEMATIC_CATEGORIES,
} from "@/features/stream/ui/pip/cinematicShotData";
import { CinematicOverlay } from "@/features/stream/ui/CinematicOverlay";
import { getCinematicCanvasStyles } from "@/features/stream/ui/pip/cinematicCanvasStyles";

// A reliable sample image for filter thumbnails
const FILTER_SAMPLE_IMG = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=200&h=150&fit=crop&q=60";

interface VideoSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const VideoSettingsDialog: React.FC<VideoSettingsDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { videoDevices, selectedVideoDevice, setSelectedVideoDevice } = useMediaStore(
    useShallow((s) => ({
      videoDevices: s.videoDevices,
      selectedVideoDevice: s.selectedVideoDevice,
      setSelectedVideoDevice: s.setSelectedVideoDevice,
    }))
  );

  const {
    pipBorder, setPipBorder,
    pipShadow, setPipShadow,
    isAutoFramingEnabled, setIsAutoFramingEnabled,
    isBeautifyEnabled, setIsBeautifyEnabled,
    isLowLightEnabled, setIsLowLightEnabled,
    isNeonEdgeEnabled, setIsNeonEdgeEnabled,
    neonIntensity, setNeonIntensity,
    neonEdgeColor, setNeonEdgeColor,
    zoomSensitivity, setZoomSensitivity,
    trackingSpeed, setTrackingSpeed,
    videoFilter, setVideoFilter,
    activeInteractiveFilter, setActiveInteractiveFilter,
    activeCinematicEffect, setActiveCinematicEffect,
  } = useSceneStore(
    useShallow((s) => ({
      pipBorder: s.pipBorder,
      setPipBorder: s.setPipBorder,
      pipShadow: s.pipShadow,
      setPipShadow: s.setPipShadow,
      isAutoFramingEnabled: s.isAutoFramingEnabled,
      setIsAutoFramingEnabled: s.setIsAutoFramingEnabled,
      isBeautifyEnabled: s.isBeautifyEnabled,
      setIsBeautifyEnabled: s.setIsBeautifyEnabled,
      isLowLightEnabled: s.isLowLightEnabled,
      setIsLowLightEnabled: s.setIsLowLightEnabled,
      isNeonEdgeEnabled: s.isNeonEdgeEnabled,
      setIsNeonEdgeEnabled: s.setIsNeonEdgeEnabled,
      neonIntensity: s.neonIntensity,
      setNeonIntensity: s.setNeonIntensity,
      neonEdgeColor: s.neonColor,
      setNeonEdgeColor: s.setNeonColor,
      zoomSensitivity: s.zoomSensitivity,
      setZoomSensitivity: s.setZoomSensitivity,
      trackingSpeed: s.trackingSpeed,
      setTrackingSpeed: s.setTrackingSpeed,
      videoFilter: s.videoFilter,
      setVideoFilter: s.setVideoFilter,
      activeInteractiveFilter: s.activeInteractiveFilter,
      setActiveInteractiveFilter: s.setActiveInteractiveFilter,
      activeCinematicEffect: s.activeCinematicEffect,
      setActiveCinematicEffect: s.setActiveCinematicEffect,
    }))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl w-[95vw] max-h-[88vh] overflow-hidden bg-background/95 backdrop-blur-2xl border border-border/20 dark:border-white/10 rounded-2xl shadow-2xl p-0">
        <div className="px-5 pt-5 pb-2">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold tracking-tight">Video Settings</DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 overflow-hidden flex-1 px-5 pb-5">
          {/* Live Preview */}
          <div className="shrink-0 sm:w-[260px] w-full space-y-3">
            <CameraPreview
              deviceId={selectedVideoDevice}
              open={open}
              pipBorder={pipBorder}
              pipShadow={pipShadow}
              videoFilter={videoFilter}
              isBeautifyEnabled={isBeautifyEnabled}
              isLowLightEnabled={isLowLightEnabled}
              activeCinematicEffect={activeCinematicEffect}
            />
            {/* Camera selector */}
            <div className="space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Camera</Label>
              <div className="space-y-0.5 max-h-20 overflow-y-auto">
                {videoDevices.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground py-1">No cameras found</p>
                ) : (
                  videoDevices.map((device, i) => (
                    <button
                      key={device.deviceId}
                      onClick={() => setSelectedVideoDevice(device.deviceId)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] transition-all",
                        device.deviceId === selectedVideoDevice
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/60 text-foreground/80"
                      )}
                    >
                      <Webcam className="w-3 h-3 shrink-0 opacity-60" />
                      <span className="truncate">{device.label || `Camera ${i + 1}`}</span>
                      {device.deviceId === selectedVideoDevice && (
                        <Check className="w-3 h-3 ml-auto shrink-0 text-primary" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tabbed Settings */}
          <div className="flex-1 min-w-0 overflow-hidden mt-3 sm:mt-0">
            <Tabs defaultValue="enhance" className="flex flex-col h-full">
              <TabsList className="w-full grid grid-cols-3 h-8 bg-muted/30 rounded-lg mb-3 shrink-0">
                <TabsTrigger value="enhance" className="text-[10px] font-semibold gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md">
                  <Sparkles className="w-3 h-3" /> Enhance
                </TabsTrigger>
                <TabsTrigger value="effects" className="text-[10px] font-semibold gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md">
                  <Wand2 className="w-3 h-3" /> Effects
                </TabsTrigger>
                <TabsTrigger value="cinematic" className="text-[10px] font-semibold gap-1 data-[state=active]:bg-background data-[state=active]:shadow-sm rounded-md">
                  <Clapperboard className="w-3 h-3" /> Cinematic
                </TabsTrigger>
              </TabsList>

              {/* ─── Enhance Tab ─── */}
              <TabsContent value="enhance" className="overflow-y-auto max-h-[55vh] sm:max-h-[60vh] space-y-3 pr-1 mt-0">
                <SettingsCard title="PiP Style">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-muted-foreground">Border</Label>
                        <Input type="color" value={pipBorder.color} onChange={(e) => setPipBorder({ ...pipBorder, color: e.target.value })} className="h-5 w-6 p-0 rounded border-border/30 cursor-pointer" />
                      </div>
                      <Slider value={[pipBorder.width]} min={0} max={10} step={1} onValueChange={([v]) => setPipBorder({ ...pipBorder, width: v })} />
                      <span className="text-[9px] text-muted-foreground tabular-nums">{pipBorder.width}px</span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-[10px] text-muted-foreground">Shadow</Label>
                        <Input type="color" value={pipShadow.color.startsWith("rgba") ? "#000000" : pipShadow.color} onChange={(e) => setPipShadow({ ...pipShadow, color: e.target.value })} className="h-5 w-6 p-0 rounded border-border/30 cursor-pointer" />
                      </div>
                      <Slider value={[pipShadow.blur]} min={0} max={40} step={1} onValueChange={([v]) => setPipShadow({ ...pipShadow, blur: v })} />
                      <span className="text-[9px] text-muted-foreground tabular-nums">{pipShadow.blur}px blur</span>
                    </div>
                  </div>
                </SettingsCard>

                <SettingsCard title="Enhancements">
                  <div className="space-y-3">
                    <ToggleRow icon={<Sparkles className="w-3 h-3" />} label="Auto Framing" checked={isAutoFramingEnabled} onChange={setIsAutoFramingEnabled} />
                    {isAutoFramingEnabled && (
                      <div className="pl-5 space-y-2 border-l-2 border-primary/20 ml-1.5">
                        <CompactSlider label="Zoom" value={zoomSensitivity} min={0} max={100} onChange={setZoomSensitivity} />
                        <CompactSlider label="Speed" value={trackingSpeed} min={0} max={100} onChange={setTrackingSpeed} />
                      </div>
                    )}
                    <ToggleRow icon={<Sparkles className="w-3 h-3" />} label="Beautify" checked={isBeautifyEnabled} onChange={setIsBeautifyEnabled} />
                    <ToggleRow icon={<Sun className="w-3 h-3" />} label="Low Light Boost" checked={isLowLightEnabled} onChange={setIsLowLightEnabled} />
                    <ToggleRow icon={<Zap className="w-3 h-3" />} label="Neon Edge" checked={isNeonEdgeEnabled} onChange={setIsNeonEdgeEnabled} />
                    {isNeonEdgeEnabled && (
                      <div className="pl-5 space-y-2 border-l-2 border-primary/20 ml-1.5">
                        <CompactSlider label="Intensity" value={neonIntensity} min={0} max={100} onChange={setNeonIntensity} />
                        <div className="flex items-center gap-2">
                          <Label className="text-[10px] text-muted-foreground">Color</Label>
                          <Input type="color" value={neonEdgeColor} onChange={(e) => setNeonEdgeColor(e.target.value)} className="h-5 w-6 p-0 rounded border-border/30 cursor-pointer" />
                        </div>
                      </div>
                    )}
                  </div>
                </SettingsCard>
              </TabsContent>

              {/* ─── Effects Tab ─── */}
              <TabsContent value="effects" className="overflow-y-auto max-h-[55vh] sm:max-h-[60vh] space-y-3 pr-1 mt-0">
                <EffectsPanel
                  videoFilter={videoFilter}
                  setVideoFilter={setVideoFilter}
                  activeInteractiveFilter={activeInteractiveFilter}
                  setActiveInteractiveFilter={setActiveInteractiveFilter}
                />
              </TabsContent>

              {/* ─── Cinematic Tab ─── */}
              <TabsContent value="cinematic" className="overflow-y-auto max-h-[55vh] sm:max-h-[60vh] pr-1 mt-0">
                <CinematicPanel
                  activeCinematicEffect={activeCinematicEffect}
                  setActiveCinematicEffect={setActiveCinematicEffect}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Effects Panel ─── */
const EffectsPanel: React.FC<{
  videoFilter: string | undefined;
  setVideoFilter: (f: string | undefined) => void;
  activeInteractiveFilter: string;
  setActiveInteractiveFilter: (f: string) => void;
}> = ({ videoFilter, setVideoFilter, activeInteractiveFilter, setActiveInteractiveFilter }) => {
  const { filters: filterPresets } = useFilters();

  const handleColorFilter = (style: string) => {
    if (videoFilter === style) {
      setVideoFilter("none");
    } else {
      setActiveInteractiveFilter("none");
      setVideoFilter(style);
    }
  };

  const handleInteractiveFilter = (id: string) => {
    if (activeInteractiveFilter === id) {
      setActiveInteractiveFilter("none");
    } else {
      setVideoFilter("none");
      setActiveInteractiveFilter(id);
    }
  };

  const hasAny = (videoFilter && videoFilter !== "none") || (activeInteractiveFilter && activeInteractiveFilter !== "none");

  return (
    <div className="space-y-3">
      {hasAny && (
        <button
          onClick={() => { setVideoFilter("none"); setActiveInteractiveFilter("none"); }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/30 text-[10px] font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
        >
          <X className="w-3 h-3" /> Clear All Filters
        </button>
      )}

      <SettingsCard title="Color Filters">
        <div className="grid grid-cols-4 gap-1.5">
          {filterPresets.map((filter) => {
            const isSelected = videoFilter === filter.style;
            return (
              <button
                key={filter.id}
                onClick={() => handleColorFilter(filter.style)}
                className={cn(
                  "aspect-[4/3] rounded-lg border transition-all relative overflow-hidden group",
                  isSelected
                    ? "border-primary ring-1 ring-primary/30 shadow-sm"
                    : "border-border/20 hover:border-border/50"
                )}
                title={filter.name}
              >
                <img
                  src={FILTER_SAMPLE_IMG}
                  alt={filter.name}
                  className="w-full h-full object-cover"
                  style={{ filter: filter.style !== "none" ? filter.style : undefined }}
                  loading="lazy"
                />
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5">
                  <span className="text-white text-[8px] font-semibold truncate block text-center">{filter.name}</span>
                </div>
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </SettingsCard>

      <SettingsCard title="Interactive Filters">
        <div className="grid grid-cols-4 gap-1.5">
          {INTERACTIVE_FILTER_PRESETS.map((filter) => {
            const isSelected = activeInteractiveFilter === filter.id;
            return (
              <button
                key={filter.id}
                onClick={() => handleInteractiveFilter(filter.id)}
                className={cn(
                  "aspect-[4/3] rounded-lg border transition-all relative overflow-hidden group",
                  isSelected
                    ? "border-primary ring-1 ring-primary/30 shadow-sm"
                    : "border-border/20 hover:border-border/50"
                )}
                title={filter.name}
              >
                <img
                  src={filter.thumbnailUrl}
                  alt={filter.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    // Fallback if placeholder URL fails
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-muted/50 text-[9px] font-bold text-foreground/70 pointer-events-none">
                  {filter.name}
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent px-1 py-0.5">
                  <span className="text-white text-[8px] font-semibold truncate block text-center">{filter.name}</span>
                </div>
                {isSelected && (
                  <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </SettingsCard>
    </div>
  );
};

/* ─── Cinematic Panel ─── */
const CinematicPanel: React.FC<{
  activeCinematicEffect: CinematicEffect;
  setActiveCinematicEffect: (e: CinematicEffect) => void;
}> = ({ activeCinematicEffect, setActiveCinematicEffect }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const hasEffect = activeCinematicEffect !== "none";

  const filtered = CINEMATIC_PRESETS.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  return (
    <div className="space-y-2">
      {hasEffect && (
        <button
          onClick={() => setActiveCinematicEffect("none")}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-border/30 text-[10px] font-medium text-muted-foreground hover:bg-muted/40 transition-colors"
        >
          <X className="w-3 h-3" /> Clear Cinematic Effect
        </button>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Search shots..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-7 pl-8 text-[11px] bg-muted/30 border-border/20 rounded-lg"
        />
      </div>

      {/* Category pills */}
      {!search && (
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
          {CINEMATIC_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={cn(
                "text-[9px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition-all",
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground bg-muted/30 hover:bg-muted/50"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 gap-1.5">
        {filtered.map((preset) => {
          const isActive = activeCinematicEffect === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => setActiveCinematicEffect(isActive ? "none" : preset.id)}
              className={cn(
                "flex flex-col items-start gap-0.5 p-2 rounded-lg border transition-all text-left",
                isActive
                  ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                  : "border-border/15 hover:border-border/40 hover:bg-muted/30"
              )}
            >
              <div className="flex items-center gap-1.5 w-full">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: preset.color }} />
                <span className="text-[10px] font-semibold truncate">{preset.name}</span>
                {isActive && <Check className="w-3 h-3 ml-auto text-primary shrink-0" />}
              </div>
              <span className="text-[9px] text-muted-foreground leading-tight">{preset.description}</span>
            </button>
          );
        })}
      </div>
      {filtered.length === 0 && (
        <p className="text-[11px] text-muted-foreground text-center py-4">No shots found</p>
      )}
      <p className="text-[9px] text-muted-foreground text-center pt-1">{filtered.length} shot{filtered.length !== 1 ? "s" : ""}</p>
    </div>
  );
};

/* ─── Live Camera Preview ─── */
const CameraPreview: React.FC<{
  deviceId?: string;
  open: boolean;
  pipBorder: { color: string; width: number };
  pipShadow: { blur: number; color: string };
  videoFilter?: string;
  isBeautifyEnabled?: boolean;
  isLowLightEnabled?: boolean;
  activeCinematicEffect?: CinematicEffect;
}> = ({ deviceId, open, pipBorder, pipShadow, videoFilter, isBeautifyEnabled, isLowLightEnabled, activeCinematicEffect }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!open) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let cancelled = false;
    const startPreview = async () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      try {
        const constraints: MediaStreamConstraints = {
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false,
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (cancelled) { stream.getTracks().forEach(t => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.warn("[VideoSettings] Preview failed:", err);
      }
    };
    startPreview();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [deviceId, open]);

  // Build CSS filter string for preview
  const filters: string[] = [];
  if (videoFilter && videoFilter !== "none") filters.push(videoFilter);
  if (isBeautifyEnabled) filters.push("blur(0.5px) saturate(1.1) brightness(1.05)");
  if (isLowLightEnabled) filters.push("brightness(1.3) contrast(1.1)");
  const filterStyle = filters.length > 0 ? filters.join(" ") : undefined;

  const borderStyle = pipBorder.width > 0 ? `${pipBorder.width}px solid ${pipBorder.color}` : undefined;
  const shadowStyle = pipShadow.blur > 0 ? `0 4px ${pipShadow.blur}px ${pipShadow.color}` : undefined;

  // Cinematic canvas styles
  const cinematicStyles = activeCinematicEffect && activeCinematicEffect !== "none"
    ? getCinematicCanvasStyles(activeCinematicEffect)
    : null;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted/30 ring-1 ring-border/10">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{
          border: borderStyle,
          boxShadow: shadowStyle,
          borderRadius: '0.75rem',
          filter: filterStyle,
          ...cinematicStyles?.canvas,
        }}
      />
      {/* Cinematic overlay on top of video */}
      {activeCinematicEffect && activeCinematicEffect !== "none" && (
        <CinematicOverlay effect={activeCinematicEffect} />
      )}
      {!open && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Webcam className="w-8 h-8 text-muted-foreground/30" />
        </div>
      )}
    </div>
  );
};

/* ─── Helpers ─── */
const SettingsCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-xl border border-border/15 bg-card/30 p-3 space-y-2.5">
    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
    {children}
  </div>
);

const ToggleRow: React.FC<{
  icon?: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}> = ({ icon, label, checked, onChange }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {icon && <span className="text-muted-foreground/60">{icon}</span>}
      <Label className="text-[11px] font-medium">{label}</Label>
    </div>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const CompactSlider: React.FC<{
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}> = ({ label, value, min, max, onChange }) => (
  <div className="flex items-center gap-2">
    <Label className="text-[10px] text-muted-foreground w-12 shrink-0">{label}</Label>
    <Slider value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v)} className="flex-1" />
    <span className="text-[9px] tabular-nums text-muted-foreground w-5 text-right">{value}</span>
  </div>
);
