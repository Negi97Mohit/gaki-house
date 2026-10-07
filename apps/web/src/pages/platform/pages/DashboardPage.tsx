import React from "react";
import { useNavigate } from "react-router-dom";
import { Radio, Tv, Layers, BarChart3, Settings, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";
import { useStreamStore } from "@/stores/stream.store";
import { useAuth } from "../context/AuthContext";
import { useGoLiveStore } from "@/stores/goLive.store";
import { PLATFORM_META } from "../data/mockData";
import { getPlatformIcon } from "@/features/banners/ui/banner/PlatformIcons";

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const requestGoLive = useGoLiveStore((s) => s.requestGoLive);
  const { destinations, isBroadcasting } = useStreamStore();

  const handleGoLive = () => {
    if (!user) {
      openAuthModal("login");
      return;
    }
    requestGoLive();
    navigate("/");
  };

  const enabledDestinations = destinations.filter((d) => d.enabled);

  return (
    <div className="min-h-screen bg-zinc-950 text-white pt-20 px-6 sm:px-12 md:px-16 pb-24 select-none">
      {/* Header */}
      <div className="mb-8 pb-6 border-b border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-1 rounded bg-red-600/10 text-red-500 border border-red-500/20 text-[10px] font-mono font-bold uppercase tracking-wider">
            Creator Studio Deck
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">
            Multicast Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure concurrent destination targets and monitor streaming telemetry
          </p>
        </div>

        <button
          onClick={handleGoLive}
          className="px-6 py-3 bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black rounded-lg transition-all flex items-center gap-2 self-start sm:self-auto shadow-xl shadow-red-950"
        >
          <Radio className="w-4 h-4" />
          {isBroadcasting ? "Studio Live (Active)" : "Launch GAKI Studio"}
        </button>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: "Live Status",
            value: isBroadcasting ? "BROADCASTING" : "OFFLINE",
            sub: isBroadcasting ? "Streaming to destinations" : "Ready to go live",
            color: isBroadcasting ? "text-emerald-400" : "text-zinc-400",
          },
          {
            label: "Active Targets",
            value: `${enabledDestinations.length} Platforms`,
            sub: "Simultaneous RTMP fanout",
            color: "text-white",
          },
          {
            label: "Stream Resolution",
            value: "1080p @ 60 FPS",
            sub: "Hardware accelerated canvas",
            color: "text-primary",
          },
          {
            label: "Bitrate Overhead",
            value: "0x Multiplier",
            sub: "Server-side fanout pipeline",
            color: "text-cyan-400",
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="p-5 rounded-2xl bg-zinc-900/60 border border-white/[0.06]"
          >
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider">
              {stat.label}
            </span>
            <p className={`text-xl font-black mt-1 ${stat.color}`}>{stat.value}</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">{stat.sub}</p>
          </div>
        ))}
      </div>

      {/* Multicast Destinations Configuration Grid */}
      <div className="p-6 sm:p-8 rounded-2xl bg-zinc-900/40 border border-white/[0.06] mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-primary" />
              Multicast RTMP Destinations
            </h2>
            <p className="text-xs text-zinc-400 mt-0.5">
              Target platforms that will receive your stream when you click Go Live in GAKI
            </p>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
          >
            Manage Keys in Studio <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {destinations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {destinations.map((dest) => {
              const meta = PLATFORM_META[dest.platform as keyof typeof PLATFORM_META] || {
                label: dest.name || dest.platform,
                color: "#ff4444",
              };
              const Icon = getPlatformIcon(dest.platform as any);
              return (
                <div
                  key={dest.id}
                  className="p-4 rounded-xl bg-white/[0.03] border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                      style={{ backgroundColor: `${meta.color}20` }}
                    >
                      <Icon className="w-5 h-5" style={{ color: meta.color }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{dest.name || meta.label}</p>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {dest.enabled ? "Enabled for Broadcast" : "Disabled"}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`w-2 h-2 rounded-full ${dest.enabled ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-zinc-600"}`}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-white/10 rounded-xl">
            <Radio className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">No stream destinations configured yet.</p>
            <p className="text-[11px] text-zinc-500 mt-0.5">
              Open the Studio to add your YouTube, Twitch, or Kick stream keys.
            </p>
            <button
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white transition-colors"
            >
              Add Destinations in Studio
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
