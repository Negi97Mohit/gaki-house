// src/components/video-canvas/OverlayLayer.tsx
import React from "react";
import {
  GeneratedOverlay,
  FileOverlayState,
  TextOverlayState,
  BrowserOverlayState,
  GeneratedLayout,
} from "@/types/caption";
import { DraggableHtmlOverlay } from "./DraggableHtmlOverlay";
import { DraggableBrowser } from "@/components/DraggableBrowser";
import { DraggableFileViewer } from "@/components/DraggableFileViewer";
import { DraggableTextOverlay } from "@/components/DraggableTextOverlay";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";

interface OverlayLayerProps {
  layerOrder: "above-video" | "below-video";
  sceneId: string;
  containerSize: { width: number; height: number };
  viewport: { scale: number; x: number; y: number };

  // Data sources
  htmlOverlays: GeneratedOverlay[];
  browserOverlays: BrowserOverlayState[];
  fileOverlays: FileOverlayState[];
  textOverlays: TextOverlayState[];
  activeDynamicTargetId?: string;

  // Handlers
  onSetDynamicLayout: any;
  onOverlayLayoutChange: any;
  onRemoveOverlay: any;
  onPreviewGenerated: any;
  onUpdateOverlayMetadata?: (id: string, metadata: any) => void;
  portalContainer: any;
  allOverlays: OverlayElement[];
  onSnapGuidesChange: (guides: GuideLine[]) => void;

  // Browser handlers
  onRemoveBrowser: any;
  onBrowserUrlChange: any;
  onBrowserLayoutChange: any;
  selectedBrowserId: string | null;
  onSelectBrowser: any;

  // File handlers
  onRemoveFile: any;
  onFileLayoutChange: any;
  selectedFileId: string | null;
  onSelectFile: any;

  // Text handlers
  onTextLayoutChange: any;
  onTextStyleChange: any;
  onTextContentChange: any;
  onRemoveTextOverlay: any;
  containerRef: any;
  selectedTextId: string | null;
  onSelectText: any;
  isSpacePressed: boolean;

  // Global Drag handlers
  onInternalDragStart: any;
  onInternalDragStop: any;
  selectedGeneratedId?: string | null;
  onSelectGenerated?: (id: string | null) => void;
  onBannerDoubleClick?: (id: string, e: React.MouseEvent) => void;
}

export const OverlayLayer: React.FC<OverlayLayerProps> = ({
  layerOrder,
  sceneId,
  containerSize,
  viewport,
  htmlOverlays,
  browserOverlays,
  fileOverlays,
  textOverlays,
  activeDynamicTargetId,
  onSetDynamicLayout,
  onOverlayLayoutChange,
  onRemoveOverlay,
  onPreviewGenerated,
  onUpdateOverlayMetadata,
  portalContainer,
  allOverlays,
  onSnapGuidesChange,
  onRemoveBrowser,
  onBrowserUrlChange,
  onBrowserLayoutChange,
  selectedBrowserId,
  onSelectBrowser,
  onRemoveFile,
  onFileLayoutChange,
  selectedFileId,
  onSelectFile,
  onTextLayoutChange,
  onTextStyleChange,
  onTextContentChange,
  onRemoveTextOverlay,
  containerRef,
  selectedTextId,
  onSelectText,
  isSpacePressed,
  onInternalDragStart,
  onInternalDragStop,
  selectedGeneratedId,
  onSelectGenerated,
  onBannerDoubleClick,
}) => {
  if (!containerSize.width || !containerSize.height) return null;

  // Filter overlays based on dynamic layout (exclude if active target)
  const filterDynamic = (id: string) => id !== activeDynamicTargetId;

  // Helper to check layer order
  const checkLayer = (layout: GeneratedLayout) => {
    if (layerOrder === "above-video") {
      return (
        !layout.layerOrder ||
        layout.layerOrder === "above-video" ||
        layout.layerOrder === "auto"
      );
    }
    return layout.layerOrder === "below-video";
  };

  return (
    <div className="w-full h-full relative">
      {/* HTML Overlays */}
      {htmlOverlays
        .filter((o) => filterDynamic(o.id) && checkLayer(o.layout))
        .map((overlay) => (
          <DraggableHtmlOverlay
            key={overlay.id}
            overlay={overlay}
            onSetDynamicLayout={onSetDynamicLayout}
            onLayoutChange={onOverlayLayoutChange}
            onRemoveOverlay={onRemoveOverlay}
            onPreviewGenerated={onPreviewGenerated}
            onUpdateMetadata={onUpdateOverlayMetadata}
            containerSize={containerSize}
            portalContainer={portalContainer}
            allOverlays={allOverlays}
            onSnapGuidesChange={onSnapGuidesChange}
            isSelected={selectedGeneratedId === overlay.id}
            onSelect={onSelectGenerated}
            onDoubleClick={onBannerDoubleClick}
          />
        ))}

      {/* Browser Overlays */}
      {browserOverlays
        .filter(
          (o) => filterDynamic(o.id) && checkLayer(o.layout as GeneratedLayout)
        )
        .map((browser) => (
          <DraggableBrowser
            key={`${sceneId}-${browser.id}`}
            overlay={browser}
            viewport={viewport}
            onSetDynamicLayout={onSetDynamicLayout}
            onRemove={onRemoveBrowser}
            onUrlChange={onBrowserUrlChange}
            onLayoutChange={onBrowserLayoutChange}
            sceneSize={containerSize}
            isSelected={selectedBrowserId === browser.id}
            onInternalDragStart={onInternalDragStart}
            onInternalDragStop={onInternalDragStop}
            onSelect={onSelectBrowser}
            allOverlays={allOverlays}
            onSnapGuidesChange={onSnapGuidesChange}
          />
        ))}

      {/* File Overlays */}
      {fileOverlays
        .filter(
          (o) => filterDynamic(o.id) && checkLayer(o.layout as GeneratedLayout)
        )
        .map((file) => (
          <DraggableFileViewer
            key={`${sceneId}-${file.id}`}
            overlay={file}
            viewport={viewport}
            onSetDynamicLayout={onSetDynamicLayout}
            onRemove={onRemoveFile}
            onLayoutChange={onFileLayoutChange}
            sceneSize={containerSize}
            isSelected={selectedFileId === file.id}
            onInternalDragStart={onInternalDragStart}
            onInternalDragStop={onInternalDragStop}
            onSelect={onSelectFile}
            allOverlays={allOverlays}
            onSnapGuidesChange={onSnapGuidesChange}
          />
        ))}

      {/* Text Overlays */}
      {textOverlays
        .filter(
          (o) => filterDynamic(o.id) && checkLayer(o.layout as GeneratedLayout)
        )
        .map((textOverlay) => (
          <DraggableTextOverlay
            key={`${sceneId}-${textOverlay.id}`}
            overlay={textOverlay}
            onLayoutChange={onTextLayoutChange}
            onStyleChange={onTextStyleChange}
            onContentChange={onTextContentChange}
            onRemove={onRemoveTextOverlay}
            sceneSize={containerSize}
            containerRef={containerRef}
            isSelected={selectedTextId === textOverlay.id}
            onSelect={onSelectText}
            onInternalDragStart={onInternalDragStart}
            onInternalDragStop={onInternalDragStop}
            isSpacePressed={isSpacePressed}
            allOverlays={allOverlays}
            onSnapGuidesChange={onSnapGuidesChange}
            scale={viewport.scale} // Pass scale prop here!
          />
        ))}
    </div>
  );
};
