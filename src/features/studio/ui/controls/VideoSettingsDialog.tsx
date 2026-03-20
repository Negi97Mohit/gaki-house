import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Check, Webcam } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { useMediaStore } from "@/stores/media.store";
import { useSceneStore } from "@/stores/scene.store";
import { useCanvasStore } from "@/stores/canvas.store";
import { useShallow } from "zustand/react/shallow";
import { Slider } from "@/shared/ui/slider";
import { Switch } from "@/shared/ui/switch";
import { Label } from "@/shared/ui/label";
import { Input } from "@/shared/ui/input";

interface VideoSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHAPE_OPTIONS: { value: "rectangle" | "circle" | "rounded"; label: string }[] = [
  { value: "rectangle", label: "Rectangle" },
  { value: "rounded", label: "Rounded" },
  { value: "circle", label: "Circle" },
];

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
      neonEdgeColor: s.neonEdgeColor,
      setNeonEdgeColor: s.setNeonEdgeColor,
      zoomSensitivity: s.zoomSensitivity,
      setZoomSensitivity: s.setZoomSensitivity,
      trackingSpeed: s.trackingSpeed,
      setTrackingSpeed: s.setTrackingSpeed,
      videoFilter: s.videoFilter,
      setVideoFilter: s.setVideoFilter,
    }))
  );

  const { cameraShape, setCameraShape } = useCanvasStore(
    useShallow((s) => ({
      cameraShape: s.cameraShape,
      setCameraShape: s.setCameraShape,
    }))
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[80vh] overflow-y-auto bg-background/95 backdrop-blur-2xl border border-border/20 dark:border-white/10 rounded-2xl shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-base font-medium">Video Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Camera Selection */}
          <Section title="Camera">
            {videoDevices.length === 0 ? (
              <p className="text-xs text-muted-foreground">No cameras found</p>
            ) : (
              <div className="space-y-1">
                {videoDevices.map((device, i) => (
                  <button
                    key={device.deviceId}
                    onClick={() => setSelectedVideoDevice(device.deviceId)}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs transition-colors",
                      device.deviceId === selectedVideoDevice
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-muted/50 text-foreground"
                    )}
                  >
                    <Webcam className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{device.label || `Camera ${i + 1}`}</span>
                    {device.deviceId === selectedVideoDevice && (
                      <Check className="w-3.5 h-3.5 ml-auto shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </Section>

          {/* PiP Shape */}
          <Section title="Camera Shape">
            <div className="flex gap-2">
              {SHAPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setCameraShape(opt.value)}
                  className={cn(
                    "flex-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                    cameraShape === opt.value
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-muted/30 hover:bg-muted/50 text-muted-foreground"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </Section>

          {/* Border */}
          <Section title="PiP Border">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-xs w-16 shrink-0">Width</Label>
                <Slider
                  value={[pipBorder.width]}
                  min={0}
                  max={10}
                  step={1}
                  onValueChange={([v]) => setPipBorder({ ...pipBorder, width: v })}
                  className="flex-1"
                />
                <span className="text-[10px] tabular-nums text-muted-foreground w-6 text-right">{pipBorder.width}px</span>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-xs w-16 shrink-0">Color</Label>
                <Input
                  type="color"
                  value={pipBorder.color}
                  onChange={(e) => setPipBorder({ ...pipBorder, color: e.target.value })}
                  className="h-7 w-10 p-0.5 rounded-md cursor-pointer border-border/30"
                />
              </div>
            </div>
          </Section>

          {/* Shadow */}
          <Section title="PiP Shadow">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Label className="text-xs w-16 shrink-0">Blur</Label>
                <Slider
                  value={[pipShadow.blur]}
                  min={0}
                  max={40}
                  step={1}
                  onValueChange={([v]) => setPipShadow({ ...pipShadow, blur: v })}
                  className="flex-1"
                />
                <span className="text-[10px] tabular-nums text-muted-foreground w-6 text-right">{pipShadow.blur}</span>
              </div>
              <div className="flex items-center gap-3">
                <Label className="text-xs w-16 shrink-0">Color</Label>
                <Input
                  type="color"
                  value={pipShadow.color.startsWith("rgba") ? "#000000" : pipShadow.color}
                  onChange={(e) => setPipShadow({ ...pipShadow, color: e.target.value })}
                  className="h-7 w-10 p-0.5 rounded-md cursor-pointer border-border/30"
                />
              </div>
            </div>
          </Section>

          {/* Enhancements */}
          <Section title="Enhancements">
            <div className="space-y-3">
              <ToggleRow label="Auto Framing" checked={isAutoFramingEnabled} onChange={setIsAutoFramingEnabled} />
              {isAutoFramingEnabled && (
                <div className="pl-4 space-y-2">
                  <SliderRow label="Zoom Sensitivity" value={zoomSensitivity} min={0} max={100} onChange={setZoomSensitivity} />
                  <SliderRow label="Tracking Speed" value={trackingSpeed} min={0} max={100} onChange={setTrackingSpeed} />
                </div>
              )}
              <ToggleRow label="Beautify" checked={isBeautifyEnabled} onChange={setIsBeautifyEnabled} />
              <ToggleRow label="Low Light Boost" checked={isLowLightEnabled} onChange={setIsLowLightEnabled} />
              <ToggleRow label="Neon Edge" checked={isNeonEdgeEnabled} onChange={setIsNeonEdgeEnabled} />
              {isNeonEdgeEnabled && (
                <div className="pl-4 space-y-2">
                  <SliderRow label="Intensity" value={neonIntensity} min={0} max={100} onChange={setNeonIntensity} />
                  <div className="flex items-center gap-3">
                    <Label className="text-xs w-20 shrink-0">Color</Label>
                    <Input
                      type="color"
                      value={neonEdgeColor}
                      onChange={(e) => setNeonEdgeColor(e.target.value)}
                      className="h-7 w-10 p-0.5 rounded-md cursor-pointer border-border/30"
                    />
                  </div>
                </div>
              )}
            </div>
          </Section>
        </div>
      </DialogContent>
    </Dialog>
  );
};

/* ─── Helper components ─── */

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="space-y-2.5">
    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{title}</h3>
    {children}
  </div>
);

const ToggleRow: React.FC<{ label: string; checked: boolean; onChange: (v: boolean) => void }> = ({
  label, checked, onChange,
}) => (
  <div className="flex items-center justify-between">
    <Label className="text-xs">{label}</Label>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const SliderRow: React.FC<{
  label: string; value: number; min: number; max: number; onChange: (v: number) => void;
}> = ({ label, value, min, max, onChange }) => (
  <div className="flex items-center gap-3">
    <Label className="text-xs w-20 shrink-0">{label}</Label>
    <Slider value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v)} className="flex-1" />
    <span className="text-[10px] tabular-nums text-muted-foreground w-6 text-right">{value}</span>
  </div>
);
