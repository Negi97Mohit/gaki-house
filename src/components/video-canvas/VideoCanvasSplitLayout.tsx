import React from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/lib/utils";
import { DynamicContentRenderer } from "@/components/video-canvas/DynamicContentRenderer";
import { GeneratedLayout } from "@/types/caption";

export interface DynamicLayoutConfig {
  isActive: boolean;
  mode: "split-vertical" | "split-horizontal" | "pip";
  target: {
    id: string;
    type: string;
    content: any;
    layout: GeneratedLayout;
  } | null;
}

interface VideoCanvasSplitLayoutProps {
  dynamicLayout: DynamicLayoutConfig;
  containerSize: { width: number; height: number };
  dynamicPipSize: { width: number; height: number };
  setDynamicPipSize: (size: { width: number; height: number }) => void;
  dynamicPipPosition: { x: number; y: number };
  setDynamicPipPosition: (pos: { x: number; y: number }) => void;
  dynamicSplitRatio: number;
  setIsDraggingDynamicSplitter: (isDragging: boolean) => void;
  renderCamera: () => React.ReactNode;
  theme?: string;
  fullTranscript: string;
  interimTranscript: string;
  sidebarProps: any;
}

export const VideoCanvasSplitLayout: React.FC<VideoCanvasSplitLayoutProps> = ({
  dynamicLayout,
  containerSize,
  dynamicPipSize,
  setDynamicPipSize,
  dynamicPipPosition,
  setDynamicPipPosition,
  dynamicSplitRatio,
  setIsDraggingDynamicSplitter,
  renderCamera,
  theme,
  fullTranscript,
  interimTranscript,
  sidebarProps,
}) => {
  if (!dynamicLayout.isActive || !dynamicLayout.target) return null;

  if (dynamicLayout.mode === "pip") {
    return (
      <div className="w-full h-full relative bg-black">
        {renderCamera()}
        <Rnd
          size={{
            width: (containerSize.width * dynamicPipSize.width) / 100,
            height: (containerSize.height * dynamicPipSize.height) / 100,
          }}
          position={{
            x: (containerSize.width * dynamicPipPosition.x) / 100,
            y: (containerSize.height * dynamicPipPosition.y) / 100,
          }}
          minWidth={150}
          minHeight={150}
          bounds="parent"
          onDragStop={(e, d) =>
            setDynamicPipPosition({
              x: (d.x / containerSize.width) * 100,
              y: (d.y / containerSize.height) * 100,
            })
          }
          onResizeStop={(e, dir, ref, delta, pos) => {
            setDynamicPipSize({
              width:
                (parseInt(ref.style.width, 10) / containerSize.width) * 100,
              height:
                (parseInt(ref.style.height, 10) / containerSize.height) * 100,
            });
            setDynamicPipPosition({
              x: (pos.x / containerSize.width) * 100,
              y: (pos.y / containerSize.height) * 100,
            });
          }}
          className="pointer-events-auto border-2 border-primary shadow-lg rounded-lg overflow-hidden"
        >
          <DynamicContentRenderer
            target={dynamicLayout.target}
            theme={theme}
            fullTranscript={fullTranscript}
            interimTranscript={interimTranscript}
            sidebarProps={sidebarProps}
          />
        </Rnd>
      </div>
    );
  }

  const isVertical = dynamicLayout.mode === "split-vertical";

  return (
    <div
      className={cn(
        "w-full h-full flex bg-black",
        isVertical ? "flex-col" : "flex-row"
      )}
    >
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          [isVertical ? "height" : "width"]: `${dynamicSplitRatio * 100}%`,
        }}
      >
        <DynamicContentRenderer
          target={dynamicLayout.target}
          theme={theme}
          fullTranscript={fullTranscript}
          interimTranscript={interimTranscript}
          sidebarProps={sidebarProps}
        />
      </div>
      <div
        className={cn(
          "bg-border hover:bg-primary transition-colors flex items-center justify-center group z-10",
          isVertical
            ? "h-2 w-full cursor-row-resize"
            : "w-2 h-full cursor-col-resize"
        )}
        onMouseDown={() => setIsDraggingDynamicSplitter(true)}
      >
        <div
          className={cn(
            "bg-primary/50 group-hover:bg-primary rounded-full transition-colors",
            isVertical ? "w-12 h-1" : "w-1 h-12"
          )}
        />
      </div>
      <div
        className="relative flex items-center justify-center overflow-hidden"
        style={{
          [isVertical ? "height" : "width"]: `${
            (1 - dynamicSplitRatio) * 100
          }%`,
        }}
      >
        {renderCamera()}
      </div>
    </div>
  );
};
