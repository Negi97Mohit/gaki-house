import React, { useState } from "react";
import { useHandoffSystem } from "../context/HandoffContext";
import { handoffStore } from "@gaki/handoff-sdk";
import { Monitor, Smartphone, Globe, ArrowRight, Download, Cast } from "lucide-react";
import { Button } from "@gaki/ui/button";
import { ShortcutTooltip } from "@gaki/ui/shortcut-tooltip";
import { cn } from "@gaki/core/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@gaki/ui/popover";

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
            className="group relative rounded-xl h-8 w-8 text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white border border-transparent hover:border-black/10 dark:hover:border-white/15 hover:bg-black/[0.04] dark:hover:bg-white/[0.04] active:scale-95 transition-all duration-150 flex items-center justify-center"
            data-floating-trigger
          >
            <Cast className="w-3.5 h-3.5" />
            {otherDevices.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
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
