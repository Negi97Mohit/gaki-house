import React from "react";
import { Rnd } from "react-rnd";
import { cn } from "@/shared/lib/utils";
import { DynamicContentRenderer } from "@/features/canvas/ui/DynamicContentRenderer";
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
  setDynamicSplitRatio: (ratio: number) => void;
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
  setDynamicSplitRatio,
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

  // Refs for direct DOM manipulation (Transient State Pattern)
  const leftPaneRef = React.useRef<HTMLDivElement>(null);
  const rightPaneRef = React.useRef<HTMLDivElement>(null);
  const isDraggingRef = React.useRef(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingDynamicSplitter(true);
    isDraggingRef.current = true;

    const startX = e.clientX;
    const startY = e.clientY;
    const startRatio = dynamicSplitRatio;
    const containerWidth = containerSize.width;
    const containerHeight = containerSize.height;

    const handleMouseMove = (mvEvent: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const isVertical = dynamicLayout.mode === "split-vertical";

      let newRatio = startRatio;

      if (isVertical) {
        const deltaY = mvEvent.clientY - startY;
        const deltaRatio = deltaY / containerHeight;
        newRatio = Math.max(0.1, Math.min(0.9, startRatio + deltaRatio));
      } else {
        const deltaX = mvEvent.clientX - startX;
        const deltaRatio = deltaX / containerWidth;
        newRatio = Math.max(0.1, Math.min(0.9, startRatio + deltaRatio));
      }

      // Direct DOM update (Transient State)
      if (leftPaneRef.current && rightPaneRef.current) {
        const pct = newRatio * 100;
        if (isVertical) {
          leftPaneRef.current.style.height = `${pct}%`;
          rightPaneRef.current.style.height = `${100 - pct}%`;
        } else {
          leftPaneRef.current.style.width = `${pct}%`;
          rightPaneRef.current.style.width = `${100 - pct}%`;
        }
      }
    };

    const handleMouseUp = (upEvent: MouseEvent) => {
      setIsDraggingDynamicSplitter(false);
      isDraggingRef.current = false;
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);

      // Final State Sync
      // Calculate final ratio based on the last mouse position or just read from DOM? 
      // Better to recalculate to be precise.
      const isVertical = dynamicLayout.mode === "split-vertical";
      let finalRatio = startRatio;
      if (isVertical) {
        const deltaY = upEvent.clientY - startY;
        finalRatio = Math.max(0.1, Math.min(0.9, startRatio + (deltaY / containerHeight)));
      } else {
        const deltaX = upEvent.clientX - startX;
        finalRatio = Math.max(0.1, Math.min(0.9, startRatio + (deltaX / containerWidth)));
      }

      setDynamicSplitRatio(finalRatio);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={cn(
        "w-full h-full flex overflow-hidden",
        isVertical ? "flex-col" : "flex-row"
      )}
    >
      {/* Pane 1 (Camera) */}
      <div
        ref={leftPaneRef}
        className="relative overflow-hidden shrink-0"
        style={{
          width: isVertical ? "100%" : `${dynamicSplitRatio * 100}%`,
          height: isVertical ? `${dynamicSplitRatio * 100}%` : "100%",
        }}
      >
        {renderCamera()}
      </div>

      {/* Splitter Handle */}
      <div
        onMouseDown={handleMouseDown}
        className={cn(
          "z-50 flex items-center justify-center bg-border hover:bg-primary/50 transition-colors relative",
          isVertical
            ? "h-2 w-full cursor-row-resize"
            : "w-2 h-full cursor-col-resize"
        )}
      >
        <div
          className={cn(
            "bg-muted-foreground/50 rounded-full absolute",
            isVertical ? "w-8 h-1 top-1/2 -translate-y-1/2" : "w-1 h-8 left-1/2 -translate-x-1/2"
          )}
        />
      </div>

      {/* Pane 2 (Dynamic Content) */}
      <div
        ref={rightPaneRef}
        className="relative overflow-hidden shrink-0 bg-background"
        style={{
          width: isVertical ? "100%" : `${(1 - dynamicSplitRatio) * 100}%`,
          height: isVertical ? `${(1 - dynamicSplitRatio) * 100}%` : "100%",
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
    </div>
  );
};

