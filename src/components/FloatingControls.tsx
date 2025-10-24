import { Button } from "@/components/ui/button";
import { Circle, SlidersHorizontal, Video } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingControlsProps {
  onRecord: () => void;
  isRecording: boolean;
  onOpenSettings: () => void;
  onOpenSessions: () => void;
  sessionsCount: number;
}

export const FloatingControls: React.FC<FloatingControlsProps> = ({
  onRecord,
  isRecording,
  onOpenSettings,
  onOpenSessions,
  sessionsCount,
}) => {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1020] flex items-center gap-3">
      <Button
        onClick={onOpenSessions}
        size="lg"
        variant="outline"
        className="relative rounded-full shadow-lg backdrop-blur-sm border-2 hover:scale-105 transition-transform duration-200"
        title="Your Recordings"
      >
        <Video className="w-5 h-5" />
        {sessionsCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 bg-primary text-xs font-bold rounded-full flex items-center justify-center text-white">
            {sessionsCount}
          </span>
        )}
      </Button>

      <Button
        onClick={onRecord}
        size="lg"
        className={cn(
          "rounded-full shadow-xl transition-all duration-300",
          isRecording
            ? "bg-red-500 hover:bg-red-600 scale-110 animate-pulse"
            : "bg-primary hover:bg-primary/90"
        )}
        title={isRecording ? "Stop Recording" : "Start Recording"}
      >
        <Circle
          className={cn("w-6 h-6 transition-all", isRecording && "fill-white")}
        />
      </Button>

      <Button
        onClick={onOpenSettings}
        size="lg"
        variant="outline"
        data-floating-trigger
        className="rounded-full shadow-lg backdrop-blur-sm border-2 hover:scale-105 transition-transform duration-200"
        title="Open Controls"
      >
        <SlidersHorizontal className="w-5 h-5" />
      </Button>
    </div>
  );
};
