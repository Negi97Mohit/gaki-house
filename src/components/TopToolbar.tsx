import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CaptionStyle } from "@/types/caption";
import { useTheme } from "next-themes";
import { Moon, Sun, Eye, EyeOff, PanelLeftClose, PanelLeftOpen, Sparkles, BrainCircuit } from "lucide-react";
import { InstructionsDialog } from "./InstructionsDialog";
import { cn } from "@/lib/utils";
import { captureRejectionSymbol } from "events";

interface TopToolbarProps {
  captionsEnabled: boolean;
  onCaptionsToggle: (enabled: boolean) => void;
  isSidebarVisible: boolean;
  onSidebarToggle: () => void;
  isAiModeEnabled: boolean; // ADDED
  onAiModeToggle: (enabled: boolean) => void; // ADDED
}

export const TopToolbar = ({
  captionsEnabled,
  onCaptionsToggle,
  isSidebarVisible,
  onSidebarToggle,
  isAiModeEnabled,
  onAiModeToggle,
}: TopToolbarProps) => {
  const { theme, setTheme } = useTheme();

  return (
    <div className="h-14 border-b border-border/40 bg-background/95 backdrop-blur-sm px-4 flex items-center gap-3">
      {/* Logo */}
      <div className="flex items-center gap-2">
        <img 
          src="/icon.png" 
          alt="gaki logo" 
          className="w-7 h-7 rounded-md" 
        />
        <span className="font-semibold text-lg">GAKI がき</span>
      </div>
      
      <div className="w-px h-6 bg-border/40" />

      {/* Sidebar Toggle Button */}
      <Button 
        variant="ghost" 
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
        onClick={onSidebarToggle}
      >
        {isSidebarVisible ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="ml-auto flex items-center gap-1.5">
        <InstructionsDialog />
        
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
        
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 transition-all",
            isAiModeEnabled 
              ? "text-primary hover:text-primary/80" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onAiModeToggle(!isAiModeEnabled)}
          title={isAiModeEnabled ? "Turn off AI Mode" : "Turn on AI Mode"}
        >
          {isAiModeEnabled ? (
            <Sparkles className="h-4 w-4" />
          ) : (
            <BrainCircuit className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle AI Mode</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "h-8 w-8 transition-all",
            captionsEnabled 
              ? "text-primary hover:text-primary/80" 
              : "text-muted-foreground hover:text-foreground"
          )}
          onClick={() => onCaptionsToggle(!captionsEnabled)}
          title={captureRejectionSymbol ? "Turn on Caption" : "Turn off Caption"}

        >
          {captionsEnabled ? (
            <Eye className="h-4 w-4" />
          ) : (
            <EyeOff className="h-4 w-4" />
          )}
          <span className="sr-only">Toggle Captions</span>
        </Button>
      </div>
    </div>
  );
};