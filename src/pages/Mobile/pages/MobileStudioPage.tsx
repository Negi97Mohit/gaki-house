import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, RefreshCcw, Mic, MicOff, VideoOff, Camera,
  Radio, Type, Sparkles, Palette, LayoutGrid,
  Square, SplitSquareHorizontal, MoreHorizontal,
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { MobileCanvasContainer } from "../components/MobileCanvasContainer";
import { useMediaStore } from "@/stores/media.store";
import { useStreamStore } from "@/stores/stream.store";
import { useShallow } from "zustand/react/shallow";
import { useCaptionPresets } from "@/hooks/useCaptionPresets";
import { useFilters } from "@/hooks/useFilters";
import { StreamConfigurationModal } from "@/features/stream/ui/StreamConfigurationModal";
import { useRtmpStream } from "@/features/stream/hooks/useRtmpStream";
import { useCanvasStore } from "@/stores/canvas.store";
import { useSceneStore } from "@/stores/scene.store";
import { DYNAMIC_STYLE_OPTIONS } from "@/lib/dynamicCaptionStyles";

// ─── Types ─────────────────────────────────────────────────────────
type ToolCategory = "none" | "captions" | "effects" | "filters" | "layout";

const EFFECTS = [
  { id: "none", label: "None", emoji: "✖" },
  { id: "snow", label: "Snow", emoji: "❄️" },
  { id: "rain", label: "Rain", emoji: "🌧" },
  { id: "sparkles", label: "Sparkles", emoji: "✨" },
  { id: "bokeh", label: "Bokeh", emoji: "🔵" },
  { id: "neon-pulse", label: "Neon", emoji: "💜" },
];

const LAYOUTS = [
  { id: "solo", label: "Full", icon: Square },
  { id: "pip", label: "PiP", icon: () => (
    <div className="relative w-5 h-5">
      <div className="absolute inset-0 border border-current rounded-sm" />
      <div className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-current rounded-sm" />
    </div>
  )},
  { id: "split-vertical", label: "Side", icon: SplitSquareHorizontal },
  { id: "split-horizontal", label: "Stack", icon: () => (
    <div className="w-5 h-5 flex flex-col gap-0.5">
      <div className="flex-1 border border-current rounded-sm" />
      <div className="flex-1 border border-current rounded-sm" />
    </div>
  )},
] as const;

export const MobileStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("none");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showStreamConfig, setShowStreamConfig] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);

  // Stores
  const isAudioOn = useMediaStore((s) => s.isAudioOn);
  const setAudioOn = useMediaStore((s) => s.setAudioOn);
  const isVideoOn = useMediaStore((s) => s.isVideoOn);
  const setVideoOn = useMediaStore((s) => s.setVideoOn);
  const layoutMode = useCanvasStore((s) => s.layoutMode);
  const setLayoutMode = useCanvasStore((s) => s.setLayoutMode);

  // Scene store for applying filters/effects/captions
  const videoFilter = useSceneStore((s) => s.videoFilter);
  const setVideoFilter = useSceneStore((s) => s.setVideoFilter);
  const dynamicStyle = useSceneStore((s) => s.dynamicStyle);
  const setDynamicStyle = useSceneStore((s) => s.setDynamicStyle);
  const activeInteractiveFilter = useSceneStore((s) => s.activeInteractiveFilter);
  const setActiveInteractiveFilter = useSceneStore((s) => s.setActiveInteractiveFilter);

  const { destinations } = useStreamStore(useShallow((s) => ({
    destinations: s.destinations,
  })));

  // Firestore data
  const { captionPresets } = useCaptionPresets();
  const { filters: firestoreFilters } = useFilters();
  const rtmp = useRtmpStream();

  const isLive = rtmp.isStreaming || rtmp.isRecording;

  // Ensure solo mode on mount for mobile
  useEffect(() => {
    setLayoutMode("solo");
  }, []);

  // Close FAB on outside click
  useEffect(() => {
    if (!fabOpen) return;
    const handler = (e: TouchEvent | MouseEvent) => {
      if (fabRef.current && !fabRef.current.contains(e.target as Node)) {
        setFabOpen(false);
      }
    };
    document.addEventListener("touchstart", handler);
    document.addEventListener("mousedown", handler);
    return () => {
      document.removeEventListener("touchstart", handler);
      document.removeEventListener("mousedown", handler);
    };
  }, [fabOpen]);

  const requestMediaPermission = useCallback(async (kind: "audio" | "video") => {
    try {
      const tempStream = await navigator.mediaDevices.getUserMedia({
        audio: kind === "audio",
        video: kind === "video" ? { facingMode: "user" } : false,
      });
      tempStream.getTracks().forEach((track) => track.stop());
      return true;
    } catch {
      toast.error(`${kind === "audio" ? "Mic" : "Camera"} access denied`);
      return false;
    }
  }, []);

  const toggleMute = useCallback(async () => {
    if (!isAudioOn) {
      const granted = await requestMediaPermission("audio");
      if (!granted) return;
    }
    setAudioOn(!isAudioOn);
  }, [isAudioOn, requestMediaPermission, setAudioOn]);

  const toggleVideo = useCallback(async () => {
    if (!isVideoOn) {
      const granted = await requestMediaPermission("video");
      if (!granted) return;
    }
    setVideoOn(!isVideoOn);
  }, [isVideoOn, requestMediaPermission, setVideoOn]);

  const handleGoLive = async () => {
    if (rtmp.isStreaming || rtmp.isConnecting) {
      rtmp.stopStreaming();
      return;
    }
    const hasEnabled = destinations.some((d) => d.enabled);
    if (!hasEnabled) {
      setShowStreamConfig(true);
      return;
    }
    await rtmp.startStreaming();
  };

  const handleExit = () => {
    if (isLive && !window.confirm("Stop and exit?")) return;
    navigate("/m");
  };

  const toggleCategory = (cat: ToolCategory) => {
    setActiveCategory(prev => prev === cat ? "none" : cat);
  };

  const handleApplyLayout = (id: string) => {
    setLayoutMode(id as any);
  };

  const handleApplyFilter = (filterStyle: string) => {
    setVideoFilter(filterStyle);
  };

  const handleApplyEffect = (effectId: string) => {
    setActiveInteractiveFilter(effectId as any);
  };

  const handleApplyCaptionStyle = (styleId: string) => {
    setDynamicStyle(styleId);
  };

  // Build caption style list: combine Firestore presets + dynamic styles
  const captionStyles = [
    { id: "none", label: "None" },
    ...DYNAMIC_STYLE_OPTIONS.map(s => ({ id: s.id, label: s.name })),
    ...captionPresets.map(p => ({ id: p.id, label: p.name || p.id })),
  ];

  // Build filter list from Firestore
  const filterList = firestoreFilters.length > 0
    ? firestoreFilters
    : [
        { id: "none", name: "Original", style: "none" },
        { id: "grayscale", name: "B&W", style: "grayscale(1)" },
        { id: "sepia", name: "Warm", style: "sepia(1)" },
        { id: "saturate", name: "Vivid", style: "saturate(2)" },
        { id: "contrast", name: "Pop", style: "contrast(1.5)" },
      ];

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col overflow-hidden" style={{ height: '100dvh' }}>

      {/* ── Full-Screen Canvas ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <MobileCanvasContainer
          isDrawerOpen={isDrawerOpen}
          onDrawerOpenChange={setIsDrawerOpen}
          layoutManager={{
            handleCanvasPresetSelect: () => {},
            handleSaveCanvasPreset: () => {},
            handleDeleteCanvasPreset: () => {},
            shareCanvasPreset: () => {},
            unshareCanvasPreset: () => {},
            customPresets: [],
            publicPresets: [],
            isLoadingPublic: false,
          }}
          vaultFiles={[]}
          onAddVaultFiles={() => {}}
          onRemoveVaultFile={() => {}}
          onClearVault={() => {}}
        />
      </div>

      {/* ── Camera Off Overlay ─────────────────────────────────────── */}
      {!isVideoOn && (
        <div className="absolute inset-0 z-[5] bg-black/90 flex flex-col items-center justify-center gap-3">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center">
            <VideoOff className="w-8 h-8 text-white/30" />
          </div>
          <p className="text-white/40 text-sm font-medium">Camera is off</p>
          <button
            onClick={toggleVideo}
            className="mt-2 px-6 py-2.5 bg-white/10 rounded-full text-sm font-semibold text-white active:scale-95 transition-transform"
          >
            Turn on camera
          </button>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════
          TOP BAR — Live badge only
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
        <div /> {/* spacer */}

        {/* Live badge */}
        {isLive && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-white",
            rtmp.isStreaming
              ? "bg-red-500 animate-pulse"
              : "bg-red-500/80"
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[11px] font-bold tracking-wider">
              {rtmp.isStreaming ? "LIVE" : "REC"}
            </span>
          </div>
        )}

        <div /> {/* spacer */}
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FAB — Expandable controls (close, flip, cam, mic)
      ══════════════════════════════════════════════════════════════ */}
      <div ref={fabRef} className="absolute top-[max(env(safe-area-inset-top),12px)] right-3 z-30 flex flex-col items-center gap-2">
        {/* Main FAB toggle */}
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
            fabOpen ? "bg-white/20 backdrop-blur-xl rotate-90" : "bg-black/40 backdrop-blur"
          )}
        >
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>

        {/* Expanded buttons */}
        {fabOpen && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            {/* Close */}
            <button
              onClick={handleExit}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
            >
              <X className="w-4.5 h-4.5 text-white" />
            </button>

            {/* Flip camera */}
            <button
              onClick={() => toast.info("Flip coming soon")}
              className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90 transition-transform"
            >
              <RefreshCcw className="w-4 h-4 text-white" />
            </button>

            {/* Camera toggle */}
            <button
              onClick={toggleVideo}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all",
                !isVideoOn ? "bg-red-500/80" : "bg-black/50 backdrop-blur"
              )}
            >
              {isVideoOn ? <Camera className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
            </button>

            {/* Mic toggle */}
            <button
              onClick={toggleMute}
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all",
                !isAudioOn ? "bg-red-500/80" : "bg-black/50 backdrop-blur"
              )}
            >
              {isAudioOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
            </button>
          </div>
        )}
      </div>

      {/* SPACER */}
      <div className="flex-1" />

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM — Tool Tray + Actions
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 flex flex-col">

        {/* ── Expanded Tool Panel (transparent overlay) ────────────── */}
        {activeCategory !== "none" && (
          <div className="px-3 pb-2 animate-in slide-in-from-bottom-3 duration-200">

            {/* LAYOUT */}
            {activeCategory === "layout" && (
              <div className="flex gap-3 overflow-x-auto py-3 px-1 no-scrollbar">
                {LAYOUTS.map((l) => {
                  const active = layoutMode === l.id;
                  const Icon = l.icon;
                  return (
                    <button
                      key={l.id}
                      onClick={() => handleApplyLayout(l.id)}
                      className="shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-all"
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all border",
                        active
                          ? "bg-white text-black shadow-lg shadow-white/20 border-white"
                          : "bg-white/10 text-white/70 backdrop-blur border-white/10"
                      )}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={cn(
                        "text-[10px] font-semibold",
                        active ? "text-white" : "text-white/50"
                      )}>{l.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* CAPTIONS — from Firestore + dynamic styles */}
            {activeCategory === "captions" && (
              <div className="flex gap-3 overflow-x-auto py-3 px-1 no-scrollbar">
                {captionStyles.map((s) => {
                  const active = dynamicStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleApplyCaptionStyle(s.id)}
                      className="shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-all"
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all border overflow-hidden",
                        active
                          ? "bg-white text-black shadow-lg shadow-white/20 border-white"
                          : "bg-white/10 text-white/70 backdrop-blur border-white/10"
                      )}>
                        <span className={cn(
                          "text-[10px] font-bold text-center leading-tight px-1",
                          active ? "text-black" : "text-white/80"
                        )}>
                          {s.id === "none" ? "OFF" : s.label.slice(0, 8)}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[9px] font-semibold max-w-[60px] truncate text-center",
                        active ? "text-white" : "text-white/50"
                      )}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* EFFECTS */}
            {activeCategory === "effects" && (
              <div className="flex gap-3 overflow-x-auto py-3 px-1 no-scrollbar">
                {EFFECTS.map((fx) => {
                  const active = activeInteractiveFilter === fx.id;
                  return (
                    <button
                      key={fx.id}
                      onClick={() => handleApplyEffect(fx.id)}
                      className="shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-all"
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all border",
                        active
                          ? "bg-white text-black shadow-lg shadow-white/20 border-white"
                          : "bg-white/10 text-white/70 backdrop-blur border-white/10"
                      )}>
                        <span className="text-xl">{fx.emoji}</span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-semibold",
                        active ? "text-white" : "text-white/50"
                      )}>{fx.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* FILTERS — from Firestore */}
            {activeCategory === "filters" && (
              <div className="flex gap-3 overflow-x-auto py-3 px-1 no-scrollbar">
                {filterList.map((f) => {
                  const active = videoFilter === f.style;
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleApplyFilter(f.style)}
                      className="shrink-0 flex flex-col items-center gap-2 active:scale-95 transition-all"
                    >
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all border relative overflow-hidden",
                        active
                          ? "ring-2 ring-white shadow-lg shadow-white/20 border-white"
                          : "bg-white/10 border-white/10 backdrop-blur"
                      )}>
                        {/* Filter preview swatch */}
                        <div
                          className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30"
                          style={{ filter: f.style !== "none" ? f.style : undefined }}
                        />
                        <span className={cn(
                          "relative text-[10px] font-bold z-10",
                          active ? "text-white" : "text-white/80"
                        )}>
                          {f.name.slice(0, 4)}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[10px] font-semibold",
                        active ? "text-white" : "text-white/50"
                      )}>{f.name}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Tool Category Bar ────────────────────────────────────── */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 pb-3 no-scrollbar">
          {([
            { id: "layout" as ToolCategory, icon: LayoutGrid, label: "Layout" },
            { id: "captions" as ToolCategory, icon: Type, label: "Captions" },
            { id: "effects" as ToolCategory, icon: Sparkles, label: "Effects" },
            { id: "filters" as ToolCategory, icon: Palette, label: "Filters" },
          ]).map((item) => {
            const active = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => toggleCategory(item.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-semibold transition-all active:scale-95",
                  active
                    ? "bg-white text-black"
                    : "bg-white/8 text-white/60"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* ── Action Buttons Row ───────────────────────────────────── */}
        <div className="flex items-end justify-center gap-8 pb-2">
          {/* Record */}
          <button onClick={rtmp.toggleRecording} className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-12 h-12 rounded-full border-[2.5px] flex items-center justify-center transition-all active:scale-90",
              rtmp.isRecording ? "border-red-400" : "border-white/40"
            )}>
              <div className={cn(
                "bg-red-500 transition-all",
                rtmp.isRecording ? "w-5 h-5 rounded-sm" : "w-8 h-8 rounded-full"
              )} />
            </div>
            <span className="text-[9px] text-white/50 font-medium">Record</span>
          </button>

          {/* Go Live — Hero button */}
          <button
            onClick={handleGoLive}
            disabled={rtmp.isConnecting}
            className="flex flex-col items-center gap-1"
          >
            <div className={cn(
              "w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl",
              rtmp.isConnecting
                ? "bg-yellow-500 shadow-yellow-500/30"
                : rtmp.isStreaming
                  ? "bg-red-500 shadow-red-500/30"
                  : "bg-white shadow-white/20"
            )}>
              {rtmp.isStreaming ? (
                <Square className="w-7 h-7 text-white fill-white" />
              ) : (
                <Radio className={cn(
                  "w-7 h-7",
                  rtmp.isConnecting ? "text-white" : "text-black"
                )} />
              )}
            </div>
            <span className={cn(
              "text-[9px] font-bold",
              rtmp.isStreaming ? "text-red-400" : "text-white/60"
            )}>
              {rtmp.isConnecting ? "Connecting" : rtmp.isStreaming ? "End Live" : "Go Live"}
            </span>
          </button>

          {/* Stream Config */}
          <button
            onClick={() => setShowStreamConfig(true)}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-12 h-12 rounded-full border-[2.5px] border-white/20 flex items-center justify-center active:scale-90 transition-transform">
              <Radio className="w-5 h-5 text-white/60" />
            </div>
            <span className="text-[9px] text-white/50 font-medium">Setup</span>
          </button>
        </div>

        {/* Safe area */}
        <div className="h-[max(env(safe-area-inset-bottom),8px)]" />
      </div>

      {/* ── Stream Config Modal ────────────────────────────────────── */}
      <StreamConfigurationModal
        externalOpen={showStreamConfig}
        onOpenChange={setShowStreamConfig}
        onStartStream={async () => {
          setShowStreamConfig(false);
          await rtmp.startStreaming();
        }}
        onStopStream={() => rtmp.stopStreaming()}
      />

      {/* Hide scrollbar utility */}
      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { scrollbar-width: none; }`}</style>
    </div>
  );
};
