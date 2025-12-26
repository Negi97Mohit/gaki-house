import React from "react";
import { Button } from "@/shared/ui/button";
import { Type } from "lucide-react";
import { TextOverlayState } from "@/types/caption";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu";

interface ColorControlsProps {
    overlay: TextOverlayState;
    onStyleChange: (
        id: string,
        style: Partial<TextOverlayState["style"]>
    ) => void;
}

const PRESET_COLORS = [
    "#FFFFFF",
    "#000000",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#FFFF00",
    "#FF00FF",
    "#00FFFF",
    "#FFA500",
    "#800080",
];

export const ColorControls: React.FC<ColorControlsProps> = ({
    overlay,
    onStyleChange,
}) => {
    const handleColorChange = (color: string, isBackground: boolean = false) => {
        if (isBackground) {
            onStyleChange(overlay.id, { backgroundColor: color });
        } else {
            document.execCommand("foreColor", false, color);
            onStyleChange(overlay.id, { color });
        }
    };

    return (
        <>
            {/* Text Color */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 relative">
                        <Type className="w-4 h-4" />
                        <div
                            className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-1 rounded"
                            style={{ backgroundColor: overlay.style.color }}
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-[10000] bg-popover border border-border shadow-xl">
                    <div className="grid grid-cols-5 gap-2 p-2">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                className="w-8 h-8 rounded-md border-2 border-border hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(color)}
                            />
                        ))}
                    </div>
                    <div className="p-2 pt-0">
                        <input
                            type="color"
                            value={overlay.style.color}
                            onChange={(e) => handleColorChange(e.target.value)}
                            className="w-full h-8 rounded cursor-pointer"
                        />
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Background Color */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Background Color"
                    >
                        <div
                            className="w-5 h-5 rounded border-2 border-border"
                            style={{ backgroundColor: overlay.style.backgroundColor }}
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-[10000] bg-popover border border-border shadow-xl">
                    <div className="grid grid-cols-5 gap-2 p-2">
                        {PRESET_COLORS.map((color) => (
                            <button
                                key={color}
                                className="w-8 h-8 rounded-md border-2 border-border hover:scale-110 transition-transform"
                                style={{ backgroundColor: color }}
                                onClick={() => handleColorChange(color, true)}
                            />
                        ))}
                        <button
                            className="w-8 h-8 rounded-md border-2 border-border hover:scale-110 transition-transform bg-transparent"
                            onClick={() => handleColorChange("transparent", true)}
                            title="Transparent"
                        >
                            <div className="w-full h-full bg-gradient-to-br from-red-500 via-transparent to-red-500 opacity-30" />
                        </button>
                    </div>
                    <div className="p-2 pt-0">
                        <input
                            type="color"
                            value={overlay.style.backgroundColor}
                            onChange={(e) => handleColorChange(e.target.value, true)}
                            className="w-full h-8 rounded cursor-pointer"
                        />
                    </div>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
