import React, { useState } from "react";
import { cn } from "@/shared/lib/utils";
import {
  CanvasSectionState,
  FileOverlayState,
  TextOverlayState,
  CanvasSectionCameraState,
} from "@/types/caption";
import { AssetResult } from "@/features/assets/ui/AssetLibrary";
import { GridSectionToolbar } from "../GridSectionToolbar";
import { GridSectionRenderer } from "../GridSectionRenderer";

export interface GridSectionWrapperProps {
  section: CanvasSectionState;
  templateSection: any;
  isHovered?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;

  // Data - all optional with defaults
  cameraStream?: MediaStream | null;
  screenStream?: MediaStream | null;
  fileOverlays?: FileOverlayState[];
  textOverlays?: TextOverlayState[];
  blankCanvasColor?: string;
  backgroundImageUrl?: string;
  videoDevices?: MediaDeviceInfo[];
  activeSequenceId?: string | null;
  layoutMode?: string;
  cameraShape?: "rectangle" | "circle" | "rounded";
  backgroundEffect?: "none" | "blur" | "image";

  // Callbacks - optional
  onSectionContentChange?: (
    sectionId: string,
    content: CanvasSectionState["content"]
  ) => void;
  onSectionDelete?: (sectionId: string) => void;
  onGridAssetSelect?: (sectionId: string, asset: AssetResult) => void;
  onSectionCameraSettingsChange?: (
    sectionId: string,
    settings: Partial<CanvasSectionCameraState>
  ) => void;
  onUserPositionChange?: (pos: { x: number; y: number } | null) => void;

  // Layout specific flags
  isVertical?: boolean;
  isSplit?: boolean;

  // Allow extra props to pass through
  [key: string]: any;
}

export const GridSectionWrapper: React.FC<GridSectionWrapperProps> = ({
  section,
  templateSection,
  isHovered: externalIsHovered,
  onMouseEnter,
  onMouseLeave,

  cameraStream,
  screenStream,
  fileOverlays,
  textOverlays,
  blankCanvasColor,
  backgroundImageUrl,
  videoDevices = [],
  activeSequenceId,
  onUserPositionChange,

  cameraShape,
  backgroundEffect,

  onSectionContentChange,
  onSectionDelete,
  onGridAssetSelect,
  onSectionCameraSettingsChange,

  isVertical = false,
  isSplit = false,
}) => {
  // Internal hover state to ensure toolbar works even if parent doesn't manage hover
  const [internalIsHovered, setInternalIsHovered] = useState(false);

  // Use external hover if provided, otherwise fallback to internal
  const isHovered =
    externalIsHovered !== undefined ? externalIsHovered : internalIsHovered;

  const isEmpty = section.content.type === "empty";

  const handleMouseEnter = () => {
    setInternalIsHovered(true);
    onMouseEnter?.();
  };

  const handleMouseLeave = () => {
    setInternalIsHovered(false);
    onMouseLeave?.();
  };

  return (
    <div
      className="relative w-full h-full group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Placeholder Text / Overlay Title */}
      {isEmpty && (isVertical || isSplit) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0 text-center p-4">
          {/* Only render title if name exists */}
          {templateSection.name && (
            <h2
              className={cn(
                "font-bold text-white",
                isSplit
                  ? "text-5xl whitespace-nowrap mb-4"
                  : "text-3xl text-white/50"
              )}
            >
              {templateSection.name}
            </h2>
          )}

          {/* Only render button if description exists */}
          {isSplit && templateSection.description && (
            <div className="border border-white px-8 py-4 font-bold text-white uppercase mt-4">
              {templateSection.description}
            </div>
          )}

          {!isSplit && (
            <p className="text-white/40 text-sm mt-2">
              Click toolbar + to add content
            </p>
          )}
        </div>
      )}

      <GridSectionRenderer
        section={section}
        cameraStream={cameraStream}
        screenStream={screenStream}
        fileOverlays={fileOverlays}
        textOverlays={textOverlays}
        blankCanvasColor={blankCanvasColor}
        backgroundImageUrl={backgroundImageUrl}
        onSectionContentChange={onSectionContentChange}
        onGridAssetSelect={onGridAssetSelect}
        onSectionCameraSettingsChange={onSectionCameraSettingsChange}
        videoDevices={videoDevices}
        activeSequenceId={activeSequenceId}
        onUserPositionChange={onUserPositionChange}
        cameraShape={cameraShape}
        backgroundEffect={backgroundEffect}
      />

      <GridSectionToolbar
        section={section}
        onDelete={() => onSectionDelete(section.id)}
        onGridAssetSelect={onGridAssetSelect}
        // Show toolbar on hover OR if content is empty (and isVertical/Split logic applies)
        // We default to showing it on hover for normal grids
        isVisible={isHovered || (isEmpty && (isVertical || isSplit))}
        availableFiles={fileOverlays?.map((f) => ({
          id: f.id,
          name: f.fileName,
        }))}
        availableTexts={textOverlays?.map((t) => ({
          id: t.id,
          content: t.content,
        }))}
        onFileSelect={(fileId) =>
          onSectionContentChange(section.id, { type: "file", fileId })
        }
        onTextSelect={(textId) =>
          onSectionContentChange(section.id, { type: "text", textId })
        }
        onSectionContentChange={onSectionContentChange}
        onColorChange={(color) =>
          onSectionContentChange(section.id, { type: "color", color })
        }
        onImageChange={(url) =>
          onSectionContentChange(section.id, { type: "image", src: url })
        }
      />
    </div>
  );
};
