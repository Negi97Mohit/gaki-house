import React from "react";
import { Plus, Search, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { AssetLibrary, AssetResult } from "@/components/AssetLibrary";
import { CanvasDesignSelector } from "./CanvasDesignSelector";
import { CanvasSectionState, DEFAULT_CAMERA_STATE } from "@/types/caption";

interface EmptyGridSectionProps {
    sectionId: string;
    blankCanvasColor: string;
    backgroundImageUrl?: string;
    onSectionContentChange: (
        sectionId: string,
        content: CanvasSectionState["content"]
    ) => void;
    onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
}

export const EmptyGridSection: React.FC<EmptyGridSectionProps> = ({
    sectionId,
    blankCanvasColor,
    backgroundImageUrl,
    onSectionContentChange,
    onGridAssetSelect,
}) => {
    return (
        <div className="w-full h-full bg-muted/20 flex items-center justify-center p-4">
            <div className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                            variant="secondary"
                            size="icon"
                            className="opacity-90 hover:opacity-100 h-9 w-9"
                            title="Search Image"
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-80 h-[400px] p-0"
                        style={{ zIndex: 9999 }}
                        onOpenAutoFocus={(e) => e.preventDefault()}
                    >
                        <AssetLibrary
                            onAssetSelect={(asset) => onGridAssetSelect(sectionId, asset)}
                        />
                    </PopoverContent>
                </Popover>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="secondary"
                            size="sm"
                            className="opacity-90 hover:opacity-100"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="z-[999] bg-background">
                        <DropdownMenuItem
                            onClick={() =>
                                onSectionContentChange(sectionId, {
                                    type: "color",
                                    color: blankCanvasColor,
                                })
                            }
                        >
                            Solid Color
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onSectionContentChange(sectionId, {
                                    type: "image",
                                    src: backgroundImageUrl,
                                })
                            }
                        >
                            Background Image
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onSectionContentChange(sectionId, {
                                    type: "camera",
                                    settings: DEFAULT_CAMERA_STATE,
                                })
                            }
                        >
                            Camera
                        </DropdownMenuItem>

                        {/* Canvas Designs Preview */}
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Paintbrush className="h-4 w-4 mr-2" />
                                Canvas Designs
                            </DropdownMenuSubTrigger>
                            <DropdownMenuSubContent className="w-[340px] p-4 max-h-[500px] overflow-y-auto">
                                <CanvasDesignSelector
                                    onSelect={(preset) =>
                                        onSectionContentChange(sectionId, {
                                            type: "camera",
                                            settings: {
                                                ...DEFAULT_CAMERA_STATE,
                                                canvasDesignId: preset.id,
                                                layoutMode: "pip",
                                                sectionBackgroundColor:
                                                    preset.background.blankCanvasColor,
                                                cameraShape: preset.pip.cameraShape,
                                                pipPosition: preset.pip.pipPosition,
                                                pipSize: preset.pip.pipSize,
                                                textOverlays: preset.textOverlays.map((t) => ({
                                                    id: t.id,
                                                    content: t.content,
                                                    style: t.style,
                                                    layout: {
                                                        position: t.layout.position,
                                                        size: t.layout.size,
                                                        zIndex: t.layout.zIndex,
                                                        rotation: t.layout.rotation,
                                                        layerOrder: t.layout.layerOrder,
                                                    },
                                                })),
                                                pipBorder: preset.pip.pipBorder,
                                                pipShadow: preset.pip.pipShadow,
                                                videoFilter: preset.effects.videoFilter || "none",
                                                isBeautifyEnabled:
                                                    preset.effects.isBeautifyEnabled || false,
                                                isNeonEdgeEnabled:
                                                    preset.effects.isNeonEdgeEnabled || false,
                                                neonColor: preset.effects.neonColor || "#00FFFF",
                                                neonIntensity: preset.effects.neonIntensity || 20,
                                            },
                                        })
                                    }
                                />
                            </DropdownMenuSubContent>
                        </DropdownMenuSub>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
};
