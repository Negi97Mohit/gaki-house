import { Button } from "@/components/ui/button";
import { PanelLeftOpen } from "lucide-react";

interface FloatingLogoProps {
  onSidebarToggle?: () => void;
}

export const FloatingLogo = ({ onSidebarToggle }: FloatingLogoProps) => {
  return (
    <div className="fixed top-4 left-4 z-[900] flex items-center gap-3">
      {onSidebarToggle && (
        <Button 
          variant="ghost" 
          size="icon"
          className="h-9 w-9 bg-card/70 backdrop-blur-xl rounded-full border border-border/40 text-muted-foreground hover:text-foreground transition-colors shadow-lg"
          onClick={onSidebarToggle}
        >
          <PanelLeftOpen className="h-4 w-4" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
      )}
      
      <div className="flex items-center gap-2 bg-card/70 backdrop-blur-xl rounded-full px-4 py-2 border border-border/40 shadow-lg">
        <img 
          src="/icon.png" 
          alt="gaki logo" 
          className="w-6 h-6 rounded-md" 
        />
        <span className="font-semibold text-base">GAKI がき</span>
      </div>
    </div>
  );
};
