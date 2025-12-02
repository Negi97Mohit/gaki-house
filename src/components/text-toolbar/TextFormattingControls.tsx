import React from "react";
import { Button } from "@/components/ui/button";
import {
    Bold,
    Italic,
    Underline,
    AlignLeft,
    AlignCenter,
    AlignRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { TextOverlayState } from "@/types/caption";

interface TextFormattingControlsProps {
    overlay: TextOverlayState;
    onStyleChange: (
        id: string,
        style: Partial<TextOverlayState["style"]>
    ) => void;
}

export const TextFormattingControls: React.FC<TextFormattingControlsProps> = ({
    overlay,
    onStyleChange,
}) => {
    const handleAlignmentChange = (alignment: "left" | "center" | "right") => {
        const command =
            alignment === "left"
                ? "justifyLeft"
                : alignment === "center"
                    ? "justifyCenter"
                    : "justifyRight";
        document.execCommand(command);
        onStyleChange(overlay.id, { textAlign: alignment } as any);
    };

    return (
        <>
            {/* Text Formatting */}
            <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", overlay.style.bold && "bg-accent")}
                onClick={() => document.execCommand("bold")}
            >
                <Bold className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", overlay.style.italic && "bg-accent")}
                onClick={() => document.execCommand("italic")}
            >
                <Italic className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className={cn("h-8 w-8", overlay.style.underline && "bg-accent")}
                onClick={() => document.execCommand("underline")}
            >
                <Underline className="w-4 h-4" />
            </Button>

            <div className="w-px h-6 bg-border" />

            {/* Text Alignment */}
            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-8 w-8",
                    (overlay.style as any).textAlign === "left" && "bg-accent"
                )}
                onClick={() => handleAlignmentChange("left")}
            >
                <AlignLeft className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-8 w-8",
                    (overlay.style as any).textAlign === "center" && "bg-accent"
                )}
                onClick={() => handleAlignmentChange("center")}
            >
                <AlignCenter className="w-4 h-4" />
            </Button>

            <Button
                variant="ghost"
                size="icon"
                className={cn(
                    "h-8 w-8",
                    (overlay.style as any).textAlign === "right" && "bg-accent"
                )}
                onClick={() => handleAlignmentChange("right")}
            >
                <AlignRight className="w-4 h-4" />
            </Button>
        </>
    );
};
