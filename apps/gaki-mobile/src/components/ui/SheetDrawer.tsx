import { ReactNode, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
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

  const handleDragEnd = (
    _: any,
    info: { offset: { y: number }; velocity: { y: number } }
  ) => {
    if (info.offset.y > 100 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <motion.div
            className={cn("absolute inset-0 pointer-events-auto", !transparent && "bg-black/30")}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onPointerDown={onClose}
          />
          <motion.div
            className={
              transparent
                ? "absolute bottom-0 inset-x-0 max-h-[85vh] flex flex-col bg-transparent p-4 pointer-events-auto safe-bottom"
                : "absolute bottom-0 inset-x-0 max-h-[85vh] flex flex-col bg-white/90 backdrop-blur-xl border-t border-white/60 rounded-t-[2rem] shadow-elevated p-4 pointer-events-auto safe-bottom"
            }
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.4 }}
            onDragEnd={handleDragEnd}
          >
            {!transparent && (
              <div className="mx-auto h-1.5 w-12 rounded-full bg-neutral-900/40 mb-3 cursor-grab active:cursor-grabbing" />
            )}
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SheetDrawer;
