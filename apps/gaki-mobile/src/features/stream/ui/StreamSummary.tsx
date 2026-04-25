import { X } from "lucide-react";

interface Props {
  elapsed: number;
  peakViewers: number;
  formatTime: (s: number) => string;
  dismissSummary: () => void;
}

export function StreamSummary({ elapsed, peakViewers, formatTime, dismissSummary }: Props) {
  return (
    <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 backdrop-blur-md p-6 pointer-events-auto">
      <div
        className="w-full max-w-sm bg-white/90 backdrop-blur-2xl rounded-[2rem] border border-white/60 shadow-elevated p-6 text-center"
        style={{ animation: "fade-in-up 0.4s var(--ease-out-soft) both" }}
      >
        <div className="text-[10px] font-bold tracking-[0.2em] uppercase text-neutral-900/60 mb-1">
          Stream Ended
        </div>
        <h2 className="font-display text-3xl text-neutral-900 mb-5">Nice stream 👏</h2>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-neutral-900/5 border border-neutral-900/10 p-4">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-neutral-900/50">Duration</div>
            <div className="font-display text-2xl text-neutral-900 tabular-nums mt-1">{formatTime(elapsed)}</div>
          </div>
          <div className="rounded-2xl bg-neutral-900/5 border border-neutral-900/10 p-4">
            <div className="text-[10px] font-semibold tracking-wider uppercase text-neutral-900/50">Peak viewers</div>
            <div className="font-display text-2xl text-neutral-900 tabular-nums mt-1">{peakViewers}</div>
          </div>
        </div>

        <button
          onClick={dismissSummary}
          className="w-full h-12 rounded-2xl bg-neutral-900 text-white font-semibold text-sm flex items-center justify-center gap-2 active:scale-[0.99] transition-transform"
        >
          <X className="h-4 w-4" />
          Done
        </button>
      </div>
    </div>
  );
}
