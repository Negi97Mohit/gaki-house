import React from "react";
import {
  X, Type, Sparkles, Palette, Film, Wand2,
  Bold, Italic, AlignLeft, AlignCenter, AlignRight,
  Search, Image, Loader2,
} from "lucide-react";
import { cn } from "@gaki/core/lib/utils";
import { DYNAMIC_STYLE_OPTIONS } from "@/lib/dynamicCaptionStyles";
import { CINEMATIC_CATEGORIES, type CinematicEffect } from "@/features/stream/ui/pip/cinematicShotData";
import { CANVAS_PRESET_CATEGORIES } from "@/lib/canvasPresets";
import type { CanvasPreset } from "@gaki/core/types/canvasPreset";

export type ToolCategory = "none" | "captions" | "effects" | "filters" | "designs" | "text-edit" | "search";

export const MOBILE_CINEMATIC_CATS = ["all", "core", "optical", "framing", "focus", "stylized"] as const;
export const MOBILE_PRESET_CATS = ["all", "magazine", "modern", "minimal", "tech", "cinematic", "fashion", "retro"] as const;

export interface MobileStudioToolPanelProps {
  toolPanelOpen: boolean;
  activeCategory: ToolCategory;
  designCat: string;
  setDesignCat: (cat: string) => void;
  filteredPresets: CanvasPreset[];
  handleApplyPreset: (preset: CanvasPreset) => void;
  effectSubCat: "interactive" | "cinematic";
  setEffectSubCat: (sub: "interactive" | "cinematic") => void;
  cinematicCat: string;
  setCinematicCat: (cat: string) => void;
  interactiveFilters: any[];
  activeInteractiveFilter: string;
  setActiveInteractiveFilter: (id: string) => void;
  handleApplyEffect: (id: string) => void;
  filteredCinematic: CinematicEffect[];
  filterList: any[];
  videoFilter: string;
  setVideoFilter: (id: string) => void;
  handleApplyFilter: (id: string) => void;
  dynamicStyle: string;
  captionStyles: any[];
  handleApplyCaptionStyle: (style: any) => void;
  searchTab: "images" | "gifs";
  setSearchTab: (tab: "images" | "gifs") => void;
  setSearchResults: (results: any[]) => void;
  searchInputRef: React.RefObject<HTMLInputElement>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  handleSearch: () => void;
  isSearching: boolean;
  searchResults: any[];
  handleAssetSelect: (item: any) => void;
  textOverlays: any[];
  editingTextId: string | null;
  setEditingTextId: (id: string | null) => void;
  editingText: any;
  updateTextOverlay: (id: string, patch: any) => void;
}

export const MobileStudioToolPanel: React.FC<MobileStudioToolPanelProps> = ({
  toolPanelOpen,
  activeCategory,
  designCat,
  setDesignCat,
  filteredPresets,
  handleApplyPreset,
  effectSubCat,
  setEffectSubCat,
  cinematicCat,
  setCinematicCat,
  interactiveFilters,
  activeInteractiveFilter,
  setActiveInteractiveFilter,
  handleApplyEffect,
  filteredCinematic,
  filterList,
  videoFilter,
  setVideoFilter,
  handleApplyFilter,
  dynamicStyle,
  captionStyles,
  handleApplyCaptionStyle,
  searchTab,
  setSearchTab,
  setSearchResults,
  searchInputRef,
  searchQuery,
  setSearchQuery,
  handleSearch,
  isSearching,
  searchResults,
  handleAssetSelect,
  textOverlays,
  editingTextId,
  setEditingTextId,
  editingText,
  updateTextOverlay,
}) => {
  if (!toolPanelOpen) return null;

  return (
    <>
        {toolPanelOpen && (
          <div className="px-3 pb-2 animate-sheet-up">

            {/* ─── DESIGNS — Canvas Presets + Grid Layouts ──────── */}
            {activeCategory === "designs" && (
              <div className="mobile-glass-dark rounded-2xl p-3 max-h-[42vh] overflow-hidden flex flex-col mobile-sheet">
                {/* Category chips */}
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar shrink-0">
                  {MOBILE_PRESET_CATS.map(catId => {
                    const catInfo = CANVAS_PRESET_CATEGORIES.find(c => c.id === catId);
                    return (
                      <button
                        key={catId}
                        onClick={() => setDesignCat(catId)}
                        className={cn("shrink-0 px-3.5 py-2 rounded-full text-[11px] font-bold uppercase tracking-wide transition-all min-h-[36px] active:scale-95",
                          designCat === catId ? "bg-white text-black" : "bg-white/10 text-white/50"
                        )}
                        aria-selected={designCat === catId}
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
                      <Loader2 className="w-5 h-5 text-white/40 animate-spin" aria-label="Loading" />
                    </div>
                  ) : filteredPresets.length === 0 ? (
                    <p className="text-white/30 text-xs text-center py-8">No designs in this category</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-2.5">
                      {filteredPresets.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => handleApplyPreset(preset)}
                          className="flex flex-col gap-1.5 active:scale-95 transition-all min-w-0"
                          aria-label={`Apply design: ${preset.name}`}
                        >
                          {/* Preview card */}
                          <div className="w-full aspect-[9/16] rounded-xl overflow-hidden border border-white/10 relative"
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
                                aria-hidden="true"
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
                                aria-hidden="true"
                              >
                                Aa
                              </div>
                            ))}
                            {/* Grid layout indicator */}
                            {preset.canvasLayout && (
                              <div className="absolute bottom-1 right-1">
                                <LayoutGrid className="w-2.5 h-2.5 text-white/40" aria-hidden="true" />
                              </div>
                            )}
                          </div>
                          <span className="text-[9px] font-semibold text-white/50 truncate w-full text-center">
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
              <div className="mobile-glass-dark rounded-2xl p-3 mobile-sheet">
                {/* Sub-category toggle */}
                <div className="flex gap-2 pb-3">
                  <button
                    onClick={() => setEffectSubCat("interactive")}
                    className={cn("px-4 py-2 rounded-full text-[11px] font-bold transition-all min-h-[36px] active:scale-95",
                      effectSubCat === "interactive" ? "bg-white text-black" : "bg-white/10 text-white/60"
                    )}
                    aria-selected={effectSubCat === "interactive"}
                  >
                    <Wand2 className="w-3.5 h-3.5 inline mr-1.5" aria-hidden="true" />Filters
                  </button>
                  <button
                    onClick={() => setEffectSubCat("cinematic")}
                    className={cn("px-4 py-2 rounded-full text-[11px] font-bold transition-all min-h-[36px] active:scale-95",
                      effectSubCat === "cinematic" ? "bg-white text-black" : "bg-white/10 text-white/60"
                    )}
                    aria-selected={effectSubCat === "cinematic"}
                  >
                    <Film className="w-3.5 h-3.5 inline mr-1.5" aria-hidden="true" />Cinematic
                  </button>
                </div>

                {effectSubCat === "interactive" ? (
                  <div className="mobile-scroll-snap py-2">
                    {interactiveFilters.map((fx) => {
                      const active = activeInteractiveFilter === fx.id;
                      return (
                        <button
                          key={fx.id}
                          onClick={() => handleApplyEffect(fx.id)}
                          className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                          aria-label={`Apply filter: ${fx.name}`}
                          aria-pressed={active}
                        >
                          <div className={cn(
                            "w-16 h-16 rounded-xl overflow-hidden transition-all border-2",
                            active ? "border-white shadow-lg shadow-white/20 scale-105" : "border-transparent"
                          )}>
                            <img
                              src={fx.thumbnailUrl}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                          <span className={cn(
                            "text-[10px] font-semibold max-w-[64px] truncate",
                            active ? "text-white" : "text-white/50"
                          )}>{fx.name}</span>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    {/* Cinematic category chips */}
                    <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {CINEMATIC_CATEGORIES.filter(c => (MOBILE_CINEMATIC_CATS as readonly string[]).includes(c.id)).map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => setCinematicCat(cat.id)}
                          className={cn("shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all min-h-[32px] active:scale-95",
                            cinematicCat === cat.id ? "bg-white/20 text-white" : "bg-white/5 text-white/40"
                          )}
                          aria-selected={cinematicCat === cat.id}
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                    <div className="mobile-scroll-snap py-2 max-h-[120px]">
                      {filteredCinematic.slice(0, 30).map((preset) => {
                        const isActive = activeInteractiveFilter === (`cinematic-${preset.id}`);
                        return (
                          <button
                            key={preset.id}
                            onClick={() => {
                              const cId = `cinematic-${preset.id}`;
                              setActiveInteractiveFilter(isActive ? 'none' as any : cId as any);
                              setVideoFilter(isActive ? 'none' : preset.id === 'dolly-zoom' ? 'none' : 'none');
                              toast.success(isActive ? 'Effect removed' : `Applied: ${preset.name}`);
                            }}
                            className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                            aria-label={`Apply cinematic: ${preset.name}`}
                            aria-pressed={isActive}
                          >
                            <div className={cn(
                              "w-16 h-16 rounded-xl flex items-center justify-center border-2 transition-all",
                              isActive ? "border-white shadow-lg shadow-white/20 scale-105" : "border-transparent"
                            )}
                              style={{ background: `linear-gradient(135deg, ${preset.color}88, ${preset.color}44)` }}
                            >
                              <Film className="w-4 h-4 text-white/70" aria-hidden="true" />
                            </div>
                            <span className={cn(
                              "text-[10px] font-semibold max-w-[64px] truncate",
                              isActive ? "text-white" : "text-white/50"
                            )}>
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

            {/* ─── CAPTIONS ────────────────────────────────────── */}
            {activeCategory === "captions" && (
              <div className="mobile-glass-dark rounded-2xl p-3 mobile-sheet">
                <div className="mobile-scroll-snap py-2">
                  {captionStyles.map((s) => {
                    const active = dynamicStyle === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleApplyCaptionStyle(s.id)}
                        className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                        aria-label={`Caption style: ${s.label}`}
                        aria-pressed={active}
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center transition-all border-2 overflow-hidden",
                          active ? "border-white shadow-lg shadow-white/20 scale-105 bg-white" : "border-transparent bg-white/10"
                        )}>
                          <span className={cn(
                            "text-[11px] font-bold text-center leading-tight px-1",
                            active ? "text-black" : "text-white/80"
                          )}>
                            {s.id === "none" ? "OFF" : s.label.slice(0, 6)}
                          </span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-semibold max-w-[64px] truncate text-center",
                          active ? "text-white" : "text-white/50"
                        )}>{s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── FILTERS — from Firestore ────────────────────── */}
            {activeCategory === "filters" && (
              <div className="mobile-glass-dark rounded-2xl p-3 mobile-sheet">
                <div className="mobile-scroll-snap py-2">
                  {filterList.map((f) => {
                    const active = videoFilter === f.style;
                    return (
                      <button
                        key={f.id}
                        onClick={() => handleApplyFilter(f.style)}
                        className="shrink-0 flex flex-col items-center gap-1.5 active:scale-95 transition-all"
                        aria-label={`Filter: ${f.name}`}
                        aria-pressed={active}
                      >
                        <div className={cn(
                          "w-16 h-16 rounded-xl flex items-center justify-center transition-all border-2 relative overflow-hidden",
                          active ? "border-white shadow-lg shadow-white/20 scale-105" : "border-transparent"
                        )}>
                          <div
                            className="absolute inset-0 bg-gradient-to-br from-blue-500/30 via-purple-500/20 to-pink-500/30"
                            style={{ filter: f.style !== "none" ? f.style : undefined }}
                            aria-hidden="true"
                          />
                          <span className={cn(
                            "relative text-[11px] font-bold z-10",
                            active ? "text-white" : "text-white/80"
                          )}>
                            {f.name.slice(0, 4)}
                          </span>
                        </div>
                        <span className={cn(
                          "text-[10px] font-semibold max-w-[64px] truncate",
                          active ? "text-white" : "text-white/50"
                        )}>{f.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ─── SEARCH — Mobile Asset Search ────────────────── */}
            {activeCategory === "search" && (
              <div className="mobile-glass-dark rounded-2xl p-3 max-h-[42vh] overflow-hidden flex flex-col mobile-sheet">
                {/* Search input */}
                <div className="flex gap-2 items-center mb-3 shrink-0">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" aria-hidden="true" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && handleSearch()}
                      placeholder="Search images, GIFs..."
                      className="w-full bg-white/10 rounded-full pl-9 pr-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-white/20 placeholder:text-white/25 min-h-[44px]"
                      aria-label="Search assets"
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching}
                    className="px-4 py-3 bg-white/15 rounded-full text-[11px] font-bold text-white active:scale-95 transition-all min-h-[44px]"
                    aria-label={isSearching ? "Searching..." : "Search"}
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : "Go"}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-3 shrink-0">
                  <button
                    onClick={() => { setSearchTab("images"); setSearchResults([]); }}
                    className={cn("px-4 py-2 rounded-full text-[11px] font-bold transition-all min-h-[36px] active:scale-95",
                      searchTab === "images" ? "bg-white text-black" : "bg-white/10 text-white/50"
                    )}
                    aria-selected={searchTab === "images"}
                  >
                    <Image className="w-3.5 h-3.5 inline mr-1" aria-hidden="true" />Photos
                  </button>
                  <button
                    onClick={() => { setSearchTab("gifs"); setSearchResults([]); }}
                    className={cn("px-4 py-2 rounded-full text-[11px] font-bold transition-all min-h-[36px] active:scale-95",
                      searchTab === "gifs" ? "bg-white text-black" : "bg-white/10 text-white/50"
                    )}
                    aria-selected={searchTab === "gifs"}
                  >
                    GIFs
                  </button>
                </div>

                {/* Results grid */}
                <div className="flex-1 overflow-y-auto no-scrollbar">
                  {searchResults.length === 0 && !isSearching && (
                    <div className="flex flex-col items-center justify-center py-10 gap-2">
                      <Search className="w-7 h-7 text-white/15" aria-hidden="true" />
                      <p className="text-white/25 text-xs">Search for images to add to your canvas</p>
                    </div>
                  )}
                  <div className="grid grid-cols-3 gap-2">
                    {searchResults.map((asset) => (
                      <button
                        key={asset.id}
                        onClick={() => handleAssetSelect(asset)}
                        className="aspect-square rounded-xl overflow-hidden active:scale-95 transition-all border border-white/5"
                        aria-label={`Add ${asset.alt}`}
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
              <div className="mobile-glass-dark rounded-2xl p-3 mobile-sheet">
                {textOverlays.length === 0 ? (
                  <p className="text-white/40 text-sm text-center py-6">No text overlays. Apply a design with text first.</p>
                ) : (
                  <div className="space-y-3">
                    {/* Text overlay selector */}
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                      {textOverlays.map((t, i) => (
                        <button
                          key={t.id}
                          onClick={() => setEditingTextId(t.id)}
                          className={cn(
                            "shrink-0 px-4 py-2 rounded-full text-[11px] font-bold transition-all min-h-[36px] active:scale-95",
                            editingTextId === t.id ? "bg-white text-black" : "bg-white/10 text-white/60"
                          )}
                          aria-selected={editingTextId === t.id}
                        >
                          Text {i + 1}
                        </button>
                      ))}
                    </div>

                    {/* Editor */}
                    {editingText && (
                      <div className="bg-black/40 backdrop-blur-xl rounded-xl p-3.5 space-y-3">
                        <input
                          type="text"
                          value={typeof editingText.content === 'string' ? editingText.content : ''}
                          onChange={(e) => updateTextOverlay(editingText.id, { content: e.target.value })}
                          className="w-full bg-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:ring-1 focus:ring-white/30 min-h-[44px]"
                          placeholder="Edit text..."
                          aria-label="Text content"
                        />
                        {/* Row 1: Format + Align */}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <button
                            onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, bold: !editingText.style.bold } })}
                            className={cn("w-9 h-9 rounded-lg flex items-center justify-center active:scale-95", editingText.style.bold ? "bg-white/20" : "bg-white/5")}
                            aria-label="Bold" aria-pressed={editingText.style.bold}
                          >
                            <Bold className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <button
                            onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, italic: !editingText.style.italic } })}
                            className={cn("w-9 h-9 rounded-lg flex items-center justify-center active:scale-95", editingText.style.italic ? "bg-white/20" : "bg-white/5")}
                            aria-label="Italic" aria-pressed={editingText.style.italic}
                          >
                            <Italic className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <div className="w-px h-5 bg-white/10 mx-0.5" aria-hidden="true" />
                          <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, textAlign: 'left' } })} className={cn("w-9 h-9 rounded-lg flex items-center justify-center active:scale-95", editingText.style.textAlign === 'left' ? "bg-white/20" : "bg-white/5")} aria-label="Align left">
                            <AlignLeft className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, textAlign: 'center' } })} className={cn("w-9 h-9 rounded-lg flex items-center justify-center active:scale-95", editingText.style.textAlign === 'center' || !editingText.style.textAlign ? "bg-white/20" : "bg-white/5")} aria-label="Align center">
                            <AlignCenter className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, textAlign: 'right' } })} className={cn("w-9 h-9 rounded-lg flex items-center justify-center active:scale-95", editingText.style.textAlign === 'right' ? "bg-white/20" : "bg-white/5")} aria-label="Align right">
                            <AlignRight className="w-3.5 h-3.5 text-white/70" />
                          </button>
                          <div className="w-px h-5 bg-white/10 mx-0.5" aria-hidden="true" />
                          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-1.5 py-1 min-h-[36px]">
                            <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, fontSize: Math.max(8, (editingText.style.fontSize || 16) - 2) } })} className="text-white/60 text-sm font-bold px-1 min-w-[24px] min-h-[24px] flex items-center justify-center" aria-label="Decrease font size">−</button>
                            <span className="text-white/70 text-[10px] min-w-[20px] text-center">{editingText.style.fontSize || 16}</span>
                            <button onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, fontSize: Math.min(120, (editingText.style.fontSize || 16) + 2) } })} className="text-white/60 text-sm font-bold px-1 min-w-[24px] min-h-[24px] flex items-center justify-center" aria-label="Increase font size">+</button>
                          </div>
                        </div>
                        {/* Color swatches */}
                        {/* Row 2: Color swatches — responsive */}
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                          {["#ffffff", "#000000", "#ff4444", "#44aaff", "#44ff88", "#ffaa00", "#ff44ff", "#888888"].map(c => (
                            <button
                              key={c}
                              onClick={() => updateTextOverlay(editingText.id, { style: { ...editingText.style, color: c } })}
                              className={cn("w-7 h-7 shrink-0 rounded-full border-2 transition-all active:scale-95", editingText.style.color === c ? "border-white scale-110" : "border-white/10")}
                              style={{ background: c }}
                              aria-label={`Text color ${c}`}
                              aria-pressed={editingText.style.color === c}
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
    </>
  );
};
