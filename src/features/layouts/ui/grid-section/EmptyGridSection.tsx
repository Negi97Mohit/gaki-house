import React, { useState } from "react";
import { Plus, Search, Paintbrush, Monitor, FileVideo, Upload, Link as LinkIcon, File as FileGeneric, Camera, Palette } from "lucide-react";
import { Button } from "@/shared/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuSubContent,
} from "@/shared/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/shared/ui/dialog";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/tabs";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/shared/ui/popover";
import { AssetLibrary, AssetResult } from "@/features/assets/ui/AssetLibrary";
import { CanvasDesignSelector } from "./CanvasDesignSelector";
import { CanvasSectionState, DEFAULT_CAMERA_STATE, CameraShape, FileType } from "@/types/caption";
import { usePreviewMode } from "@/features/layouts/ui/layouts/dynamic/core/PreviewModeContext";
import { cn } from "@/shared/lib/utils";

interface EmptyGridSectionProps {
    sectionId: string;
    blankCanvasColor: string;
    backgroundImageUrl?: string; // Kept for types compatibility, though we prioritize generic file
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
    const isPreview = usePreviewMode();
    const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
    const [fileUrlInput, setFileUrlInput] = useState("");
    const [isDragging, setIsDragging] = useState(false);
    const [activeTab, setActiveTab] = useState("upload");

    const getFileType = (file: File): FileType => {
        if (file.type.startsWith("image/")) return "image";
        if (file.type.startsWith("video/")) return "video";
        if (file.type.startsWith("audio/")) return "audio";
        if (file.type === "application/pdf") return "pdf";
        if (file.name.endsWith(".ply") || file.name.endsWith(".splat")) return "3d";

        // Check if it's a text file by MIME type
        if (file.type.startsWith("text/")) return "text";

        // Check for programming and markup files by extension
        const textExtensions = [
            // Programming languages
            '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.c', '.cpp', '.cs', '.go',
            '.rs', '.rb', '.php', '.swift', '.kt', '.scala', '.r', '.m', '.h', '.sh',
            '.bash', '.zsh', '.fish', '.ps1', '.bat', '.cmd',
            // Web
            '.html', '.htm', '.css', '.scss', '.sass', '.less', '.vue', '.svelte',
            // Data/Config
            '.json', '.xml', '.yaml', '.yml', '.toml', '.ini', '.cfg', '.conf',
            '.env', '.env.local', '.env.production', '.env.development',
            // Documentation
            '.md', '.markdown', '.txt', '.rst', '.adoc', '.tex',
            // Database
            '.sql', '.graphql', '.prisma',
            // Other
            '.log', '.csv', '.tsv', '.jsonl', '.ndjson'
        ];

        const fileNameLower = file.name.toLowerCase();
        if (textExtensions.some(ext => fileNameLower.endsWith(ext))) {
            return "text";
        }

        return "unknown";
    };

    const handleFileSelect = (file: File) => {
        const fileType = getFileType(file);
        const url = URL.createObjectURL(file);

        onSectionContentChange(sectionId, {
            type: "file",
            url,
            fileType,
            name: file.name,
            // We pass the raw file object implicitly for potential upstream usage if we were using the renderer completely
            // But here we just pass serializable data mostly. 
            // Ideally we'd upload it, but for now we use blob url.
        });
        setIsFileDialogOpen(false);
    };

    const handleUrlSubmit = () => {
        if (!fileUrlInput) return;

        // Simple heuristic for type based on extension
        let fileType: FileType = "unknown";
        const lowerUrl = fileUrlInput.toLowerCase();
        if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp)$/)) fileType = "image";
        else if (lowerUrl.match(/\.(mp4|webm|ogg|mov)$/)) fileType = "video";
        else if (lowerUrl.match(/\.(mp3|wav)$/)) fileType = "audio";
        else if (lowerUrl.match(/\.pdf$/)) fileType = "pdf";

        // If unknown, default to generic file or maybe try to detect? 
        // For video, user expects it to work. If no extension, maybe default to video if user says so?
        // Let's assume user inputs direct links mostly.

        onSectionContentChange(sectionId, {
            type: "file",
            url: fileUrlInput,
            fileType: fileType === "unknown" ? "video" : fileType, // bias towards video for unknown URLs as per user request context? Or keep unknown?
            name: fileUrlInput.split('/').pop() || "Linked File",
        });
        setIsFileDialogOpen(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (isPreview) return;

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isPreview) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    // In preview mode, just show a simple empty placeholder without interactive controls
    if (isPreview) {
        return (
            <div className="w-full h-full bg-muted/20 flex items-center justify-center p-4">
                <div className="opacity-30 text-xs text-muted-foreground">Empty</div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                "w-full h-full flex items-center justify-center p-4 transition-colors duration-200",
                isDragging ? "bg-primary/10 border-2 border-dashed border-primary" : "bg-muted/20"
            )}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
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
                            <Palette className="h-4 w-4 mr-2" />
                            Solid Color
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() => setIsFileDialogOpen(true)}
                        >
                            <FileVideo className="h-4 w-4 mr-2" />
                            File / Media
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onSectionContentChange(sectionId, {
                                    type: "camera",
                                    settings: DEFAULT_CAMERA_STATE,
                                })
                            }
                        >
                            <Camera className="h-4 w-4 mr-2" />
                            Camera
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            onClick={() =>
                                onSectionContentChange(sectionId, {
                                    type: "screen",
                                })
                            }
                        >
                            <Monitor className="h-4 w-4 mr-2" />
                            Share Screen
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
                                                cameraShape: preset.pip.cameraShape as CameraShape,
                                                pipPosition: preset.pip.pipPosition,
                                                pipSize: preset.pip.pipSize,
                                                textOverlays: preset.textOverlays.map((t) => ({
                                                    id: t.id,
                                                    content: t.content,
                                                    style: t.style as any,
                                                    layout: {
                                                        position: t.layout.position,
                                                        size: t.layout.size,
                                                        zIndex: t.layout.zIndex,
                                                        rotation: t.layout.rotation,
                                                        layerOrder: t.layout.layerOrder,
                                                    },
                                                })) as any,
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

                <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Open File</DialogTitle>
                            <DialogDescription>
                                Upload a file or paste a URL to display in this grid section.
                            </DialogDescription>
                        </DialogHeader>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="upload">Upload</TabsTrigger>
                                <TabsTrigger value="url">URL</TabsTrigger>
                            </TabsList>
                            <TabsContent value="upload" className="py-4">
                                <div
                                    className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => document.getElementById('file-upload-input')?.click()}
                                >
                                    <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                    <p className="text-sm text-muted-foreground">Click to upload or drag and drop</p>
                                    <input
                                        type="file"
                                        id="file-upload-input"
                                        className="hidden"
                                        onChange={(e) => {
                                            if (e.target.files?.[0]) handleFileSelect(e.target.files[0]);
                                        }}
                                    />
                                </div>
                            </TabsContent>
                            <TabsContent value="url" className="py-4 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="url">File URL</Label>
                                    <Input
                                        id="url"
                                        placeholder="https://example.com/video.mp4"
                                        value={fileUrlInput}
                                        onChange={(e) => setFileUrlInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                                    />
                                </div>
                                <Button className="w-full" onClick={handleUrlSubmit}>
                                    <LinkIcon className="h-4 w-4 mr-2" />
                                    Open URL
                                </Button>
                            </TabsContent>
                        </Tabs>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};

