import React from "react";
import { Clapperboard, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";

export type CinematicEffect =
  | "none"
  | "dolly-zoom"
  | "letterbox"
  | "film-grain"
  | "teal-orange"
  | "vignette"
  | "shallow-dof"
  | "anamorphic-flare"
  | "bleach-bypass"
  | "dutch-angle"
  | "split-diopter"
  | "cinemascope"
  | "pillarbox"
  | "windowbox"
  | "soft-letterbox"
  | "color-letterbox"
  | "animated-letterbox"
  | "gradient-letterbox"
  | "neon-letterbox"
  | "vintage-letterbox"
  | "asymmetric-letterbox";

interface CinematicPreset {
  id: CinematicEffect;
  name: string;
  description: string;
  color: string;
  group?: string;
}

const CINEMATIC_PRESETS: CinematicPreset[] = [
  { id: "dolly-zoom", name: "Dolly Zoom", description: "Hitchcock vertigo zoom", color: "#ff4444" },
  { id: "letterbox", name: "Letterbox", description: "2.39:1 widescreen bars", color: "#1a1a1a" },
  { id: "film-grain", name: "Film Grain", description: "35mm film texture", color: "#8B7355" },
  { id: "teal-orange", name: "Teal & Orange", description: "Hollywood color grade", color: "#FF8C00" },
  { id: "vignette", name: "Vignette", description: "Dark edge focus", color: "#333333" },
  { id: "shallow-dof", name: "Shallow DOF", description: "Bokeh blur edges", color: "#6699CC" },
  { id: "anamorphic-flare", name: "Anamorphic", description: "Horizontal lens flare", color: "#00BFFF" },
  { id: "bleach-bypass", name: "Bleach Bypass", description: "Desaturated high contrast", color: "#A0A0A0" },
  { id: "dutch-angle", name: "Dutch Angle", description: "Tilted tension shot", color: "#CC5500" },
  { id: "split-diopter", name: "Split Diopter", description: "Split-focus blur", color: "#9966CC" },
  { id: "cinemascope", name: "Cinemascope", description: "Ultra-wide 2.76:1 bars", color: "#0a0a0a", group: "Letterbox" },
  { id: "pillarbox", name: "Pillarbox", description: "Vertical side bars", color: "#111111", group: "Letterbox" },
  { id: "windowbox", name: "Windowbox", description: "Bars on all four sides", color: "#0d0d0d", group: "Letterbox" },
  { id: "soft-letterbox", name: "Soft Edge", description: "Feathered gradient bars", color: "#2a2a2a", group: "Letterbox" },
  { id: "color-letterbox", name: "Color Bars", description: "Tinted cinematic bars", color: "#1a0a2e", group: "Letterbox" },
  { id: "animated-letterbox", name: "Animated Bars", description: "Breathing letterbox", color: "#1a1a2e", group: "Letterbox" },
  { id: "gradient-letterbox", name: "Gradient Bars", description: "Gradient fade bars", color: "#2e1a1a", group: "Letterbox" },
  { id: "neon-letterbox", name: "Neon Bars", description: "Glowing neon edges", color: "#00ff88", group: "Letterbox" },
  { id: "vintage-letterbox", name: "Vintage Frame", description: "Aged film gate look", color: "#8B6914", group: "Letterbox" },
  { id: "asymmetric-letterbox", name: "Asymmetric", description: "Uneven dramatic crop", color: "#3a1a1a", group: "Letterbox" },
];

interface PipCinematicMenuProps {
  activeCinematicEffect: CinematicEffect;
  onCinematicEffectChange: (effect: CinematicEffect) => void;
}

export const PipCinematicMenu: React.FC<PipCinematicMenuProps> = ({
  activeCinematicEffect,
  onCinematicEffectChange,
}) => {
  const hasEffect = activeCinematicEffect !== "none";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl hover:bg-background/60",
            hasEffect && "text-primary"
          )}
          title="Cinematic Shots"
        >
          <Clapperboard className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="z-[var(--z-text-toolbar)] w-64 max-h-[70vh] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40 p-2"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {hasEffect && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onCinematicEffectChange("none")}
              className="w-full text-xs gap-2 mb-2"
            >
              <X className="w-3.5 h-3.5" />
              Clear Cinematic Effect
            </Button>
          )}

          {/* Core effects */}
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">Effects</p>
          <div className="grid grid-cols-2 gap-1.5 mb-2">
            {CINEMATIC_PRESETS.filter(p => !p.group).map((preset) => {
              const isActive = activeCinematicEffect === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() =>
                    onCinematicEffectChange(isActive ? "none" : preset.id)
                  }
                  className={cn(
                    "flex flex-col items-start gap-0.5 p-2 rounded-lg border transition-all text-left",
                    isActive
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border/30 hover:border-border/60 hover:bg-foreground/5"
                  )}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-[10px] font-semibold truncate">
                      {preset.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground leading-tight">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Letterbox variations */}
          <p className="text-[9px] font-semibold text-muted-foreground uppercase tracking-wider px-1 mb-1">Letterbox Styles</p>
          <div className="grid grid-cols-2 gap-1.5">
            {CINEMATIC_PRESETS.filter(p => p.group === "Letterbox").map((preset) => {
              const isActive = activeCinematicEffect === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() =>
                    onCinematicEffectChange(isActive ? "none" : preset.id)
                  }
                  className={cn(
                    "flex flex-col items-start gap-0.5 p-2 rounded-lg border transition-all text-left",
                    isActive
                      ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                      : "border-border/30 hover:border-border/60 hover:bg-foreground/5"
                  )}
                >
                  <div className="flex items-center gap-1.5 w-full">
                    <div
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: preset.color }}
                    />
                    <span className="text-[10px] font-semibold truncate">
                      {preset.name}
                    </span>
                  </div>
                  <span className="text-[9px] text-muted-foreground leading-tight">
                    {preset.description}
                  </span>
                </button>
              );
            })}
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
