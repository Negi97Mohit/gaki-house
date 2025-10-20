import { Button } from "@/components/ui/button";
import {
  Moon,
  Sun,
  Eye,
  EyeOff,
  Sparkles,
  BrainCircuit,
  Info,
} from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { InstructionsDialog } from "./InstructionsDialog";

interface FloatingControlsProps {
  captionsEnabled: boolean;
  onCaptionsToggle: (enabled: boolean) => void;
  isAiModeEnabled: boolean;
  onAiModeToggle: (enabled: boolean) => void;
}

export const FloatingControls = ({
  captionsEnabled,
  onCaptionsToggle,
  isAiModeEnabled,
  onAiModeToggle,
}: FloatingControlsProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="fixed top-4 right-4 z-[900] flex items-center gap-1.5 bg-card/70 backdrop-blur-xl rounded-full px-3 py-2 border border-border/40 shadow-lg">
      <InstructionsDialog />

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors rounded-full"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  );
};
