import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

/**
 * Tracks whether a scroll container has more content to the left / right and
 * returns a CSS mask that fades whichever edges are clipped.
 */
export function useScrollEdges<T extends HTMLElement>(
  ref: React.RefObject<T | null>,
) {
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, [ref]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    // Items added/removed or portaled in change scrollWidth, not the box size.
    const mo = new MutationObserver(update);
    mo.observe(el, { childList: true, subtree: true });
    return () => {
      ro.disconnect();
      mo.disconnect();
    };
  }, [ref, update]);

  const edgeMask = `linear-gradient(to right, ${canLeft ? "transparent 0, #000 20px" : "#000 0"}, ${canRight ? "#000 calc(100% - 20px), transparent 100%" : "#000 100%"})`;

  return { canLeft, canRight, update, edgeMask };
}

export interface HScrollStripProps {
  children: React.ReactNode;
  className?: string;
  /** Classes for the scrolling row itself (gap, padding...). */
  trackClassName?: string;
  /** Show chevron buttons when there is overflow (default true). */
  showArrows?: boolean;
}

/**
 * A single horizontally scrollable row with scroll-snap, soft edge fades and
 * chevron buttons (so mouse users without a horizontal wheel can navigate).
 * Children should be fixed-width (`shrink-0`) items.
 */
export const HScrollStrip: React.FC<HScrollStripProps> = ({
  children,
  className,
  trackClassName,
  showArrows = true,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const { canLeft, canRight, update, edgeMask } = useScrollEdges(trackRef);

  const scrollByPage = (dir: -1 | 1) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  const arrowClass =
    "absolute top-1/2 -translate-y-1/2 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/10 bg-black/70 text-white/80 backdrop-blur hover:text-white hover:border-white/25 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40";

  return (
    // container-type lets children size themselves from the strip's own width
    // (cqw units), so tiles adapt to panel width, not just viewport width.
    <div
      className={cn("relative", className)}
      style={{ containerType: "inline-size" }}
    >
      <div
        ref={trackRef}
        onScroll={update}
        className={cn(
          "no-scrollbar flex overflow-x-auto overflow-y-hidden snap-x snap-proximity overscroll-x-contain",
          trackClassName,
        )}
        style={{ WebkitMaskImage: edgeMask, maskImage: edgeMask }}
      >
        {children}
      </div>
      {showArrows && canLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => scrollByPage(-1)}
          className={cn(arrowClass, "left-0.5")}
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
      )}
      {showArrows && canRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => scrollByPage(1)}
          className={cn(arrowClass, "right-0.5")}
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
