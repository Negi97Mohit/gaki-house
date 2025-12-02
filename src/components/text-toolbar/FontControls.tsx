import React from "react";
import { Button } from "@/components/ui/button";
import { Type, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { TextOverlayState } from "@/types/caption";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
    const handleFontFamilyChange = (font: string) => {
        document.execCommand("fontName", false, font);
        onStyleChange(overlay.id, { fontFamily: font });
    };

    const handleFontSizeChange = (delta: number) => {
        const currentSize = overlay.style.fontSize || 16;
        const newSize = Math.max(12, Math.min(300, currentSize + delta));
        onStyleChange(overlay.id, { fontSize: newSize });
    };

    return (
        <>
            {/* Font Family Dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 text-xs font-medium"
                    >
                        <Type className="w-3 h-3 mr-1" />
                        {(overlay.style.fontFamily || "Inter").split(",")[0]}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="max-h-64 overflow-y-auto">
                    {FONT_FAMILIES.map((font) => (
                        <DropdownMenuItem
                            key={font}
                            onClick={() => handleFontFamilyChange(font)}
                            className={cn(
                                (overlay.style.fontFamily || "Inter") === font && "bg-accent"
                            )}
                            style={{ fontFamily: font }}
                        >
                            {font}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

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
