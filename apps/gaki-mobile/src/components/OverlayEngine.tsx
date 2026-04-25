import { useEffect, useMemo, useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { useFx, type TextStyleOverride } from "@/context/FxContext";
import { loadFonts } from "@/lib/fontLoader";
import InteractiveFilterRenderer from "@/components/InteractiveFilterRenderer";
import CinematicShotRenderer from "@/components/CinematicShotRenderer";
import TextStyleEditor from "@/components/TextStyleEditor";
import type { CanvasTextOverlay, CaptionPreset, AnimationPreset } from "@/data/types";

/**
 * Mobile screen base width (px) used as the reference for the JSON `fontSize`
 * values. Most presets were authored against a ~390px wide artboard, so we
 * scale font sizes down a bit for our 9:16 viewport.
 */
const SCALE_FACTOR = 0.5;

const easingMap: Record<string, string> = {
  smooth: "cubic-bezier(0.22, 1, 0.36, 1)",
  bouncy: "cubic-bezier(0.34, 1.56, 0.64, 1)",
  elastic: "cubic-bezier(0.68, -0.55, 0.27, 1.55)",
  linear: "linear",
};

function buildAnimationStyle(cfg: AnimationPreset["animationConfig"]): React.CSSProperties {
  const dur = cfg.duration ?? 0.8;
  const delay = cfg.delay ?? 0;
  const ease = easingMap[cfg.easing ?? "smooth"] ?? "ease-out";
  const iter = cfg.loop ? "infinite" : "1";
  const dir = cfg.direction;
  const name =
    dir === "down" ? "fx-anim-down" :
    dir === "left" ? "fx-anim-left" :
    dir === "right" ? "fx-anim-right" :
    "fx-anim-up";
  return {
    animation: `${name} ${dur}s ${ease} ${delay}s ${iter} both`,
    animationDelay: `${delay}s`,
  };
}

/* ------------------------------------------------------------------ */
/*  Canvas text overlay — draggable + tap-to-edit                      */
/* ------------------------------------------------------------------ */
function CanvasTextLayer({
  overlay,
  presetId,
  containerRef,
}: {
  overlay: CanvasTextOverlay;
  presetId: string;
  containerRef: React.RefObject<HTMLElement>;
}) {
  const { overlayEdits, updateOverlayEdit } = useFx();
  const key = `${presetId}:${overlay.id}`;
  const edit = overlayEdits[key] ?? {};
  const { position, size, zIndex, rotation } = overlay.layout;
  const baseStyle = overlay.style;
  const o = edit.style ?? {};
  const fontFamily = o.fontFamily ?? baseStyle.fontFamily;
  const fontSize = o.fontSize ?? baseStyle.fontSize;
  const color = o.color ?? baseStyle.color;
  const backgroundColor = o.backgroundColor ?? baseStyle.backgroundColor;
  const textAlign = o.textAlign ?? baseStyle.textAlign;
  const [editing, setEditing] = useState(false);
  const draggedRef = useRef(false);

  const x = edit.x ?? position.x;
  const y = edit.y ?? position.y;
  const content = edit.content ?? overlay.content;

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    const parent = containerRef.current;
    if (!parent) return;
    const rect = parent.getBoundingClientRect();
    const dxPct = (info.offset.x / rect.width) * 100;
    const dyPct = (info.offset.y / rect.height) * 100;
    const nx = Math.max(0, Math.min(100 - size.width, x + dxPct));
    const ny = Math.max(0, Math.min(100 - size.height, y + dyPct));
    updateOverlayEdit(presetId, overlay.id, { x: nx, y: ny });
    if (Math.abs(info.offset.x) + Math.abs(info.offset.y) > 4) {
      draggedRef.current = true;
      setTimeout(() => (draggedRef.current = false), 150);
    }
  };

  return (
    <>
      <motion.div
        key={`${x}-${y}`}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={containerRef}
        onDragEnd={onDragEnd}
        onTap={() => {
          if (draggedRef.current) return;
          setEditing(true);
        }}
        className="absolute flex pointer-events-auto cursor-move select-none touch-none ring-1 ring-transparent active:ring-white/70"
        style={{
          left: `${x}%`,
          top: `${y}%`,
          width: `${size.width}%`,
          height: `${size.height}%`,
          zIndex: zIndex ?? 15,
          rotate: rotation ?? 0,
          color,
          backgroundColor: backgroundColor === "transparent" ? undefined : backgroundColor,
          fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
          fontSize: fontSize ? `${Math.max(8, fontSize * SCALE_FACTOR)}px` : undefined,
          textAlign: textAlign ?? "left",
          fontWeight: o.bold ? 700 : undefined,
          fontStyle: o.italic ? "italic" : undefined,
          textDecoration: o.underline ? "underline" : undefined,
          justifyContent:
            textAlign === "center" ? "center" : textAlign === "right" ? "flex-end" : "flex-start",
          alignItems: "center",
          lineHeight: 1.05,
          textShadow: "0 1px 4px rgba(0,0,0,0.45)",
        }}
      >
        <div className="w-full" dangerouslySetInnerHTML={{ __html: content }} />
      </motion.div>
      {editing && (
        <TextStyleEditor
          initial={content.replace(/<br\s*\/?>(\s*)/gi, "\n")}
          initialStyle={{
            fontFamily,
            fontSize: fontSize ? Math.max(24, fontSize * 0.9) : 32,
            color: color ?? "#FFFFFF",
            textAlign: (textAlign ?? "center") as TextStyleOverride["textAlign"],
            bold: o.bold,
            italic: o.italic,
            underline: o.underline,
          }}
          onClose={() => setEditing(false)}
          onSave={(next, nextStyle) => {
            updateOverlayEdit(presetId, overlay.id, {
              content: next.replace(/\n/g, "<br>"),
              style: nextStyle,
            });
            setEditing(false);
          }}
        />
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Caption — draggable + tap-to-edit                                  */
/* ------------------------------------------------------------------ */
function CaptionLayer({
  caption,
  containerRef,
}: {
  caption: CaptionPreset;
  containerRef: React.RefObject<HTMLElement>;
}) {
  const { captionEdits, updateCaptionEdit } = useFx();
  const edit = captionEdits[caption.id] ?? {};
  const s = caption.style;
  const o = edit.style ?? {};
  const pos = s.position ?? { x: 50, y: 90 };
  const fontFamily = o.fontFamily ?? s.fontFamily;
  const color = o.color ?? s.color;
  const textAlign = o.textAlign ?? "center";
  const bold = o.bold ?? s.bold;
  const italic = o.italic ?? s.italic;
  const underline = o.underline ?? s.underline;
  const baseSize = o.fontSize ?? s.fontSize ?? 24;
  const fontSize = Math.max(12, baseSize * 0.7);
  const [editing, setEditing] = useState(false);
  const draggedRef = useRef(false);

  const text = edit.content ?? "Caption sample";

  const radius =
    s.shape === "pill"
      ? 9999
      : s.shape === "rounded" || s.shape === "speech-bubble"
      ? 14
      : s.shape === "rectangular"
      ? 6
      : 0;

  const shadows: string[] = [];
  if (s.textShadow) shadows.push(s.textShadow);
  if (s.shadow && !s.textShadow) shadows.push("0 2px 6px rgba(0,0,0,0.55)");
  const outline = s.outline
    ? { WebkitTextStroke: `1px ${color ?? "#000"}` as unknown as string }
    : undefined;

  const onDragEnd = (_e: unknown, info: PanInfo) => {
    updateCaptionEdit(caption.id, {
      dx: (edit.dx ?? 0) + info.offset.x,
      dy: (edit.dy ?? 0) + info.offset.y,
    });
    if (Math.abs(info.offset.x) + Math.abs(info.offset.y) > 4) {
      draggedRef.current = true;
      setTimeout(() => (draggedRef.current = false), 150);
    }
  };

  return (
    <>
      <motion.div
        key={`${edit.dx ?? 0}-${edit.dy ?? 0}`}
        drag
        dragMomentum={false}
        dragElastic={0}
        dragConstraints={containerRef}
        onDragEnd={onDragEnd}
        onTap={() => {
          if (draggedRef.current) return;
          setEditing(true);
        }}
        className="absolute pointer-events-auto cursor-move touch-none select-none"
        style={{
          left: `${pos.x}%`,
          top: `${pos.y}%`,
          x: edit.dx ?? 0,
          y: edit.dy ?? 0,
          translateX: "-50%",
          translateY: "-50%",
          rotate: s.rotation ?? 0,
          maxWidth: "90%",
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontFamily: fontFamily ? `"${fontFamily}", sans-serif` : undefined,
            fontSize: `${fontSize}px`,
            color,
            textAlign,
            backgroundColor:
              s.backgroundColor && s.backgroundColor !== "transparent" ? s.backgroundColor : undefined,
            padding: s.backgroundColor && s.backgroundColor !== "transparent" ? "6px 14px" : 0,
            borderRadius: radius,
            fontWeight: bold ? 700 : 400,
            fontStyle: italic ? "italic" : "normal",
            textDecoration: underline ? "underline" : undefined,
            border: s.border ? `${s.borderWidth ?? 1}px solid ${s.borderColor ?? "#fff"}` : undefined,
            textShadow: shadows.join(", ") || undefined,
            whiteSpace: "pre-wrap",
            ...outline,
            animation:
              s.animation === "slide-up"
                ? "fx-anim-up 0.5s cubic-bezier(0.22,1,0.36,1) both"
                : s.animation === "bounce"
                ? "fx-anim-up 0.6s cubic-bezier(0.34,1.56,0.64,1) both"
                : "fade-in 0.5s ease-out both",
          }}
        >
          {text}
        </div>
      </motion.div>
      {editing && (
        <TextStyleEditor
          initial={text}
          initialStyle={{
            fontFamily,
            fontSize: Math.max(28, baseSize * 1.1),
            color: color ?? "#FFFFFF",
            textAlign: textAlign as TextStyleOverride["textAlign"],
            bold,
            italic,
            underline,
          }}
          onClose={() => setEditing(false)}
          onSave={(next, nextStyle) => {
            updateCaptionEdit(caption.id, { content: next, style: nextStyle });
            setEditing(false);
          }}
        />
      )}
    </>
  );
}

function AnimationLayer({ preset }: { preset: AnimationPreset }) {
  const { defaultContent, baseStyle, animationConfig } = preset;
  const lines = Object.values(defaultContent);
  const fontSize = Math.max(18, (baseStyle.fontSize ?? 48) * 0.45);
  const animStyle = buildAnimationStyle(animationConfig);

  return (
    <div
      className="absolute inset-x-0 flex flex-col gap-1 px-6 pointer-events-none"
      style={{
        top: "38%",
        textAlign: baseStyle.alignment ?? "center",
        alignItems:
          baseStyle.alignment === "left"
            ? "flex-start"
            : baseStyle.alignment === "right"
            ? "flex-end"
            : "center",
        zIndex: 25,
      }}
    >
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            fontFamily: baseStyle.fontFamily ? `"${baseStyle.fontFamily}", sans-serif` : undefined,
            fontSize: i === 0 ? `${fontSize}px` : `${fontSize * 0.6}px`,
            color: i === 0 ? baseStyle.color : baseStyle.accentColor ?? baseStyle.color,
            backgroundColor:
              baseStyle.backgroundColor && baseStyle.backgroundColor !== "transparent"
                ? baseStyle.backgroundColor
                : undefined,
            padding: baseStyle.backgroundColor ? "4px 10px" : 0,
            borderRadius: baseStyle.backgroundColor ? 8 : 0,
            fontWeight: 700,
            lineHeight: 1.05,
            textShadow: "0 2px 8px rgba(0,0,0,0.55)",
            ...animStyle,
            animationDelay: `${(animationConfig.delay ?? 0) + i * 0.08}s`,
          }}
        >
          {line}
        </div>
      ))}
    </div>
  );
}

const OverlayEngine = () => {
  const {
    activeOverlay,
    activeCanvasPreset,
    activeCaption,
    activeAnimation,
    activeInteractiveFilter,
    activeCinematicShot,
  } = useFx();
  const id = activeOverlay.id;
  const containerRef = useRef<HTMLDivElement>(null);

  // Preload all fonts referenced by the currently active layers
  useEffect(() => {
    const families: Array<string | undefined> = [];
    if (activeCanvasPreset?.textOverlays)
      families.push(...activeCanvasPreset.textOverlays.map((t) => t.style.fontFamily));
    if (activeCaption) families.push(activeCaption.style.fontFamily);
    if (activeAnimation) families.push(activeAnimation.baseStyle.fontFamily);
    loadFonts(families);
  }, [activeCanvasPreset, activeCaption, activeAnimation]);

  // Live timecode for the VHS overlay
  const [tc, setTc] = useState("00:00:00:00");
  useEffect(() => {
    if (id !== "vhs") return;
    const start = Date.now();
    const tick = () => {
      const ms = Date.now() - start;
      const hh = String(Math.floor(ms / 3600000) % 24).padStart(2, "0");
      const mm = String(Math.floor(ms / 60000) % 60).padStart(2, "0");
      const ss = String(Math.floor(ms / 1000) % 60).padStart(2, "0");
      const ff = String(Math.floor((ms % 1000) / 33.33)).padStart(2, "0");
      setTc(`${hh}:${mm}:${ss}:${ff}`);
    };
    const iv = window.setInterval(tick, 33);
    return () => window.clearInterval(iv);
  }, [id]);

  const animationKey = useMemo(
    () => activeAnimation?.id ?? "none",
    [activeAnimation]
  );

  const hasAnything =
    id !== "none" ||
    activeCanvasPreset ||
    activeCaption ||
    activeAnimation ||
    activeInteractiveFilter ||
    activeCinematicShot;
  if (!hasAnything) return null;

  return (
    <div ref={containerRef} aria-hidden data-overlay className="absolute inset-0 z-[12] pointer-events-none">
      {/* === Interactive filter — own component layer (may capture taps) === */}
      {activeInteractiveFilter && (
        <InteractiveFilterRenderer
          key={activeInteractiveFilter.id}
          filter={activeInteractiveFilter}
        />
      )}

      {/* === Cinematic shot — overlay-stack renderer === */}
      {activeCinematicShot && (
        <CinematicShotRenderer key={activeCinematicShot.id} preset={activeCinematicShot} />
      )}

      {/* Decorative legacy overlays — never intercept pointer events. */}
      <div className="pointer-events-none absolute inset-0">
        {id === "vhs" && (
          <>
            <div className="absolute inset-0 opacity-40 mix-blend-overlay bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.06)_0px,rgba(255,255,255,0.06)_1px,transparent_1px,transparent_3px)]" />
            <div className="absolute inset-0 shadow-[inset_0_0_140px_40px_rgba(0,0,0,0.45)]" />
            <div
              className="absolute top-4 left-4 flex items-center gap-2 font-mono text-[11px] tracking-[0.2em] text-white/90"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              <span
                className="h-2 w-2 rounded-full bg-red-500"
                style={{ animation: "fx-rec-blink 1s steps(2,end) infinite" }}
              />
              REC
            </div>
            <div
              className="absolute bottom-4 right-4 font-mono text-[11px] tracking-[0.18em] text-white/90"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              {tc}
            </div>
            <div
              className="absolute top-4 right-4 font-mono text-[10px] tracking-[0.18em] text-white/70"
              style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
            >
              SP · LP
            </div>
          </>
        )}

        {id === "cinematic" && (
          <>
            <div className="absolute inset-x-0 top-0 h-[15%] bg-black" />
            <div className="absolute inset-x-0 bottom-0 h-[15%] bg-black" />
          </>
        )}

        {id === "glitch" && (
          <div
            className="absolute inset-0 fx-glitch"
            style={{ animation: "fx-glitch-skew 2.4s steps(1,end) infinite" }}
          />
        )}

        {id === "neon" && (
          <div
            className="absolute inset-2 rounded-[28px]"
            style={{ animation: "fx-neon-pulse 2.4s ease-in-out infinite" }}
          />
        )}

        {/* === Animation preset (re-mounted on change so keyframes restart) === */}
        {activeAnimation && <AnimationLayer key={animationKey} preset={activeAnimation} />}
      </div>

      {/* === Draggable Canvas text overlays === */}
      {activeCanvasPreset?.textOverlays?.map((t) => (
        <CanvasTextLayer
          key={t.id}
          overlay={t}
          presetId={activeCanvasPreset.id}
          containerRef={containerRef}
        />
      ))}

      {/* === Draggable Caption === */}
      {activeCaption && <CaptionLayer caption={activeCaption} containerRef={containerRef} />}
    </div>
  );
};

export default OverlayEngine;
