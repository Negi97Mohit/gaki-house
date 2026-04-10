import React, { useState } from "react";
import { useHandoffSystem } from "../context/HandoffContext";
import { handoffStore } from "@caption-cam/handoff-sdk";
import { Monitor, Smartphone, Globe, ArrowRight, Download, Cast } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { ShortcutTooltip } from "@/shared/ui/shortcut-tooltip";
import { cn } from "@/shared/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/shared/ui/popover";

export const HandoffControls: React.FC = () => {
  const { coordinator, registry } = useHandoffSystem();
  const availableDevices = handoffStore((state) => state.availableDevices);
  const activeDevice = handoffStore((state) => state.activeDevice);
  const connectionState = handoffStore((state) => state.connectionState);

  if (!registry || !coordinator) return null;

  const currentDeviceId = registry.currentDevice.deviceId;
  const otherDevices = availableDevices.filter((d) => d.deviceId !== currentDeviceId);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "desktop": return <Monitor className="w-3.5 h-3.5" />;
      case "mobile": return <Smartphone className="w-3.5 h-3.5" />;
      case "web": return <Globe className="w-3.5 h-3.5" />;
      default: return <Monitor className="w-3.5 h-3.5" />;
    }
  };

  return (
    <Popover>
      <ShortcutTooltip label="Stream Handoff">
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-xl h-8 w-8 hover:bg-foreground/5 dark:hover:bg-white/10 transition-all duration-200 relative"
            data-floating-trigger
          >
            <Cast className="w-3.5 h-3.5" />
            {otherDevices.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-primary" />
            )}
          </Button>
        </PopoverTrigger>
      </ShortcutTooltip>

      <PopoverContent
        side="top"
        align="center"
        sideOffset={12}
        className="w-56 p-2 bg-background/80 backdrop-blur-xl border-border/20 rounded-xl shadow-2xl"
      >
        <div className="flex items-center justify-between px-2 py-1.5 mb-1">
          <span className="text-xs font-medium text-foreground/70">Devices</span>
          <span className={cn(
            "w-1.5 h-1.5 rounded-full",
            connectionState === "connected" ? "bg-green-400" : "bg-muted-foreground/30"
          )} />
        </div>

        {otherDevices.length === 0 ? (
          <p className="text-xs text-muted-foreground px-2 py-3 text-center">
            No other devices online
          </p>
        ) : (
          <div className="flex flex-col gap-0.5">
            {otherDevices.map((device) => {
              const isTargetStreaming = activeDevice === device.deviceId;
              const isMeStreaming = activeDevice === currentDeviceId;

              return (
                <div
                  key={device.deviceId}
                  className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-foreground/5 dark:hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2 text-sm text-foreground/80">
                    {getPlatformIcon(device.platform)}
                    <span className="capitalize text-xs">{device.platform}</span>
                  </div>

                  <div className="flex gap-1">
                    {isTargetStreaming && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] hover:bg-primary/10 text-primary"
                        onClick={() => coordinator.pullStreamFrom(device.deviceId)}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Take
                      </Button>
                    )}
                    {isMeStreaming && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-[10px] hover:bg-primary/10 text-primary"
                        onClick={() => coordinator.pushStreamTo(device.deviceId)}
                      >
                        <ArrowRight className="w-3 h-3 mr-1" />
                        Send
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
