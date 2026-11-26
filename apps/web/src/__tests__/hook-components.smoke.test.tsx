import React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { VideoCanvasSplitLayout } from "@/features/canvas/ui/VideoCanvasSplitLayout";
import { CanvasGridLayout } from "@/features/layouts/ui/CanvasGridLayout";
import { TransitionPopover } from "@/features/stream/ui/TransitionPopover";

vi.mock("@/features/layouts/hooks/useLayoutTemplates", () => ({
  useLayoutTemplates: () => ({
    loading: false,
    templateRecord: {
      default: {
        id: "default",
        name: "Default",
        sections: [
          {
            id: "s1",
            x: 0,
            y: 0,
            width: 100,
            height: 100,
          },
        ],
      },
    },
  }),
}));

describe("Fixed rules-of-hooks components smoke", () => {
  let container: HTMLDivElement;
  let root: Root;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
      true;
    if (typeof globalThis.ResizeObserver === "undefined") {
      globalThis.ResizeObserver = class ResizeObserver {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
    consoleErrorSpy.mockRestore();
  });

  it("renders VideoCanvasSplitLayout across inactive, split, and pip transitions without hook errors", () => {
    const baseProps = {
      containerSize: { width: 1280, height: 720 },
      dynamicPipSize: { width: 320, height: 180 },
      setDynamicPipSize: vi.fn(),
      dynamicPipPosition: { x: 20, y: 20 },
      setDynamicPipPosition: vi.fn(),
      dynamicSplitRatio: 0.5,
      setDynamicSplitRatio: vi.fn(),
      setIsDraggingDynamicSplitter: vi.fn(),
      renderCamera: () => React.createElement("div", null, "cam"),
      fullTranscript: "",
      interimTranscript: "",
      sidebarProps: {},
    };

    act(() => {
      root.render(
        React.createElement(VideoCanvasSplitLayout, {
          ...baseProps,
          dynamicLayout: { isActive: false, mode: "split", target: null },
        }),
      );
    });

    act(() => {
      root.render(
        React.createElement(VideoCanvasSplitLayout, {
          ...baseProps,
          dynamicLayout: {
            isActive: true,
            mode: "split",
            target: {
              id: "t1",
              type: "browser",
              content: { url: "https://example.com" },
            },
          },
        }),
      );
    });

    act(() => {
      root.render(
        React.createElement(VideoCanvasSplitLayout, {
          ...baseProps,
          dynamicLayout: {
            isActive: true,
            mode: "pip",
            target: {
              id: "t1",
              type: "browser",
              content: { url: "https://example.com" },
            },
          },
        }),
      );
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders CanvasGridLayout across empty and populated states without hook errors", () => {
    act(() => {
      root.render(
        React.createElement(CanvasGridLayout, {
          layout: {
            templateId: "default",
            sections: {
              s1: { id: "s1", content: { type: "empty" } },
            },
          },
          cameraStream: null,
          screenStream: null,
          fileOverlays: [],
          textOverlays: [],
          blankCanvasColor: "#000000",
          onSectionContentChange: vi.fn(),
          onGridAssetSelect: vi.fn(),
          layoutMode: "grid",
          cameraShape: "rectangle",
          pipSize: { width: 320, height: 180 },
          onSectionCameraSettingsChange: vi.fn(),
          backgroundEffect: "none",
        }),
      );
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it("renders TransitionPopover across null and open states without hook errors", () => {
    act(() => {
      root.render(
        React.createElement(TransitionPopover, {
          transition: null,
          onTransitionChange: vi.fn(),
          onClose: vi.fn(),
        }),
      );
    });

    act(() => {
      root.render(
        React.createElement(TransitionPopover, {
          transition: {
            id: "tr-1",
            fromSceneId: "sc-1",
            toSceneId: "sc-2",
            type: "fade",
            durationMs: 300,
          },
          onTransitionChange: vi.fn(),
          onClose: vi.fn(),
        }),
      );
    });

    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });
});
