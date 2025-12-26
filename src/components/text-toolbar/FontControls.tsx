import React, { useState } from "react";
import { Button } from "@/shared/ui/button";
import { Type, Minus, Plus, ChevronDown } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { TextOverlayState } from "@/types/caption";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/popover";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { ALL_FONTS } from "@/lib/fonts";

interface FontControlsProps {
    overlay: TextOverlayState;
    onStyleChange: (
        id: string,
        style: Partial<TextOverlayState["style"]>
    ) => void;
}

const FONT_FAMILIES = ALL_FONTS;

export const FontControls: React.FC<FontControlsProps> = ({
    overlay,
    onStyleChange,
}) => {
    const [fontOpen, setFontOpen] = useState(false);

    const handleFontFamilyChange = (font: string) => {
        document.execCommand("fontName", false, font);
        onStyleChange(overlay.id, { fontFamily: font });
        // Keep open - user can click outside to close
    };

    const handleFontSizeChange = (delta: number) => {
        const currentSize = overlay.style.fontSize || 16;
        const newSize = Math.max(12, Math.min(300, currentSize + delta));
        onStyleChange(overlay.id, { fontSize: newSize });
    };

    return (
        <>
            {/* Font Family Popover */}
            <Popover open={fontOpen} onOpenChange={setFontOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs font-medium"
                    >
                        <Type className="w-3 h-3 mr-1" />
                        {(overlay.style.fontFamily || "Inter").split(",")[0]}
                        <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent 
                    align="start" 
                    className="w-56 p-0"
                    style={{ zIndex: 'calc(var(--z-text-toolbar) + 10)' }}
                    onInteractOutside={(e) => {
                        // Only close if clicking outside, not on other toolbar elements
                        const target = e.target as HTMLElement;
                        if (target.closest('[data-toolbar-control]')) {
                            e.preventDefault();
                        }
                    }}
                >
                    <ScrollArea className="h-64">
                        <div className="p-1">
                            {FONT_FAMILIES.map((font) => (
                                <button
                                    key={font}
                                    onClick={() => handleFontFamilyChange(font)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
                                        "hover:bg-accent hover:text-accent-foreground",
                                        (overlay.style.fontFamily || "Inter") === font && 
                                        "bg-primary/10 text-primary font-medium"
                                    )}
                                    style={{ fontFamily: font }}
                                >
                                    {font}
                                </button>
                            ))}
                        </div>
                    </ScrollArea>
                </PopoverContent>
            </Popover>

            <div className="w-px h-6 bg-border" />

            {/* Font Size Controls */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-md px-1">
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleFontSizeChange(-4)}
                >
                    <Minus className="w-3 h-3" />
                </Button>
                <span className="text-xs font-medium w-10 text-center">
                    {overlay.style.fontSize || 16}
                </span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => handleFontSizeChange(4)}
                >
                    <Plus className="w-3 h-3" />
                </Button>
            </div>
        </>
    );
};