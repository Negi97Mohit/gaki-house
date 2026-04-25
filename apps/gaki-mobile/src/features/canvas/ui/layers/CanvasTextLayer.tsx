import { useRef, useState } from "react";
import { motion, type PanInfo } from "framer-motion";
import { useFx, type TextStyleOverride } from "@/context/FxContext";
import TextStyleEditor from "@/features/canvas/ui/TextStyleEditor";
import type { CanvasTextOverlay } from "@/data/types";

const SCALE_FACTOR = 0.5;

export function CanvasTextLayer({
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
