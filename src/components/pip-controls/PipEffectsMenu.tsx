import React from "react";
import { Wand2, Droplet, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { FILTER_PRESETS } from "@/lib/filters";
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
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 rounded-xl hover:bg-background/60"
                    title="Effects"
                >
                    <Wand2 className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuPortal>
                <DropdownMenuContent
                    align="start"
                    className="z-[var(--z-text-toolbar)] w-72 max-h-[500px] overflow-y-auto bg-background/95 backdrop-blur-xl border-border/40"
                    onCloseAutoFocus={(e) => e.preventDefault()}
                >
                    <DropdownMenuLabel className="text-xs font-semibold px-3 py-1.5 flex items-center">
                        <Droplet className="w-3.5 h-3.5 mr-2" />
                        Color Filters
                    </DropdownMenuLabel>
                    <div className="p-2">
                        <div className="grid grid-cols-3 gap-2 w-full max-h-[240px] overflow-y-auto pr-1">
                            {FILTER_PRESETS.map((filter) => {
                                const isSelected = videoFilter === filter.style;
                                return (
                                    <button
                                        key={filter.id}
                                        onClick={() => onVideoFilterChange(filter.style)}
                                        className={cn(
                                            "aspect-video rounded-lg border transition-all duration-200 relative overflow-hidden group",
                                            isSelected
                                                ? "border-primary shadow-md ring-2 ring-primary/30"
                                                : "border-border/40 hover:border-border"
                                        )}
                                        title={filter.name}
                                    >
                                        <img
                                            src="/placeholder.jpeg"
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
                                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
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
                                        onClick={() => onInteractiveFilterChange?.(filter.id as any)}
                                        className={cn(
                                            "aspect-video rounded-lg border transition-all duration-200 relative overflow-hidden group",
                                            isSelected
                                                ? "border-primary shadow-md ring-2 ring-primary/30"
                                                : "border-border/40 hover:border-border"
                                        )}
                                        title={filter.name}
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
                                            <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-primary" />
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
