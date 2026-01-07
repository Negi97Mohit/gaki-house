// src/features/stream/ui/ScreenSharePicker.tsx
import React from "react";
import { useStreamStore } from "@/stores/stream.store";
import { useRtmpStream } from "../hooks/useRtmpStream";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/ui/dialog";
import { ScrollArea } from "@/shared/ui/scroll-area";
import { Monitor, AppWindow } from "lucide-react";
import { cn } from "@/shared/lib/utils";

export const ScreenSharePicker = () => {
  const { isPickerOpen, availableSources, setPickerOpen } = useStreamStore();
  const { handleSourceSelect } = useRtmpStream();

  // Separate sources by type for better organization
  const screens = availableSources.filter((s) => s.id.startsWith("screen"));
  const windows = availableSources.filter((s) => !s.id.startsWith("screen"));

  return (
    <Dialog open={isPickerOpen} onOpenChange={setPickerOpen}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col p-0 gap-0 bg-background/95 backdrop-blur-xl border-border/50">
        <DialogHeader className="p-6 border-b border-border/50 pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Monitor className="w-5 h-5 text-primary" />
            Select Source to Share
          </DialogTitle>
          <DialogDescription>
            Choose a screen or application window to stream.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          <div className="space-y-8">
            {/* Screens Section */}
            {screens.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <Monitor className="w-4 h-4" /> Screens
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {screens.map((source) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      onClick={() => handleSourceSelect(source.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Windows Section */}
            {windows.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                  <AppWindow className="w-4 h-4" /> Application Windows
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {windows.map((source) => (
                    <SourceCard
                      key={source.id}
                      source={source}
                      onClick={() => handleSourceSelect(source.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

// Helper Sub-component for individual cards
const SourceCard = ({
  source,
  onClick,
}: {
  source: any;
  onClick: () => void;
}) => {
  return (
    <button
      onClick={onClick}
      className="group flex flex-col gap-2 p-2 rounded-xl hover:bg-muted/50 transition-all duration-200 text-left border border-transparent hover:border-primary/20"
    >
      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black border border-border/50 shadow-sm group-hover:shadow-md transition-all">
        {source.thumbnail ? (
          <img
            src={
              source.thumbnail.toDataURL
                ? source.thumbnail.toDataURL()
                : source.thumbnail
            }
            alt={source.name}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <Monitor className="w-10 h-10 text-muted-foreground/50" />
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
            Share This
          </span>
        </div>

        {/* App Icon Badge */}
        {source.appIcon && (
          <div className="absolute bottom-2 right-2 w-8 h-8 rounded-md bg-background/80 backdrop-blur shadow-sm p-1">
            <img
              src={
                source.appIcon.toDataURL
                  ? source.appIcon.toDataURL()
                  : source.appIcon
              }
              alt="icon"
              className="w-full h-full object-contain"
            />
          </div>
        )}
      </div>

      <span
        className="text-xs font-medium text-foreground truncate w-full px-1"
        title={source.name}
      >
        {source.name}
      </span>
    </button>
  );
};
