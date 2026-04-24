import { createContext, type ReactNode, useCallback, useContext, useMemo, useState } from "react";
import { useAnimeStyles, type AnimeStyle } from "@/hooks/useAnimeStyles";
import canvasPresetsRaw from "@/data/canvasPresets.json";
import captionPresetsRaw from "@/data/captionPresets.json";
import animationLibraryRaw from "@/data/animationLibrary.json";
import interactiveFiltersRaw from "@/data/interactiveFilters.json";
import cinematicShotsRaw from "@/data/cinematicShots.json";
import type { CanvasPreset, CaptionPreset, AnimationPreset, InteractiveFilter, CinematicPreset } from "@/data/types";


export type FxCategory = "Filters" | "Interactive" | "Cinematic" | "Canvas" | "Captions" | "Animations";

export const CINEMATIC_PRESETS = cinematicShotsRaw as unknown as CinematicPreset[];

export interface FilterPreset {
  id: string;
  name: string;
  /** CSS filter string applied to the <video> element */
  css: string;
  /** Background gradient for the round thumbnail (Tailwind classes) */
  swatch: string;
}

export type OverlayId = "none" | "vhs" | "cinematic" | "glitch" | "neon";

export interface OverlayPreset {
  id: OverlayId;
  name: string;
  swatch: string;
}

export const FILTERS: FilterPreset[] = [
  { id: "none",      name: "Original",  css: "none", swatch: "from-neutral-300 to-neutral-500" },
  { id: "vivid",     name: "Vivid",     css: "saturate(1.45) contrast(1.08)", swatch: "from-orange-400 to-pink-500" },
  { id: "vintage",   name: "Vintage",   css: "sepia(0.55) saturate(1.1) contrast(0.95) brightness(1.02)", swatch: "from-amber-500 to-rose-700" },
  { id: "noir",      name: "Noir",      css: "grayscale(1) contrast(1.2) brightness(0.95)", swatch: "from-neutral-700 to-black" },
  { id: "cyberpunk", name: "Cyberpunk", css: "hue-rotate(200deg) saturate(1.6) contrast(1.15)", swatch: "from-fuchsia-500 to-cyan-400" },
  { id: "dreamy",    name: "Dreamy",    css: "blur(0.4px) saturate(1.2) brightness(1.08) contrast(0.95)", swatch: "from-pink-300 to-violet-400" },
  { id: "warmth",    name: "Warmth",    css: "saturate(1.2) sepia(0.2) brightness(1.05)", swatch: "from-yellow-400 to-orange-500" },
  { id: "arctic",    name: "Arctic",    css: "hue-rotate(180deg) saturate(0.85) brightness(1.05)", swatch: "from-sky-300 to-blue-500" },
  { id: "lush",      name: "Lush",      css: "hue-rotate(60deg) saturate(1.3) contrast(1.05)", swatch: "from-emerald-400 to-teal-600" },
];

export const OVERLAYS: OverlayPreset[] = [
  { id: "none",      name: "None",      swatch: "from-neutral-300 to-neutral-500" },
  { id: "vhs",       name: "VHS",       swatch: "from-violet-500 to-indigo-700" },
  { id: "cinematic", name: "Cinematic", swatch: "from-neutral-800 to-black" },
  { id: "glitch",    name: "Glitch",    swatch: "from-cyan-400 to-rose-500" },
  { id: "neon",      name: "Neon",      swatch: "from-fuchsia-500 to-pink-500" },
];

// Cast the imported JSON once so consumers get full typing.
export const CANVAS_PRESETS = canvasPresetsRaw as unknown as CanvasPreset[];
export const CAPTION_PRESETS = captionPresetsRaw as unknown as CaptionPreset[];
export const ANIMATION_PRESETS = animationLibraryRaw as unknown as AnimationPreset[];
export const INTERACTIVE_FILTERS = interactiveFiltersRaw as unknown as InteractiveFilter[];

interface FxContextValue {
  category: FxCategory;
  setCategory: (c: FxCategory) => void;

  // CSS filter layer
  filterId: string;
  setFilterId: (id: string) => void;
  cycleFilter: (dir: 1 | -1) => FilterPreset;
  activeFilter: FilterPreset;

  // Legacy structural overlays (kept so the existing OverlayEngine VHS / Glitch / etc. still work)
  overlayId: OverlayId;
  setOverlayId: (id: OverlayId) => void;
  activeOverlay: OverlayPreset;

  // New JSON-driven layers — null means "off"
  canvasPresetId: string | null;
  setCanvasPresetId: (id: string | null) => void;
  activeCanvasPreset: CanvasPreset | null;

  captionId: string | null;
  setCaptionId: (id: string | null) => void;
  activeCaption: CaptionPreset | null;

  animationId: string | null;
  setAnimationId: (id: string | null) => void;
  activeAnimation: AnimationPreset | null;

  // Interactive filters (GLSL-based, applied via WebGL shader) — independent layer.
  interactiveFilterId: string;
  setInteractiveFilterId: (id: string) => void;
  activeInteractiveFilter: InteractiveFilter | null;
  /** Combined CSS filter string from both Filters + Interactive layers. */
  combinedFilterCss: string;

  // AnimeStyles loaded from Firestore for tri-tone rendering (shader type 6)
  animeStyles: Record<string, AnimeStyle>;

  // Cinematic shots (overlay-based, see CinematicShotRenderer) — independent.
  cinematicShotId: string | null;
  setCinematicShotId: (id: string | null) => void;
  activeCinematicShot: CinematicPreset | null;

  // Per-overlay user edits (position % + content + style overrides) keyed by `${presetId}:${overlayId}`
  overlayEdits: Record<string, OverlayEdit>;
  updateOverlayEdit: (
    presetId: string,
    overlayId: string,
    patch: OverlayEdit
  ) => void;
  resetOverlayEdits: (presetId?: string) => void;

  // Caption user edits (drag offset in px + custom content + style overrides) keyed by caption id
  captionEdits: Record<string, CaptionEdit>;
  updateCaptionEdit: (
    captionId: string,
    patch: CaptionEdit
  ) => void;
}

export interface TextStyleOverride {
  fontFamily?: string;
  color?: string;
  fontSize?: number;
  textAlign?: "left" | "center" | "right";
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  backgroundColor?: string;
}

export interface OverlayEdit {
  x?: number;
  y?: number;
  content?: string;
  style?: TextStyleOverride;
}

export interface CaptionEdit {
  dx?: number;
  dy?: number;
  content?: string;
  style?: TextStyleOverride;
}

const FxContext = createContext<FxContextValue | null>(null);

export const FxProvider = ({ children }: { children: ReactNode }) => {
  const [category, setCategory] = useState<FxCategory>("Filters");
  const [filterId, setFilterId] = useState<string>("none");
  const [overlayId, setOverlayId] = useState<OverlayId>("none");
  const [canvasPresetId, setCanvasPresetId] = useState<string | null>(null);
  const [captionId, setCaptionId] = useState<string | null>(null);
  const [animationId, setAnimationId] = useState<string | null>(null);
  const [interactiveFilterId, setInteractiveFilterId] = useState<string>("none");
  const [cinematicShotId, setCinematicShotId] = useState<string | null>(null);
  const [overlayEdits, setOverlayEdits] = useState<Record<string, OverlayEdit>>({});
  const [captionEdits, setCaptionEdits] = useState<Record<string, CaptionEdit>>({});

  // Load AnimeStyles from Firestore for tri-tone rendering
  const { animeStyles } = useAnimeStyles();

  const updateCaptionEdit = useCallback(
    (captionId: string, patch: CaptionEdit) => {
      setCaptionEdits((prev) => ({
        ...prev,
        [captionId]: {
          ...prev[captionId],
          ...patch,
          style: patch.style
            ? { ...prev[captionId]?.style, ...patch.style }
            : prev[captionId]?.style,
        },
      }));
    },
    []
  );

  const updateOverlayEdit = useCallback(
    (presetId: string, overlayId: string, patch: OverlayEdit) => {
      const key = `${presetId}:${overlayId}`;
      setOverlayEdits((prev) => ({
        ...prev,
        [key]: {
          ...prev[key],
          ...patch,
          style: patch.style ? { ...prev[key]?.style, ...patch.style } : prev[key]?.style,
        },
      }));
    },
    []
  );
  const resetOverlayEdits = useCallback((presetId?: string) => {
    setOverlayEdits((prev) => {
      if (!presetId) return {};
      const next = { ...prev };
      Object.keys(next).forEach((k) => k.startsWith(`${presetId}:`) && delete next[k]);
      return next;
    });
  }, []);

  const activeFilter = useMemo(
    () => FILTERS.find((f) => f.id === filterId) ?? FILTERS[0],
    [filterId]
  );
  const activeOverlay = useMemo(
    () => OVERLAYS.find((o) => o.id === overlayId) ?? OVERLAYS[0],
    [overlayId]
  );
  const activeCanvasPreset = useMemo(
    () => (canvasPresetId ? CANVAS_PRESETS.find((c) => c.id === canvasPresetId) ?? null : null),
    [canvasPresetId]
  );
  const activeCaption = useMemo(
    () => (captionId ? CAPTION_PRESETS.find((c) => c.id === captionId) ?? null : null),
    [captionId]
  );
  const activeAnimation = useMemo(
    () => (animationId ? ANIMATION_PRESETS.find((a) => a.id === animationId) ?? null : null),
    [animationId]
  );
  const activeInteractiveFilter = useMemo(
    () =>
      interactiveFilterId && interactiveFilterId !== "none"
        ? INTERACTIVE_FILTERS.find((f) => f.id === interactiveFilterId) ?? null
        : null,
    [interactiveFilterId]
  );
  const activeCinematicShot = useMemo(
    () => (cinematicShotId ? CINEMATIC_PRESETS.find((c) => c.id === cinematicShotId) ?? null : null),
    [cinematicShotId]
  );
  // Interactive filters render their own component layer (see
  // InteractiveFilterRenderer); we deliberately do NOT fold them into the
  // <video>'s CSS filter chain so the two systems stay independent.
  const combinedFilterCss = useMemo(() => {
    return activeFilter.css && activeFilter.css !== "none" ? activeFilter.css : "none";
  }, [activeFilter]);

  const cycleFilter = useCallback(
    (dir: 1 | -1) => {
      const idx = FILTERS.findIndex((f) => f.id === filterId);
      const nextIdx = (idx + dir + FILTERS.length) % FILTERS.length;
      const next = FILTERS[nextIdx];
      setFilterId(next.id);
      return next;
    },
    [filterId]
  );

  return (
    <FxContext.Provider
      value={{
        category,
        setCategory,
        filterId,
        setFilterId,
        cycleFilter,
        activeFilter,
        overlayId,
        setOverlayId,
        activeOverlay,
        canvasPresetId,
        setCanvasPresetId,
        activeCanvasPreset,
        captionId,
        setCaptionId,
        activeCaption,
        animationId,
        setAnimationId,
        activeAnimation,
        interactiveFilterId,
        setInteractiveFilterId,
        activeInteractiveFilter,
        combinedFilterCss,
        animeStyles,
        cinematicShotId,
        setCinematicShotId,
        activeCinematicShot,
        overlayEdits,
        updateOverlayEdit,
        resetOverlayEdits,
        captionEdits,
        updateCaptionEdit,
      }}
    >
      {children}
    </FxContext.Provider>
  );
};

export const useFx = () => {
  const ctx = useContext(FxContext);
  if (!ctx) throw new Error("useFx must be used within FxProvider");
  return ctx;
};
