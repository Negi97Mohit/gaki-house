import { useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { useFx, type TextStyleOverride } from "@/context/FxContext";
import TextStyleEditor from "@/features/canvas/ui/TextStyleEditor";
import type { CaptionPreset } from "@/data/types";

export function CaptionLayer({
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
