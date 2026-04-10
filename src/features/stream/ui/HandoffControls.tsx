import React from "react";
import { useHandoffSystem } from "../context/HandoffContext";
import { handoffStore } from "@caption-cam/handoff-sdk";
import { Monitor, Smartphone, Globe, ArrowRight, Download } from "lucide-react";
import { Button } from "@/shared/ui/button";

export const HandoffControls: React.FC = () => {
  const { coordinator, registry } = useHandoffSystem();

  // Connect React to the Zustand store exported by your SDK
  const availableDevices = handoffStore((state) => state.availableDevices);
  const activeDevice = handoffStore((state) => state.activeDevice);
  const connectionState = handoffStore((state) => state.connectionState);

  if (!registry || !coordinator) return null;

  const currentDeviceId = registry.currentDevice.deviceId;

  // Filter out the device we are currently using
  const otherDevices = availableDevices.filter(
    (d) => d.deviceId !== currentDeviceId,
  );

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "desktop":
        return <Monitor className="w-4 h-4" />;
      case "mobile":
        return <Smartphone className="w-4 h-4" />;
      case "web":
        return <Globe className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-900 rounded-lg border border-gray-800">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">Stream Handoff</h3>
        <span className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300">
          Status: {connectionState}
        </span>
      </div>

      {otherDevices.length === 0 ? (
        <p className="text-xs text-gray-500 italic">No other devices online.</p>
      ) : (
        <div className="flex flex-col gap-2">
          {otherDevices.map((device) => {
            const isTargetStreaming = activeDevice === device.deviceId;
            const isMeStreaming = activeDevice === currentDeviceId;

            return (
              <div
                key={device.deviceId}
                className="flex items-center justify-between p-2 bg-gray-800/50 rounded border border-gray-700/50"
              >
                <div className="flex items-center gap-2 text-sm text-gray-200">
                  {getPlatformIcon(device.platform)}
                  <span className="capitalize">{device.platform}</span>
                </div>

                <div className="flex gap-2">
                  {/* Pull Scenario: Platform B is streaming, we are on A and want to take over */}
                  {isTargetStreaming && (
                    <Button
                      size="sm"
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700 h-8 text-xs"
                      onClick={() =>
                        coordinator.pullStreamFrom(device.deviceId)
                      }
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Take Over
                    </Button>
                  )}

                  {/* Push Scenario: We are streaming on A, want to send to B */}
                  {isMeStreaming && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 text-xs border-blue-500/30 hover:bg-blue-500/10"
                      onClick={() => coordinator.pushStreamTo(device.deviceId)}
                    >
                      <ArrowRight className="w-3 h-3 mr-1" />
                      Send Here
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
