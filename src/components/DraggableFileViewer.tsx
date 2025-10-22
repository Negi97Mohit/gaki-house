// Replace the entire contents of this file with the code below

import React, { useEffect, useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { FileOverlayState, FileType } from "@/types/caption";
import { X, File as FileIcon, Move, Loader2 } from "lucide-react";
import { DynamicLayoutPicker } from "./DynamicLayoutPicker";

interface DraggableFileViewerProps {
  overlay: FileOverlayState;
  onLayoutChange: (
    id: string,
    layout: Partial<FileOverlayState["layout"]>
  ) => void;
  onRemove: (id: string) => void;
  containerSize: { width: number; height: number };
  isSelected: boolean;
  onSetDynamicLayout: (
    target: { id: string; type: "file" },
    mode: "split-vertical" | "split-horizontal"
  ) => void;
  onSelect: (id: string) => void;
}

// --- MOVED AND EXPORTED FOR REUSE ---
export const FileRenderer: React.FC<{ overlay: FileOverlayState }> = ({
  overlay,
}) => {
  const [textContent, setTextContent] = useState("");

  useEffect(() => {
    if (overlay.fileType === "text") {
      overlay.file.text().then(setTextContent).catch(console.error);
    }
  }, [overlay.file, overlay.fileType]);

  switch (overlay.fileType) {
    case "image":
      return (
        <img
          src={overlay.fileUrl}
          alt={overlay.fileName}
          className="w-full h-full object-contain"
        />
      );
    case "video":
      const videoRef = useRef<HTMLVideoElement>(null);
      const [isLoading, setIsLoading] = useState(true);
      const [bufferedPercent, setBufferedPercent] = useState(0);

      useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleWaiting = () => setIsLoading(true);
        const handleCanPlay = () => setIsLoading(false);
        const handleProgress = () => {
          if (video.duration > 0 && video.buffered.length > 0) {
            const bufferedEnd = video.buffered.end(video.buffered.length - 1);
            const percent = (bufferedEnd / video.duration) * 100;
            setBufferedPercent(Math.round(percent));
          }
        };

        video.addEventListener("waiting", handleWaiting);
        video.addEventListener("canplay", handleCanPlay);
        video.addEventListener("progress", handleProgress);

        if (video.readyState >= 3) setIsLoading(false);

        return () => {
          video.removeEventListener("waiting", handleWaiting);
          video.removeEventListener("canplay", handleCanPlay);
          video.removeEventListener("progress", handleProgress);
        };
      }, []);

      return (
        <div className="w-full h-full relative bg-black flex items-center justify-center">
          <video
            ref={videoRef}
            src={overlay.fileUrl}
            controls
            className="w-full h-full"
          />
          {isLoading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 pointer-events-none text-white">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="text-sm mt-2 font-mono">{bufferedPercent}%</p>
            </div>
          )}
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
  containerSize,
  isSelected,
  onSetDynamicLayout,
  onSelect,
}) => {
  // Convert percentage-based layout to pixels for the Rnd component
  const widthPx = (containerSize.width * overlay.layout.size.width) / 100;
  const heightPx = (containerSize.height * overlay.layout.size.height) / 100;
  const xPx =
    (containerSize.width * overlay.layout.position.x) / 100 - widthPx / 2;
  const yPx =
    (containerSize.height * overlay.layout.position.y) / 100 - heightPx / 2;

  return (
    <Rnd
      size={{ width: widthPx, height: heightPx }}
      position={{ x: xPx, y: yPx }}
      minWidth={200}
      minHeight={150}
      bounds="parent"
      dragHandleClassName=".drag-handle"
      onDragStart={() => onSelect(overlay.id)}
      onDragStop={(e, d) => {
        onLayoutChange(overlay.id, {
          position: {
            x: ((d.x + widthPx / 2) / containerSize.width) * 100,
            y: ((d.y + heightPx / 2) / containerSize.height) * 100,
          },
        });
      }}
      onResizeStop={(e, dir, ref, delta, pos) => {
        const newWidth = parseInt(ref.style.width, 10);
        const newHeight = parseInt(ref.style.height, 10);
        onLayoutChange(overlay.id, {
          position: {
            x: ((pos.x + newWidth / 2) / containerSize.width) * 100,
            y: ((pos.y + newHeight / 2) / containerSize.height) * 100,
          },
          size: {
            width: (newWidth / containerSize.width) * 100,
            height: (newHeight / containerSize.height) * 100,
          },
        });
      }}
      className={cn(
        "group pointer-events-auto rounded-lg flex flex-col transition-all duration-200",
        overlay.fileType === "image" ? "bg-transparent" : "bg-card",
        isSelected
          ? "shadow-lg border-2 border-primary"
          : "shadow-none border-2 border-transparent"
      )}
      style={{
        zIndex: overlay.layout.zIndex,
        transform: `rotate(${overlay.layout.rotation}deg)`,
      }}
    >
      <DynamicLayoutPicker
        onSelectLayout={(mode) =>
          onSetDynamicLayout({ id: overlay.id, type: "file" }, mode)
        }
      />
      <div
        onMouseDown={(e) => {
          e.stopPropagation();
          onSelect(overlay.id);
        }}
        className={cn(
          "flex-grow w-full h-full relative rounded-lg overflow-auto",
          overlay.fileType !== "image" && "bg-background/50"
        )}
      >
        <FileRenderer overlay={overlay} />
      </div>
      <div className="drag-handle absolute top-2 left-2 p-1.5 bg-black/20 rounded-md cursor-move opacity-0 group-hover:opacity-100 transition-opacity">
        <Move className="w-4 h-4 text-white" />
      </div>
      <button
        onClick={() => onRemove(overlay.id)}
        title="Remove file"
        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all z-50 hover:scale-110"
      >
        <X className="w-4 h-4" />
      </button>
    </Rnd>
  );
};
