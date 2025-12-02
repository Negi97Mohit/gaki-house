import React from "react";
import { CANVAS_PRESETS } from "@/lib/canvasPresets";

interface CanvasDesignSelectorProps {
    onSelect: (preset: (typeof CANVAS_PRESETS)[0]) => void;
}

export const CanvasDesignSelector: React.FC<CanvasDesignSelectorProps> = ({
    onSelect,
}) => {
    return (
        <div className="grid grid-cols-2 gap-2">
            {CANVAS_PRESETS.map((preset) => (
                <button
                    key={preset.id}
                    className="flex flex-col gap-2 p-2 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left group h-full"
                    onClick={() => onSelect(preset)}
                >
                    <div className="w-full aspect-video rounded-md bg-muted/20 flex items-center justify-center overflow-hidden border border-border/50 relative">
                        <div
                            className="relative overflow-hidden shadow-sm"
                            style={{
                                aspectRatio: preset.canvasAspectRatio
                                    ? preset.canvasAspectRatio.replace(":", "/")
                                    : "16/9",
                                height: preset.canvasAspectRatio === "21:9" ? "auto" : "100%",
                                width: preset.canvasAspectRatio === "21:9" ? "100%" : "auto",
                                background: preset.background.blankCanvasColor || "#000000",
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        >
                            <div
                                className="absolute bg-primary/20 border border-primary/50"
                                style={{
                                    left: `${preset.pip?.pipPosition?.x || 0}%`,
                                    top: `${preset.pip?.pipPosition?.y || 0}%`,
                                    width: `${preset.pip?.pipSize?.width || 30}%`,
                                    height: `${preset.pip?.pipSize?.height || 30}%`,
                                    borderRadius:
                                        preset.pip.cameraShape === "circle"
                                            ? "50%"
                                            : preset.pip.cameraShape === "rounded"
                                                ? "4px"
                                                : "0px",
                                    border: preset.pip.pipBorder
                                        ? `${Math.max(
                                            1,
                                            preset.pip.pipBorder.width / 6
                                        )}px solid ${preset.pip.pipBorder.color}`
                                        : undefined,
                                }}
                            />
                            {preset.textOverlays?.map((t, i) => (
                                <div
                                    key={i}
                                    className="absolute flex items-center justify-center overflow-hidden"
                                    style={{
                                        left: `${t.layout.position.x}%`,
                                        top: `${t.layout.position.y}%`,
                                        width: `${t.layout.size.width}%`,
                                        height: `${t.layout.size.height}%`,
                                        transform: `rotate(${t.layout.rotation}deg)`,
                                        fontFamily: t.style.fontFamily,
                                        fontSize: `${Math.max(3, t.style.fontSize / 8)}px`,
                                        color: t.style.color,
                                        backgroundColor: t.style.backgroundColor,
                                        textAlign: t.style.textAlign as any,
                                        fontWeight: t.style.fontWeight,
                                        whiteSpace: "nowrap",
                                        lineHeight: 1,
                                        zIndex: 10,
                                    }}
                                >
                                    {t.content.replace(/<[^>]+>/g, "")}
                                </div>
                            ))}
                        </div>
                    </div>
                    <span className="text-xs font-medium truncate">{preset.name}</span>
                </button>
            ))}
        </div>
    );
};
