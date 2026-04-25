import { useState } from "react";
import { Plus, Check, Gamepad2, Coffee, Mic2, Tv, Monitor, Camera, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const scenes = [
  { id: "1", name: "Just Chatting", icon: Coffee, hue: "from-orange-400 to-pink-500", live: true },
  { id: "2", name: "Gameplay", icon: Gamepad2, hue: "from-violet-500 to-indigo-600" },
  { id: "3", name: "Podcast", icon: Mic2, hue: "from-emerald-400 to-teal-600" },
  { id: "4", name: "BRB", icon: Tv, hue: "from-amber-400 to-orange-500" },
  { id: "5", name: "Desktop", icon: Monitor, hue: "from-sky-400 to-blue-600" },
  { id: "6", name: "Webcam", icon: Camera, hue: "from-rose-400 to-red-500" },
  { id: "7", name: "Starting", icon: ImageIcon, hue: "from-fuchsia-400 to-purple-600" },
  { id: "8", name: "Highlights", icon: Sparkles, hue: "from-yellow-400 to-amber-500" },
];

const ScenesScreen = () => {
  const [active, setActive] = useState<string | null>("1");

  return (
    <div className="relative h-full w-full overflow-y-auto pt-16 pb-32 no-scrollbar">
      <div className="px-5 mb-4 animate-fade-in-up">
        <div className="inline-block glass-frost rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/70 mb-2">
          Scenes
        </div>
        <h1 className="font-display text-3xl text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">Pick a vibe</h1>
      </div>

      <div className="px-3 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2.5 animate-fade-in-up">
        {scenes.map((s) => {
          const Icon = s.icon;
          const isActive = active === s.id;
          return (
            <button
              key={s.id}
              onClick={() => setActive((curr) => (curr === s.id ? null : s.id))}
              className={cn(
                "group relative aspect-square rounded-2xl overflow-hidden text-left transition-all duration-300 active:scale-[0.96] border-2",
                isActive ? "border-white shadow-elevated" : "border-white/20 shadow-float"
              )}
            >
              <div className={cn("absolute inset-0 bg-gradient-to-br", s.hue)} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/10" />

              <div className="absolute top-1.5 left-1.5 right-1.5 flex items-start justify-between">
                <div className="h-7 w-7 rounded-full glass-strong flex items-center justify-center">
                  <Icon className="h-3.5 w-3.5 text-foreground" strokeWidth={2.2} />
                </div>
                {s.live ? (
                  <div className="px-1.5 py-px rounded-full bg-[hsl(var(--live))] text-white text-[8px] font-bold tracking-wider">
                    LIVE
                  </div>
                ) : isActive ? (
                  <div className="h-5 w-5 rounded-full bg-white flex items-center justify-center">
                    <Check className="h-3 w-3 text-foreground" strokeWidth={3} />
                  </div>
                ) : null}
              </div>

              <div className="absolute bottom-1.5 left-2 right-2">
                <div className="text-white font-semibold text-[11px] leading-tight truncate">{s.name}</div>
              </div>
            </button>
          );
        })}

        <button className="aspect-square rounded-2xl border-2 border-dashed border-white/40 flex flex-col items-center justify-center gap-1 text-white/80 hover:text-white hover:border-white/70 transition-all active:scale-[0.96] glass-dark">
          <Plus className="h-4 w-4" />
          <span className="text-[10px] font-medium">New</span>
        </button>
      </div>
    </div>
  );
};

export default ScenesScreen;
