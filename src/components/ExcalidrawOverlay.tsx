import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { X } from "lucide-react";

interface ExcalidrawOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

/**
 * A full-screen, transparent overlay for drawing with Excalidraw.
 * It renders on top of the entire application when active.
 */
export const ExcalidrawOverlay = ({
  isVisible,
  onClose,
}: ExcalidrawOverlayProps) => {
  const { theme } = useTheme();

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className="fixed inset-0"
      style={{ zIndex: "var(--z-excalidraw-overlay)" }}
    >
      {/* Add a custom close button */}
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-4 right-4 z-10 rounded-full"
        onClick={onClose}
        title="Close Drawing Mode"
      >
        <X className="h-5 w-5" />
      </Button>

      <Excalidraw
        theme={theme === "dark" ? "dark" : "light"}
        // Make the Excalidraw canvas background transparent
        viewBackgroundColor="transparent"
        // Customize the UI to hide unwanted canvas actions
        UIOptions={{
          canvasActions: {
            changeViewBackgroundColor: false, // Hide the bg color picker
            loadScene: false, // Hide load button
            saveToActiveFile: false, // Hide save button
          },
        }}
      >
        {/* We can customize the main menu to keep it simple */}
        <MainMenu>
          <MainMenu.DefaultItems.ClearCanvas />
          <MainMenu.DefaultItems.ToggleTheme />
          <MainMenu.DefaultItems.Help />
        </MainMenu>
      </Excalidraw>
    </div>
  );
};
