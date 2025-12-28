// src/features/canvas/ui/DraggableFileViewer.tsx
import React, { useEffect, useState, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import { FileOverlayState } from "@/types/caption";
import { X, File as FileIcon, Loader2, Layers, Move, Sparkles } from "lucide-react";
import { HybridDraggable } from "@/features/canvas/ui/HybridDraggable";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";
import { ThreeDGSViewer } from "./ThreeDGSViewer";
import { convertImageTo3D } from "@/services/mlsharp-api";
import { useToast } from "@/shared/ui/use-toast";

interface DraggableFileViewerProps {
  overlay: FileOverlayState;
  onLayoutChange: (
    id: string,
    layout: Partial<FileOverlayState["layout"]>
  ) => void;
  onRemove: (id: string) => void;
  onAddFile?: (file: File) => void; // New: callback to add file to canvas
  sceneSize: { width: number; height: number };
  isSelected: boolean;
  onSetDynamicLayout: (
    target: { id: string; type: "file" },
    mode: "split-vertical" | "split-horizontal" | "pip" | "reset"
  ) => void;
  onSelect: (id: string) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  viewport: { scale: number; x: number; y: number };
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;
}

// FileRenderer (kept inline for simplicity, or import if separate)
export const FileRenderer: React.FC<{
  overlay: FileOverlayState;
  onAspectRatioDetermined?: (ratio: number) => void;
}> = ({ overlay, onAspectRatioDetermined }) => {
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    let isMounted = true;
    if (overlay.fileType === "text") {
      overlay.file
        .text()
        .then((text) => {
          if (isMounted) setTextContent(text);
        })
        .catch(console.error);
    }
    return () => {
      isMounted = false;
    };
  }, [overlay.file, overlay.fileType]);

  switch (overlay.fileType) {
    case "image":
      return (
        <img
          src={overlay.fileUrl}
          alt={overlay.fileName}
          className="w-full h-full select-none"
          onLoad={(e) => {
            const img = e.currentTarget;
            if (img.naturalWidth && img.naturalHeight) {
              onAspectRatioDetermined?.(img.naturalWidth / img.naturalHeight);
            }
          }}
        />
      );
    case "video":
      return (
        <div className="w-full h-full relative bg-black flex items-center justify-center">
          <video src={overlay.fileUrl} controls className="w-full h-full" />
        </div>
      );
    case "audio":
      return (
        <div className="p-4">
          <audio src={overlay.fileUrl} controls className="w-full" />
        </div>
      );
    case "pdf":
      return (
        <iframe
          src={overlay.fileUrl}
          title={overlay.fileName}
          className="w-full h-full border-none"
        />
      );
    case "text":
      return (
        <pre className="w-full h-full p-4 text-xs whitespace-pre-wrap overflow-auto">
          {textContent}
        </pre>
      );
    case "3d":
      return (
        <ThreeDGSViewer
          url={overlay.fileUrl}
          fileName={overlay.fileName}
          className="bg-black/90"
        />
      );
    default:
      return (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground p-4">
          <FileIcon className="w-16 h-16" />
          <p className="mt-2 text-sm text-center break-all">
            {overlay.fileName}
          </p>
        </div>
      );
  }
};

export const DraggableFileViewer: React.FC<DraggableFileViewerProps> = ({
  overlay,
  onLayoutChange,
  onRemove,
  onAddFile,
  sceneSize,
  isSelected,
  onSetDynamicLayout,
  onSelect,
  onInternalDragStart,
  onInternalDragStop,
  allOverlays,
  onSnapGuidesChange,
}) => {
  // Rotation now handled by HybridDraggable
  const { toast } = useToast();
  const [isGenerating3D, setIsGenerating3D] = useState(false);

  const handleAspectRatioDetermined = (ratio: number) => {
    // Check if current aspect ratio differs significantly
    const currentRatio =
      ((overlay.layout.size.width / 100) * sceneSize.width) /
      ((overlay.layout.size.height / 100) * sceneSize.height);

    if (Math.abs(currentRatio - ratio) > 0.01) {
      // Calculate new height to match aspect ratio, keeping width constant
      // ratio = width / height  =>  height = width / ratio
      const currentWidthPx =
        (overlay.layout.size.width / 100) * sceneSize.width;
      const newHeightPx = currentWidthPx / ratio;
      const newHeightPercent = (newHeightPx / sceneSize.height) * 100;

      onLayoutChange(overlay.id, {
        size: {
          width: overlay.layout.size.width,
          height: newHeightPercent,
        },
      });
    }
  };

  const is3DFile = overlay.fileType === "3d";

  // Handle 3D generation from image using ML-Sharp
  const handleGenerate3D = async () => {
    const apiUrl = import.meta.env.VITE_MLSHARP_API_URL;

    if (!apiUrl) {
      toast({
        title: "Configuration Required",
        description: "Please add VITE_MLSHARP_API_URL to your .env.local file. See MLSHARP_CONFIG.md for details.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating3D(true);

    try {
      toast({
        title: "Generating 3D Model",
        description: "Processing your image with ML-Sharp... This may take 30-60 seconds.",
      });

      // Convert the image to 3D
      const plyBlob = await convertImageTo3D(overlay.file, apiUrl);

      // Create a file from the blob
      const plyFile = new File(
        [plyBlob],
        overlay.fileName.replace(/\.[^/.]+$/, "") + ".ply",
        { type: "application/octet-stream" }
      );

      // Auto-load the PLY file to canvas if callback is available
      if (onAddFile) {
        onAddFile(plyFile);
        toast({
          title: "3D Model Generated!",
          description: "Your 3D model has been added to the canvas.",
        });
      } else {
        // Fallback: download the file if no callback provided
        const plyUrl = URL.createObjectURL(plyFile);
        const link = document.createElement("a");
        link.href = plyUrl;
        link.download = plyFile.name;
        link.click();
        URL.revokeObjectURL(plyUrl);

        toast({
          title: "3D Model Generated!",
          description: "Your PLY file has been downloaded.",
        });
      }
    } catch (error: any) {
      console.error("3D generation failed:", error);
      toast({
        title: "3D Generation Failed",
        description: error.message || "An error occurred while generating the 3D model.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating3D(false);
    }
  };

  return (
    <HybridDraggable
      id={overlay.id}
      position={overlay.layout.position}
      size={overlay.layout.size}
      rotation={overlay.layout.rotation}
      zIndex={overlay.layout.zIndex}
      containerSize={sceneSize}
      isSelected={isSelected}
      minWidth={50} // Reduced min width to allow smaller logos
      minHeight={50}
      onSelect={onSelect}
      onCommit={(id, layout) => {
        onLayoutChange(id, {
          ...(layout.position && { position: layout.position }),
          ...(layout.size && { size: layout.size }),
          ...(layout.rotation !== undefined && { rotation: layout.rotation }),
        });
        onInternalDragStop();
      }}
      allOverlays={allOverlays}
      onSnapGuidesChange={onSnapGuidesChange}
      enableResizing={true}
      enableRotation={true}
      lockAspectRatio={overlay.fileType === "image"}
      // Prevent drag when interacting with media controls or the 3D canvas
      cancelSelector="audio, video, iframe, canvas"
      // If 3D, only allow dragging via specific handles to avoid conflict with orbit controls
      dragHandleSelector={is3DFile ? ".drag-handle" : undefined}
      className={cn(
        "group transition-all duration-200",
        overlay.fileType === "image" ? "bg-transparent" : "bg-card",
        isSelected
          ? "shadow-lg border-2 border-primary"
          : "shadow-none border-2 border-transparent group-hover:border-primary/50"
      )}
    >
      <div className="w-full h-full flex flex-col relative">
        <div
          className={cn(
            "flex-grow w-full h-full relative overflow-hidden rounded-lg",
            overlay.fileType !== "image" && "bg-background/50"
          )}
        >
          <FileRenderer
            overlay={overlay}
            onAspectRatioDetermined={handleAspectRatioDetermined}
          />
        </div>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onRemove(overlay.id);
          }}
          onPointerDown={(e) => e.stopPropagation()}
          className="close-button absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-50 pointer-events-auto shadow-sm"
          style={{ transform: `rotate(-${overlay.layout.rotation || 0}deg)` }}
        >
          <X className="w-4 h-4" />
        </button>

        {/* 3D File Specific Controls */}
        {is3DFile && (
          <>
            {/* Center Drag Handle for 3D Views */}
            {isSelected && (
              <div
                className="drag-handle absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 p-3 bg-black/50 backdrop-blur-md rounded-full cursor-move hover:bg-primary hover:text-white transition-colors group opacity-0 hover:opacity-100"
                title="Drag to move"
              >
                <Move className="w-6 h-6 text-white" />
              </div>
            )}

            {/* Top Bar Drag Handle for 3D Views */}
            <div
              className="drag-handle absolute top-0 left-0 w-full h-8 z-40 cursor-move hover:bg-white/10 transition-colors"
              title="Drag to move window"
            />
          </>
        )}

        {isSelected && (
          <div
            className="absolute top-2 left-2 z-50 flex gap-1 pointer-events-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onLayoutChange(overlay.id, {
                  isBehindUser: !overlay.layout.isBehindUser,
                });
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className={cn(
                "p-1.5 rounded-full shadow-md border border-border/50 backdrop-blur-sm transition-colors cursor-pointer",
                overlay.layout.isBehindUser
                  ? "bg-primary text-primary-foreground"
                  : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground"
              )}
              title={overlay.layout.isBehindUser ? "Behind User" : "In Front"}
            >
              <Layers className="w-3 h-3" />
            </button>
            {/* ML-Sharp 3D Generation Button (Only for Images) */}
            {overlay.fileType === "image" && (
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleGenerate3D();
                }}
                onPointerDown={(e) => e.stopPropagation()}
                disabled={isGenerating3D}
                className={cn(
                  "p-1.5 rounded-full shadow-md border border-border/50 backdrop-blur-sm transition-colors cursor-pointer",
                  isGenerating3D
                    ? "bg-primary/50 text-primary-foreground cursor-not-allowed"
                    : "bg-background/80 text-muted-foreground hover:bg-primary hover:text-primary-foreground"
                )}
                title={isGenerating3D ? "Generating 3D model..." : "Generate 3D model with ML-Sharp"}
              >
                {isGenerating3D ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </HybridDraggable>
  );
};
