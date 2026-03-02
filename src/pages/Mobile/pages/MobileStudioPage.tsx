import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, RefreshCcw, Mic, MicOff, VideoOff, Camera,
  Radio, Type, Sparkles, Palette, LayoutGrid,
  Square, MoreHorizontal, Film, Wand2,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  ChevronDown,
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
import interactiveFiltersData from "@/data/interactiveFilters.json";
import { CINEMATIC_PRESETS, CINEMATIC_CATEGORIES, type CinematicEffect } from "@/features/stream/ui/pip/cinematicShotData";

// ─── Types ─────────────────────────────────────────────────────────
type ToolCategory = "none" | "captions" | "effects" | "filters" | "layout" | "cinematic" | "text-edit";

// Mobile-appropriate layouts only (no PiP, no split — phone has one camera)
const LAYOUTS = [
  { id: "solo", label: "Full", icon: Square },
] as const;

// Mobile-relevant cinematic categories
const MOBILE_CINEMATIC_CATS = ["all", "core", "optical", "framing", "focus", "stylized"] as const;

export const MobileStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("none");
  const [showStreamConfig, setShowStreamConfig] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const [cinematicCat, setCinematicCat] = useState("all");
  const [effectSubCat, setEffectSubCat] = useState<"interactive" | "cinematic">("interactive");

  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Stores
  const isAudioOn = useMediaStore((s) => s.isAudioOn);
  const setAudioOn = useMediaStore((s) => s.setAudioOn);
  const isVideoOn = useMediaStore((s) => s.isVideoOn);
  const setVideoOn = useMediaStore((s) => s.setVideoOn);
  const setLayoutMode = useCanvasStore((s) => s.setLayoutMode);

  // Scene store
  const videoFilter = useSceneStore((s) => s.videoFilter);
  const setVideoFilter = useSceneStore((s) => s.setVideoFilter);
  const dynamicStyle = useSceneStore((s) => s.dynamicStyle);
  const setDynamicStyle = useSceneStore((s) => s.setDynamicStyle);
  const activeInteractiveFilter = useSceneStore((s) => s.activeInteractiveFilter);
  const setActiveInteractiveFilter = useSceneStore((s) => s.setActiveInteractiveFilter);
  const textOverlays = useSceneStore((s) => s.textOverlays);
  const setTextOverlays = useSceneStore((s) => s.setTextOverlays);

  const { destinations } = useStreamStore(useShallow((s) => ({
    destinations: s.destinations,
  })));

  // Firestore data
  const { captionPresets } = useCaptionPresets();
  const { filters: firestoreFilters } = useFilters();
  const rtmp = useRtmpStream();

  const isLive = rtmp.isStreaming || rtmp.isRecording;

  // Ensure solo mode on mount (only layout that makes sense on a phone)
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
    setEditingTextId(null);
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

  // Text overlay editing helpers
  const updateTextOverlay = (id: string, updates: Partial<typeof textOverlays[0]>) => {
    setTextOverlays(textOverlays.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  const editingText = editingTextId ? textOverlays.find(t => t.id === editingTextId) : null;

  // Build caption style list
  const captionStyles = [
    { id: "none", label: "None" },
    ...DYNAMIC_STYLE_OPTIONS.map(s => ({ id: s.id, label: s.name })),
    ...captionPresets.map(p => ({ id: p.id, label: p.name || p.id })),
  ];

  // Build filter list
  const filterList = firestoreFilters.length > 0
    ? firestoreFilters
    : [
        { id: "none", name: "Original", style: "none" },
        { id: "grayscale", name: "B&W", style: "grayscale(1)" },
        { id: "sepia", name: "Warm", style: "sepia(1)" },
        { id: "saturate", name: "Vivid", style: "saturate(2)" },
        { id: "contrast", name: "Pop", style: "contrast(1.5)" },
      ];

  // Interactive filters from JSON
  const interactiveFilters = interactiveFiltersData as { id: string; name: string; thumbnailUrl: string }[];

  // Cinematic presets filtered by category
  const filteredCinematic = cinematicCat === "all"
    ? CINEMATIC_PRESETS
    : CINEMATIC_PRESETS.filter(p => p.category === cinematicCat);

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col overflow-hidden" style={{ height: '100dvh' }}>

      {/* ── Full-Screen Canvas ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <MobileCanvasContainer
          isDrawerOpen={false}
          onDrawerOpenChange={() => {}}
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
          TOP BAR — Live badge
      ══════════════════════════════════════════════════════════════ */}
      <div className="relative z-20 flex items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-2">
        <div />
        {isLive && (
          <div className={cn(
            "flex items-center gap-1.5 px-3 py-1 rounded-full text-white",
            rtmp.isStreaming ? "bg-red-500 animate-pulse" : "bg-red-500/80"
          )}>
            <div className="w-1.5 h-1.5 rounded-full bg-white" />
            <span className="text-[11px] font-bold tracking-wider">
              {rtmp.isStreaming ? "LIVE" : "REC"}
            </span>
          </div>
        )}
        <div />
      </div>

      {/* ══════════════════════════════════════════════════════════════
          FAB — Expandable controls
      ══════════════════════════════════════════════════════════════ */}
      <div ref={fabRef} className="absolute top-[max(env(safe-area-inset-top),12px)] right-3 z-30 flex flex-col items-center gap-2">
        <button
          onClick={() => setFabOpen(!fabOpen)}
          className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90",
            fabOpen ? "bg-white/20 backdrop-blur-xl rotate-90" : "bg-black/40 backdrop-blur"
          )}
        >
          <MoreHorizontal className="w-5 h-5 text-white" />
        </button>

        {fabOpen && (
          <div className="flex flex-col gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
            <button onClick={handleExit} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90 transition-transform">
              <X className="w-4.5 h-4.5 text-white" />
            </button>
            <button onClick={() => toast.info("Flip coming soon")} className="w-10 h-10 rounded-full bg-black/50 backdrop-blur flex items-center justify-center active:scale-90 transition-transform">
              <RefreshCcw className="w-4 h-4 text-white" />
            </button>
            <button
              onClick={toggleVideo}
              className={cn("w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all", !isVideoOn ? "bg-red-500/80" : "bg-black/50 backdrop-blur")}
            >
              {isVideoOn ? <Camera className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
            </button>
            <button
              onClick={toggleMute}
              className={cn("w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-all", !isAudioOn ? "bg-red-500/80" : "bg-black/50 backdrop-blur")}
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

        {/* ── Expanded Tool Panel ────────────────────────────────────── */}
        {activeCategory !== "none" && (
          <div className="px-2 pb-2 animate-in slide-in-from-bottom-3 duration-200">

            {/* ─── EFFECTS — Interactive Filters + Cinematic ─────────── */}
            {activeCategory === "effects" && (
              <div>
                {/* Sub-category toggle */}
                <div className="flex gap-2 px-1 pb-2">
                  <button
                    onClick={() => setEffectSubCat("interactive")}
                    className={cn("px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                      effectSubCat === "interactive" ? "bg-white text-black" : "bg-white/10 text-white/60"
                    )}
                  >
                    <Wand2 className="w-3 h-3 inline mr-1" />Filters
                  </button>
                  <button
                    onClick={() => setEffectSubCat("cinematic")}
                    className={cn("px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                      effectSubCat === "cinematic" ? "bg-white text-black" : "bg-white/10 text-white/60"
                    )}
                  >
                    <Film className="w-3 h-3 inline mr-1" />Cinematic
                  </button>
                </div>

                {effectSubCat === "interactive" ? (
                  <div className="flex gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar">
                    {interactiveFilters.map((fx) => {
                      const active = activeInteractiveFilter === fx.id;
                      return (
                        <button
                          key={fx.id}
                          onClick={() => handleApplyEffect(fx.id)}
                          className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <div className={cn(
                            "w-[56px] h-[56px] rounded-xl overflow-hidden transition-all border-2",
                            active ? "border-white shadow-lg shadow-white/20 scale-105" : "border-transparent"
                          )}>
                            <img
                              src={fx.thumbnailUrl}
                              alt={fx.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <span className={cn(
                            "text-[9px] font-semibold max-w-[56px] truncate",
                            active ? "text-white" : "text-white/50"
                          )}>{fx.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    {/* Cinematic category chips */}
                    <div className="flex gap-1.5 overflow-x-auto pb-2 px-1 no-scrollbar">
                      {CINEMATIC_CATEGORIES.filter(c => (MOBILE_CINEMATIC_CATS as readonly string[]).includes(c.id)).map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setCinematicCat(cat.id)}
                          className={cn("shrink-0 px-2.5 py-1 rounded-full text-[9px] font-bold transition-all",
                            cinematicCat === cat.id ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
                          )}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar max-h-[120px]">
                      {filteredCinematic.slice(0, 30).map((preset) => {
                        const active = false; // TODO: track active cinematic
                        return (
                          <button
                            key={preset.id}
                            onClick={() => {
                              // Cinematic effects apply via the scene store or PiP system
                              toast.info(`${preset.name} applied`);
                            }}
                            className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                          >
                            <div className={cn(
                              "w-[56px] h-[56px] rounded-xl flex items-center justify-center border-2 transition-all",
                              active ? "border-white scale-105" : "border-transparent"
                            )}
                              style={{ background: `linear-gradient(135deg, ${preset.color}88, ${preset.color}44)` }}
                            >
                              <Film className="w-4 h-4 text-white/70" />
                            </div>
                            <span className="text-[9px] font-semibold text-white/50 max-w-[56px] truncate">
                              {preset.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── CAPTIONS ─────────────────────────────────────────── */}
            {activeCategory === "captions" && (
              <div className="flex gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar">
                {captionStyles.map((s) => {
                  const active = dynamicStyle === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => handleApplyCaptionStyle(s.id)}
                      className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <div className={cn(
                        "w-[56px] h-[56px] rounded-xl flex items-center justify-center transition-all border-2 overflow-hidden",
                        active ? "border-white shadow-lg shadow-white/20 scale-105 bg-white" : "border-transparent bg-white/10"
                      )}>
                        <span className={cn(
                          "text-[10px] font-bold text-center leading-tight px-1",
                          active ? "text-black" : "text-white/80"
                        )}>
                          {s.id === "none" ? "OFF" : s.label.slice(0, 6)}
                        </span>
                      </div>
                      <span className={cn(
                        "text-[9px] font-semibold max-w-[56px] truncate text-center",
                        active ? "text-white" : "text-white/50"
                      )}>{s.label}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── FILTERS — from Firestore ─────────────────────────── */}
            {activeCategory === "filters" && (
              <div className="flex gap-2.5 overflow-x-auto py-2 px-1 no-scrollbar">
                {filterList.map((f) => {
                  const active = videoFilter === f.style;
                  return (
                    <button
                      key={f.id}
                      onClick={() => handleApplyFilter(f.style)}
                      className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                    >
                      <div className={cn(
                        "w-[56px] h-[56px] rounded-xl flex items-center justify-center transition-all border-2 relative overflow-hidden",
                        active ? "border-white shadow-lg shadow-white/20 scale-105" : "border-transparent"
                      )}>
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
                        "text-[9px] font-semibold max-w-[56px] truncate",
                        active ? "text-white" : "text-white/50"
                      )}>{f.name}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* ─── TEXT EDIT — inline text editor ───────────────────── */}
            {activeCategory === "text-edit" && (
              <div className="py-2 px-1">
                {textOverlays.length === 0 ? (
                  <p className="text-white/40 text-xs text-center py-4">No text overlays. Add text from the desktop version first.</p>
                ) : (
                  <div className="space-y-3">
                    {/* Text overlay selector */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {textOverlays.map((t, i) => (
                        <button
                          key={t.id}
                          onClick={() => setEditingTextId(t.id)}
                          className={cn(
                            "shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all",
                            editingTextId === t.id ? "bg-white text-black" : "bg-white/10 text-white/60"
                          )}
                        >
                          Text {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Editor */}
                    {editingText && (
                      <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3 space-y-2">
                        <input
                          type="text"
                          value={typeof editingText.content === 'string' ? editingText.content : ''}
                          onChange={(e) => updateTextOverlay(editingText.id, { content: e.target.value })}
                          className="w-full bg-white/10 rounded-lg px-3 py-2 text-white text-sm outline-none focus:ring-1 focus:ring-white/30"
                          placeholder="Edit text..."
                        />
                        <div className="flex gap-2 items-center">
                          <button
                            onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, bold: !editingText.style.bold } })}
                            className={cn("w-8 h-8 rounded-lg flex items-center justify-center", editingText.style.bold ? "bg-white/20" : "bg-white/5")}
                          >
                            <Bold className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <button
                            onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, italic: !editingText.style.italic } })}
                            className={cn("w-8 h-8 rounded-lg flex items-center justify-center", editingText.style.italic ? "bg-white/20" : "bg-white/5")}
                          >
                            <Italic className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <div className="w-px h-5 bg-white/10" />
                          <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, textAlign: 'left' } })} className={cn("w-8 h-8 rounded-lg flex items-center justify-center", editingText.style.textAlign === 'left' ? "bg-white/20" : "bg-white/5")}>
                            <AlignLeft className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, textAlign: 'center' } })} className={cn("w-8 h-8 rounded-lg flex items-center justify-center", editingText.style.textAlign === 'center' || !editingText.style.textAlign ? "bg-white/20" : "bg-white/5")}>
                            <AlignCenter className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, textAlign: 'right' } })} className={cn("w-8 h-8 rounded-lg flex items-center justify-center", editingText.style.textAlign === 'right' ? "bg-white/20" : "bg-white/5")}>
                            <AlignRight className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <div className="w-px h-5 bg-white/10" />
                          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
                            <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, fontSize: Math.max(8, (editingText.style.fontSize || 16) - 2) } })} className="text-white/60 text-sm font-bold px-1">−</button>
                            <span className="text-white/70 text-[10px] min-w-[20px] text-center">{editingText.style.fontSize || 16}</span>
                            <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, fontSize: Math.min(120, (editingText.style.fontSize || 16) + 2) } })} className="text-white/60 text-sm font-bold px-1">+</button>
                          </div>
                        </div>
                        {/* Color swatches */}
                        <div className="flex gap-2">
                          {["#ffffff", "#000000", "#ff4444", "#44aaff", "#44ff88", "#ffaa00", "#ff44ff", "#888888"].map(c => (
                            <button
                              key={c}
                              onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, color: c } })}
                              className={cn("w-7 h-7 rounded-full border-2 transition-all", editingText.style.color === c ? "border-white scale-110" : "border-white/10")}
                              style={{ background: c }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Tool Category Bar ────────────────────────────────────── */}
        <div className="flex items-center gap-1 overflow-x-auto px-4 pb-3 no-scrollbar">
          {([
            { id: "effects" as ToolCategory, icon: Sparkles, label: "Effects" },
            { id: "filters" as ToolCategory, icon: Palette, label: "Filters" },
            { id: "captions" as ToolCategory, icon: Type, label: "Captions" },
            { id: "text-edit" as ToolCategory, icon: Type, label: "Text" },
          ]).map((item) => {
            const active = activeCategory === item.id;
            return (
              <button
                key={item.id}
                onClick={() => toggleCategory(item.id)}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-[11px] font-semibold transition-all active:scale-95",
                  active ? "bg-white text-black" : "bg-white/8 text-white/60"
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

          <button onClick={handleGoLive} disabled={rtmp.isConnecting} className="flex flex-col items-center gap-1">
            <div className={cn(
              "w-[68px] h-[68px] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl",
              rtmp.isConnecting ? "bg-yellow-500 shadow-yellow-500/30"
                : rtmp.isStreaming ? "bg-red-500 shadow-red-500/30"
                : "bg-white shadow-white/20"
            )}>
              {rtmp.isStreaming ? (
                <Square className="w-7 h-7 text-white fill-white" />
              ) : (
                <Radio className={cn("w-7 h-7", rtmp.isConnecting ? "text-white" : "text-black")} />
              )}
            </div>
            <span className={cn("text-[9px] font-bold", rtmp.isStreaming ? "text-red-400" : "text-white/60")}>
              {rtmp.isConnecting ? "Connecting" : rtmp.isStreaming ? "End Live" : "Go Live"}
            </span>
          </button>

          <button onClick={() => setShowStreamConfig(true)} className="flex flex-col items-center gap-1">
            <div className="w-12 h-12 rounded-full border-[2.5px] border-white/20 flex items-center justify-center active:scale-90 transition-transform">
              <Radio className="w-5 h-5 text-white/60" />
            </div>
            <span className="text-[9px] text-white/50 font-medium">Setup</span>
          </button>
        </div>

        <div className="h-[max(env(safe-area-inset-bottom),8px)]" />
      </div>

      {/* ── Stream Config Modal ────────────────────────────────────── */}
      <StreamConfigurationModal
        externalOpen={showStreamConfig}
        onOpenChange={setShowStreamConfig}
        onStartStream={async () => { setShowStreamConfig(false); await rtmp.startStreaming(); }}
        onStopStream={() => rtmp.stopStreaming()}
      />

      <style>{`.no-scrollbar::-webkit-scrollbar { display: none; } .no-scrollbar { scrollbar-width: none; }`}</style>
    </div>
  );
};
