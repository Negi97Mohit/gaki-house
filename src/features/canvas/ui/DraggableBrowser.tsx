// src/components/DraggableBrowser.tsx
import React, { useState, useRef } from "react";
import { cn } from "@/shared/lib/utils";
import {
  ArrowLeft,
  ArrowRight,
  Globe,
  RefreshCw,
  X,
  Layers,
} from "lucide-react";
import { HybridDraggable } from "@/features/canvas/ui/HybridDraggable";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";
import { GeneratedLayout } from "@/types/caption";

export interface BrowserOverlayState {
  id: string;
  url: string;
  layout: GeneratedLayout;
}

interface DraggableBrowserProps {
  overlay: BrowserOverlayState;
  onLayoutChange: (
    id: string,
    layout: Partial<BrowserOverlayState["layout"]>
  ) => void;
  onUrlChange: (id: string, url: string) => void;
  onRemove: (id: string) => void;
  sceneSize: { width: number; height: number };
  onSetDynamicLayout: (
    target: { id: string; type: "browser" },
    mode: any
  ) => void;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onInternalDragStart: () => void;
  onInternalDragStop: () => void;
  viewport: { scale: number; x: number; y: number };
  allOverlays?: OverlayElement[];
  onSnapGuidesChange?: (guides: GuideLine[]) => void;
}

export const DraggableBrowser: React.FC<DraggableBrowserProps> = ({
  overlay,
  onLayoutChange,
  onUrlChange,
  onRemove,
  sceneSize,
  onSetDynamicLayout,
  isSelected,
  onSelect,
  onInternalDragStart,
  onInternalDragStop,
  allOverlays,
  onSnapGuidesChange,
}) => {
  const [inputUrl, setInputUrl] = useState(overlay.url);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleSubmitUrl = (e: React.FormEvent) => {
    e.preventDefault();
    const formattedUrl = inputUrl.startsWith("http")
      ? inputUrl
      : `https://${inputUrl}`;
    onUrlChange(overlay.id, formattedUrl);
  };

  // Rotation now handled by HybridDraggable

  return (
    <HybridDraggable
      id={overlay.id}
      position={overlay.layout.position}
      size={overlay.layout.size}
      rotation={overlay.layout.rotation}
      zIndex={overlay.layout.zIndex}
      containerSize={sceneSize}
      isSelected={isSelected}
      minWidth={250}
      minHeight={200}
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
      cancelSelector="input, button, iframe"
      className={cn(
        "group pointer-events-auto bg-card rounded-lg flex flex-col transition-all duration-200",
        isSelected
          ? "shadow-lg border-2 border-primary"
          : "shadow-none border-2 border-transparent group-hover:border-primary/50"
      )}
    >
      <div className="w-full h-full flex flex-col rounded-lg relative overflow-hidden">
        {/* Browser Toolbar - Acts as Drag Handle */}
        <div
          className="flex-shrink-0 h-10 bg-secondary flex items-center p-2 gap-2 cursor-move rounded-t-lg"
          onMouseDown={() => onSelect(overlay.id)}
        >
          <button
            onClick={() => iframeRef.current?.contentWindow?.history.back()}
            className="p-1 hover:bg-primary/20 rounded-sm"
          >
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={() => iframeRef.current?.contentWindow?.location.reload()}
            className="p-1 hover:bg-primary/20 rounded-sm"
          >
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          </button>
          <Globe className="w-4 h-4 text-muted-foreground" />
          <form onSubmit={handleSubmitUrl} className="flex-1">
            <input
              type="text"
              value={inputUrl}
              onChange={(e) => setInputUrl(e.target.value)}
              className="w-full bg-background rounded-sm px-2 py-0.5 text-xs"
              onMouseDown={(e) => e.stopPropagation()}
              placeholder="Enter URL..."
            />
          </form>
          <button
            onClick={handleSubmitUrl}
            className="p-1 hover:bg-primary/20 rounded-sm"
          >
            <ArrowRight className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-border mx-1" />

          <button
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation();
              onLayoutChange(overlay.id, { isBehindUser: !overlay.layout.isBehindUser });
            }}
            className={cn(
              "p-1 rounded-sm transition-colors",
              overlay.layout.isBehindUser
                ? "bg-primary/20 text-primary hover:bg-primary/30"
                : "text-muted-foreground hover:bg-primary/20 hover:text-foreground"
            )}
            title={overlay.layout.isBehindUser ? "Currently Behind User (Click to move front)" : "Currently In Front (Click to move behind)"}
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-grow w-full h-full relative border-none bg-white">
          <iframe
            ref={iframeRef}
            src={overlay.url}
            className="w-full h-full"
            sandbox="allow-forms allow-modals allow-pointer-lock allow-popups allow-presentation allow-same-origin allow-scripts"
            title={`browser-overlay-${overlay.id}`}
          />
          {/* Overlay to prevent iframe capturing clicks while dragging */}
          <div className="absolute inset-0 pointer-events-none" />
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(overlay.id);
          }}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:scale-110 z-50"
          style={{ transform: `rotate(-${overlay.layout.rotation || 0}deg)` }}
        >
          <X className="w-4 h-4" />
        </button>

      </div>
    </HybridDraggable>
  );
};
