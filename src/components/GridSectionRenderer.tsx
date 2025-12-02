import React from "react";
import { Plus, Search, Paintbrush } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    CanvasSectionState,
    FileOverlayState,
    TextOverlayState,
    CanvasSectionCameraState,
    DEFAULT_CAMERA_STATE,
} from "@/types/caption";
import { CANVAS_PRESETS } from "@/lib/canvasPresets";
import { FileRenderer } from "@/components/DraggableFileViewer";
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
import { AssetLibrary, AssetResult } from "./AssetLibrary";
import { CameraRenderer } from "@/components/CameraRenderer";
import { InteractiveGridSection } from "@/components/InteractiveGridSection";

interface GridSectionRendererProps {
    section: CanvasSectionState;
    cameraStream: MediaStream | null;
    screenStream: MediaStream | null;
    fileOverlays: FileOverlayState[];
    textOverlays: TextOverlayState[];
    blankCanvasColor: string;
    backgroundImageUrl?: string;
    onSectionContentChange: (
        sectionId: string,
        content: CanvasSectionState["content"]
    ) => void;
    onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
    onSectionCameraSettingsChange: (
        sectionId: string,
        settings: Partial<CanvasSectionCameraState>
    ) => void;
    videoDevices?: MediaDeviceInfo[];
    activeSequenceId?: string | null;
    onUserPositionChange?: (pos: { x: number; y: number } | null) => void;
    cameraShape: "rectangle" | "circle" | "rounded";
    backgroundEffect: "none" | "blur" | "image";
}

export const GridSectionRenderer: React.FC<GridSectionRendererProps> = ({
    section,
    cameraStream,
    screenStream,
    fileOverlays,
    textOverlays,
    blankCanvasColor,
    backgroundImageUrl,
    onSectionContentChange,
    onGridAssetSelect,
    onSectionCameraSettingsChange,
    videoDevices = [],
    activeSequenceId,
    onUserPositionChange,
    cameraShape,
    backgroundEffect,
}) => {
    const { content } = section;

    switch (content.type) {
        case "color":
            return (
                <div
                    className="w-full h-full"
                    style={{
                        backgroundColor: content.color || blankCanvasColor,
                    }}
                />
            );

        case "image":
            return (
                <div
                    className="w-full h-full bg-cover bg-center"
                    style={{
                        backgroundImage: `url(${content.src || backgroundImageUrl})`,
                    }}
                />
            );

        case "camera":
            const settings = content.settings;
            // Check if this is a "Canvas Design" section (PiP mode)
            if (settings.layoutMode === "pip") {
                return (
                    <InteractiveGridSection
                        sectionId={section.id}
                        settings={settings}
                        onUpdate={(newSettings) =>
                            onSectionCameraSettingsChange(section.id, newSettings)
                        }
                        cameraStream={cameraStream}
                        videoDevices={videoDevices}
                        isActive={true} // Or manage active state if needed
                        onSelect={() => { }} // Can be used for global selection
                    />
                );
            }

            // Default: Full Camera
            return (
                <CameraRenderer
                    stream={cameraStream}
                    className="w-full h-full object-cover"
                    style={{
                        borderRadius:
                            cameraShape === "circle"
                                ? "50%"
                                : cameraShape === "rounded"
                                    ? "12px"
                                    : "0",
                    }}
                    portalContainer={null}
                    // --- NEW: Device Selection ---
                    videoDevices={videoDevices}
                    selectedDeviceId={settings.selectedDeviceId}
                    onCameraDeviceChange={(deviceId) =>
                        onSectionCameraSettingsChange(section.id, {
                            selectedDeviceId: deviceId,
                        })
                    }
                    // -----------------------------

                    pipBorder={settings.pipBorder}
                    onPipBorderChange={(border) =>
                        onSectionCameraSettingsChange(section.id, {
                            pipBorder: border,
                        })
                    }
                    pipShadow={settings.pipShadow}
                    onPipShadowChange={(shadow) =>
                        onSectionCameraSettingsChange(section.id, {
                            pipShadow: shadow,
                        })
                    }
                    isAutoFramingEnabled={settings.isAutoFramingEnabled}
                    onAutoFramingChange={(enabled) =>
                        onSectionCameraSettingsChange(section.id, {
                            isAutoFramingEnabled: enabled,
                        })
                    }
                    isBeautifyEnabled={settings.isBeautifyEnabled}
                    onBeautifyToggle={(enabled) =>
                        onSectionCameraSettingsChange(section.id, {
                            isBeautifyEnabled: enabled,
                        })
                    }
                    isLowLightEnabled={settings.isLowLightEnabled}
                    onLowLightToggle={(enabled) =>
                        onSectionCameraSettingsChange(section.id, {
                            isLowLightEnabled: enabled,
                        })
                    }
                    videoFilter={settings.videoFilter}
                    onVideoFilterChange={(filter) =>
                        onSectionCameraSettingsChange(section.id, {
                            videoFilter: filter,
                        })
                    }
                    isNeonEdgeEnabled={settings.isNeonEdgeEnabled}
                    onNeonEdgeToggle={(enabled) =>
                        onSectionCameraSettingsChange(section.id, {
                            isNeonEdgeEnabled: enabled,
                        })
                    }
                    neonIntensity={settings.neonIntensity}
                    onNeonIntensityChange={(value) =>
                        onSectionCameraSettingsChange(section.id, {
                            neonIntensity: value,
                        })
                    }
                    neonColor={settings.neonColor}
                    onNeonEdgeColorChange={(color) =>
                        onSectionCameraSettingsChange(section.id, {
                            neonColor: color,
                        })
                    }
                    zoomSensitivity={settings.zoomSensitivity}
                    onZoomSensitivityChange={(value) =>
                        onSectionCameraSettingsChange(section.id, {
                            zoomSensitivity: value,
                        })
                    }
                    trackingSpeed={settings.trackingSpeed}
                    onTrackingSpeedChange={(value) =>
                        onSectionCameraSettingsChange(section.id, {
                            trackingSpeed: value,
                        })
                    }
                    cameraBackground={settings.cameraBackground}
                    onCameraBackgroundChange={(bgId) =>
                        onSectionCameraSettingsChange(section.id, {
                            cameraBackground: bgId,
                        })
                    }
                    onCustomBackgroundUpload={(file) => {
                        const url = URL.createObjectURL(file);
                        onSectionCameraSettingsChange(section.id, {
                            cameraBackground: "image",
                            customBackgroundUrl: url,
                        });
                    }}
                    cameraAspectRatio={settings.cameraAspectRatio}
                    onCameraAspectRatioChange={(ratio) =>
                        onSectionCameraSettingsChange(section.id, {
                            cameraAspectRatio: ratio,
                        })
                    }
                    customAspectRatio={settings.customAspectRatio}
                    onCustomAspectRatioChange={(ratio) =>
                        onSectionCameraSettingsChange(section.id, {
                            customAspectRatio: ratio,
                        })
                    }
                    isFaceTrackingEnabled={settings.isFaceTrackingEnabled}
                    onFaceTrackingToggle={(enabled) =>
                        onSectionCameraSettingsChange(section.id, {
                            isFaceTrackingEnabled: enabled,
                        })
                    }
                    activeInteractiveFilter={settings.activeInteractiveFilter}
                    onInteractiveFilterChange={(filter) =>
                        onSectionCameraSettingsChange(section.id, {
                            activeInteractiveFilter: filter,
                        })
                    }
                    filterIntensity={settings.filterIntensity}
                    onFilterIntensityChange={(value) =>
                        onSectionCameraSettingsChange(section.id, {
                            filterIntensity: value,
                        })
                    }
                    filterColor={settings.filterColor}
                    onFilterColorChange={(color) =>
                        onSectionCameraSettingsChange(section.id, {
                            filterColor: color,
                        })
                    }
                    filterTarget={settings.filterTarget}
                    onFilterTargetChange={(target) =>
                        onSectionCameraSettingsChange(section.id, {
                            filterTarget: target,
                        })
                    }
                    backgroundEffect={backgroundEffect}
                    backgroundImageUrl={backgroundImageUrl}
                    // --- NEW: Only pass tracking callback if this is the active screen in the sequence ---
                    // If no sequence is active, we don't track position to save performance
                    onUserPositionChange={
                        section.id === activeSequenceId ? onUserPositionChange : undefined
                    }
                />
            );

        case "screen":
            if (!screenStream) return <div className="w-full h-full bg-muted" />;
            return (
                <video
                    autoPlay
                    playsInline
                    muted
                    ref={(video) => {
                        if (video && screenStream) video.srcObject = screenStream;
                    }}
                    className="w-full h-full object-cover"
                />
            );

        case "file":
            const fileOverlay = fileOverlays.find((f) => f.id === content.fileId);
            if (!fileOverlay) return <div className="w-full h-full bg-muted" />;
            return (
                <div className="w-full h-full flex items-center justify-center">
                    <FileRenderer overlay={fileOverlay} />
                </div>
            );

        case "text":
            const textOverlay = textOverlays.find((t) => t.id === content.textId);
            if (!textOverlay) return <div className="w-full h-full bg-muted" />;
            return (
                <div
                    className="w-full h-full flex items-center justify-center p-4"
                    style={{
                        fontFamily: textOverlay.style.fontFamily,
                        fontSize: `${textOverlay.style.fontSize}px`,
                        color: textOverlay.style.color,
                        backgroundColor: textOverlay.style.backgroundColor,
                        fontWeight: textOverlay.style.bold ? "bold" : "normal",
                        fontStyle: textOverlay.style.italic ? "italic" : "normal",
                        textDecoration: textOverlay.style.underline ? "underline" : "none",
                    }}
                >
                    {textOverlay.content}
                </div>
            );

        case "empty":
        default:
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
                                    onAssetSelect={(asset) =>
                                        onGridAssetSelect(section.id, asset)
                                    }
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
                                        onSectionContentChange(section.id, {
                                            type: "color",
                                            color: blankCanvasColor,
                                        })
                                    }
                                >
                                    Solid Color
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        onSectionContentChange(section.id, {
                                            type: "image",
                                            src: backgroundImageUrl,
                                        })
                                    }
                                >
                                    Background Image
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        onSectionContentChange(section.id, {
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
                                        <div className="grid grid-cols-2 gap-2">
                                            {CANVAS_PRESETS.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    className="flex flex-col gap-2 p-2 rounded-lg border border-border hover:border-primary hover:bg-accent transition-colors text-left group h-full"
                                                    onClick={() =>
                                                        onSectionContentChange(section.id, {
                                                            type: "camera",
                                                            settings: {
                                                                ...DEFAULT_CAMERA_STATE,
                                                                canvasDesignId: preset.id,
                                                                layoutMode: "pip",
                                                                sectionBackgroundColor:
                                                                    preset.background.blankCanvasColor,
                                                                cameraShape: preset.pip.cameraShape, // ADDED
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
                                                                videoFilter:
                                                                    preset.effects.videoFilter || "none",
                                                                isBeautifyEnabled:
                                                                    preset.effects.isBeautifyEnabled || false,
                                                                isNeonEdgeEnabled:
                                                                    preset.effects.isNeonEdgeEnabled || false,
                                                                neonColor:
                                                                    preset.effects.neonColor || "#00FFFF",
                                                                neonIntensity:
                                                                    preset.effects.neonIntensity || 20,
                                                            },
                                                        })
                                                    }
                                                >
                                                    <div className="w-full aspect-video rounded-md bg-muted/20 flex items-center justify-center overflow-hidden border border-border/50 relative">
                                                        <div
                                                            className="relative overflow-hidden shadow-sm"
                                                            style={{
                                                                aspectRatio: preset.canvasAspectRatio
                                                                    ? preset.canvasAspectRatio.replace(":", "/")
                                                                    : "16/9",
                                                                height:
                                                                    preset.canvasAspectRatio === "21:9"
                                                                        ? "auto"
                                                                        : "100%",
                                                                width:
                                                                    preset.canvasAspectRatio === "21:9"
                                                                        ? "100%"
                                                                        : "auto",
                                                                background:
                                                                    preset.background.blankCanvasColor ||
                                                                    "#000000",
                                                                backgroundSize: "cover",
                                                                backgroundPosition: "center",
                                                            }}
                                                        >
                                                            <div
                                                                className="absolute bg-primary/20 border border-primary/50"
                                                                style={{
                                                                    left: `${preset.pip?.pipPosition?.x || 0}%`,
                                                                    top: `${preset.pip?.pipPosition?.y || 0}%`,
                                                                    width: `${preset.pip?.pipSize?.width || 30
                                                                        }%`,
                                                                    height: `${preset.pip?.pipSize?.height || 30
                                                                        }%`,
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
                                                                        fontSize: `${Math.max(
                                                                            3,
                                                                            t.style.fontSize / 8
                                                                        )}px`,
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
                                                    <span className="text-xs font-medium truncate">
                                                        {preset.name}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    </DropdownMenuSubContent>
                                </DropdownMenuSub>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            );
    }
};
