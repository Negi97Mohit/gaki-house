import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Type, Palette } from "lucide-react";
import fontsRaw from "@/data/fonts.json";
import { loadFont, loadFonts } from "@/lib/fontLoader";
import type { TextStyleOverride } from "@/context/FxContext";
import { cn } from "@/lib/utils";

const FONTS = fontsRaw as string[];

// Curated Instagram-like palette
const COLORS = [
  "#FFFFFF", "#000000", "#F5F5F5", "#9CA3AF",
  "#EF4444", "#F97316", "#F59E0B", "#EAB308",
  "#84CC16", "#22C55E", "#10B981", "#14B8A6",
  "#06B6D4", "#0EA5E9", "#3B82F6", "#6366F1",
  "#8B5CF6", "#A855F7", "#D946EF", "#EC4899",
  "#F43F5E", "#FDE68A", "#FBCFE8", "#A7F3D0",
];

interface Props {
  initial: string;
  initialStyle: TextStyleOverride;
  onClose: () => void;
  onSave: (next: string, style: TextStyleOverride) => void;
}

export default function TextStyleEditor({ initial, initialStyle, onClose, onSave }: Props) {
  const [value, setValue] = useState(initial);
  const [style, setStyle] = useState<TextStyleOverride>(initialStyle);
  const [panel, setPanel] = useState<"none" | "font" | "color">("none");
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
    ref.current?.select();
  }, []);

  // Preload all candidate fonts when the font picker opens
  useEffect(() => {
    if (panel === "font") loadFonts(FONTS);
  }, [panel]);

  // Make sure currently-selected font is loaded immediately
  useEffect(() => {
    loadFont(style.fontFamily);
  }, [style.fontFamily]);

  const commit = () => onSave(value, style);

  const patch = (p: Partial<TextStyleOverride>) => setStyle((s) => ({ ...s, ...p }));

  const fontSize = Math.max(16, Math.min(96, style.fontSize ?? 32));

  return createPortal(
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md animate-fade-in flex flex-col"
      onPointerDown={(e) => {
        // Tap on backdrop commits, but not on toolbars/panels.
        if (e.target === e.currentTarget) commit();
      }}
    >
      {/* Top toolbar */}
      <div
        className="flex items-center justify-between px-4 pt-4 pb-2 gap-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          {/* Font */}
          <button
            onClick={() => setPanel(panel === "font" ? "none" : "font")}
            className={cn(
              "flex items-center gap-1 h-9 px-3 rounded-full text-[12px] font-semibold border border-white/30 text-white active:scale-95 transition-transform",
              panel === "font" ? "bg-white text-neutral-900" : "bg-black/40"
            )}
            style={{ fontFamily: style.fontFamily ? `"${style.fontFamily}", sans-serif` : undefined }}
          >
            <Type className="h-3.5 w-3.5" />
            {style.fontFamily ?? "Aa"}
          </button>

          {/* Color */}
          <button
            onClick={() => setPanel(panel === "color" ? "none" : "color")}
            className={cn(
              "h-9 w-9 rounded-full border border-white/40 active:scale-95 transition-transform flex items-center justify-center",
              panel === "color" && "ring-2 ring-white"
            )}
            style={{ backgroundColor: style.color ?? "#fff" }}
            aria-label="Text color"
          >
            <Palette className="h-3.5 w-3.5" style={{ color: pickContrast(style.color ?? "#fff") }} />
          </button>

          {/* Align */}
          {([
            ["left", AlignLeft],
            ["center", AlignCenter],
            ["right", AlignRight],
          ] as const).map(([val, Icon]) => (
            <button
              key={val}
              onClick={() => patch({ textAlign: val })}
              className={cn(
                "h-9 w-9 rounded-full border border-white/30 flex items-center justify-center active:scale-95 transition-transform",
                style.textAlign === val ? "bg-white text-neutral-900" : "bg-black/40 text-white"
              )}
              aria-label={`Align ${val}`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}

          {/* Bold / Italic / Underline */}
          {([
            ["bold", Bold],
            ["italic", Italic],
            ["underline", Underline],
          ] as const).map(([key, Icon]) => (
            <button
              key={key}
              onClick={() => patch({ [key]: !style[key] } as Partial<TextStyleOverride>)}
              className={cn(
                "h-9 w-9 rounded-full border border-white/30 flex items-center justify-center active:scale-95 transition-transform",
                style[key] ? "bg-white text-neutral-900" : "bg-black/40 text-white"
              )}
              aria-label={key}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <button
          onClick={commit}
          className="rounded-full bg-white px-5 h-9 text-sm font-bold text-neutral-900 shadow-lg active:scale-95 transition-transform"
        >
          Done
        </button>
      </div>

      {/* Color picker strip */}
      {panel === "color" && (
        <div
          className="px-4 pb-2 overflow-x-auto no-scrollbar"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                onClick={() => patch({ color: c })}
                className={cn(
                  "h-8 w-8 shrink-0 rounded-full border border-white/40 active:scale-90 transition-transform",
                  style.color?.toLowerCase() === c.toLowerCase() && "ring-2 ring-white scale-110"
                )}
                style={{ backgroundColor: c }}
                aria-label={c}
              />
            ))}
          </div>
        </div>
      )}

      {/* Font picker strip */}
      {panel === "font" && (
        <div
          className="px-4 pb-2 overflow-x-auto no-scrollbar"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-2">
            {FONTS.map((f) => (
              <button
                key={f}
                onClick={() => patch({ fontFamily: f })}
                className={cn(
                  "shrink-0 h-9 px-3 rounded-full text-[13px] border border-white/30 text-white bg-black/40 active:scale-95 transition-transform",
                  style.fontFamily === f && "bg-white text-neutral-900 border-white"
                )}
                style={{ fontFamily: `"${f}", sans-serif` }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Center text area */}
      <div
        className="flex-1 flex items-center justify-center px-6"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") onClose();
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) commit();
          }}
          className="w-full max-w-lg bg-transparent outline-none resize-none"
          rows={4}
          style={{
            fontFamily: style.fontFamily ? `"${style.fontFamily}", sans-serif` : undefined,
            fontSize: `${fontSize}px`,
            color: style.color ?? "#fff",
            textAlign: style.textAlign ?? "center",
            fontWeight: style.bold ? 700 : 500,
            fontStyle: style.italic ? "italic" : "normal",
            textDecoration: style.underline ? "underline" : undefined,
            lineHeight: 1.1,
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
          }}
        />
      </div>

      {/* Right-side font size slider (vertical) */}
      <div
        className="absolute left-3 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <input
          type="range"
          min={16}
          max={96}
          step={1}
          value={fontSize}
          onChange={(e) => patch({ fontSize: Number(e.target.value) })}
          className="appearance-none w-40 h-1 bg-white/40 rounded-full -rotate-90 origin-center accent-white"
        />
      </div>
    </div>,
    document.body
  );
}

function pickContrast(hex: string) {
  // Quick light/dark text decision based on luminance
  const c = hex.replace("#", "");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return lum > 0.6 ? "#000" : "#fff";
}
