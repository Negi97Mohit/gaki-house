import { useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  useFx,
  FILTERS,
  CANVAS_PRESETS,
  CAPTION_PRESETS,
  ANIMATION_PRESETS,
  INTERACTIVE_FILTERS,
  CINEMATIC_PRESETS,
  type FxCategory,
} from "@/context/FxContext";
import { loadFonts } from "@/lib/fontLoader";

const CATEGORIES: FxCategory[] = ["Filters", "Interactive", "Cinematic", "Canvas", "Captions", "Animations"];

interface ThumbProps {
  name: string;
  active: boolean;
  onClick: () => void;
  swatch?: string;
  preview?: string;
  fontFamily?: string;
  sample?: string;
}

const Thumb = ({ name, active, onClick, swatch, preview, fontFamily, sample }: ThumbProps) => (
  <button
    onClick={onClick}
    className="snap-start shrink-0 flex flex-col items-center gap-1.5 w-[74px] active:scale-95 transition-transform"
  >
    <div className="relative h-[68px] w-[68px] flex items-center justify-center">
      {active && (
        <div
          className="absolute inset-0 rounded-full border-2 border-white"
          style={{ animation: "fx-ring 320ms var(--ease-out-soft) both" }}
        />
      )}
      <div
        className={cn(
          "h-[58px] w-[58px] rounded-full overflow-hidden shadow-float border border-white/40 flex items-center justify-center bg-gradient-to-br",
          swatch ?? "from-neutral-700 to-neutral-900",
          active && "scale-[0.92] transition-transform"
        )}
        style={
          preview
            ? {
                backgroundImage: `url(${preview})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }
            : undefined
        }
      >
        {!preview && sample && (
          <span
            className="text-white text-[14px] leading-none px-1 text-center truncate w-full"
            style={{
              fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
              textShadow: "0 1px 2px rgba(0,0,0,0.7)",
            }}
          >
            {sample}
          </span>
        )}
        {!preview && !sample && (
          <div className="h-full w-full bg-gradient-to-t from-black/30 to-transparent" />
        )}
      </div>
    </div>
    <span
      className={cn(
        "text-[10px] text-center leading-tight text-white truncate w-full",
        active ? "font-semibold" : "font-medium"
      )}
      style={{ textShadow: "0 1px 2px rgba(0,0,0,0.6), 0 0 6px rgba(0,0,0,0.35)" }}
    >
      {name}
    </span>
  </button>
);

const EffectsPanel = () => {
  const {
    category,
    setCategory,
    filterId,
    setFilterId,
    canvasPresetId,
    setCanvasPresetId,
    captionId,
    setCaptionId,
    animationId,
    setAnimationId,
    interactiveFilterId,
    setInteractiveFilterId,
    cinematicShotId,
    setCinematicShotId,
  } = useFx();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Preload fonts referenced by the currently visible category so thumbnails render correctly.
  const visibleFonts = useMemo(() => {
    if (category === "Captions") return CAPTION_PRESETS.map((c) => c.style.fontFamily);
    if (category === "Animations") return ANIMATION_PRESETS.map((a) => a.baseStyle.fontFamily);
    if (category === "Canvas")
      return CANVAS_PRESETS.flatMap((c) => (c.textOverlays ?? []).map((t) => t.style.fontFamily));
    return [];
  }, [category]);

  useEffect(() => {
    loadFonts(visibleFonts);
  }, [visibleFonts]);

  return (
    <div>
      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar -mx-1 px-1 mb-4">
        {CATEGORIES.map((c) => {
          const isActive = c === category;
          return (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                "shrink-0 px-3.5 h-8 rounded-full text-[12px] font-semibold transition-all active:scale-95 border",
                isActive
                  ? "bg-white text-neutral-900 border-white shadow-float"
                  : "bg-transparent text-white border-white/40 hover:bg-white/10"
              )}
              style={
                isActive
                  ? undefined
                  : { textShadow: "0 1px 2px rgba(0,0,0,0.55), 0 0 8px rgba(0,0,0,0.35)" }
              }
            >
              {c}
            </button>
          );
        })}
      </div>

      {/* Thumbnails carousel */}
      <div
        ref={scrollRef}
        className="flex items-start gap-3 overflow-x-auto no-scrollbar -mx-1 px-1 pb-1 snap-x"
      >
        {category === "Filters" &&
          FILTERS.map((f) => (
            <Thumb
              key={f.id}
              name={f.name}
              swatch={f.swatch}
              active={f.id === filterId}
              onClick={() => setFilterId(f.id === filterId && f.id !== "none" ? "none" : f.id)}
            />
          ))}

        {category === "Interactive" &&
          INTERACTIVE_FILTERS.map((f) => (
            <Thumb
              key={f.id}
              name={f.name}
              preview={f.preview}
              active={f.id === interactiveFilterId}
              onClick={() =>
                setInteractiveFilterId(
                  f.id === interactiveFilterId && f.id !== "none" ? "none" : f.id
                )
              }
            />
          ))}

        {category === "Cinematic" && (
          <>
            <Thumb
              name="None"
              swatch="from-neutral-300 to-neutral-500"
              active={cinematicShotId === null}
              onClick={() => setCinematicShotId(null)}
            />
            {CINEMATIC_PRESETS.map((c) => (
              <Thumb
                key={c.id}
                name={c.name}
                preview={c.preview}
                active={c.id === cinematicShotId}
                onClick={() => setCinematicShotId(c.id === cinematicShotId ? null : c.id)}
              />
            ))}
          </>
        )}

        {category === "Canvas" && (
          <>
            <Thumb
              name="None"
              swatch="from-neutral-300 to-neutral-500"
              active={canvasPresetId === null}
              onClick={() => setCanvasPresetId(null)}
            />
            {CANVAS_PRESETS.map((c) => (
              <Thumb
                key={c.id}
                name={c.name}
                active={c.id === canvasPresetId}
                onClick={() => setCanvasPresetId(c.id === canvasPresetId ? null : c.id)}
                fontFamily={c.textOverlays?.[0]?.style.fontFamily}
                sample={c.textOverlays?.[0]?.content?.slice(0, 4) ?? "Aa"}
                swatch="from-neutral-800 to-black"
              />
            ))}
          </>
        )}

        {category === "Captions" && (
          <>
            <Thumb
              name="None"
              swatch="from-neutral-300 to-neutral-500"
              active={captionId === null}
              onClick={() => setCaptionId(null)}
            />
            {CAPTION_PRESETS.map((c) => (
              <Thumb
                key={c.id}
                name={c.name}
                active={c.id === captionId}
                onClick={() => setCaptionId(c.id === captionId ? null : c.id)}
                fontFamily={c.style.fontFamily}
                sample="Aa"
                swatch="from-neutral-800 to-neutral-950"
              />
            ))}
          </>
        )}

        {category === "Animations" && (
          <>
            <Thumb
              name="None"
              swatch="from-neutral-300 to-neutral-500"
              active={animationId === null}
              onClick={() => setAnimationId(null)}
            />
            {ANIMATION_PRESETS.map((a) => (
              <Thumb
                key={a.id}
                name={a.name}
                active={a.id === animationId}
                onClick={() => setAnimationId(a.id === animationId ? null : a.id)}
                fontFamily={a.baseStyle.fontFamily}
                sample="Aa"
                swatch="from-indigo-600 to-fuchsia-600"
              />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default EffectsPanel;
