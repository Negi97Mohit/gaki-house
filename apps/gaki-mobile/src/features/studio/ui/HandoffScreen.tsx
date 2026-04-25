import { useState } from "react";
import { Send, Wifi, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const sessions = [
  { id: "1", title: "Friday Night Variety", platform: "Twitch", duration: "01:42:18", viewers: 1284, health: "excellent" },
  { id: "2", title: "Speedrun Attempts", platform: "YouTube", duration: "00:23:05", viewers: 312, health: "good" },
  { id: "3", title: "Late Night Chat", platform: "Kick", duration: "00:08:47", viewers: 87, health: "fair" },
];

const platforms = [
  { id: "youtube", name: "YouTube Live", desc: "Push to your primary channel", color: "bg-red-500" },
  { id: "twitch", name: "Twitch", desc: "Hand off to your Twitch session", color: "bg-violet-600" },
  { id: "kick", name: "Kick", desc: "Continue on Kick.com", color: "bg-emerald-500" },
];

const HandoffScreen = () => {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selected, setSelected] = useState<string | null>("1");

  return (
    <div className="relative h-full w-full overflow-y-auto pt-16 pb-40 no-scrollbar">
      <div className="px-5 mb-4 animate-fade-in-up">
        <div className="inline-block glass-frost rounded-full px-3 py-1 text-[10px] font-bold tracking-[0.15em] uppercase text-foreground/70 mb-2">
          Handoff
        </div>
        <h1 className="font-display text-3xl text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">Active sessions</h1>
      </div>

      <div className="px-4 space-y-2.5 animate-fade-in-up">
        {sessions.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelected(s.id)}
            className={cn(
              "w-full text-left rounded-2xl p-3.5 glass-frost border transition-all active:scale-[0.99]",
              selected === s.id ? "border-foreground shadow-elevated" : "border-white/30 shadow-float"
            )}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <span className="relative h-1.5 w-1.5 rounded-full bg-[hsl(var(--live))] animate-pulse-live" />
                <span className="text-[9px] font-bold tracking-[0.15em] text-[hsl(var(--live))]">LIVE</span>
                <span className="text-[10px] text-foreground/60 ml-1">· {s.platform}</span>
              </div>
              <span className="text-[11px] text-foreground/70 tabular-nums font-medium">{s.duration}</span>
            </div>

            <div className="font-semibold text-foreground leading-tight text-sm mb-1">{s.title}</div>

            <div className="flex items-center justify-between text-[11px] text-foreground/60">
              <span>{s.viewers.toLocaleString()} viewers</span>
              <div className="flex items-center gap-1">
                <Wifi className={cn(
                  "h-3 w-3",
                  s.health === "excellent" && "text-emerald-500",
                  s.health === "good" && "text-amber-500",
                  s.health === "fair" && "text-orange-500",
                )} />
                <span className="capitalize">{s.health}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Anchored handoff CTA */}
      <div className="fixed bottom-20 inset-x-0 z-30 px-5 pointer-events-none">
        <div className="max-w-sm mx-auto pointer-events-auto">
          <button
            onClick={() => selected && setSheetOpen(true)}
            disabled={!selected}
            className={cn(
              "w-full h-13 py-3.5 rounded-full flex items-center justify-center gap-2 font-semibold transition-all duration-300 active:scale-[0.98] shadow-elevated text-sm",
              selected
                ? "bg-gradient-primary text-white"
                : "glass-frost text-foreground/40 cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" strokeWidth={2.4} />
            <span className="tracking-wide">Handoff Stream</span>
          </button>
        </div>
      </div>

      {/* Bottom sheet */}
      {sheetOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setSheetOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 animate-fade-in-up" />
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-0 inset-x-0 glass-strong rounded-t-[2rem] shadow-elevated p-5 pb-8 safe-bottom"
            style={{ animation: "fade-in-up 0.35s var(--ease-out-soft) both" }}
          >
            <div className="mx-auto h-1 w-10 rounded-full bg-foreground/20 mb-5" />

            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-2xl">Hand off to…</h2>
              <button
                onClick={() => setSheetOpen(false)}
                className="h-8 w-8 rounded-full bg-foreground/10 flex items-center justify-center"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Your live session continues seamlessly.</p>

            <div className="space-y-2">
              {platforms.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setSheetOpen(false)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-foreground/5 hover:bg-foreground/10 transition-all active:scale-[0.98] text-left"
                >
                  <div className={cn("h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm", p.color)}>
                    {p.name.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground text-sm">{p.name}</div>
                    <div className="text-[11px] text-muted-foreground truncate">{p.desc}</div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HandoffScreen;
