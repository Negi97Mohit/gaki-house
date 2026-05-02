import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Heart,
  Share2,
  MessageCircle,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Input } from "@gaki/ui/input";
import { cn } from "@/lib/utils";

const FILTERS = [
  "All",
  "Live",
  "Gaming",
  "Just Chatting",
  "Esports",
  "Music",
  "Creative",
];

type Stream = {
  id: string;
  streamer: string;
  handle: string;
  title: string;
  category: string;
  viewers: string;
  gradient: string;
  accent: string;
};

const STREAMS: Stream[] = [
  {
    id: "1",
    streamer: "Nova",
    handle: "@novastream",
    title: "Late night Valorant ranked grind 🎯",
    category: "Gaming",
    viewers: "12.4k",
    gradient: "from-violet-900 via-fuchsia-900 to-zinc-950",
    accent: "bg-fuchsia-500",
  },
  {
    id: "2",
    streamer: "Kenji",
    handle: "@kenjitalks",
    title: "Just chatting + answering your weird questions",
    category: "Just Chatting",
    viewers: "3.1k",
    gradient: "from-amber-900 via-rose-900 to-zinc-950",
    accent: "bg-amber-500",
  },
  {
    id: "3",
    streamer: "Lumen",
    handle: "@lumenbeats",
    title: "Lo-fi production session • making a beat live",
    category: "Music",
    viewers: "892",
    gradient: "from-indigo-900 via-blue-900 to-zinc-950",
    accent: "bg-indigo-500",
  },
  {
    id: "4",
    streamer: "Apex Sera",
    handle: "@apexsera",
    title: "ALGS qualifier scrims • road to top 10",
    category: "Esports",
    viewers: "28.7k",
    gradient: "from-emerald-900 via-teal-900 to-zinc-950",
    accent: "bg-emerald-500",
  },
  {
    id: "5",
    streamer: "Mira",
    handle: "@miradraws",
    title: "Digital painting commission — finishing tonight",
    category: "Creative",
    viewers: "1.6k",
    gradient: "from-pink-900 via-purple-900 to-zinc-950",
    accent: "bg-pink-500",
  },
];

interface DiscoverScreenProps {
  onControlsVisibilityChange?: (visible: boolean) => void;
}

const DiscoverScreen = ({
  onControlsVisibilityChange,
}: DiscoverScreenProps = {}) => {
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const hideTimerRef = useRef<number | null>(null);

  // Auto-hide controls after 3s of inactivity (paused while a panel is open)
  useEffect(() => {
    if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    if (!controlsVisible) return;
    if (searchOpen || filtersOpen) return;
    hideTimerRef.current = window.setTimeout(
      () => setControlsVisible(false),
      3000,
    );
    return () => {
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
    };
  }, [controlsVisible, searchOpen, filtersOpen]);

  // Notify parent (so the bottom nav can hide/show in sync)
  useEffect(() => {
    onControlsVisibilityChange?.(controlsVisible);
  }, [controlsVisible, onControlsVisibilityChange]);

  // Close panels on outside press
  useEffect(() => {
    if (!searchOpen && !filtersOpen) return;
    const onDown = (e: PointerEvent) => {
      if (!controlsRef.current?.contains(e.target as Node)) {
        setSearchOpen(false);
        setFiltersOpen(false);
      }
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [searchOpen, filtersOpen]);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const handleSurfaceTap = (e: React.PointerEvent) => {
    // Ignore taps inside the controls cluster
    if (controlsRef.current?.contains(e.target as Node)) return;
    if (searchOpen || filtersOpen) {
      setSearchOpen(false);
      setFiltersOpen(false);
      return;
    }
    setControlsVisible((v) => !v);
  };

  const visible = STREAMS.filter((s) => {
    const matchesFilter =
      activeFilter === "All" ||
      activeFilter === "Live" ||
      s.category === activeFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      s.streamer.toLowerCase().includes(q) ||
      s.title.toLowerCase().includes(q) ||
      s.category.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <div
      className="absolute inset-0 z-30 bg-zinc-950 text-white overflow-hidden"
      onPointerDown={handleSurfaceTap}
    >
      {/* Horizontal swipe feed — full immersive */}
      <div
        ref={feedRef}
        className="absolute inset-0 flex overflow-x-auto overflow-y-hidden snap-x snap-mandatory scrollbar-hide"
      >
        {visible.length === 0 ? (
          <div className="w-screen h-full flex items-center justify-center text-zinc-500 text-sm">
            No streams match your search.
          </div>
        ) : (
          visible.map((s, idx) => (
            <StreamCard key={s.id} stream={s} index={idx} />
          ))
        )}
      </div>

      {/* Floating vertical controls — bottom-right, above bottom nav */}
      <div
        ref={controlsRef}
        className={cn(
          "absolute right-3 bottom-28 z-40 flex flex-col items-end gap-3 transition-all duration-300",
          controlsVisible
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-4 pointer-events-none",
        )}
      >
        {/* Search */}
        <div className="flex flex-col items-end gap-2">
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                key="search-panel"
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="origin-bottom-right w-[78vw] max-w-[300px]"
              >
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                  <Input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search streamers, games"
                    className="h-11 pl-9 pr-3 bg-zinc-900/80 backdrop-blur-xl border-white/10 text-white placeholder:text-zinc-400 rounded-full shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)] focus-visible:ring-1 focus-visible:ring-white/30 focus-visible:ring-offset-0"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              setSearchOpen((v) => !v);
              setFiltersOpen(false);
            }}
            aria-label={searchOpen ? "Close search" : "Open search"}
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all active:scale-90 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]",
              searchOpen
                ? "bg-white text-zinc-900 border-white"
                : "bg-zinc-900/70 text-white border-white/10",
            )}
          >
            {searchOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Search className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col items-end gap-2">
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                key="filters-panel"
                initial={{ opacity: 0, scale: 0.9, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 8 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="origin-bottom-right flex flex-col items-end gap-1.5 max-h-[60vh] overflow-y-auto scrollbar-hide p-2 rounded-2xl bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_30px_-8px_rgba(0,0,0,0.6)]"
              >
                {FILTERS.map((f) => {
                  const active = activeFilter === f;
                  return (
                    <button
                      key={f}
                      onClick={() => setActiveFilter(f)}
                      className={cn(
                        "px-3.5 h-8 rounded-full text-xs font-medium transition-all duration-200 border whitespace-nowrap",
                        active
                          ? "bg-violet-500 text-white border-violet-400 shadow-[0_4px_20px_-4px_rgba(139,92,246,0.7)]"
                          : "bg-white/5 text-zinc-200 border-white/10 hover:bg-white/10",
                      )}
                    >
                      {f}
                    </button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => {
              setFiltersOpen((v) => !v);
              setSearchOpen(false);
            }}
            aria-label={filtersOpen ? "Close filters" : "Open filters"}
            className={cn(
              "relative h-12 w-12 rounded-full flex items-center justify-center backdrop-blur-xl border transition-all active:scale-90 shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)]",
              filtersOpen
                ? "bg-white text-zinc-900 border-white"
                : "bg-zinc-900/70 text-white border-white/10",
            )}
          >
            {filtersOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <SlidersHorizontal className="h-5 w-5" />
            )}
            {!filtersOpen && activeFilter !== "All" && (
              <span className="absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full bg-violet-500 border-2 border-zinc-950" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const StreamCard = ({ stream, index }: { stream: Stream; index: number }) => {
  const [liked, setLiked] = useState(false);

  return (
    <article
      className={cn(
        "relative w-screen h-full flex-shrink-0 snap-center overflow-hidden bg-gradient-to-br",
        stream.gradient,
      )}
    >
      {/* Decorative blobs to give the "video" some life */}
      <div
        className="absolute -top-24 -right-20 h-72 w-72 rounded-full opacity-30 blur-3xl"
        style={{
          background: `radial-gradient(circle, white, transparent 60%)`,
        }}
      />
      <div
        className={cn(
          "absolute -bottom-32 -left-20 h-96 w-96 rounded-full opacity-30 blur-3xl",
          stream.accent,
        )}
      />

      {/* Top gradient for legibility */}
      <div className="absolute top-0 inset-x-0 h-48 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
      {/* Bottom gradient for legibility */}
      <div className="absolute bottom-0 inset-x-0 h-72 bg-gradient-to-t from-black/85 via-black/50 to-transparent pointer-events-none" />

      {/* Bottom info — streamer details on top, actions row below.
          Right side is reserved for the floating Search/Filter controls. */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: 0.5,
          delay: 0.15 + index * 0.04,
          ease: "easeOut",
        }}
        className="absolute bottom-24 inset-x-0 pl-4 pr-20 z-10 flex flex-col gap-3"
      >
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={cn(
              "h-11 w-11 rounded-full flex items-center justify-center text-sm font-bold ring-2 ring-white/80 shrink-0",
              stream.accent,
            )}
          >
            {stream.streamer.charAt(0)}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-[15px] truncate">
                {stream.streamer}
              </p>
              <span className="text-[11px] text-zinc-300 truncate">
                {stream.handle}
              </span>
            </div>
            <p className="text-[13px] text-zinc-100/90 leading-snug line-clamp-2 mt-0.5">
              {stream.title}
            </p>
            <span className="inline-block mt-1.5 text-[10px] uppercase tracking-wider font-semibold text-zinc-300">
              {stream.category}
            </span>
          </div>
        </div>

        <div className="flex flex-row gap-2.5 items-center">
          <ActionButton
            label="Like"
            active={liked}
            onClick={() => setLiked((v) => !v)}
          >
            <Heart
              className={cn("h-5 w-5", liked && "fill-red-500 text-red-500")}
            />
          </ActionButton>
          <ActionButton label="Chat">
            <MessageCircle className="h-5 w-5" />
          </ActionButton>
          <ActionButton label="Share">
            <Share2 className="h-5 w-5" />
          </ActionButton>
        </div>
      </motion.div>
    </article>
  );
};

const ActionButton = ({
  children,
  label,
  active,
  onClick,
}: {
  children: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}) => (
  <button
    onClick={onClick}
    aria-label={label}
    className={cn(
      "h-11 w-11 rounded-full flex items-center justify-center bg-white/10 backdrop-blur-md border border-white/15 text-white transition-all active:scale-90",
      active && "bg-white/20",
    )}
  >
    {children}
  </button>
);

export default DiscoverScreen;
