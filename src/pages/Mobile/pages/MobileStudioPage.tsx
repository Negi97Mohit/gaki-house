import React, { useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera, RefreshCcw, Mic, MicOff, VideoOff, X, Radio,
  Sparkles, Type, Palette, Settings2, Zap, Share2,
  ChevronUp, Eye, EyeOff, Music, Image as ImageIcon,
  LayoutGrid, Wand2, MessageSquare, Circle
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { MobileCanvasContainer } from "../components/MobileCanvasContainer";
import { useMediaStore } from "@/stores/media.store";
import { useSceneStore } from "@/stores/scene.store";
import { useStreamStore } from "@/stores/stream.store";
import { useShallow } from "zustand/react/shallow";
import { ScrollArea, ScrollBar } from "@/shared/ui/scroll-area";
import { DYNAMIC_STYLE_OPTIONS } from "@/lib/dynamicCaptionStyles";
import { useCaptionPresets } from "@/hooks/useCaptionPresets";
import { StreamConfigurationModal } from "@/features/stream/ui/StreamConfigurationModal";

// ─── Tool Category Type ────────────────────────────────────────────
type ToolCategory = "none" | "captions" | "effects" | "filters" | "stream" | "layout";

// ─── Caption Animation Previews ────────────────────────────────────
const CAPTION_ANIMATION_PREVIEWS = DYNAMIC_STYLE_OPTIONS.map(s => ({
  id: s.id,
  label: s.name,
}));

// ─── Quick Filters ─────────────────────────────────────────────────
const QUICK_FILTERS = [
  { id: "none", label: "Normal", emoji: "☀️" },
  { id: "grayscale", label: "B&W", emoji: "🖤" },
  { id: "sepia", label: "Warm", emoji: "🌅" },
  { id: "vintage", label: "Vintage", emoji: "📷" },
  { id: "cool", label: "Cool", emoji: "❄️" },
  { id: "vivid", label: "Vivid", emoji: "🌈" },
  { id: "noir", label: "Noir", emoji: "🎬" },
  { id: "dreamy", label: "Dreamy", emoji: "✨" },
];

export const MobileStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("none");
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showStreamConfig, setShowStreamConfig] = useState(false);
  const [selectedCaptionAnimation, setSelectedCaptionAnimation] = useState("none");

  // Global Store
  const isAudioOn = useMediaStore((s) => s.isAudioOn);
  const setAudioOn = useMediaStore((s) => s.setAudioOn);
  const isVideoOn = useMediaStore((s) => s.isVideoOn);
  const setVideoOn = useMediaStore((s) => s.setVideoOn);

  const { destinations } = useStreamStore(useShallow((s) => ({
    destinations: s.destinations,
  })));

  const { captionPresets } = useCaptionPresets();

  const isVideoOff = !isVideoOn;
  const isMuted = !isAudioOn;
  const isLive = isStreaming || isRecording;

  const toggleMute = () => setAudioOn(!isAudioOn);
  const toggleVideo = () => setVideoOn(!isVideoOn);
  const flipCamera = () => toast.info("Camera flip coming soon");

  const handleGoLive = () => {
    if (isStreaming) {
      setIsStreaming(false);
      toast.info("Stream ended");
    } else if (destinations.length === 0) {
      setShowStreamConfig(true);
    } else {
      setIsStreaming(true);
      toast.success("You're live!");
    }
  };

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.success("Recording saved!");
    } else {
      setIsRecording(true);
      toast.success("Recording started");
    }
  };

  const handleExit = () => {
    if (isLive) {
      const msg = isRecording ? "recording" : "streaming";
      if (!window.confirm(`Stop ${msg} and exit?`)) return;
    }
    navigate("/m");
  };

  const handleSelectCategory = (cat: ToolCategory) => {
    setActiveCategory(prev => prev === cat ? "none" : cat);
  };

  // ─── Tool Bar Items ─────────────────────────────────────────────
  const toolBarItems: { id: ToolCategory; icon: React.ElementType; label: string }[] = [
    { id: "captions", icon: Type, label: "Captions" },
    { id: "effects", icon: Sparkles, label: "Effects" },
    { id: "filters", icon: Palette, label: "Filters" },
    { id: "layout", icon: LayoutGrid, label: "Layout" },
    { id: "stream", icon: Radio, label: "Stream" },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col text-white overflow-hidden">

      {/* ── Canvas Background ────────────────────────────────────── */}
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

      {/* ── Video Off Placeholder ────────────────────────────────── */}
      <div className={cn(
        "absolute inset-0 z-[5] bg-zinc-900 flex flex-col items-center justify-center transition-opacity duration-300",
        !isVideoOff && "opacity-0 pointer-events-none"
      )}>
        <Camera className="w-16 h-16 text-zinc-700 mb-4" />
        <p className="text-zinc-500 font-medium">Camera is off</p>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TOP BAR — Close, Live Badge, Side Actions
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 flex items-start justify-between px-4 pt-[env(safe-area-inset-top,12px)] pb-2 bg-gradient-to-b from-black/70 to-transparent">
        {/* Close */}
        <button onClick={handleExit} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform mt-2">
          <X className="w-5 h-5" />
        </button>

        {/* Live / Rec badge */}
        {isLive && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md mt-2 shadow-lg",
            isStreaming ? "bg-red-600/90 shadow-red-500/30 animate-pulse" : "bg-red-600/80"
          )}>
            {isStreaming ? <Radio className="w-3.5 h-3.5" /> : <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
            <span className="text-xs font-bold tracking-wider uppercase">{isStreaming ? "LIVE" : "REC"}</span>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex flex-col gap-3 mt-2">
          <button onClick={flipCamera} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
            <RefreshCcw className="w-5 h-5" />
          </button>
          <button onClick={toggleMute} className={cn("w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform", isMuted ? "bg-red-500/60" : "bg-black/50")}>
            {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <button onClick={toggleVideo} className={cn("w-10 h-10 rounded-full backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform", isVideoOff ? "bg-red-500/60" : "bg-black/50")}>
            {isVideoOff ? <VideoOff className="w-5 h-5" /> : <Camera className="w-5 h-5" />}
          </button>
          <button onClick={() => setIsDrawerOpen(true)} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center active:scale-90 transition-transform">
            <Settings2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* SPACER — pushes bottom content down */}
      <div className="flex-1" />

      {/* ══════════════════════════════════════════════════════════════
          BOTTOM AREA — Tool Tray + Action Buttons
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 flex flex-col bg-gradient-to-t from-black/90 via-black/60 to-transparent">

        {/* ── Expanded Tool Panel (Instagram-style horizontal scroll) ─ */}
        {activeCategory !== "none" && (
          <div className="px-2 pb-3 animate-in slide-in-from-bottom-4 duration-200">
            <div className="bg-black/60 backdrop-blur-xl rounded-2xl border border-white/10 p-3">
              {/* CAPTIONS */}
              {activeCategory === "captions" && (
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/50 font-semibold px-1">Caption Animation</p>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {CAPTION_ANIMATION_PREVIEWS.map((anim) => (
                      <button
                        key={anim.id}
                        onClick={() => setSelectedCaptionAnimation(anim.id)}
                        className={cn(
                          "shrink-0 px-4 py-2.5 rounded-full text-xs font-semibold transition-all active:scale-95 border",
                          selectedCaptionAnimation === anim.id
                            ? "bg-white text-black border-white shadow-lg shadow-white/20"
                            : "bg-white/10 text-white/80 border-white/10 hover:bg-white/20"
                        )}
                      >
                        {anim.label}
                      </button>
                    ))}
                  </div>

                  {/* Caption Style Presets */}
                  {captionPresets.length > 0 && (
                    <>
                      <p className="text-[11px] uppercase tracking-widest text-white/50 font-semibold px-1 mt-2">Style Presets</p>
                      <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                        {captionPresets.slice(0, 12).map((preset) => (
                          <button
                            key={preset.id}
                            className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                          >
                            <div
                              className="w-16 h-10 rounded-xl flex items-center justify-center text-[10px] font-bold border border-white/10"
                              style={{
                                fontFamily: preset.style?.fontFamily || 'sans-serif',
                                color: preset.style?.color || '#fff',
                                backgroundColor: preset.style?.backgroundColor || 'rgba(0,0,0,0.5)',
                              }}
                            >
                              Abc
                            </div>
                            <span className="text-[9px] text-white/60 max-w-[64px] truncate">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* EFFECTS */}
              {activeCategory === "effects" && (
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/50 font-semibold px-1">Scene Effects</p>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {[
                      { id: "none", label: "None", emoji: "🚫" },
                      { id: "snow", label: "Snow", emoji: "❄️" },
                      { id: "rain", label: "Rain", emoji: "🌧️" },
                      { id: "fire", label: "Fire", emoji: "🔥" },
                      { id: "sparkles", label: "Sparkles", emoji: "✨" },
                      { id: "neon-pulse", label: "Neon", emoji: "💜" },
                      { id: "bokeh", label: "Bokeh", emoji: "🔮" },
                      { id: "dust", label: "Dust", emoji: "🌫️" },
                    ].map((fx) => (
                      <button
                        key={fx.id}
                        className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/20 transition-colors">
                          {fx.emoji}
                        </div>
                        <span className="text-[10px] text-white/70 font-medium">{fx.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* FILTERS */}
              {activeCategory === "filters" && (
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/50 font-semibold px-1">Camera Filters</p>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {QUICK_FILTERS.map((f) => (
                      <button
                        key={f.id}
                        className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/20 transition-colors">
                          {f.emoji}
                        </div>
                        <span className="text-[10px] text-white/70 font-medium">{f.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* LAYOUT */}
              {activeCategory === "layout" && (
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/50 font-semibold px-1">Canvas Layouts</p>
                  <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                    {[
                      { id: "solo", label: "Solo", icon: "📹" },
                      { id: "pip", label: "PiP", icon: "🖼️" },
                      { id: "split", label: "Split", icon: "◻️" },
                      { id: "grid", label: "Grid", icon: "⊞" },
                    ].map((l) => (
                      <button
                        key={l.id}
                        className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-transform"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center text-2xl hover:bg-white/20 transition-colors">
                          {l.icon}
                        </div>
                        <span className="text-[10px] text-white/70 font-medium">{l.label}</span>
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setIsDrawerOpen(true)}
                    className="w-full py-2 rounded-xl bg-white/10 text-xs text-white/70 font-medium hover:bg-white/15 transition-colors"
                  >
                    More Layouts & Designs →
                  </button>
                </div>
              )}

              {/* STREAM */}
              {activeCategory === "stream" && (
                <div className="space-y-3">
                  <p className="text-[11px] uppercase tracking-widest text-white/50 font-semibold px-1">Stream Destinations</p>
                  {destinations.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-white/50 mb-3">No destinations configured</p>
                      <button
                        onClick={() => setShowStreamConfig(true)}
                        className="px-5 py-2.5 bg-primary rounded-full text-sm font-bold text-primary-foreground active:scale-95 transition-transform"
                      >
                        + Add Platform
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
                      {destinations.map((dest) => (
                        <div key={dest.id} className="shrink-0 flex flex-col items-center gap-1.5">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl border flex items-center justify-center transition-colors",
                            dest.enabled ? "bg-green-500/20 border-green-500/40" : "bg-white/10 border-white/10"
                          )}>
                            <Radio className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] text-white/70 font-medium max-w-[56px] truncate">{dest.platform}</span>
                        </div>
                      ))}
                      <button
                        onClick={() => setShowStreamConfig(true)}
                        className="shrink-0 flex flex-col items-center gap-1.5"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-dashed border-white/20 flex items-center justify-center hover:bg-white/10 transition-colors">
                          <span className="text-xl">+</span>
                        </div>
                        <span className="text-[10px] text-white/50 font-medium">Add</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Horizontal Tool Category Bar (Instagram-style) ──────── */}
        <div className="flex gap-1 overflow-x-auto px-3 pb-3" style={{ scrollbarWidth: 'none' }}>
          {toolBarItems.map((item) => {
            const active = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectCategory(item.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95 border",
                  active
                    ? "bg-white text-black border-white shadow-lg shadow-white/10"
                    : "bg-white/10 text-white/70 border-white/5 hover:bg-white/15"
                )}
              >
                <item.icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* ── Action Buttons Row ──────────────────────────────────── */}
        <div className="flex items-center justify-center gap-6 pb-3">
          {/* Record Button */}
          <button
            onClick={handleRecord}
            className="flex flex-col items-center gap-1"
          >
            <div className={cn(
              "w-14 h-14 rounded-full border-[3px] flex items-center justify-center transition-all active:scale-90",
              isRecording ? "border-red-500" : "border-white/50"
            )}>
              <div className={cn(
                "bg-red-500 transition-all",
                isRecording ? "w-6 h-6 rounded-md" : "w-10 h-10 rounded-full"
              )} />
            </div>
            <span className="text-[10px] text-white/60 font-medium">Record</span>
          </button>

          {/* Go Live Button */}
          <button
            onClick={handleGoLive}
            className="flex flex-col items-center gap-1"
          >
            <div className={cn(
              "w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl",
              isStreaming
                ? "bg-red-600 shadow-red-500/40 border-4 border-red-400"
                : "bg-gradient-to-br from-primary to-primary/70 shadow-primary/30 border-4 border-white/20"
            )}>
              {isStreaming ? (
                <div className="w-7 h-7 rounded-md bg-white" />
              ) : (
                <Radio className="w-8 h-8 text-primary-foreground" />
              )}
            </div>
            <span className={cn(
              "text-[10px] font-bold",
              isStreaming ? "text-red-400" : "text-white/80"
            )}>
              {isStreaming ? "End Live" : "Go Live"}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={() => toast.info("Share coming soon")}
            className="flex flex-col items-center gap-1"
          >
            <div className="w-14 h-14 rounded-full border-[3px] border-white/30 flex items-center justify-center active:scale-90 transition-transform">
              <Share2 className="w-6 h-6 text-white/70" />
            </div>
            <span className="text-[10px] text-white/60 font-medium">Share</span>
          </button>
        </div>

        {/* Safe area spacer */}
        <div className="h-[env(safe-area-inset-bottom,8px)]" />
      </div>

      {/* ── Stream Configuration Modal ───────────────────────────── */}
      <StreamConfigurationModal
        externalOpen={showStreamConfig}
        onOpenChange={setShowStreamConfig}
        onStartStream={() => {
          setShowStreamConfig(false);
          setIsStreaming(true);
        }}
        onStopStream={() => setIsStreaming(false)}
      />
    </div>
  );
};
