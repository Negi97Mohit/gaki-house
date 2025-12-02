import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { TextDesignPreset, TextLayer } from "@/types/textDesign";
import { loadTextDesigns } from "@/lib/textDesigns";
import { TextOverlayState } from "@/types/caption";
import { MultiLayerTextRenderer } from "@/components/MultiLayerTextRenderer";

interface TextDesignSelectorProps {
    overlay: TextOverlayState;
    onStyleChange: (
        id: string,
        style: Partial<TextOverlayState["style"]>
    ) => void;
    onClose: () => void;
    position: { x: number; y: number };
}

const CATEGORIES = [
    { value: "all", label: "All" },
    { value: "headlines", label: "Headlines" },
    { value: "modern", label: "Modern" },
    { value: "elegant", label: "Elegant" },
    { value: "fun", label: "Fun" },
    { value: "effects", label: "Effects" },
];

export const TextDesignSelector: React.FC<TextDesignSelectorProps> = ({
    overlay,
    onStyleChange,
    onClose,
    position,
}) => {
    const [textDesigns, setTextDesigns] = useState<TextDesignPreset[]>([]);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        loadTextDesigns().then(setTextDesigns);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            // Don't close if clicking inside the panel or on the toolbar
            if (
                panelRef.current?.contains(target) ||
                target.closest('[data-toolbar-control]') ||
                target.closest('[data-text-toolbar]')
            ) {
                return;
            }
            onClose();
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const handleApplyDesign = (design: TextDesignPreset) => {
        if (design.layers && design.layers.length > 0) {
            const baseTextLayer = design.layers.find((l) => l.type === "text") as
                | TextLayer
                | undefined;
            let appliedBackgroundColor = "transparent";
            if (
                design.thumbnail &&
                (design.thumbnail.startsWith("#") || design.thumbnail.startsWith("rgb"))
            ) {
                appliedBackgroundColor = design.thumbnail;
            }

            onStyleChange(overlay.id, {
                layers: design.layers,
                fontFamily: baseTextLayer?.fontFamily || "Inter",
                fontSize: baseTextLayer?.fontSize || 48,
                color: baseTextLayer?.color || "#FFFFFF",
                gradient: baseTextLayer?.gradient || undefined,
                letterSpacing: baseTextLayer?.letterSpacing || "normal",
                backgroundColor: appliedBackgroundColor,
                bold: false,
                italic: false,
                underline: false,
                textShadow: "none",
                outline: false,
                shadow: false,
                border: false,
                borderColor: "#FFFFFF",
                borderWidth: 2,
                padding: "0",
            });
        } else if ((design as any).style) {
            const oldStyle = (design as any).style;
            let appliedBackgroundColor = oldStyle.backgroundColor;
            if (
                (!appliedBackgroundColor || appliedBackgroundColor === "transparent") &&
                design.thumbnail &&
                (design.thumbnail.startsWith("#") || design.thumbnail.startsWith("rgb"))
            ) {
                appliedBackgroundColor = design.thumbnail;
            }

            onStyleChange(overlay.id, {
                layers: null,
                fontFamily: oldStyle.fontFamily,
                fontSize: oldStyle.fontSize || 48,
                color: oldStyle.color,
                backgroundColor: appliedBackgroundColor,
                bold: oldStyle.bold,
                italic: oldStyle.italic,
                underline: oldStyle.underline,
                textShadow: oldStyle.textShadow,
                outline: oldStyle.outline,
                shadow: oldStyle.shadow,
                gradient: oldStyle.gradient,
                border: oldStyle.border,
                borderColor: oldStyle.borderColor,
                borderWidth: oldStyle.borderWidth,
                letterSpacing: oldStyle.letterSpacing,
                padding: oldStyle.padding,
            });
        } else {
            console.error(
                "Clicked design preset has no 'layers' or 'style' property:",
                design
            );
        }

        // Don't close - let user preview different designs
    };

    return (
        <div
            ref={panelRef}
            className="absolute bg-background border-2 border-border rounded-xl shadow-2xl p-4"
            style={{
                left: `${position.x}px`,
                top: `${position.y + 60}px`,
                zIndex: "calc(var(--z-text-toolbar) + 5)",
                width: "600px",
                maxHeight: "450px",
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-foreground">Text Designs</h3>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={onClose}
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
            <Tabs defaultValue="all" className="w-full">
                <TabsList className="grid grid-cols-6 w-full mb-3 bg-muted">
                    {CATEGORIES.map((cat) => (
                        <TabsTrigger
                            key={cat.value}
                            value={cat.value}
                            className="text-xs data-[state=active]:bg-background data-[state=active]:text-foreground"
                        >
                            {cat.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
                {CATEGORIES.map((cat) => (
                    <TabsContent key={cat.value} value={cat.value} className="mt-0">
                        <ScrollArea className="h-[320px] w-full pr-4">
                            <div className="grid grid-cols-3 gap-3">
                                {Array.isArray(textDesigns) &&
                                    textDesigns
                                        .filter(
                                            (d) => cat.value === "all" || d.category === cat.value
                                        )
                                        .map((design) => {
                                            const oldStyle = (design as any).style;
                                            const baseTextLayer = design.layers?.find(
                                                (l): l is TextLayer => l.type === "text"
                                            ) as TextLayer | undefined;

                                            // Determine preview background
                                            let previewBackground = design.thumbnail || "#1A1A1A";
                                            if (design.thumbnail?.startsWith("linear-gradient")) {
                                                previewBackground = "#1A1A1A";
                                            } else if (
                                                design.category === "effects" &&
                                                !design.thumbnail?.startsWith("#")
                                            ) {
                                                previewBackground = "#1A1A1A";
                                            }

                                            // Use MultiLayerTextRenderer for accurate preview if design has layers
                                            const hasLayers = design.layers && design.layers.length > 0;

                                            return (
                                                <button
                                                    key={design.id}
                                                    onClick={() => handleApplyDesign(design)}
                                                    className="group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary transition-all hover:scale-105"
                                                    style={{
                                                        background: previewBackground,
                                                    }}
                                                >
                                                    <div className="w-full h-28 flex items-center justify-center p-3">
                                                        {hasLayers ? (
                                                            <div className="transform scale-50 origin-center">
                                                                <MultiLayerTextRenderer
                                                                    text="Aa"
                                                                    layers={design.layers}
                                                                    scale={0.7}
                                                                />
                                                            </div>
                                                        ) : (
                                                            <span
                                                                className="text-2xl font-bold select-none inline-block"
                                                                style={{
                                                                    fontFamily:
                                                                        baseTextLayer?.fontFamily ||
                                                                        oldStyle?.fontFamily ||
                                                                        "Inter",
                                                                    fontSize: "32px",
                                                                    color:
                                                                        baseTextLayer?.color || oldStyle?.color || "#FFFFFF",
                                                                    letterSpacing:
                                                                        baseTextLayer?.letterSpacing ||
                                                                        oldStyle?.letterSpacing ||
                                                                        "normal",
                                                                    WebkitTextStroke:
                                                                        (baseTextLayer as any)?.["-webkit-text-stroke"] ||
                                                                        (oldStyle as any)?.["-webkit-text-stroke"] ||
                                                                        "unset",
                                                                }}
                                                            >
                                                                Aa
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="bg-background border-t border-border p-2">
                                                        <p className="text-xs font-medium text-center truncate text-foreground">
                                                            {design.name}
                                                        </p>
                                                    </div>
                                                </button>
                                            );
                                        })}
                            </div>
                        </ScrollArea>
                    </TabsContent>
                ))}
            </Tabs>
        </div>
    );
};