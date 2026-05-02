import React, { useRef } from "react";
import { CanvasGridLayoutRenderer } from "./CanvasGridLayout";
import { CanvasLayoutTemplate } from "@gaki/core/types/layout";
import { CanvasLayoutState, DEFAULT_CAMERA_STATE } from "@gaki/core/types/caption";
import { PreviewModeProvider } from "./layouts/dynamic/core/PreviewModeContext";

interface GridLayoutPreviewProps {
  templateId: string;
  sections: CanvasLayoutTemplate["sections"];
}

export const GridLayoutPreview: React.FC<GridLayoutPreviewProps> = ({
  templateId,
  sections,
}) => {
  // We need a ref for the outer container to measure width
  const wrapperRef = useRef<HTMLDivElement>(null);
  // We need a ref for the inner renderer container
  const rendererContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);

  // Reference dimensions for the "virtual" screen we are previewing
  // 1280x720 is a good standard base for 16:9
  const BASE_WIDTH = 1280;
  const BASE_HEIGHT = 720;

  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width } = entry.contentRect;
        // Calculate scale needed to fit BASE_WIDTH into current width
        const newScale = width / BASE_WIDTH;
        setScale(newScale);
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Construct a mock layout state
  const mockLayout: CanvasLayoutState = {
    templateId,
    sections: sections.map((s) => ({
      ...s,
      content: { type: "empty" }, // Start with empty content for preview
      id: s.id,
    })),
  };

  // Construct a mock template object required by the renderer
  const mockTemplate: CanvasLayoutTemplate = {
    id: templateId,
    name: "Preview",
    description: "Preview",
    category: "dynamic",
    sections: sections,
  };

  // No-op handlers
  const noop = () => { };

  return (
    <PreviewModeProvider isPreview={true}>
      <div
        ref={wrapperRef}
        className="relative w-full aspect-video rounded-lg bg-gradient-to-br from-muted/30 to-muted/50 dark:from-white/[0.03] dark:to-white/[0.06] border border-border/20 dark:border-white/[0.06] overflow-hidden group isolate shadow-sm"
      >
        {/* 
          Scaled Inner Container 
          - Fixed size at BASE_WIDTH/HEIGHT
          - Scaled down to fit wrapper
          - Origin top-left
        */}
        <div
          style={{
            width: BASE_WIDTH,
            height: BASE_HEIGHT,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            pointerEvents: "none", // Disable all interactions in preview
          }}
        >
          <CanvasGridLayoutRenderer
            layout={mockLayout}
            template={mockTemplate}
            containerRef={rendererContainerRef}
            cameraStream={null}
            screenStream={null}
            fileOverlays={[]}
            textOverlays={[]}
            blankCanvasColor="#ffffff"
            onSectionContentChange={noop}
            onSectionDelete={noop}
            onGridAssetSelect={noop}
            layoutMode="solo"
            cameraShape="rectangle"
            pipSize={{ width: 20, height: 20 }}
            pipBorder={{ color: "#ffffff", width: 0 }}
            pipShadow={{ blur: 0, color: "rgba(0,0,0,0)" }}
            onSectionCameraSettingsChange={noop}
            backgroundEffect="none"
            onSetSectionDefault={noop}
            onLayoutUpdate={noop}
            activeSequenceId={null}
            onUserPositionChange={noop}
            videoDevices={[]}
          />
        </div>

        {/* Subtle shine effect on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/0 group-hover:via-white/[0.03] group-hover:to-white/[0.08] transition-all duration-500 pointer-events-none" />
      </div>
    </PreviewModeProvider>
  );
};
