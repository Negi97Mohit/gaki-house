import React, { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import {
  X, RefreshCcw, Mic, MicOff, VideoOff, Camera,
  Radio, Type, Sparkles, Palette, LayoutGrid,
  Square, MoreHorizontal, Film, Wand2,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Search, Image, Loader2,
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
import { useCanvasPresets } from "@/features/canvas/hooks/useCanvasPresets";
import { useLayoutTemplates } from "@/features/layouts/hooks/useLayoutTemplates";
import { CANVAS_PRESET_CATEGORIES } from "@/lib/canvasPresets";
import { CanvasPreset } from "@/types/canvasPreset";
import {
  searchImages as apiSearchImages,
  searchGifs as apiSearchGifs,
} from "@/lib/assetApis";

// ─── Types ─────────────────────────────────────────────────────────
type ToolCategory = "none" | "captions" | "effects" | "filters" | "designs" | "text-edit" | "search";

// Mobile-relevant cinematic categories
const MOBILE_CINEMATIC_CATS = ["all", "core", "optical", "framing", "focus", "stylized"] as const;

// Mobile-relevant preset categories (no community on mobile for now)
const MOBILE_PRESET_CATS = ["all", "magazine", "modern", "minimal", "tech", "cinematic", "fashion", "retro"] as const;

export const MobileStudioPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState<ToolCategory>("none");
  const [showStreamConfig, setShowStreamConfig] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const fabRef = useRef<HTMLDivElement>(null);
  const [cinematicCat, setCinematicCat] = useState("all");
  const [effectSubCat, setEffectSubCat] = useState<"interactive" | "cinematic">("interactive");
  const [designCat, setDesignCat] = useState("all");

  // Text editing state
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Asset search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchTab, setSearchTab] = useState<"images" | "gifs">("images");
  const searchInputRef = useRef<HTMLInputElement>(null);

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
  const setCanvasLayout = useSceneStore((s) => s.setCanvasLayout);
  const setBlankCanvasColor = useSceneStore((s) => s.setBlankCanvasColor);
  const setBackgroundEffect = useSceneStore((s) => s.setBackgroundEffect);
  const setBackgroundImageUrl = useSceneStore((s) => s.setBackgroundImageUrl);
  const fileOverlays = useSceneStore((s) => s.fileOverlays);
  const setFileOverlays = useSceneStore((s) => s.setFileOverlays);

  const { destinations } = useStreamStore(useShallow((s) => ({
    destinations: s.destinations,
  })));

  // Firestore data
  const { captionPresets } = useCaptionPresets();
  const { filters: firestoreFilters } = useFilters();
  const rtmp = useRtmpStream();
  const { systemPresets: canvasPresets, loading: presetsLoading } = useCanvasPresets();
  const { layoutTemplates } = useLayoutTemplates();

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

  // Focus search input when search panel opens
  useEffect(() => {
    if (activeCategory === "search") {
      setTimeout(() => searchInputRef.current?.focus(), 200);
    }
  }, [activeCategory]);

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

  // Apply a canvas preset
  const handleApplyPreset = (preset: CanvasPreset) => {
    if (preset.canvasLayout) {
      setCanvasLayout(preset.canvasLayout);
      setLayoutMode("pip");
    } else {
      setCanvasLayout(null);
      setLayoutMode(preset.pip?.layoutMode as any || "solo");
    }
    setBlankCanvasColor(preset.background.blankCanvasColor || "#000000");
    setBackgroundEffect(preset.background.backgroundEffect as any || "none");
    if (preset.background.backgroundImageUrl) {
      setBackgroundImageUrl(preset.background.backgroundImageUrl);
    }
    if (preset.textOverlays?.length) {
      setTextOverlays(preset.textOverlays.map(t => ({
        id: t.id,
        content: t.content,
        style: t.style as any,
        layout: t.layout as any,
      })));
    }
    if (preset.effects?.videoFilter) {
      setVideoFilter(preset.effects.videoFilter);
    }
    toast.success(`Applied: ${preset.name}`);
  };

  // Asset search
  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const result = searchTab === "images"
        ? await apiSearchImages(searchQuery, 1)
        : await apiSearchGifs(searchQuery, 1);
      setSearchResults(result.assets.map((r: any) => ({
        id: r.id,
        previewUrl: r.previewUrl || r.downloadUrl,
        downloadUrl: r.downloadUrl,
        alt: r.alt || searchQuery,
        type: searchTab === "gifs" ? "image/gif" : "image/jpeg",
      })));
    } catch {
      toast.error("Search failed");
    } finally {
      setIsSearching(false);
    }
  }, [searchQuery, searchTab]);

  const handleAssetSelect = (asset: any) => {
    const url = asset.downloadUrl || asset.previewUrl;
    const blob = new File([], asset.alt || "image", { type: asset.type || "image/jpeg" });
    const newOverlay: import("@/types/caption").FileOverlayState = {
      id: `file-${Date.now()}`,
      file: blob,
      fileName: asset.alt || "image",
      fileType: "image" as any,
      fileUrl: url,
      layout: {
        position: { x: 10, y: 10 },
        size: { width: 30, height: 30 },
        zIndex: 50,
        rotation: 0,
      },
    };
    setFileOverlays([...fileOverlays, newOverlay]);
    toast.success("Image added to canvas");
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

  // Canvas presets filtered by category (only 9:16 mobile ones prioritized)
  const filteredPresets = designCat === "all"
    ? canvasPresets
    : canvasPresets.filter(p => p.styleTags?.includes(designCat));

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-40 bg-black flex flex-col overflow-hidden" style={{ height: '100dvh' }}>

      {/* ── Full-Screen Canvas ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <MobileCanvasContainer
          isDrawerOpen={false}
          onDrawerOpenChange={() => {}}
          layoutManager={{
            handleCanvasPresetSelect: handleApplyPreset,
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

      {/* ── TOP BAR — Live badge ─────────────────────────────────── */}
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

      {/* ── FAB — Expandable controls ──────────────────────────── */}
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

      {/* ── BOTTOM — Tool Tray + Actions ──────────────────────── */}
      <div className="relative z-20 flex flex-col">

        {/* ── Expanded Tool Panel ──────────────────────────────── */}
        {activeCategory !== "none" && (
          <div className="px-2 pb-2 animate-in slide-in-from-bottom-3 duration-200">

            {/* ─── DESIGNS — Canvas Presets + Grid Layouts ──────── */}
            {activeCategory === "designs" && (
              <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 max-h-[45vh] overflow-hidden flex flex-col">
                {/* Category chips */}
                <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar shrink-0">
                  {MOBILE_PRESET_CATS.map(catId => {
                    const catInfo = CANVAS_PRESET_CATEGORIES.find(c => c.id === catId);
                    return (
                      <button
                        key={catId}
                        onClick={() => setDesignCat(catId)}
                        className={cn("shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wide transition-all",
                          designCat === catId ? "bg-white text-black" : "bg-white/10 text-white/50"
                        )}
                      >
                        {catInfo?.name || catId}
                      </button>
                    );
                  })}
                </div>

                {/* Presets grid */}
                <div className="flex-1 overflow-y-auto no-scrollbar mt-1">
                  {presetsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
                    </div>
                  ) : filteredPresets.length === 0 ? (
                    <p className="text-white/30 text-xs text-center py-8">No designs in this category</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2">
                      {filteredPresets.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handleApplyPreset(preset)}
                          className="flex flex-col gap-1 active:scale-95 transition-all"
                        >
                          {/* Preview card */}
                          <div className="w-full aspect-[9/16] rounded-lg overflow-hidden border border-white/10 relative"
                            style={{ background: preset.background?.blankCanvasColor || "#111" }}
                          >
                            {/* PiP preview */}
                            {preset.pip && (
                              <div
                                className="absolute bg-white/15 border border-white/20"
                                style={{
                                  left: `${preset.pip.pipPosition?.x || 0}%`,
                                  top: `${preset.pip.pipPosition?.y || 0}%`,
                                  width: `${preset.pip.pipSize?.width || 30}%`,
                                  height: `${preset.pip.cameraShape === "circle"
                                    ? (preset.pip.pipSize?.width || 30)
                                    : preset.pip.pipSize?.height || 30}%`,
                                  borderRadius: preset.pip.cameraShape === "circle" ? "50%"
                                    : preset.pip.cameraShape === "rounded" ? "4px" : "0",
                                }}
                              />
                            )}
                            {/* Text overlay previews */}
                            {preset.textOverlays?.slice(0, 2).map((t, i) => (
                              <div
                                key={i}
                                className="absolute flex items-center justify-center"
                                style={{
                                  left: `${t.layout.position.x}%`,
                                  top: `${t.layout.position.y}%`,
                                  width: `${t.layout.size.width}%`,
                                  fontSize: "5px",
                                  color: t.style.color,
                                  fontFamily: t.style.fontFamily,
                                  fontWeight: t.style.fontWeight,
                                  backgroundColor: t.style.backgroundColor !== "transparent" ? t.style.backgroundColor : undefined,
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                }}
                              >
                                Aa
                              </div>
                            ))}
                            {/* Grid layout indicator */}
                            {preset.canvasLayout && (
                              <div className="absolute bottom-1 right-1">
                                <LayoutGrid className="w-2.5 h-2.5 text-white/40" />
                              </div>
                            )}
                          </div>
                          <span className="text-[8px] font-semibold text-white/50 truncate w-full text-center">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── EFFECTS — Interactive Filters + Cinematic ──── */}
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
                      {filteredCinematic.slice(0, 30).map((preset) => (
                        <button
                          key={preset.id}
                          onClick={() => toast.info(`${preset.name} applied`)}
                          className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                        >
                          <div className="w-[56px] h-[56px] rounded-xl flex items-center justify-center border-2 border-transparent transition-all"
                            style={{ background: `linear-gradient(135deg, ${preset.color}88, ${preset.color}44)` }}
                          >
                            <Film className="w-4 h-4 text-white/70" />
                          </div>
                          <span className="text-[9px] font-semibold text-white/50 max-w-[56px] truncate">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ─── CAPTIONS ────────────────────────────────────── */}
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

            {/* ─── FILTERS — from Firestore ────────────────────── */}
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

            {/* ─── SEARCH — Mobile Asset Search ────────────────── */}
            {activeCategory === "search" && (
              <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-3 max-h-[45vh] overflow-hidden flex flex-col">
                {/* Search input */}
                <div className="flex gap-2 items-center mb-2 shrink-0">
                  <div className="flex-1 relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSearch()}
                      placeholder="Search images, GIFs..."
                      className="w-full bg-white/10 rounded-full pl-8 pr-3 py-2 text-white text-xs outline-none focus:ring-1 focus:ring-white/20 placeholder:text-white/25"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-3 py-2 bg-white/15 rounded-full text-[10px] font-bold text-white active:scale-95 transition-all"
                  >
                    {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Go"}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-2 shrink-0">
                  <button
                    onClick={() => { setSearchTab("images"); setSearchResults([]); }}
                    className={cn("px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                      searchTab === "images" ? "bg-white text-black" : "bg-white/10 text-white/50"
                    )}
                  >
                    <Image className="w-3 h-3 inline mr-1" />Photos
                  </button>
                  <button
                    onClick={() => { setSearchTab("gifs"); setSearchResults([]); }}
                    className={cn("px-3 py-1 rounded-full text-[10px] font-bold transition-all",
                      searchTab === "gifs" ? "bg-white text-black" : "bg-white/10 text-white/50"
                    )}
                  >
                    GIFs
                  </button>
                </div>

                {/* Results grid */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {searchResults.length === 0 && !isSearching && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <Search className="w-6 h-6 text-white/15" />
                      <p className="text-white/25 text-[10px]">Search for images to add to your canvas</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-1.5">
                    {searchResults.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => handleAssetSelect(asset)}
                        className="aspect-square rounded-lg overflow-hidden active:scale-95 transition-all border border-white/5"
                      >
                        <img
                          src={asset.previewUrl}
                          alt={asset.alt}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── TEXT EDIT — inline text editor ──────────────── */}
            {activeCategory === "text-edit" && (
              <div className="py-2 px-1">
                {textOverlays.length === 0 ? (
                  <p className="text-white/40 text-xs text-center py-4">No text overlays. Apply a design with text first.</p>
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
                        <div className="flex gap-2 items-center flex-wrap">
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

        {/* ── Tool Category Bar ────────────────────────────────── */}
        <div className="flex items-center gap-1 overflow-x-auto px-3 pb-3 no-scrollbar">
          {([
            { id: "designs" as ToolCategory, icon: LayoutGrid, label: "Designs" },
            { id: "effects" as ToolCategory, icon: Sparkles, label: "Effects" },
            { id: "filters" as ToolCategory, icon: Palette, label: "Filters" },
            { id: "captions" as ToolCategory, icon: Type, label: "Captions" },
            { id: "search" as ToolCategory, icon: Search, label: "Assets" },
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

        {/* ── Action Buttons Row ───────────────────────────────── */}
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

      {/* ── Stream Config Modal ────────────────────────────────── */}
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
