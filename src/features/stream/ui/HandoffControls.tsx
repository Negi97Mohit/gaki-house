import React from "react";
import { useHandoff } from "../hooks/useHandoff";
import { Button } from "@/shared/ui/button";
import { MonitorSmartphone, AlertTriangle } from "lucide-react";

export const HandoffControls = () => {
  const {
    takeOverStream,
    isActiveDevice,
    isRelinquishing,
    activeDeviceId,
    localDeviceId,
  } = useHandoff();

  // 1. We are being overridden by another device (e.g., Mobile)
  if (isRelinquishing) {
    return (
      <div className="flex items-center gap-2 bg-destructive/10 text-destructive p-3 rounded-lg border border-destructive/20 transition-all">
        <AlertTriangle className="w-5 h-5 animate-pulse" />
        <span className="text-sm font-medium">
          Stream handed off! Disconnecting camera safely...
        </span>
      </div>
    );
  }

  // 2. Another device is currently running the stream, give option to steal it back
  if (activeDeviceId && !isActiveDevice) {
    return (
      <div className="flex items-center gap-4 bg-secondary/50 p-3 rounded-lg border border-border">
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <MonitorSmartphone className="w-4 h-4" />
          Active on another device
        </div>
        <Button
          onClick={() =>
            takeOverStream("studio-primary", `user-${localDeviceId}`)
          }
          variant="default"
          size="sm"
          className="gap-2 shadow-lg"
        >
          Take Over Here
        </Button>
      </div>
    );
  }

  // 3. We are the active broadcasting device
  if (isActiveDevice) {
    return (
      <div className="flex items-center gap-2 bg-green-500/10 text-green-500 p-3 rounded-lg border border-green-500/20">
        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-sm font-medium">Cloud Studio Connected</span>
      </div>
    );
  }

  // 4. Initial disconnected state
  return (
    <Button
      onClick={() => takeOverStream("studio-primary", `user-${localDeviceId}`)}
      variant="outline"
      className="gap-2"
    >
      <MonitorSmartphone className="w-4 h-4" />
      Join Cloud Studio
    </Button>
  );
};
