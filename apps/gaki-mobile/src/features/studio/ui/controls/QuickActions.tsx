import { Mic, MicOff, RefreshCcw, BarChart3, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  muted: boolean;
  showStats: boolean;
  onOpenAssets?: () => void;
  handleMute: () => void;
  handleFlip: () => void;
  setShowStats: React.Dispatch<React.SetStateAction<boolean>>;
}

export function QuickActions({
  muted,
  showStats,
  onOpenAssets,
  handleMute,
  handleFlip,
  setShowStats,
}: Props) {
  const quickActions = [
    {
      id: "asset",
      icon: Plus,
      label: "Add asset",
      tone: "default" as const,
      onClick: () => onOpenAssets?.(),
    },
    {
      id: "mic",
      icon: muted ? MicOff : Mic,
      label: muted ? "Unmute" : "Mute mic",
      active: muted,
      tone: muted ? ("danger" as const) : ("default" as const),
      onClick: handleMute,
    },
    { id: "flip", icon: RefreshCcw, label: "Flip camera", tone: "default" as const, onClick: handleFlip },
    {
      id: "stats",
      icon: BarChart3,
      label: "Toggle stats",
      active: showStats,
      tone: "default" as const,
      onClick: () => setShowStats((s) => !s),
    },
  ];

  return (
    <div className="absolute right-4 top-1/2 -translate-y-1/2 z-[100] flex flex-col w-fit h-fit gap-2.5 animate-fade-in-up pointer-events-auto">
      {quickActions.map((a) => {
        const Icon = a.icon;
        const isActive = "active" in a ? a.active : false;
        const danger = a.tone === "danger";
        return (
          <button
            key={a.id}
            onPointerDown={(e) => { console.log(`[🔥 QUICK ACTION] pointerDown (${a.id})`); e.stopPropagation(); }}
            onPointerUp={(e) => e.stopPropagation()}
            onTouchStart={(e) => { console.log(`[🔥 QUICK ACTION] touchStart (${a.id})`); e.stopPropagation(); }}
            onTouchEnd={(e) => {
              console.log(`[🔥 QUICK ACTION] touchEnd (${a.id})`);
              e.stopPropagation();
              e.preventDefault();
              a.onClick();
            }}
            onClick={(e) => {
              console.log(`[🔥 QUICK ACTION] click (${a.id})`);
              e.stopPropagation();
              a.onClick();
            }}
            aria-label={a.label}
            className={cn(
              "cursor-pointer h-11 w-11 rounded-full flex items-center justify-center transition-all duration-300 active:scale-90 border backdrop-blur-md shadow-soft",
              danger
                ? "bg-red-500/60 border-red-400/70 text-white"
                : isActive
                ? "bg-white/85 border-white/60 text-neutral-900"
                : "bg-white/40 border-white/50 text-neutral-900"
            )}
          >
            <Icon className="h-[17px] w-[17px]" strokeWidth={2.2} />
          </button>
        );
      })}
    </div>
  );
}
