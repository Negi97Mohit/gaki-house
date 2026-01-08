import React from "react";
import { Wand2, Droplet, Sparkles, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/shared/ui/dropdown-menu";
import { cn } from "@/shared/lib/utils";
import { useFilters } from "@/hooks/useFilters";
// import { FILTER_PRESETS } from "@/lib/filters"; // Deprecated
import { INTERACTIVE_FILTER_PRESETS } from "@/lib/interactiveFilters";

interface PipEffectsMenuProps {
  videoFilter: string;
  onVideoFilterChange: (filter: string) => void;
  activeInteractiveFilter?: string;
  onInteractiveFilterChange?: (filter: string) => void;
}

export const PipEffectsMenu: React.FC<PipEffectsMenuProps> = ({
  videoFilter,
  onVideoFilterChange,
  activeInteractiveFilter,
  onInteractiveFilterChange,
}) => {
  const { filters: filterPresets } = useFilters();

  const hasAnyFilter =
    (videoFilter && videoFilter !== "none") ||
    (activeInteractiveFilter && activeInteractiveFilter !== "none");

  const handleColorFilterClick = (filterStyle: string) => {
    if (videoFilter === filterStyle) {
      onVideoFilterChange("none");
    } else {
      onInteractiveFilterChange?.("none");
      onVideoFilterChange(filterStyle);
    }
  };

  const handleInteractiveFilterClick = (filterId: string) => {
    if (activeInteractiveFilter === filterId) {
      onInteractiveFilterChange?.("none");
    } else {
      onVideoFilterChange("none");
      onInteractiveFilterChange?.(filterId);
    }
  };

  const clearAllFilters = () => {
    onVideoFilterChange("none");
    onInteractiveFilterChange?.("none");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-9 w-9 rounded-xl hover:bg-background/60",
            hasAnyFilter && "text-primary"
          )}
          title="Effects"
        >
          <Wand2 className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        {/* CHANGED: side="right" to avoid occluding the face */}
        <DropdownMenuContent
          side="right"
          align="start"
          sideOffset={10}
          className="z-[var(--z-text-toolbar)] w-72 max-h-[500px] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40"
          onCloseAutoFocus={(e) => e.preventDefault()}
        >
          {hasAnyFilter && (
            <>
              <div className="p-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                  className="w-full text-xs gap-2"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear All Filters
                </Button>
              </div>
              <DropdownMenuSeparator />
            </>
          )}

          <DropdownMenuLabel className="text-xs font-semibold px-3 py-1.5 flex items-center">
            <Droplet className="w-3.5 h-3.5 mr-2" />
            Color Filters
          </DropdownMenuLabel>
          <div className="p-2">
            <div className="grid grid-cols-3 gap-2 w-full max-h-[240px] overflow-y-auto pr-1">
              {filterPresets.map((filter) => {
                const isSelected = videoFilter === filter.style;
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleColorFilterClick(filter.style)}
                    className={cn(
                      "aspect-video rounded-lg border transition-all duration-200 relative overflow-hidden group",
                      isSelected
                        ? "border-primary shadow-md ring-2 ring-primary/30"
                        : "border-border/40 hover:border-border"
                    )}
                    title={`${filter.name}${isSelected ? " (click to remove)" : ""
                      }`}
                  >
                    <img
                      src="placeholder.jpeg"
                      alt={filter.name}
                      className="w-full h-full object-cover"
                      style={{ filter: filter.style }}
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                      <span className="text-white text-[8px] font-semibold truncate block text-center">
                        {filter.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <X className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          <DropdownMenuSeparator />
          <DropdownMenuLabel className="text-xs font-semibold px-3 py-1.5 flex items-center">
            <Sparkles className="w-3.5 h-3.5 mr-2" />
            Interactive Filters
          </DropdownMenuLabel>
          <div className="p-2">
            <div className="grid grid-cols-3 gap-2 w-full max-h-[240px] overflow-y-auto pr-1">
              {INTERACTIVE_FILTER_PRESETS.map((filter) => {
                const isSelected = activeInteractiveFilter === filter.id;
                return (
                  <button
                    key={filter.id}
                    onClick={() => handleInteractiveFilterClick(filter.id)}
                    className={cn(
                      "aspect-video rounded-lg border transition-all duration-200 relative overflow-hidden group",
                      isSelected
                        ? "border-primary shadow-md ring-2 ring-primary/30"
                        : "border-border/40 hover:border-border"
                    )}
                    title={`${filter.name}${isSelected ? " (click to remove)" : ""
                      }`}
                  >
                    <img
                      src={filter.thumbnailUrl}
                      alt={filter.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-1">
                      <span className="text-white text-[8px] font-semibold truncate block text-center">
                        {filter.name}
                      </span>
                    </div>
                    {isSelected && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <X className="w-3 h-3 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};
