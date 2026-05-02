import React, { useState } from "react";
import {
  Plus,
  Search,
  Paintbrush,
  Monitor,
  FileVideo,
  Upload,
  Link as LinkIcon,
  Palette,
  Camera,
} from "lucide-react";
import { Button } from "@gaki/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@gaki/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@gaki/ui/dialog";
import { Input } from "@gaki/ui/input";
import { Label } from "@gaki/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@gaki/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@gaki/ui/popover";
import { AssetLibrary, AssetResult } from "@/features/assets/ui/AssetLibrary";
import { CanvasDesignSelector } from "./CanvasDesignSelector";
import {
  CanvasSectionState,
  DEFAULT_CAMERA_STATE,
  CameraShape,
  FileType,
} from "@gaki/core/types/caption";
import { usePreviewMode } from "@/features/layouts/ui/layouts/dynamic/core/PreviewModeContext";
import { cn } from "@gaki/core/lib/utils";
import { ScreenSourceSelector } from "@/features/stream/ui/ScreenSourceSelector";

interface EmptyGridSectionProps {
  sectionId: string;
  blankCanvasColor: string;
  backgroundImageUrl?: string;
  onSectionContentChange: (
    sectionId: string,
    content: CanvasSectionState["content"],
  ) => void;
  onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
  forceInteractive?: boolean; // NEW: Bypass Preview mode for floating draggable panels
  videoDevices?: MediaDeviceInfo[]; // Added for camera picker
}

export const EmptyGridSection: React.FC<EmptyGridSectionProps> = ({
  sectionId,
  blankCanvasColor,
  backgroundImageUrl,
  onSectionContentChange,
  onGridAssetSelect,
  forceInteractive = false,
  videoDevices = [],
}) => {
  const isPreviewContext = usePreviewMode();
  const isPreview = isPreviewContext && !forceInteractive; // Allow override
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);
  const [fileUrlInput, setFileUrlInput] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [isSourceSelectorOpen, setIsSourceSelectorOpen] = useState(false);

  const getFileType = (file: File): FileType => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type.startsWith("audio/")) return "audio";
    if (file.type === "application/pdf") return "pdf";
    if (file.name.endsWith(".ply") || file.name.endsWith(".splat")) return "3d";
    if (file.type.startsWith("text/")) return "text";
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
    });
    setIsFileDialogOpen(false);
  };

  const handleUrlSubmit = () => {
    if (!fileUrlInput) return;
    let fileType: FileType = "unknown";
    const lowerUrl = fileUrlInput.toLowerCase();
    if (lowerUrl.match(/\.(jpeg|jpg|gif|png|webp)$/)) fileType = "image";
    else if (lowerUrl.match(/\.(mp4|webm|ogg|mov)$/)) fileType = "video";

    onSectionContentChange(sectionId, {
      type: "file",
      url: fileUrlInput,
      fileType: fileType === "unknown" ? "video" : fileType,
      name: fileUrlInput.split("/").pop() || "Linked File",
    });
    setIsFileDialogOpen(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (isPreview) return;
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) handleFileSelect(files[0]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPreview) setIsDragging(true);
  };

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
        isDragging
          ? "bg-primary/10 border-2 border-dashed border-primary"
          : "bg-muted/20",
      )}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={() => setIsDragging(false)}
    >
      {/* FIXED: We only stop drag propagation on the control cluster itself, not the whole panel */}
      <div
        className="flex flex-col items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="opacity-90 hover:opacity-100 h-9 w-9"
            >
              <Search className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            className="w-80 h-[400px] p-0"
            style={{ zIndex: 9999 }}
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
              <Plus className="h-4 w-4 mr-2" /> Add
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
              <Palette className="h-4 w-4 mr-2" /> Solid Color
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsFileDialogOpen(true)}>
              <FileVideo className="h-4 w-4 mr-2" /> File / Media
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Camera className="h-4 w-4 mr-2" /> Camera
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="z-[1000] w-[240px]">
                {videoDevices && videoDevices.length > 0 && (
                  <>
                    {videoDevices.map((device) => (
                      <DropdownMenuItem
                        key={device.deviceId}
                        onClick={() =>
                          onSectionContentChange(sectionId, {
                            type: "camera",
                            settings: { ...DEFAULT_CAMERA_STATE, selectedDeviceId: device.deviceId, isCameraEnabled: false },
                          })
                        }
                      >
                        {device.label || `Camera (${device.deviceId.slice(0, 5)})`}
                      </DropdownMenuItem>
                    ))}
                  </>
                )}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuItem
              onClick={() => {
                const isElectron = !!(window as any).electron;
                if (isElectron) setIsSourceSelectorOpen(true);
                else onSectionContentChange(sectionId, { type: "screen" });
              }}
            >
              <Monitor className="h-4 w-4 mr-2" /> Share Screen
            </DropdownMenuItem>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Paintbrush className="h-4 w-4 mr-2" /> Canvas Designs
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
            </DialogHeader>
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
              </TabsList>
              <TabsContent value="upload" className="py-4">
                <div
                  className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    document.getElementById("file-upload-input")?.click()
                  }
                >
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload or drag and drop
                  </p>
                  <input
                    type="file"
                    id="file-upload-input"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0])
                        handleFileSelect(e.target.files[0]);
                    }}
                  />
                </div>
              </TabsContent>
              <TabsContent value="url" className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label>File URL</Label>
                  <Input
                    placeholder="https://example.com/video.mp4"
                    value={fileUrlInput}
                    onChange={(e) => setFileUrlInput(e.target.value)}
                  />
                </div>
                <Button className="w-full" onClick={handleUrlSubmit}>
                  <LinkIcon className="h-4 w-4 mr-2" /> Open URL
                </Button>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>
      <ScreenSourceSelector
        isOpen={isSourceSelectorOpen}
        onOpenChange={setIsSourceSelectorOpen}
        onSelect={(sourceId) => {
          onSectionContentChange(sectionId, { type: "screen", sourceId });
          setIsSourceSelectorOpen(false);
        }}
      />
    </div>
  );
};
