import {
  Excalidraw,
  MainMenu,
} from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";
import { Button } from "@caption-cam/ui/button";
import {
  X,
  GripVertical,
  Maximize2,
  Minimize2,
  Palette,
  Move,
} from "lucide-react";
import { Rnd } from "react-rnd";
import { cn } from "@caption-cam/core/lib/utils";
import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@caption-cam/ui/dropdown-menu";

interface ExcalidrawOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  initialElements: readonly any[];
  onElementsChange: (elements: readonly any[]) => void;
}

const BACKGROUND_OPTIONS = [
  { label: "Transparent", value: "transparent", color: "transparent" },
  { label: "White", value: "#FFFFFF", color: "#FFFFFF" },
  { label: "Black", value: "#000000", color: "#000000" },
  { label: "Gray", value: "#F3F4F6", color: "#F3F4F6" },
  { label: "Dark Gray", value: "#374151", color: "#374151" },
  { label: "Blue", value: "#DBEAFE", color: "#DBEAFE" },
  { label: "Green", value: "#D1FAE5", color: "#D1FAE5" },
  { label: "Yellow", value: "#FEF3C7", color: "#FEF3C7" },
  { label: "Red", value: "#FEE2E2", color: "#FEE2E2" },
  { label: "Purple", value: "#EDE9FE", color: "#EDE9FE" },
];

/**
 * A draggable and resizable Excalidraw window with transparent background support.
 */
export const ExcalidrawOverlay = ({
  isVisible,
  onClose,
  initialElements,
  onElementsChange,
}: ExcalidrawOverlayProps) => {
  const { theme } = useTheme();
  const [backgroundColor, setBackgroundColor] = useState("transparent");
  const [isMaximized, setIsMaximized] = useState(false);
  const [previousSize, setPreviousSize] = useState({
    x: window.innerWidth / 2 - 300,
    y: window.innerHeight / 2 - 250,
    width: 600,
    height: 500,
  });

  if (!isVisible) {
    return null;
  }

  const handleMaximize = () => {
    if (!isMaximized) {
      setPreviousSize({
        x: window.innerWidth / 2 - 300,
        y: window.innerHeight / 2 - 250,
        width: 600,
        height: 500,
      });
      setIsMaximized(true);
    } else {
      setIsMaximized(false);
    }
  };

  const currentSize = isMaximized
    ? {
      x: 0,
      y: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    }
    : previousSize;

  return (
    <Rnd
      position={{ x: currentSize.x, y: currentSize.y }}
      size={{ width: currentSize.width, height: currentSize.height }}
      minWidth={300}
      minHeight={300}
      bounds="window"
      dragHandleClassName="drag-handle-btn"
      disableDragging={isMaximized}
      enableResizing={!isMaximized} // FIXED: Explicitly enable resizing when not maximized
      className={cn(
        "shadow-2xl rounded-lg overflow-hidden group",
        backgroundColor !== "transparent" && "border-2 border-border"
      )}
      style={{
        zIndex: "var(--z-excalidraw-overlay)",
        backgroundColor:
          backgroundColor === "transparent" ? "transparent" : backgroundColor,
      }}
      onMouseOver={() => {
        document.body.classList.remove("cursor-inactive");
      }}
      onDragStop={(e, d) => {
        if (!isMaximized) {
          setPreviousSize((prev) => ({ ...prev, x: d.x, y: d.y }));
        }
      }}
      onResizeStop={(e, direction, ref, delta, position) => {
        if (!isMaximized) {
          setPreviousSize({
            x: position.x,
            y: position.y,
            width: parseInt(ref.style.width, 10),
            height: parseInt(ref.style.height, 10),
          });
        }
      }}
      // ADDED: Custom resize handle styles for better visibility
      resizeHandleStyles={{
        top: { cursor: "ns-resize", height: "10px", top: "-5px" },
        right: { cursor: "ew-resize", width: "10px", right: "-5px" },
        bottom: { cursor: "ns-resize", height: "10px", bottom: "-5px" },
        left: { cursor: "ew-resize", width: "10px", left: "-5px" },
        topRight: {
          cursor: "nesw-resize",
          width: "20px",
          height: "20px",
          top: "-10px",
          right: "-10px",
        },
        bottomRight: {
          cursor: "nwse-resize",
          width: "20px",
          height: "20px",
          bottom: "-10px",
          right: "-10px",
        },
        bottomLeft: {
          cursor: "nesw-resize",
          width: "20px",
          height: "20px",
          bottom: "-10px",
          left: "-10px",
        },
        topLeft: {
          cursor: "nwse-resize",
          width: "20px",
          height: "20px",
          top: "-10px",
          left: "-10px",
        },
      }}
      // ADDED: Custom resize handle classes for styling
      resizeHandleClasses={{
        top: "resize-handle resize-handle-top",
        right: "resize-handle resize-handle-right",
        bottom: "resize-handle resize-handle-bottom",
        left: "resize-handle resize-handle-left",
        topRight: "resize-handle resize-handle-corner",
        bottomRight: "resize-handle resize-handle-corner",
        bottomLeft: "resize-handle resize-handle-corner",
        topLeft: "resize-handle resize-handle-corner",
      }}
    >
      {/* Floating Control Buttons */}
      <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-50 pointer-events-auto">
        {/* Background Color Picker */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-md bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
              title="Change Background"
            >
              <Palette className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            style={{ zIndex: "var(--z-excalidraw-overlay)" }}
          >
            {BACKGROUND_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => setBackgroundColor(option.value)}
                className="flex items-center gap-2"
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded border-2",
                    option.value === "transparent" &&
                    "bg-gradient-to-br from-gray-200 to-white dark:from-gray-700 dark:to-gray-800"
                  )}
                  style={{
                    backgroundColor:
                      option.value === "transparent" ? undefined : option.color,
                    borderColor:
                      backgroundColor === option.value
                        ? "hsl(var(--primary))"
                        : "hsl(var(--border))",
                  }}
                />
                <span className="text-sm">{option.label}</span>
                {backgroundColor === option.value && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Maximize/Minimize */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg"
          onClick={handleMaximize}
          title={isMaximized ? "Restore Size" : "Maximize"}
        >
          {isMaximized ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>

        {/* Drag Handle Button */}
        {!isMaximized && (
          <Button
            variant="ghost"
            size="icon"
            className="drag-handle-btn h-8 w-8 rounded-md bg-background/90 backdrop-blur-sm hover:bg-background shadow-lg cursor-move"
            title="Drag to move window"
          >
            <GripVertical className="h-4 w-4" />
          </Button>
        )}

        {/* Close */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-md bg-background/90 backdrop-blur-sm hover:bg-destructive hover:text-destructive-foreground shadow-lg"
          onClick={onClose}
          title="Close Drawing Mode"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Excalidraw Component */}
      <div
        style={{
          height: "100%",
          backgroundColor:
            backgroundColor === "transparent" ? "transparent" : backgroundColor,
        }}
      >
        <div
          style={{
            width: "100%",
            height: "100%",
            backgroundColor:
              backgroundColor === "transparent"
                ? "transparent"
                : backgroundColor,
          }}
        >
          <Excalidraw
            key={backgroundColor}
            theme={theme === "dark" ? "dark" : "light"}
            UIOptions={{
              canvasActions: {
                loadScene: false,
                saveToActiveFile: false,
              },
            }}
            viewModeEnabled={false}
            initialData={{
              elements: initialElements,
              appState: {
                viewBackgroundColor:
                  backgroundColor === "transparent"
                    ? "transparent"
                    : backgroundColor,
              },
            }}
            onChange={(elements: readonly any[]) => {
              onElementsChange(elements);
            }}
          >
            <MainMenu>
              <MainMenu.DefaultItems.ClearCanvas />
              <MainMenu.DefaultItems.ToggleTheme />
              <MainMenu.DefaultItems.Help />
            </MainMenu>
          </Excalidraw>
        </div>
      </div>
    </Rnd>
  );
};
