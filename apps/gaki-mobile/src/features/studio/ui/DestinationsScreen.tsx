import { useState } from "react";
import { Switch } from "@caption-cam/ui/switch";

const platforms = [
  {
    id: "twitch",
    name: "Twitch",
    desc: "Affiliate account",
    color: "bg-violet-600",
    letter: "T",
  },
  {
    id: "youtube",
    name: "YouTube Live",
    desc: "Primary channel · 1080p",
    color: "bg-red-500",
    letter: "Y",
  },
  {
    id: "kick",
    name: "Kick",
    desc: "kick.com/gaki",
    color: "bg-emerald-500",
    letter: "K",
  },
];

const DestinationsPanel = () => {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({
    twitch: true,
    youtube: true,
    kick: false,
  });
  const activeCount = Object.values(enabled).filter(Boolean).length;

  return (
    <div>
      <p className="text-[12px] text-neutral-900/70 mb-3 px-1">
        Broadcast to {activeCount}{" "}
        {activeCount === 1 ? "platform" : "platforms"} at once.
      </p>
      <div className="rounded-2xl bg-white/30 border border-white/50 overflow-hidden">
        {platforms.map((p, i) => (
          <div
            key={p.id}
            className={`flex items-center gap-3 px-3.5 py-3.5 ${
              i !== platforms.length - 1 ? "border-b border-white/40" : ""
            }`}
          >
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-white font-bold ${p.color}`}
            >
              {p.letter}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-neutral-900 text-sm leading-tight">
                {p.name}
              </div>
              <div className="text-[11px] text-neutral-900/60 truncate">
                {p.desc}
              </div>
            </div>
            <Switch
              checked={!!enabled[p.id]}
              onCheckedChange={(v) =>
                setEnabled((prev) => ({ ...prev, [p.id]: v }))
              }
            />
          </div>
        ))}
      </div>
      <button className="mt-3 w-full text-[12px] font-medium text-neutral-900/80 hover:text-neutral-900 py-2.5 rounded-2xl bg-white/20 border border-white/40">
        + Add destination
      </button>
    </div>
  );
};

export default DestinationsPanel;
