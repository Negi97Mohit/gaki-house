import React from "react";
import { ColorPicker } from "@/shared/ui/color-picker";
import { TextOverlayState } from "@/types/caption";

interface ColorControlsProps {
    overlay: TextOverlayState;
    onStyleChange: (
        id: string,
        style: Partial<TextOverlayState["style"]>
    ) => void;
}

export const ColorControls: React.FC<ColorControlsProps> = ({
    overlay,
    onStyleChange,
}) => {
    const handleColorChange = (color: string, isBackground: boolean = false) => {
        if (isBackground) {
            onStyleChange(overlay.id, { backgroundColor: color });
        } else {
            // Handle both solid colors and gradients
            if (color.includes('gradient')) {
                onStyleChange(overlay.id, { color, gradient: color });
            } else {
                onStyleChange(overlay.id, { color, gradient: undefined });
            }
        }
    };

    return (
        <>
            {/* Text Color */}
            <ColorPicker
                value={overlay.style.gradient || overlay.style.color}
                onChange={(color) => handleColorChange(color, false)}
                showGradients={true}
                showAlpha={false}
                label="Text"
            />

            {/* Background Color */}
            <ColorPicker
                value={overlay.style.backgroundColor}
                onChange={(color) => handleColorChange(color, true)}
                showGradients={true}
                showAlpha={true}
                label="BG"
            />
        </>
    );
};
