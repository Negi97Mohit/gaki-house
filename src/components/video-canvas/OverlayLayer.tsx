// src/components/video-canvas/OverlayLayer.tsx
import React, { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
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
import { HybridDraggable } from "./HybridDraggable";
import { SocialBannerRenderer } from "@/components/SocialBannerRenderer";
import { UniversalBannerRenderer } from "@/components/banner/UniversalBannerRenderer";
import { BannerDesignSelectorToolbar } from "@/components/banner-editor/BannerDesignSelectorToolbar";
import { BannerDesign, isAnimatedBanner } from "@/types/banner";

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
  filterBehindUser?: boolean; // New prop
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
  filterBehindUser = false, // Default to false (in front)
}) => {
  const [showDesignSelector, setShowDesignSelector] = useState<string | null>(null);

  if (!containerSize.width || !containerSize.height) return null;

  // Filter overlays based on dynamic layout (exclude if active target)
  const filterDynamic = (id: string) => id !== activeDynamicTargetId;

  // Helper to check layer order AND user depth
  const checkLayer = (layout: GeneratedLayout) => {
    // 1. Check video layer (existing logic)
    let isCorrectVideoLayer = false;
    if (layerOrder === "above-video") {
      isCorrectVideoLayer =
        !layout.layerOrder ||
        layout.layerOrder === "above-video" ||
        layout.layerOrder === "auto";
    } else {
      isCorrectVideoLayer = layout.layerOrder === "below-video";
    }

    // 2. Check depth relative to user (New logic)
    // If filterBehindUser is true, we ONLY want items with isBehindUser=true
    // If filterBehindUser is false, we ONLY want items with isBehindUser=false (or undefined)
    const isBehind = !!layout.isBehindUser;

    return isCorrectVideoLayer && (isBehind === filterBehindUser);
  };

  return (
    <div className="w-full h-full relative">
      {/* HTML / Generated Overlays */}
      {htmlOverlays
        .filter((o) => filterDynamic(o.id) && checkLayer(o.layout))
        .map((overlay) => {
          // --- Interactive Banner Handling (Static & Animated) ---
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
                // Reset element states when design changes
                elementStates: undefined,
              });
              // Don't close selector - let user browse and compare designs
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
                isSelected={isSelected}
                cancelSelector=".banner-toolbar-btn"
                onSelect={() => {
                  onSelectGenerated?.(overlay.id);
                  // Close design selector if clicking a different banner
                  if (showDesignSelector && showDesignSelector !== overlay.id) {
                    setShowDesignSelector(null);
                  }
                }}
                onCommit={(id, changes) => {
                  if (changes.position)
                    onOverlayLayoutChange(overlay.id, "position", changes.position);
                  if (changes.size)
                    onOverlayLayoutChange(overlay.id, "size", changes.size);
                  if (changes.rotation !== undefined)
                    onOverlayLayoutChange(overlay.id, "rotation", changes.rotation);
                }}
                onDoubleClick={(id, e) => {
                  // Toggle design selector on double click
                  setShowDesignSelector(prev => prev === id ? null : id);
                }}
              >
                <div className="w-full h-full pointer-events-auto relative overflow-visible">
                  {/* Design Selector Toolbar */}
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

                  {/* Change Design Button - shows when selected but selector is closed */}
                  {isSelected && showDesignSelector !== overlay.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        setShowDesignSelector(overlay.id);
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
                      className="banner-toolbar-btn absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-background border border-accent text-accent text-[10px] font-mono uppercase tracking-wider hover:bg-accent hover:text-background transition-colors whitespace-nowrap pointer-events-auto cursor-pointer"
                      style={{ zIndex: 9999 }}
                    >
                      Change Design
                    </button>
                  )}

                  {/* Close Button - shows when selected */}
                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onRemoveOverlay(overlay.id);
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                      onMouseDown={(e) => {
                        e.stopPropagation();
                      }}
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
                      width: (overlay.layout.size.width / 100) * containerSize.width,
                      height: (overlay.layout.size.height / 100) * containerSize.height,
                    }}
                  />
                </div>
              </HybridDraggable>
            );
          }

          // --- Standard HTML Overlay (Iframe) ---
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
            scale={viewport.scale}
          />
        ))}
    </div>
  );
};
