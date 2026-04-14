import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  GeneratedOverlay,
  FileOverlayState,
  TextOverlayState,
  BrowserOverlayState,
  GeneratedLayout,
  EmptyGridPanelState,
} from "@caption-cam/core/types/caption";
import { DraggableHtmlOverlay } from "./DraggableHtmlOverlay";
import { DraggableBrowser } from "@/features/canvas/ui/DraggableBrowser";
import { DraggableFileViewer } from "@/features/canvas/ui/DraggableFileViewer";
import { DraggableTextOverlay } from "@/features/canvas/ui/DraggableTextOverlay";
import { DraggableEmptyGridPanel } from "@/features/canvas/ui/DraggableEmptyGridPanel";
import { OverlayElement, GuideLine } from "@/hooks/useSnapGuides";
import { HybridDraggable } from "./HybridDraggable";
import { UniversalBannerRenderer } from "@/features/banners/ui/banner/UniversalBannerRenderer";
import { BannerDesignSelectorToolbar } from "@/features/banners/ui/editor/components/BannerDesignSelectorToolbar";
import { BannerDesign, isAnimatedBanner } from "@caption-cam/core/types/banner";
import { isV2Engine } from "@/features/canvas/lib/engineFlag";
import { InteractionManager } from "@/features/canvas/engines/InteractionManager";

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
  emptyGridPanels: EmptyGridPanelState[];
  activeDynamicTargetId?: string;

  // Streams for empty grid panels with camera/screen content
  cameraStream?: MediaStream | null;
  screenStream?: MediaStream | null;
  videoDevices?: MediaDeviceInfo[];
  blankCanvasColor?: string;

  // Handlers
  onSetDynamicLayout: any;
  onOverlayLayoutChange: (
    id: string,
    key: "position" | "size" | "rotation" | "isBehindUser",
    value: any
  ) => void;
  onRemoveOverlay: (id: string) => void;
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
  onAddFile?: (file: File) => void;
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

  // EmptyGridPanel handlers
  selectedEmptyGridPanelId: string | null;
  onSelectEmptyGridPanel: (id: string | null) => void;
  onRemoveEmptyGridPanel: (id: string) => void;
  onEmptyGridPanelLayoutChange: (
    id: string,
    layout: Partial<EmptyGridPanelState["layout"]>
  ) => void;
  onEmptyGridPanelContentChange?: (
    id: string,
    content: EmptyGridPanelState["content"]
  ) => void;
  onEmptyGridPanelAssetSelect?: (id: string, asset: any) => void;

  // Global Drag handlers
  onInternalDragStart: any;
  onInternalDragStop: any;
  selectedGeneratedId?: string | null;
  onSelectGenerated?: (id: string | null) => void;
  onBannerDoubleClick?: (id: string, e: React.MouseEvent) => void;
  filterBehindUser?: boolean;
  /** Ratio of logical scene size to rendered DOM size — used to correct pointer deltas during drag/resize */
  viewportScale?: number;
}

// 2. Wrap component in React.memo
export const OverlayLayer = React.memo<OverlayLayerProps>(
  ({
    layerOrder,
    sceneId,
    containerSize,
    viewport,
    htmlOverlays,
    browserOverlays,
    fileOverlays,
    textOverlays,
    emptyGridPanels,
    activeDynamicTargetId,
    cameraStream,
    screenStream,
    videoDevices,
    blankCanvasColor,
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
    onAddFile,
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
    selectedEmptyGridPanelId,
    onSelectEmptyGridPanel,
    onRemoveEmptyGridPanel,
    onEmptyGridPanelLayoutChange,
    onEmptyGridPanelContentChange,
    onEmptyGridPanelAssetSelect,
    onInternalDragStart,
    onInternalDragStop,
    selectedGeneratedId,
    onSelectGenerated,
    onBannerDoubleClick,
    filterBehindUser = false,
    viewportScale = 1,
  }) => {
    const [showDesignSelector, setShowDesignSelector] = useState<string | null>(
      null
    );

    if (!containerSize.width || !containerSize.height) return null;

    const filterDynamic = (id: string) => id !== activeDynamicTargetId;

    const checkLayer = (layout: GeneratedLayout) => {
      let isCorrectVideoLayer = false;
      if (layerOrder === "above-video") {
        isCorrectVideoLayer =
          !layout.layerOrder ||
          layout.layerOrder === "above-video" ||
          layout.layerOrder === "auto";
      } else {
        isCorrectVideoLayer = layout.layerOrder === "below-video";
      }

      const isBehind = !!layout.isBehindUser;
      return isCorrectVideoLayer && isBehind === filterBehindUser;
    };

    return (
      <div className="w-full h-full relative">
        {/* HTML / Generated Overlays */}
        {htmlOverlays
          .filter((o) => filterDynamic(o.id) && checkLayer(o.layout))
          .map((overlay) => {
            if (
              overlay.metadata?.type === "social-banner-interactive" ||
              overlay.metadata?.type === "animated-banner"
            ) {
              const isSelected = selectedGeneratedId === overlay.id;
              const currentDesign = overlay.metadata.design as BannerDesign;

              const handleDesignChange = (newDesign: BannerDesign) => {
                const newType = isAnimatedBanner(newDesign)
                  ? "animated-banner"
                  : "social-banner-interactive";

                onUpdateOverlayMetadata?.(overlay.id, {
                  ...overlay.metadata,
                  type: newType,
                  design: newDesign,
                  elementStates: undefined,
                });
              };

              return (
                <HybridDraggable
                  key={overlay.id}
                  id={overlay.id}
                  position={overlay.layout.position}
                  size={overlay.layout.size}
                  rotation={overlay.layout.rotation}
                  zIndex={overlay.layout.zIndex}
                  containerSize={containerSize}
                  viewportScale={viewportScale}
                  isSelected={isSelected}
                  cancelSelector=".banner-toolbar-btn"
                  onSelect={() => {
                    onSelectGenerated?.(overlay.id);
                    if (
                      showDesignSelector &&
                      showDesignSelector !== overlay.id
                    ) {
                      setShowDesignSelector(null);
                    }
                  }}
                  onCommit={(id, changes) => {
                    if (changes.position)
                      onOverlayLayoutChange(
                        overlay.id,
                        "position",
                        changes.position
                      );
                    if (changes.size)
                      onOverlayLayoutChange(overlay.id, "size", changes.size);
                    if (changes.rotation !== undefined)
                      onOverlayLayoutChange(
                        overlay.id,
                        "rotation",
                        changes.rotation
                      );
                  }}
                  onDoubleClick={(id, e) => {
                    setShowDesignSelector((prev) => (prev === id ? null : id));
                  }}
                >
                  <div className="w-full h-full pointer-events-auto relative overflow-visible">
                    <AnimatePresence>
                      {showDesignSelector === overlay.id && (
                        <BannerDesignSelectorToolbar
                          currentDesignId={currentDesign.id}
                          onSelectDesign={handleDesignChange}
                          onClose={() => setShowDesignSelector(null)}
                          position={overlay.layout.position}
                          containerSize={containerSize}
                        />
                      )}
                    </AnimatePresence>

                    {isSelected && showDesignSelector !== overlay.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          setShowDesignSelector(overlay.id);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="banner-toolbar-btn absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background border border-accent text-accent text-[10px] font-mono uppercase tracking-wider hover:bg-accent hover:text-background transition-colors whitespace-nowrap pointer-events-auto cursor-pointer"
                        style={{ zIndex: 9999 }}
                      >
                        Change Design
                      </button>
                    )}

                    {isSelected && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onRemoveOverlay(overlay.id);
                        }}
                        onPointerDown={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="close-btn absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center shadow-lg hover:bg-destructive/90 transition-colors pointer-events-auto cursor-pointer"
                        style={{ zIndex: 9999 }}
                        title="Remove banner"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    <UniversalBannerRenderer
                      design={overlay.metadata.design}
                      contentData={overlay.metadata.data}
                      isEditing={isSelected}
                      onDelete={() => onRemoveOverlay(overlay.id)}
                      elementStates={overlay.metadata.elementStates}
                      onElementStatesChange={(states) => {
                        onUpdateOverlayMetadata?.(overlay.id, {
                          ...overlay.metadata,
                          elementStates: states,
                        });
                      }}
                      onContentChange={(field, value) => {
                        onUpdateOverlayMetadata?.(overlay.id, {
                          ...overlay.metadata,
                          data: {
                            ...overlay.metadata.data,
                            [field]: value,
                          },
                        });
                      }}
                      containerSize={{
                        width:
                          (overlay.layout.size.width / 100) *
                          containerSize.width,
                        height:
                          (overlay.layout.size.height / 100) *
                          containerSize.height,
                      }}
                    />
                  </div>
                </HybridDraggable>
              );
            }

            return (
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
            );
          })}

        {browserOverlays
          .filter(
            (o) =>
              filterDynamic(o.id) && checkLayer(o.layout as GeneratedLayout)
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
              viewportScale={viewportScale}
            />
          ))}

        {fileOverlays
          .filter(
            (o) =>
              filterDynamic(o.id) && checkLayer(o.layout as GeneratedLayout)
          )
          .map((file) => (
            <DraggableFileViewer
              key={`${sceneId}-${file.id}`}
              overlay={file}
              viewport={viewport}
              onSetDynamicLayout={onSetDynamicLayout}
              onRemove={onRemoveFile}
              onLayoutChange={onFileLayoutChange}
              onAddFile={onAddFile}
              sceneSize={containerSize}
              isSelected={selectedFileId === file.id}
              onInternalDragStart={onInternalDragStart}
              onInternalDragStop={onInternalDragStop}
              onSelect={onSelectFile}
              allOverlays={allOverlays}
              onSnapGuidesChange={onSnapGuidesChange}
              containerRef={containerRef}
              viewportScale={viewportScale}
            />
          ))}

        {textOverlays
          .filter(
            (o) =>
              filterDynamic(o.id) && checkLayer(o.layout as GeneratedLayout)
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
              scale={viewport.scale}
              viewportScale={viewportScale}
            />
          ))}

        {/* Empty Grid Panels — always render on the above-video layer only */}
        {layerOrder === "above-video" &&
          !filterBehindUser &&
          emptyGridPanels.map((panel) => (
            <DraggableEmptyGridPanel
              key={`${sceneId}-${panel.id}`}
              overlay={panel}
              sceneSize={containerSize}
              isSelected={selectedEmptyGridPanelId === panel.id}
              onSelect={onSelectEmptyGridPanel}
              onRemove={onRemoveEmptyGridPanel}
              onLayoutChange={onEmptyGridPanelLayoutChange}
              onContentChange={onEmptyGridPanelContentChange}
              onGridAssetSelect={onEmptyGridPanelAssetSelect}
              onInternalDragStart={onInternalDragStart}
              onInternalDragStop={onInternalDragStop}
              allOverlays={allOverlays}
              onSnapGuidesChange={onSnapGuidesChange}
              viewportScale={viewportScale}
              cameraStream={cameraStream}
              screenStream={screenStream}
              videoDevices={videoDevices}
              blankCanvasColor={blankCanvasColor}
            />
          ))}
          
        {isV2Engine && (
          <InteractionManager
            selectedIds={[
              selectedBrowserId,
              selectedFileId,
              selectedTextId,
              selectedEmptyGridPanelId,
              selectedGeneratedId,
            ].filter(Boolean) as string[]}
            containerSize={containerSize}
            viewportScale={viewportScale}
            onOverlayLayoutChange={onOverlayLayoutChange}
          />
        )}
      </div>
    );
  }
);
