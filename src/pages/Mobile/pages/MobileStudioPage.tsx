import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Camera, RefreshCcw, Mic, MicOff, VideoOff, X, Radio,
  Sparkles, Type, Palette, Settings2, Share2,
  LayoutGrid
} from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { MobileCanvasContainer } from "../components/MobileCanvasContainer";
import { useMediaStore } from "@/stores/media.store";
import { useSceneStore } from "@/stores/scene.store";
import { useStreamStore } from "@/stores/stream.store";
import { useShallow } from "zustand/react/shallow";
import { StreamConfigurationModal } from "@/features/stream/ui/StreamConfigurationModal";

// ─── Tool Category Type ────────────────────────────────────────────
type ToolCategory = "none" | "captions" | "effects" | "filters" | "stream" | "layout";

type DrawerTab = "designs" | "captions" | "camera";

export const MobileStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("none");
  const [isRecording, setIsRecording] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<DrawerTab>("designs");
  const [showStreamConfig, setShowStreamConfig] = useState(false);

  // Global Store
  const isAudioOn = useMediaStore((s) => s.isAudioOn);
  const setAudioOn = useMediaStore((s) => s.setAudioOn);
  const isVideoOn = useMediaStore((s) => s.isVideoOn);
  const setVideoOn = useMediaStore((s) => s.setVideoOn);
  const setVideoDevices = useMediaStore((s) => s.setVideoDevices);
  const selectedVideoDevice = useMediaStore((s) => s.selectedVideoDevice);
  const setSelectedVideoDevice = useMediaStore((s) => s.setSelectedVideoDevice);

  const { destinations } = useStreamStore(useShallow((s) => ({
    destinations: s.destinations,
  })));

  const isVideoOff = !isVideoOn;
  const isMuted = !isAudioOn;
  const isLive = isStreaming || isRecording;

  const toggleMute = () => setAudioOn(!isAudioOn);
  const toggleVideo = () => setVideoOn(!isVideoOn);
  const flipCamera = () => toast.info("Camera flip coming soon");

  useEffect(() => {
    const bootstrapMobileCamera = async () => {
      if (!navigator.mediaDevices?.enumerateDevices || !navigator.mediaDevices?.getUserMedia) return;

      try {
        const probe = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        probe.getTracks().forEach((t) => t.stop());

        const devices = await navigator.mediaDevices.enumerateDevices();
        const cams = devices.filter((d) => d.kind === "videoinput");
        if (cams.length) {
          setVideoDevices(cams);
          if (!selectedVideoDevice) {
            setSelectedVideoDevice(cams[0].deviceId);
          }
          if (!isVideoOn) setVideoOn(true);
        }
      } catch (error) {
        console.warn("[MobileStudio] camera bootstrap failed", error);
      }
    };

    bootstrapMobileCamera();
  }, [isVideoOn, selectedVideoDevice, setSelectedVideoDevice, setVideoDevices, setVideoOn]);

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

  const getDrawerTabForCategory = (cat: ToolCategory): DrawerTab => {
    if (cat === "captions") return "captions";
    if (cat === "layout") return "designs";
    return "camera";
  };

  const handleSelectCategory = (cat: ToolCategory) => {
    const next = activeCategory === cat ? "none" : cat;
    setActiveCategory(next);
    if (next === "none") {
      setIsDrawerOpen(false);
      return;
    }

    setDrawerTab(getDrawerTabForCategory(cat));
    setIsDrawerOpen(true);

    if (cat === "stream") {
      setShowStreamConfig(true);
    }

    if (cat === "layout" && isVideoOff) {
      setVideoOn(true);
      toast.success("Camera enabled so Studio designs are visible");
    }
  };

  // ─── Tool Bar Items ─────────────────────────────────────────────
  const toolBarItems: { id: ToolCategory; icon: React.ElementType; label: string }[] = [
    { id: "captions", icon: Type, label: "Captions" },
    { id: "effects", icon: Sparkles, label: "Effects" },
    { id: "filters", icon: Palette, label: "Filters" },
    { id: "layout", icon: LayoutGrid, label: "Designs" },
    { id: "stream", icon: Radio, label: "Stream" },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col text-white overflow-hidden">

      {/* ── Canvas Background ────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <MobileCanvasContainer
          isDrawerOpen={isDrawerOpen}
          onDrawerOpenChange={setIsDrawerOpen}
          activeDrawerTab={drawerTab}
          onActiveDrawerTabChange={setDrawerTab}
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
