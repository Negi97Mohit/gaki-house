import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@gaki/core/lib/utils";

interface StreamRowProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
}

export const StreamRow: React.FC<StreamRowProps> = ({ title, subtitle, children, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  };

  const scroll = (direction: number) => {
    scrollRef.current?.scrollBy({ left: direction * 600, behavior: "smooth" });
  };

  return (
    <section className={cn("relative group/row", className)}>
      {/* Row header */}
      <div className="px-6 sm:px-10 mb-3">
        <h2 className="text-base sm:text-lg font-bold text-foreground tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-xs text-muted-foreground/60 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Scrollable content */}
      <div className="relative">
        {/* Left scroll button */}
        {canScrollLeft && (
          <button
            onClick={() => scroll(-1)}
            className="absolute left-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-r from-background via-background/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-6 h-6 text-foreground" />
          </button>
        )}

        <div
          ref={scrollRef}
          onScroll={updateScrollState}
          className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-none scroll-smooth px-6 sm:px-10 pb-4 snap-x snap-mandatory"
        >
          {children}
        </div>

        {/* Right scroll button */}
        {canScrollRight && (
          <button
            onClick={() => scroll(1)}
            className="absolute right-0 top-0 bottom-0 z-10 w-12 flex items-center justify-center bg-gradient-to-l from-background via-background/80 to-transparent opacity-0 group-hover/row:opacity-100 transition-opacity"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-6 h-6 text-foreground" />
          </button>
        )}
      </div>
    </section>
  );
};
