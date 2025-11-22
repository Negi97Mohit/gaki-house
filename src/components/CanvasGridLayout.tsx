// src/components/CanvasGridLayout.tsx

import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CanvasLayoutState,
  CanvasSectionState,
  FileOverlayState,
  TextOverlayState,
  CanvasSectionCameraState,
  DEFAULT_CAMERA_STATE,
} from "@/types/caption";
import { getLayoutTemplates, CanvasLayoutTemplate } from "@/lib/canvasLayouts";
import { FileRenderer } from "@/components/DraggableFileViewer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GridSectionToolbar } from "./GridSectionToolbar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssetLibrary, AssetResult } from "./AssetLibrary";
import { Loader2 } from "lucide-react";
import { CameraRenderer } from "@/components/CameraRenderer";

interface CanvasGridLayoutProps {
  layout: CanvasLayoutState;
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
  onSectionDelete?: (sectionId: string) => void;
  onGridAssetSelect: (sectionId: string, asset: AssetResult) => void;
  layoutMode: string;
  cameraShape: "rectangle" | "circle" | "rounded";
  pipSize: { width: number; height: number };
  pipBorder?: { color: string; width: number };
  pipShadow?: { blur: number; color: string };
  onSectionCameraSettingsChange: (
    sectionId: string,
    settings: Partial<CanvasSectionCameraState>
  ) => void;
  backgroundEffect: "none" | "blur" | "image";
  onSetSectionDefault?: (sectionId: string) => void;
  activeSequenceId?: string | null; // NEW
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void; // NEW
  // ADDED: Explicitly define this prop
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
  videoDevices?: MediaDeviceInfo[];
}

export const CanvasGridLayout: React.FC<CanvasGridLayoutProps> = ({
  layout,
  cameraStream,
  screenStream,
  fileOverlays,
  textOverlays,
  blankCanvasColor,
  backgroundImageUrl,
  onSectionContentChange,
  onSectionDelete,
  onGridAssetSelect,
  layoutMode,
  cameraShape,
  pipSize,
  pipBorder,
  pipShadow,
  onSectionCameraSettingsChange,
  backgroundEffect,
  // ADDED: Destructure here
  onLayoutUpdate,
  onSetSectionDefault,
  activeSequenceId,
  onUserPositionChange,
  videoDevices = [],
}) => {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
  const [resizing, setResizing] = useState<{ sectionId: string; edge: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeDataRef = useRef<{ startX: number; startY: number; startStyles: Record<string, React.CSSProperties> } | null>(null);

  const [templates, setTemplates] = useState<Record<
    string,
    CanvasLayoutTemplate
  > | null>(null);

  useEffect(() => {
    getLayoutTemplates()
      .then(({ record }) => {
        setTemplates(record);
      })
      .catch((err) => {
        console.error("Failed to load layout templates", err);
      });
  }, []);
  const template =
    templates && (templates[layout.templateId] || templates.default);

  // Get resize edges
  const getResizeEdges = useCallback((sectionId: string) => {
    if (!template) return { right: false, bottom: false, left: false, top: false };

    const sections = template.sections.map(s => ({
      ...s,
      style: layout.customSectionStyles?.[s.id] || s.style
    }));

    const section = sections.find(s => s.id === sectionId);
    if (!section) return { right: false, bottom: false, left: false, top: false };

    const left = parseFloat(section.style.left as string);
    const top = parseFloat(section.style.top as string);
    const width = parseFloat(section.style.width as string);
    const height = parseFloat(section.style.height as string);

    return {
      right: left + width < 99.5,
      bottom: top + height < 99.5,
      left: left > 0.5,
      top: top > 0.5,
    };
  }, [template, layout.customSectionStyles]);

  // Handle resize start
  const handleResizeStart = (sectionId: string, edge: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!template) return;

    const startStyles: Record<string, React.CSSProperties> = {};
    template.sections.forEach(s => {
      startStyles[s.id] = layout.customSectionStyles?.[s.id] || s.style;
    });

    resizeDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startStyles
    };

    setResizing({ sectionId, edge });
  };

  // Handle resize move
  useEffect(() => {
    if (!resizing || !containerRef.current || !resizeDataRef.current || !onLayoutUpdate || !template) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !resizeDataRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const deltaXPx = e.clientX - resizeDataRef.current.startX;
      const deltaYPx = e.clientY - resizeDataRef.current.startY;
      const deltaX = (deltaXPx / rect.width) * 100;
      const deltaY = (deltaYPx / rect.height) * 100;

      const { sectionId, edge } = resizing;
      const startStyles = resizeDataRef.current.startStyles;
      const newStyles = { ...startStyles };

      const style = startStyles[sectionId];
      const left = parseFloat(style.left as string);
      const top = parseFloat(style.top as string);
      const width = parseFloat(style.width as string);
      const height = parseFloat(style.height as string);

      if (edge === 'right') {
        const newWidth = Math.max(10, Math.min(100 - left, width + deltaX));
        newStyles[sectionId] = { ...style, width: `${newWidth}%` };

        // Adjust right neighbor
        template.sections.forEach(s => {
          if (s.id === sectionId) return;
          const sStyle = startStyles[s.id];
          const sLeft = parseFloat(sStyle.left as string);
          const sWidth = parseFloat(sStyle.width as string);

          if (Math.abs(sLeft - (left + width)) < 2) {
            const newSWidth = Math.max(10, sWidth - deltaX);
            newStyles[s.id] = { ...sStyle, left: `${left + newWidth}%`, width: `${newSWidth}%` };
          }
        });
      } else if (edge === 'bottom') {
        const newHeight = Math.max(10, Math.min(100 - top, height + deltaY));
        newStyles[sectionId] = { ...style, height: `${newHeight}%` };

        // Adjust bottom neighbor
        template.sections.forEach(s => {
          if (s.id === sectionId) return;
          const sStyle = startStyles[s.id];
          const sTop = parseFloat(sStyle.top as string);
          const sHeight = parseFloat(sStyle.height as string);

          if (Math.abs(sTop - (top + height)) < 2) {
            const newSHeight = Math.max(10, sHeight - deltaY);
            newStyles[s.id] = { ...sStyle, top: `${top + newHeight}%`, height: `${newSHeight}%` };
          }
        });
      } else if (edge === 'left') {
        const newLeft = Math.max(0, Math.min(left + width - 10, left + deltaX));
        const newWidth = Math.max(10, width - (newLeft - left));
        newStyles[sectionId] = { ...style, left: `${newLeft}%`, width: `${newWidth}%` };

        // Adjust left neighbor
        template.sections.forEach(s => {
          if (s.id === sectionId) return;
          const sStyle = startStyles[s.id];
          const sLeft = parseFloat(sStyle.left as string);
          const sWidth = parseFloat(sStyle.width as string);

          if (Math.abs((sLeft + sWidth) - left) < 2) {
            const newSWidth = Math.max(10, sWidth + (newLeft - left));
            newStyles[s.id] = { ...sStyle, width: `${newSWidth}%` };
          }
        });
      } else if (edge === 'top') {
        const newTop = Math.max(0, Math.min(top + height - 10, top + deltaY));
        const newHeight = Math.max(10, height - (newTop - top));
        newStyles[sectionId] = { ...style, top: `${newTop}%`, height: `${newHeight}%` };

        // Adjust top neighbor
        template.sections.forEach(s => {
          if (s.id === sectionId) return;
          const sStyle = startStyles[s.id];
          const sTop = parseFloat(sStyle.top as string);
          const sHeight = parseFloat(sStyle.height as string);

          if (Math.abs((sTop + sHeight) - top) < 2) {
            const newSHeight = Math.max(10, sHeight + (newTop - top));
            newStyles[s.id] = { ...sStyle, height: `${newSHeight}%` };
          }
        });
      }

      onLayoutUpdate({
        ...layout,
        customSectionStyles: newStyles
      });
    };

    const handleMouseUp = () => {
      setResizing(null);
      resizeDataRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [resizing, layout, onLayoutUpdate, template]);

  if (!templates || !template) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted/20">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderSectionContent = (section: CanvasSectionState) => {
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
              textDecoration: textOverlay.style.underline
                ? "underline"
                : "none",
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
                  <DropdownMenuItem
                    onClick={() =>
                      onSectionContentChange(section.id, { type: "screen" })
                    }
                  >
                    Screen Share
                  </DropdownMenuItem>
                  {fileOverlays.length > 0 && (
                    <DropdownMenuItem
                      onClick={() =>
                        onSectionContentChange(section.id, {
                          type: "file",
                          fileId: fileOverlays[0].id,
                        })
                      }
                    >
                      File Overlay
                    </DropdownMenuItem>
                  )}
                  {textOverlays.length > 0 && (
                    <DropdownMenuItem
                      onClick={() =>
                        onSectionContentChange(section.id, {
                          type: "text",
                          textId: textOverlays[0].id,
                        })
                      }
                    >
                      Text Overlay
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
    }
  };

  const handleSectionDelete = (sectionId: string) => {
    if (onSectionDelete) {
      onSectionDelete(sectionId);
    } else {
      onSectionContentChange(sectionId, { type: "empty" });
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden">
      {template.sections.map((templateSection) => {
        const section =
          layout.sections.find((s) => s.id === templateSection.id) ||
          ({
            id: templateSection.id,
            content: { type: "empty" },
          } as CanvasSectionState);

        const sectionStyle = layout.customSectionStyles?.[templateSection.id] || templateSection.style;
        const edges = getResizeEdges(templateSection.id);

        // Determine current order index
        const orderIndex = layout.sectionOrder?.indexOf(section.id);
        const displayOrder =
          orderIndex !== undefined && orderIndex > -1
            ? orderIndex + 1
            : undefined;

        return (
          <div
            key={templateSection.id}
            className={cn(
              "absolute border border-border/20 transition-all duration-200",
              "hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20",
              "group", // <--- ADD COMMA HERE
              // Ensure this line is active
              section.id === activeSequenceId &&
              "border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.2)] z-10"
            )}
            style={{
              ...sectionStyle,
              overflow: "hidden",
            }}
            onMouseEnter={() => setHoveredSectionId(templateSection.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            <div className="relative w-full h-full">
              {renderSectionContent(section)}

              {/* Resize handles */}
              {edges.right && (
                <div
                  className={cn(
                    "absolute top-0 right-0 w-1 h-full cursor-ew-resize z-50",
                    "hover:w-2 hover:bg-primary/40 transition-all",
                    resizing?.sectionId === templateSection.id && "bg-primary/60 w-2"
                  )}
                  onMouseDown={(e) => handleResizeStart(templateSection.id, 'right', e)}
                />
              )}
              {edges.bottom && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 w-full h-1 cursor-ns-resize z-50",
                    "hover:h-2 hover:bg-primary/40 transition-all",
                    resizing?.sectionId === templateSection.id && "bg-primary/60 h-2"
                  )}
                  onMouseDown={(e) => handleResizeStart(templateSection.id, 'bottom', e)}
                />
              )}
              {edges.left && (
                <div
                  className={cn(
                    "absolute top-0 left-0 w-1 h-full cursor-ew-resize z-50",
                    "hover:w-2 hover:bg-primary/40 transition-all",
                    resizing?.sectionId === templateSection.id && "bg-primary/60 w-2"
                  )}
                  onMouseDown={(e) => handleResizeStart(templateSection.id, 'left', e)}
                />
              )}
              {edges.top && (
                <div
                  className={cn(
                    "absolute top-0 left-0 w-full h-1 cursor-ns-resize z-50",
                    "hover:h-2 hover:bg-primary/40 transition-all",
                    resizing?.sectionId === templateSection.id && "bg-primary/60 h-2"
                  )}
                  onMouseDown={(e) => handleResizeStart(templateSection.id, 'top', e)}
                />
              )}

              {/* Section toolbar */}
              {section.content.type !== "empty" && (
                <GridSectionToolbar
                  section={section}
                  onDelete={() => handleSectionDelete(section.id)}
                  onGridAssetSelect={onGridAssetSelect}
                  isVisible={hoveredSectionId === templateSection.id}
                  onColorChange={
                    section.content.type === "color"
                      ? (color) =>
                        onSectionContentChange(section.id, {
                          type: "color",
                          color,
                        })
                      : undefined
                  }
                  onImageChange={
                    section.content.type === "image"
                      ? (url) =>
                        onSectionContentChange(section.id, {
                          type: "image",
                          src: url,
                        })
                      : undefined
                  }
                  availableFiles={fileOverlays.map((f) => ({
                    id: f.id,
                    name: f.fileName,
                  }))}
                  availableTexts={textOverlays.map((t) => ({
                    id: t.id,
                    content: t.content,
                  }))}
                  onFileSelect={(fileId) =>
                    onSectionContentChange(section.id, { type: "file", fileId })
                  }
                  onTextSelect={(textId) =>
                    onSectionContentChange(section.id, { type: "text", textId })
                  }
                  // UPDATED: Pass order prop and handler using onLayoutUpdate
                  orderIndex={displayOrder}
                  onToggleOrder={() => {
                    if (onLayoutUpdate) {
                      const currentOrder = layout.sectionOrder || [];
                      const isIncluded = currentOrder.includes(section.id);

                      onLayoutUpdate({
                        ...layout,
                        sectionOrder: isIncluded
                          ? currentOrder.filter((id) => id !== section.id)
                          : [...currentOrder, section.id],
                      });
                    }
                  }}
                  onSetDefault={() => onSetSectionDefault?.(section.id)}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
