import { ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SheetDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  eyebrow?: string;
  children: ReactNode;
  transparent?: boolean;
}

const SheetDrawer = ({ open, onClose, title, eyebrow, children, transparent = false }: SheetDrawerProps) => {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-40 pointer-events-none">
      <div 
        className={cn("absolute inset-0 animate-fade-in-up pointer-events-auto", !transparent && "bg-black/30")}
        onPointerDown={onClose}
      />
      <div
        className={
          transparent
            ? "absolute bottom-0 inset-x-0 max-h-[85vh] flex flex-col bg-transparent p-4 pointer-events-auto safe-bottom"
            : "absolute bottom-0 inset-x-0 max-h-[85vh] flex flex-col bg-white/90 backdrop-blur-xl border-t border-white/60 rounded-t-[2rem] shadow-elevated p-4 pointer-events-auto safe-bottom"
        }
        style={{ animation: "fade-in-up 0.35s var(--ease-out-soft) both" }}
      >
        {!transparent && <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-900/40 mb-3" />}
        {!transparent && (title || eyebrow) && (
          <div className="flex items-start justify-between px-1 mb-3">
            <div>
              {eyebrow && (
                <div className="text-[10px] font-bold tracking-[0.15em] uppercase text-neutral-900/60">
                  {eyebrow}
                </div>
              )}
              {title && (
                <h2 className="font-display text-2xl text-neutral-900 leading-tight">{title}</h2>
              )}
            </div>
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-8 w-8 rounded-full bg-white/40 border border-white/50 flex items-center justify-center text-neutral-900"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className={transparent ? "flex-1 overflow-y-auto no-scrollbar -mx-1 px-1 pb-32" : "flex-1 overflow-y-auto no-scrollbar -mx-1 px-1 pb-36"}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default SheetDrawer;
