import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Check, Webcam, Sparkles, Sun, Zap } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useMediaStore } from "@/stores/media.store";
import { useSceneStore } from "@/stores/scene.store";
import { useShallow } from "zustand/react/shallow";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";

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
    }))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl w-[95vw] max-h-[85vh] overflow-hidden bg-background/95 backdrop-blur-2xl border border-border/20 dark:border-white/10 rounded-2xl shadow-2xl p-0">
        <div className="px-5 pt-5 pb-3">
          <DialogHeader>
            <DialogTitle className="text-sm font-semibold tracking-tight">Video Settings</DialogTitle>
          </DialogHeader>
        </div>

        <div className="flex flex-col sm:flex-row gap-0 sm:gap-4 overflow-hidden flex-1 px-5 pb-5">
          {/* Live Preview */}
          <div className="shrink-0 sm:w-[280px] w-full">
            <CameraPreview
              deviceId={selectedVideoDevice}
              open={open}
              pipBorder={pipBorder}
              pipShadow={pipShadow}
            />
            {/* Camera selector */}
            <div className="mt-3 space-y-1">
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">Camera</Label>
              <div className="space-y-0.5 max-h-24 overflow-y-auto">
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

          {/* Settings panel */}
          <div className="flex-1 min-w-0 overflow-y-auto max-h-[55vh] sm:max-h-[65vh] space-y-4 mt-4 sm:mt-0 pr-1">
            {/* Border & Shadow */}
            <SettingsCard title="PiP Style">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground">Border</Label>
                    <Input
                      type="color"
                      value={pipBorder.color}
                      onChange={(e) => setPipBorder({ ...pipBorder, color: e.target.value })}
                      className="h-5 w-6 p-0 rounded border-border/30 cursor-pointer"
                    />
                  </div>
                  <Slider
                    value={[pipBorder.width]}
                    min={0} max={10} step={1}
                    onValueChange={([v]) => setPipBorder({ ...pipBorder, width: v })}
                  />
                  <span className="text-[9px] text-muted-foreground tabular-nums">{pipBorder.width}px</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-[10px] text-muted-foreground">Shadow</Label>
                    <Input
                      type="color"
                      value={pipShadow.color.startsWith("rgba") ? "#000000" : pipShadow.color}
                      onChange={(e) => setPipShadow({ ...pipShadow, color: e.target.value })}
                      className="h-5 w-6 p-0 rounded border-border/30 cursor-pointer"
                    />
                  </div>
                  <Slider
                    value={[pipShadow.blur]}
                    min={0} max={40} step={1}
                    onValueChange={([v]) => setPipShadow({ ...pipShadow, blur: v })}
                  />
                  <span className="text-[9px] text-muted-foreground tabular-nums">{pipShadow.blur}px blur</span>
                </div>
              </div>
            </SettingsCard>

            {/* Enhancements */}
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
                      <Input
                        type="color"
                        value={neonEdgeColor}
                        onChange={(e) => setNeonEdgeColor(e.target.value)}
                        className="h-5 w-6 p-0 rounded border-border/30 cursor-pointer"
                      />
                    </div>
                  </div>
                )}
              </div>
            </SettingsCard>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Live Camera Preview ─── */
const CameraPreview: React.FC<{
  deviceId?: string;
  open: boolean;
  pipBorder: { color: string; width: number };
  pipShadow: { blur: number; color: string };
}> = ({ deviceId, open, pipBorder, pipShadow }) => {
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
      // Stop previous stream
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

  const borderStyle = pipBorder.width > 0
    ? `${pipBorder.width}px solid ${pipBorder.color}`
    : undefined;
  const shadowStyle = pipShadow.blur > 0
    ? `0 4px ${pipShadow.blur}px ${pipShadow.color}`
    : undefined;

  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-muted/30 ring-1 ring-border/10">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-cover"
        style={{ border: borderStyle, boxShadow: shadowStyle, borderRadius: '0.75rem' }}
      />
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
  <div className="rounded-xl border border-border/15 bg-card/30 p-3.5 space-y-3">
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
