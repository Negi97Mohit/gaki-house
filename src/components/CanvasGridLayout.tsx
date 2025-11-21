// src/components/CanvasGridLayout.tsx

import React, { useState, useEffect } from "react";
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
  // ADDED: Explicitly define this prop
  onLayoutUpdate?: (layout: CanvasLayoutState) => void;
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
}) => {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);
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
    <div className="relative w-full h-full overflow-hidden">
      {template.sections.map((templateSection) => {
        const section =
          layout.sections.find((s) => s.id === templateSection.id) ||
          ({
            id: templateSection.id,
            content: { type: "empty" },
          } as CanvasSectionState);

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
              "group"
            )}
            style={{
              ...templateSection.style,
              overflow: "hidden",
            }}
            onMouseEnter={() => setHoveredSectionId(templateSection.id)}
            onMouseLeave={() => setHoveredSectionId(null)}
          >
            <div className="relative w-full h-full">
              {renderSectionContent(section)}

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
