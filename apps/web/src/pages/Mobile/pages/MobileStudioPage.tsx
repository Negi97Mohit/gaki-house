import React, { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { MobileStudioToolPanel, type ToolCategory } from "../components/MobileStudioToolPanel";
import {
  X, RefreshCcw, Mic, MicOff, VideoOff, Camera,
  Radio, Type, Sparkles, Palette, LayoutGrid,
  Square, MoreHorizontal, Film, Wand2,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Search, Image, Loader2, Settings,
} from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
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
import { CanvasPreset } from "@gaki/core/types/canvasPreset";
import {
  searchImages as apiSearchImages,
  searchGifs as apiSearchGifs,
} from "@/lib/assetApis";

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

  // Ensure solo mode on mount
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

  // Apply a canvas preset — clamp positions for mobile
  const handleApplyPreset = (preset: CanvasPreset) => {
    if (preset.canvasLayout) {
      // Clamp grid section cameras to stay within mobile viewport
      const clampedLayout = {
        ...preset.canvasLayout,
        sections: preset.canvasLayout.sections?.map((s: any) => ({
          ...s,
          camera: s.camera ? {
            ...s.camera,
            position: {
              x: Math.min(Math.max(s.camera.position?.x ?? 0, 0), 70),
              y: Math.min(Math.max(s.camera.position?.y ?? 0, 0), 70),
            },
            size: {
              width: Math.min(s.camera.size?.width ?? 100, 100),
              height: Math.min(s.camera.size?.height ?? 100, 100),
            },
          } : s.camera,
        })),
      };
      setCanvasLayout(clampedLayout);
      setLayoutMode("pip");
    } else {
      setCanvasLayout(null);
      const mode = preset.pip?.layoutMode as any || "solo";
      setLayoutMode(mode);
    }

    // Clamp PiP position so camera stays visible on small screens
    if (preset.pip?.pipPosition) {
      const clampedPos = {
        x: Math.min(Math.max(preset.pip.pipPosition.x, 2), 68),
        y: Math.min(Math.max(preset.pip.pipPosition.y, 2), 68),
      };
      useCanvasStore.getState().setPipPosition(clampedPos);
    }
    if (preset.pip?.pipSize) {
      const clampedSize = {
        width: Math.max(preset.pip.pipSize.width, 25),
        height: Math.max(preset.pip.pipSize.height || 25, 25),
      };
      useCanvasStore.getState().setPipSize(clampedSize);
    }

    setBlankCanvasColor(preset.background.blankCanvasColor || "#000000");
    setBackgroundEffect(preset.background.backgroundEffect as any || "none");
    if (preset.background.backgroundImageUrl) {
      setBackgroundImageUrl(preset.background.backgroundImageUrl);
    }
    if (preset.textOverlays?.length) {
      // Scale text overlay positions to fit 9:16 mobile canvas
      setTextOverlays(preset.textOverlays.map(t => ({
        id: t.id,
        content: t.content,
        style: t.style as any,
        layout: {
          ...t.layout as any,
          position: {
            x: Math.min(Math.max((t.layout as any).position?.x ?? 5, 2), 80),
            y: Math.min(Math.max((t.layout as any).position?.y ?? 5, 2), 85),
          },
        },
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
    const newOverlay: import("@gaki/core/types/caption").FileOverlayState = {
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

  // Canvas presets filtered by category
  const filteredPresets = designCat === "all"
    ? canvasPresets
    : canvasPresets.filter(p => p.styleTags?.includes(designCat));

  const toolPanelOpen = activeCategory !== "none";

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-40 bg-black flex flex-col overflow-hidden mobile-thumb-zone"
      style={{ height: '100dvh' }}
      role="application"
      aria-label="GAKI Studio"
    >

      {/* ── Full-Screen Canvas ─────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <MobileCanvasContainer
          isDrawerOpen={false}
          onDrawerOpenChange={() => { }}
          layoutManager={{
            handleCanvasPresetSelect: handleApplyPreset,
            handleSaveCanvasPreset: () => { },
            handleDeleteCanvasPreset: () => { },
            shareCanvasPreset: () => { },
            unshareCanvasPreset: () => { },
            customPresets: [],
            publicPresets: [],
            isLoadingPublic: false,
          }}
          vaultFiles={[]}
          onAddVaultFiles={() => { }}
          onRemoveVaultFile={() => { }}
          onClearVault={() => { }}
        />
      </div>

      {/* ── Camera Off Overlay ─────────────────────────────────────── */}
      {!isVideoOn && (
        <div className="absolute inset-0 z-[5] bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4" aria-live="polite">
          <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
            <VideoOff className="w-10 h-10 text-white/25" aria-hidden="true" />
          </div>
          <p className="text-white/40 text-sm font-medium">Camera is off</p>
          <button
            onClick={toggleVideo}
            className="mt-1 px-7 py-3 bg-white/10 rounded-full text-sm font-semibold text-white active:scale-95 transition-transform min-h-[44px] border border-white/10"
            aria-label="Turn on camera"
          >
            Turn on camera
          </button>
        </div>
      )}

      {/* ── TOP BAR — Live status + Close/Flip ─────────────────────── */}
      <div className="relative z-20 flex items-center justify-between px-4 mobile-safe-top py-3">
        {/* Left: Close & Flip */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleExit}
            className="mobile-icon-btn bg-black/40 backdrop-blur-md border border-white/5"
            aria-label="Exit studio"
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <button
            onClick={() => toast.info("Flip coming soon")}
            className="mobile-icon-btn bg-black/40 backdrop-blur-md border border-white/5"
            aria-label="Flip camera"
          >
            <RefreshCcw className="w-4 h-4 text-white" />
          </button>
        </div>

        {/* Center: Live badge */}
        {isLive && (
          <div className={cn(
            "flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-white font-bold",
            rtmp.isStreaming ? "bg-red-500 animate-live-pulse" : "bg-red-500/80"
          )} role="status" aria-live="polite">
            <div className="w-2 h-2 rounded-full bg-white" aria-hidden="true" />
            <span className="text-[11px] tracking-wider">
              {rtmp.isStreaming ? "LIVE" : "REC"}
            </span>
          </div>
        )}

        {/* Right: Camera / Mic / Settings */}
        <div className="flex items-center gap-1">
          <button
            onClick={toggleVideo}
            className={cn(
              "mobile-icon-btn border border-white/5",
              !isVideoOn ? "bg-red-500/80" : "bg-black/40 backdrop-blur-md"
            )}
            aria-label={isVideoOn ? "Turn off camera" : "Turn on camera"}
          >
            {isVideoOn ? <Camera className="w-4 h-4 text-white" /> : <VideoOff className="w-4 h-4 text-white" />}
          </button>
          <button
            onClick={toggleMute}
            className={cn(
              "mobile-icon-btn border border-white/5",
              !isAudioOn ? "bg-red-500/80" : "bg-black/40 backdrop-blur-md"
            )}
            aria-label={isAudioOn ? "Mute microphone" : "Unmute microphone"}
          >
            {isAudioOn ? <Mic className="w-4 h-4 text-white" /> : <MicOff className="w-4 h-4 text-white" />}
          </button>
        </div>
      </div>

      {/* SPACER — pushes controls to thumb zone */}
      <div className="flex-1" />

      {/* ── BOTTOM — Tool Tray + Actions (Thumb Zone) ─────────── */}
      <div className="relative z-20 flex flex-col">

        {/* ── Expanded Tool Panel ─────────────────────────────── */}
        <MobileStudioToolPanel
          toolPanelOpen={toolPanelOpen}
          activeCategory={activeCategory}
          designCat={designCat}
          setDesignCat={setDesignCat}
          filteredPresets={filteredPresets}
          handleApplyPreset={handleApplyPreset}
          effectSubCat={effectSubCat}
          setEffectSubCat={setEffectSubCat}
          cinematicCat={cinematicCat}
          setCinematicCat={setCinematicCat}
          interactiveFilters={interactiveFilters}
          activeInteractiveFilter={activeInteractiveFilter}
          setActiveInteractiveFilter={setActiveInteractiveFilter}
          handleApplyEffect={handleApplyEffect}
          filteredCinematic={filteredCinematic}
          filterList={filterList}
          videoFilter={videoFilter}
          setVideoFilter={setVideoFilter}
          handleApplyFilter={handleApplyFilter}
          dynamicStyle={dynamicStyle}
          captionStyles={captionStyles}
          handleApplyCaptionStyle={handleApplyCaptionStyle}
          searchTab={searchTab}
          setSearchTab={setSearchTab}
          setSearchResults={setSearchResults}
          searchInputRef={searchInputRef}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleSearch={handleSearch}
          isSearching={isSearching}
          searchResults={searchResults}
          handleAssetSelect={handleAssetSelect}
          textOverlays={textOverlays}
          editingTextId={editingTextId}
          setEditingTextId={setEditingTextId}
          editingText={editingText}
          updateTextOverlay={updateTextOverlay}
        />

        {/* ── Tool Category Bar ────────────────────────────────── */}
        <div className="flex items-center gap-1.5 overflow-x-auto px-3 pb-3 no-scrollbar" role="tablist" aria-label="Studio tools">
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
                role="tab"
                aria-selected={active}
                className={cn(
                  "shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[12px] font-semibold transition-all active:scale-95 min-h-[40px]",
                  active ? "bg-white text-black shadow-sm" : "bg-white/8 text-white/60"
                )}
              >
                <item.icon className="w-4 h-4" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </div>

        {/* ── Action Buttons Row ───────────────────────────────── */}
        <div className="flex items-end justify-center gap-8 pb-3">
          <button
            onClick={rtmp.toggleRecording}
            className="flex flex-col items-center gap-1.5"
            aria-label={rtmp.isRecording ? "Stop recording" : "Start recording"}
          >
            <div className={cn(
              "w-14 h-14 rounded-full border-[2.5px] flex items-center justify-center transition-all active:scale-90",
              rtmp.isRecording ? "border-red-400" : "border-white/40"
            )}>
              <div className={cn(
                "bg-red-500 transition-all",
                rtmp.isRecording ? "w-5 h-5 rounded-sm" : "w-9 h-9 rounded-full"
              )} aria-hidden="true" />
            </div>
            <span className="text-[10px] text-white/50 font-medium">Record</span>
          </button>

          <button
            onClick={handleGoLive}
            disabled={rtmp.isConnecting}
            className="flex flex-col items-center gap-1.5"
            aria-label={rtmp.isStreaming ? "End live stream" : "Go live"}
          >
            <div className={cn(
              "w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all active:scale-90 shadow-xl",
              rtmp.isConnecting ? "bg-yellow-500 shadow-yellow-500/30"
                : rtmp.isStreaming ? "bg-red-500 shadow-red-500/30 animate-live-pulse"
                  : "bg-white shadow-white/20"
            )}>
              {rtmp.isStreaming ? (
                <Square className="w-7 h-7 text-white fill-white" aria-hidden="true" />
              ) : (
                <Radio className={cn("w-7 h-7", rtmp.isConnecting ? "text-white" : "text-black")} aria-hidden="true" />
              )}
            </div>
            <span className={cn("text-[10px] font-bold", rtmp.isStreaming ? "text-red-400" : "text-white/60")}>
              {rtmp.isConnecting ? "Connecting" : rtmp.isStreaming ? "End Live" : "Go Live"}
            </span>
          </button>

          <button
            onClick={() => setShowStreamConfig(true)}
            className="flex flex-col items-center gap-1.5"
            aria-label="Stream settings"
          >
            <div className="w-14 h-14 rounded-full border-[2.5px] border-white/20 flex items-center justify-center active:scale-90 transition-transform">
              <Settings className="w-5 h-5 text-white/60" aria-hidden="true" />
            </div>
            <span className="text-[10px] text-white/50 font-medium">Setup</span>
          </button>
        </div>

        <div className="h-[max(env(safe-area-inset-bottom),8px)]" aria-hidden="true" />
      </div>

      {/* ── Stream Config Modal ────────────────────────────────── */}
      <StreamConfigurationModal
        externalOpen={showStreamConfig}
        onOpenChange={setShowStreamConfig}
        onStartStream={async () => { setShowStreamConfig(false); await rtmp.startStreaming(); }}
        onStopStream={() => rtmp.stopStreaming()}
      />
    </div>
  );
};
