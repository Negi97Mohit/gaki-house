import { useEffect } from "react";
import { toast } from "sonner";
import { generateId } from "@/lib/id";
import { zIndex } from "@/lib/zIndex";
import {
  SceneState,
  FileOverlayState,
  BrowserOverlayState,
  TextOverlayState,
} from "@/types/caption";

interface UseCanvasPasteProps {
  activeScene: SceneState;
  updateActiveScene: (updater: (scene: SceneState) => SceneState) => void;
  selection: {
    handleDeselectAll: () => void;
    setSelectedFileId: (id: string | null) => void;
    setSelectedBrowserId: (id: string | null) => void;
    setSelectedTextId: (id: string | null) => void;
  };
  isDrawing: boolean;
}

export const useCanvasPaste = ({
  activeScene,
  updateActiveScene,
  selection,
  isDrawing,
}: UseCanvasPasteProps) => {
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      // Ignore if Excalidraw (Drawing Mode) is active
      if (isDrawing) return;

      // Ignore if pasting into an input/textarea
      if (
        (e.target as HTMLElement).tagName === "INPUT" ||
        (e.target as HTMLElement).tagName === "TEXTAREA" ||
        (e.target as HTMLElement).isContentEditable
      ) {
        return;
      }

      const items = e.clipboardData?.items;
      if (!items) return;

      let hasHandled = false;

      // 1. Handle Files (Images, Videos, PDFs)
      if (e.clipboardData.files.length > 0) {
        e.preventDefault();
        hasHandled = true;
        const newFiles: FileOverlayState[] = [];

        Array.from(e.clipboardData.files).forEach((file) => {
          let fileType:
            | "image"
            | "video"
            | "pdf"
            | "audio"
            | "text"
            | "unknown" = "unknown";
          if (file.type.startsWith("image/")) fileType = "image";
          else if (file.type.startsWith("video/")) fileType = "video";
          else if (file.type === "application/pdf") fileType = "pdf";
          else if (file.type.startsWith("audio/")) fileType = "audio";
          else if (file.type.startsWith("text/")) fileType = "text";

          if (fileType !== "unknown") {
            const url = URL.createObjectURL(file);
            newFiles.push({
              id: generateId("file"),
              file,
              fileName: file.name,
              fileType,
              fileUrl: url,
              layout: {
                position: { x: 30, y: 30 },
                size: { width: 40, height: 40 },
                zIndex: zIndex.draggableElement,
                rotation: 0,
                layerOrder: "above-video",
              },
            });
          }
        });

        if (newFiles.length > 0) {
          updateActiveScene((prev) => ({
            ...prev,
            fileOverlays: [...prev.fileOverlays, ...newFiles],
          }));
          toast.success(`Pasted ${newFiles.length} file(s)`);
          selection.handleDeselectAll();
          selection.setSelectedFileId(newFiles[newFiles.length - 1].id);
        }
      }

      // 2. Handle Text / URL
      if (!hasHandled) {
        const text = e.clipboardData.getData("text/plain");
        if (text && text.trim()) {
          e.preventDefault();
          const isUrl = /^(http|https):\/\/[^ "]+$/.test(text);

          if (isUrl) {
            const newBrowser: BrowserOverlayState = {
              id: generateId("browser"),
              url: text,
              layout: {
                position: { x: 25, y: 20 },
                size: { width: 50, height: 60 },
                zIndex: zIndex.draggableElement,
                rotation: 0,
                layerOrder: "above-video",
              },
            };
            updateActiveScene((prev) => ({
              ...prev,
              browserOverlays: [...prev.browserOverlays, newBrowser],
            }));
            toast.success("Pasted URL");
            selection.handleDeselectAll();
            selection.setSelectedBrowserId(newBrowser.id);
          } else {
            const newText: TextOverlayState = {
              id: generateId("text"),
              content: text,
              style: {
                ...activeScene.captionStyle,
                position: { x: 50, y: 50 },
              },
              layout: {
                position: { x: 35, y: 45 },
                size: { width: 30, height: 10 },
                zIndex: zIndex.draggableElement,
                rotation: 0,
              },
            };
            updateActiveScene((prev) => ({
              ...prev,
              textOverlays: [...prev.textOverlays, newText],
            }));
            toast.success("Pasted text");
            selection.handleDeselectAll();
            selection.setSelectedTextId(newText.id);
          }
        }
      }
    };

    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [updateActiveScene, activeScene.captionStyle, selection, isDrawing]);
};
