// src/components/CanvasGridLayout.tsx
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CanvasLayoutState,
  CanvasSectionState,
  FileOverlayState,
  TextOverlayState,
} from "@/types/caption";
import { LAYOUT_TEMPLATES } from "@/lib/canvasLayouts";
import { CameraRenderer } from "@/components/CameraRenderer";
import { FileRenderer } from "@/components/DraggableFileViewer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface CanvasGridLayoutProps {
  layout: CanvasLayoutState;
  cameraStream: MediaStream | null;
  screenStream: MediaStream | null;
  fileOverlays: FileOverlayState[];
  textOverlays: TextOverlayState[];
  blankCanvasColor: string;
  backgroundImageUrl?: string;
  onSectionContentChange: (sectionId: string, content: CanvasSectionState["content"]) => void;
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
  layoutMode,
  cameraShape,
  pipSize,
  pipBorder,
  pipShadow,
}) => {
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const template = LAYOUT_TEMPLATES[layout.templateId] || LAYOUT_TEMPLATES.default;

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
            style={{ backgroundImage: `url(${content.src || backgroundImageUrl})` }}
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
              borderRadius: cameraShape === "circle" ? "50%" : cameraShape === "rounded" ? "12px" : "0",
              border: pipBorder?.width ? `${pipBorder.width}px solid ${pipBorder.color}` : undefined,
              boxShadow: pipShadow?.blur ? `0 0 ${pipShadow.blur}px ${pipShadow.color}` : undefined,
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
              textDecoration: textOverlay.style.underline ? "underline" : "none",
            }}
          >
            {textOverlay.content}
          </div>
        );

      case "empty":
      default:
        return (
          <div className="w-full h-full bg-muted/20 flex items-center justify-center">
            {hoveredSection === section.id && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="opacity-90 hover:opacity-100"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Content
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
            )}
          </div>
        );
    }
  };

  return (
    <div className="relative w-full h-full">
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
              "transition-all duration-200",
              hoveredSection === section.id && "ring-2 ring-primary"
            )}
            style={templateSection.style}
            onMouseEnter={() => setHoveredSection(section.id)}
            onMouseLeave={() => setHoveredSection(null)}
          >
            {renderSectionContent(section)}
            {section.content.type !== "empty" && hoveredSection === section.id && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 opacity-70 hover:opacity-100 z-10"
                onClick={() =>
                  onSectionContentChange(section.id, { type: "empty" })
                }
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
};
