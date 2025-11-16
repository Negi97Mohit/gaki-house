// src/components/CanvasGridLayout.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CanvasLayoutState,
  CanvasSectionState,
  FileOverlayState,
  TextOverlayState,
} from "@/types/caption";
import { LAYOUT_TEMPLATES } from "@/lib/canvasLayouts";
import { FileRenderer } from "@/components/DraggableFileViewer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GridSectionToolbar } from "@/components/GridSectionToolbar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { AssetLibrary, AssetResult } from "./AssetLibrary";

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
}) => {
  const [hoveredSectionId, setHoveredSectionId] = useState<string | null>(null);

  const template =
    LAYOUT_TEMPLATES[layout.templateId] || LAYOUT_TEMPLATES.default;

  // Helper to determine toolbar position based on layout and section
  const getToolbarPosition = (templateId: string, sectionId: string): 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' => {
    // Special positioning for layouts with clipPaths
    if (templateId === 'zigzag') {
      return sectionId === 'top' ? 'top-left' : 'bottom-right';
    }
    if (templateId === 'main-and-corner') {
      return sectionId === 'corner' ? 'top-right' : 'top-left';
    }
    // Default: top-right for most layouts
    return 'top-right';
  };

  const renderSectionContent = (section: CanvasSectionState) => {
    const { content } = section;

    switch (content.type) {
      case "color":
        return (
          <div
            className="w-full h-full"
            style={{ backgroundColor: content.color || blankCanvasColor }}
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
        if (!cameraStream) return <div className="w-full h-full bg-muted" />;
        return (
          <video
            autoPlay
            playsInline
            muted
            ref={(video) => {
              if (video && cameraStream) video.srcObject = cameraStream;
            }}
            className="w-full h-full object-cover"
            style={{
              borderRadius:
                cameraShape === "circle"
                  ? "50%"
                  : cameraShape === "rounded"
                  ? "12px"
                  : "0",
              border: pipBorder?.width
                ? `${pipBorder.width}px solid ${pipBorder.color}`
                : undefined,
              boxShadow: pipShadow?.blur
                ? `0 0 ${pipShadow.blur}px ${pipShadow.color}`
                : undefined,
            }}
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
          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
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
                      onSectionContentChange(section.id, { type: "camera" })
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
      // Fallback: just clear the content
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
                  toolbarPosition={getToolbarPosition(layout.templateId, templateSection.id)}
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
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
