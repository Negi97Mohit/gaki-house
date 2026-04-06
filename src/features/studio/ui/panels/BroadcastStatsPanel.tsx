import React, { useEffect, useState } from "react";

interface TelemetryData {
  fps: number;
  memoryMb: number;
  isFailed: boolean;
}

export const BroadcastStatsPanel: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryData>({ 
    fps: 0, 
    memoryMb: 0, 
    isFailed: false 
  });

  useEffect(() => {
    const handleTelemetry = (e: any) => {
      setTelemetry((e as CustomEvent<TelemetryData>).detail);
    };

    const handleFailure = () => {
      setTelemetry(prev => ({ ...prev, isFailed: true }));
    };

    window.addEventListener("broadcast-telemetry", handleTelemetry);
    window.addEventListener("broadcast-engine-failure", handleFailure);

    return () => {
      // Clean unmount
      window.removeEventListener("broadcast-telemetry", handleTelemetry);
      window.removeEventListener("broadcast-engine-failure", handleFailure);
    };
  }, []);

  const getFpsColorClass = () => {
    if (telemetry.isFailed || telemetry.fps < 20) return "bg-red-500 animate-pulse";
    if (telemetry.fps < 45) return "bg-yellow-400";
    return "bg-green-500";
  };

  return (
    <div className="fixed bottom-[56px] left-0 right-0 z-50 flex items-center justify-between px-4 py-1.5 bg-zinc-950/90 backdrop-blur border-t border-zinc-800 text-[11px] text-zinc-400 select-none shadow-lg shadow-black/50">
      <div className="flex items-center gap-4">
        
        {/* FPS Indicator */}
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getFpsColorClass()} shadow-[0_0_8px_rgba(0,0,0,0.5)] shadow-current`} />
          <span className="font-mono text-zinc-300 w-[50px]">
            {telemetry.isFailed ? "FAIL" : `${telemetry.fps} FPS`}
          </span>
        </div>

        {/* Memory Indicator */}
        <div className="flex items-center gap-1.5 opacity-80">
          <span>MEM</span>
          <span className="font-mono text-zinc-300">{telemetry.memoryMb.toFixed(1)} MB</span>
        </div>

      </div>

      <div className="flex items-center">
        {telemetry.isFailed ? (
          <span className="text-red-400 font-bold tracking-wider">ENGINE FAILURE — MANUALLY RESTART KERNEL</span>
        ) : (
          <span className="text-zinc-600 font-medium">BROADCAST KERNEL RUNNING</span>
        )}
      </div>
    </div>
  );
};
