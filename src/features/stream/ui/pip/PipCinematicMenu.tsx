import React, { useState, useRef, useEffect } from "react";
import { Clapperboard, X, Search } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { Input } from "@/shared/ui/input";
import {
  CinematicEffect,
  CinematicPreset,
  CINEMATIC_PRESETS,
  CINEMATIC_CATEGORIES,
} from "./cinematicShotData";

export type { CinematicEffect };

interface PipCinematicMenuProps {
  activeCinematicEffect: CinematicEffect;
  onCinematicEffectChange: (effect: CinematicEffect) => void;
}

export const PipCinematicMenu: React.FC<PipCinematicMenuProps> = ({
  activeCinematicEffect,
  onCinematicEffectChange,
}) => {
  const hasEffect = activeCinematicEffect !== "none";
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Autoscroll to selected shot when menu opens or effect changes
  useEffect(() => {
    if (!isOpen || activeCinematicEffect === "none") return;
    const timer = setTimeout(() => {
      const el = gridRef.current?.querySelector(`[data-shot-id="${activeCinematicEffect}"]`);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [isOpen, activeCinematicEffect]);

  const filtered = CINEMATIC_PRESETS.filter((p) => {
    if (search) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    }
    if (activeCategory === "all") return true;
    return p.category === activeCategory;
  });

  const handleSelectShot = (preset: CinematicPreset) => {
    const isActive = activeCinematicEffect === preset.id;
    onCinematicEffectChange(isActive ? "none" : preset.id);
    // Auto-focus search input after selecting
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 0);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl hover:bg-background/60",
            hasEffect && "text-primary"
          )}
          title="Cinematic Shots"
        >
          <Clapperboard className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="z-[var(--z-text-toolbar)] w-72 max-h-[75vh] bg-background/95 backdrop-blur-xl border-border/40 p-0 flex flex-col"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {/* Header */}
          <div className="p-2 border-b border-border/30 space-y-2">
            {hasEffect && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onCinematicEffectChange("none");
                }}
                className="w-full text-xs gap-2"
              >
                <X className="w-3.5 h-3.5" />
                Clear Effect
              </Button>
            )}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                placeholder="Search shots..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.stopPropagation()}
                className="h-7 pl-7 text-xs bg-muted/50 border-border/30"
              />
            </div>
          </div>

          {/* Category tabs */}
          {!search && (
            <div className="flex gap-1 p-1.5 overflow-x-auto border-b border-border/20 scrollbar-none">
              {CINEMATIC_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveCategory(cat.id);
                  }}
                  className={cn(
                    "text-[9px] font-medium px-2 py-1 rounded-md whitespace-nowrap transition-colors",
                    activeCategory === cat.id
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}

          {/* Preset grid */}
          <div ref={gridRef} className="overflow-y-auto p-2 flex-1">
            <div className="grid grid-cols-2 gap-1.5">
              {filtered.map((preset) => {
                const isActive = activeCinematicEffect === preset.id;
                return (
                  <button
                    key={preset.id}
                    data-shot-id={preset.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectShot(preset);
                    }}
                    className={cn(
                      "flex flex-col items-start gap-0.5 p-2 rounded-lg border transition-all text-left",
                      isActive
                        ? "border-primary bg-primary/10 ring-1 ring-primary/30"
                        : "border-border/30 hover:border-border/60 hover:bg-foreground/5"
                    )}
                  >
                    <div className="flex items-center gap-1.5 w-full">
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: preset.color }}
                      />
                      <span className="text-[10px] font-semibold truncate">
                        {preset.name}
                      </span>
                    </div>
                    <span className="text-[9px] text-muted-foreground leading-tight">
                      {preset.description}
                    </span>
                  </button>
                );
              })}
            </div>
            {filtered.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">No shots found</p>
            )}
          </div>

          {/* Count */}
          <div className="px-2 py-1.5 border-t border-border/20 text-[9px] text-muted-foreground text-center">
            {filtered.length} shot{filtered.length !== 1 ? "s" : ""}
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
